package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "admissions")
public class Admission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String admissionUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private Long doctorId;
    private String doctorName;
    private String department;

    private Long bedId;
    private String bedNumber;
    private String wardName;

    @Column(length = 1000)
    private String admissionReason;

    @Column(length = 1000)
    private String diagnosisOnAdmission;

    @Column(length = 2500)
    private String dischargeSummary;

    @Column(length = 1500)
    private String dischargeMedications;

    private String status = "ADMITTED"; // ADMITTED, DISCHARGED, TRANSFERRED
    private LocalDate admissionDate = LocalDate.now();
    private LocalDate dischargeDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAdmissionUid() { return admissionUid; }
    public void setAdmissionUid(String admissionUid) { this.admissionUid = admissionUid; }
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
    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }
    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }
    public String getAdmissionReason() { return admissionReason; }
    public void setAdmissionReason(String admissionReason) { this.admissionReason = admissionReason; }
    public String getDiagnosisOnAdmission() { return diagnosisOnAdmission; }
    public void setDiagnosisOnAdmission(String diagnosisOnAdmission) { this.diagnosisOnAdmission = diagnosisOnAdmission; }
    public String getDischargeSummary() { return dischargeSummary; }
    public void setDischargeSummary(String dischargeSummary) { this.dischargeSummary = dischargeSummary; }
    public String getDischargeMedications() { return dischargeMedications; }
    public void setDischargeMedications(String dischargeMedications) { this.dischargeMedications = dischargeMedications; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }
    public LocalDate getDischargeDate() { return dischargeDate; }
    public void setDischargeDate(LocalDate dischargeDate) { this.dischargeDate = dischargeDate; }
}
