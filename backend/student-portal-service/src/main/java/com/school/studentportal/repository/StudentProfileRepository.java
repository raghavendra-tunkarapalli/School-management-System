package com.school.studentportal.repository;

import com.school.studentportal.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUsername(String username);
    Optional<StudentProfile> findByEmail(String email);
}
