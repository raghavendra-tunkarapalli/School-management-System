package com.school.attendance.controller;

import com.school.attendance.entity.StudentAttendance;
import com.school.attendance.repository.StudentAttendanceRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/teacher-attendance")
@CrossOrigin(origins = "*")
public class TeacherAttendanceController {

    private final StudentAttendanceRepository attendanceRepository;
    private final RestTemplate restTemplate;

    public TeacherAttendanceController(StudentAttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Fetches the enrolled student list from the staff-student-service
     */
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam Integer classStandard,
            @RequestParam String sectionName) {
        try {
            String url = "http://localhost:8093/api/staff-student/students?classStandard=" + classStandard + "&sectionName=" + sectionName;
            List<?> students = restTemplate.getForObject(url, List.class);
            return ResponseEntity.ok(students != null ? students : Collections.emptyList());
        } catch (Exception e) {
            System.err.println("Error calling staff-student-service: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Could not connect to student directory service. " + e.getMessage());
        }
    }

    /**
     * Fetches saved attendance records for a class, section, and date
     */
    @GetMapping("/records")
    public ResponseEntity<List<StudentAttendance>> getAttendanceRecords(
            @RequestParam Integer classStandard,
            @RequestParam String sectionName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<StudentAttendance> records = attendanceRepository.findByClassStandardAndSectionNameAndAttendanceDate(classStandard, sectionName, date);
        return ResponseEntity.ok(records);
    }

    /**
     * Saves or updates a list of student attendance records
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveAttendance(@RequestBody List<StudentAttendance> records) {
        if (records == null || records.isEmpty()) {
            return ResponseEntity.badRequest().body("No attendance records provided to save");
        }

        List<StudentAttendance> savedRecords = new ArrayList<>();
        for (StudentAttendance record : records) {
            if (record.getStudentId() == null || record.getAttendanceDate() == null) {
                continue;
            }

            Optional<StudentAttendance> existing = attendanceRepository.findByStudentIdAndAttendanceDate(
                    record.getStudentId(), record.getAttendanceDate());

            if (existing.isPresent()) {
                StudentAttendance dbRecord = existing.get();
                dbRecord.setStatus(record.getStatus());
                dbRecord.setStudentName(record.getStudentName());
                dbRecord.setParentName(record.getParentName());
                dbRecord.setClassStandard(record.getClassStandard());
                dbRecord.setSectionName(record.getSectionName());
                savedRecords.add(attendanceRepository.save(dbRecord));
            } else {
                savedRecords.add(attendanceRepository.save(record));
            }
        }

        return ResponseEntity.ok(Map.of(
            "message", "Attendance saved successfully",
            "count", savedRecords.size()
        ));
    }

    /**
     * Fetches monthly attendance records for a class standard and section
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<StudentAttendance>> getMonthlyAttendance(
            @RequestParam Integer classStandard,
            @RequestParam String sectionName,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<StudentAttendance> records = attendanceRepository.findByClassStandardAndSectionNameAndAttendanceDateBetween(
                classStandard, sectionName, startDate, endDate);
        return ResponseEntity.ok(records);
    }

    /**
     * Fetches monthly attendance records for a specific student
     */
    @GetMapping("/student-monthly")
    public ResponseEntity<List<StudentAttendance>> getStudentMonthlyAttendance(
            @RequestParam String studentId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<StudentAttendance> records = attendanceRepository.findByStudentIdAndAttendanceDateBetween(
                studentId, startDate, endDate);
        return ResponseEntity.ok(records);
    }
}
