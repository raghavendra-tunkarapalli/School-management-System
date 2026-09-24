package com.school.admission.controller;

import com.school.admission.dto.AdmissionRequest;
import com.school.admission.dto.AdmissionResponse;
import com.school.admission.entity.Admission;
import com.school.admission.entity.ParentAdmission;
import com.school.admission.entity.StudentAdmission;
import com.school.admission.repository.AdmissionRepository;
import com.school.admission.repository.ParentAdmissionRepository;
import com.school.admission.repository.StudentAdmissionRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admissions")
@CrossOrigin(origins = "*")
public class AdmissionController {

    private final StudentAdmissionRepository studentAdmissionRepository;
    private final ParentAdmissionRepository parentAdmissionRepository;
    private final AdmissionRepository admissionRepository;

    public AdmissionController(StudentAdmissionRepository studentAdmissionRepository,
                               ParentAdmissionRepository parentAdmissionRepository,
                               AdmissionRepository admissionRepository) {
        this.studentAdmissionRepository = studentAdmissionRepository;
        this.parentAdmissionRepository = parentAdmissionRepository;
        this.admissionRepository = admissionRepository;
    }

    // ==========================================
    // UNIFIED ADMISSION TABLE (table: admissions)
    // Combines all student and parent admissions into 1 unique student admission table
    // ==========================================

    @GetMapping("/unified")
    public ResponseEntity<List<Admission>> getUnifiedAdmissions() {
        return ResponseEntity.ok(admissionRepository.findAll());
    }

