package com.mahalakshmi.hms.repository;

import com.mahalakshmi.hms.model.WardBed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WardBedRepository extends JpaRepository<WardBed, Long> {
    List<WardBed> findAllByOrderByBedNumberAsc();
}
