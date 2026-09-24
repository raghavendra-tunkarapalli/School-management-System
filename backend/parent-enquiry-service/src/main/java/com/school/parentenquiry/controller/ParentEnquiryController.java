package com.school.parentenquiry.controller;

import com.school.parentenquiry.dto.ParentEnquiryRequest;
import com.school.parentenquiry.dto.ParentEnquiryResponse;
import com.school.parentenquiry.entity.ParentEnquiry;
import com.school.parentenquiry.repository.ParentEnquiryRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parent-enquiries")
@CrossOrigin(origins = "*")
public class ParentEnquiryController {

    private final ParentEnquiryRepository repository;

    public ParentEnquiryController(ParentEnquiryRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> submitParentEnquiry(@Valid @RequestBody ParentEnquiryRequest request) {
        try {
            // Server-side deduplication window (10 seconds)
            Optional<ParentEnquiry> recentEnquiry = repository.findTopByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndEnquireOrderByCreatedAtDesc(
                request.getFirstName(), request.getLastName(), request.getEnquire()
            );

            if (recentEnquiry.isPresent()) {
                ParentEnquiry recent = recentEnquiry.get();
                if (recent.getCreatedAt() != null && recent.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(10))) {
                    ParentEnquiryResponse cleanResponse = new ParentEnquiryResponse(
                        recent.getId(),
                        recent.getEnquireId(),
                        recent.getFirstName(),
                        recent.getLastName(),
                        recent.getEmail(),
                        recent.getParentName(),
                        recent.getParentEmail(),
                        recent.getChildName(),
                        recent.getClassName(),
                        recent.getEnquire(),
                        recent.getResponse(),
                        recent.getResponse(),
                        recent.getStatus() != null ? recent.getStatus() : "PENDING",
                        recent.getCreatedAt(),
                        "Parent enquiry submitted successfully! (Enquiry ID: " + recent.getEnquireId() + ")"
                    );
                    return ResponseEntity.status(HttpStatus.OK).body(cleanResponse);
                }
            }

            String uniqueEnquireId = generateUniqueEnquireId();

            String parentName = request.getFirstName() + " " + request.getLastName();
            String parentEmail = request.getEmail();

            ParentEnquiry enquiry = new ParentEnquiry(
                uniqueEnquireId,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                parentName,
                parentEmail,
                request.getChildName(),
                request.getClassName(),
                request.getEnquire()
            );

            ParentEnquiry saved = repository.save(enquiry);

            ParentEnquiryResponse response = new ParentEnquiryResponse(
                saved.getId(),
                saved.getEnquireId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                saved.getParentName(),
                saved.getParentEmail(),
                saved.getChildName(),
                saved.getClassName(),
                saved.getEnquire(),
                saved.getResponse(),
                saved.getResponse(),
                saved.getStatus() != null ? saved.getStatus() : "PENDING",
                saved.getCreatedAt(),
                "Parent enquiry submitted successfully! (Enquiry ID: " + saved.getEnquireId() + ")"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to submit parent enquiry: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<ParentEnquiryResponse>> getAllParentEnquiries() {
        List<ParentEnquiry> list = repository.findAll();
        List<ParentEnquiryResponse> dtos = list.stream()
            .map(e -> new ParentEnquiryResponse(
                e.getId(),
                e.getEnquireId(),
                e.getFirstName(),
                e.getLastName(),
                e.getEmail(),
                e.getParentName(),
                e.getParentEmail(),
                e.getChildName(),
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
    public ResponseEntity<?> respondToParentEnquiry(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<ParentEnquiry> optional = repository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parent enquiry not found."));
        }
        String responseText = body.get("response");
        ParentEnquiry enquiry = optional.get();
        enquiry.setResponse(responseText);
        enquiry.setStatus("RESPONDED");
        ParentEnquiry saved = repository.save(enquiry);

        ParentEnquiryResponse response = new ParentEnquiryResponse(
            saved.getId(),
            saved.getEnquireId(),
            saved.getFirstName(),
            saved.getLastName(),
            saved.getEmail(),
            saved.getParentName(),
            saved.getParentEmail(),
            saved.getChildName(),
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
            candidateId = "PENQ-" + number;
        } while (repository.existsByEnquireId(candidateId));
        return candidateId;
    }
}
