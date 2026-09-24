package com.school.adminadmission.controller;

import com.school.adminadmission.dto.AdmissionRecordDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/admissions")
@CrossOrigin(origins = "*")
public class AdminAdmissionsController {

    private final RestTemplate restTemplate;

    public AdminAdmissionsController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping
    public ResponseEntity<List<AdmissionRecordDTO>> getAllAdmissions() {
        List<AdmissionRecordDTO> aggregatedList = new ArrayList<>();

        // 1. Fetch Student Admissions from admission-service (Port 8082 - student_admission table)
        try {
            List<Map<String, Object>> studentAdmissions = restTemplate.getForObject("http://localhost:8082/api/admissions/student", List.class);
            if (studentAdmissions != null) {
                for (Map<String, Object> item : studentAdmissions) {
                    AdmissionRecordDTO dto = new AdmissionRecordDTO();
                    dto.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);
                    dto.setAdmissionId(item.get("admissionId") != null ? item.get("admissionId").toString() : null);
                    dto.setFirstName(item.get("firstName") != null ? item.get("firstName").toString() : "");
                    dto.setLastName(item.get("lastName") != null ? item.get("lastName").toString() : "");
                    dto.setChildName(dto.getFirstName() + " " + dto.getLastName());
                    dto.setClassName(item.get("className") != null ? item.get("className").toString() : "");
                    dto.setParentName(item.get("parentName") != null ? item.get("parentName").toString() : "");
                    dto.setParentEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : "");
                    dto.setApplicantType("STUDENT");
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : "PENDING");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch student admissions: " + e.getMessage());
        }

        // 2. Fetch Parent Admissions from admission-service (Port 8082 - parent_admission table)
        try {
            List<Map<String, Object>> parentAdmissions = restTemplate.getForObject("http://localhost:8082/api/admissions/parent", List.class);
            if (parentAdmissions != null) {
                for (Map<String, Object> item : parentAdmissions) {
                    AdmissionRecordDTO dto = new AdmissionRecordDTO();
                    dto.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);
                    dto.setAdmissionId(item.get("admissionId") != null ? item.get("admissionId").toString() : null);
                    dto.setFirstName(item.get("firstName") != null ? item.get("firstName").toString() : "");
                    dto.setLastName(item.get("lastName") != null ? item.get("lastName").toString() : "");
                    dto.setChildName(item.get("childName") != null ? item.get("childName").toString() : "");
                    dto.setClassName(item.get("className") != null ? item.get("className").toString() : "");
                    dto.setParentName(dto.getFirstName() + " " + dto.getLastName());
                    dto.setParentEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : (item.get("email") != null ? item.get("email").toString() : ""));
                    dto.setApplicantType("PARENT");
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : "PENDING");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch parent admissions: " + e.getMessage());
        }

        return ResponseEntity.ok(aggregatedList);
    }

    @PutMapping("/student/{id}/status")
    public ResponseEntity<?> updateStudentStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String admissionId) {
        try {
            if (admissionId != null && !admissionId.trim().isEmpty()) {
                restTemplate.put("http://localhost:8082/api/admissions/by-admission-id/" + admissionId + "/status?status=" + status, null);
            } else {
                restTemplate.put("http://localhost:8082/api/admissions/student/" + id + "/status?status=" + status, null);
            }
            
            notifyStudentPortal(status);
            return ResponseEntity.ok(Map.of("message", "Student admission status updated to " + status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update student admission status: " + e.getMessage()));
        }
    }

    @PutMapping("/parent/{id}/status")
    public ResponseEntity<?> updateParentStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) String admissionId) {
        try {
            if (admissionId != null && !admissionId.trim().isEmpty()) {
                restTemplate.put("http://localhost:8082/api/admissions/by-admission-id/" + admissionId + "/status?status=" + status, null);
            } else {
                restTemplate.put("http://localhost:8082/api/admissions/parent/" + id + "/status?status=" + status, null);
            }

            notifyStudentPortal(status);
            return ResponseEntity.ok(Map.of("message", "Parent admission status updated to " + status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update parent admission status: " + e.getMessage()));
        }
    }

    private void notifyStudentPortal(String status) {
        String targetStatus = "ACCEPTED".equalsIgnoreCase(status) ? "CONFIRMED" : "REJECTED".equalsIgnoreCase(status) ? "REJECTED" : "PENDING";
        String[] studentUsernames = {"student12", "student_gmail", "student", "alex", "student1", "student2"};
        for (String uname : studentUsernames) {
            try {
                restTemplate.put("http://localhost:8090/api/student-portal/status/" + uname + "?status=" + targetStatus, null);
            } catch (Exception ignored) {
            }
        }
    }
}
