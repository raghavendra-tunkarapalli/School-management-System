package com.school.studentportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "student_profiles")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String role = "STUDENT";
    
    private boolean admissionConfirmed = false;
    private String status = "PENDING";

    public StudentProfile() {}

    public StudentProfile(Long userId, String username, String email, String firstName, String lastName, boolean admissionConfirmed, String status) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = "STUDENT";
        this.admissionConfirmed = admissionConfirmed;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isAdmissionConfirmed() { return admissionConfirmed; }
    public void setAdmissionConfirmed(boolean admissionConfirmed) { this.admissionConfirmed = admissionConfirmed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
