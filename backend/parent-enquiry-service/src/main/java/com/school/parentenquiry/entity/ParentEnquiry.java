package com.school.parentenquiry.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parent_enquiry")
public class ParentEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enquire_id", nullable = false, unique = true)
    private String enquireId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "parent_name", nullable = false)
    private String parentName;

    @Column(name = "parent_email", nullable = false)
    private String parentEmail;

    @Column(name = "child_name", nullable = false)
    private String childName;

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

    public ParentEnquiry() {
    }

    public ParentEnquiry(String enquireId, String firstName, String lastName, String email, String parentName, String parentEmail, String childName, String className, String enquire) {
        this.enquireId = enquireId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.childName = childName;
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

    public String getEmail() {
        return email;
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
    }

    public String getChildName() {
        return childName;
    }

    public void setChildName(String childName) {
        this.childName = childName;
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
