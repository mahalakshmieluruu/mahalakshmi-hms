package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.DiagnosticImaging;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiagnosticImagingRepository extends JpaRepository<DiagnosticImaging, Long> {
    List<DiagnosticImaging> findByPatientIdOrderByScanDateDesc(Long patientId);
    List<DiagnosticImaging> findAllByOrderByScanDateDesc();
}
