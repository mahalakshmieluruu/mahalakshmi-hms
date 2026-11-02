package com.mahalakshmi.hms.controller;

import com.mahalakshmi.hms.model.*;
import com.mahalakshmi.hms.repository.*;
import com.mahalakshmi.hms.service.AuditService;
import com.mahalakshmi.hms.service.FileStorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class OperationsController {

    private final WardBedRepository wardBedRepository;
    private final AdmissionRepository admissionRepository;
    private final LabReportRepository labReportRepository;
    private final DiagnosticImagingRepository imagingRepository;
    private final InvoiceRepository invoiceRepository;
    private final PharmacyItemRepository pharmacyRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;
    private final FileStorageService fileStorageService;

    public OperationsController(WardBedRepository wardBedRepository,
                                AdmissionRepository admissionRepository,
                                LabReportRepository labReportRepository,
                                DiagnosticImagingRepository imagingRepository,
                                InvoiceRepository invoiceRepository,
                                PharmacyItemRepository pharmacyRepository,
                                PatientRepository patientRepository,
                                AuditService auditService,
                                FileStorageService fileStorageService) {
        this.wardBedRepository = wardBedRepository;
        this.admissionRepository = admissionRepository;
        this.labReportRepository = labReportRepository;
        this.imagingRepository = imagingRepository;
        this.invoiceRepository = invoiceRepository;
        this.pharmacyRepository = pharmacyRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
        this.fileStorageService = fileStorageService;
    }

    // ==================== WARDS & BEDS ====================
    @GetMapping("/beds")
    public List<WardBed> getAllBeds() {
        return wardBedRepository.findAllByOrderByBedNumberAsc();
    }

    @PostMapping("/beds")
    public WardBed createBed(@RequestBody WardBed bed) {
        WardBed saved = wardBedRepository.save(bed);
        auditService.log("CREATE", "BEDS", saved.getBedNumber(), "Added ward bed " + saved.getBedNumber() + " in " + saved.getWardName());
        return saved;
    }

    @PutMapping("/beds/{id}")
    public ResponseEntity<WardBed> updateBed(@PathVariable Long id, @RequestBody WardBed updated) {
        return wardBedRepository.findById(id).map(existing -> {
            existing.setBedNumber(updated.getBedNumber());
            existing.setWardName(updated.getWardName());
            existing.setBedType(updated.getBedType());
            existing.setFloor(updated.getFloor());
            existing.setStatus(updated.getStatus());
            existing.setDailyCharge(updated.getDailyCharge());
            existing.setCurrentPatientId(updated.getCurrentPatientId());
            existing.setCurrentPatientName(updated.getCurrentPatientName());
            existing.setCurrentPatientUid(updated.getCurrentPatientUid());
            existing.setNotes(updated.getNotes());
            WardBed saved = wardBedRepository.save(existing);
            auditService.log("UPDATE", "BEDS", saved.getBedNumber(), "Updated bed " + saved.getBedNumber() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/beds/{id}")
    public ResponseEntity<?> deleteBed(@PathVariable Long id) {
        return wardBedRepository.findById(id).map(existing -> {
            wardBedRepository.delete(existing);
            auditService.log("DELETE", "BEDS", existing.getBedNumber(), "Deleted bed " + existing.getBedNumber());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== ADMISSIONS & DISCHARGE ====================
    @GetMapping("/admissions")
    public List<Admission> getAllAdmissions() {
        return admissionRepository.findAllByOrderByAdmissionDateDesc();
    }

    @PostMapping("/admissions")
    public Admission createAdmission(@RequestBody Admission adm) {
        if (adm.getAdmissionUid() == null || adm.getAdmissionUid().isBlank()) {
            adm.setAdmissionUid("ADM-2026-" + (601 + admissionRepository.count()));
        }
        if (adm.getAdmissionDate() == null) {
            adm.setAdmissionDate(LocalDate.now());
        }
        if (adm.getPatientId() != null) {
            patientRepository.findById(adm.getPatientId()).ifPresent(p -> {
                adm.setPatientName(p.getFullName());
                adm.setPatientUid(p.getPatientUid());
                if ("ADMITTED".equals(adm.getStatus())) {
                    p.setStatus("ADMITTED");
                    patientRepository.save(p);
                }
            });
        }
        if (adm.getBedId() != null) {
            wardBedRepository.findById(adm.getBedId()).ifPresent(bed -> {
                adm.setBedNumber(bed.getBedNumber());
                adm.setWardName(bed.getWardName());
                if ("ADMITTED".equals(adm.getStatus())) {
                    bed.setStatus("OCCUPIED");
                    bed.setCurrentPatientId(adm.getPatientId());
                    bed.setCurrentPatientName(adm.getPatientName());
                    bed.setCurrentPatientUid(adm.getPatientUid());
                    wardBedRepository.save(bed);
                }
            });
        }
        Admission saved = admissionRepository.save(adm);
        auditService.log("CREATE", "ADMISSIONS", saved.getAdmissionUid(), "Admitted patient " + saved.getPatientName() + " to bed " + saved.getBedNumber());
        return saved;
    }

    @PutMapping("/admissions/{id}")
    public ResponseEntity<Admission> updateAdmission(@PathVariable Long id, @RequestBody Admission updated) {
        return admissionRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            if (updated.getPatientId() != null) {
                patientRepository.findById(updated.getPatientId()).ifPresent(p -> {
                    existing.setPatientName(p.getFullName());
                    existing.setPatientUid(p.getPatientUid());
                });
            }
            existing.setDoctorId(updated.getDoctorId());
            existing.setDoctorName(updated.getDoctorName());
            existing.setDepartment(updated.getDepartment());
            existing.setBedId(updated.getBedId());
            existing.setBedNumber(updated.getBedNumber());
            existing.setWardName(updated.getWardName());
            existing.setAdmissionReason(updated.getAdmissionReason());
            existing.setDiagnosisOnAdmission(updated.getDiagnosisOnAdmission());
            existing.setDischargeSummary(updated.getDischargeSummary());
            existing.setDischargeMedications(updated.getDischargeMedications());
            existing.setStatus(updated.getStatus());
            existing.setAdmissionDate(updated.getAdmissionDate());
            existing.setDischargeDate(updated.getDischargeDate());

            if ("DISCHARGED".equals(updated.getStatus())) {
                if (existing.getDischargeDate() == null) {
                    existing.setDischargeDate(LocalDate.now());
                }
                releaseBedAndUpdatePatient(existing);
            }
            Admission saved = admissionRepository.save(existing);
            auditService.log("UPDATE", "ADMISSIONS", saved.getAdmissionUid(), "Updated admission for " + saved.getPatientName() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/admissions/{id}/discharge")
    public ResponseEntity<Admission> dischargePatient(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return admissionRepository.findById(id).map(existing -> {
            existing.setStatus("DISCHARGED");
            existing.setDischargeDate(LocalDate.now());
            if (payload.containsKey("dischargeSummary")) {
                existing.setDischargeSummary(payload.get("dischargeSummary"));
            }
            if (payload.containsKey("dischargeMedications")) {
                existing.setDischargeMedications(payload.get("dischargeMedications"));
            }
            releaseBedAndUpdatePatient(existing);
            Admission saved = admissionRepository.save(existing);
            auditService.log("DISCHARGE", "ADMISSIONS", saved.getAdmissionUid(), "Discharged patient " + saved.getPatientName() + " from bed " + saved.getBedNumber());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void releaseBedAndUpdatePatient(Admission adm) {
        if (adm.getBedId() != null) {
            wardBedRepository.findById(adm.getBedId()).ifPresent(bed -> {
                bed.setStatus("AVAILABLE");
                bed.setCurrentPatientId(null);
                bed.setCurrentPatientName(null);
                bed.setCurrentPatientUid(null);
                wardBedRepository.save(bed);
            });
        }
        if (adm.getPatientId() != null) {
            patientRepository.findById(adm.getPatientId()).ifPresent(p -> {
                p.setStatus("DISCHARGED");
                patientRepository.save(p);
            });
        }
    }

    @DeleteMapping("/admissions/{id}")
    public ResponseEntity<?> deleteAdmission(@PathVariable Long id) {
        return admissionRepository.findById(id).map(existing -> {
            releaseBedAndUpdatePatient(existing);
            admissionRepository.delete(existing);
            auditService.log("DELETE", "ADMISSIONS", existing.getAdmissionUid(), "Deleted admission record for " + existing.getPatientName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== LABORATORY & BLOOD REPORTS ====================
    @GetMapping("/lab-reports")
    public List<LabReport> getAllLabReports() {
        return labReportRepository.findAllByOrderByOrderedDateDesc();
    }

    @PostMapping("/lab-reports")
    public LabReport createLabReport(@RequestBody LabReport report) {
        if (report.getReportUid() == null || report.getReportUid().isBlank()) {
            report.setReportUid("LAB-2026-" + (701 + labReportRepository.count()));
        }
        if (report.getOrderedDate() == null) {
            report.setOrderedDate(LocalDate.now());
        }
        if (report.getPatientId() != null) {
            patientRepository.findById(report.getPatientId()).ifPresent(p -> {
                report.setPatientName(p.getFullName());
                report.setPatientUid(p.getPatientUid());
            });
        }
        if (report.getPdfFileName() == null || report.getPdfFileName().isBlank()) {
            report.setPdfFileName(report.getReportUid() + "_Report.pdf");
        }
        LabReport saved = labReportRepository.save(report);
        auditService.log("CREATE", "LAB_REPORTS", saved.getReportUid(), "Ordered lab test (" + saved.getTestName() + ") for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/lab-reports/{id}")
    public ResponseEntity<LabReport> updateLabReport(@PathVariable Long id, @RequestBody LabReport updated) {
        return labReportRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            if (updated.getPatientId() != null) {
                patientRepository.findById(updated.getPatientId()).ifPresent(p -> {
                    existing.setPatientName(p.getFullName());
                    existing.setPatientUid(p.getPatientUid());
                });
            }
            existing.setOrderedByDoctorId(updated.getOrderedByDoctorId());
            existing.setOrderedByDoctorName(updated.getOrderedByDoctorName());
            existing.setTestName(updated.getTestName());
            existing.setTestCategory(updated.getTestCategory());
            existing.setSampleType(updated.getSampleType());
            existing.setResultValue(updated.getResultValue());
            existing.setUnit(updated.getUnit());
            existing.setReferenceRange(updated.getReferenceRange());
            existing.setAbnormal(updated.isAbnormal());
            existing.setStatus(updated.getStatus());
            existing.setTechnicianName(updated.getTechnicianName());
            existing.setVerifiedBy(updated.getVerifiedBy());
            existing.setOrderedDate(updated.getOrderedDate());
            existing.setCompletedDate(updated.getCompletedDate());
            existing.setVerifiedDate(updated.getVerifiedDate());
            existing.setTestCost(updated.getTestCost());
            existing.setClinicalRemarks(updated.getClinicalRemarks());
            if ("COMPLETED".equals(updated.getStatus()) && existing.getCompletedDate() == null) {
                existing.setCompletedDate(LocalDate.now());
            }
            if ("VERIFIED".equals(updated.getStatus()) && existing.getVerifiedDate() == null) {
                existing.setVerifiedDate(LocalDate.now());
                if (existing.getVerifiedBy() == null || existing.getVerifiedBy().isBlank()) {
                    existing.setVerifiedBy("Dr. N. Srinivasa Chakravarthy (Verified)");
                }
            }
            LabReport saved = labReportRepository.save(existing);
            auditService.log("UPDATE", "LAB_REPORTS", saved.getReportUid(), "Updated lab report " + saved.getTestName() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/lab-reports/{id}/verify")
    public ResponseEntity<LabReport> verifyLabReport(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        return labReportRepository.findById(id).map(existing -> {
            existing.setStatus("VERIFIED");
            existing.setVerifiedDate(LocalDate.now());
            if (existing.getCompletedDate() == null) {
                existing.setCompletedDate(LocalDate.now());
            }
            String verifier = (body != null && body.get("verifiedBy") != null && !body.get("verifiedBy").isBlank())
                    ? body.get("verifiedBy")
                    : auditService.getCurrentUsername();
            existing.setVerifiedBy(verifier);
            LabReport saved = labReportRepository.save(existing);
            auditService.log("VERIFY", "LAB_REPORTS", saved.getReportUid(), "Clinically verified lab report " + saved.getTestName() + " by " + verifier);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/lab-reports/{id}/upload-pdf")
    public ResponseEntity<?> uploadLabReportPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return labReportRepository.findById(id).map(existing -> {
            try {
                String storedName = fileStorageService.storePdfFile(file, existing.getReportUid());
                existing.setPdfFileName(file.getOriginalFilename());
                existing.setPdfStoragePath(storedName);
                LabReport saved = labReportRepository.save(existing);
                auditService.log("UPLOAD", "LAB_REPORTS", saved.getReportUid(), "Uploaded PDF report file: " + file.getOriginalFilename());
                return ResponseEntity.ok(saved);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "Failed to store PDF: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lab-reports/{id}/download-pdf")
    public ResponseEntity<byte[]> downloadLabReportPdf(@PathVariable Long id) {
        return labReportRepository.findById(id).map(existing -> {
            try {
                byte[] pdfBytes = fileStorageService.loadOrGenerateLabPdf(existing);
                String fileName = existing.getPdfFileName() != null && !existing.getPdfFileName().isBlank()
                        ? existing.getPdfFileName()
                        : existing.getReportUid() + ".pdf";
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdfBytes);
            } catch (IOException e) {
                return ResponseEntity.internalServerError().<byte[]>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/lab-reports/{id}")
    public ResponseEntity<?> deleteLabReport(@PathVariable Long id) {
        return labReportRepository.findById(id).map(existing -> {
            labReportRepository.delete(existing);
            auditService.log("DELETE", "LAB_REPORTS", existing.getReportUid(), "Deleted lab report " + existing.getTestName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== DIAGNOSTIC IMAGING ====================
    @GetMapping("/imaging")
    public List<DiagnosticImaging> getAllImaging() {
        return imagingRepository.findAllByOrderByScanDateDesc();
    }

    @PostMapping("/imaging")
    public DiagnosticImaging createImaging(@RequestBody DiagnosticImaging img) {
        if (img.getImagingUid() == null || img.getImagingUid().isBlank()) {
            img.setImagingUid("IMG-2026-" + (801 + imagingRepository.count()));
        }
        if (img.getScanDate() == null) {
            img.setScanDate(LocalDate.now());
        }
        if (img.getPatientId() != null) {
            patientRepository.findById(img.getPatientId()).ifPresent(p -> {
                img.setPatientName(p.getFullName());
                img.setPatientUid(p.getPatientUid());
            });
        }
        DiagnosticImaging saved = imagingRepository.save(img);
        auditService.log("CREATE", "IMAGING", saved.getImagingUid(), "Ordered " + saved.getModality() + " (" + saved.getBodyPart() + ") for " + saved.getPatientName());
        return saved;
    }

    @PutMapping("/imaging/{id}")
    public ResponseEntity<DiagnosticImaging> updateImaging(@PathVariable Long id, @RequestBody DiagnosticImaging updated) {
        return imagingRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            if (updated.getPatientId() != null) {
                patientRepository.findById(updated.getPatientId()).ifPresent(p -> {
                    existing.setPatientName(p.getFullName());
                    existing.setPatientUid(p.getPatientUid());
                });
            }
            existing.setOrderedByDoctorName(updated.getOrderedByDoctorName());
            existing.setModality(updated.getModality());
            existing.setBodyPart(updated.getBodyPart());
            existing.setFindings(updated.getFindings());
            existing.setImpression(updated.getImpression());
            existing.setStatus(updated.getStatus());
            existing.setRadiologistName(updated.getRadiologistName());
            existing.setScanDate(updated.getScanDate());
            existing.setCost(updated.getCost());
            DiagnosticImaging saved = imagingRepository.save(existing);
            auditService.log("UPDATE", "IMAGING", saved.getImagingUid(), "Updated imaging scan " + saved.getModality() + " [" + saved.getStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/imaging/{id}")
    public ResponseEntity<?> deleteImaging(@PathVariable Long id) {
        return imagingRepository.findById(id).map(existing -> {
            imagingRepository.delete(existing);
            auditService.log("DELETE", "IMAGING", existing.getImagingUid(), "Deleted imaging scan " + existing.getImagingUid());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== BILLING & INVOICES ====================
    @GetMapping("/invoices")
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllByOrderByBillingDateDesc();
    }

    @PostMapping("/invoices")
    public Invoice createInvoice(@RequestBody Invoice inv) {
        if (inv.getInvoiceUid() == null || inv.getInvoiceUid().isBlank()) {
            inv.setInvoiceUid("INV-2026-" + (901 + invoiceRepository.count()));
        }
        if (inv.getBillingDate() == null) {
            inv.setBillingDate(LocalDate.now());
        }
        if (inv.getPatientId() != null) {
            patientRepository.findById(inv.getPatientId()).ifPresent(p -> {
                inv.setPatientName(p.getFullName());
                inv.setPatientUid(p.getPatientUid());
            });
        }
        recalculateInvoiceTotals(inv);
        Invoice saved = invoiceRepository.save(inv);
        auditService.log("CREATE", "BILLING", saved.getInvoiceUid(), "Generated invoice for " + saved.getPatientName() + " (Total: Rs." + saved.getTotalAmount() + ")");
        return saved;
    }

    @PutMapping("/invoices/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice updated) {
        return invoiceRepository.findById(id).map(existing -> {
            existing.setPatientId(updated.getPatientId());
            existing.setPatientName(updated.getPatientName());
            existing.setPatientUid(updated.getPatientUid());
            if (updated.getPatientId() != null) {
                patientRepository.findById(updated.getPatientId()).ifPresent(p -> {
                    existing.setPatientName(p.getFullName());
                    existing.setPatientUid(p.getPatientUid());
                });
            }
            existing.setBillingCategory(updated.getBillingCategory());
            existing.setServiceDepartment(updated.getServiceDepartment());
            existing.setDescription(updated.getDescription());
            existing.setSubtotal(updated.getSubtotal());
            existing.setDiscount(updated.getDiscount());
            existing.setTaxAmount(updated.getTaxAmount());
            existing.setPaidAmount(updated.getPaidAmount());
            existing.setPaymentMethod(updated.getPaymentMethod());
            existing.setBillingDate(updated.getBillingDate());
            existing.setRemarks(updated.getRemarks());
            recalculateInvoiceTotals(existing);
            if ("CANCELLED".equals(updated.getPaymentStatus())) {
                existing.setPaymentStatus("CANCELLED");
            }
            Invoice saved = invoiceRepository.save(existing);
            auditService.log("UPDATE", "BILLING", saved.getInvoiceUid(), "Updated invoice for " + saved.getPatientName() + " [" + saved.getPaymentStatus() + "]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void recalculateInvoiceTotals(Invoice inv) {
        double total = Math.max(0, inv.getSubtotal() - inv.getDiscount() + inv.getTaxAmount());
        inv.setTotalAmount(total);
        double balance = Math.max(0, total - inv.getPaidAmount());
        inv.setBalanceAmount(balance);
        if (balance <= 0.01 && total > 0) {
            inv.setPaymentStatus("PAID");
        } else if (inv.getPaidAmount() > 0) {
            inv.setPaymentStatus("PARTIAL");
        } else {
            inv.setPaymentStatus("PENDING");
        }
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable Long id) {
        return invoiceRepository.findById(id).map(existing -> {
            invoiceRepository.delete(existing);
            auditService.log("DELETE", "BILLING", existing.getInvoiceUid(), "Deleted invoice " + existing.getInvoiceUid());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== PHARMACY & INVENTORY ====================
    @GetMapping("/pharmacy")
    public List<PharmacyItem> getAllPharmacyItems() {
        return pharmacyRepository.findAllByOrderByMedicineNameAsc();
    }

    @PostMapping("/pharmacy")
    public PharmacyItem createPharmacyItem(@RequestBody PharmacyItem item) {
        if (item.getItemCode() == null || item.getItemCode().isBlank()) {
            item.setItemCode("PHM-" + (101 + pharmacyRepository.count()));
        }
        PharmacyItem saved = pharmacyRepository.save(item);
        auditService.log("CREATE", "PHARMACY", saved.getItemCode(), "Added medicine/implant: " + saved.getMedicineName());
        return saved;
    }

    @PutMapping("/pharmacy/{id}")
    public ResponseEntity<PharmacyItem> updatePharmacyItem(@PathVariable Long id, @RequestBody PharmacyItem updated) {
        return pharmacyRepository.findById(id).map(existing -> {
            existing.setItemCode(updated.getItemCode());
            existing.setMedicineName(updated.getMedicineName());
            existing.setGenericName(updated.getGenericName());
            existing.setCategory(updated.getCategory());
            existing.setManufacturer(updated.getManufacturer());
            existing.setBatchNumber(updated.getBatchNumber());
            existing.setExpiryDate(updated.getExpiryDate());
            existing.setStockQuantity(updated.getStockQuantity());
            existing.setReorderLevel(updated.getReorderLevel());
            existing.setUnitPrice(updated.getUnitPrice());
            existing.setRackLocation(updated.getRackLocation());
            PharmacyItem saved = pharmacyRepository.save(existing);
            auditService.log("UPDATE", "PHARMACY", saved.getItemCode(), "Updated inventory item: " + saved.getMedicineName() + " (Stock: " + saved.getStockQuantity() + ")");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/pharmacy/{id}")
    public ResponseEntity<?> deletePharmacyItem(@PathVariable Long id) {
        return pharmacyRepository.findById(id).map(existing -> {
            pharmacyRepository.delete(existing);
            auditService.log("DELETE", "PHARMACY", existing.getItemCode(), "Deleted inventory item: " + existing.getMedicineName());
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }
}
