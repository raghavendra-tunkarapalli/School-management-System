package com.school.admission.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AdmissionRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String childName;

    @NotBlank(message = "Class is required")
    private String className;

    private String parentName;

    @NotBlank(message = "Parent email is required")
    @Email(message = "Invalid parent email format")
    private String parentEmail;

    private String applicantType;

    public AdmissionRequest() {
    }

    public AdmissionRequest(String firstName, String lastName, String childName, String className, String parentName, String parentEmail, String applicantType) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.childName = childName;
        this.className = className;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.applicantType = applicantType;
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
}
