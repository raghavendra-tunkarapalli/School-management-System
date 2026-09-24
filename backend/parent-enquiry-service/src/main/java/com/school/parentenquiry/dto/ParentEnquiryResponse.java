package com.school.parentenquiry.dto;

import java.time.LocalDateTime;

public class ParentEnquiryResponse {

    private Long id;
    private String enquireId;
    private String firstName;
    private String lastName;
    private String email;
    private String parentName;
    private String parentEmail;
    private String childName;
    private String className;
    private String enquire;
    private String adminResponse;
    private String response;
    private String status;
    private LocalDateTime createdAt;
    private String message;

    public ParentEnquiryResponse() {
    }

    public ParentEnquiryResponse(Long id, String enquireId, String firstName, String lastName, String email, String parentName, String parentEmail, String childName, String className, String enquire, String adminResponse, String response, String status, LocalDateTime createdAt, String message) {
        this.id = id;
        this.enquireId = enquireId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.childName = childName;
        this.className = className;
        this.enquire = enquire;
        this.adminResponse = adminResponse;
        this.response = response;
        this.status = status;
        this.createdAt = createdAt;
        this.message = message;
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
    }

    public String getResponse() {
        return (response != null && !response.trim().isEmpty()) ? response : adminResponse;
    }

    public void setResponse(String response) {
        this.response = response;
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

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
