package com.school.staffenquiry.controller;

import com.school.staffenquiry.dto.StaffEnquiryDTO;
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
@RequestMapping("/api/staff/enquiries")
@CrossOrigin(origins = "*")
public class StaffEnquiryController {

    private final RestTemplate restTemplate;

    public StaffEnquiryController() {
        this.restTemplate = new RestTemplate();
    }

    @GetMapping
    public ResponseEntity<List<StaffEnquiryDTO>> getAllEnquiries() {
        List<StaffEnquiryDTO> aggregatedList = new ArrayList<>();

        // 1. Fetch Student Enquiries from student-enquire-service (Port 8083)
        try {
            List<Map<String, Object>> studentEnquiries = restTemplate.getForObject("http://localhost:8083/api/enquiries", List.class);
            if (studentEnquiries != null) {
                for (Map<String, Object> item : studentEnquiries) {
                    StaffEnquiryDTO dto = new StaffEnquiryDTO();
                    dto.setId(item.get("id") != null ? Long.valueOf(item.get("id").toString()) : null);
                    dto.setEnquireId(item.get("enquireId") != null ? item.get("enquireId").toString() : null);
                    dto.setFirstName(item.get("firstName") != null ? item.get("firstName").toString() : "");
                    dto.setLastName(item.get("lastName") != null ? item.get("lastName").toString() : "");
                    dto.setEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : "");
                    dto.setParentName(item.get("parentName") != null ? item.get("parentName").toString() : "");
                    dto.setParentEmail(item.get("parentEmail") != null ? item.get("parentEmail").toString() : "");
                    dto.setChildName(dto.getFirstName() + " " + dto.getLastName());
                    dto.setClassName(item.get("className") != null ? item.get("className").toString() : "");
                    dto.setEnquire(item.get("enquire") != null ? item.get("enquire").toString() : "");
                    
                    Object respObj = item.get("response") != null ? item.get("response") : item.get("adminResponse");
                    dto.setResponse(respObj != null ? respObj.toString() : null);
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : (dto.getResponse() != null ? "RESPONDED" : "PENDING"));
                    dto.setApplicantType("STUDENT");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch from student-enquire-service: " + e.getMessage());
        }

        // 2. Fetch Parent Enquiries from parent-enquiry-service (Port 8084)
        try {
            List<Map<String, Object>> parentEnquiries = restTemplate.getForObject("http://localhost:8084/api/parent-enquiries", List.class);
            if (parentEnquiries != null) {
                for (Map<String, Object> item : parentEnquiries) {
                    StaffEnquiryDTO dto = new StaffEnquiryDTO();
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
                    
                    Object respObj = item.get("response") != null ? item.get("response") : item.get("adminResponse");
                    dto.setResponse(respObj != null ? respObj.toString() : null);
                    dto.setStatus(item.get("status") != null ? item.get("status").toString() : (dto.getResponse() != null ? "RESPONDED" : "PENDING"));
                    dto.setApplicantType("PARENT");
                    dto.setCreatedAt(item.get("createdAt") != null ? item.get("createdAt").toString() : null);
                    aggregatedList.add(dto);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not fetch from parent-enquiry-service: " + e.getMessage());
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
            return ResponseEntity.ok(Map.of("message", "Staff response sent to student enquiry successfully and marked as RESPONDED"));
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
            return ResponseEntity.ok(Map.of("message", "Staff response sent to parent enquiry successfully and marked as RESPONDED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to send response: " + e.getMessage()));
        }
    }
}
