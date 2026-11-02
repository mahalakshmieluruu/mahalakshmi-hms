package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_cases")
public class EmergencyCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String emergencyUid;

    private Long patientId;
    private String patientName;
    private String patientUid;
    private int age;
    private String gender;
    private String contactPhone;

    private String triageLevel; // CRITICAL_RED, URGENT_ORANGE, STABLE_YELLOW, MINOR_GREEN
    private String traumaType; // Road Traffic Accident (RTA), Compound Fracture, Acute Chest Pain, Fall Injury, Polytrauma
    private String chiefComplaint;
    private String attendingDoctor;
    private String vitalsSummary; // e.g. BP 95/60, HR 118, SpO2 94%
    private String immediateActionTaken;
    private String status = "IN_TRIAGE"; // IN_TRIAGE, STABILIZING, TRANSFERRED_OT, ADMITTED_ICU, DISCHARGED
    private LocalDateTime arrivalTime = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmergencyUid() { return emergencyUid; }
    public void setEmergencyUid(String emergencyUid) { this.emergencyUid = emergencyUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getTriageLevel() { return triageLevel; }
    public void setTriageLevel(String triageLevel) { this.triageLevel = triageLevel; }
    public String getTraumaType() { return traumaType; }
    public void setTraumaType(String traumaType) { this.traumaType = traumaType; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getAttendingDoctor() { return attendingDoctor; }
    public void setAttendingDoctor(String attendingDoctor) { this.attendingDoctor = attendingDoctor; }
    public String getVitalsSummary() { return vitalsSummary; }
    public void setVitalsSummary(String vitalsSummary) { this.vitalsSummary = vitalsSummary; }
    public String getImmediateActionTaken() { return immediateActionTaken; }
    public void setImmediateActionTaken(String immediateActionTaken) { this.immediateActionTaken = immediateActionTaken; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }
}
