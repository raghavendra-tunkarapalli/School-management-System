package com.school.examination.repository;

import com.school.examination.entity.AssignmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentQuestionRepository extends JpaRepository<AssignmentQuestion, Long> {
}
