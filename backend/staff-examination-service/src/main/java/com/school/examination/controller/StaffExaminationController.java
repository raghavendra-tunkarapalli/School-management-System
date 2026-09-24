package com.school.examination.controller;

import com.school.examination.entity.AssignmentQuestion;
import com.school.examination.entity.StudentAssignment;
import com.school.examination.repository.StudentAssignmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/staff-examination")
public class StaffExaminationController {

    private final StudentAssignmentRepository assignmentRepository;

    public StaffExaminationController(StudentAssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping("/assignment/save")
    public ResponseEntity<?> saveAssignment(@RequestBody StudentAssignment assignment) {
        if (assignment.getAssignmentTitle() == null || assignment.getAssignmentTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Assignment title cannot be empty");
        }
        if (assignment.getClassStandard() == null || assignment.getSectionName() == null) {
            return ResponseEntity.badRequest().body("Class Standard and Section Name are required");
        }

        // Establish bi-directional references
        if (assignment.getQuestions() != null) {
            for (AssignmentQuestion question : assignment.getQuestions()) {
                question.setAssignment(assignment);
            }
        }

        StudentAssignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.ok(Map.of(
            "message", "Assignment saved successfully",
            "assignmentId", saved.getId(),
            "questionsCount", saved.getQuestions() != null ? saved.getQuestions().size() : 0
        ));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<StudentAssignment>> getAssignments(
            @RequestParam Integer classStandard,
            @RequestParam String sectionName) {
        
        List<StudentAssignment> list = assignmentRepository.findByClassStandardAndSectionNameOrderByCreatedAtDesc(
                classStandard, sectionName.toUpperCase());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/assignments/{id}/questions")
    public ResponseEntity<List<AssignmentQuestion>> getAssignmentQuestions(@PathVariable Long id) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            List<AssignmentQuestion> questions = opt.get().getQuestions();
            // Sort by question number
            questions.sort(Comparator.comparing(AssignmentQuestion::getQuestionNumber));
            return ResponseEntity.ok(questions);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/assignments/{id}/release-results")
    public ResponseEntity<?> releaseResults(@PathVariable Long id, @RequestParam Boolean released) {
        Optional<StudentAssignment> opt = assignmentRepository.findById(id);
        if (opt.isPresent()) {
            StudentAssignment asm = opt.get();
            asm.setResultsReleased(released);
            StudentAssignment saved = assignmentRepository.save(asm);
            return ResponseEntity.ok(Map.of(
                "message", "Results release status updated successfully",
                "assignmentId", saved.getId(),
                "resultsReleased", saved.getResultsReleased()
            ));
        }
        return ResponseEntity.notFound().build();
    }
}
