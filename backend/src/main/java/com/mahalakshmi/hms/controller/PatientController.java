package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.model.Patient;
import com.mahalakshmi.hms.repository.*;
import com.mahalakshmi.hms.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final LabReportRepository labReportRepository;
    private final DiagnosticImagingRepository imagingRepository;
    private final AdmissionRepository admissionRepository;
    private final SurgeryRepository surgeryRepository;
    private final InvoiceRepository invoiceRepository;
    private final OrthopaedicCaseRepository orthopaedicCaseRepository;
    private final AuditService auditService;

    public PatientController(PatientRepository patientRepository,
                             AppointmentRepository appointmentRepository,
                             MedicalRecordRepository medicalRecordRepository,
                             LabReportRepository labReportRepository,
                             DiagnosticImagingRepository imagingRepository,
                             AdmissionRepository admissionRepository,
                             SurgeryRepository surgeryRepository,
                             InvoiceRepository invoiceRepository,
                             OrthopaedicCaseRepository orthopaedicCaseRepository,
                             AuditService auditService) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.labReportRepository = labReportRepository;
        this.imagingRepository = imagingRepository;
        this.admissionRepository = admissionRepository;
        this.surgeryRepository = surgeryRepository;
        this.invoiceRepository = invoiceRepository;
        this.orthopaedicCaseRepository = orthopaedicCaseRepository;
        this.auditService = auditService;
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientRepository.findAllByOrderByIdDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> getPatient360Profile(@PathVariable Long id) {
        return patientRepository.findById(id).map(patient -> {
            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("patient", patient);
            profile.put("appointments", appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(id));
            profile.put("medicalRecords", medicalRecordRepository.findByPatientIdOrderByVisitDateDesc(id));
            profile.put("labReports", labReportRepository.findByPatientIdOrderByOrderedDateDesc(id));
            profile.put("imagingReports", imagingRepository.findByPatientIdOrderByScanDateDesc(id));
            profile.put("admissions", admissionRepository.findByPatientIdOrderByAdmissionDateDesc(id));
            profile.put("surgeries", surgeryRepository.findByPatientIdOrderByScheduledDateDesc(id));
            profile.put("invoices", invoiceRepository.findByPatientIdOrderByBillingDateDesc(id));
            profile.put("orthoCases", orthopaedicCaseRepository.findByPatientIdOrderByEvaluationDateDesc(id));
            return ResponseEntity.ok(profile);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        if (patient.getPatientUid() == null || patient.getPatientUid().isBlank()) {
            long nextNum = 1001 + patientRepository.count();
            patient.setPatientUid("MHL-2026-" + nextNum);
        }
        if (patient.getDateOfBirth() != null && patient.getAge() <= 0) {
            patient.setAge(Period.between(patient.getDateOfBirth(), LocalDate.now()).getYears());
        }
        if (patient.getRegistrationDate() == null) {
            patient.setRegistrationDate(LocalDate.now());
        }
        Patient saved = patientRepository.save(patient);
        auditService.log("CREATE", "PATIENTS", saved.getPatientUid(), "Registered patient: " + saved.getFullName());
        return saved;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient updated) {
        return patientRepository.findById(id).map(existing -> {
            existing.setFullName(updated.getFullName());
            existing.setDateOfBirth(updated.getDateOfBirth());
            if (updated.getAge() > 0) {
                existing.setAge(updated.getAge());
            } else if (updated.getDateOfBirth() != null) {
                existing.setAge(Period.between(updated.getDateOfBirth(), LocalDate.now()).getYears());
            }
            existing.setGender(updated.getGender());
            existing.setBloodGroup(updated.getBloodGroup());
            existing.setPhone(updated.getPhone());
            existing.setAddress(updated.getAddress());
            existing.setEmergencyContactName(updated.getEmergencyContactName());
            existing.setEmergencyContactPhone(updated.getEmergencyContactPhone());
            existing.setEmergencyContactRelation(updated.getEmergencyContactRelation());
            existing.setAllergies(updated.getAllergies());
            existing.setMedicalHistory(updated.getMedicalHistory());
            existing.setPrimaryService(updated.getPrimaryService());
            existing.setAssignedDoctorName(updated.getAssignedDoctorName());
            if (updated.getStatus() != null) {
                existing.setStatus(updated.getStatus());
            }
            if (updated.getRegistrationDate() != null) {
                existing.setRegistrationDate(updated.getRegistrationDate());
            }
            Patient saved = patientRepository.save(existing);
            auditService.log("UPDATE", "PATIENTS", saved.getPatientUid(), "Updated patient profile: " + saved.getFullName());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        return patientRepository.findById(id).map(existing -> {
            patientRepository.delete(existing);
            auditService.log("DELETE", "PATIENTS", existing.getPatientUid(), "Deleted patient record: " + existing.getFullName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}
