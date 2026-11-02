package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "orthopaedic_cases")
public class OrthopaedicCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String caseUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private String surgeonName;
    private String subSpecialty; // Joint Replacement, Fractures, Spine Surgeries, Trauma, Joint Inflammation, Ligament Tears, Keyhole Surgeries
    private String affectedSite; // Right Knee, Left Hip, Lumbar Spine L4-L5, Right Distal Radius, Anterior Cruciate Ligament (ACL), etc.
    private String mechanismOfInjury;
    private String severity; // Mild, Moderate, Severe, Complex/Comminuted

    @Column(length = 2000)
    private String clinicalAssessment;

    @Column(length = 2000)
    private String treatmentPlan;

    private String implantOrFixation; // Titanium Locking Plate, Total Knee Prosthesis (Zimmer), PEEK Cage, Bio-absorbable Screw, Conservative Cast
    private String physiotherapyPlan;
    private String status = "ACTIVE_TREATMENT"; // ACTIVE_TREATMENT, SURGERY_SCHEDULED, POST_OP_REHAB, RECOVERED
    private LocalDate evaluationDate = LocalDate.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseUid() { return caseUid; }
    public void setCaseUid(String caseUid) { this.caseUid = caseUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public String getSurgeonName() { return surgeonName; }
    public void setSurgeonName(String surgeonName) { this.surgeonName = surgeonName; }
    public String getSubSpecialty() { return subSpecialty; }
    public void setSubSpecialty(String subSpecialty) { this.subSpecialty = subSpecialty; }
    public String getAffectedSite() { return affectedSite; }
    public void setAffectedSite(String affectedSite) { this.affectedSite = affectedSite; }
    public String getMechanismOfInjury() { return mechanismOfInjury; }
    public void setMechanismOfInjury(String mechanismOfInjury) { this.mechanismOfInjury = mechanismOfInjury; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getClinicalAssessment() { return clinicalAssessment; }
    public void setClinicalAssessment(String clinicalAssessment) { this.clinicalAssessment = clinicalAssessment; }
    public String getTreatmentPlan() { return treatmentPlan; }
    public void setTreatmentPlan(String treatmentPlan) { this.treatmentPlan = treatmentPlan; }
    public String getImplantOrFixation() { return implantOrFixation; }
    public void setImplantOrFixation(String implantOrFixation) { this.implantOrFixation = implantOrFixation; }
    public String getPhysiotherapyPlan() { return physiotherapyPlan; }
    public void setPhysiotherapyPlan(String physiotherapyPlan) { this.physiotherapyPlan = physiotherapyPlan; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDate evaluationDate) { this.evaluationDate = evaluationDate; }
}
