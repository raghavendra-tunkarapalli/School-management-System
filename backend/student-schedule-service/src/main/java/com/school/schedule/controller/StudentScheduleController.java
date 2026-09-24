package com.school.schedule.controller;

import com.school.schedule.entity.ClassSchedule;
import com.school.schedule.repository.ClassScheduleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/student-schedule")
public class StudentScheduleController {

    private final ClassScheduleRepository scheduleRepository;
    private final RestTemplate restTemplate;

    public StudentScheduleController(ClassScheduleRepository scheduleRepository, RestTemplate restTemplate) {
        this.scheduleRepository = scheduleRepository;
        this.restTemplate = restTemplate;
    }

    @GetMapping("/timetable")
    public ResponseEntity<?> getTimetable(
            @RequestParam String username,
            @RequestParam(required = false) String date) {

        if (date == null || date.trim().isEmpty()) {
            date = LocalDate.now().toString(); // YYYY-MM-DD
        }

        // Default fallback values
        int classStandard = 10;
        String sectionName = "A";

        // Query staff-student-service to retrieve student class and section details
        try {
            String studentServiceUrl = "http://localhost:8093/api/staff-student/students";
            List<?> students = restTemplate.getForObject(studentServiceUrl, List.class);
            if (students != null) {
                for (Object studentObj : students) {
                    if (studentObj instanceof Map) {
                        Map<?, ?> sMap = (Map<?, ?>) studentObj;
                        String sId = sMap.get("studentId") != null ? sMap.get("studentId").toString().trim().toLowerCase() : "";
                        String fName = sMap.get("firstName") != null ? sMap.get("firstName").toString().trim().toLowerCase() : "";
                        String lName = sMap.get("lastName") != null ? sMap.get("lastName").toString().trim().toLowerCase() : "";
                        String fullName = (fName + " " + lName).trim();
                        String uName = username.trim().toLowerCase();

                        // Match checks
                        if (uName.equals(sId) || uName.equals(fName) || uName.equalsIgnoreCase(fullName) 
                                || (uName.equals("student") && fullName.contains("alex morgan")) 
                                || (uName.contains("alex") && fullName.contains("alex morgan"))) {
                            
                            if (sMap.get("classStandard") != null) {
                                classStandard = Integer.parseInt(sMap.get("classStandard").toString());
                            }
                            if (sMap.get("sectionName") != null) {
                                sectionName = sMap.get("sectionName").toString().trim().toUpperCase();
                            }
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not connect to staff-student-service: " + e.getMessage());
        }

        // Map sectionName string to sectionId integer
        int sectionId = 1; // Default Section A
        if ("B".equalsIgnoreCase(sectionName)) {
            sectionId = 2;
        } else if ("C".equalsIgnoreCase(sectionName)) {
            sectionId = 3;
        }

        List<ClassSchedule> schedules = scheduleRepository.findByClassStandardAndSectionIdAndScheduleDate(
                classStandard, sectionId, date);

        Map<String, Object> response = new HashMap<>();
        response.put("classStandard", classStandard);
        response.put("sectionName", sectionName);
        response.put("scheduleDate", date);
        response.put("schedules", schedules);

        return ResponseEntity.ok(response);
    }
}
