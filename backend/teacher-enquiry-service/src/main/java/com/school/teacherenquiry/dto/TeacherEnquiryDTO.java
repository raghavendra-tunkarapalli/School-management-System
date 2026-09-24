package com.school.teacherenquiry.dto;

public class TeacherEnquiryDTO {

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
    private String response;
    private String applicantType; // "STUDENT" or "PARENT"
    private String status; // "PENDING" or "RESPONDED"
    private String createdAt;

    public TeacherEnquiryDTO() {
    }

    public TeacherEnquiryDTO(Long id, String enquireId, String firstName, String lastName, String email, String parentName, String parentEmail, String childName, String className, String enquire, String response, String applicantType, String status, String createdAt) {
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
        this.response = response;
        this.applicantType = applicantType;
        this.status = status;
        this.createdAt = createdAt;
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

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getApplicantType() {
        return applicantType;
    }

    public void setApplicantType(String applicantType) {
        this.applicantType = applicantType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
