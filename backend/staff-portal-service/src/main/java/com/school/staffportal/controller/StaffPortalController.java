package com.school.staffportal.controller;

import com.school.staffportal.entity.ClassRoomEntity;
import com.school.staffportal.entity.ClassScheduleEntity;
import com.school.staffportal.entity.StaffProfile;
import com.school.staffportal.entity.TeacherEntity;
import com.school.staffportal.repository.ClassRoomRepository;
import com.school.staffportal.repository.ClassScheduleRepository;
import com.school.staffportal.repository.StaffProfileRepository;
import com.school.staffportal.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/staff-portal")
public class StaffPortalController {

    private final StaffProfileRepository profileRepository;
    private final TeacherRepository teacherRepository;
    private final ClassScheduleRepository scheduleRepository;
    private final ClassRoomRepository classRoomRepository;

    public StaffPortalController(StaffProfileRepository profileRepository,
                                 TeacherRepository teacherRepository,
                                 ClassScheduleRepository scheduleRepository,
                                 ClassRoomRepository classRoomRepository) {
        this.profileRepository = profileRepository;
        this.teacherRepository = teacherRepository;
        this.scheduleRepository = scheduleRepository;
        this.classRoomRepository = classRoomRepository;
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<StaffProfile> getStaffProfile(@PathVariable String username) {
        Optional<StaffProfile> opt = profileRepository.findByUsername(username);
        StaffProfile profile;

        if (opt.isPresent()) {
            profile = opt.get();
        } else {
            profile = new StaffProfile(
                    30L,
                    username,
                    username.contains("@") ? username : username + "@school.com",
                    "Michael",
                    "Scott",
                    "Administrative Operations",
                    "CONFIRMED"
            );
            profile = profileRepository.save(profile);
        }

        return ResponseEntity.ok(profile);
    }

    @PostMapping("/profile")
    public ResponseEntity<StaffProfile> updateStaffProfile(@RequestBody StaffProfile profile) {
        StaffProfile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // TEACHERS ENDPOINTS (table: teachers)
    // ==========================================

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherEntity>> getAllTeachers() {
        List<TeacherEntity> teachers = teacherRepository.findAll();
        if (teachers.isEmpty()) {
            teacherRepository.saveAll(List.of(
                new TeacherEntity("Tea_101", "ramarao", "Mr. K. Ramarao", "Telugu", 1),
                new TeacherEntity("Tea_102", "sharma", "Mrs. S. Sharma", "Hindi", 1),
                new TeacherEntity("Tea_103", "miller", "Dr. A. Miller", "English", 1),
                new TeacherEntity("Tea_104", "ramanujan", "Prof. V. Ramanujan", "Maths", 1),
                new TeacherEntity("Tea_105", "pcray", "Dr. P. C. Ray", "Science", 1),
                new TeacherEntity("Tea_106", "bose", "Mr. N. Bose", "Social Studies", 1),
                new TeacherEntity("Tea_107", "lakshmi", "Mrs. G. Lakshmi", "Vocational", 1)
            ));
            teachers = teacherRepository.findAll();
        }
        return ResponseEntity.ok(teachers);
    }

    @PostMapping("/teachers")
    public ResponseEntity<TeacherEntity> createTeacher(@RequestBody TeacherEntity teacher) {
        TeacherEntity saved = teacherRepository.save(teacher);
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // CLASS ROOMS ENDPOINTS (table: class_rooms)
    // Stores 36 unique classroom section units (12 Classes x 3 Sections = 36)
    // ==========================================

    @GetMapping("/classrooms")
    public ResponseEntity<List<ClassRoomEntity>> getAllClassRooms() {
        List<ClassRoomEntity> rooms = classRoomRepository.findAll();

        // Auto-initialize 36 unique classroom sections in DB if table is empty
        if (rooms.isEmpty()) {
            List<ClassRoomEntity> initialRooms = new ArrayList<>();
            int roomCounter = 101;

            for (int cls = 1; cls <= 12; cls++) {
                for (int sec = 1; sec <= 3; sec++) {
                    String code = "CLS_" + cls + "_SEC_" + sec;
                    String secName = "Section " + sec;
                    String label = "Class " + cls + " — " + secName;
                    String roomNo = "Room " + roomCounter++;

                    initialRooms.add(new ClassRoomEntity(
                            code, cls, sec, secName, label, roomNo, 40
                    ));
                }
            }
            rooms = classRoomRepository.saveAll(initialRooms);
        }

        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/classrooms")
    public ResponseEntity<ClassRoomEntity> createOrUpdateClassRoom(@RequestBody ClassRoomEntity room) {
        Optional<ClassRoomEntity> opt = classRoomRepository.findByClassCode(room.getClassCode());
        ClassRoomEntity saved;
        if (opt.isPresent()) {
            ClassRoomEntity existing = opt.get();
            existing.setRoomNo(room.getRoomNo());
            existing.setCapacity(room.getCapacity());
            existing.setDisplayLabel(room.getDisplayLabel());
            saved = classRoomRepository.save(existing);
        } else {
            saved = classRoomRepository.save(room);
        }
        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // CLASS SCHEDULES ENDPOINTS (table: class_schedules)
    // Pre-populates empty cells for Classes 1-12 and 3 Sections
    // ==========================================

    @GetMapping("/schedules")
    public ResponseEntity<List<ClassScheduleEntity>> getSchedules(
            @RequestParam(required = false) Integer classStandard,
            @RequestParam(defaultValue = "2026-08-20") String scheduleDate) {

        List<ClassScheduleEntity> existingForDate = scheduleRepository.findByScheduleDate(scheduleDate);

        // Auto-initialize 1-12 classes & 3 sections with empty cells in DB table if empty
        if (existingForDate.isEmpty()) {
            List<ClassScheduleEntity> initialList = new ArrayList<>();
            String[] timings = {"9-10", "10-11", "11-12", "12-01 (Lunch)", "01-02", "02-03", "03-04", "04-05"};

            for (int cls = 1; cls <= 12; cls++) {
                for (int sec = 1; sec <= 3; sec++) {
                    for (int pIdx = 0; pIdx < 8; pIdx++) {
                        initialList.add(new ClassScheduleEntity(
                                cls, sec, pIdx, timings[pIdx], "", "", "", scheduleDate
                        ));
                    }
                }
            }
            scheduleRepository.saveAll(initialList);
        }

        List<ClassScheduleEntity> result;
        if (classStandard != null) {
            result = scheduleRepository.findByClassStandardAndScheduleDate(classStandard, scheduleDate);
        } else {
            result = scheduleRepository.findByScheduleDate(scheduleDate);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/schedules/cell")
    public ResponseEntity<ClassScheduleEntity> saveScheduleCell(@RequestBody ClassScheduleEntity cell) {
        Optional<ClassScheduleEntity> opt = scheduleRepository.findByClassStandardAndSectionIdAndPeriodIndexAndScheduleDate(
                cell.getClassStandard(), cell.getSectionId(), cell.getPeriodIndex(), cell.getScheduleDate());

        ClassScheduleEntity target;
        if (opt.isPresent()) {
            target = opt.get();
            target.setTeacherName(cell.getTeacherName());
            target.setSubjectName(cell.getSubjectName());
            target.setRoomNo(cell.getRoomNo());
            target.setTimingLabel(cell.getTimingLabel());
            target.setClassCode("CLS_" + cell.getClassStandard() + "_SEC_" + cell.getSectionId());
        } else {
            target = cell;
            if (target.getClassCode() == null || target.getClassCode().isEmpty()) {
                target.setClassCode("CLS_" + cell.getClassStandard() + "_SEC_" + cell.getSectionId());
            }
        }

        ClassScheduleEntity saved = scheduleRepository.save(target);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/schedules/cell")
    public ResponseEntity<Void> clearScheduleCell(
            @RequestParam Integer classStandard,
            @RequestParam Integer sectionId,
            @RequestParam Integer periodIndex,
            @RequestParam(defaultValue = "2026-08-20") String scheduleDate) {

        Optional<ClassScheduleEntity> opt = scheduleRepository.findByClassStandardAndSectionIdAndPeriodIndexAndScheduleDate(
                classStandard, sectionId, periodIndex, scheduleDate);

        if (opt.isPresent()) {
            ClassScheduleEntity cell = opt.get();
            cell.setTeacherName("");
            cell.setSubjectName("");
            cell.setRoomNo("");
            scheduleRepository.save(cell);
        }

        return ResponseEntity.noContent().build();
    }
}
