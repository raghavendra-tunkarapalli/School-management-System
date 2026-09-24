package com.school.teacherportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "teachers")
public class TeacherEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "number_of_subjects")
    private Integer numberOfSubjects = 1;

    public TeacherEntity() {
    }

    public TeacherEntity(String userId, String username, String name, String subject, Integer numberOfSubjects) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.subject = subject;
        this.numberOfSubjects = numberOfSubjects != null ? numberOfSubjects : 1;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Integer getNumberOfSubjects() {
        return numberOfSubjects;
    }

    public void setNumberOfSubjects(Integer numberOfSubjects) {
        this.numberOfSubjects = numberOfSubjects;
    }
}
