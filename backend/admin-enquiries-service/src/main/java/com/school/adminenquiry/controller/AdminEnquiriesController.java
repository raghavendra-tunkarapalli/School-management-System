package com.school.adminenquiry.controller;

import com.school.adminenquiry.dto.EnquiryRecordDTO;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/enquiries")
@CrossOrigin(origins = "*")
public class AdminEnquiriesController {

    private final RestTemplate restTemplate;

    public AdminEnquiriesController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping
    public ResponseEntity<List<EnquiryRecordDTO>> getAllEnquiries() {
        List<EnquiryRecordDTO> aggregatedList = new ArrayList<>();

        // 1. Fetch Student Enquiries from student-enquire-service (Port 8083)
        try {
            List<Map<String, Object>> studentEnquiries = restTemplate.getForObject("http://localhost:8083/api/enquiries", List.class);
            if (studentEnquiries != null) {
                for (Map<String, Object> item : studentEnquiries) {
                    EnquiryRecordDTO dto = new EnquiryRecordDTO();
                    dto.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);
                    dto.setEnquireId(item.get("enquireId") != null ? item.get("enquireId").toString() : null);
                    dto.setFirstName(item.get("firstName") != null ? item.get("firstName").toString() : "");
                    dto.setLastName(item.get("lastName") != null ? item.get("lastName").toString() : "");
                    dto.setEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : (item.get("email") != null ? item.get("email").toString() : ""));
                    dto.setParentName(item.get("parentName") != null ? item.get("parentName").toString() : "");
                    dto.setParentEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : "");
                    dto.setChildName(dto.getFirstName() + " " + dto.getLastName());
                    dto.setClassName(item.get("className") != null ? item.get("className").toString() : "");
                    dto.setEnquire(item.get("enquire") != null ? item.get("enquire").toString() : "");
                    dto.setAdminResponse(item.get("adminResponse") != null ? item.get("adminResponse").toString() : null);
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : (dto.getAdminResponse() != null ? "RESPONDED" : "PENDING"));
                    dto.setApplicantType("STUDENT");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch student enquiries: " + e.getMessage());
        }

        // 2. Fetch Parent Enquiries from parent-enquiry-service (Port 8084)
        try {
            List<Map<String, Object>> parentEnquiries = restTemplate.getForObject("http://localhost:8084/api/parent-enquiries", List.class);
            if (parentEnquiries != null) {
                for (Map<String, Object> item : parentEnquiries) {
                    EnquiryRecordDTO dto = new EnquiryRecordDTO();
                    dto.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);
                    dto.setEnquireId(item.get("enquireId") != null ? item.get("enquireId").toString() : null);
                    dto.setFirstName(item.get("firstName") != null ? item.get("firstName").toString() : "");
                    dto.setLastName(item.get("lastName") != null ? item.get("lastName").toString() : "");
                    dto.setEmail(item.get("email") != null ? item.get("email").toString() : "");
                    dto.setParentName(item.get("parentName") != null ? item.get("parentName").toString() : (dto.getFirstName() + " " + dto.getLastName()));
                    dto.setParentEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : dto.getEmail());
                    dto.setChildName(item.get("childName") != null ? item.get("childName").toString() : "");
                    dto.setClassName(item.get("className") != null ? item.get("className").toString() : "");
                    dto.setEnquire(item.get("enquire") != null ? item.get("enquire").toString() : "");
                    dto.setAdminResponse(item.get("adminResponse") != null ? item.get("adminResponse").toString() : null);
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : (dto.getAdminResponse() != null ? "RESPONDED" : "PENDING"));
                    dto.setApplicantType("PARENT");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch parent enquiries: " + e.getMessage());
        }

        return ResponseEntity.ok(aggregatedList);
    }

    @PutMapping("/student/{id}/response")
    public ResponseEntity<?> respondToStudentEnquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
            restTemplate.exchange("http://localhost:8083/api/enquiries/" + id + "/response", HttpMethod.PUT, requestEntity, String.class);
            return ResponseEntity.ok(Map.of("message", "Response sent to student enquiry successfully and marked as RESPONDED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send response: " + e.getMessage()));
        }
    }

    @PutMapping("/parent/{id}/response")
    public ResponseEntity<?> respondToParentEnquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(body, headers);
            restTemplate.exchange("http://localhost:8084/api/parent-enquiries/" + id + "/response", HttpMethod.PUT, requestEntity, String.class);
            return ResponseEntity.ok(Map.of("message", "Response sent to parent enquiry successfully and marked as RESPONDED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send response: " + e.getMessage()));
        }
    }
}
