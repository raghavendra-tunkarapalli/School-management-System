package com.school.staffstudent.repository;

import com.school.staffstudent.entity.AdmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionEntityRepository extends JpaRepository<AdmissionEntity, Long> {
    List<AdmissionEntity> findByStatus(String status);
}
