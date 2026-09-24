package com.school.schedule.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "class_schedules")
public class ClassSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_code")
    private String classCode;

    @Column(name = "class_standard", nullable = false)
    private Integer classStandard;

    @Column(name = "section_id", nullable = false)
    private Integer sectionId;

    @Column(name = "period_index", nullable = false)
    private Integer periodIndex;

    @Column(name = "timing_label")
    private String timingLabel;

    @Column(name = "room_no")
    private String roomNo;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "schedule_date")
    private String scheduleDate;

    public ClassSchedule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public Integer getSectionId() { return sectionId; }
    public void setSectionId(Integer sectionId) { this.sectionId = sectionId; }

    public Integer getPeriodIndex() { return periodIndex; }
    public void setPeriodIndex(Integer periodIndex) { this.periodIndex = periodIndex; }

    public String getTimingLabel() { return timingLabel; }
    public void setTimingLabel(String timingLabel) { this.timingLabel = timingLabel; }

    public String getRoomNo() { return roomNo; }
    public void setRoomNo(String roomNo) { this.roomNo = roomNo; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(String scheduleDate) { this.scheduleDate = scheduleDate; }
}
