package com.school.admission.repository;

import com.school.admission.entity.StudentAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentAdmissionRepository extends JpaRepository<StudentAdmission, Long> {
    Optional<StudentAdmission> findByAdmissionId(String admissionId);
    boolean existsByAdmissionId(String admissionId);
    boolean existsByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    Optional<StudentAdmission> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
}
