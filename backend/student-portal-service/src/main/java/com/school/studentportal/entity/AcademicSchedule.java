package com.school.studentportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "academic_schedule")
public class AcademicSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_time", nullable = false)
    private String scheduleTime;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

    @Column(name = "subject_category", nullable = false)
    private String subjectCategory;

    @Column(name = "teacher_name", nullable = false)
    private String teacherName;

    @Column(name = "class_name")
    private String className = "10";

    @Column(name = "section")
    private String section = "A";

    public AcademicSchedule() {
    }

    public AcademicSchedule(String scheduleTime, String subjectName, String subjectCategory, String teacherName, String className, String section) {
        this.scheduleTime = scheduleTime;
        this.subjectName = subjectName;
        this.subjectCategory = subjectCategory;
        this.teacherName = teacherName;
        this.className = className != null ? className : "10";
        this.section = section != null ? section : "A";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getScheduleTime() {
        return scheduleTime;
    }

    public void setScheduleTime(String scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCategory() {
        return subjectCategory;
    }

    public void setSubjectCategory(String subjectCategory) {
        this.subjectCategory = subjectCategory;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }
}
