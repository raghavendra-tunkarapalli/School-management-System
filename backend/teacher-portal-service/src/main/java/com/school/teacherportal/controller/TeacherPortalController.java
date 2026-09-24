package com.school.teacherportal.controller;

import com.school.teacherportal.entity.AcademicSchedule;
import com.school.teacherportal.entity.TeacherEntity;
import com.school.teacherportal.entity.TeacherProfile;
import com.school.teacherportal.repository.AcademicScheduleRepository;
import com.school.teacherportal.repository.TeacherProfileRepository;
import com.school.teacherportal.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/teacher-portal")
public class TeacherPortalController {

    private final TeacherProfileRepository profileRepository;
    private final AcademicScheduleRepository scheduleRepository;
    private final TeacherRepository teacherRepository;

    public TeacherPortalController(TeacherProfileRepository profileRepository,
                                  AcademicScheduleRepository scheduleRepository,
                                  TeacherRepository teacherRepository) {
        this.profileRepository = profileRepository;
        this.scheduleRepository = scheduleRepository;
        this.teacherRepository = teacherRepository;
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<TeacherProfile> getTeacherProfile(@PathVariable String username) {
        Optional<TeacherProfile> opt = profileRepository.findByUsername(username);
        TeacherProfile profile;

        if (opt.isPresent()) {
            profile = opt.get();
        } else {
            profile = new TeacherProfile(
                    20L,
                    username,
                    username.contains("@") ? username : username + "@school.com",
                    "Robert",
                    "Vance",
                    "Mathematics & Physics",
                    "CONFIRMED"
            );
            profile = profileRepository.save(profile);
        }

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/profile")
    public ResponseEntity<TeacherProfile> updateTeacherProfile(@RequestBody TeacherProfile profile) {
        TeacherProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // TEACHER SCHEDULE ENDPOINTS (MySQL)
    // ==========================================

    @GetMapping("/schedule")
    public ResponseEntity<List<AcademicSchedule>> getSchedule(@RequestParam(required = false) String teacherName) {
        if (teacherName != null && !teacherName.isBlank()) {
            List<AcademicSchedule> list = scheduleRepository.findByTeacherNameContainingIgnoreCase(teacherName);
            if (!list.isEmpty()) {
                return ResponseEntity.ok(list);
            }
        }
        return ResponseEntity.ok(scheduleRepository.findAll());
    }

    @PostMapping("/schedule")
    public ResponseEntity<AcademicSchedule> saveSchedule(@RequestBody AcademicSchedule schedule) {
        AcademicSchedule saved = scheduleRepository.save(schedule);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/schedule/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Schedule item deleted successfully"));
    }

    // ==========================================
    // TEACHERS TABLE ENDPOINTS (MySQL)
    // ==========================================

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherEntity>> getAllTeacherSubjects() {
        return ResponseEntity.ok(teacherRepository.findAll());
    }

    @GetMapping("/teachers/user/{username}")
    public ResponseEntity<List<TeacherEntity>> getTeacherSubjects(@PathVariable String username) {
        List<TeacherEntity> list = teacherRepository.findByUsername(username);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/teachers")
    public ResponseEntity<TeacherEntity> saveTeacherSubject(@RequestBody TeacherEntity entity) {
        TeacherEntity saved = teacherRepository.save(entity);

        // Recalculate number_of_subjects count for this teacher
        List<TeacherEntity> teacherRows = teacherRepository.findByUsername(saved.getUsername());
        int count = teacherRows.size();

        for (TeacherEntity row : teacherRows) {
            row.setNumberOfSubjects(count);
            teacherRepository.save(row);
        }

        saved.setNumberOfSubjects(count);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacherSubject(@PathVariable Long id) {
        Optional<TeacherEntity> opt = teacherRepository.findById(id);
        if (opt.isPresent()) {
            String username = opt.get().getUsername();
            teacherRepository.deleteById(id);

            List<TeacherEntity> remaining = teacherRepository.findByUsername(username);
            int count = remaining.size();
            for (TeacherEntity row : remaining) {
                row.setNumberOfSubjects(count);
                teacherRepository.save(row);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Teacher subject entry deleted successfully"));
    }
}
