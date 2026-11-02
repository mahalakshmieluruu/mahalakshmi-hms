package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientIdOrderByBillingDateDesc(Long patientId);
    List<Invoice> findAllByOrderByBillingDateDesc();
}
