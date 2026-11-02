package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.model.*;
import com.mahalakshmi.hms.repository.*;
import com.mahalakshmi.hms.service.AuditService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingExportController {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final UserAccountRepository userAccountRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;
    private final LabReportRepository labReportRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public OnboardingExportController(PatientRepository patientRepository,
                                      DoctorRepository doctorRepository,
                                      UserAccountRepository userAccountRepository,
                                      AppointmentRepository appointmentRepository,
                                      InvoiceRepository invoiceRepository,
                                      LabReportRepository labReportRepository,
                                      AuditLogRepository auditLogRepository,
                                      PasswordEncoder passwordEncoder,
                                      AuditService auditService) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.userAccountRepository = userAccountRepository;
        this.appointmentRepository = appointmentRepository;
        this.invoiceRepository = invoiceRepository;
        this.labReportRepository = labReportRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // ==================== 1. DOWNLOAD READY-MADE IMPORT TEMPLATES ====================
    @GetMapping("/templates/{type}")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable String type) {
        String csv;
        String fileName;

        if ("doctors".equalsIgnoreCase(type)) {
            fileName = "Mahalakshmi_HMS_Doctors_Import_Template.csv";
            csv = "doctorCode,fullName,specialization,department,qualification,licenseNumber,experienceYears,phone,email,consultationFee,availabilitySchedule,roomNumber\n" +
                  "DOC-201,Dr. V. Rajendra Prasad,Joint Replacement & Trauma,Orthopaedics,MBBS MS (Ortho),APMC-71201,14,+91 98480-11220,dr.rajendra@mahalakshmihospital-eluru.in,550,Mon-Sat 10AM-4PM,OPD-06\n";
        } else if ("staff".equalsIgnoreCase(type)) {
            fileName = "Mahalakshmi_HMS_Staff_Import_Template.csv";
            csv = "username,fullName,role,department,designation,phone,email,shiftTiming,initialPassword\n" +
                  "nurse_kavitha,Ch. Kavitha Kumari,NURSE,Orthopaedic Ward,Senior Staff Nurse,+91 98485-22310,kavitha@mahalakshmihospital-eluru.in,Morning 8AM-4PM,Nurse@2026\n";
        } else {
            fileName = "Mahalakshmi_HMS_Patients_Import_Template.csv";
            csv = "patientUid,fullName,dateOfBirth,age,gender,bloodGroup,phone,address,emergencyContactName,emergencyContactPhone,allergies,medicalHistory,primaryService,assignedDoctorName,status\n" +
                  "MHL-2026-2001,K. Srinivasa Rao,1975-05-12,51,Male,B+,+91 98481-55443,\"R.R.Pet, Eluru, AP 534002\",K. Lakshmi,+91 98481-55449,None,Old Right Ankle Fracture,Fractures,Dr. N. Srinivasa Chakravarthy,OUTPATIENT\n";
        }

        byte[] bytes = ("\uFEFF" + csv).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    // ==================== 2. PREVIEW, VALIDATE & DETECT DUPLICATES ====================
    @PostMapping("/preview/{type}")
    public Map<String, Object> previewImport(@PathVariable String type, @RequestBody Map<String, String> payload) {
        String csvContent = payload.getOrDefault("csvContent", "");
        return evaluateCsv(type, csvContent, false);
    }

    // ==================== 3. COMMIT VALIDATED NON-DUPLICATE RECORDS ====================
    @PostMapping("/commit/{type}")
    @Transactional
    public Map<String, Object> commitImport(@PathVariable String type, @RequestBody Map<String, String> payload) {
        String csvContent = payload.getOrDefault("csvContent", "");
        Map<String, Object> result = evaluateCsv(type, csvContent, true);
        auditService.log(
                "BULK_IMPORT",
                "ONBOARDING_" + type.toUpperCase(),
                type.toUpperCase(),
                "Imported " + result.get("importedCount") + " records, skipped " + result.get("duplicateCount") + " duplicates, failed " + result.get("invalidCount")
        );
        return result;
    }

    private Map<String, Object> evaluateCsv(String type, String csvContent, boolean commitToDb) {
        String cleaned = csvContent.replace("\uFEFF", "").trim();
        String[] lines = cleaned.split("\\r?\\n");

        List<Map<String, Object>> validRows = new ArrayList<>();
        List<Map<String, Object>> duplicateRows = new ArrayList<>();
        List<Map<String, Object>> invalidRows = new ArrayList<>();
        StringBuilder errorCsv = new StringBuilder("RowNumber,Identifier,FullName,Status,ErrorReason\n");

        if (lines.length < 2) {
            return Map.of(
                    "totalRows", 0,
                    "validCount", 0,
                    "duplicateCount", 0,
                    "invalidCount", 0,
                    "importedCount", 0,
                    "validRows", validRows,
                    "duplicateRows", duplicateRows,
                    "invalidRows", invalidRows,
                    "errorReportCsv", errorCsv.toString()
            );
        }

        List<Patient> existingPatients = patientRepository.findAll();
        List<Doctor> existingDoctors = doctorRepository.findAll();
        List<UserAccount> existingUsers = userAccountRepository.findAll();

        int importedCount = 0;

        for (int i = 1; i < lines.length; i++) {
            String rawLine = lines[i].trim();
            if (rawLine.isEmpty()) continue;

            List<String> cols = parseCsvLine(rawLine);
            int rowNum = i + 1;

            if ("patients".equalsIgnoreCase(type)) {
                if (cols.size() < 7) {
                    addInvalid(invalidRows, errorCsv, rowNum, "-", "-", "Insufficient columns (expected at least 7 fields)");
                    continue;
                }
                String uid = cols.get(0).trim();
                String fullName = cols.get(1).trim();
                String dobStr = cols.get(2).trim();
                String ageStr = cols.get(3).trim();
                String gender = cols.get(4).trim();
                String bloodGroup = cols.get(5).trim();
                String phone = cols.get(6).trim();

                if (fullName.isEmpty() || phone.length() < 6) {
                    addInvalid(invalidRows, errorCsv, rowNum, uid, fullName, "Missing required fullName or valid phone number");
                    continue;
                }

                boolean dupUid = !uid.isEmpty() && existingPatients.stream().anyMatch(p -> uid.equalsIgnoreCase(p.getPatientUid()));
                boolean dupNamePhone = existingPatients.stream().anyMatch(p ->
                        fullName.equalsIgnoreCase(p.getFullName()) && phone.equalsIgnoreCase(p.getPhone()));

                if (dupUid || dupNamePhone) {
                    String reason = dupUid ? "Duplicate patientUid (" + uid + ") already exists" : "Duplicate patient name + phone already exists";
                    duplicateRows.add(Map.of("rowNumber", rowNum, "identifier", uid, "fullName", fullName, "phone", phone, "reason", reason));
                    errorCsv.append(rowNum).append(",").append(escapeCsv(uid)).append(",").append(escapeCsv(fullName))
                            .append(",DUPLICATE_SKIPPED,").append(escapeCsv(reason)).append("\n");
                    continue;
                }

                int age = 35;
                try { age = Integer.parseInt(ageStr); } catch (Exception ignored) {}
                LocalDate dob = LocalDate.of(1990, 1, 1);
                try { if (!dobStr.isEmpty()) dob = LocalDate.parse(dobStr); } catch (Exception ignored) {}

                String finalUid = uid.isEmpty() ? "MHL-2026-" + (1001 + existingPatients.size() + validRows.size()) : uid;
                String address = cols.size() > 7 ? cols.get(7) : "Eluru, AP 534002";
                String emgName = cols.size() > 8 ? cols.get(8) : "";
                String emgPhone = cols.size() > 9 ? cols.get(9) : "";
                String allergies = cols.size() > 10 ? cols.get(10) : "None";
                String history = cols.size() > 11 ? cols.get(11) : "";
                String service = cols.size() > 12 && !cols.get(12).isBlank() ? cols.get(12) : "Orthopaedics";
                String docName = cols.size() > 13 && !cols.get(13).isBlank() ? cols.get(13) : "Dr. K. Venkata Rama Rao";
                String status = cols.size() > 14 && !cols.get(14).isBlank() ? cols.get(14) : "OUTPATIENT";

                if (commitToDb) {
                    Patient p = new Patient();
                    p.setPatientUid(finalUid);
                    p.setFullName(fullName);
                    p.setDateOfBirth(dob);
                    p.setAge(age);
                    p.setGender(gender.isEmpty() ? "Male" : gender);
                    p.setBloodGroup(bloodGroup.isEmpty() ? "O+" : bloodGroup);
                    p.setPhone(phone);
                    p.setAddress(address);
                    p.setEmergencyContactName(emgName);
                    p.setEmergencyContactPhone(emgPhone);
                    p.setAllergies(allergies);
                    p.setMedicalHistory(history);
                    p.setPrimaryService(service);
                    p.setAssignedDoctorName(docName);
                    p.setStatus(status);
                    p.setRegistrationDate(LocalDate.now());
                    existingPatients.add(patientRepository.save(p));
                    importedCount++;
                }

                validRows.add(Map.of(
                        "rowNumber", rowNum,
                        "identifier", finalUid,
                        "fullName", fullName,
                        "details", age + "y/" + gender + " • " + phone + " • " + service
                ));
            } else if ("doctors".equalsIgnoreCase(type)) {
                if (cols.size() < 4) {
                    addInvalid(invalidRows, errorCsv, rowNum, "-", "-", "Insufficient columns for doctor import");
                    continue;
                }
                String code = cols.get(0).trim();
                String fullName = cols.get(1).trim();
                String spec = cols.get(2).trim();
                String dept = cols.get(3).trim();

                if (fullName.isEmpty() || spec.isEmpty()) {
                    addInvalid(invalidRows, errorCsv, rowNum, code, fullName, "Missing doctor fullName or specialization");
                    continue;
                }

                boolean dup = existingDoctors.stream().anyMatch(d ->
                        (!code.isEmpty() && code.equalsIgnoreCase(d.getDoctorCode())) || fullName.equalsIgnoreCase(d.getFullName()));
                if (dup) {
                    String reason = "Doctor already exists in roster";
                    duplicateRows.add(Map.of("rowNumber", rowNum, "identifier", code, "fullName", fullName, "reason", reason));
                    errorCsv.append(rowNum).append(",").append(escapeCsv(code)).append(",").append(escapeCsv(fullName))
                            .append(",DUPLICATE_SKIPPED,").append(escapeCsv(reason)).append("\n");
                    continue;
                }

                String finalCode = code.isEmpty() ? "DOC-" + (101 + existingDoctors.size() + validRows.size()) : code;
                if (commitToDb) {
                    Doctor d = new Doctor();
                    d.setDoctorCode(finalCode);
                    d.setFullName(fullName);
                    d.setSpecialization(spec);
                    d.setDepartment(dept.isEmpty() ? "Orthopaedics" : dept);
                    d.setQualification(cols.size() > 4 ? cols.get(4) : "MBBS, MS");
                    d.setLicenseNumber(cols.size() > 5 ? cols.get(5) : "APMC-NEW");
                    int exp = 10;
                    try { if (cols.size() > 6) exp = Integer.parseInt(cols.get(6)); } catch (Exception ignored) {}
                    d.setExperienceYears(exp);
                    d.setPhone(cols.size() > 7 ? cols.get(7) : "+91 8812-234567");
                    d.setEmail(cols.size() > 8 ? cols.get(8) : "doctor@mahalakshmihospital-eluru.in");
                    double fee = 500;
                    try { if (cols.size() > 9) fee = Double.parseDouble(cols.get(9)); } catch (Exception ignored) {}
                    d.setConsultationFee(fee);
                    d.setAvailabilitySchedule(cols.size() > 10 ? cols.get(10) : "Mon-Sat 9AM-3PM");
                    d.setRoomNumber(cols.size() > 11 ? cols.get(11) : "OPD");
                    d.setAvailable(true);
                    existingDoctors.add(doctorRepository.save(d));
                    importedCount++;
                }

                validRows.add(Map.of("rowNumber", rowNum, "identifier", finalCode, "fullName", fullName, "details", spec + " (" + dept + ")"));
            } else if ("staff".equalsIgnoreCase(type)) {
                if (cols.size() < 4) {
                    addInvalid(invalidRows, errorCsv, rowNum, "-", "-", "Insufficient columns for staff import");
                    continue;
                }
                String username = cols.get(0).trim();
                String fullName = cols.get(1).trim();
                String role = cols.get(2).trim().toUpperCase();
                String dept = cols.get(3).trim();

                if (username.isEmpty() || fullName.isEmpty()) {
                    addInvalid(invalidRows, errorCsv, rowNum, username, fullName, "Missing username or fullName");
                    continue;
                }

                boolean dup = existingUsers.stream().anyMatch(u -> username.equalsIgnoreCase(u.getUsername()));
                if (dup) {
                    String reason = "Staff username @" + username + " already exists";
                    duplicateRows.add(Map.of("rowNumber", rowNum, "identifier", username, "fullName", fullName, "reason", reason));
                    errorCsv.append(rowNum).append(",").append(escapeCsv(username)).append(",").append(escapeCsv(fullName))
                            .append(",DUPLICATE_SKIPPED,").append(escapeCsv(reason)).append("\n");
                    continue;
                }

                if (commitToDb) {
                    UserAccount u = new UserAccount();
                    u.setUsername(username);
                    u.setFullName(fullName);
                    u.setRole(role.isEmpty() ? "NURSE" : role);
                    u.setDepartment(dept);
                    u.setDesignation(cols.size() > 4 ? cols.get(4) : "Hospital Staff");
                    u.setPhone(cols.size() > 5 ? cols.get(5) : "");
                    u.setEmail(cols.size() > 6 ? cols.get(6) : "");
                    u.setShiftTiming(cols.size() > 7 ? cols.get(7) : "General Shift");
                    String rawPw = cols.size() > 8 && !cols.get(8).isBlank() ? cols.get(8) : "Staff@2026";
                    u.setPasswordHash(passwordEncoder.encode(rawPw));
                    u.setActive(true);
                    existingUsers.add(userAccountRepository.save(u));
                    importedCount++;
                }

                validRows.add(Map.of("rowNumber", rowNum, "identifier", "@" + username, "fullName", fullName, "details", role + " • " + dept));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalRows", validRows.size() + duplicateRows.size() + invalidRows.size());
        response.put("validCount", validRows.size());
        response.put("duplicateCount", duplicateRows.size());
        response.put("invalidCount", invalidRows.size());
        response.put("importedCount", importedCount);
        response.put("validRows", validRows);
        response.put("duplicateRows", duplicateRows);
        response.put("invalidRows", invalidRows);
        response.put("errorReportCsv", errorCsv.toString());
        return response;
    }

    // ==================== 4. AUTHORIZED DATA EXPORT (CSV / EXCEL) ====================
    @GetMapping("/export/{type}")
    public ResponseEntity<byte[]> exportData(@PathVariable String type) {
        StringBuilder csv = new StringBuilder("\uFEFF");
        String fileName = "Mahalakshmi_HMS_" + type + "_Export_" + LocalDate.now() + ".csv";

        if ("patients".equalsIgnoreCase(type)) {
            csv.append("PatientUID,FullName,DOB,Age,Gender,BloodGroup,Phone,Address,EmergencyContact,EmergencyPhone,Allergies,MedicalHistory,Service,Doctor,Status,RegistrationDate\n");
            for (Patient p : patientRepository.findAllByOrderByIdDesc()) {
                csv.append(escapeCsv(p.getPatientUid())).append(",")
                   .append(escapeCsv(p.getFullName())).append(",")
                   .append(escapeCsv(String.valueOf(p.getDateOfBirth()))).append(",")
                   .append(p.getAge()).append(",")
                   .append(escapeCsv(p.getGender())).append(",")
                   .append(escapeCsv(p.getBloodGroup())).append(",")
                   .append(escapeCsv(p.getPhone())).append(",")
                   .append(escapeCsv(p.getAddress())).append(",")
                   .append(escapeCsv(p.getEmergencyContactName())).append(",")
                   .append(escapeCsv(p.getEmergencyContactPhone())).append(",")
                   .append(escapeCsv(p.getAllergies())).append(",")
                   .append(escapeCsv(p.getMedicalHistory())).append(",")
                   .append(escapeCsv(p.getPrimaryService())).append(",")
                   .append(escapeCsv(p.getAssignedDoctorName())).append(",")
                   .append(escapeCsv(p.getStatus())).append(",")
                   .append(escapeCsv(String.valueOf(p.getRegistrationDate()))).append("\n");
            }
        } else if ("doctors".equalsIgnoreCase(type)) {
            csv.append("DoctorCode,FullName,Specialization,Department,Qualification,LicenseNumber,ExperienceYears,Phone,Email,ConsultationFee,Schedule,Room\n");
            for (Doctor d : doctorRepository.findAll()) {
                csv.append(escapeCsv(d.getDoctorCode())).append(",")
                   .append(escapeCsv(d.getFullName())).append(",")
                   .append(escapeCsv(d.getSpecialization())).append(",")
                   .append(escapeCsv(d.getDepartment())).append(",")
                   .append(escapeCsv(d.getQualification())).append(",")
                   .append(escapeCsv(d.getLicenseNumber())).append(",")
                   .append(d.getExperienceYears()).append(",")
                   .append(escapeCsv(d.getPhone())).append(",")
                   .append(escapeCsv(d.getEmail())).append(",")
                   .append(d.getConsultationFee()).append(",")
                   .append(escapeCsv(d.getAvailabilitySchedule())).append(",")
                   .append(escapeCsv(d.getRoomNumber())).append("\n");
            }
        } else if ("invoices".equalsIgnoreCase(type)) {
            csv.append("InvoiceUID,Date,PatientUID,PatientName,Category,Department,Description,Subtotal,Discount,Total,Paid,Balance,PaymentMethod,Status\n");
            for (Invoice inv : invoiceRepository.findAllByOrderByBillingDateDesc()) {
                csv.append(escapeCsv(inv.getInvoiceUid())).append(",")
                   .append(escapeCsv(String.valueOf(inv.getBillingDate()))).append(",")
                   .append(escapeCsv(inv.getPatientUid())).append(",")
                   .append(escapeCsv(inv.getPatientName())).append(",")
                   .append(escapeCsv(inv.getBillingCategory())).append(",")
                   .append(escapeCsv(inv.getServiceDepartment())).append(",")
                   .append(escapeCsv(inv.getDescription())).append(",")
                   .append(inv.getSubtotal()).append(",")
                   .append(inv.getDiscount()).append(",")
                   .append(inv.getTotalAmount()).append(",")
                   .append(inv.getPaidAmount()).append(",")
                   .append(inv.getBalanceAmount()).append(",")
                   .append(escapeCsv(inv.getPaymentMethod())).append(",")
                   .append(escapeCsv(inv.getPaymentStatus())).append("\n");
            }
        } else if ("lab-reports".equalsIgnoreCase(type)) {
            csv.append("ReportUID,OrderedDate,PatientUID,PatientName,TestName,Category,ResultValue,Unit,ReferenceRange,Abnormal,Status,VerifiedBy\n");
            for (LabReport l : labReportRepository.findAllByOrderByOrderedDateDesc()) {
                csv.append(escapeCsv(l.getReportUid())).append(",")
                   .append(escapeCsv(String.valueOf(l.getOrderedDate()))).append(",")
                   .append(escapeCsv(l.getPatientUid())).append(",")
                   .append(escapeCsv(l.getPatientName())).append(",")
                   .append(escapeCsv(l.getTestName())).append(",")
                   .append(escapeCsv(l.getTestCategory())).append(",")
                   .append(escapeCsv(l.getResultValue())).append(",")
                   .append(escapeCsv(l.getUnit())).append(",")
                   .append(escapeCsv(l.getReferenceRange())).append(",")
                   .append(l.isAbnormal()).append(",")
                   .append(escapeCsv(l.getStatus())).append(",")
                   .append(escapeCsv(l.getVerifiedBy())).append("\n");
            }
        } else {
            csv.append("Timestamp,Username,Role,Action,Module,EntityId,Details\n");
            for (AuditLog log : auditLogRepository.findTop200ByOrderByTimestampDesc()) {
                csv.append(escapeCsv(String.valueOf(log.getTimestamp()))).append(",")
                   .append(escapeCsv(log.getUsername())).append(",")
                   .append(escapeCsv(log.getUserRole())).append(",")
                   .append(escapeCsv(log.getAction())).append(",")
                   .append(escapeCsv(log.getModule())).append(",")
                   .append(escapeCsv(log.getEntityId())).append(",")
                   .append(escapeCsv(log.getDetails())).append("\n");
            }
        }

        auditService.log("EXPORT_DATA", "EXPORT_" + type.toUpperCase(), type.toUpperCase(), "Exported " + type + " dataset to CSV/Excel");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    private void addInvalid(List<Map<String, Object>> invalidRows, StringBuilder errorCsv, int rowNum, String id, String name, String reason) {
        invalidRows.add(Map.of("rowNumber", rowNum, "identifier", id, "fullName", name, "reason", reason));
        errorCsv.append(rowNum).append(",").append(escapeCsv(id)).append(",").append(escapeCsv(name))
                .append(",INVALID_FAILED,").append(escapeCsv(reason)).append("\n");
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                inQuotes = !inQuotes;
            } else if (ch == ',' && !inQuotes) {
                result.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(ch);
            }
        }
        result.add(cur.toString().trim());
        return result;
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
