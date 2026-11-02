package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.OrthopaedicCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrthopaedicCaseRepository extends JpaRepository<OrthopaedicCase, Long> {
    List<OrthopaedicCase> findByPatientIdOrderByEvaluationDateDesc(Long patientId);
    List<OrthopaedicCase> findAllByOrderByEvaluationDateDesc();
}
