package com.school.admission.repository;

import com.school.admission.entity.ParentAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentAdmissionRepository extends JpaRepository<ParentAdmission, Long> {
    Optional<ParentAdmission> findByAdmissionId(String admissionId);
    boolean existsByAdmissionId(String admissionId);
    boolean existsByEmailIgnoreCaseAndChildNameIgnoreCase(String email, String childName);
    Optional<ParentAdmission> findFirstByEmailIgnoreCaseAndChildNameIgnoreCase(String email, String childName);
}
