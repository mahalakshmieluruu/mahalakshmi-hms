package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.config.DataSourceConfig;
import com.mahalakshmi.hms.model.AuditLog;
import com.mahalakshmi.hms.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthSyncController {

    private final DataSourceConfig dataSourceConfig;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;
    private final WardBedRepository wardBedRepository;
    private final LabReportRepository labReportRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final SurgeryRepository surgeryRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditLogRepository auditLogRepository;

    @Value("${app.environment:development}")
    private String appEnvironment;

    public HealthSyncController(DataSourceConfig dataSourceConfig,
                                PatientRepository patientRepository,
                                AppointmentRepository appointmentRepository,
                                AdmissionRepository admissionRepository,
                                WardBedRepository wardBedRepository,
                                LabReportRepository labReportRepository,
                                EmergencyCaseRepository emergencyCaseRepository,
                                SurgeryRepository surgeryRepository,
                                InvoiceRepository invoiceRepository,
                                AuditLogRepository auditLogRepository) {
        this.dataSourceConfig = dataSourceConfig;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.admissionRepository = admissionRepository;
        this.wardBedRepository = wardBedRepository;
        this.labReportRepository = labReportRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.surgeryRepository = surgeryRepository;
        this.invoiceRepository = invoiceRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("hospital", "MAHALAKSHMI HOSPITAL, Eluru");
        health.put("environment", appEnvironment);
        health.put("database", dataSourceConfig.getActiveDatabaseEngine());
        health.put("serverTime", LocalDateTime.now().toString());
        return health;
    }

    @GetMapping("/sync/status")
    public Map<String, Object> syncStatus() {
        List<AuditLog> latestLogs = auditLogRepository.findTop200ByOrderByTimestampDesc();
        AuditLog lastEvent = latestLogs.isEmpty() ? null : latestLogs.get(0);

        Map<String, Object> sync = new LinkedHashMap<>();
        sync.put("serverTimestamp", LocalDateTime.now().toString());
        sync.put("databaseEngine", dataSourceConfig.getActiveDatabaseEngine());
        sync.put("environment", appEnvironment);
        sync.put("watermarkId", lastEvent != null ? lastEvent.getId() : 0L);
        sync.put("lastChangeAction", lastEvent != null ? lastEvent.getAction() + " on " + lastEvent.getModule() : "INITIALIZED");
        sync.put("lastChangeBy", lastEvent != null ? lastEvent.getUsername() : "system");
        sync.put("lastChangeTime", lastEvent != null && lastEvent.getTimestamp() != null ? lastEvent.getTimestamp().toString() : LocalDateTime.now().toString());
        sync.put("counts", Map.of(
                "patients", patientRepository.count(),
                "appointments", appointmentRepository.count(),
                "admissions", admissionRepository.count(),
                "availableBeds", wardBedRepository.findAll().stream().filter(b -> "AVAILABLE".equals(b.getStatus())).count(),
                "labReports", labReportRepository.count(),
                "emergencies", emergencyCaseRepository.count(),
                "surgeries", surgeryRepository.count(),
                "invoices", invoiceRepository.count()
        ));
        return sync;
    }
}
