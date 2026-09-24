package com.school.enquire.controller;

import com.school.enquire.dto.EnquiryRequest;
import com.school.enquire.dto.EnquiryResponse;
import com.school.enquire.entity.StudentEnquiry;
import com.school.enquire.repository.StudentEnquiryRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "*")
public class StudentEnquireController {

    private final StudentEnquiryRepository enquiryRepository;

    public StudentEnquireController(StudentEnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitEnquiry(@Valid @RequestBody EnquiryRequest request) {
        try {
            // Server-side window deduplication (10 seconds)
            Optional<StudentEnquiry> recent = enquiryRepository.findTopByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEnquireOrderByCreatedAtDesc(
                request.getFirstName(), request.getLastName(), request.getEnquire()
            );

            if (recent.isPresent()) {
                StudentEnquiry existing = recent.get();
                if (existing.getCreatedAt() != null && existing.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(10))) {
                    EnquiryResponse existingResponse = new EnquiryResponse(
                        existing.getId(),
                        existing.getEnquireId(),
                        existing.getFirstName(),
                        existing.getLastName(),
                        existing.getParentName(),
                        existing.getParentEmail(),
                        existing.getClassName(),
                        existing.getEnquire(),
                        existing.getResponse(),
                        existing.getResponse(),
                        existing.getStatus() != null ? existing.getStatus() : "PENDING",
                        existing.getCreatedAt(),
                        "Student enquiry submitted successfully! (Enquiry ID: " + existing.getEnquireId() + ")"
                    );
                    return ResponseEntity.status(HttpStatus.OK).body(existingResponse);
                }
            }

            String uniqueEnquireId = generateUniqueEnquireId();

            StudentEnquiry enquiry = new StudentEnquiry(
                uniqueEnquireId,
                request.getFirstName(),
                request.getLastName(),
                request.getParentName(),
                request.getParentEmail(),
                request.getClassName(),
                request.getEnquire()
            );

            StudentEnquiry saved = enquiryRepository.save(enquiry);

            EnquiryResponse response = new EnquiryResponse(
                saved.getId(),
                saved.getEnquireId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getParentName(),
                saved.getParentEmail(),
                saved.getClassName(),
                saved.getEnquire(),
                saved.getResponse(),
                saved.getResponse(),
                saved.getStatus() != null ? saved.getStatus() : "PENDING",
                saved.getCreatedAt(),
                "Student enquiry submitted successfully! (Enquiry ID: " + saved.getEnquireId() + ")"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to submit student enquiry: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<EnquiryResponse>> getAllEnquiries() {
        List<StudentEnquiry> list = enquiryRepository.findAll();
        List<EnquiryResponse> dtos = list.stream()
            .map(e -> new EnquiryResponse(
                e.getId(),
                e.getEnquireId(),
                e.getFirstName(),
                e.getLastName(),
                e.getParentName(),
                e.getParentEmail(),
                e.getClassName(),
                e.getEnquire(),
                e.getResponse(),
                e.getResponse(),
                e.getStatus() != null ? e.getStatus() : "PENDING",
                e.getCreatedAt(),
                "Fetched successfully"
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/response")
    public ResponseEntity<?> respondToEnquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<StudentEnquiry> optional = enquiryRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student enquiry not found."));
        }
        String responseText = body.get("response");
        StudentEnquiry enquiry = optional.get();
        enquiry.setResponse(responseText);
        enquiry.setStatus("RESPONDED");
        StudentEnquiry saved = enquiryRepository.save(enquiry);

        EnquiryResponse response = new EnquiryResponse(
            saved.getId(),
            saved.getEnquireId(),
            saved.getFirstName(),
            saved.getLastName(),
            saved.getParentName(),
            saved.getParentEmail(),
            saved.getClassName(),
            saved.getEnquire(),
            saved.getResponse(),
            saved.getResponse(),
            saved.getStatus(),
            saved.getCreatedAt(),
            "Official response saved successfully and enquiry marked as RESPONDED"
        );
        return ResponseEntity.ok(response);
    }

    private String generateUniqueEnquireId() {
        Random random = new Random();
        String candidateId;
        do {
            int number = 10000 + random.nextInt(90000);
            candidateId = "ENQ-" + number;
        } while (enquiryRepository.existsByEnquireId(candidateId));
        return candidateId;
    }
}
