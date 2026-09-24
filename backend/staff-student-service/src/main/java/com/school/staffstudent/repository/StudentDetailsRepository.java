package com.school.staffstudent.repository;

import com.school.staffstudent.entity.StudentDetailsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentDetailsRepository extends JpaRepository<StudentDetailsEntity, Long> {
    List<StudentDetailsEntity> findByClassStandardAndSectionName(Integer classStandard, String sectionName);
    List<StudentDetailsEntity> findByClassStandard(Integer classStandard);
    List<StudentDetailsEntity> findBySectionName(String sectionName);
    boolean existsByStudentId(String studentId);
    Optional<StudentDetailsEntity> findByStudentId(String studentId);
}
