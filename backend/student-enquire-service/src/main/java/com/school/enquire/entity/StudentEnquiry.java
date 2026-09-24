package com.school.enquire.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_enquire")
public class StudentEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enquire_id", nullable = false, unique = true)
    private String enquireId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "child_name")
    private String childName;

    @Column(name = "email")
    private String email;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "enquire", nullable = false, columnDefinition = "TEXT")
    private String enquire;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "response", columnDefinition = "TEXT")
    private String response;

    @Column(name = "status")
    private String status = "PENDING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public StudentEnquiry() {
    }

    public StudentEnquiry(String enquireId, String firstName, String lastName, String parentName, String parentEmail, String className, String enquire) {
        this.enquireId = enquireId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.childName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
        this.childName = this.childName.trim();
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.email = parentEmail;
        this.className = className;
        this.enquire = enquire;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.childName == null || this.childName.trim().isEmpty()) {
            this.childName = (this.firstName != null ? this.firstName : "") + " " + (this.lastName != null ? this.lastName : "");
            this.childName = this.childName.trim();
        }
        if (this.email == null || this.email.trim().isEmpty()) {
            this.email = this.parentEmail;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEnquireId() {
        return enquireId;
    }

    public void setEnquireId(String enquireId) {
        this.enquireId = enquireId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getChildName() {
        return (childName != null && !childName.trim().isEmpty()) ? childName : (firstName + " " + lastName).trim();
    }

    public void setChildName(String childName) {
        this.childName = childName;
    }

    public String getEmail() {
        return (email != null && !email.trim().isEmpty()) ? email : parentEmail;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentEmail() {
        return parentEmail;
    }

    public void setParentEmail(String parentEmail) {
        this.parentEmail = parentEmail;
        if (this.email == null) {
            this.email = parentEmail;
        }
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getEnquire() {
        return enquire;
    }

    public void setEnquire(String enquire) {
        this.enquire = enquire;
    }

    public String getAdminResponse() {
        return (response != null && !response.trim().isEmpty()) ? response : adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
        if (this.response == null) {
            this.response = adminResponse;
        }
    }

    public String getResponse() {
        return (response != null && !response.trim().isEmpty()) ? response : adminResponse;
    }

    public void setResponse(String response) {
        this.response = response;
        this.adminResponse = response;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
