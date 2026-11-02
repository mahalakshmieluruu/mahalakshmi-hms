package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabReportRepository extends JpaRepository<LabReport, Long> {
    List<LabReport> findByPatientIdOrderByOrderedDateDesc(Long patientId);
    List<LabReport> findAllByOrderByOrderedDateDesc();
}
