package com.school.teacherportal.repository;

import com.school.teacherportal.entity.TeacherEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<TeacherEntity, Long> {
    List<TeacherEntity> findByUsername(String username);
    List<TeacherEntity> findByUserId(String userId);
}
