package com.school.enquire.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class EnquiryRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Parent name is required")
    private String parentName;

    @NotBlank(message = "Parent email is required")
    @Email(message = "Invalid parent email format")
    private String parentEmail;

    @NotBlank(message = "Class is required")
    private String className;

    @NotBlank(message = "Enquiry message is required")
    private String enquire;

    public EnquiryRequest() {
    }

    public EnquiryRequest(String firstName, String lastName, String parentName, String parentEmail, String className, String enquire) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.parentName = parentName;
        this.parentEmail = parentEmail;
        this.className = className;
        this.enquire = enquire;
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
}
