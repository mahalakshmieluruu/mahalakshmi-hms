package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String recordUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private Long doctorId;
    private String doctorName;
    private String department;
    private String serviceCategory;
    private String visitType; // CONSULTATION, FOLLOW_UP, INPATIENT_ROUND, EMERGENCY_NOTE

    @Column(length = 1500)
    private String chiefComplaint;

    @Column(length = 1500)
    private String diagnosis;

    @Column(length = 3000)
    private String clinicalNotes;

    @Column(length = 3000)
    private String prescription;

    private String vitalsBp;
    private String vitalsPulse;
    private String vitalsTemp;
    private String vitalsSpo2;
    private String vitalsWeight;

    private LocalDate visitDate = LocalDate.now();
    private LocalDate followUpDate;
    private String followUpInstructions;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRecordUid() { return recordUid; }
    public void setRecordUid(String recordUid) { this.recordUid = recordUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }
    public String getVisitType() { return visitType; }
    public void setVisitType(String visitType) { this.visitType = visitType; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }
    public String getVitalsBp() { return vitalsBp; }
    public void setVitalsBp(String vitalsBp) { this.vitalsBp = vitalsBp; }
    public String getVitalsPulse() { return vitalsPulse; }
    public void setVitalsPulse(String vitalsPulse) { this.vitalsPulse = vitalsPulse; }
    public String getVitalsTemp() { return vitalsTemp; }
    public void setVitalsTemp(String vitalsTemp) { this.vitalsTemp = vitalsTemp; }
    public String getVitalsSpo2() { return vitalsSpo2; }
    public void setVitalsSpo2(String vitalsSpo2) { this.vitalsSpo2 = vitalsSpo2; }
    public String getVitalsWeight() { return vitalsWeight; }
    public void setVitalsWeight(String vitalsWeight) { this.vitalsWeight = vitalsWeight; }
    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getFollowUpInstructions() { return followUpInstructions; }
    public void setFollowUpInstructions(String followUpInstructions) { this.followUpInstructions = followUpInstructions; }
}
