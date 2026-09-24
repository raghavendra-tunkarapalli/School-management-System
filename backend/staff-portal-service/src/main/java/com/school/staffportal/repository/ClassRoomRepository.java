package com.school.staffportal.repository;

import com.school.staffportal.entity.ClassRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoomEntity, Long> {

    Optional<ClassRoomEntity> findByClassCode(String classCode);

    List<ClassRoomEntity> findByClassStandard(Integer classStandard);
}
