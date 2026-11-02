package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "diagnostic_imaging")
public class DiagnosticImaging {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String imagingUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private String orderedByDoctorName;
    private String modality; // Digital X-Ray, MRI 1.5T, CT Scan, Ultrasound, DEXA Bone Densitometry, C-Arm Fluoroscopy
    private String bodyPart;

    @Column(length = 2000)
    private String findings;

    @Column(length = 1500)
    private String impression;

    private String status = "ORDERED"; // ORDERED, IN_PROGRESS, REPORT_READY, VERIFIED
    private String radiologistName;
    private LocalDate scanDate = LocalDate.now();
    private double cost;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getImagingUid() { return imagingUid; }
    public void setImagingUid(String imagingUid) { this.imagingUid = imagingUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public String getOrderedByDoctorName() { return orderedByDoctorName; }
    public void setOrderedByDoctorName(String orderedByDoctorName) { this.orderedByDoctorName = orderedByDoctorName; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public String getBodyPart() { return bodyPart; }
    public void setBodyPart(String bodyPart) { this.bodyPart = bodyPart; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public String getImpression() { return impression; }
    public void setImpression(String impression) { this.impression = impression; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRadiologistName() { return radiologistName; }
    public void setRadiologistName(String radiologistName) { this.radiologistName = radiologistName; }
    public LocalDate getScanDate() { return scanDate; }
    public void setScanDate(LocalDate scanDate) { this.scanDate = scanDate; }
    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }
}
