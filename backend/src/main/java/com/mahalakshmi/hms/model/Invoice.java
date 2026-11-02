package com.mahalakshmi.hms.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceUid;

    private Long patientId;
    private String patientName;
    private String patientUid;

    private String billingCategory; // OPD Consultation, IPD Admission, Orthopaedic Surgery, Lab & Blood Reports, Diagnostic Imaging, Emergency Care, Pharmacy
    private String serviceDepartment;

    @Column(length = 2500)
    private String description;

    private double subtotal;
    private double discount;
    private double taxAmount;
    private double totalAmount;
    private double paidAmount;
    private double balanceAmount;

    private String paymentMethod; // UPI, Cash, Card, Arogyasri / Insurance, NEFT
    private String paymentStatus = "PENDING"; // PAID, PARTIAL, PENDING, CANCELLED
    private LocalDate billingDate = LocalDate.now();
    private String remarks;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceUid() { return invoiceUid; }
    public void setInvoiceUid(String invoiceUid) { this.invoiceUid = invoiceUid; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPatientUid() { return patientUid; }
    public void setPatientUid(String patientUid) { this.patientUid = patientUid; }
    public String getBillingCategory() { return billingCategory; }
    public void setBillingCategory(String billingCategory) { this.billingCategory = billingCategory; }
    public String getServiceDepartment() { return serviceDepartment; }
    public void setServiceDepartment(String serviceDepartment) { this.serviceDepartment = serviceDepartment; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getSubtotal() { return subtotal; }
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }
    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }
    public double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(double taxAmount) { this.taxAmount = taxAmount; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(double paidAmount) { this.paidAmount = paidAmount; }
    public double getBalanceAmount() { return balanceAmount; }
    public void setBalanceAmount(double balanceAmount) { this.balanceAmount = balanceAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public LocalDate getBillingDate() { return billingDate; }
    public void setBillingDate(LocalDate billingDate) { this.billingDate = billingDate; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
