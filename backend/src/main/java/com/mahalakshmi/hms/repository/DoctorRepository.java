package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
