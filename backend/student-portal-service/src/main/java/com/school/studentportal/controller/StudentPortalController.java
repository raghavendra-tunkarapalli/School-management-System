package com.school.studentportal.controller;

import com.school.studentportal.entity.AcademicSchedule;
import com.school.studentportal.entity.StudentProfile;
import com.school.studentportal.repository.AcademicScheduleRepository;
import com.school.studentportal.repository.StudentProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-portal")
public class StudentPortalController {

    private final StudentProfileRepository profileRepository;
    private final AcademicScheduleRepository scheduleRepository;
    private final RestTemplate restTemplate;

    public StudentPortalController(StudentProfileRepository profileRepository,
                                  AcademicScheduleRepository scheduleRepository) {
        this.profileRepository = profileRepository;
        this.scheduleRepository = scheduleRepository;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<StudentProfile> getStudentProfile(@PathVariable String username) {
        Optional<StudentProfile> profileOpt = profileRepository.findByUsername(username);
        StudentProfile profile;

        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
        } else {
            profile = new StudentProfile(
                    10L,
                    username,
                    username.contains("@") ? username : username + "@school.com",
                    "Alex",
                    "Morgan",
                    false,
                    "PENDING"
            );
        }

        // Synchronize with admission-service (Port 8082) unique unified admissions table
        try {
            List<Map<String, Object>> admissions = restTemplate.getForObject("http://localhost:8082/api/admissions/unified", List.class);
            if (admissions == null || admissions.isEmpty()) {
                admissions = restTemplate.getForObject("http://localhost:8082/api/admissions/student", List.class);
            }
            if (admissions != null && !admissions.isEmpty()) {
                // Find all matching admission records for this specific student
                List<Map<String, Object>> matches = admissions.stream()
                        .filter(a -> {
                            String fName = a.get("firstName") != null ? a.get("firstName").toString().trim().toLowerCase() : "";
                            String lName = a.get("lastName") != null ? a.get("lastName").toString().trim().toLowerCase() : "";
                            String cName = a.get("childName") != null ? a.get("childName").toString().trim().toLowerCase() : "";
                            String pEmail = a.get("parentEmail") != null ? a.get("parentEmail").toString().trim().toLowerCase() : "";
                            String admId = a.get("admissionId") != null ? a.get("admissionId").toString().trim().toLowerCase() : "";
                            String uName = username.trim().toLowerCase();

                            // Exact match checks
                            if (uName.equals(fName) || uName.equals(cName) || uName.equals(pEmail) || uName.equals(admId)) {
                                return true;
                            }
                            String fullName = (fName + " " + lName).trim();
                            if (!fullName.isEmpty() && (fullName.equalsIgnoreCase(uName) || uName.equalsIgnoreCase(fName + "_" + lName))) {
                                return true;
                            }
                            // Quick demo student (Alex Morgan) matching rule
                            if (("student".equals(uName) || "student_gmail".equals(uName) || "student@gmail.com".equals(uName) || "alex".equals(uName))
                                    && ("alex morgan".equals(cName) || "alex".equals(fName) || "alex morgan".equals(fullName))) {
                                return true;
                            }
                            return false;
                        })
                        .collect(Collectors.toList());

                if (!matches.isEmpty()) {
                    boolean isRejected = matches.stream().anyMatch(m -> "REJECTED".equalsIgnoreCase(m.get("status") != null ? m.get("status").toString() : ""));
                    boolean isAccepted = matches.stream().anyMatch(m -> "ACCEPTED".equalsIgnoreCase(m.get("status") != null ? m.get("status").toString() : "") || "CONFIRMED".equalsIgnoreCase(m.get("status") != null ? m.get("status").toString() : ""));

                    if (isRejected) {
                        profile.setStatus("REJECTED");
                        profile.setAdmissionConfirmed(false);
                    } else if (isAccepted) {
                        profile.setStatus("CONFIRMED");
                        profile.setAdmissionConfirmed(true);
                    } else {
                        profile.setStatus("PENDING");
                        profile.setAdmissionConfirmed(false);
                    }

                    Map<String, Object> firstMatch = matches.get(0);
                    if (firstMatch.get("firstName") != null) profile.setFirstName(firstMatch.get("firstName").toString());
                    if (firstMatch.get("lastName") != null) profile.setLastName(firstMatch.get("lastName").toString());
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not sync status with admission-service: " + e.getMessage());
        }

        StudentProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/confirm-admission/{username}")
    public ResponseEntity<?> confirmAdmission(@PathVariable String username, @RequestBody(required = false) Map<String, Object> payload) {
        Optional<StudentProfile> profileOpt = profileRepository.findByUsername(username);
        StudentProfile profile;

        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
        } else {
            profile = new StudentProfile(
                    10L,
                    username,
                    username.contains("@") ? username : username + "@school.com",
                    "Alex",
                    "Morgan",
                    false,
                    "PENDING"
            );
        }

        profile.setAdmissionConfirmed(true);
        profile.setStatus("CONFIRMED");

        if (payload != null) {
            if (payload.get("firstName") != null) profile.setFirstName(payload.get("firstName").toString());
            if (payload.get("lastName") != null) profile.setLastName(payload.get("lastName").toString());
            if (payload.get("email") != null) profile.setEmail(payload.get("email").toString());
            if (payload.get("userId") != null) {
                try {
                    profile.setUserId(Long.valueOf(payload.get("userId").toString()));
                } catch (Exception ignored) {}
            }
        }

        StudentProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/status/{username}")
    public ResponseEntity<?> updateStudentPortalStatus(@PathVariable String username, @RequestParam String status) {
        Optional<StudentProfile> profileOpt = profileRepository.findByUsername(username);
        StudentProfile profile;

        if (profileOpt.isPresent()) {
            profile = profileOpt.get();
        } else {
            profile = new StudentProfile(
                    10L,
                    username,
                    username.contains("@") ? username : username + "@school.com",
                    "Alex",
                    "Morgan",
                    false,
                    "PENDING"
            );
        }

        String targetStatus = status.toUpperCase();
        if ("ACCEPTED".equals(targetStatus) || "CONFIRMED".equals(targetStatus)) {
            profile.setStatus("CONFIRMED");
            profile.setAdmissionConfirmed(true);
        } else if ("REJECTED".equals(targetStatus)) {
            profile.setStatus("REJECTED");
            profile.setAdmissionConfirmed(false);
        } else {
            profile.setStatus("PENDING");
            profile.setAdmissionConfirmed(false);
        }

        StudentProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // ACADEMIC SCHEDULE ENDPOINTS (MySQL)
    // ==========================================

    @GetMapping("/academics/schedule")
    public ResponseEntity<List<AcademicSchedule>> getAcademicSchedule(
            @RequestParam(required = false, defaultValue = "10") String className,
            @RequestParam(required = false, defaultValue = "A") String section) {
        List<AcademicSchedule> list = scheduleRepository.findByClassNameAndSection(className, section);
        if (list.isEmpty()) {
            list = scheduleRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/academics/schedule")
    public ResponseEntity<AcademicSchedule> saveAcademicSchedule(@RequestBody AcademicSchedule schedule) {
        AcademicSchedule saved = scheduleRepository.save(schedule);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/academics/schedule/{id}")
    public ResponseEntity<?> deleteAcademicSchedule(@PathVariable Long id) {
        scheduleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Academic schedule item deleted successfully"));
    }
}
