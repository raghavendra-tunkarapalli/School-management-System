import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Grid,
  List,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  BookMarked,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function StaffPortalModule({ user }) {
  const [activeTab, setActiveTab] = useState('module1');
  const [selectedClass, setSelectedClass] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Module 2 State
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [classRooms, setClassRooms] = useState([]);
  const [activePeriodTab, setActivePeriodTab] = useState(0);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleNavigateYesterday = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNavigateToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNavigateTomorrow = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const [showClassSidebar, setShowClassSidebar] = useState(true);

  const MAX_PERIODS_PER_TEACHER = 7;
  const PERIOD_TIMINGS = ['9-10 AM', '10-11 AM', '11-12 PM', '12-01 PM (Lunch)', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM'];

  const [scheduleGrid, setScheduleGrid] = useState(() => {
    const initialGrid = {};
    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        for (let p = 0; p < 8; p++) {
          const cellKey = c + '_' + s + '_' + p;
          if (p === 3) {
            initialGrid[cellKey] = { room_no: 'Recess', teacher: 'Lunch Break', sub: 'Break' };
          } else {
            initialGrid[cellKey] = null;
          }
        }
      }
    }
    return initialGrid;
  });

  const [activeTeacherClick, setActiveTeacherClick] = useState(null);
  const [activeRoomClick, setActiveRoomClick] = useState(null);

  // Module 3: Students Directory states
  const [mod3Students, setMod3Students] = useState([]);
  const [mod3Loading, setMod3Loading] = useState(false);
  const [mod3SelectedClass, setMod3SelectedClass] = useState(1);
  const [mod3SelectedSection, setMod3SelectedSection] = useState('A');
  const [mod3SearchQuery, setMod3SearchQuery] = useState('');
  
  // Module 3 Attendance states
  const [mod3SelectedMonth, setMod3SelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [mod3SelectedYear, setMod3SelectedYear] = useState(() => new Date().getFullYear());
  const [mod3AttendanceRecords, setMod3AttendanceRecords] = useState([]);
  const [mod3AttendanceLoading, setMod3AttendanceLoading] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null); // Student details object
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState([]); // Daily records for selected student
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [detailModalMonth, setDetailModalMonth] = useState(() => new Date().getMonth() + 1);
  const [detailModalYear, setDetailModalYear] = useState(() => new Date().getFullYear());

  // Module 4: Examinations states
  const [mod4SelectedClass, setMod4SelectedClass] = useState(1);
  const [mod4SelectedSection, setMod4SelectedSection] = useState('A');
  const [mod4Assignments, setMod4Assignments] = useState([]);
  const [mod4Loading, setMod4Loading] = useState(false);
  const [mod4ViewMode, setMod4ViewMode] = useState('list'); // 'list' | 'create' | 'view'
  const [mod4NewAssignmentTitle, setMod4NewAssignmentTitle] = useState('');
  const [mod4NewAssignmentSubject, setMod4NewAssignmentSubject] = useState('');
  const [mod4NewAssignmentConductDate, setMod4NewAssignmentConductDate] = useState('');
  const [mod4SelectedAssignment, setMod4SelectedAssignment] = useState(null);
  const [mod4SelectedAssignmentQuestions, setMod4SelectedAssignmentQuestions] = useState([]);
  const [mod4NewQuestions, setMod4NewQuestions] = useState(() => {
    const arr = [];
    for (let i = 1; i <= 50; i++) {
      arr.push({ questionNumber: i, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    }
    return arr;
  });

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchClassRooms();

    // Auto-polling every 5 seconds so teacher subject updates from DB are automatically synced
    const intervalId = setInterval(() => {
      fetchTeachers();
    }, 5000);

    const onFocus = () => {
      fetchTeachers();
      fetchStudents();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const fetchSchedules = async (date) => {
    setSchedulesLoading(true);
    try {
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const newGrid = {};
          // Initialize default recess cells first
          for (let c = 1; c <= 12; c++) {
            for (let s = 1; s <= 3; s++) {
              for (let p = 0; p < 8; p++) {
                const cellKey = c + '_' + s + '_' + p;
                if (p === 3) {
                  newGrid[cellKey] = { room_no: 'Recess', teacher: 'Lunch Break', sub: 'Break' };
                } else {
                  newGrid[cellKey] = null;
                }
              }
            }
          }

          data.forEach(item => {
            const cellKey = `${item.classStandard}_${item.sectionId}_${item.periodIndex}`;
            if (item.periodIndex === 3) return; // Skip lunch
            
            if ((item.teacherName && item.teacherName.trim() !== '') || (item.roomNo && item.roomNo.trim() !== '')) {
              newGrid[cellKey] = {
                room_no: item.roomNo || '',
                teacher: item.teacherName || 'Unassigned',
                sub: item.subjectName || 'General'
              };
            }
          });
          setScheduleGrid(newGrid);
        }
      }
    } catch (e) {
      console.error("Failed to fetch schedules:", e);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const saveScheduleToDB = async (classStandard, sectionId, periodIndex, roomNo, teacherName, subjectName) => {
    const payload = {
      classStandard: parseInt(classStandard),
      sectionId: parseInt(sectionId),
      periodIndex: parseInt(periodIndex),
      timingLabel: PERIOD_TIMINGS[periodIndex],
      teacherName: teacherName === 'Unassigned' ? '' : teacherName,
      subjectName: subjectName === 'General' ? '' : subjectName,
      roomNo: roomNo,
      scheduleDate: selectedDate
    };

    try {
      let res = await fetch('http://localhost:8099/api/staff-portal/schedules/cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8092/api/staff-portal/schedules/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Failed to save schedule cell to DB:", e);
    }
  };

  const deleteScheduleFromDB = async (classStandard, sectionId, periodIndex) => {
    try {
      const urlParams = `classStandard=${classStandard}&sectionId=${sectionId}&periodIndex=${periodIndex}&scheduleDate=${selectedDate}`;
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules/cell?${urlParams}`, {
        method: 'DELETE'
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules/cell?${urlParams}`, {
          method: 'DELETE'
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Failed to delete schedule cell from DB:", e);
    }
  };

  useEffect(() => {
    fetchSchedules(selectedDate);
  }, [selectedDate]);

  const showToast = (msg, type = 'warning') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchTeachers = async () => {
    try {
      let combinedTeachers = [];

      // 1. Fetch from Staff Portal Service teachers table
      try {
        const response = await fetch('http://localhost:8099/api/staff-portal/teachers');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            combinedTeachers = data;
          }
        }
      } catch (e) {}

      // 2. ALSO fetch from Teacher Portal Service (where teachers select/save their subjects!)
      try {
        const tpRes = await fetch('http://localhost:8099/api/teacher-portal/teachers');
        if (tpRes.ok) {
          const tpData = await tpRes.json();
          if (Array.isArray(tpData) && tpData.length > 0) {
            // Map or merge chosen subjects into teacher list
            const tpMapped = tpData.map(t => ({
              id: t.id,
              name: t.name || t.username,
              subject: t.subject || 'General'
            }));

            if (combinedTeachers.length === 0) {
              combinedTeachers = tpMapped;
            } else {
              // Merge/Override updated subjects from teacher_portal table
              tpMapped.forEach(tpItem => {
                const idx = combinedTeachers.findIndex(c => c.name?.toLowerCase() === tpItem.name?.toLowerCase() || c.username?.toLowerCase() === tpItem.name?.toLowerCase());
                if (idx !== -1) {
                  combinedTeachers[idx] = { ...combinedTeachers[idx], subject: tpItem.subject };
                } else {
                  combinedTeachers.push(tpItem);
                }
              });
            }
          }
        }
      } catch (e) {}

      if (combinedTeachers.length > 0) {
        setTeachers(combinedTeachers);
      } else {
        setTeachers([
          { id: 1, name: 'Sarah Connor', subject: 'Mathematics' },
          { id: 2, name: 'teacher1 teacher1', subject: 'telugu' },
          { id: 3, name: 'teacher2 teacher2', subject: 'hindhi' }
        ]);
      }
    } catch (error) {
      setTeachers([
        { id: 1, name: 'Sarah Connor', subject: 'Mathematics' },
        { id: 2, name: 'teacher1 teacher1', subject: 'telugu' },
        { id: 3, name: 'teacher2 teacher2', subject: 'hindhi' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await fetch('http://localhost:8099/api/admin/admissions');
      if (response.ok) {
        const data = await response.json();
        setStudentsList(Array.isArray(data) ? data : []);
      } else {
        setStudentsList(getMockStudents());
      }
    } catch (error) {
      setStudentsList(getMockStudents());
    } finally {
      setStudentsLoading(false);
    }
  };

  const getMockStudents = () => [
    { id: 101, admissionId: 'ADM-2026-001', firstName: 'Alex', lastName: 'Morgan', username: 'alex_m', parentName: 'Robert Morgan', parentEmail: 'robert.m@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' },
    { id: 102, admissionId: 'ADM-2026-002', firstName: 'Daniel', lastName: 'Craig', username: 'daniel_c', parentName: 'James Craig', parentEmail: 'james.c@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' },
    { id: 103, admissionId: 'ADM-2026-003', firstName: 'Emily', lastName: 'Watson', username: 'emily_w', parentName: 'Arthur Watson', parentEmail: 'arthur.w@school.com', status: 'PENDING', applicantType: 'STUDENT' },
    { id: 104, admissionId: 'ADM-2026-004', firstName: 'Michael', lastName: 'Brown', username: 'michael_b', parentName: 'David Brown', parentEmail: 'david.b@school.com', status: 'REJECTED', applicantType: 'STUDENT' },
    { id: 105, admissionId: 'ADM-2026-005', firstName: 'Sophia', lastName: 'Taylor', username: 'sophia_t', parentName: 'Richard Taylor', parentEmail: 'richard.t@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' }
  ];

  const fetchMod3Students = async (clsStandard, secName) => {
    setMod3Loading(true);
    try {
      const url = `http://localhost:8099/api/staff-student/students?classStandard=${clsStandard}&sectionName=${secName}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8093/api/staff-student/students?classStandard=${clsStandard}&sectionName=${secName}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod3Students(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch students for module 3:", e);
    } finally {
      setMod3Loading(false);
    }
  };

  const fetchMod3MonthlyAttendance = async (clsStandard, secName, month, year) => {
    setMod3AttendanceLoading(true);
    try {
      const url = `http://localhost:8099/api/teacher-attendance/monthly?classStandard=${clsStandard}&sectionName=${secName}&month=${month}&year=${year}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8094/api/teacher-attendance/monthly?classStandard=${clsStandard}&sectionName=${secName}&month=${month}&year=${year}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod3AttendanceRecords(Array.isArray(data) ? data : []);
      } else {
        setMod3AttendanceRecords([]);
      }
    } catch (e) {
      console.error("Failed to fetch monthly attendance records:", e);
      setMod3AttendanceRecords([]);
    } finally {
      setMod3AttendanceLoading(false);
    }
  };

  const fetchStudentMonthlyAttendanceDetails = async (studentId, month, year) => {
    setStudentDetailLoading(true);
    try {
      const url = `http://localhost:8099/api/teacher-attendance/student-monthly?studentId=${studentId}&month=${month}&year=${year}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8094/api/teacher-attendance/student-monthly?studentId=${studentId}&month=${month}&year=${year}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setSelectedStudentAttendance(Array.isArray(data) ? data : []);
      } else {
        setSelectedStudentAttendance([]);
      }
    } catch (e) {
      console.error("Failed to fetch student details monthly attendance:", e);
      setSelectedStudentAttendance([]);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'module3') {
      fetchMod3Students(mod3SelectedClass, mod3SelectedSection);
      fetchMod3MonthlyAttendance(mod3SelectedClass, mod3SelectedSection, mod3SelectedMonth, mod3SelectedYear);
    }
  }, [activeTab, mod3SelectedClass, mod3SelectedSection, mod3SelectedMonth, mod3SelectedYear]);

  // Effect to load specific student detail records when modal filters change
  useEffect(() => {
    if (selectedStudentDetail) {
      fetchStudentMonthlyAttendanceDetails(selectedStudentDetail.studentId, detailModalMonth, detailModalYear);
    }
  }, [selectedStudentDetail, detailModalMonth, detailModalYear]);

  const fetchMod4Assignments = async (cls, sec) => {
    console.log(`[Examinations] fetchMod4Assignments called with class=${cls}, section=${sec}`);
    setMod4Loading(true);
    try {
      const url = `http://localhost:8099/api/staff-examination/assignments?classStandard=${cls}&sectionName=${sec}`;
      console.log(`[Examinations] Fetching from API Gateway: ${url}`);
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        const fallbackUrl = `http://localhost:8096/api/staff-examination/assignments?classStandard=${cls}&sectionName=${sec}`;
        console.log(`[Examinations] API Gateway failed, attempting direct fallback: ${fallbackUrl}`);
        res = await fetch(fallbackUrl).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        console.log(`[Examinations] Fetched ${data ? data.length : 0} assignments successfully:`, data);
        setMod4Assignments(data || []);
      } else {
        console.warn(`[Examinations] Fetch failed with status: ${res ? res.status : 'No Response'}`);
        setMod4Assignments([]);
      }
    } catch (err) {
      console.error('[Examinations] Failed to fetch assignments:', err);
      setMod4Assignments([]);
    } finally {
      setMod4Loading(false);
    }
  };

  const fetchMod4AssignmentQuestions = async (assignmentId) => {
    try {
      const url = `http://localhost:8099/api/staff-examination/assignments/${assignmentId}/questions`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8096/api/staff-examination/assignments/${assignmentId}/questions`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod4SelectedAssignmentQuestions(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignment questions:', err);
    }
  };

  const saveMod4Assignment = async () => {
    if (!mod4NewAssignmentTitle.trim()) {
      showToast('⚠️ Please enter an assignment title!', 'error');
      return;
    }
    if (!mod4NewAssignmentSubject.trim()) {
      showToast('⚠️ Please enter a subject name!', 'error');
      return;
    }
    if (!mod4NewAssignmentConductDate) {
      showToast('⚠️ Please select a conduct date and time!', 'error');
      return;
    }

    const filledQuestions = mod4NewQuestions.filter(q => q.questionText.trim() !== '');
    if (filledQuestions.length === 0) {
      showToast('⚠️ Please fill in at least one MCQ question!', 'error');
      return;
    }

    const payload = {
      assignmentTitle: mod4NewAssignmentTitle.trim(),
      classStandard: mod4SelectedClass,
      sectionName: mod4SelectedSection.toUpperCase(),
      subject: mod4NewAssignmentSubject.trim(),
      conductDate: mod4NewAssignmentConductDate,
      questions: filledQuestions
    };

    try {
      const url = `http://localhost:8099/api/staff-examination/assignment/save`;
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8096/api/staff-examination/assignment/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      if (res && res.ok) {
        showToast('✓ Assignment saved successfully in database!', 'success');
        setMod4NewAssignmentTitle('');
        setMod4NewAssignmentSubject('');
        setMod4NewAssignmentConductDate('');
        setMod4NewQuestions(() => {
          const arr = [];
          for (let i = 1; i <= 50; i++) {
            arr.push({ questionNumber: i, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
          }
          return arr;
        });
        setMod4ViewMode('list');
        fetchMod4Assignments(mod4SelectedClass, mod4SelectedSection);
      } else {
        showToast('⚠️ Failed to save assignment.', 'error');
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      showToast('⚠️ Connection error saving assignment.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'module4') {
      fetchMod4Assignments(mod4SelectedClass, mod4SelectedSection);
    }
  }, [activeTab, mod4SelectedClass, mod4SelectedSection]);

  const getTeacherAssignedCount = (teacherName) => {
    if (!selectedClass) return 0;
    let count = 0;
    for (let s = 1; s <= 3; s++) {
      for (let p = 0; p < 8; p++) {
        if (p === 3) continue;
        const cellKey = selectedClass + '_' + s + '_' + p;
        if (scheduleGrid[cellKey]?.teacher === teacherName) {
          count++;
        }
      }
    }
    return count;
  };

  const getClassFaculty = () => {
    const secId = mod3SelectedSection === 'A' ? 1 : mod3SelectedSection === 'B' ? 2 : 3;
    const list = [];
    const seen = new Set();
    
    for (let p = 0; p < 8; p++) {
      if (p === 3) continue; // Skip lunch
      const cellKey = `${mod3SelectedClass}_${secId}_${p}`;
      const cell = scheduleGrid[cellKey];
      if (cell && cell.teacher && cell.teacher !== 'Unassigned' && cell.teacher !== 'Lunch Break' && cell.sub && cell.sub !== 'General' && cell.sub !== 'Break') {
        const teacher = cell.teacher.trim();
        const subject = cell.sub.trim();
        const pairKey = `${teacher}-${subject}`;
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          list.push({ teacher, subject });
        }
      }
    }
    return list;
  };

  const handleStudentStatusUpdate = async (id, applicantType, newStatus, admissionId) => {
    const key = applicantType + '-' + id;
    setUpdatingStudentId(key);
    try {
      await fetch('http://localhost:8099/api/admin/admissions/' + id + '/status?applicantType=' + applicantType + '&status=' + newStatus, {
        method: 'PUT'
      });
      setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const handleDragStart = (e, teacherObj) => {
    e.dataTransfer.setData('application/json', JSON.stringify(teacherObj));
  };

  const fetchClassRooms = async () => {
    try {
      const response = await fetch('http://localhost:8099/api/staff-portal/classrooms');
      if (response.ok) {
        const data = await response.json();
        setClassRooms(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch classrooms:", e);
    }
  };

  const handleDrop = (sectionNum, colIdx, teacherObj) => {
    if (!selectedClass) return;
    if (colIdx === 3) {
      showToast('Lunch period (12:00-1:00 PM) is reserved for recess.', 'warning');
      return;
    }
    setActivePeriodTab(colIdx);

    const currentCellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const currentAssignment = scheduleGrid[currentCellKey];

    const classroomInfo = classRooms.find(r => r.classCode === `CLS_${selectedClass}_SEC_${sectionNum}`);
    const targetRoom = currentAssignment?.room_no || classroomInfo?.roomNo || ('Room ' + (100 + (selectedClass - 1) * 3 + sectionNum));

    // Double-Booking Conflict Prevention across ALL Classes & Sections (Teacher and Room)
    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        if (c === selectedClass && s === sectionNum) continue;
        const otherCellKey = c + '_' + s + '_' + colIdx;
        const otherAssignment = scheduleGrid[otherCellKey];
        
        // 1. Teacher double-booking check
        if (otherAssignment && otherAssignment.teacher && otherAssignment.teacher !== 'Unassigned') {
          if (otherAssignment.teacher === teacherObj.name) {
            showToast(`⚠️ Teacher Conflict: ${teacherObj.name} is already assigned to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
        
        // 2. Room double-booking check (strict check across all explicitly assigned room_no)
        if (otherAssignment && otherAssignment.room_no) {
          if (otherAssignment.room_no.toLowerCase() === targetRoom.toLowerCase()) {
            showToast(`⚠️ Room Conflict: ${targetRoom} is already allocated to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
      }
    }

    // Max Workload Limit per Teacher
    const currentCount = getTeacherAssignedCount(teacherObj.name);
    const isReplacingSelf = currentAssignment?.teacher === teacherObj.name;
    if (!isReplacingSelf && currentCount >= MAX_PERIODS_PER_TEACHER) {
      showToast('⛔ Workload Limit Exceeded: ' + teacherObj.name + ' has reached maximum ' + MAX_PERIODS_PER_TEACHER + ' periods for Class ' + selectedClass + '!', 'error');
      return;
    }

    setScheduleGrid(prev => ({
      ...prev,
      [currentCellKey]: {
        room_no: targetRoom,
        teacher: teacherObj.name,
        sub: teacherObj.subject
      }
    }));

    // Async DB Sync
    saveScheduleToDB(selectedClass, sectionNum, colIdx, targetRoom, teacherObj.name, teacherObj.subject);

    showToast('✓ Assigned ' + teacherObj.name + ' (' + teacherObj.subject + ') to Section ' + sectionNum + ' Period ' + PERIOD_TIMINGS[colIdx], 'success');
  };

  const handleDropRoom = (sectionNum, colIdx, roomData) => {
    if (!selectedClass) return;
    if (colIdx === 3) {
      showToast('Lunch period (12:00-1:00 PM) is reserved for recess.', 'warning');
      return;
    }
    setActivePeriodTab(colIdx);

    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const targetRoom = roomData.roomNo;

    // Room Double-Booking Conflict Prevention across ALL Classes & Sections for this period
    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        if (c === selectedClass && s === sectionNum) continue;
        const otherCellKey = c + '_' + s + '_' + colIdx;
        const otherAssignment = scheduleGrid[otherCellKey];
        
        if (otherAssignment && otherAssignment.room_no) {
          if (otherAssignment.room_no.toLowerCase() === targetRoom.toLowerCase()) {
            showToast(`⚠️ Room Conflict: ${targetRoom} is already allocated to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
      }
    }

    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: {
        ...(prev[cellKey] || { teacher: 'Unassigned', sub: 'General' }),
        room_no: targetRoom
      }
    }));

    // Async DB Sync
    const existing = scheduleGrid[cellKey];
    saveScheduleToDB(
      selectedClass, 
      sectionNum, 
      colIdx, 
      targetRoom, 
      existing?.teacher || 'Unassigned', 
      existing?.sub || 'General'
    );

    showToast(`✓ Allocated ${targetRoom} to Section ${sectionNum} Period ${PERIOD_TIMINGS[colIdx]}`, 'success');
  };

  const handleEditRoomNumber = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    setActivePeriodTab(colIdx);
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const classroomInfo = classRooms.find(r => r.classCode === `CLS_${selectedClass}_SEC_${sectionNum}`);
    const currentRoom = scheduleGrid[cellKey]?.room_no || classroomInfo?.roomNo || ('Room ' + (100 + (selectedClass - 1) * 3 + sectionNum));
    const newRoom = prompt('Enter Room Number for Period:', currentRoom);
    if (newRoom && newRoom.trim() !== '') {
      const trimmedRoom = newRoom.trim();
      
      // Conflict Prevention: Room Double-Booking across ALL Classes & Sections
      for (let c = 1; c <= 12; c++) {
        for (let s = 1; s <= 3; s++) {
          if (c === selectedClass && s === sectionNum) continue;
          const otherCellKey = c + '_' + s + '_' + colIdx;
          const otherAssignment = scheduleGrid[otherCellKey];
          
          if (otherAssignment && otherAssignment.room_no) {
            if (otherAssignment.room_no.toLowerCase() === trimmedRoom.toLowerCase()) {
              showToast('⚠️ Room Conflict: ' + trimmedRoom + ' is already allocated to Class ' + c + ' Section ' + s + ' during ' + PERIOD_TIMINGS[colIdx] + '!', 'error');
              return;
            }
          }
        }
      }

      setScheduleGrid(prev => ({
        ...prev,
        [cellKey]: {
          ...(prev[cellKey] || { teacher: 'Unassigned', sub: 'General' }),
          room_no: trimmedRoom
        }
      }));

      // Async DB Sync
      const existing = scheduleGrid[cellKey];
      saveScheduleToDB(
        selectedClass, 
        sectionNum, 
        colIdx, 
        trimmedRoom, 
        existing?.teacher || 'Unassigned', 
        existing?.sub || 'General'
      );
    }
  };

  const clearPeriodUnit = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    setActivePeriodTab(colIdx);
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: null
    }));
    
    // Async DB Sync
    deleteScheduleFromDB(selectedClass, sectionNum, colIdx);

    showToast('Period assignment cleared.', 'info');
  };

  const assignTeacherToCell = (sectionNum, colIdx, teacherObj) => {
    handleDrop(sectionNum, colIdx, teacherObj);
  };

  const assignRoomToCell = (sectionNum, colIdx, roomObj) => {
    handleDropRoom(sectionNum, colIdx, roomObj);
  };

  const getFormattedDateWithDay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const modulesList = [
    { id: 'module1', title: 'Schedule', subtitle: 'Class Timetable & Faculty Schedule', icon: <Calendar size={22} color="#38bdf8" />, color: '#38bdf8', desc: 'Overview of teacher directory, period allocation count & conflict-free drag & drop schedule.' },
    { id: 'module2', title: 'Student Directory', subtitle: 'All Students Data & Admissions', icon: <Users size={22} color="#4ade80" />, color: '#4ade80', desc: 'Complete student records: Student ID, First Name, Last Name, Username, Parent Name, Email, and Status (ACCEPTED / REJECTED).' },
    { id: 'module3', title: 'Student Details', subtitle: 'Detailed Student Database & Attendance Lookup', icon: <Users size={22} color="#f59e0b" />, color: '#f59e0b', desc: 'Browse student details and check monthly attendance logs from the database.' },
    { id: 'module4', title: 'Examinations', subtitle: 'Exams & MCQ Assignment Management', icon: <BookOpen size={22} color="#ec4899" />, color: '#ec4899', desc: 'Create, schedule, and view MCQ assignments for all 12 classes.' },
    { id: 'module5', title: 'Module 5', subtitle: 'Module 5 Feature', icon: <Clock size={22} color="#8b5cf6" />, color: '#8b5cf6', desc: 'Reports, analytics & staff administration controls.' }
  ];

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const firstName = user?.firstName || 'Administrative';
  const lastName = user?.lastName || 'Staff';
  const email = user?.email || 'staff@school.com';
  const initialLetter = firstName.charAt(0).toUpperCase();

  return (
    <div style={{ width: '100%', maxWidth: '98%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box', padding: '0 1rem' }}>
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : notification.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(245, 158, 11, 0.95)',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '700',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} />
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
            }}
          >
            {initialLetter}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 className="welcome-title" style={{ fontSize: '1.35rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                {firstName} {lastName}
              </h2>
              <span className="role-pill staff" style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', borderColor: 'rgba(14, 165, 233, 0.5)', fontSize: '0.75rem' }}>
                STAFF PORTAL
              </span>
            </div>
            <p className="user-email-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>ROLE</div>
            <div style={{ color: '#fde047', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>
              Administrative Staff
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Portal Card */}
      <div className="dashboard-card" style={{ width: '100%', padding: '1.5rem 1.75rem', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Module Sidebar Navigation */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              height: 'fit-content'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.2rem' }}>
              STAFF PORTAL MODULES
            </div>

            {modulesList.map((mod) => {
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: isActive ? 'linear-gradient(135deg, ' + mod.color + '25, ' + mod.color + '10)' : 'rgba(30, 41, 59, 0.4)',
                    border: isActive ? '1.5px solid ' + mod.color : '1px solid rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 14px ' + mod.color + '30' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {mod.icon}
                    <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '700' : '600' }}>
                      {mod.title}
                    </span>
                  </div>
                  <ChevronRight size={16} color={isActive ? mod.color : '#64748b'} />
                </button>
              );
            })}
          </div>

          {/* Right Content Workspace */}
          <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {modulesList.map((mod) => {
              if (activeTab !== mod.id) return null;
              return (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', minWidth: 0 }}>
                  {/* Module Header Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: mod.color + '20',
                          border: '1px solid ' + mod.color + '50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {mod.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                          {mod.title} – {mod.subtitle}
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, marginTop: '2px' }}>
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    {/* Schedule Header Action Controls */}
                    {mod.id === 'module1' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={fetchTeachers}
                          title="Sync fresh teacher database subjects"
                          style={{
                            background: 'rgba(56, 189, 248, 0.15)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <RefreshCw size={14} className={loading ? 'spin' : ''} />
                          <span>Sync Teachers</span>
                        </button>

                        <button
                          onClick={() => setShowClassSidebar(!showClassSidebar)}
                          style={{
                            background: showClassSidebar ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: showClassSidebar ? '#38bdf8' : '#94a3b8',
                            border: showClassSidebar ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <Grid size={15} />
                          <span>{showClassSidebar ? 'Hide Classes' : 'Show Classes'}</span>
                        </button>

                        <div style={{ position: 'relative', minWidth: '200px' }}>
                          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            placeholder="Search teacher or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.85rem', width: '100%' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MODULE 1: TEACHER ALLOCATION TABLE WITH PERIOD COUNT + 12 CLASS BOXES */}
                  {mod.id === 'module1' ? (
                    <>
                      {/* Drag & Drop Rules Banner */}
                      <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#38bdf8' }}>
                          <Sparkles size={16} />
                          <span><strong>Live DB Sync Active:</strong> Auto-fetches teacher subject selections from MySQL database every 5s. Drag or click to assign!</span>
                        </div>
                        {activeTeacherClick && (
                          <div style={{ fontSize: '0.8rem', background: 'rgba(253, 224, 71, 0.2)', color: '#fde047', padding: '0.2rem 0.65rem', borderRadius: '8px', fontWeight: '700' }}>
                            Selected: {activeTeacherClick.name} ({activeTeacherClick.subject}) — Click cell to assign
                          </div>
                        )}
                        {activeRoomClick && (
                          <div style={{ fontSize: '0.8rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '0.2rem 0.65rem', borderRadius: '8px', fontWeight: '700' }}>
                            Selected Room: {activeRoomClick.roomNo} — Click cell to assign
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: showClassSidebar ? '1fr 340px' : '1fr', gap: '1.25rem', transition: 'all 0.3s ease', minWidth: 0 }}>
                        {/* Left: Compact Teacher Directory Table with Assigned Period Counter */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Users size={18} color="#38bdf8" />
                              <span>Teacher Directory & Workload</span>
                            </h4>
                            <span style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: '600' }}>
                              {filteredTeachers.length} Active Faculty
                            </span>
                          </div>

                          <div className="table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="portal-table" style={{ width: '100%' }}>
                              <thead>
                                <tr>
                                  <th>Teacher Name</th>
                                  <th>Subject</th>
                                  <th style={{ textAlign: 'center' }}>Periods Assigned</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTeachers.length > 0 ? (
                                  filteredTeachers.map((t) => {
                                    const assignedCount = getTeacherAssignedCount(t.name);
                                    const isMax = assignedCount >= MAX_PERIODS_PER_TEACHER;
                                    const isSelected = activeTeacherClick?.id === t.id;

                                    return (
                                      <tr
                                        key={t.id || t.userId || t.name}
                                        draggable={!isMax}
                                        onDragStart={(e) => handleDragStart(e, t)}
                                        onClick={() => setActiveTeacherClick(isSelected ? null : t)}
                                        style={{
                                          cursor: isMax ? 'not-allowed' : 'grab',
                                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                                          borderLeft: isSelected ? '3px solid #38bdf8' : 'none'
                                        }}
                                      >
                                        <td>
                                          <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>{t.name}</strong>
                                        </td>
                                        <td>
                                          <span className="class-pill" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)', padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}>
                                            <BookOpen size={11} style={{ marginRight: '4px' }} />
                                            {t.subject}
                                          </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                          <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            fontSize: '0.78rem',
                                            fontWeight: '700',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '10px',
                                            background: isMax ? 'rgba(239, 68, 68, 0.2)' : assignedCount > 2 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                            color: isMax ? '#f87171' : assignedCount > 2 ? '#fbbf24' : '#4ade80',
                                            border: isMax ? '1px solid rgba(239, 68, 68, 0.4)' : assignedCount > 2 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)'
                                          }}>
                                            {assignedCount} / {MAX_PERIODS_PER_TEACHER} {isMax ? '(FULL)' : 'Periods'}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                      No teacher records found in MySQL database table.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Right: 12 Class Boxes */}
                        {showClassSidebar && (
                          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                              <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Building size={16} color="#38bdf8" />
                                <span>Class Standards (1 to 12)</span>
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>12 Classes</span>
                                <button
                                  onClick={() => setShowClassSidebar(false)}
                                  title="Hide Class Standards"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#94a3b8',
                                    borderRadius: '8px',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                                const isSelected = selectedClass === num;
                                return (
                                  <button
                                    key={num}
                                    onClick={() => setSelectedClass(num)}
                                    style={{
                                      background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                                      border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: '12px',
                                      padding: '0.75rem 0.5rem',
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                      boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'
                                    }}
                                  >
                                    <div style={{ fontSize: '0.68rem', color: isSelected ? '#38bdf8' : '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>{num}</div>
                                  </button>
                                );
                              })}
                            </div>

                            {selectedClass && (
                              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', border: '1.5px solid #38bdf8', borderRadius: '10px', fontSize: '0.82rem', color: '#38bdf8', textAlign: 'center', fontWeight: '700', boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)' }}>
                                ✓ Standard Class {selectedClass} Active
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3 SEPARATE STANDALONE CENTERED SECTION CARDS */}
                      {selectedClass && (
                        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', width: '100%', minWidth: 0, marginTop: '1.25rem', alignItems: 'start' }}>
                          {/* Left Column: 36 Unique Classes Status Board */}
                          <div
                            style={{
                              background: 'rgba(15, 23, 42, 0.75)',
                              border: '1.5px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '16px',
                              padding: '1.25rem',
                              boxSizing: 'border-box',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              position: 'sticky',
                              top: '20px',
                              maxHeight: 'calc(100vh - 40px)',
                              minWidth: 0
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Building size={16} color="#38bdf8" />
                                <span>36 Classes Live Tracker</span>
                              </h4>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <label style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Selected Hour:
                              </label>
                              <select
                                value={activePeriodTab}
                                onChange={(e) => setActivePeriodTab(parseInt(e.target.value))}
                                style={{
                                  background: 'rgba(30, 41, 59, 0.9)',
                                  color: '#ffffff',
                                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                                  borderRadius: '8px',
                                  padding: '0.45rem',
                                  fontSize: '0.82rem',
                                  fontWeight: '600',
                                  outline: 'none',
                                  cursor: 'pointer',
                                  width: '100%'
                                }}
                              >
                                {PERIOD_TIMINGS.map((timing, idx) => (
                                  <option key={idx} value={idx}>
                                    Period {idx === 3 ? '4' : idx + (idx > 3 ? 0 : 1)} ({timing})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', paddingRight: '0.25rem', flex: 1, scrollbarWidth: 'thin' }}>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div style={{ width: '28px', color: '#64748b', fontSize: '0.72rem', fontWeight: '800', textAlign: 'center' }}>
                                    C{c}
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', flex: 1 }}>
                                    {[1, 2, 3].map((s) => {
                                      const classroomInfo = classRooms.find(r => r.classCode === `CLS_${c}_SEC_${s}`);
                                      const defaultRoom = classroomInfo?.roomNo || ('Room ' + (100 + (c - 1) * 3 + s));
                                      
                                      // Check if this defaultRoom is occupied by ANY class during the active hour
                                      let occupyingClass = null;
                                      let occupyingAssignment = null;
                                      for (let oc = 1; oc <= 12; oc++) {
                                        for (let os = 1; os <= 3; os++) {
                                          const key = oc + '_' + os + '_' + activePeriodTab;
                                          const asg = scheduleGrid[key];
                                          if (asg && asg.room_no && asg.room_no.toLowerCase() === defaultRoom.toLowerCase()) {
                                            occupyingClass = { c: oc, s: os };
                                            occupyingAssignment = asg;
                                            break;
                                          }
                                        }
                                        if (occupyingClass) break;
                                      }

                                      const roomName = defaultRoom;
                                      const isCurrentClass = selectedClass === c;
                                      const isSelectedRoom = activeRoomClick?.roomNo === roomName;
                                      
                                      return (
                                        <div
                                          key={s}
                                          onClick={() => {
                                            setSelectedClass(c);
                                            if (!occupyingClass) {
                                              if (activeRoomClick?.roomNo === roomName) {
                                                setActiveRoomClick(null);
                                              } else {
                                                setActiveRoomClick({ roomNo: roomName, classCode: `CLS_${c}_SEC_${s}` });
                                                setActiveTeacherClick(null); // Clear teacher click selection if any
                                              }
                                            }
                                          }}
                                          draggable={!occupyingClass}
                                          onDragStart={(e) => {
                                            if (occupyingClass) {
                                              e.preventDefault();
                                              return;
                                            }
                                            e.dataTransfer.setData('text/plain', roomName);
                                            e.dataTransfer.setData('application/room-transfer', JSON.stringify({ roomNo: roomName, classCode: `CLS_${c}_SEC_${s}` }));
                                          }}
                                          style={{
                                            padding: '0.45rem',
                                            background: isSelectedRoom
                                              ? 'rgba(168, 85, 247, 0.15)'
                                              : occupyingClass
                                                ? 'rgba(239, 68, 68, 0.08)' 
                                                : isCurrentClass 
                                                  ? 'rgba(56, 189, 248, 0.12)' 
                                                  : 'rgba(30, 41, 59, 0.5)',
                                            border: isSelectedRoom
                                              ? '2px solid #c084fc'
                                              : occupyingClass
                                                ? '1px solid rgba(239, 68, 68, 0.35)' 
                                                : isCurrentClass 
                                                  ? '1.5px solid #38bdf8' 
                                                  : '1px solid rgba(255, 255, 255, 0.06)',
                                            boxShadow: isSelectedRoom ? '0 0 14px rgba(168, 85, 247, 0.45)' : 'none',
                                            borderRadius: '8px',
                                            cursor: occupyingClass ? 'not-allowed' : isSelectedRoom ? 'pointer' : 'grab',
                                            textAlign: 'center',
                                            transition: 'all 0.15s ease'
                                          }}
                                          title={occupyingClass 
                                            ? `Room ${roomName} occupied by Class ${occupyingClass.c} Sec ${occupyingClass.s === 1 ? 'A' : occupyingClass.s === 2 ? 'B' : 'C'}\nTeacher: ${occupyingAssignment.teacher || 'Unassigned'}`
                                            : `Class ${c} Section ${s}\nRoom: ${roomName}\nStatus: Vacant`
                                          }
                                        >
                                          <div style={{ fontSize: '0.74rem', color: '#ffffff', fontWeight: '800' }}>
                                            {c}-{s === 1 ? 'A' : s === 2 ? 'B' : 'C'}
                                          </div>
                                          <div style={{ fontSize: '0.62rem', color: occupyingClass ? '#f87171' : '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px', fontWeight: '600' }}>
                                            {roomName}
                                          </div>
                                          <div style={{ fontSize: '0.6rem', color: occupyingClass ? '#fca5a5' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                                            {occupyingClass 
                                              ? `${occupyingAssignment.teacher || 'Unassigned'}`
                                              : 'Vacant'
                                            }
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right Column: Timetable Cards */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
                            {/* Date Selector & Day Display Bar */}
                            <div
                              style={{
                                width: '100%',
                                padding: '1.2rem 1.5rem',
                                display: 'flex',
                                justify: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                background: 'rgba(15, 23, 42, 0.85)',
                                border: '1.5px solid rgba(56, 189, 248, 0.3)',
                                borderRadius: '16px',
                                boxSizing: 'border-box'
                              }}
                            >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <Calendar size={20} color="#38bdf8" />
                              <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>
                                Class {selectedClass} Timetable Schedule — Live DB Sync Active
                              </h4>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '0.25rem 0.5rem' }}>
                                 <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', paddingLeft: '0.4rem' }}>Select Date:</span>
                                 <input
                                   type="date"
                                   value={selectedDate}
                                   onChange={(e) => setSelectedDate(e.target.value)}
                                   style={{
                                     background: 'transparent',
                                     color: '#ffffff',
                                     border: 'none',
                                     borderRadius: '8px',
                                     padding: '0.35rem 0.5rem',
                                     fontSize: '0.82rem',
                                     fontWeight: '600',
                                     outline: 'none',
                                     cursor: 'pointer'
                                   }}
                                 />
                               </div>
                               
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                 <button
                                   onClick={handleNavigateYesterday}
                                   style={{
                                     background: 'rgba(30, 41, 59, 0.5)',
                                     color: '#94a3b8',
                                     border: '1px solid rgba(255, 255, 255, 0.08)',
                                     borderRadius: '8px',
                                     padding: '0.45rem 0.85rem',
                                     fontSize: '0.82rem',
                                     fontWeight: '600',
                                     cursor: 'pointer',
                                     transition: 'all 0.15s ease'
                                   }}
                                   onMouseEnter={(e) => {
                                     e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                                     e.target.style.color = '#ffffff';
                                   }}
                                   onMouseLeave={(e) => {
                                     e.target.style.background = 'rgba(30, 41, 59, 0.5)';
                                     e.target.style.color = '#94a3b8';
                                   }}
                                 >
                                   &lsaquo; Yesterday
                                 </button>
                                 <button
                                   onClick={handleNavigateToday}
                                   style={{
                                     background: 'rgba(56, 189, 248, 0.12)',
                                     color: '#38bdf8',
                                     border: '1px solid rgba(56, 189, 248, 0.4)',
                                     borderRadius: '8px',
                                     padding: '0.45rem 0.85rem',
                                     fontSize: '0.82rem',
                                     fontWeight: '700',
                                     cursor: 'pointer',
                                     transition: 'all 0.15s ease'
                                   }}
                                   onMouseEnter={(e) => {
                                     e.target.style.background = 'rgba(56, 189, 248, 0.2)';
                                   }}
                                   onMouseLeave={(e) => {
                                     e.target.style.background = 'rgba(56, 189, 248, 0.12)';
                                   }}
                                 >
                                   Today
                                 </button>
                                 <button
                                   onClick={handleNavigateTomorrow}
                                   style={{
                                     background: 'rgba(30, 41, 59, 0.5)',
                                     color: '#94a3b8',
                                     border: '1px solid rgba(255, 255, 255, 0.08)',
                                     borderRadius: '8px',
                                     padding: '0.45rem 0.85rem',
                                     fontSize: '0.82rem',
                                     fontWeight: '600',
                                     cursor: 'pointer',
                                     transition: 'all 0.15s ease'
                                   }}
                                   onMouseEnter={(e) => {
                                     e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                                     e.target.style.color = '#ffffff';
                                   }}
                                   onMouseLeave={(e) => {
                                     e.target.style.background = 'rgba(30, 41, 59, 0.5)';
                                     e.target.style.color = '#94a3b8';
                                   }}
                                 >
                                   Tomorrow &rsaquo;
                                 </button>
                               </div>
                               
                               <span style={{ fontSize: '0.9rem', color: '#fde047', fontWeight: '700', background: 'rgba(253, 224, 71, 0.12)', border: '1px solid rgba(253, 224, 71, 0.3)', padding: '0.45rem 1rem', borderRadius: '10px' }}>
                                 {getFormattedDateWithDay(selectedDate)}
                               </span>
                             </div>
                          </div>

                          {/* Quick Drag-and-Drop Teacher Board */}
                          <div
                            style={{
                              width: '100%',
                              padding: '1.25rem',
                              background: 'rgba(15, 23, 42, 0.75)',
                              border: '1.5px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '16px',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <h5 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Users size={16} color="#38bdf8" />
                                <span>Quick Drag-and-Drop Teacher Board</span>
                              </h5>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                Drag a teacher card directly into any period cell below
                              </span>
                            </div>
                            
                            <div 
                              style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                overflowX: 'auto', 
                                paddingBottom: '0.5rem',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(56, 189, 248, 0.3) rgba(15, 23, 42, 0.5)'
                              }}
                            >
                              {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((t) => {
                                  const assignedCount = getTeacherAssignedCount(t.name);
                                  const isMax = assignedCount >= MAX_PERIODS_PER_TEACHER;
                                  const isSelected = activeTeacherClick?.id === t.id;

                                  return (
                                    <div
                                      key={'horiz_' + (t.id || t.userId || t.name)}
                                      draggable={!isMax}
                                      onDragStart={(e) => handleDragStart(e, t)}
                                      onClick={() => setActiveTeacherClick(isSelected ? null : t)}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.4rem',
                                        minWidth: '180px',
                                        padding: '0.75rem 1rem',
                                        background: isSelected 
                                          ? 'rgba(56, 189, 248, 0.15)' 
                                          : 'rgba(30, 41, 59, 0.7)',
                                        border: isSelected 
                                          ? '1.5px solid #38bdf8' 
                                          : '1.5px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        cursor: isMax ? 'not-allowed' : 'grab',
                                        userSelect: 'none',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.2)' : 'none'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                                          {t.name}
                                        </span>
                                        <span 
                                          style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '6px',
                                            background: isMax ? 'rgba(239, 68, 68, 0.2)' : assignedCount > 3 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                            color: isMax ? '#f87171' : assignedCount > 3 ? '#fbbf24' : '#4ade80',
                                            border: isMax ? '1px solid rgba(239, 68, 68, 0.4)' : assignedCount > 3 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)'
                                          }}
                                        >
                                          {assignedCount}/{MAX_PERIODS_PER_TEACHER}
                                        </span>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#a5b4fc', fontSize: '0.72rem' }}>
                                        <BookOpen size={10} />
                                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{t.subject}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div style={{ color: '#94a3b8', fontSize: '0.82rem', padding: '0.5rem 0' }}>
                                  No teacher records found in MySQL database.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Render Section 1, Section 2, Section 3 Cards */}
                          {[1, 2, 3].map((sectionNum) => {
                             const classroomInfo = classRooms.find(r => r.classCode === `CLS_${selectedClass}_SEC_${sectionNum}`);
                             return (
                               <div
                                 key={sectionNum}
                                 style={{
                                   width: '100%',
                                   padding: '1.25rem 1.5rem',
                                   display: 'flex',
                                   flexDirection: 'column',
                                   gap: '1rem',
                                   border: sectionNum === 1 ? '1.5px solid rgba(56, 189, 248, 0.35)' : sectionNum === 2 ? '1.5px solid rgba(168, 85, 247, 0.35)' : '1.5px solid rgba(74, 222, 128, 0.35)',
                                   background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
                                   borderRadius: '16px',
                                   boxSizing: 'border-box',
                                   minWidth: 0
                                 }}
                               >
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                   <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                                     Class {selectedClass} — Section {sectionNum} Schedule ({getFormattedDateWithDay(selectedDate)})
                                   </h4>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                     {classroomInfo && (
                                       <div style={{ 
                                         display: 'inline-flex', 
                                         alignItems: 'center', 
                                         gap: '0.4rem', 
                                         background: 'rgba(255, 255, 255, 0.06)', 
                                         border: '1.5px solid rgba(255, 255, 255, 0.12)', 
                                         padding: '0.25rem 0.65rem', 
                                         borderRadius: '10px', 
                                         fontSize: '0.74rem', 
                                         color: '#cbd5e1',
                                         fontWeight: '600'
                                       }}>
                                         <span>🏫 Room: <strong style={{ color: '#38bdf8' }}>{classroomInfo.roomNo || 'N/A'}</strong></span>
                                         <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>|</span>
                                         <span>👥 Cap: <strong style={{ color: '#4ade80' }}>{classroomInfo.capacity || 40}</strong></span>
                                       </div>
                                     )}
                                     <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', padding: '0.2rem 0.75rem', borderRadius: '12px', fontWeight: '700' }}>
                                       CLS_{selectedClass}_SEC_{sectionNum} • Section {sectionNum}
                                     </span>
                                   </div>
                                 </div>

                              <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(15, 23, 42, 0.7)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.82rem', minWidth: '700px' }}>
                                  <thead>
                                    <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1.5px solid rgba(56, 189, 248, 0.4)' }}>
                                      <th style={{ padding: '0.75rem 0.85rem', color: '#64748b', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left', minWidth: '120px' }}>
                                        TIMING
                                      </th>
                                      {['9-10', '10-11', '11-12', '12-01 (Lunch)', '01-02', '02-03', '03-04', '04-05'].map((t) => (
                                        <th
                                          key={t}
                                          style={{
                                            padding: '0.75rem 0.6rem',
                                            color: t.includes('Lunch') ? '#fde047' : '#38bdf8',
                                            fontWeight: '800',
                                            fontSize: '0.82rem',
                                            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                                            minWidth: '95px',
                                            background: t.includes('Lunch') ? 'rgba(253, 224, 71, 0.1)' : 'transparent'
                                          }}
                                        >
                                          {t}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {['room_no', 'teacher', 'sub'].map((rowKey, rIdx) => (
                                      <tr key={rowKey} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '0.75rem 0.85rem', color: rIdx === 0 ? '#38bdf8' : rIdx === 1 ? '#94a3b8' : '#fde047', fontWeight: '800', textAlign: 'left', background: 'rgba(15, 23, 42, 0.4)' }}>
                                          {rowKey}
                                        </td>
                                        {[0, 1, 2, 3, 4, 5, 6, 7].map((colIdx) => {
                                          const isLunch = colIdx === 3;
                                          const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
                                          const unit = scheduleGrid[cellKey];
                                          const val = unit ? unit[rowKey] : null;

                                          return (
                                            <td
                                              key={colIdx}
                                              onDragOver={(e) => e.preventDefault()}
                                              onDragEnter={(e) => {
                                                e.preventDefault();
                                                if (colIdx !== 3 && activePeriodTab !== colIdx) {
                                                  setActivePeriodTab(colIdx);
                                                }
                                              }}
                                              onDrop={(e) => {
                                                e.preventDefault();
                                                const rawRoom = e.dataTransfer.getData('application/room-transfer');
                                                const rawTeacher = e.dataTransfer.getData('application/json');
                                                if (rawRoom) {
                                                  handleDropRoom(sectionNum, colIdx, JSON.parse(rawRoom));
                                                } else if (rawTeacher) {
                                                  handleDrop(sectionNum, colIdx, JSON.parse(rawTeacher));
                                                }
                                              }}
                                              onClick={() => {
                                                if (colIdx !== 3 && activePeriodTab !== colIdx) {
                                                  setActivePeriodTab(colIdx);
                                                }
                                                if (activeTeacherClick) {
                                                  assignTeacherToCell(sectionNum, colIdx, activeTeacherClick);
                                                } else if (activeRoomClick) {
                                                  assignRoomToCell(sectionNum, colIdx, activeRoomClick);
                                                }
                                              }}
                                              style={{
                                                padding: '0.4rem 0.5rem',
                                                borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                                                height: '42px',
                                                background: isLunch
                                                  ? 'rgba(253, 224, 71, 0.08)'
                                                  : (unit ? 'rgba(56, 189, 248, 0.08)' : 'transparent'),
                                                cursor: isLunch ? 'not-allowed' : 'pointer'
                                              }}
                                            >
                                              {isLunch ? (
                                                rIdx === 0 ? (
                                                  <span style={{ color: '#fde047', fontWeight: '700', fontSize: '0.78rem' }}>— Lunch —</span>
                                                ) : rIdx === 1 ? (
                                                  <span style={{ color: '#fde047', fontWeight: '700', fontSize: '0.78rem' }}>☕ Lunch Break</span>
                                                ) : (
                                                  <span style={{ color: '#fcd34d', fontWeight: '700', fontSize: '0.75rem' }}>Recess</span>
                                                )
                                              ) : rIdx === 0 ? (
                                                <div
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (activeRoomClick) {
                                                      assignRoomToCell(sectionNum, colIdx, activeRoomClick);
                                                    } else {
                                                      handleEditRoomNumber(sectionNum, colIdx);
                                                    }
                                                  }}
                                                  title="Click to Edit Room Number"
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    cursor: 'pointer',
                                                    padding: '0.15rem 0.4rem',
                                                    borderRadius: '6px',
                                                    background: 'rgba(56, 189, 248, 0.12)',
                                                    border: '1px solid rgba(56, 189, 248, 0.3)'
                                                  }}
                                                >
                                                  <span style={{ color: val ? '#38bdf8' : '#64748b', fontWeight: val ? '700' : '500', fontSize: '0.78rem' }}>
                                                    {val || '—'}
                                                  </span>
                                                  <Edit2 size={10} color="#38bdf8" />
                                                </div>
                                              ) : val ? (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                  <span style={{ color: rIdx === 1 ? '#4ade80' : '#fde047', fontWeight: '700', fontSize: '0.78rem' }}>
                                                    {val}
                                                  </span>
                                                  {rIdx === 2 && (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        clearPeriodUnit(sectionNum, colIdx);
                                                      }}
                                                      title="Clear period unit"
                                                      style={{
                                                        background: 'rgba(239, 68, 68, 0.2)',
                                                        border: '1px solid rgba(239, 68, 68, 0.4)',
                                                        color: '#f87171',
                                                        borderRadius: '50%',
                                                        width: '16px',
                                                        height: '16px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.65rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                      }}
                                                    >
                                                      <X size={10} />
                                                    </button>
                                                  )}
                                                </div>
                                              ) : (
                                                rIdx === 1 ? (
                                                  <span style={{ color: 'rgba(148, 163, 184, 0.3)', fontSize: '0.7rem' }}>
                                                    + Drop
                                                  </span>
                                                ) : null
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : mod.id === 'module2' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', minWidth: 0 }}>
                      {/* Top Statistics Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', width: '100%' }}>
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>TOTAL STUDENTS</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>{studentsList.length}</div>
                        </div>

                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#4ade80', textTransform: 'uppercase', fontWeight: '700' }}>ACCEPTED</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80', marginTop: '4px' }}>
                            {studentsList.filter(s => s.status === 'ACCEPTED').length}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', fontWeight: '700' }}>REJECTED</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f87171', marginTop: '4px' }}>
                            {studentsList.filter(s => s.status === 'REJECTED').length}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ fontSize: '0.75rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: '700' }}>PENDING</div>
                          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fbbf24', marginTop: '4px' }}>
                            {studentsList.filter(s => s.status === 'PENDING').length}
                          </div>
                        </div>
                      </div>

                      {/* Filter & Search Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1.2rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: '220px' }}>
                          <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="text"
                              placeholder="Search by Student ID, Name, Username, Parent Name, Email..."
                              value={studentSearchQuery}
                              onChange={(e) => setStudentSearchQuery(e.target.value)}
                              className="form-input"
                              style={{ paddingLeft: '2.3rem', width: '100%', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <select
                            value={studentStatusFilter}
                            onChange={(e) => setStudentStatusFilter(e.target.value)}
                            style={{
                              background: 'rgba(30, 41, 59, 0.8)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              padding: '0.5rem 0.85rem',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="ALL">All Statuses</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PENDING">PENDING</option>
                          </select>

                          <button
                            onClick={fetchStudents}
                            disabled={studentsLoading}
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              borderRadius: '10px',
                              padding: '0.5rem 0.9rem',
                              fontSize: '0.82rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <RefreshCw size={14} className={studentsLoading ? 'spin' : ''} />
                            <span>{studentsLoading ? 'Refreshing...' : 'Refresh Data'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Students Data Table */}
                      <div className="table-wrapper" style={{ width: '100%', overflowX: 'auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', boxSizing: 'border-box' }}>
                        <table className="portal-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                          <thead>
                            <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>STUDENT ID</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>FIRST NAME</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>LAST NAME</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>USER NAME</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>PARENT NAME</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>EMAIL</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>STATUS</th>
                              <th style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentsLoading ? (
                              <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                  Loading students data...
                                </td>
                              </tr>
                            ) : studentsList.filter(item => {
                              const q = studentSearchQuery.toLowerCase();
                              const stuId = (item.admissionId || ('ADM-' + item.id)).toLowerCase();
                              const fName = (item.firstName || '').toLowerCase();
                              const lName = (item.lastName || '').toLowerCase();
                              const uName = (item.username || item.childName || '').toLowerCase();
                              const pName = (item.parentName || '').toLowerCase();
                              const pEmail = (item.parentEmail || item.email || '').toLowerCase();
                              const matchesQuery = stuId.includes(q) || fName.includes(q) || lName.includes(q) || uName.includes(q) || pName.includes(q) || pEmail.includes(q);
                              const matchesStatus = studentStatusFilter === 'ALL' || item.status === studentStatusFilter;
                              return matchesQuery && matchesStatus;
                            }).length === 0 ? (
                              <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                  No student records found matching search or filter criteria.
                                </td>
                              </tr>
                            ) : (
                              studentsList
                                .filter(item => {
                                  const q = studentSearchQuery.toLowerCase();
                                  const stuId = (item.admissionId || ('ADM-' + item.id)).toLowerCase();
                                  const fName = (item.firstName || '').toLowerCase();
                                  const lName = (item.lastName || '').toLowerCase();
                                  const uName = (item.username || item.childName || '').toLowerCase();
                                  const pName = (item.parentName || '').toLowerCase();
                                  const pEmail = (item.parentEmail || item.email || '').toLowerCase();
                                  const matchesQuery = stuId.includes(q) || fName.includes(q) || lName.includes(q) || uName.includes(q) || pName.includes(q) || pEmail.includes(q);
                                  const matchesStatus = studentStatusFilter === 'ALL' || item.status === studentStatusFilter;
                                  return matchesQuery && matchesStatus;
                                })
                                .map((stu) => {
                                  const stuId = stu.admissionId || ('ADM-' + stu.id);
                                  const uName = stu.username || (stu.childName ? stu.childName.toLowerCase().replace(/\s+/g, '_') : stu.firstName ? stu.firstName.toLowerCase() : 'student');
                                  const pName = stu.parentName || ((stu.firstName || '') + ' ' + (stu.lastName || '')).trim();
                                  const pEmail = stu.parentEmail || stu.email || (uName + '@school.com');

                                  return (
                                    <tr key={stu.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}>
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                          {stuId}
                                        </span>
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: '600', fontSize: '0.88rem' }}>
                                        {stu.firstName || '—'}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: '600', fontSize: '0.88rem' }}>
                                        {stu.lastName || '—'}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: '600' }}>
                                        @{uName}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
                                        {pName}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.83rem' }}>
                                        {pEmail}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem' }}>
                                        {stu.status === 'ACCEPTED' ? (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            <CheckCircle2 size={13} />
                                            ACCEPTED
                                          </span>
                                        ) : stu.status === 'REJECTED' ? (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            <XCircle size={13} />
                                            REJECTED
                                          </span>
                                        ) : (
                                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                                            <Clock size={13} />
                                            PENDING
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                        <span style={{ 
                                          fontSize: '0.78rem', 
                                          fontWeight: '700', 
                                          color: stu.status === 'ACCEPTED' 
                                            ? '#4ade80' 
                                            : stu.status === 'REJECTED' 
                                              ? '#f87171' 
                                              : '#fbbf24',
                                          background: stu.status === 'ACCEPTED' 
                                            ? 'rgba(34, 197, 94, 0.1)' 
                                            : stu.status === 'REJECTED' 
                                              ? 'rgba(239, 68, 68, 0.1)' 
                                              : 'rgba(245, 158, 11, 0.1)',
                                          border: stu.status === 'ACCEPTED' 
                                            ? '1px solid rgba(34, 197, 94, 0.25)' 
                                            : stu.status === 'REJECTED' 
                                              ? '1px solid rgba(239, 68, 68, 0.25)' 
                                              : '1px solid rgba(245, 158, 11, 0.25)',
                                          padding: '0.25rem 0.65rem',
                                          borderRadius: '8px'
                                        }}>
                                          {stu.status === 'ACCEPTED' 
                                            ? 'Accepted' 
                                            : stu.status === 'REJECTED' 
                                              ? 'Rejected' 
                                              : 'Pending'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : mod.id === 'module3' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', minWidth: 0 }}>
                      
                      {/* Class Selection Filter Row */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1.5px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '1.25rem', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <h5 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Building size={16} color="#f59e0b" />
                            <span>Select Class Standard</span>
                          </h5>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Select Grade 1-12
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                            const isSelected = mod3SelectedClass === num;
                            return (
                              <button
                                key={num}
                                onClick={() => setMod3SelectedClass(num)}
                                style={{
                                  background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                                  border: isSelected ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '10px',
                                  padding: '0.55rem 0.25rem',
                                  color: isSelected ? '#f59e0b' : '#94a3b8',
                                  fontWeight: '800',
                                  fontSize: '0.82rem',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                C{num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section, Month/Year & Search Controls Row */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          
                          {/* Section selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.3rem 0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', paddingLeft: '0.4rem', marginRight: '0.2rem' }}>Section:</span>
                            {['A', 'B', 'C'].map((sec) => {
                              const isSelected = mod3SelectedSection === sec;
                              return (
                                <button
                                  key={sec}
                                  onClick={() => setMod3SelectedSection(sec)}
                                  style={{
                                    background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                    color: isSelected ? '#f59e0b' : '#94a3b8',
                                    border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
                                    borderRadius: '8px',
                                    padding: '0.3rem 0.75rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {sec}
                                </button>
                              );
                            })}
                          </div>

                          {/* Month Selector */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.3rem 0.5rem' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', paddingLeft: '0.4rem' }}>Month:</span>
                            <select
                              value={mod3SelectedMonth}
                              onChange={(e) => setMod3SelectedMonth(parseInt(e.target.value))}
                              style={{ background: 'rgba(30, 41, 59, 0.9)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.2rem 0.4rem', fontSize: '0.78rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                            >
                              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((mName, mIdx) => (
                                <option key={mIdx + 1} value={mIdx + 1}>{mName}</option>
                              ))}
                            </select>
                            <select
                              value={mod3SelectedYear}
                              onChange={(e) => setMod3SelectedYear(parseInt(e.target.value))}
                              style={{ background: 'rgba(30, 41, 59, 0.9)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.2rem 0.4rem', fontSize: '0.78rem', fontWeight: '700', outline: 'none', cursor: 'pointer', marginLeft: '0.2rem' }}
                            >
                              {[2025, 2026, 2027, 2028].map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                              ))}
                            </select>
                          </div>
                          
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {/* Search Input */}
                          <div style={{ position: 'relative', minWidth: '240px' }}>
                            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="text"
                              placeholder="Search student name or ID..."
                              value={mod3SearchQuery}
                              onChange={(e) => setMod3SearchQuery(e.target.value)}
                              className="form-input"
                              style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.75rem 0.45rem 2.2rem', fontSize: '0.85rem', width: '100%' }}
                            />
                          </div>

                          {/* Quick Strength Display Badge */}
                          <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.45rem 1rem', borderRadius: '10px', fontWeight: '700' }}>
                            Strength: {mod3Students.length} Students
                          </span>
                        </div>
                      </div>

                      {/* Associated Class Faculty & Subjects */}
                      {(() => {
                        const associatedFaculty = getClassFaculty();
                        if (associatedFaculty.length === 0) return null;
                        return (
                          <div style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '12px',
                            padding: '0.85rem 1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            boxSizing: 'border-box'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Associated Class Faculty & Subjects
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {associatedFaculty.map((fac, idx) => (
                                <span key={idx} style={{
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  color: '#f59e0b',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}>
                                  <strong style={{ color: '#ffffff' }}>{fac.teacher}</strong> ({fac.subject})
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Students List Directory Table */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem', minWidth: 0 }}>
                        <div className="table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
                          <table className="portal-table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student ID</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Name</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Parent Name</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Present Days</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Absent Days</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Attendance %</th>
                                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mod3Loading ? (
                                <tr>
                                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                      <RefreshCw size={24} className="spin" color="#f59e0b" />
                                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Fetching Student database details...</span>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                (() => {
                                  const filtered = mod3Students.filter(s =>
                                    s.firstName.toLowerCase().includes(mod3SearchQuery.toLowerCase()) ||
                                    s.lastName.toLowerCase().includes(mod3SearchQuery.toLowerCase()) ||
                                    s.studentId.toLowerCase().includes(mod3SearchQuery.toLowerCase()) ||
                                    s.parentName.toLowerCase().includes(mod3SearchQuery.toLowerCase())
                                  );

                                  if (filtered.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                          No matching student details found for Class {mod3SelectedClass} Section {mod3SelectedSection}.
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return filtered.map((stu) => {
                                    const studentRecs = mod3AttendanceRecords.filter(r => r.studentId === stu.studentId);
                                    const presentCount = studentRecs.filter(r => r.status === 'PRESENT').length;
                                    const absentCount = studentRecs.filter(r => r.status === 'ABSENT').length;
                                    const totalDays = studentRecs.length;
                                    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) + '%' : '0%';

                                    return (
                                      <tr key={stu.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}>
                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '700' }}>
                                          <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem' }}>
                                            {stu.studentId}
                                          </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: '600', fontSize: '0.85rem' }}>
                                          {stu.firstName} {stu.lastName}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
                                          {stu.parentName}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>
                                          {presentCount} Days
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#f87171', fontWeight: '700', fontSize: '0.85rem' }}>
                                          {absentCount} Days
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: '800' }}>
                                          <span style={{
                                            background: totalDays === 0 ? 'rgba(255, 255, 255, 0.05)' : parseInt(percentage) >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                            color: totalDays === 0 ? '#94a3b8' : parseInt(percentage) >= 75 ? '#10b981' : '#f87171',
                                            border: totalDays === 0 ? '1px solid rgba(255, 255, 255, 0.1)' : parseInt(percentage) >= 75 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem'
                                          }}>
                                            {totalDays === 0 ? 'No Logs' : percentage}
                                          </span>
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                          <button
                                            onClick={() => {
                                              setSelectedStudentDetail(stu);
                                              setDetailModalMonth(mod3SelectedMonth);
                                              setDetailModalYear(mod3SelectedYear);
                                            }}
                                            style={{
                                              background: 'rgba(245, 158, 11, 0.15)',
                                              color: '#f59e0b',
                                              border: '1px solid rgba(245, 158, 11, 0.3)',
                                              padding: '0.35rem 0.75rem',
                                              borderRadius: '8px',
                                              fontSize: '0.8rem',
                                              fontWeight: '700',
                                              cursor: 'pointer',
                                              transition: 'all 0.15s ease'
                                            }}
                                          >
                                            View Log
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : mod.id === 'module4' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
                      
                      {/* Top Selection Filters Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.85rem 1.25rem', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: '700' }}>Select Class Standard:</span>
                            <select
                              value={mod4SelectedClass}
                              onChange={(e) => setMod4SelectedClass(parseInt(e.target.value))}
                              style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.35rem 0.6rem', color: '#ffffff', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                                <option key={c} value={c}>{c} Standard</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: '700' }}>Section:</span>
                            <select
                              value={mod4SelectedSection}
                              onChange={(e) => setMod4SelectedSection(e.target.value.toUpperCase())}
                              style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.35rem 0.6rem', color: '#ffffff', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                            >
                              {['A', 'B', 'C'].map(sec => (
                                <option key={sec} value={sec}>Section {sec}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          {mod4ViewMode === 'list' ? (
                            <button
                              onClick={() => setMod4ViewMode('create')}
                              style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Plus size={16} />
                              <span>Create Assignment</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setMod4ViewMode('list')}
                              style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Back to Assignments List
                            </button>
                          )}
                        </div>
                      </div>

                      {/* VIEW MODE 1: LIST EXISTING ASSIGNMENTS (HISTORY) */}
                      {mod4ViewMode === 'list' && (
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem' }}>
                          <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                            <BookOpen size={18} color="#ec4899" />
                            <span>Assignment Conducted History (Class {mod4SelectedClass} - Section {mod4SelectedSection})</span>
                          </h4>

                          {mod4Loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#ec4899' }}>Loading assignments history...</div>
                          ) : mod4Assignments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                              <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                              <p style={{ margin: 0, fontSize: '0.92rem' }}>No assignments have been conducted for Class {mod4SelectedClass} - Section {mod4SelectedSection} yet.</p>
                              <button
                                onClick={() => setMod4ViewMode('create')}
                                style={{ marginTop: '1rem', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Create the First Assignment
                              </button>
                            </div>
                          ) : (
                            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                              <table className="portal-table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left', width: '160px' }}>Created Date</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left', width: '160px' }}>Conduct Date</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>Assignment Title</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left', width: '130px' }}>Subject</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'center', width: '90px' }}>Class</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'center', width: '80px' }}>Section</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'center', width: '120px' }}>Questions Count</th>
                                    <th style={{ padding: '0.85rem 1.1rem', textAlign: 'center', width: '120px' }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {mod4Assignments.map(asm => {
                                    const createdStr = asm.createdAt ? new Date(asm.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
                                    
                                    const formatConductDate = (dt) => {
                                      if (!dt) return '-';
                                      try {
                                        const d = new Date(dt);
                                        if (isNaN(d.getTime())) return dt;
                                        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                      } catch {
                                        return dt;
                                      }
                                    };

                                    const qCount = asm.questions ? asm.questions.length : 0;
                                    return (
                                      <tr key={asm.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{createdStr}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: '600' }}>{formatConductDate(asm.conductDate)}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#ffffff', fontWeight: '700', fontSize: '0.88rem' }}>{asm.assignmentTitle}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem' }}>{asm.subject || 'General'}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#ec4899', fontWeight: '700', fontSize: '0.88rem', textAlign: 'center' }}>C{asm.classStandard}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#cbd5e1', fontWeight: '700', fontSize: '0.88rem', textAlign: 'center' }}>{asm.sectionName}</td>
                                        <td style={{ padding: '0.85rem 1.1rem', color: '#a78bfa', fontWeight: '800', fontSize: '0.88rem', textAlign: 'center' }}>{qCount} MCQs</td>
                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                          <button
                                            onClick={() => {
                                              setMod4SelectedAssignment(asm);
                                              setMod4ViewMode('view');
                                              fetchMod4AssignmentQuestions(asm.id);
                                            }}
                                            style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                                          >
                                            View Details
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* VIEW MODE 2: CREATE NEW MCQ ASSIGNMENT */}
                      {mod4ViewMode === 'create' && (
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          
                          {/* Assignment Form Metadata Fields */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr auto auto', gap: '1.25rem', alignItems: 'end', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ minWidth: 0 }}>
                              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Assignment / Exam Title</label>
                              <input
                                type="text"
                                placeholder="Enter Exam Name (e.g. Unit Test 1)..."
                                value={mod4NewAssignmentTitle}
                                onChange={(e) => setMod4NewAssignmentTitle(e.target.value)}
                                style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.5rem 0.85rem', color: '#ffffff', fontSize: '0.9rem', width: '100%', outline: 'none' }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Subject Name</label>
                              <input
                                type="text"
                                placeholder="Enter Subject (e.g. Telugu, Physics)..."
                                value={mod4NewAssignmentSubject}
                                onChange={(e) => setMod4NewAssignmentSubject(e.target.value)}
                                style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.5rem 0.85rem', color: '#ffffff', fontSize: '0.9rem', width: '100%', outline: 'none' }}
                              />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Conduct Date & Time</label>
                              <input
                                type="datetime-local"
                                value={mod4NewAssignmentConductDate}
                                onChange={(e) => setMod4NewAssignmentConductDate(e.target.value)}
                                style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.48rem 0.85rem', color: '#ffffff', fontSize: '0.9rem', width: '100%', outline: 'none', colorScheme: 'dark', cursor: 'pointer' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Target Class</label>
                              <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: '#ec4899', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center' }}>
                                Class {mod4SelectedClass}
                              </div>
                            </div>
                            <div>
                              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>Target Section</label>
                              <div style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.5rem 1rem', color: '#38bdf8', fontWeight: '800', fontSize: '0.9rem', textAlign: 'center' }}>
                                Section {mod4SelectedSection}
                              </div>
                            </div>
                          </div>

                          {/* Quick Jump Sidebar Index Navigation */}
                          <div>
                            <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                              Quick Index Navigation (1 to 50 MCQ Questions)
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'rgba(15, 23, 42, 0.4)', padding: '0.6rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              {mod4NewQuestions.map((q, idx) => {
                                const isFilled = q.questionText.trim() !== '';
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      const element = document.getElementById(`q_card_${q.questionNumber}`);
                                      if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }
                                    }}
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: '800',
                                      border: isFilled ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.12)',
                                      background: isFilled ? 'rgba(236, 72, 153, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                                      color: isFilled ? '#ff79c6' : '#64748b',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title={isFilled ? `Question ${q.questionNumber} (Filled)` : `Question ${q.questionNumber} (Empty)`}
                                  >
                                    {q.questionNumber}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 50 MCQ Questions Builder Stack */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {mod4NewQuestions.map((q, idx) => {
                              return (
                                <div
                                  key={idx}
                                  id={`q_card_${q.questionNumber}`}
                                  style={{
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>
                                      QUESTION {q.questionNumber} OF 50
                                    </span>
                                    {q.questionText.trim() !== '' && (
                                      <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: '700' }}>✓ Active</span>
                                    )}
                                  </div>

                                  <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Question Prompt</label>
                                    <input
                                      type="text"
                                      placeholder={`Type MCQ question prompt #${q.questionNumber} here...`}
                                      value={q.questionText}
                                      onChange={(e) => {
                                        const newVal = e.target.value;
                                        setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, questionText: newVal } : item));
                                      }}
                                      style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.45rem 0.75rem', color: '#ffffff', fontSize: '0.85rem', width: '100%', outline: 'none' }}
                                    />
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div>
                                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Option A</label>
                                      <input
                                        type="text"
                                        placeholder="Option A"
                                        value={q.optionA}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionA: newVal } : item));
                                        }}
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Option B</label>
                                      <input
                                        type="text"
                                        placeholder="Option B"
                                        value={q.optionB}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionB: newVal } : item));
                                        }}
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Option C</label>
                                      <input
                                        type="text"
                                        placeholder="Option C"
                                        value={q.optionC}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionC: newVal } : item));
                                        }}
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '4px' }}>Option D</label>
                                      <input
                                        type="text"
                                        placeholder="Option D"
                                        value={q.optionD}
                                        onChange={(e) => {
                                          const newVal = e.target.value;
                                          setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionD: newVal } : item));
                                        }}
                                        style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem', color: '#ffffff', fontSize: '0.82rem', width: '100%', outline: 'none' }}
                                      />
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '700' }}>Correct Answer Option:</span>
                                    <select
                                      value={q.correctOption}
                                      onChange={(e) => {
                                        const newVal = e.target.value;
                                        setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, correctOption: newVal } : item));
                                      }}
                                      style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#4ade80', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
                                    >
                                      <option value="A">Option A</option>
                                      <option value="B">Option B</option>
                                      <option value="C">Option C</option>
                                      <option value="D">Option D</option>
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Submit Actions Bar */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
                            <button
                              type="button"
                              onClick={() => setMod4ViewMode('list')}
                              style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '0.65rem 1.25rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveMod4Assignment}
                              style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)' }}
                            >
                              Submit & Conduct Assignment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VIEW MODE 3: DETAILED QUESTIONS INSPECTION FOR SELECTED ASSIGNMENT */}
                      {mod4ViewMode === 'view' && mod4SelectedAssignment && (
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                            <div>
                              <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                                {mod4SelectedAssignment.assignmentTitle}
                              </h4>
                              <p style={{ color: '#ec4899', fontSize: '0.82rem', margin: '4px 0 0 0', fontWeight: '700' }}>
                                Class {mod4SelectedAssignment.classStandard} Standard - Section {mod4SelectedAssignment.sectionName} | Subject: {mod4SelectedAssignment.subject || 'General'}
                              </p>
                              <p style={{ color: '#cbd5e1', fontSize: '0.78rem', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <span>📅 <strong style={{ color: '#94a3b8' }}>Created:</strong> {mod4SelectedAssignment.createdAt ? new Date(mod4SelectedAssignment.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span>⏰ <strong style={{ color: '#38bdf8' }}>Conduct:</strong> {mod4SelectedAssignment.conductDate ? new Date(mod4SelectedAssignment.conductDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setMod4SelectedAssignment(null);
                                setMod4SelectedAssignmentQuestions([]);
                                setMod4ViewMode('list');
                              }}
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '0.4rem 0.85rem', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Back to List
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {mod4SelectedAssignmentQuestions.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>Loading questions details...</div>
                            ) : (
                              mod4SelectedAssignmentQuestions.map((q, idx) => (
                                <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '1rem', borderRadius: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#ec4899', fontSize: '0.75rem', fontWeight: '800' }}>QUESTION {q.questionNumber}</span>
                                    <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700' }}>
                                      Correct Option: {q.correctOption}
                                    </span>
                                  </div>
                                  <p style={{ color: '#ffffff', fontSize: '0.88rem', margin: '0 0 0.75rem 0', fontWeight: '600' }}>
                                    {q.questionText}
                                  </p>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                                    <div style={{ color: q.correctOption === 'A' ? '#4ade80' : '#94a3b8', fontSize: '0.8rem' }}>
                                      <strong style={{ color: q.correctOption === 'A' ? '#4ade80' : '#cbd5e1' }}>A)</strong> {q.optionA}
                                    </div>
                                    <div style={{ color: q.correctOption === 'B' ? '#4ade80' : '#94a3b8', fontSize: '0.8rem' }}>
                                      <strong style={{ color: q.correctOption === 'B' ? '#4ade80' : '#cbd5e1' }}>B)</strong> {q.optionB}
                                    </div>
                                    <div style={{ color: q.correctOption === 'C' ? '#4ade80' : '#94a3b8', fontSize: '0.8rem' }}>
                                      <strong style={{ color: q.correctOption === 'C' ? '#4ade80' : '#cbd5e1' }}>C)</strong> {q.optionC}
                                    </div>
                                    <div style={{ color: q.correctOption === 'D' ? '#4ade80' : '#94a3b8', fontSize: '0.8rem' }}>
                                      <strong style={{ color: q.correctOption === 'D' ? '#4ade80' : '#cbd5e1' }}>D)</strong> {q.optionD}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        minHeight: '320px'
                      }}
                    >
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          background: mod.color + '15',
                          border: '1px solid ' + mod.color + '30',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {mod.icon}
                      </div>
                      <div>
                        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
                          {mod.subtitle} Workspace
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '420px', lineHeight: '1.5' }}>
                          This module workspace is currently empty. Module features and interactive components will be built here later.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ATTENDANCE DETAIL MODAL */}
      {selectedStudentDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            boxSizing: 'border-box',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                  Attendance Log Details
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Student: <strong style={{ color: '#f59e0b' }}>{selectedStudentDetail.firstName} {selectedStudentDetail.lastName}</strong> ({selectedStudentDetail.studentId})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Info Row */}
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Parent Name</span>
                <span style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: '600' }}>{selectedStudentDetail.parentName}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block', textAlign: 'right' }}>Class & Section</span>
                <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '700' }}>C{selectedStudentDetail.classStandard} - Sec {selectedStudentDetail.sectionName}</span>
              </div>
            </div>

            {/* Modal Associated Faculty */}
            {(() => {
              const modalFaculty = getClassFaculty();
              if (modalFaculty.length === 0) return null;
              return (
                <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.65rem 0.85rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Class Faculty & Subjects</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {modalFaculty.map((fac, idx) => (
                      <span key={idx} style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                        {fac.teacher} ({fac.subject})
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Modal Month/Year Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '700' }}>Choose Log Month:</span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <select
                  value={detailModalMonth}
                  onChange={(e) => setDetailModalMonth(parseInt(e.target.value))}
                  style={{ background: 'rgba(30, 41, 59, 0.9)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.35rem 0.5rem', fontSize: '0.82rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((mName, mIdx) => (
                    <option key={mIdx + 1} value={mIdx + 1}>{mName}</option>
                  ))}
                </select>
                <select
                  value={detailModalYear}
                  onChange={(e) => setDetailModalYear(parseInt(e.target.value))}
                  style={{ background: 'rgba(30, 41, 59, 0.9)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.35rem 0.5rem', fontSize: '0.82rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
                >
                  {[2025, 2026, 2027, 2028].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Daily Logs List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '260px', paddingRight: '0.4rem' }}>
              {studentDetailLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  <RefreshCw size={20} className="spin" color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.85rem' }}>Fetching daily logs...</div>
                </div>
              ) : selectedStudentAttendance.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                  No attendance records found for this student in the selected month.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#ffffff' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '0.6rem 0.85rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentAttendance.map((record, rIdx) => (
                      <tr key={record.id || rIdx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: rIdx % 2 === 0 ? 'rgba(15, 23, 42, 0.2)' : 'rgba(30, 41, 59, 0.2)' }}>
                        <td style={{ padding: '0.6rem 0.85rem', color: '#e2e8f0', fontWeight: '500' }}>
                          {record.attendanceDate}
                        </td>
                        <td style={{ padding: '0.6rem 0.85rem', textAlign: 'center' }}>
                          <span
                            style={{
                              background: record.status === 'PRESENT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: record.status === 'PRESENT' ? '#10b981' : '#f87171',
                              border: record.status === 'PRESENT' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '700'
                            }}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
