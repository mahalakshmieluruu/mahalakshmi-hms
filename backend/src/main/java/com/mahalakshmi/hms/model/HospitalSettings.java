package com.mahalakshmi.hms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospital_settings")
public class HospitalSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hospitalName = "MAHALAKSHMI HOSPITAL";
    private String subtitle = "Multi-Specialty Orthopaedic, Trauma, Surgical & Emergency Care Centre";
    private String addressLine1 = "Kasturivari Street (Ramamahal Ladies Gate Street)";
    private String addressLine2 = "R.R.Pet Main Road";
    private String city = "Eluru";
    private String state = "Andhra Pradesh";
    private String pincode = "534002";
    private String primaryPhone = "+91 8812-234567";
    private String emergencyPhone = "+91 98481-10800";
    private String email = "admin@mahalakshmihospital-eluru.in";
    private String registrationNumber = "AP-ELR-HMS-2026-0891";
    private String gstNumber = "37AABCM4589F1Z8";
    private String ownerName = "Dr. K. Venkata Rama Rao (Managing Director)";
    private String operatingHours = "24x7 Emergency & Inpatient | OPD: 8:30 AM - 8:30 PM";

    @Column(length = 3000)
    private String configuredServices = "Anaesthesiology,Diagnostic Imaging,Emergency Care,General Checkups,General Surgery,Hospice Care,Orthopaedics,Outpatient Services,Joint Replacement,Fractures,Spine Surgeries,Trauma,Joint Inflammation,Ligament Tears,Keyhole Surgeries";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getPrimaryPhone() { return primaryPhone; }
    public void setPrimaryPhone(String primaryPhone) { this.primaryPhone = primaryPhone; }
    public String getEmergencyPhone() { return emergencyPhone; }
    public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }
    public String getConfiguredServices() { return configuredServices; }
    public void setConfiguredServices(String configuredServices) { this.configuredServices = configuredServices; }
}
