package com.school.staffportal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "class_rooms")
public class ClassRoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "class_code", unique = true, nullable = false)
    private String classCode;

    @Column(name = "class_standard", nullable = false)
    private Integer classStandard;

    @Column(name = "section_id", nullable = false)
    private Integer sectionId;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "display_label", nullable = false)
    private String displayLabel;

    @Column(name = "room_no")
    private String roomNo;

    @Column(name = "capacity")
    private Integer capacity;

    public ClassRoomEntity() {}

    public ClassRoomEntity(String classCode, Integer classStandard, Integer sectionId, String sectionName, String displayLabel, String roomNo, Integer capacity) {
        this.classCode = classCode;
        this.classStandard = classStandard;
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.displayLabel = displayLabel;
        this.roomNo = roomNo;
        this.capacity = capacity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassCode() { return classCode; }
    public void setClassCode(String classCode) { this.classCode = classCode; }

    public Integer getClassStandard() { return classStandard; }
    public void setClassStandard(Integer classStandard) { this.classStandard = classStandard; }

    public Integer getSectionId() { return sectionId; }
    public void setSectionId(Integer sectionId) { this.sectionId = sectionId; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getDisplayLabel() { return displayLabel; }
    public void setDisplayLabel(String displayLabel) { this.displayLabel = displayLabel; }

    public String getRoomNo() { return roomNo; }
    public void setRoomNo(String roomNo) { this.roomNo = roomNo; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
