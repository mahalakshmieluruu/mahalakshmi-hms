package com.mahalakshmi.hms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ward_beds")
public class WardBed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private String wardName; // General Ward, Orthopaedic Ward, ICU, Post-Op Ward, Private Suite, Emergency Ward, Hospice Ward

    private String bedType; // Standard, ICU Ventilator, Orthopaedic Traction, Private AC, Semi-Private
    private String floor;
    private String status = "AVAILABLE"; // AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
    private double dailyCharge;

    private Long currentPatientId;
    private String currentPatientName;
    private String currentPatientUid;
    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }
    public String getBedType() { return bedType; }
    public void setBedType(String bedType) { this.bedType = bedType; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getDailyCharge() { return dailyCharge; }
    public void setDailyCharge(double dailyCharge) { this.dailyCharge = dailyCharge; }
    public Long getCurrentPatientId() { return currentPatientId; }
    public void setCurrentPatientId(Long currentPatientId) { this.currentPatientId = currentPatientId; }
    public String getCurrentPatientName() { return currentPatientName; }
    public void setCurrentPatientName(String currentPatientName) { this.currentPatientName = currentPatientName; }
    public String getCurrentPatientUid() { return currentPatientUid; }
    public void setCurrentPatientUid(String currentPatientUid) { this.currentPatientUid = currentPatientUid; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
