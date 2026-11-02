package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.EmergencyCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyCaseRepository extends JpaRepository<EmergencyCase, Long> {
    List<EmergencyCase> findAllByOrderByArrivalTimeDesc();
}
