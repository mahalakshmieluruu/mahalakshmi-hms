package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findAllByOrderByIdDesc();
}
