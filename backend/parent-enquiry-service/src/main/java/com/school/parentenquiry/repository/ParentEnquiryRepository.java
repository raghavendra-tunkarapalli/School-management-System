package com.school.parentenquiry.repository;

import com.school.parentenquiry.entity.ParentEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentEnquiryRepository extends JpaRepository<ParentEnquiry, Long> {
    Optional<ParentEnquiry> findByEnquireId(String enquireId);
    boolean existsByEnquireId(String enquireId);
    Optional<ParentEnquiry> findTopByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEnquireOrderByCreatedAtDesc(String firstName, String lastName, String enquire);
}
