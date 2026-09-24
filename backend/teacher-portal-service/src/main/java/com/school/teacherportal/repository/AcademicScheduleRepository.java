package com.school.teacherportal.repository;

import com.school.teacherportal.entity.AcademicSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicScheduleRepository extends JpaRepository<AcademicSchedule, Long> {
    List<AcademicSchedule> findByTeacherNameContainingIgnoreCase(String teacherName);
}
