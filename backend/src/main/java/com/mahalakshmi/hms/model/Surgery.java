package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "surgeries")
public class Surgery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String surgeryUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private String leadSurgeonName;
    private String anaesthetistName;
    private String anaesthesiaType; // Spinal, General, Epidural, Regional Nerve Block, Local
    private String procedureName;
    private String serviceCategory; // Joint Replacement, Spine Surgeries, Keyhole Surgeries, Fractures, General Surgery
    private String operationTheatre; // OT-1 (Modular Joint & Spine), OT-2 (Keyhole & Arthroscopy), OT-3 (General & Trauma)

    private LocalDate scheduledDate = LocalDate.now();
    private String scheduledTime;
    private String status = "SCHEDULED"; // SCHEDULED, PRE_OP, IN_SURGERY, POST_OP, COMPLETED, CANCELLED

    @Column(length = 1500)
    private String preOpChecklist;

    @Column(length = 2000)
    private String operativeNotes;

    private double estimatedCost;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSurgeryUid() { return surgeryUid; }
    public void setSurgeryUid(String surgeryUid) { this.surgeryUid = surgeryUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public String getLeadSurgeonName() { return leadSurgeonName; }
    public void setLeadSurgeonName(String leadSurgeonName) { this.leadSurgeonName = leadSurgeonName; }
    public String getAnaesthetistName() { return anaesthetistName; }
    public void setAnaesthetistName(String anaesthetistName) { this.anaesthetistName = anaesthetistName; }
    public String getAnaesthesiaType() { return anaesthesiaType; }
    public void setAnaesthesiaType(String anaesthesiaType) { this.anaesthesiaType = anaesthesiaType; }
    public String getProcedureName() { return procedureName; }
    public void setProcedureName(String procedureName) { this.procedureName = procedureName; }
    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }
    public String getOperationTheatre() { return operationTheatre; }
    public void setOperationTheatre(String operationTheatre) { this.operationTheatre = operationTheatre; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    public String getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(String scheduledTime) { this.scheduledTime = scheduledTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPreOpChecklist() { return preOpChecklist; }
    public void setPreOpChecklist(String preOpChecklist) { this.preOpChecklist = preOpChecklist; }
    public String getOperativeNotes() { return operativeNotes; }
    public void setOperativeNotes(String operativeNotes) { this.operativeNotes = operativeNotes; }
    public double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(double estimatedCost) { this.estimatedCost = estimatedCost; }
}
