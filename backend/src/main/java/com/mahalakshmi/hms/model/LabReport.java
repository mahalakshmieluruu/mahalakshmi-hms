package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lab_reports")
public class LabReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reportUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private Long orderedByDoctorId;
    private String orderedByDoctorName;

    @Column(nullable = false)
    private String testName;

    private String testCategory; // Hematology, Biochemistry, Serology, Coagulation, Microbiology, Urine Analysis
    private String sampleType; // Whole Blood (EDTA), Serum, Plasma, Urine, Synovial Fluid
    private String resultValue;
    private String unit;
    private String referenceRange;
    private boolean abnormal = false;

    private String status = "PENDING"; // PENDING, COMPLETED, VERIFIED
    private String technicianName;
    private String verifiedBy;
    private LocalDate orderedDate = LocalDate.now();
    private LocalDate completedDate;
    private LocalDate verifiedDate;

    private String pdfFileName;
    private String pdfStoragePath;
    private double testCost = 450.0;

    @Column(length = 1500)
    private String clinicalRemarks;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReportUid() { return reportUid; }
    public void setReportUid(String reportUid) { this.reportUid = reportUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public Long getOrderedByDoctorId() { return orderedByDoctorId; }
    public void setOrderedByDoctorId(Long orderedByDoctorId) { this.orderedByDoctorId = orderedByDoctorId; }
    public String getOrderedByDoctorName() { return orderedByDoctorName; }
    public void setOrderedByDoctorName(String orderedByDoctorName) { this.orderedByDoctorName = orderedByDoctorName; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getTestCategory() { return testCategory; }
    public void setTestCategory(String testCategory) { this.testCategory = testCategory; }
    public String getSampleType() { return sampleType; }
    public void setSampleType(String sampleType) { this.sampleType = sampleType; }
    public String getResultValue() { return resultValue; }
    public void setResultValue(String resultValue) { this.resultValue = resultValue; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getReferenceRange() { return referenceRange; }
    public void setReferenceRange(String referenceRange) { this.referenceRange = referenceRange; }
    public boolean isAbnormal() { return abnormal; }
    public void setAbnormal(boolean abnormal) { this.abnormal = abnormal; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public LocalDate getOrderedDate() { return orderedDate; }
    public void setOrderedDate(LocalDate orderedDate) { this.orderedDate = orderedDate; }
    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
    public LocalDate getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(LocalDate verifiedDate) { this.verifiedDate = verifiedDate; }
    public String getPdfFileName() { return pdfFileName; }
    public void setPdfFileName(String pdfFileName) { this.pdfFileName = pdfFileName; }
    public String getPdfStoragePath() { return pdfStoragePath; }
    public void setPdfStoragePath(String pdfStoragePath) { this.pdfStoragePath = pdfStoragePath; }
    public double getTestCost() { return testCost; }
    public void setTestCost(double testCost) { this.testCost = testCost; }
    public String getClinicalRemarks() { return clinicalRemarks; }
    public void setClinicalRemarks(String clinicalRemarks) { this.clinicalRemarks = clinicalRemarks; }
}
