package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    List<Admission> findByPatientIdOrderByAdmissionDateDesc(Long patientId);
    List<Admission> findAllByOrderByAdmissionDateDesc();
}
