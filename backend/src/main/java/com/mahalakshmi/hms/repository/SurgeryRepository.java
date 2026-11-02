package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.Surgery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SurgeryRepository extends JpaRepository<Surgery, Long> {
    List<Surgery> findByPatientIdOrderByScheduledDateDesc(Long patientId);
    List<Surgery> findAllByOrderByScheduledDateDesc();
}
