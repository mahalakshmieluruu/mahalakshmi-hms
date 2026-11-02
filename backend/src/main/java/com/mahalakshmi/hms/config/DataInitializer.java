package com.mahalakshmi.hms.config;

import com.mahalakshmi.hms.model.*;
import com.mahalakshmi.hms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository userRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;
    private final AppointmentRepository appointmentRepo;
    private final MedicalRecordRepository emrRepo;
    private final WardBedRepository bedRepo;
    private final AdmissionRepository admissionRepo;
    private final LabReportRepository labRepo;
    private final DiagnosticImagingRepository imagingRepo;
    private final OrthopaedicCaseRepository orthoRepo;
    private final SurgeryRepository surgeryRepo;
    private final EmergencyCaseRepository emergencyRepo;
    private final InvoiceRepository invoiceRepo;
    private final PharmacyItemRepository pharmacyRepo;
    private final HospitalSettingsRepository settingsRepo;
    private final AuditLogRepository auditRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserAccountRepository userRepo,
                           DoctorRepository doctorRepo,
                           PatientRepository patientRepo,
                           AppointmentRepository appointmentRepo,
                           MedicalRecordRepository emrRepo,
                           WardBedRepository bedRepo,
                           AdmissionRepository admissionRepo,
                           LabReportRepository labRepo,
                           DiagnosticImagingRepository imagingRepo,
                           OrthopaedicCaseRepository orthoRepo,
                           SurgeryRepository surgeryRepo,
                           EmergencyCaseRepository emergencyRepo,
                           InvoiceRepository invoiceRepo,
                           PharmacyItemRepository pharmacyRepo,
                           HospitalSettingsRepository settingsRepo,
                           AuditLogRepository auditRepo,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
        this.appointmentRepo = appointmentRepo;
        this.emrRepo = emrRepo;
        this.bedRepo = bedRepo;
        this.admissionRepo = admissionRepo;
        this.labRepo = labRepo;
        this.imagingRepo = imagingRepo;
        this.orthoRepo = orthoRepo;
        this.surgeryRepo = surgeryRepo;
        this.emergencyRepo = emergencyRepo;
        this.invoiceRepo = invoiceRepo;
        this.pharmacyRepo = pharmacyRepo;
        this.settingsRepo = settingsRepo;
        this.auditRepo = auditRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (settingsRepo.count() == 0) {
            settingsRepo.save(new HospitalSettings());
        }

        if (userRepo.count() == 0) {
            seedUsers();
        }

        if (doctorRepo.count() == 0) {
            seedDoctors();
        }

        if (patientRepo.count() == 0) {
            seedClinicalAndOperationsData();
        }
    }

    private void seedUsers() {
        userRepo.saveAll(List.of(
                createUser("owner", "Mahalakshmi@2026", "Dr. K. Venkata Rama Rao", "OWNER", "Hospital Management & Orthopaedics", "Managing Director & Chief Surgeon", "+91 98481-22334", "owner@mahalakshmihospital-eluru.in", "All Day (08:00 - 21:00)"),
                createUser("admin", "Admin@2026", "Smt. M. Padmavathi", "ADMIN", "Administration & Operations", "Hospital Administrator", "+91 98482-33445", "admin@mahalakshmihospital-eluru.in", "General (09:00 - 18:00)"),
                createUser("doctor", "Doctor@2026", "Dr. N. Srinivasa Chakravarthy", "DOCTOR", "Orthopaedics & Joint Replacement", "Senior Orthopaedic & Spine Surgeon", "+91 94401-55667", "dr.chakravarthy@mahalakshmihospital-eluru.in", "Morning & Evening OPD"),
                createUser("nurse", "Nurse@2026", "Sr. P. Jhansi Lakshmi", "NURSE", "IPD / Orthopaedic & ICU Nursing", "Nursing Superintendent", "+91 94902-66778", "nursing@mahalakshmihospital-eluru.in", "Shift A (07:00 - 15:00)"),
                createUser("reception", "Reception@2026", "K. Sai Kiran", "RECEPTIONIST", "Front Office & OPD Desk", "Senior Reception Executive", "+91 99891-77889", "frontdesk@mahalakshmihospital-eluru.in", "Morning (08:00 - 16:00)"),
                createUser("lab", "Lab@2026", "V. Satyanarayana", "LAB_TECH", "Pathology & Biochemistry Lab", "Chief Laboratory Technologist", "+91 98661-88990", "lab@mahalakshmihospital-eluru.in", "Day Shift (07:30 - 17:30)"),
                createUser("billing", "Billing@2026", "G. Naga Raju", "BILLING", "Accounts, Billing & Arogyasri", "Senior Billing Officer", "+91 97012-99001", "billing@mahalakshmihospital-eluru.in", "General (09:00 - 19:00)")
        ));
    }

    private UserAccount createUser(String username, String rawPassword, String fullName, String role,
                                   String dept, String desig, String phone, String email, String shift) {
        UserAccount u = new UserAccount();
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setFullName(fullName);
        u.setRole(role);
        u.setDepartment(dept);
        u.setDesignation(desig);
        u.setPhone(phone);
        u.setEmail(email);
        u.setShiftTiming(shift);
        u.setActive(true);
        return u;
    }

    private void seedDoctors() {
        doctorRepo.saveAll(List.of(
                createDoc("DOC-101", "Dr. K. Venkata Rama Rao", "Joint Replacement, Spine Surgeries & Complex Trauma", "Orthopaedics", "MBBS, MS (Ortho), Fellowship in Arthroplasty", "APMC-44102", 22, "+91 98481-22334", "dr.ramarao@mahalakshmihospital-eluru.in", 600, "Mon-Sat: 09:30 AM - 02:00 PM, 05:30 PM - 08:30 PM", "OPD-01"),
                createDoc("DOC-102", "Dr. N. Srinivasa Chakravarthy", "Fractures, Ligament Tears & Keyhole Arthroscopy", "Orthopaedics", "MBBS, DNB (Ortho), FIFA Sports Injury Fellow", "APMC-51890", 15, "+91 94401-55667", "dr.chakravarthy@mahalakshmihospital-eluru.in", 500, "Mon-Sat: 10:00 AM - 04:00 PM", "OPD-02"),
                createDoc("DOC-103", "Dr. B. Sujatha Devi", "General Surgery & Keyhole Laparoscopic Surgery", "General Surgery", "MBBS, MS (General Surgery), FMAS", "APMC-49310", 17, "+91 94408-11223", "dr.sujatha@mahalakshmihospital-eluru.in", 500, "Mon-Sat: 09:00 AM - 03:00 PM", "OPD-03"),
                createDoc("DOC-104", "Dr. M. Rajasekhar Babu", "Anaesthesiology, Critical Care & Pain Management", "Anaesthesiology", "MBBS, MD (Anaesthesiology), IDCCM", "APMC-47221", 19, "+91 98490-44556", "dr.rajasekhar@mahalakshmihospital-eluru.in", 550, "24x7 OT & ICU Coverage", "OT-ICU"),
                createDoc("DOC-105", "Dr. Ch. Aparna Priya", "Diagnostic Imaging, MRI & CT Interventions", "Diagnostic Imaging", "MBBS, MD (Radio-Diagnosis)", "APMC-58912", 12, "+91 99492-77441", "dr.aparna@mahalakshmihospital-eluru.in", 450, "Mon-Sat: 09:00 AM - 05:00 PM", "RAD-01"),
                createDoc("DOC-106", "Dr. Y. Phani Kumar", "Emergency Care, Polytrauma & General Checkups", "Emergency Care", "MBBS, MEM (Emergency Medicine)", "APMC-63109", 9, "+91 96664-33210", "dr.phani@mahalakshmihospital-eluru.in", 400, "24x7 Emergency & Casualty", "EMG-01"),
                createDoc("DOC-107", "Dr. T. Madhavi Latha", "Outpatient Internal Medicine, Joint Inflammation & Hospice Care", "Outpatient Services", "MBBS, MD (General Medicine)", "APMC-53420", 14, "+91 98852-66110", "dr.madhavi@mahalakshmihospital-eluru.in", 400, "Mon-Sat: 09:00 AM - 02:30 PM", "OPD-04")
        ));
    }

    private Doctor createDoc(String code, String name, String spec, String dept, String qual, String lic,
                             int exp, String phone, String email, double fee, String sched, String room) {
        Doctor d = new Doctor();
        d.setDoctorCode(code);
        d.setFullName(name);
        d.setSpecialization(spec);
        d.setDepartment(dept);
        d.setQualification(qual);
        d.setLicenseNumber(lic);
        d.setExperienceYears(exp);
        d.setPhone(phone);
        d.setEmail(email);
        d.setConsultationFee(fee);
        d.setAvailabilitySchedule(sched);
        d.setRoomNumber(room);
        d.setAvailable(true);
        return d;
    }

    private void seedClinicalAndOperationsData() {
        LocalDate today = LocalDate.now();

        Patient p1 = savePatient("MHL-2026-1001", "D. Suryanarayana Murthy", LocalDate.of(1962, 4, 15), 64, "Male", "B+", "+91 98483-10293",
                "D.No 24-5-12, Powerpet, Eluru, AP 534002", "D. Karthik (Son)", "+91 98483-99881", "Son",
                "Sulfa drugs", "Grade IV Bilateral Knee Osteoarthritis, Hypertension (10 yrs)", "Joint Replacement", "Dr. K. Venkata Rama Rao", "ADMITTED", today.minusDays(3));

        Patient p2 = savePatient("MHL-2026-1002", "Smt. K. Annapurna Devi", LocalDate.of(1971, 8, 22), 55, "Female", "O+", "+91 94402-56120",
                "Near Clock Tower, R.R.Pet, Eluru, AP 534002", "K.Subba Rao (Husband)", "+91 94402-56121", "Spouse",
                "None known", "L4-L5 Intervertebral Disc Prolapse with Sciatica, Type-2 Diabetes", "Spine Surgeries", "Dr. K. Venkata Rama Rao", "ADMITTED", today.minusDays(2));

        Patient p3 = savePatient("MHL-2026-1003", "M. Vamsi Krishna", LocalDate.of(1998, 1, 10), 28, "Male", "A+", "+91 99895-41230",
                "Sanivarapupeta, Eluru, AP 534003", "M. Ramesh (Father)", "+91 99895-41239", "Father",
                "Penicillin mild rash", "Complete Anterior Cruciate Ligament (ACL) Tear + Medial Meniscus Injury (Right Knee)", "Ligament Tears", "Dr. N. Srinivasa Chakravarthy", "OUTPATIENT", today.minusDays(1));

        Patient p4 = savePatient("MHL-2026-1004", "P. Venkata Lakshmi", LocalDate.of(1980, 11, 5), 45, "Female", "AB+", "+91 97045-88210",
                "Ashok Nagar, Eluru, AP 534002", "P. Srinivas (Husband)", "+91 97045-88219", "Spouse",
                "NSAIDs gastric sensitivity", "Rheumatoid Polyarthritis & Chronic Synovial Joint Inflammation", "Joint Inflammation", "Dr. T. Madhavi Latha", "OUTPATIENT", today);

        Patient p5 = savePatient("MHL-2026-1005", "G. Rambabu Naidu", LocalDate.of(1989, 6, 19), 37, "Male", "O-", "+91 96182-33901",
                "NH-16 Bypass Road, Denduluru, Eluru District", "G. Manga Devi (Wife)", "+91 96182-33905", "Spouse",
                "None", "Road Traffic Accident - Comminuted Tibia & Fibula Shaft Fracture (Right Leg)", "Fractures", "Dr. N. Srinivasa Chakravarthy", "EMERGENCY", today);

        Patient p6 = savePatient("MHL-2026-1006", "Ch. Bhavani Prasad", LocalDate.of(1951, 3, 2), 75, "Male", "B+", "+91 94910-22104",
                "Tangellamudi, Eluru, AP 534005", "Ch. Ravi Teja (Son)", "+91 94910-22199", "Son",
                "None", "Palliative Post-Stroke Care & Supportive Pain Management", "Hospice Care", "Dr. T. Madhavi Latha", "ADMITTED", today.minusDays(5));

        Patient p7 = savePatient("MHL-2026-1007", "R.divya Sri", LocalDate.of(1993, 9, 14), 33, "Female", "A+", "+91 95501-67890",
                "Satrampadu, Eluru, AP 534007", "R. Naveen (Husband)", "+91 95501-67899", "Spouse",
                "Latex allergy", "Symptomatic Cholelithiasis for Keyhole Laparoscopic Cholecystectomy", "Keyhole Surgeries", "Dr. B. Sujatha Devi", "DISCHARGED", today.minusDays(7));

        // Seed Ward Beds
        WardBed b1 = saveBed("ORT-101", "Orthopaedic Ward", "Orthopaedic Traction Bed", "1st Floor", "OCCUPIED", 2200, p1.getId(), p1.getFullName(), p1.getPatientUid(), "Post Total Knee Replacement");
        WardBed b2 = saveBed("ORT-102", "Orthopaedic Ward", "Orthopaedic Traction Bed", "1st Floor", "OCCUPIED", 2200, p2.getId(), p2.getFullName(), p2.getPatientUid(), "Lumbar Spine Decompression");
        WardBed b3 = saveBed("ORT-103", "Orthopaedic Ward", "Standard Ortho Bed", "1st Floor", "AVAILABLE", 1800, null, null, null, "Sanitized & Ready");
        WardBed b4 = saveBed("ORT-104", "Orthopaedic Ward", "Standard Ortho Bed", "1st Floor", "AVAILABLE", 1800, null, null, null, "Sanitized & Ready");
        WardBed b5 = saveBed("ICU-201", "Surgical & Trauma ICU", "ICU Ventilator Monitor Bed", "2nd Floor", "OCCUPIED", 5500, p5.getId(), p5.getFullName(), p5.getPatientUid(), "RTA Polytrauma Observation");
        WardBed b6 = saveBed("ICU-202", "Surgical & Trauma ICU", "ICU Ventilator Monitor Bed", "2nd Floor", "AVAILABLE", 5500, null, null, null, "24x7 Multipara Monitor Ready");
        WardBed b7 = saveBed("GEN-301", "General Surgical Ward", "Semi-Private Bed", "3rd Floor", "AVAILABLE", 1200, null, null, null, "Available");
        WardBed b8 = saveBed("GEN-302", "General Surgical Ward", "Semi-Private Bed", "3rd Floor", "AVAILABLE", 1200, null, null, null, "Available");
        WardBed b9 = saveBed("HSP-401", "Hospice & Palliative Suite", "Comfort Care AC Suite", "Ground Floor Annex", "OCCUPIED", 2500, p6.getId(), p6.getFullName(), p6.getPatientUid(), "Palliative Care Monitoring");
        WardBed b10 = saveBed("PRV-501", "Executive Private Rooms", "Deluxe AC Room", "3rd Floor", "AVAILABLE", 3500, null, null, null, "VIP Suite");
        WardBed b11 = saveBed("PRV-502", "Executive Private Rooms", "Deluxe AC Room", "3rd Floor", "MAINTENANCE", 3500, null, null, null, "UV Sterilization in progress");

        // Seed Admissions
        saveAdmission("ADM-2026-601", p1, 1L, "Dr. K. Venkata Rama Rao", "Joint Replacement", b1,
                "Severe bilateral knee pain, inability to walk unassisted", "Grade IV Osteoarthritis Right Knee",
                "Patient recovering smoothly in Post-Op Day 2; CPM physiotherapy started.", "Inj. Cefuroxime 1.5g IV BD, Tab. Etoricoxib 90mg OD, Inj. Enoxaparin 40mg SC", "ADMITTED", today.minusDays(3), null);

        saveAdmission("ADM-2026-602", p2, 1L, "Dr. K. Venkata Rama Rao", "Spine Surgeries", b2,
                "Acute radiating low back pain to left lower limb with numbness", "L4-L5 Herniated Nucleus Pulposus with Radiculopathy",
                "Scheduled for Microscopic Lumbar Discectomy.", "Inj. Pregabalin-M, Inj. Pantoprazole 40mg, IV Paracetamol 1g", "ADMITTED", today.minusDays(2), null);

        saveAdmission("ADM-2026-603", p5, 2L, "Dr. N. Srinivasa Chakravarthy", "Trauma & Fractures", b5,
                "High-velocity RTA near Denduluru Highway", "Open Grade II Tibia-Fibula Shaft Fracture Right Leg",
                "Limb splinted, IV antibiotics & tetanus toxoid administered, scheduled for IM Interlocking Nail.", "Inj. Ceftriaxone + Sulbactam 1.5g IV, Inj. Amikacin 500mg, Inj. Tramadol", "ADMITTED", today, null);

        saveAdmission("ADM-2026-604", p6, 7L, "Dr. T. Madhavi Latha", "Hospice Care", b9,
                "Supportive geriatric & palliative care, nutritional rehabilitation", "Post-CVA Hemiparesis & Chronic Pain",
                "Vitals stable; physiotherapy & air-bed sore prevention protocol active.", "Tab. Ecospirin 75mg, Tab. Atorvastatin 20mg, B-Complex", "ADMITTED", today.minusDays(5), null);

        saveAdmission("ADM-2026-605", p7, 3L, "Dr. B. Sujatha Devi", "Keyhole Surgeries", b7,
                "Recurrent biliary colic with multiple gallstones", "Calculous Cholecystitis",
                "Uneventful 4-port Keyhole Laparoscopic Cholecystectomy completed. Wound healthy, discharged in stable condition.", "Tab. Cefixime 200mg BD x 5 days, Tab. Pan-D OD, Tab. Zerodol-P SOS", "DISCHARGED", today.minusDays(7), today.minusDays(4));

        // Seed Appointments
        saveAppointment("APT-2026-501", p3, 2L, "Dr. N. Srinivasa Chakravarthy", "Orthopaedics", "Ligament Tears", today, "10:15 AM", "ORTHO_CONSULT", "IN_PROGRESS", "Right knee instability after sports injury; MRI review for Keyhole ACL Reconstruction", "Bring MRI CD", 1);
        saveAppointment("APT-2026-502", p4, 7L, "Dr. T. Madhavi Latha", "Outpatient Services", "Joint Inflammation", today, "11:00 AM", "OPD", "CHECKED_IN", "Morning stiffness in both wrists and knees; ESR/CRP follow-up", "Fasting blood sample collected", 2);
        saveAppointment("APT-2026-503", p1, 1L, "Dr. K. Venkata Rama Rao", "Orthopaedics", "Joint Replacement", today, "11:45 AM", "FOLLOW_UP", "COMPLETED", "Post-Op TKR inpatient dressing & ROM assessment", "Knee flexion achieved 85 degrees", 3);
        saveAppointment("APT-2026-504", p7, 3L, "Dr. B. Sujatha Devi", "General Surgery", "Keyhole Surgeries", today, "12:30 PM", "FOLLOW_UP", "SCHEDULED", "Day-7 port-site suture inspection post keyhole surgery", "No fever or abdominal pain", 4);
        saveAppointment("APT-2026-505", p2, 4L, "Dr. M. Rajasekhar Babu", "Anaesthesiology", "Anaesthesiology", today, "02:00 PM", "OPD", "SCHEDULED", "Pre-Anaesthetic Checkup (PAC) for L4-L5 Spine Surgery", "Airway Mallampati Grade I, ASA II", 5);

        // Seed EMR / Medical Records
        saveEmr("EMR-2026-301", p1, 1L, "Dr. K. Venkata Rama Rao", "Orthopaedics", "Joint Replacement", "INPATIENT_ROUND",
                "Severe varus deformity and medial compartment bone-on-bone crepitus right knee",
                "Primary Tricompartmental Osteoarthritis Right Knee (Kellgren-Lawrence Grade IV)",
                "Cemented Posterior-Stabilized Total Knee Replacement performed under combined spinal-epidural anaesthesia. Drain output minimal (<60ml). Distal pulses intact.",
                "1. Inj. Cefuroxime 1.5g IV q12h\n2. Inj. Enoxaparin 40mg SC OD\n3. Tab. Gabapentin 100mg HS\n4. Tab. Calcium + Vit D3 OD",
                "130/82 mmHg", "76 bpm", "98.4 F", "99%", "74 kg", today.minusDays(1), today.plusDays(14), "Continue quadriceps isometric exercises & walker ambulation");

        saveEmr("EMR-2026-302", p3, 2L, "Dr. N. Srinivasa Chakravarthy", "Orthopaedics", "Ligament Tears", "CONSULTATION",
                "Popping sound and swelling in right knee following twisting injury",
                "Complete Mid-Substance ACL Tear with Bucket-Handle Medial Meniscus Tear",
                "Lachman test Grade 3+, Anterior Drawer positive, McMurray test positive for medial joint line.",
                "1. Tab. Chymoral Forte TID x 5 days\n2. Tab. Aceclofenac + Paracetamol BD\n3. Hinged Knee Brace Immobilizer\n4. Advised Keyhole Arthroscopic ACL Reconstruction",
                "122/78 mmHg", "72 bpm", "98.2 F", "99%", "68 kg", today, today.plusDays(5), "Pre-op blood profile & Anaesthesia fitness");

        saveEmr("EMR-2026-303", p4, 7L, "Dr. T. Madhavi Latha", "Outpatient Services", "Joint Inflammation", "CONSULTATION",
                "Symmetrical joint swelling and pain in MCP, PIP, and knee joints for 4 months",
                "Seropositive Inflammatory Polyarthritis",
                "Synovial thickening noted over bilateral wrists; no deformities yet. Disease-modifying anti-rheumatic therapy initiated.",
                "1. Tab. Hydroxychloroquine 200mg OD\n2. Tab. Methotrexate 10mg Weekly (Sunday) + Tab. Folic Acid 5mg (Tue/Thu)\n3. Tab. Etoricoxib 60mg SOS",
                "118/76 mmHg", "80 bpm", "98.6 F", "98%", "59 kg", today, today.plusDays(21), "Review with LFT and CBC in 3 weeks");

        // Seed Lab & Blood Reports
        saveLab("LAB-2026-701", p1, 1L, "Dr. K. Venkata Rama Rao", "Complete Blood Picture (CBP / Hemogram)", "Hematology",
                "Whole Blood (EDTA)", "Hb: 12.8 | WBC: 7,900 | Platelets: 2.45 Lakhs", "g/dL & /cumm", "Hb: 13.0-17.0 | WBC: 4,000-11,000",
                false, "VERIFIED", "V. Satyanarayana", "Dr. N. Srinivasa Chakravarthy", today.minusDays(2), today.minusDays(2), today.minusDays(2), 450, "Normal post-operative hematology profile");

        saveLab("LAB-2026-702", p4, 7L, "Dr. T. Madhavi Latha", "Rheumatoid Factor (RA Quantitative) & Anti-CCP", "Serology",
                "Serum", "RA: 48.6 | Anti-CCP: 64.2", "IU/mL", "RA: < 14.0 IU/mL | Anti-CCP: < 20.0 U/mL",
                true, "VERIFIED", "V. Satyanarayana", "Dr. T. Madhavi Latha", today, today, today, 1200, "Elevated Rheumatoid Factor & Anti-CCP confirming active joint inflammation");

        saveLab("LAB-2026-703", p2, 1L, "Dr. K. Venkata Rama Rao", "HbA1c & Fasting Blood Sugar (Pre-Op Spine Panel)", "Biochemistry",
                "Whole Blood / Fluoride Plasma", "HbA1c: 6.7% | FBS: 118 mg/dL", "% & mg/dL", "HbA1c: < 6.5% | FBS: 70-110 mg/dL",
                true, "COMPLETED", "V. Satyanarayana", null, today, today, null, 750, "Good glycemic control for scheduled spine surgery; awaiting doctor verification");

        saveLab("LAB-2026-704", p5, 2L, "Dr. N. Srinivasa Chakravarthy", "Coagulation Profile (PT / INR / aPTT) & Blood Grouping", "Coagulation",
                "Citrated Plasma", "Pending Analyzer Run", "Seconds / INR", "PT: 11-13.5 sec | INR: 0.8-1.2",
                false, "PENDING", "V. Satyanarayana", null, today, null, null, 850, "STAT Emergency Trauma OT workup");

        // Seed Diagnostic Imaging
        saveImaging("IMG-2026-801", p1, "Dr. K. Venkata Rama Rao", "Digital X-Ray", "Right Knee AP & Lateral (Standing)",
                "Prosthetic femoral and tibial components in optimal mechanical alignment. No periprosthetic lucency or fracture.",
                "Satisfactory Post-Op Total Knee Arthroplasty Alignment.", "VERIFIED", "Dr. Ch. Aparna Priya", today.minusDays(1), 800);

        saveImaging("IMG-2026-802", p2, "Dr. K. Venkata Rama Rao", "MRI 1.5T", "Lumbosacral Spine (Sagittal & Axial T1/T2)",
                "Posterolateral disc extrusion at L4-L5 indenting the thecal sac and compressing the traversing left L5 nerve root.",
                "L4-L5 Paracentral Disc Herniation with Left L5 Neural Foramen Narrowing.", "VERIFIED", "Dr. Ch. Aparna Priya", today.minusDays(2), 5500);

        saveImaging("IMG-2026-803", p3, "Dr. N. Srinivasa Chakravarthy", "MRI 1.5T", "Right Knee Joint Multiplanar",
                "Complete discontinuity of ACL fibers with hyperintense edema. Complex tear of posterior horn of medial meniscus.",
                "Complete ACL Tear + Medial Meniscal Tear (Grade III).", "REPORT_READY", "Dr. Ch. Aparna Priya", today, 5200);

        saveImaging("IMG-2026-804", p5, "Dr. Y. Phani Kumar", "Digital X-Ray", "Right Leg Full Length AP/Lateral + Chest PA",
                "Displaced comminuted fracture at middle-distal third junction of right tibia and fibula. Chest radiograph clear.",
                "Comminuted Right Tibia-Fibula Shaft Fracture.", "IN_PROGRESS", "Dr. Ch. Aparna Priya", today, 1100);

        // Seed Orthopaedic Department Cases
        saveOrtho("ORTHO-2026-201", p1, "Dr. K. Venkata Rama Rao", "Joint Replacement", "Right Knee Joint",
                "Degenerative Age-Related Wear", "Severe (Grade IV)", "Varus deformity 12 deg, ROM 10-95 deg",
                "Total Knee Replacement (TKR) + Structured CPM & Gait Rehabilitation", "Zimmer Persona PS Cobalt-Chrome Knee System",
                "Day 2 Walker Ambulation & Isometric Quadriceps", "POST_OP_REHAB", today.minusDays(3));

        saveOrtho("ORTHO-2026-202", p2, "Dr. K. Venkata Rama Rao", "Spine Surgeries", "Lumbar Spine L4-L5",
                "Intervertebral Disc Prolapse", "Severe (Radiculopathy)", "SLR positive at 35 deg left, EHL weakness 4/5",
                "Micro-Lumbar Discectomy & Nerve Root Decompression", "Tubular Retractor Keyhole Spine System",
                "Pre-op Lumbar Core Stabilization Protocol", "SURGERY_SCHEDULED", today.minusDays(2));

        saveOrtho("ORTHO-2026-203", p3, "Dr. N. Srinivasa Chakravarthy", "Ligament Tears", "Right Knee ACL & Medial Meniscus",
                "Sports Twisting Trauma", "Moderate-Severe", "Anterior translation +++, Pivot shift positive",
                "Keyhole Arthroscopic Anatomical ACL Reconstruction + Meniscal Repair", "Titanium Endobutton + Bio-Composite Interference Screw",
                "Pre-hab Cryotherapy & ROM maintenance", "SURGERY_SCHEDULED", today.minusDays(1));

        saveOrtho("ORTHO-2026-204", p5, "Dr. N. Srinivasa Chakravarthy", "Fractures", "Right Tibia & Fibula Shaft",
                "High-Velocity Road Traffic Accident", "Complex/Comminuted", "Swelling, deformity, crepitus over right leg; no distal neurovascular deficit",
                "Closed Reduction & Internal Fixation (CRIF) with Suprapatellar Tibial Interlocking Nail", "Titanium Tibial IM Nail (10mm x 340mm)",
                "Limb elevation & ankle pump post-fixation", "SURGERY_SCHEDULED", today);

        saveOrtho("ORTHO-2026-205", p4, "Dr. T. Madhavi Latha", "Joint Inflammation", "Bilateral Wrists & Knees",
                "Autoimmune Synovitis", "Moderate", "Tender & swollen joint count: 6; DAS28 score 4.2",
                "DMARD Combination Therapy + Intra-articular Steroid Injection if flare persists", "Medical Management (No Implant)",
                "Warm Paraffin Wax Bath & Gentle ROM Therapy", "ACTIVE_TREATMENT", today);

        // Seed Surgeries
        saveSurgery("SRG-2026-401", p1, "Dr. K. Venkata Rama Rao", "Dr. M. Rajasekhar Babu", "Combined Spinal + Epidural",
                "Right Total Knee Replacement (TKR)", "Joint Replacement", "OT-1 (Modular Joint & Spine)",
                today.minusDays(2), "09:00 AM", "COMPLETED",
                "WHO Surgical Safety Checklist Verified, Antibiotic Prophylaxis Given, Blood Cross-Matched",
                "Subvastus approach, accurate femoral/tibial cuts using intramedullary/extramedullary guides, Zimmer prosthesis cemented. Stability & patellar tracking excellent.", 145000);

        saveSurgery("SRG-2026-402", p5, "Dr. N. Srinivasa Chakravarthy", "Dr. M. Rajasekhar Babu", "Spinal Anaesthesia",
                "CRIF with Titanium Intramedullary Interlocking Nail (Right Tibia)", "Fractures", "OT-3 (General & Trauma)",
                today, "04:30 PM", "PRE_OP",
                "NPO confirmed, Tetanus & IV Ceftriaxone administered, C-Arm Image Intensifier ready",
                "Trauma team on standby for closed reduction under C-Arm fluoroscopy.", 68000);

        saveSurgery("SRG-2026-403", p2, "Dr. K. Venkata Rama Rao", "Dr. M. Rajasekhar Babu", "General Anaesthesia (Endotracheal)",
                "Microscopic L4-L5 Lumbar Discectomy & Decompression", "Spine Surgeries", "OT-1 (Modular Joint & Spine)",
                today.plusDays(1), "09:30 AM", "SCHEDULED",
                "PAC Cleared by Dr. Rajasekhar Babu; Neuro-microscope calibrated",
                "Planned tubular minimally invasive spine decompression.", 95000);

        saveSurgery("SRG-2026-404", p3, "Dr. N. Srinivasa Chakravarthy", "Dr. M. Rajasekhar Babu", "Spinal + Adductor Canal Block",
                "Keyhole Arthroscopic ACL Reconstruction + Meniscal Suture", "Keyhole Surgeries", "OT-2 (Keyhole & Arthroscopy)",
                today.plusDays(2), "11:00 AM", "SCHEDULED",
                "Arthroscopy tower & shaver system checked; graft harvesting consent signed",
                "Hamstring autograft single-bundle anatomical reconstruction.", 78000);

        // Seed Emergency Cases
        saveEmergency("EMG-2026-101", p5.getId(), p5.getFullName(), p5.getPatientUid(), 37, "Male", "+91 96182-33901",
                "CRITICAL_RED", "Road Traffic Accident (RTA) - Compound Fracture",
                "Severe pain, bleeding and deformity in right lower leg after two-wheeler collision near Denduluru",
                "Dr. Y. Phani Kumar & Dr. N. Srinivasa Chakravarthy", "BP: 108/70 mmHg | HR: 112 bpm | SpO2: 97% | GCS: 15/15",
                "Wound irrigated with 3L Normal Saline, Thomas splint applied, IV crystalloids & analgesia started", "TRANSFERRED_OT", LocalDateTime.now().minusHours(3));

        saveEmergency("EMG-2026-102", null, "S. Narasimha Rao", "MHL-EMG-089", 52, "Male", "+91 98480-71234",
                "URGENT_ORANGE", "Domestic Fall - Right Colles' Wrist Fracture",
                "Fall on outstretched hand at home in R.R.Pet; dinner-fork deformity of right wrist",
                "Dr. Y. Phani Kumar", "BP: 136/86 mmHg | HR: 88 bpm | SpO2: 99%",
                "Hematoma block given, closed reduction & below-elbow POP slab applied, check X-Ray ordered", "STABILIZING", LocalDateTime.now().minusHours(1));

        saveEmergency("EMG-2026-103", null, "A. Padma Sri", "MHL-EMG-090", 29, "Female", "+91 99123-45670",
                "STABLE_YELLOW", "Acute Ankle Ligament Sprain & Contusion",
                "Twisted left ankle on stairs; lateral malleolus swelling",
                "Dr. Y. Phani Kumar", "BP: 118/76 mmHg | HR: 78 bpm | SpO2: 99%",
                "Ankle X-ray ruled out fracture; crepe bandage, ice pack & NSAIDs prescribed", "DISCHARGED", LocalDateTime.now().minusHours(5));

        // Seed Invoices & Payments
        saveInvoice("INV-2026-901", p1, "Orthopaedic Surgery", "Joint Replacement",
                "Total Knee Replacement Package (OT Charges, Zimmer Implant, Anaesthesia, 4 Days Ortho Ward, Medicines)",
                148000, 3000, 0, 145000, 120000, 25000, "UPI / NEFT", "PARTIAL", today, "Advance Rs.1,20,000 received; balance at discharge");

        saveInvoice("INV-2026-902", p2, "IPD Admission", "Spine Surgeries",
                "MRI Lumbosacral Spine + Pre-Op Spine Admission Deposit + Biochemistry Lab Panel",
                45000, 0, 0, 45000, 30000, 15000, "Card", "PARTIAL", today, "Pre-op deposit collected");

        saveInvoice("INV-2026-903", p3, "Diagnostic Imaging", "Ligament Tears",
                "OPD Orthopaedic Consultation (Rs.500) + MRI 1.5T Right Knee Joint (Rs.5200) + Hinged Knee Brace (Rs.1800)",
                7500, 300, 0, 7200, 7200, 0, "UPI", "PAID", today, "Paid in full via PhonePe QR");

        saveInvoice("INV-2026-904", p4, "Lab & Blood Reports", "Joint Inflammation",
                "OPD Consultation (Rs.400) + RA Factor & Anti-CCP Panel (Rs.1200) + Pharmacy Medicines (Rs.950)",
                2550, 0, 0, 2550, 2550, 0, "Cash", "PAID", today, "Paid at OPD Counter");

        saveInvoice("INV-2026-905", p5, "Emergency Care", "Fractures",
                "Emergency Trauma Resuscitation + Digital X-Ray + ICU Bed & Tibial Interlocking Nail Surgery Deposit",
                68000, 0, 0, 68000, 35000, 33000, "UPI", "PARTIAL", today, "Emergency trauma admission advance");

        saveInvoice("INV-2026-906", p7, "Orthopaedic Surgery", "Keyhole Surgeries",
                "Keyhole Laparoscopic Cholecystectomy Package (Complete Surgical & Ward Settlement)",
                52000, 2000, 0, 50000, 50000, 0, "Arogyasri / Insurance", "PAID", today.minusDays(4), "Final discharge bill settled");

        // Seed Pharmacy & Implant Inventory
        pharmacyRepo.saveAll(List.of(
                createPharm("PHM-101", "Inj. Cefuroxime 1.5g Vial", "Cefuroxime Sodium", "Antibiotics", "Sun Pharma", "B26-CF91", today.plusMonths(14), 140, 30, 320, "Rack A-01"),
                createPharm("PHM-102", "Tab. Etoricoxib 90mg (Nucoxia-90)", "Etoricoxib", "Analgesics/NSAIDs", "Zydus Healthcare", "B26-ET44", today.plusMonths(18), 420, 80, 18.5, "Rack B-04"),
                createPharm("PHM-103", "Inj. Enoxaparin 40mg Prefilled Syringe", "Low Molecular Weight Heparin", "Anticoagulants", "Sanofi India", "B26-EN19", today.plusMonths(10), 65, 20, 490, "Cold Chain C-01"),
                createPharm("PHM-104", "Zimmer Persona Total Knee Prosthesis", "Co-Cr Femoral + Ti Tibial + UHMWPE Insert", "Orthopaedic Implants", "Zimmer Biomet", "IMP-ZM-882", today.plusMonths(36), 8, 3, 68000, "Sterile OT Vault V-01"),
                createPharm("PHM-105", "Titanium Tibial Interlocking Nail Set", "Ti-6Al-4V Cannulated IM Nail + Locking Bolts", "Orthopaedic Implants", "Synthes / Sharma Ortho", "IMP-TI-409", today.plusMonths(48), 14, 5, 16500, "Sterile OT Vault V-02"),
                createPharm("PHM-106", "Inj. Bupivacaine 0.5% Heavy (Anawin)", "Hyperbaric Bupivacaine HCl", "Anaesthetics", "Neon Laboratories", "B26-AN77", today.plusMonths(15), 95, 25, 65, "OT Pharmacy P-02"),
                createPharm("PHM-107", "Tab. Shelcal-HD (Calcium 500mg + Vit D3)", "Elemental Calcium + Cholecalciferol", "Bone Supplements", "Torrent Pharma", "B26-SH12", today.plusMonths(20), 600, 100, 12.0, "Rack D-02"),
                createPharm("PHM-108", "Arthroscopic Bio-Composite Interference Screw", "PLLA-HA Ligament Fixation Screw", "Orthopaedic Implants", "Smith & Nephew", "IMP-SN-215", today.plusMonths(30), 4, 5, 11500, "Sterile OT Vault V-03")
        ));

        // Seed Initial Audit Logs
        auditRepo.saveAll(List.of(
                new AuditLog("owner", "OWNER", "SYSTEM_INIT", "SYSTEM", "MAHALAKSHMI-HMS", "Initialized Mahalakshmi Hospital Management System (Eluru) with clinical departments & services"),
                new AuditLog("doctor", "DOCTOR", "VERIFY", "LAB_REPORTS", "LAB-2026-701", "Verified Post-Op Complete Blood Picture for D. Suryanarayana Murthy"),
                new AuditLog("reception", "RECEPTIONIST", "CREATE", "EMERGENCY", "EMG-2026-101", "Registered RTA Tibia Fracture emergency for G. Rambabu Naidu"),
                new AuditLog("billing", "BILLING", "CREATE", "BILLING", "INV-2026-901", "Recorded Rs.1,20,000 advance receipt for Total Knee Replacement")
        ));
    }

    private Patient savePatient(String uid, String name, LocalDate dob, int age, String gender, String bg,
                                String phone, String addr, String emgName, String emgPhone, String emgRel,
                                String allergies, String history, String service, String doc, String status, LocalDate regDate) {
        Patient p = new Patient();
        p.setPatientUid(uid);
        p.setFullName(name);
        p.setDateOfBirth(dob);
        p.setAge(age);
        p.setGender(gender);
        p.setBloodGroup(bg);
        p.setPhone(phone);
        p.setAddress(addr);
        p.setEmergencyContactName(emgName);
        p.setEmergencyContactPhone(emgPhone);
        p.setEmergencyContactRelation(emgRel);
        p.setAllergies(allergies);
        p.setMedicalHistory(history);
        p.setPrimaryService(service);
        p.setAssignedDoctorName(doc);
        p.setStatus(status);
        p.setRegistrationDate(regDate);
        return patientRepo.save(p);
    }

    private WardBed saveBed(String num, String ward, String type, String floor, String status, double charge,
                            Long patId, String patName, String patUid, String notes) {
        WardBed b = new WardBed();
        b.setBedNumber(num);
        b.setWardName(ward);
        b.setBedType(type);
        b.setFloor(floor);
        b.setStatus(status);
        b.setDailyCharge(charge);
        b.setCurrentPatientId(patId);
        b.setCurrentPatientName(patName);
        b.setCurrentPatientUid(patUid);
        b.setNotes(notes);
        return bedRepo.save(b);
    }

    private void saveAdmission(String uid, Patient p, Long docId, String docName, String dept, WardBed bed,
                               String reason, String diag, String summary, String meds, String status,
                               LocalDate admDate, LocalDate disDate) {
        Admission a = new Admission();
        a.setAdmissionUid(uid);
        a.setPatientId(p.getId());
        a.setPatientName(p.getFullName());
        a.setPatientUid(p.getPatientUid());
        a.setDoctorId(docId);
        a.setDoctorName(docName);
        a.setDepartment(dept);
        a.setBedId(bed.getId());
        a.setBedNumber(bed.getBedNumber());
        a.setWardName(bed.getWardName());
        a.setAdmissionReason(reason);
        a.setDiagnosisOnAdmission(diag);
        a.setDischargeSummary(summary);
        a.setDischargeMedications(meds);
        a.setStatus(status);
        a.setAdmissionDate(admDate);
        a.setDischargeDate(disDate);
        admissionRepo.save(a);
    }

    private void saveAppointment(String uid, Patient p, Long docId, String docName, String dept, String service,
                                 LocalDate date, String time, String type, String status, String reason, String notes, int token) {
        Appointment ap = new Appointment();
        ap.setAppointmentUid(uid);
        ap.setPatientId(p.getId());
        ap.setPatientName(p.getFullName());
        ap.setPatientUid(p.getPatientUid());
        ap.setDoctorId(docId);
        ap.setDoctorName(docName);
        ap.setDepartment(dept);
        ap.setServiceCategory(service);
        ap.setAppointmentDate(date);
        ap.setAppointmentTime(time);
        ap.setVisitType(type);
        ap.setStatus(status);
        ap.setReason(reason);
        ap.setNotes(notes);
        ap.setTokenNumber(token);
        appointmentRepo.save(ap);
    }

    private void saveEmr(String uid, Patient p, Long docId, String docName, String dept, String service, String visitType,
                         String cc, String diag, String notes, String rx, String bp, String pulse, String temp,
                         String spo2, String wt, LocalDate visitDate, LocalDate followUp, String followInst) {
        MedicalRecord m = new MedicalRecord();
        m.setRecordUid(uid);
        m.setPatientId(p.getId());
        m.setPatientName(p.getFullName());
        m.setPatientUid(p.getPatientUid());
        m.setDoctorId(docId);
        m.setDoctorName(docName);
        m.setDepartment(dept);
        m.setServiceCategory(service);
        m.setVisitType(visitType);
        m.setChiefComplaint(cc);
        m.setDiagnosis(diag);
        m.setClinicalNotes(notes);
        m.setPrescription(rx);
        m.setVitalsBp(bp);
        m.setVitalsPulse(pulse);
        m.setVitalsTemp(temp);
        m.setVitalsSpo2(spo2);
        m.setVitalsWeight(wt);
        m.setVisitDate(visitDate);
        m.setFollowUpDate(followUp);
        m.setFollowUpInstructions(followInst);
        emrRepo.save(m);
    }

    private void saveLab(String uid, Patient p, Long docId, String docName, String test, String cat, String sample,
                         String result, String unit, String ref, boolean abn, String status, String tech,
                         String verBy, LocalDate ordDate, LocalDate compDate, LocalDate verDate, double cost, String remarks) {
        LabReport l = new LabReport();
        l.setReportUid(uid);
        l.setPatientId(p.getId());
        l.setPatientName(p.getFullName());
        l.setPatientUid(p.getPatientUid());
        l.setOrderedByDoctorId(docId);
        l.setOrderedByDoctorName(docName);
        l.setTestName(test);
        l.setTestCategory(cat);
        l.setSampleType(sample);
        l.setResultValue(result);
        l.setUnit(unit);
        l.setReferenceRange(ref);
        l.setAbnormal(abn);
        l.setStatus(status);
        l.setTechnicianName(tech);
        l.setVerifiedBy(verBy);
        l.setOrderedDate(ordDate);
        l.setCompletedDate(compDate);
        l.setVerifiedDate(verDate);
        l.setPdfFileName(uid + "_Mahalakshmi_Lab_Report.pdf");
        l.setTestCost(cost);
        l.setClinicalRemarks(remarks);
        labRepo.save(l);
    }

    private void saveImaging(String uid, Patient p, String docName, String modality, String part, String findings,
                             String impression, String status, String rad, LocalDate date, double cost) {
        DiagnosticImaging img = new DiagnosticImaging();
        img.setImagingUid(uid);
        img.setPatientId(p.getId());
        img.setPatientName(p.getFullName());
        img.setPatientUid(p.getPatientUid());
        img.setOrderedByDoctorName(docName);
        img.setModality(modality);
        img.setBodyPart(part);
        img.setFindings(findings);
        img.setImpression(impression);
        img.setStatus(status);
        img.setRadiologistName(rad);
        img.setScanDate(date);
        img.setCost(cost);
        imagingRepo.save(img);
    }

    private void saveOrtho(String uid, Patient p, String surgeon, String subSpec, String site, String mech,
                           String sev, String assess, String plan, String implant, String physio, String status, LocalDate date) {
        OrthopaedicCase o = new OrthopaedicCase();
        o.setCaseUid(uid);
        o.setPatientId(p.getId());
        o.setPatientName(p.getFullName());
        o.setPatientUid(p.getPatientUid());
        o.setSurgeonName(surgeon);
        o.setSubSpecialty(subSpec);
        o.setAffectedSite(site);
        o.setMechanismOfInjury(mech);
        o.setSeverity(sev);
        o.setClinicalAssessment(assess);
        o.setTreatmentPlan(plan);
        o.setImplantOrFixation(implant);
        o.setPhysiotherapyPlan(physio);
        o.setStatus(status);
        o.setEvaluationDate(date);
        orthoRepo.save(o);
    }

    private void saveSurgery(String uid, Patient p, String surgeon, String anaesName, String anaesType,
                             String proc, String service, String ot, LocalDate date, String time,
                             String status, String preOp, String notes, double cost) {
        Surgery s = new Surgery();
        s.setSurgeryUid(uid);
        s.setPatientId(p.getId());
        s.setPatientName(p.getFullName());
        s.setPatientUid(p.getPatientUid());
        s.setLeadSurgeonName(surgeon);
        s.setAnaesthetistName(anaesName);
        s.setAnaesthesiaType(anaesType);
        s.setProcedureName(proc);
        s.setServiceCategory(service);
        s.setOperationTheatre(ot);
        s.setScheduledDate(date);
        s.setScheduledTime(time);
        s.setStatus(status);
        s.setPreOpChecklist(preOp);
        s.setOperativeNotes(notes);
        s.setEstimatedCost(cost);
        surgeryRepo.save(s);
    }

    private void saveEmergency(String uid, Long patId, String patName, String patUid, int age, String gender,
                               String phone, String triage, String trauma, String cc, String doc,
                               String vitals, String action, String status, LocalDateTime arrival) {
        EmergencyCase e = new EmergencyCase();
        e.setEmergencyUid(uid);
        e.setPatientId(patId);
        e.setPatientName(patName);
        e.setPatientUid(patUid);
        e.setAge(age);
        e.setGender(gender);
        e.setContactPhone(phone);
        e.setTriageLevel(triage);
        e.setTraumaType(trauma);
        e.setChiefComplaint(cc);
        e.setAttendingDoctor(doc);
        e.setVitalsSummary(vitals);
        e.setImmediateActionTaken(action);
        e.setStatus(status);
        e.setArrivalTime(arrival);
        emergencyRepo.save(e);
    }

    private void saveInvoice(String uid, Patient p, String cat, String dept, String desc, double sub,
                             double disc, double tax, double total, double paid, double bal,
                             String method, String status, LocalDate date, String remarks) {
        Invoice inv = new Invoice();
        inv.setInvoiceUid(uid);
        inv.setPatientId(p.getId());
        inv.setPatientName(p.getFullName());
        inv.setPatientUid(p.getPatientUid());
        inv.setBillingCategory(cat);
        inv.setServiceDepartment(dept);
        inv.setDescription(desc);
        inv.setSubtotal(sub);
        inv.setDiscount(disc);
        inv.setTaxAmount(tax);
        inv.setTotalAmount(total);
        inv.setPaidAmount(paid);
        inv.setBalanceAmount(bal);
        inv.setPaymentMethod(method);
        inv.setPaymentStatus(status);
        inv.setBillingDate(date);
        inv.setRemarks(remarks);
        invoiceRepo.save(inv);
    }

    private PharmacyItem createPharm(String code, String name, String gen, String cat, String mfg,
                                     String batch, LocalDate exp, int stock, int reorder, double price, String rack) {
        PharmacyItem item = new PharmacyItem();
        item.setItemCode(code);
        item.setMedicineName(name);
        item.setGenericName(gen);
        item.setCategory(cat);
        item.setManufacturer(mfg);
        item.setBatchNumber(batch);
        item.setExpiryDate(exp);
        item.setStockQuantity(stock);
        item.setReorderLevel(reorder);
        item.setUnitPrice(price);
        item.setRackLocation(rack);
        return item;
    }
}
