package com.school.schedule.repository;

import com.school.schedule.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByClassStandardAndSectionIdAndScheduleDate(Integer classStandard, Integer sectionId, String scheduleDate);
}
