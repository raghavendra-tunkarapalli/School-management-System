package com.school.adminadmission.dto;

public class AdmissionRecordDTO {

    private Long id;
    private String admissionId;
    private String firstName;
    private String lastName;
    private String childName;
    private String className;
    private String parentName;
    private String parentEmail;
    private String applicantType; // "STUDENT" or "PARENT"
    private String status; // "PENDING", "ACCEPTED", "REJECTED"
    private String createdAt;

    public AdmissionRecordDTO() {
    }

    public AdmissionRecordDTO(Long id, String admissionId, String firstName, String lastName, String childName, String className, String parentName, String parentEmail, String applicantType, String status, String createdAt) {
        this.id = id;
        this.admissionId = admissionId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.childName = childName;
        this.className = className;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
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

    public String getAdmissionId() {
        return admissionId;
    }

    public void setAdmissionId(String admissionId) {
        this.admissionId = admissionId;
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
