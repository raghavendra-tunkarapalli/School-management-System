package com.school.staffportal.repository;

import com.school.staffportal.entity.ClassScheduleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassScheduleEntity, Long> {

    List<ClassScheduleEntity> findByClassStandardAndScheduleDate(Integer classStandard, String scheduleDate);

    List<ClassScheduleEntity> findByScheduleDate(String scheduleDate);

    Optional<ClassScheduleEntity> findByClassStandardAndSectionIdAndPeriodIndexAndScheduleDate(
            Integer classStandard, Integer sectionId, Integer periodIndex, String scheduleDate);
}