    @PutMapping("/unified/{id}/status")
    public ResponseEntity<?> updateUnifiedAdmissionStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Admission> opt = admissionRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Admission record not found."));
        }
        Admission adm = opt.get();
        adm.setStatus(status.toUpperCase());
        Admission updated = admissionRepository.save(adm);

        // Sync with student_admission table by admissionId
        Optional<StudentAdmission> sOpt = studentAdmissionRepository.findByAdmissionId(adm.getAdmissionId());
        if (sOpt.isPresent()) {
            StudentAdmission s = sOpt.get();
            s.setStatus(status.toUpperCase());
            studentAdmissionRepository.save(s);
        }

        // Sync with parent_admission table by admissionId
        Optional<ParentAdmission> pOpt = parentAdmissionRepository.findByAdmissionId(adm.getAdmissionId());
        if (pOpt.isPresent()) {
            ParentAdmission p = pOpt.get();
            p.setStatus(status.toUpperCase());
            parentAdmissionRepository.save(p);
        }

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/by-admission-id/{admissionId}/status")
    public ResponseEntity<?> updateStatusByAdmissionId(@PathVariable String admissionId, @RequestParam String status) {
        String newStatus = status.toUpperCase();
        boolean found = false;

        Optional<Admission> uOpt = admissionRepository.findByAdmissionId(admissionId);
        if (uOpt.isPresent()) {
            Admission u = uOpt.get();
            u.setStatus(newStatus);
            admissionRepository.save(u);
            found = true;
        }

        Optional<StudentAdmission> sOpt = studentAdmissionRepository.findByAdmissionId(admissionId);
        if (sOpt.isPresent()) {
            StudentAdmission s = sOpt.get();
            s.setStatus(newStatus);
            studentAdmissionRepository.save(s);
            found = true;
        }

        Optional<ParentAdmission> pOpt = parentAdmissionRepository.findByAdmissionId(admissionId);
        if (pOpt.isPresent()) {
            ParentAdmission p = pOpt.get();
            p.setStatus(newStatus);
            parentAdmissionRepository.save(p);
            found = true;
        }

        if (!found) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Admission ID not found: " + admissionId));
        }

        return ResponseEntity.ok(Map.of("message", "Status updated to " + newStatus + " across all tables for admissionId: " + admissionId));
    }

    // ==========================================
    // STUDENT ADMISSIONS (table: student_admission & admissions)
    // ==========================================

    @PostMapping({"", "/student"})
    public ResponseEntity<?> submitStudentAdmission(@Valid @RequestBody AdmissionRequest request) {
        try {
            if (studentAdmissionRepository.existsByFirstNameIgnoreCaseAndLastNameIgnoreCase(request.getFirstName(), request.getLastName())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "An admission application has already been submitted for " + request.getFirstName() + " " + request.getLastName() + ". Each student is allowed only ONE admission submission.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            String uniqueAdmissionId = generateUniqueStudentAdmissionId();
            String assignedSection = calculateSection(request.getClassName());

            StudentAdmission admission = new StudentAdmission(
                uniqueAdmissionId,
                request.getFirstName(),
                request.getLastName(),
                request.getClassName(),
                request.getParentName(),
                request.getParentEmail()
            );
            admission.setSection(assignedSection);

            StudentAdmission saved = studentAdmissionRepository.save(admission);

            // Save into Unified Admissions Table
            Admission unified = new Admission(
                uniqueAdmissionId,
                request.getFirstName(),
                request.getLastName(),
                request.getFirstName() + " " + request.getLastName(),
                request.getClassName(),
                request.getParentName(),
                request.getParentEmail(),
                "STUDENT",
                "PENDING"
            );
            unified.setSection(assignedSection);
            admissionRepository.save(unified);

            AdmissionResponse response = new AdmissionResponse(
                saved.getId(),
                saved.getAdmissionId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getFirstName() + " " + saved.getLastName(),
                saved.getClassName(),
                saved.getParentName(),
                saved.getParentEmail(),
                "STUDENT",
                saved.getSection() != null ? saved.getSection() : "A",
                saved.getStatus() != null ? saved.getStatus() : "PENDING",
                saved.getCreatedAt(),
                "Student admission submitted successfully with Admission ID: " + saved.getAdmissionId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to submit student admission: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping({"", "/student"})
    public ResponseEntity<List<AdmissionResponse>> getAllStudentAdmissions() {
        List<StudentAdmission> list = studentAdmissionRepository.findAll();
        List<AdmissionResponse> dtos = list.stream()
            .map(s -> new AdmissionResponse(
                s.getId(),
                s.getAdmissionId(),
                s.getFirstName(),
                s.getLastName(),
                s.getFirstName() + " " + s.getLastName(),
                s.getClassName(),
                s.getParentName(),
                s.getParentEmail(),
                "STUDENT",
                s.getSection() != null ? s.getSection() : "A",
                s.getStatus() != null ? s.getStatus() : "PENDING",
                s.getCreatedAt(),
                "Fetched successfully"
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/student/{id}/status")
    public ResponseEntity<?> updateStudentAdmissionStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<StudentAdmission> optional = studentAdmissionRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student admission not found."));
        }
        StudentAdmission s = optional.get();
        s.setStatus(status.toUpperCase());
        StudentAdmission updated = studentAdmissionRepository.save(s);

        // Sync with Unified admissions table by admissionId
        Optional<Admission> uniOpt = admissionRepository.findByAdmissionId(s.getAdmissionId());
        if (uniOpt.isPresent()) {
            Admission u = uniOpt.get();
            u.setStatus(status.toUpperCase());
            admissionRepository.save(u);
        } else {
            // Fallback match by name
            Optional<Admission> nameMatch = admissionRepository.findFirstByFirstNameIgnoreCaseAndLastNameIgnoreCase(s.getFirstName(), s.getLastName());
            if (nameMatch.isPresent()) {
                Admission u = nameMatch.get();
                u.setStatus(status.toUpperCase());
                admissionRepository.save(u);
            }
        }

        AdmissionResponse response = new AdmissionResponse(
            updated.getId(),
            updated.getAdmissionId(),
            updated.getFirstName(),
            updated.getLastName(),
            updated.getFirstName() + " " + updated.getLastName(),
            updated.getClassName(),
            updated.getParentName(),
            updated.getParentEmail(),
            "STUDENT",
            updated.getSection() != null ? updated.getSection() : "A",
            updated.getStatus(),
            updated.getCreatedAt(),
            "Status updated to " + updated.getStatus()
        );
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // PARENT ADMISSIONS (table: parent_admission & admissions)
    // ==========================================

    @PostMapping("/parent")
    public ResponseEntity<?> submitParentAdmission(@Valid @RequestBody AdmissionRequest request) {
        try {
            String resolvedChildName = (request.getChildName() != null && !request.getChildName().trim().isEmpty())
                ? request.getChildName().trim()
                : "Child of " + request.getFirstName() + " " + request.getLastName();

            if (parentAdmissionRepository.existsByEmailIgnoreCaseAndChildNameIgnoreCase(request.getParentEmail(), resolvedChildName)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "An admission application has already been submitted for child: '" + resolvedChildName + "'. Only one admission application is allowed per child.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }

            String uniqueAdmissionId = generateUniqueParentAdmissionId();
            String assignedSection = calculateSection(request.getClassName());

            ParentAdmission admission = new ParentAdmission(
                uniqueAdmissionId,
                request.getFirstName(),
                request.getLastName(),
                request.getParentEmail(),
                resolvedChildName,
                request.getClassName()
            );
            admission.setSection(assignedSection);

            ParentAdmission saved = parentAdmissionRepository.save(admission);

            // Save into Unified Admissions Table
            Admission unified = new Admission(
                uniqueAdmissionId,
                request.getFirstName(),
                request.getLastName(),
                resolvedChildName,
                request.getClassName(),
                request.getFirstName() + " " + request.getLastName(),
                request.getParentEmail(),
                "PARENT",
                "PENDING"
            );
            unified.setSection(assignedSection);
            admissionRepository.save(unified);

            AdmissionResponse response = new AdmissionResponse(
                saved.getId(),
                saved.getAdmissionId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getChildName(),
                saved.getClassName(),
                saved.getFirstName() + " " + saved.getLastName(),
                saved.getEmail(),
                "PARENT",
                saved.getSection() != null ? saved.getSection() : "A",
                saved.getStatus() != null ? saved.getStatus() : "PENDING",
                saved.getCreatedAt(),
                "Parent admission submitted successfully with Admission ID: " + saved.getAdmissionId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to submit parent admission: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/parent")
    public ResponseEntity<List<AdmissionResponse>> getAllParentAdmissions() {
        List<ParentAdmission> list = parentAdmissionRepository.findAll();
        List<AdmissionResponse> dtos = list.stream()
            .map(p -> new AdmissionResponse(
                p.getId(),
                p.getAdmissionId(),
                p.getFirstName(),
                p.getLastName(),
                p.getChildName(),
                p.getClassName(),
                p.getFirstName() + " " + p.getLastName(),
                p.getEmail(),
                "PARENT",
                p.getSection() != null ? p.getSection() : "A",
                p.getStatus() != null ? p.getStatus() : "PENDING",
                p.getCreatedAt(),
                "Fetched successfully"
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/parent/{id}/status")
    public ResponseEntity<?> updateParentAdmissionStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<ParentAdmission> optional = parentAdmissionRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Parent admission not found."));
        }
        ParentAdmission p = optional.get();
        p.setStatus(status.toUpperCase());
        ParentAdmission updated = parentAdmissionRepository.save(p);

        // Sync with Unified admissions table by admissionId
        Optional<Admission> uniOpt = admissionRepository.findByAdmissionId(p.getAdmissionId());
        if (uniOpt.isPresent()) {
            Admission u = uniOpt.get();
            u.setStatus(status.toUpperCase());
            admissionRepository.save(u);
        } else {
            List<Admission> uniList = admissionRepository.findByParentEmailIgnoreCase(p.getEmail());
            for (Admission u : uniList) {
                u.setStatus(status.toUpperCase());
                admissionRepository.save(u);
            }
        }

        AdmissionResponse response = new AdmissionResponse(
            updated.getId(),
            updated.getAdmissionId(),
            updated.getFirstName(),
            updated.getLastName(),
            updated.getChildName(),
            updated.getClassName(),
            updated.getFirstName() + " " + updated.getLastName(),
            updated.getEmail(),
            "PARENT",
            updated.getSection() != null ? updated.getSection() : "A",
            updated.getStatus(),
            updated.getCreatedAt(),
            "Status updated to " + updated.getStatus()
        );
        return ResponseEntity.ok(response);
    }

    private String calculateSection(String className) {
        long count = admissionRepository.countByClassName(className);
        if (count < 50) {
            return "A";
        } else if (count < 100) {
            return "B";
        } else {
            return "C";
        }
    }

    private String generateUniqueStudentAdmissionId() {
        Random random = new Random();
        String candidateId;
        do {
            int number = 10000 + random.nextInt(90000);
            candidateId = "ADM-" + number;
        } while (studentAdmissionRepository.existsByAdmissionId(candidateId) || admissionRepository.existsByAdmissionId(candidateId));
        return candidateId;
    }

    private String generateUniqueParentAdmissionId() {
        Random random = new Random();
        String candidateId;
        do {
            int number = 10000 + random.nextInt(90000);
            candidateId = "ADM-" + number;
        } while (parentAdmissionRepository.existsByAdmissionId(candidateId) || admissionRepository.existsByAdmissionId(candidateId));
        return candidateId;
    }
}
