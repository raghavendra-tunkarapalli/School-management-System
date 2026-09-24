package com.school.parentenquiry.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ParentEnquiryRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Child name is required")
    private String childName;

    @NotBlank(message = "Class is required")
    private String className;

    @NotBlank(message = "Enquiry message is required")
    private String enquire;

    public ParentEnquiryRequest() {
    }

    public ParentEnquiryRequest(String firstName, String lastName, String email, String childName, String className, String enquire) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.childName = childName;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
}
