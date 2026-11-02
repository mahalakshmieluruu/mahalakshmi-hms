package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.model.*;
import com.mahalakshmi.hms.repository.*;
import com.mahalakshmi.hms.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ClinicalController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final OrthopaedicCaseRepository orthopaedicCaseRepository;
    private final SurgeryRepository surgeryRepository;
    private final EmergencyCaseRepository emergencyCaseRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public ClinicalController(DoctorRepository doctorRepository,
                              AppointmentRepository appointmentRepository,
                              MedicalRecordRepository medicalRecordRepository,
                              OrthopaedicCaseRepository orthopaedicCaseRepository,
                              SurgeryRepository surgeryRepository,
                              EmergencyCaseRepository emergencyCaseRepository,
                              PatientRepository patientRepository,
                              AuditService auditService) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.orthopaedicCaseRepository = orthopaedicCaseRepository;
        this.surgeryRepository = surgeryRepository;
        this.emergencyCaseRepository = emergencyCaseRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    // ==================== DOCTORS ====================
    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @PostMapping("/doctors")
    public Doctor createDoctor(@RequestBody Doctor doc) {
        if (doc.getDoctorCode() == null || doc.getDoctorCode().isBlank()) {
            doc.setDoctorCode("DOC-" + (101 + doctorRepository.count()));
        }
        Doctor saved = doctorRepository.save(doc);
        auditService.log("CREATE", "DOCTORS", saved.getDoctorCode(), "Added doctor: " + saved.getFullName());
        return saved;
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor updated) {
        return doctorRepository.findById(id).map(existing -> {
            existing.setFullName(updated.getFullName());
            existing.setSpecialization(updated.getSpecialization());
            existing.setDepartment(updated.getDepartment());
            existing.setQualification(updated.getQualification());
            existing.setLicenseNumber(updated.getLicenseNumber());
            existing.setExperienceYears(updated.getExperienceYears());
            existing.setPhone(updated.getPhone());
            existing.setEmail(updated.getEmail());
            existing.setConsultationFee(updated.getConsultationFee());
            existing.setAvailabilitySchedule(updated.getAvailabilitySchedule());
            existing.setRoomNumber(updated.getRoomNumber());
            existing.setAvailable(updated.isAvailable());
            Doctor saved = doctorRepository.save(existing);
            auditService.log("UPDATE", "DOCTORS", saved.getDoctorCode(), "Updated doctor: " + saved.getFullName());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        return doctorRepository.findById(id).map(existing -> {
            doctorRepository.delete(existing);
            auditService.log("DELETE", "DOCTORS", existing.getDoctorCode(), "Deleted doctor: " + existing.getFullName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== APPOINTMENTS ====================
    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAllByOrderByAppointmentDateDesc();
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@RequestBody Appointment appt) {
        if (appt.getAppointmentUid() == null || appt.getAppointmentUid().isBlank()) {
            appt.setAppointmentUid("APT-2026-" + (501 + appointmentRepository.count()));
        }
        if (appt.getAppointmentDate() == null) {
            appt.setAppointmentDate(LocalDate.now());
        }
        if (appt.getTokenNumber() <= 0) {
            appt.setTokenNumber((int) (appointmentRepository.count() + 1));
        }
        hydratePatientInfo(appt.getPatientId(), (name, uid) -> {
            appt.setPatientName(name);
            appt.setPatientUid(uid);
        });
        Appointment saved = appointmentRepository.save(appt);
        auditService.log("CREATE", "APPOINTMENTS", saved.getAppointmentUid(), "Booked appointment for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/appointments/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Appointment updated) {
        return appointmentRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            hydratePatientInfo(updated.getPatientId(), (name, uid) -> {
                existing.setPatientName(name);
                existing.setPatientUid(uid);
            });
            existing.setDoctorId(updated.getDoctorId());
            existing.setDoctorName(updated.getDoctorName());
            existing.setDepartment(updated.getDepartment());
            existing.setServiceCategory(updated.getServiceCategory());
            existing.setAppointmentDate(updated.getAppointmentDate());
            existing.setAppointmentTime(updated.getAppointmentTime());
            existing.setVisitType(updated.getVisitType());
            existing.setStatus(updated.getStatus());
            existing.setReason(updated.getReason());
            existing.setNotes(updated.getNotes());
            if (updated.getTokenNumber() > 0) {
                existing.setTokenNumber(updated.getTokenNumber());
            }
            Appointment saved = appointmentRepository.save(existing);
            auditService.log("UPDATE", "APPOINTMENTS", saved.getAppointmentUid(), "Updated appointment for " + saved.getPatientName() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id).map(existing -> {
            appointmentRepository.delete(existing);
            auditService.log("DELETE", "APPOINTMENTS", existing.getAppointmentUid(), "Deleted appointment for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== EMR / MEDICAL RECORDS ====================
    @GetMapping("/emr")
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordRepository.findAllByOrderByVisitDateDesc();
    }

    @PostMapping("/emr")
    public MedicalRecord createMedicalRecord(@RequestBody MedicalRecord rec) {
        if (rec.getRecordUid() == null || rec.getRecordUid().isBlank()) {
            rec.setRecordUid("EMR-2026-" + (301 + medicalRecordRepository.count()));
        }
        if (rec.getVisitDate() == null) {
            rec.setVisitDate(LocalDate.now());
        }
        hydratePatientInfo(rec.getPatientId(), (name, uid) -> {
            rec.setPatientName(name);
            rec.setPatientUid(uid);
        });
        MedicalRecord saved = medicalRecordRepository.save(rec);
        auditService.log("CREATE", "EMR", saved.getRecordUid(), "Created EMR record for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/emr/{id}")
    public ResponseEntity<MedicalRecord> updateMedicalRecord(@PathVariable Long id, @RequestBody MedicalRecord updated) {
        return medicalRecordRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            hydratePatientInfo(updated.getPatientId(), (name, uid) -> {
                existing.setPatientName(name);
                existing.setPatientUid(uid);
            });
            existing.setDoctorId(updated.getDoctorId());
            existing.setDoctorName(updated.getDoctorName());
            existing.setDepartment(updated.getDepartment());
            existing.setServiceCategory(updated.getServiceCategory());
            existing.setVisitType(updated.getVisitType());
            existing.setChiefComplaint(updated.getChiefComplaint());
            existing.setDiagnosis(updated.getDiagnosis());
            existing.setClinicalNotes(updated.getClinicalNotes());
            existing.setPrescription(updated.getPrescription());
            existing.setVitalsBp(updated.getVitalsBp());
            existing.setVitalsPulse(updated.getVitalsPulse());
            existing.setVitalsTemp(updated.getVitalsTemp());
            existing.setVitalsSpo2(updated.getVitalsSpo2());
            existing.setVitalsWeight(updated.getVitalsWeight());
            existing.setVisitDate(updated.getVisitDate());
            existing.setFollowUpDate(updated.getFollowUpDate());
            existing.setFollowUpInstructions(updated.getFollowUpInstructions());
            MedicalRecord saved = medicalRecordRepository.save(existing);
            auditService.log("UPDATE", "EMR", saved.getRecordUid(), "Updated EMR record for " + saved.getPatientName());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/emr/{id}")
    public ResponseEntity<?> deleteMedicalRecord(@PathVariable Long id) {
        return medicalRecordRepository.findById(id).map(existing -> {
            medicalRecordRepository.delete(existing);
            auditService.log("DELETE", "EMR", existing.getRecordUid(), "Deleted EMR record for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== ORTHOPAEDIC DEPARTMENT CASES ====================
    @GetMapping("/ortho-cases")
    public List<OrthopaedicCase> getAllOrthoCases() {
        return orthopaedicCaseRepository.findAllByOrderByEvaluationDateDesc();
    }

    @PostMapping("/ortho-cases")
    public OrthopaedicCase createOrthoCase(@RequestBody OrthopaedicCase c) {
        if (c.getCaseUid() == null || c.getCaseUid().isBlank()) {
            c.setCaseUid("ORTHO-2026-" + (201 + orthopaedicCaseRepository.count()));
        }
        if (c.getEvaluationDate() == null) {
            c.setEvaluationDate(LocalDate.now());
        }
        hydratePatientInfo(c.getPatientId(), (name, uid) -> {
            c.setPatientName(name);
            c.setPatientUid(uid);
        });
        OrthopaedicCase saved = orthopaedicCaseRepository.save(c);
        auditService.log("CREATE", "ORTHOPAEDICS", saved.getCaseUid(), "Recorded Orthopaedic case (" + saved.getSubSpecialty() + ") for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/ortho-cases/{id}")
    public ResponseEntity<OrthopaedicCase> updateOrthoCase(@PathVariable Long id, @RequestBody OrthopaedicCase updated) {
        return orthopaedicCaseRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            hydratePatientInfo(updated.getPatientId(), (name, uid) -> {
                existing.setPatientName(name);
                existing.setPatientUid(uid);
            });
            existing.setSurgeonName(updated.getSurgeonName());
            existing.setSubSpecialty(updated.getSubSpecialty());
            existing.setAffectedSite(updated.getAffectedSite());
            existing.setMechanismOfInjury(updated.getMechanismOfInjury());
            existing.setSeverity(updated.getSeverity());
            existing.setClinicalAssessment(updated.getClinicalAssessment());
            existing.setTreatmentPlan(updated.getTreatmentPlan());
            existing.setImplantOrFixation(updated.getImplantOrFixation());
            existing.setPhysiotherapyPlan(updated.getPhysiotherapyPlan());
            existing.setStatus(updated.getStatus());
            existing.setEvaluationDate(updated.getEvaluationDate());
            OrthopaedicCase saved = orthopaedicCaseRepository.save(existing);
            auditService.log("UPDATE", "ORTHOPAEDICS", saved.getCaseUid(), "Updated Orthopaedic case for " + saved.getPatientName());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ortho-cases/{id}")
    public ResponseEntity<?> deleteOrthoCase(@PathVariable Long id) {
        return orthopaedicCaseRepository.findById(id).map(existing -> {
            orthopaedicCaseRepository.delete(existing);
            auditService.log("DELETE", "ORTHOPAEDICS", existing.getCaseUid(), "Deleted Orthopaedic case for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== SURGERY & OPERATION MANAGEMENT ====================
    @GetMapping("/surgeries")
    public List<Surgery> getAllSurgeries() {
        return surgeryRepository.findAllByOrderByScheduledDateDesc();
    }

    @PostMapping("/surgeries")
    public Surgery createSurgery(@RequestBody Surgery s) {
        if (s.getSurgeryUid() == null || s.getSurgeryUid().isBlank()) {
            s.setSurgeryUid("SRG-2026-" + (401 + surgeryRepository.count()));
        }
        if (s.getScheduledDate() == null) {
            s.setScheduledDate(LocalDate.now());
        }
        hydratePatientInfo(s.getPatientId(), (name, uid) -> {
            s.setPatientName(name);
            s.setPatientUid(uid);
        });
        Surgery saved = surgeryRepository.save(s);
        auditService.log("CREATE", "SURGERIES", saved.getSurgeryUid(), "Scheduled surgery (" + saved.getProcedureName() + ") for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/surgeries/{id}")
    public ResponseEntity<Surgery> updateSurgery(@PathVariable Long id, @RequestBody Surgery updated) {
        return surgeryRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            hydratePatientInfo(updated.getPatientId(), (name, uid) -> {
                existing.setPatientName(name);
                existing.setPatientUid(uid);
            });
            existing.setLeadSurgeonName(updated.getLeadSurgeonName());
            existing.setAnaesthetistName(updated.getAnaesthetistName());
            existing.setAnaesthesiaType(updated.getAnaesthesiaType());
            existing.setProcedureName(updated.getProcedureName());
            existing.setServiceCategory(updated.getServiceCategory());
            existing.setOperationTheatre(updated.getOperationTheatre());
            existing.setScheduledDate(updated.getScheduledDate());
            existing.setScheduledTime(updated.getScheduledTime());
            existing.setStatus(updated.getStatus());
            existing.setPreOpChecklist(updated.getPreOpChecklist());
            existing.setOperativeNotes(updated.getOperativeNotes());
            existing.setEstimatedCost(updated.getEstimatedCost());
            Surgery saved = surgeryRepository.save(existing);
            auditService.log("UPDATE", "SURGERIES", saved.getSurgeryUid(), "Updated surgery (" + saved.getProcedureName() + ") [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/surgeries/{id}")
    public ResponseEntity<?> deleteSurgery(@PathVariable Long id) {
        return surgeryRepository.findById(id).map(existing -> {
            surgeryRepository.delete(existing);
            auditService.log("DELETE", "SURGERIES", existing.getSurgeryUid(), "Deleted surgery for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== EMERGENCY PATIENT MANAGEMENT ====================
    @GetMapping("/emergencies")
    public List<EmergencyCase> getAllEmergencies() {
        return emergencyCaseRepository.findAllByOrderByArrivalTimeDesc();
    }

    @PostMapping("/emergencies")
    public EmergencyCase createEmergency(@RequestBody EmergencyCase ec) {
        if (ec.getEmergencyUid() == null || ec.getEmergencyUid().isBlank()) {
            ec.setEmergencyUid("EMG-2026-" + (101 + emergencyCaseRepository.count()));
        }
        if (ec.getArrivalTime() == null) {
            ec.setArrivalTime(LocalDateTime.now());
        }
        hydratePatientInfo(ec.getPatientId(), (name, uid) -> {
            if (ec.getPatientName() == null || ec.getPatientName().isBlank()) {
                ec.setPatientName(name);
            }
            ec.setPatientUid(uid);
        });
        EmergencyCase saved = emergencyCaseRepository.save(ec);
        auditService.log("CREATE", "EMERGENCY", saved.getEmergencyUid(), "Registered emergency triage (" + saved.getTriageLevel() + ") for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/emergencies/{id}")
    public ResponseEntity<EmergencyCase> updateEmergency(@PathVariable Long id, @RequestBody EmergencyCase updated) {
        return emergencyCaseRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            existing.setAge(updated.getAge());
            existing.setGender(updated.getGender());
            existing.setContactPhone(updated.getContactPhone());
            existing.setTriageLevel(updated.getTriageLevel());
            existing.setTraumaType(updated.getTraumaType());
            existing.setChiefComplaint(updated.getChiefComplaint());
            existing.setAttendingDoctor(updated.getAttendingDoctor());
            existing.setVitalsSummary(updated.getVitalsSummary());
            existing.setImmediateActionTaken(updated.getImmediateActionTaken());
            existing.setStatus(updated.getStatus());
            EmergencyCase saved = emergencyCaseRepository.save(existing);
            auditService.log("UPDATE", "EMERGENCY", saved.getEmergencyUid(), "Updated emergency case for " + saved.getPatientName() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/emergencies/{id}")
    public ResponseEntity<?> deleteEmergency(@PathVariable Long id) {
        return emergencyCaseRepository.findById(id).map(existing -> {
            emergencyCaseRepository.delete(existing);
            auditService.log("DELETE", "EMERGENCY", existing.getEmergencyUid(), "Removed emergency case for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    private interface PatientInfoCallback {
        void apply(String fullName, String uid);
    }

    private void hydratePatientInfo(Long patientId, PatientInfoCallback cb) {
        if (patientId != null) {
            patientRepository.findById(patientId).ifPresent(p -> cb.apply(p.getFullName(), p.getPatientUid()));
        }
    }
}
