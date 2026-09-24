package com.school.enquire.repository;

import com.school.enquire.entity.StudentEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentEnquiryRepository extends JpaRepository<StudentEnquiry, Long> {
    Optional<StudentEnquiry> findByEnquireId(String enquireId);
    boolean existsByEnquireId(String enquireId);
    Optional<StudentEnquiry> findTopByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEnquireOrderByCreatedAtDesc(String firstName, String lastName, String enquire);
}
