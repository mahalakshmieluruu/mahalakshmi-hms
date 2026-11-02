package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.config.DataSourceConfig;
import com.mahalakshmi.hms.model.*;
import com.mahalakshmi.hms.repository.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final AdmissionRepository admissionRepository;
    private final WardBedRepository wardBedRepository;
    private final LabReportRepository labReportRepository;
    private final SurgeryRepository surgeryRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final InvoiceRepository invoiceRepository;
    private final DoctorRepository doctorRepository;
    private final OrthopaedicCaseRepository orthopaedicCaseRepository;
    private final DiagnosticImagingRepository imagingRepository;
    private final PharmacyItemRepository pharmacyRepository;
    private final HospitalSettingsRepository settingsRepository;
    private final DataSourceConfig dataSourceConfig;

    public DashboardController(PatientRepository patientRepository,
                               AppointmentRepository appointmentRepository,
                               AdmissionRepository admissionRepository,
                               WardBedRepository wardBedRepository,
                               LabReportRepository labReportRepository,
                               SurgeryRepository surgeryRepository,
                               EmergencyCaseRepository emergencyCaseRepository,
                               InvoiceRepository invoiceRepository,
                               DoctorRepository doctorRepository,
                               OrthopaedicCaseRepository orthopaedicCaseRepository,
                               DiagnosticImagingRepository imagingRepository,
                               PharmacyItemRepository pharmacyRepository,
                               HospitalSettingsRepository settingsRepository,
                               DataSourceConfig dataSourceConfig) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.admissionRepository = admissionRepository;
        this.wardBedRepository = wardBedRepository;
        this.labReportRepository = labReportRepository;
        this.surgeryRepository = surgeryRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.invoiceRepository = invoiceRepository;
        this.doctorRepository = doctorRepository;
        this.orthopaedicCaseRepository = orthopaedicCaseRepository;
        this.imagingRepository = imagingRepository;
        this.pharmacyRepository = pharmacyRepository;
        this.settingsRepository = settingsRepository;
        this.dataSourceConfig = dataSourceConfig;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        LocalDate today = LocalDate.now();
        int currentMonth = today.getMonthValue();
        int currentYear = today.getYear();

        List<Patient> patients = patientRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();
        List<Admission> admissions = admissionRepository.findAll();
        List<WardBed> beds = wardBedRepository.findAll();
        List<LabReport> labReports = labReportRepository.findAll();
        List<Surgery> surgeries = surgeryRepository.findAll();
        List<EmergencyCase> emergencies = emergencyCaseRepository.findAll();
        List<Invoice> invoices = invoiceRepository.findAll();
        List<OrthopaedicCase> orthoCases = orthopaedicCaseRepository.findAll();

        long totalPatients = patients.size();
        long todaysAppointments = appointments.stream()
                .filter(a -> today.equals(a.getAppointmentDate()) && !"CANCELLED".equals(a.getStatus()))
                .count();
        long todaysPatientVisits = todaysAppointments + emergencies.stream()
                .filter(e -> e.getArrivalTime() != null && today.equals(e.getArrivalTime().toLocalDate()))
                .count();

        long currentlyAdmitted = admissions.stream().filter(a -> "ADMITTED".equals(a.getStatus())).count();
        long dischargedPatients = admissions.stream().filter(a -> "DISCHARGED".equals(a.getStatus())).count()
                + patients.stream().filter(p -> "DISCHARGED".equals(p.getStatus())).count();

        long activeEmergencies = emergencies.stream()
                .filter(e -> !"DISCHARGED".equals(e.getStatus()))
                .count();

        long totalBeds = beds.size();
        long occupiedBeds = beds.stream().filter(b -> "OCCUPIED".equals(b.getStatus())).count();
        long availableBeds = beds.stream().filter(b -> "AVAILABLE".equals(b.getStatus())).count();
        long maintenanceBeds = totalBeds - occupiedBeds - availableBeds;

        long pendingLabReports = labReports.stream()
                .filter(l -> "PENDING".equals(l.getStatus()) || "COMPLETED".equals(l.getStatus()))
                .count();
        long verifiedLabReports = labReports.stream()
                .filter(l -> "VERIFIED".equals(l.getStatus()))
                .count();

        long scheduledSurgeries = surgeries.stream()
                .filter(s -> !"COMPLETED".equals(s.getStatus()) && !"CANCELLED".equals(s.getStatus()))
                .count();

        double dailyCollections = invoices.stream()
                .filter(i -> today.equals(i.getBillingDate()))
                .mapToDouble(Invoice::getPaidAmount)
                .sum();

        double monthlyRevenue = invoices.stream()
                .filter(i -> i.getBillingDate() != null
                        && i.getBillingDate().getMonthValue() == currentMonth
                        && i.getBillingDate().getYear() == currentYear)
                .mapToDouble(Invoice::getPaidAmount)
                .sum();

        double outstandingPayments = invoices.stream()
                .filter(i -> !"CANCELLED".equals(i.getPaymentStatus()))
                .mapToDouble(Invoice::getBalanceAmount)
                .sum();

        // Department-wise analytics from actual database records
        Map<String, Long> deptCounts = patients.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getPrimaryService() != null && !p.getPrimaryService().isBlank() ? p.getPrimaryService() : "Outpatient Services",
                        Collectors.counting()
                ));

        List<Map<String, Object>> departmentAnalytics = new ArrayList<>();
        deptCounts.forEach((dept, count) -> {
            double deptRevenue = invoices.stream()
                    .filter(inv -> dept.equalsIgnoreCase(inv.getServiceDepartment()) || dept.equalsIgnoreCase(inv.getBillingCategory()))
                    .mapToDouble(Invoice::getPaidAmount)
                    .sum();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("department", dept);
            item.put("patients", count);
            item.put("revenue", deptRevenue);
            departmentAnalytics.add(item);
        });
        departmentAnalytics.sort((a, b) -> Long.compare((Long) b.get("patients"), (Long) a.get("patients")));

        // Revenue by Category for Recharts
        Map<String, Double> revenueByCat = invoices.stream()
                .collect(Collectors.groupingBy(
                        i -> i.getBillingCategory() != null ? i.getBillingCategory() : "OPD",
                        Collectors.summingDouble(Invoice::getPaidAmount)
                ));
        List<Map<String, Object>> revenueChartData = new ArrayList<>();
        revenueByCat.forEach((cat, amount) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("category", cat);
            row.put("collected", amount);
            double pending = invoices.stream()
                    .filter(i -> cat.equals(i.getBillingCategory()))
                    .mapToDouble(Invoice::getBalanceAmount)
                    .sum();
            row.put("outstanding", pending);
            revenueChartData.add(row);
        });

        // Orthopaedic Sub-Specialty breakdown
        Map<String, Long> orthoBreakdownMap = orthoCases.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getSubSpecialty() != null ? o.getSubSpecialty() : "Orthopaedics",
                        Collectors.counting()
                ));
        List<Map<String, Object>> orthoAnalytics = new ArrayList<>();
        orthoBreakdownMap.forEach((sub, cnt) -> {
            orthoAnalytics.add(Map.of("specialty", sub, "cases", cnt));
        });

        // Ward Occupancy breakdown
        Map<String, List<WardBed>> wardGroups = beds.stream()
                .collect(Collectors.groupingBy(w -> w.getWardName() != null ? w.getWardName() : "General Ward"));
        List<Map<String, Object>> wardAnalytics = new ArrayList<>();
        wardGroups.forEach((ward, bedList) -> {
            long occ = bedList.stream().filter(b -> "OCCUPIED".equals(b.getStatus())).count();
            long avail = bedList.stream().filter(b -> "AVAILABLE".equals(b.getStatus())).count();
            Map<String, Object> w = new LinkedHashMap<>();
            w.put("ward", ward);
            w.put("occupied", occ);
            w.put("available", avail);
            w.put("total", bedList.size());
            wardAnalytics.add(w);
        });

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRegisteredPatients", totalPatients);
        summary.put("todaysPatientVisits", todaysPatientVisits);
        summary.put("currentlyAdmittedPatients", currentlyAdmitted);
        summary.put("dischargedPatients", dischargedPatients);
        summary.put("emergencyCases", activeEmergencies);
        summary.put("totalBeds", totalBeds);
        summary.put("occupiedBeds", occupiedBeds);
        summary.put("availableBeds", availableBeds);
        summary.put("maintenanceBeds", maintenanceBeds);
        summary.put("todaysAppointments", todaysAppointments);
        summary.put("pendingLabReports", pendingLabReports);
        summary.put("verifiedLabReports", verifiedLabReports);
        summary.put("scheduledSurgeries", scheduledSurgeries);
        summary.put("dailyCollections", dailyCollections);
        summary.put("monthlyRevenue", monthlyRevenue);
        summary.put("outstandingPayments", outstandingPayments);
        summary.put("totalDoctors", doctorRepository.count());
        summary.put("totalImagingScans", imagingRepository.count());
        summary.put("lowStockMedicines", pharmacyRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() <= p.getReorderLevel()).count());
        summary.put("databaseEngine", dataSourceConfig.getActiveDatabaseEngine());
        summary.put("hospitalSettings", settingsRepository.findAll().stream().findFirst().orElse(new HospitalSettings()));
        summary.put("departmentAnalytics", departmentAnalytics);
        summary.put("revenueChartData", revenueChartData);
        summary.put("orthoAnalytics", orthoAnalytics);
        summary.put("wardAnalytics", wardAnalytics);
        summary.put("upcomingSurgeries", surgeries.stream().limit(6).toList());
        summary.put("recentEmergencies", emergencies.stream().limit(5).toList());
        summary.put("todayAppointmentsList", appointments.stream().limit(8).toList());
        return summary;
    }
}
