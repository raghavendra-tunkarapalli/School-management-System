package com.school.admission.repository;

import com.school.admission.entity.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByAdmissionId(String admissionId);
    boolean existsByAdmissionId(String admissionId);
    boolean existsByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    Optional<Admission> findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    List<Admission> findByParentEmailIgnoreCase(String parentEmail);
    long countByClassName(String className);
}
