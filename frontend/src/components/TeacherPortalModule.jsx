import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  BookMarked,
  CreditCard,
  User,
  Mail,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  LogOut,
  Clock,
  Book,
  GraduationCap,
  Coffee,
  Plus,
  Trash2,
  Save,
  IdCard,
  Shield
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/teacher-portal';
const DIRECT_URL = 'http://localhost:8091/api/teacher-portal';

const ATTENDANCE_GATEWAY_URL = 'http://localhost:8099/api/teacher-attendance';
const ATTENDANCE_DIRECT_URL = 'http://localhost:8094/api/teacher-attendance';

const DAY_TIME_SLOTS = [
  { slot: '09:00 AM - 10:00 AM', label: 'Period 1' },
  { slot: '10:00 AM - 11:00 AM', label: 'Period 2' },
  { slot: '11:00 AM - 12:00 PM', label: 'Period 3' },
  { slot: '12:00 PM - 01:00 PM', label: 'Period 4' },
  { slot: '01:00 PM - 02:00 PM', label: 'Lunch Break', isLunch: true },
  { slot: '02:00 PM - 03:00 PM', label: 'Period 5' },
  { slot: '03:00 PM - 04:00 PM', label: 'Period 6' },
  { slot: '04:00 PM - 05:00 PM', label: 'Period 7' }
];

export default function TeacherPortalModule({ user, onLogout, onBack }) {
  // Extract Registration / JWT Claims Data
  const username = user?.username || 'teacher';
  const email = user?.email || 'teacher@school.com';
  const firstName = user?.firstName || 'Robert';
  const lastName = user?.lastName || 'Vance';
  const rawUserId = user?.userId || user?.user_id || 20;
  const userIdStr = String(rawUserId).startsWith('Tea_') ? String(rawUserId) : `Tea_${rawUserId}`;
  const fullName = `${firstName} ${lastName}`.trim();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('module1');

  // Teacher Subjects State (teachers MySQL table)
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    subject: 'Mathematics'
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrMsg, setProfileErrMsg] = useState('');

  // Schedule State
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Module 3: Attendance States
  const [attendanceClass, setAttendanceClass] = useState(10);
  const [attendanceSection, setAttendanceSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState('');
  const [attendanceSaveErr, setAttendanceSaveErr] = useState('');

  useEffect(() => {
    fetchTeacherProfile();
    fetchTeacherSubjects();
  }, [username]);

  useEffect(() => {
    fetchSchedule();
    const intervalId = setInterval(() => {
      fetchSchedule();
    }, 5000); // Live sync every 5 seconds

    return () => clearInterval(intervalId);
  }, [username, selectedDate]);

  const changeDateByDays = (days) => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + days);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }
    } catch (e) {}
  };

  const setTodayDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const getFormattedDateWithDay = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = d.toLocaleDateString('en-US', { month: 'long' });
        const dayNum = d.getDate();
        const yearNum = d.getFullYear();
        return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const isExactTeacherMatch = (scheduledTeacherName) => {
    if (!scheduledTeacherName || !scheduledTeacherName.trim()) return false;
    const target = scheduledTeacherName.trim().toLowerCase();

    const uClean = username.trim().toLowerCase();
    const fClean = fullName.trim().toLowerCase();
    const firstClean = firstName.trim().toLowerCase();
    const lastClean = lastName.trim().toLowerCase();

    // 1. Exact string match
    if (target === fClean || target === uClean) return true;

    // 2. Exact full name match
    if (firstClean && lastClean && target === `${firstClean} ${lastClean}`) return true;

    // 3. Tokenized exact word match (prevents "teacher" from matching "teacher1" or "teacher2")
    const tokens = target.split(/[\s_,-]+/);
    if (tokens.includes(uClean)) return true;
    if (tokens.includes(fClean)) return true;
    if (firstClean && tokens.includes(firstClean) && lastClean && tokens.includes(lastClean)) return true;

    return false;
  };

  const fetchAttendanceRoster = async () => {
    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');
    try {
      let studentRes = await fetch(`${ATTENDANCE_GATEWAY_URL}/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`).catch(() => null);
      if (!studentRes || !studentRes.ok) {
        studentRes = await fetch(`${ATTENDANCE_DIRECT_URL}/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`).catch(() => null);
      }
      
      if (!studentRes || !studentRes.ok) {
        throw new Error('Failed to fetch student roster from directory service');
      }
      const students = await studentRes.json();
      
      let recordsRes = await fetch(`${ATTENDANCE_GATEWAY_URL}/records?classStandard=${attendanceClass}&sectionName=${attendanceSection}&date=${attendanceDate}`).catch(() => null);
      if (!recordsRes || !recordsRes.ok) {
        recordsRes = await fetch(`${ATTENDANCE_DIRECT_URL}/records?classStandard=${attendanceClass}&sectionName=${attendanceSection}&date=${attendanceDate}`).catch(() => null);
      }
      
      let records = [];
      if (recordsRes && recordsRes.ok) {
        records = await recordsRes.json();
      }

      const initialMap = {};
      students.forEach(student => {
        const matchingRecord = records.find(r => r.studentId === student.studentId);
        if (matchingRecord) {
          initialMap[student.studentId] = matchingRecord.status;
        } else {
          initialMap[student.studentId] = 'PRESENT';
        }
      });

      setStudentsRoster(students);
      setAttendanceMap(initialMap);
    } catch (err) {
      setAttendanceSaveErr(err.message || 'Error loading attendance roster');
      setStudentsRoster([]);
      setAttendanceMap({});
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (studentsRoster.length === 0) {
      setAttendanceSaveErr('No students to save attendance for.');
      return;
    }

    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');

    try {
      const recordsToSave = studentsRoster.map(student => ({
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        parentName: student.parentName,
        classStandard: parseInt(attendanceClass),
        sectionName: attendanceSection,
        attendanceDate: attendanceDate,
        status: attendanceMap[student.studentId] || 'PRESENT'
      }));

      let res = await fetch(`${ATTENDANCE_GATEWAY_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recordsToSave)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${ATTENDANCE_DIRECT_URL}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordsToSave)
        }).catch(() => null);
      }

      if (res && res.ok) {
        setAttendanceSaveMsg('Attendance saved successfully!');
      } else {
        throw new Error('Failed to save attendance records to the server');
      }
    } catch (err) {
      setAttendanceSaveErr(err.message || 'Error saving attendance records');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  useEffect(() => {
    if (activeTab === 'module3') {
      fetchAttendanceRoster();
    }
  }, [activeTab, attendanceClass, attendanceSection, attendanceDate]);

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/profile/${username}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/profile/${username}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        setProfileData({
          userId: rawUserId,
          username: username,
          email: email,
          firstName: firstName,
          lastName: lastName,
          primarySubject: 'Mathematics & Physics',
          role: 'TEACHER',
          status: 'CONFIRMED'
        });
      }
    } catch (err) {
      console.warn('Failed to fetch teacher profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSubjects = async () => {
    setSubjectLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/teachers/user/${username}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/teachers/user/${username}`).catch(() => null);
      }
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8099/api/student-portal/teachers`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setTeacherSubjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Failed to fetch teacher subjects:', err);
    } finally {
      setSubjectLoading(false);
    }
  };

  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules?scheduleDate=${selectedDate}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules?scheduleDate=${selectedDate}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Failed to fetch teacher schedule from staff portal database:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrMsg('');

    if (!subjectForm.subject || !subjectForm.subject.trim()) {
      setProfileErrMsg('Subject name is required');
      return;
    }

    const subjectsArray = subjectForm.subject
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (subjectsArray.length === 0) {
      setProfileErrMsg('Please enter at least one valid subject');
      return;
    }

    try {
      let savedCount = 0;
      let failedSubjects = [];

      for (let i = 0; i < subjectsArray.length; i++) {
        const sub = subjectsArray[i];
        
        // Skip duplicate entries if already in the list
        if (teacherSubjects.some(ts => ts.subject.toLowerCase() === sub.toLowerCase())) {
          failedSubjects.push(`${sub} (Already exists)`);
          continue;
        }

        const payload = {
          userId: userIdStr,
          username: subjectForm.username,
          name: `${subjectForm.firstName} ${subjectForm.lastName}`.trim(),
          subject: sub,
          numberOfSubjects: teacherSubjects.length + savedCount + 1
        };

        let res = await fetch(`${GATEWAY_URL}/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${DIRECT_URL}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);
        }

        if (res && res.ok) {
          savedCount++;
        } else {
          failedSubjects.push(sub);
        }
      }

      await fetchTeacherSubjects();

      if (savedCount > 0) {
        let msg = `${savedCount} subject(s) added successfully!`;
        if (failedSubjects.length > 0) {
          msg += ` (Failed: ${failedSubjects.join(', ')})`;
        }
        setProfileSuccessMsg(msg);
        setSubjectForm(prev => ({ ...prev, subject: '' }));
      } else {
        setProfileErrMsg(`Failed to save subjects: ${failedSubjects.join(', ')}`);
      }
    } catch (err) {
      setProfileErrMsg('Network error saving subjects');
    }
  };

  const handleDeleteSubjectRow = async (id) => {
    if (!window.confirm('Remove this subject entry from teachers table?')) return;
    try {
      let res = await fetch(`${GATEWAY_URL}/teachers/${id}`, { method: 'DELETE' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/teachers/${id}`, { method: 'DELETE' }).catch(() => null);
      }
      fetchTeacherSubjects();
    } catch (err) {
      console.warn('Failed to delete subject:', err);
    }
  };

  const initialLetter = firstName ? firstName[0].toUpperCase() : 'T';

  const modulesList = [
    {
      id: 'module1',
      title: 'Profile',
      subtitle: 'Teacher Profile Info',
      desc: 'Faculty member profile details, user ID, primary subject, contact email & account status.',
      icon: <User size={18} color="#38bdf8" />,
      color: '#38bdf8'
    },
    {
      id: 'module2',
      title: 'Schedule',
      subtitle: 'Morning to Evening Timetable',
      desc: 'Full morning to evening daily class schedule from 09:00 AM to 05:00 PM stored in database.',
      icon: <Clock size={18} color="#6366f1" />,
      color: '#6366f1'
    },
    {
      id: 'module3',
      title: 'Attendance',
      subtitle: 'Student Attendance & Marking',
      desc: 'Daily student attendance logs, section rosters & attendance reports.',
      icon: <Calendar size={18} color="#10b981" />,
      color: '#10b981'
    },
    {
      id: 'module4',
      title: 'Module 4',
      subtitle: 'Exam Grading & Assessment',
      desc: 'Term exam mark entry, report card generation & grade analytics.',
      icon: <Award size={18} color="#f59e0b" />,
      color: '#f59e0b'
    },
    {
      id: 'module5',
      title: 'Module 5',
      subtitle: 'Digital Library & Salary Paystubs',
      desc: 'E-books, research journals, monthly compensation history & payroll records.',
      icon: <CreditCard size={18} color="#06b6d4" />,
      color: '#06b6d4'
    }
  ];

  return (
    <div className="portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* TOP SECTION: Teacher Profile Card (Permanently Visible Header) */}
      <div
        className="profile-card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '800',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              {initialLetter}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                  {firstName} {lastName}
                </h2>
                <span className="role-pill teacher" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                  TEACHER PORTAL
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} color="#64748b" />
                {email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.8rem',
                borderRadius: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
            >
              <CheckCircle size={14} />
              Account Active & Confirmed
            </span>

            {onLogout && (
              <button
                className="btn-admission"
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem'
                }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>TEACHER ID</div>
            <div style={{ color: '#a5b4fc', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>
              {userIdStr}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>TEACHER NAME</div>
            <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>
              {fullName}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>PRIMARY SUBJECT</div>
            <div style={{ color: '#38bdf8', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>
              {teacherSubjects.length > 0 ? teacherSubjects.map(s => s.subject).join(', ') : (profileData?.primarySubject || 'Mathematics')}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>ROLE</div>
            <div style={{ color: '#fde047', fontWeight: '700', fontSize: '1rem', marginTop: '2px' }}>
              Faculty Member
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Sidebar Navigation + Right Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        {/* Left Sidebar Menu */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.85))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ArrowLeft size={14} /> Back to Teacher Portal
            </button>
          )}

          <div>
            <h4
              style={{
                color: '#64748b',
                fontSize: '0.72rem',
                fontWeight: '800',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: '0 0 0.75rem 0.5rem'
              }}
            >
              TEACHER PORTAL MODULES
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: isActive
                        ? '1px solid rgba(99, 102, 241, 0.5)'
                        : '1px solid transparent',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.08))'
                        : 'transparent',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {mod.icon}
                      <span>{mod.title}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.4 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Workspace */}
        <div>
          {/* MODULE 1: PROFILE FORM & MYSQL TEACHERS TABLE WORKSPACE */}
          {activeTab === 'module1' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>
                    Profile – Teacher Details & Subject Assignments
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                    Profile form with registration claims & subject assignments stored directly in MySQL <strong style={{ color: '#38bdf8' }}>teachers</strong> table.
                  </p>
                </div>
              </div>

              {/* Profile Registration Form */}
              <form
                onSubmit={handleAddSubject}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <IdCard size={18} color="#38bdf8" />
                    Teacher Registration Profile & Subject Form
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: '600' }}>
                    User ID: {userIdStr}
                  </span>
                </div>

                {profileSuccessMsg && (
                  <div style={{ color: '#4ade80', fontSize: '0.85rem', background: 'rgba(34, 197, 94, 0.15)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    {profileSuccessMsg}
                  </div>
                )}

                {profileErrMsg && (
                  <div style={{ color: '#ef4444', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    {profileErrMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '600' }}>Email Address</label>
                    <input
                      type="email"
                      value={subjectForm.email}
                      onChange={(e) => setSubjectForm({ ...subjectForm, email: e.target.value })}
                      placeholder="teacher@school.com"
                      className="search-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#38bdf8', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '700' }}>
                      Assign Subject (Stores in MySQL teachers table)
                    </label>
                    <input
                      type="text"
                      value={subjectForm.subject}
                      onChange={(e) => setSubjectForm({ ...subjectForm, subject: e.target.value })}
                      placeholder="e.g. social, telugu, hindi (comma-separated for multiple)"
                      className="search-input"
                      style={{ width: '100%', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn-admission"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.35rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Plus size={16} /> Save & Add Subject to MySQL Table
                  </button>
                </div>
              </form>

              {/* MYSQL TEACHERS TABLE DATA VIEW */}
              <div
                className="table-container"
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '1rem 1.25rem', background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="#38bdf8" />
                    MySQL Database Table: <code style={{ color: '#38bdf8' }}>teachers</code>
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Total Subjects Count: <strong style={{ color: '#fde047' }}>{teacherSubjects.length}</strong>
                  </span>
                </div>

                {subjectLoading ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    Loading records from teachers MySQL table...
                  </div>
                ) : teacherSubjects.length === 0 ? (
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
                    No subject records stored in <code style={{ color: '#38bdf8' }}>teachers</code> MySQL table for {fullName} yet. Fill the form above and click "Save & Add Subject".
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textTransform: 'uppercase', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>User ID (user_id)</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Username</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Teacher Name</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Subject Taught</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Subjects Count (number_of_subjects)</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherSubjects.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.3)'
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontWeight: '700' }}>
                            {row.userId || userIdStr}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                            {row.username}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#ffffff' }}>
                            {row.name}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#38bdf8', fontWeight: '700' }}>
                            {row.subject}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <span
                              style={{
                                background: 'rgba(253, 224, 71, 0.15)',
                                color: '#fde047',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid rgba(253, 224, 71, 0.3)',
                                fontWeight: '700',
                                fontSize: '0.85rem'
                              }}
                            >
                              {row.numberOfSubjects || teacherSubjects.length}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteSubjectRow(row.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Delete Subject Row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* MODULE 2: SCHEDULE WORKSPACE (PERSONALIZED TEACHER TIMETABLE) */}
          {activeTab === 'module2' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Clock size={20} color="#6366f1" />
                  </div>
                  <div>
                    <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>
                      Schedule – Personalized Daily Teaching Timetable (09:00 AM - 05:00 PM)
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                      Period-by-period daily schedule assigned by Staff in MySQL database for <strong style={{ color: '#38bdf8' }}>{fullName}</strong>.
                    </p>
                  </div>
                </div>

                {/* Date Selector & Everyday Navigation Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <Calendar size={16} color="#38bdf8" />
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>Select Date:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        colorScheme: 'dark',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      onClick={() => changeDateByDays(-1)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.8)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      ‹ Yesterday
                    </button>
                    <button
                      onClick={setTodayDate}
                      style={{
                        background: 'rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => changeDateByDays(1)}
                      style={{
                        background: 'rgba(165, 180, 252, 0.2)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(165, 180, 252, 0.4)',
                        borderRadius: '8px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Tomorrow ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Personalized Subject Filter Indicator Banner */}
              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <span>
                  Schedule for: <strong style={{ color: '#ffffff' }}>{fullName}</strong> ({username}) — Date:{' '}
                  <strong style={{ color: '#fde047' }}>{getFormattedDateWithDay(selectedDate)}</strong>
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  (Live database reflection from Staff Portal schedule assignments)
                </span>
              </div>

              {/* MORNING TO EVENING FULL DAILY TIMETABLE TABLE */}
              <div
                className="table-container"
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}
              >
                {scheduleLoading ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    Loading database class schedule...
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textTransform: 'uppercase', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Timing (Period)</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Class</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Section</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Room No</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { pIdx: 0, time: '9-10 (09:00 AM - 10:00 AM)', label: 'Period 1' },
                        { pIdx: 1, time: '10-11 (10:00 AM - 11:00 AM)', label: 'Period 2' },
                        { pIdx: 2, time: '11-12 (11:00 AM - 12:00 PM)', label: 'Period 3' },
                        { pIdx: 3, time: '12-01 (12:00 PM - 01:00 PM)', label: 'Lunch Break', isLunch: true },
                        { pIdx: 4, time: '01-02 (01:00 PM - 02:00 PM)', label: 'Period 4' },
                        { pIdx: 5, time: '02-03 (02:00 PM - 03:00 PM)', label: 'Period 5' },
                        { pIdx: 6, time: '03-04 (03:00 PM - 04:00 PM)', label: 'Period 6' },
                        { pIdx: 7, time: '04-05 (04:00 PM - 05:00 PM)', label: 'Period 7' }
                      ].map((slotObj, idx) => {
                        if (slotObj.isLunch) {
                          return (
                            <tr
                              key={slotObj.pIdx}
                              style={{
                                background: 'rgba(245, 158, 11, 0.12)',
                                borderBottom: '1px solid rgba(245, 158, 11, 0.2)'
                              }}
                            >
                              <td style={{ padding: '0.85rem 1rem', color: '#fcd34d', fontWeight: '700' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Clock size={14} color="#f59e0b" />
                                  {slotObj.time}
                                </span>
                              </td>
                              <td colSpan={5} style={{ padding: '0.85rem 1rem', color: '#fde047', fontWeight: '600' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Coffee size={16} />
                                  Lunch & Refreshment Break
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        // Match schedule from class_schedules database strictly for logged-in teacher
                        const matchedEntry = schedules.find((s) => {
                          if (s.periodIndex !== slotObj.pIdx) return false;
                          return isExactTeacherMatch(s.teacherName);
                        });

                        if (matchedEntry) {
                          return (
                            <tr
                              key={slotObj.pIdx}
                              style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.3)'
                              }}
                            >
                              <td style={{ padding: '0.85rem 1rem', color: '#a5b4fc', fontWeight: '700' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Clock size={14} color="#818cf8" />
                                  {slotObj.time}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#ffffff' }}>
                                Class {matchedEntry.classStandard}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <span
                                  style={{
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    color: '#818cf8',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    fontWeight: '700',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Section {matchedEntry.sectionId === 1 ? 'A' : matchedEntry.sectionId === 2 ? 'B' : 'C'}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#4ade80', fontWeight: '700' }}>
                                {matchedEntry.roomNo || `Room 10${slotObj.pIdx + 1}`}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#fde047', fontWeight: '700' }}>
                                {matchedEntry.subjectName}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  Assigned Class
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        // Free Period
                        return (
                          <tr
                            key={slotObj.pIdx}
                            style={{
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              background: 'rgba(15, 23, 42, 0.15)'
                            }}
                          >
                            <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontWeight: '600' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={14} color="#64748b" />
                                {slotObj.time}
                              </span>
                            </td>
                            <td colSpan={4} style={{ padding: '0.85rem 1rem', color: '#475569', fontStyle: 'italic' }}>
                              Free Period / No Assigned Class
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                              <span style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                                Free Slot
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* MODULE 3: ATTENDANCE WORKSPACE */}
          {activeTab === 'module3' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={20} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>
                      Student Attendance Roster & Marking
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                      Mark and review daily attendance logs for class sections. Saved records are stored in the database.
                    </p>
                  </div>
                </div>

                {/* Filter and Date Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  
                  {/* Date Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>Date:</span>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        colorScheme: 'dark',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Class Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>Class:</span>
                    <select
                      value={attendanceClass}
                      onChange={(e) => setAttendanceClass(parseInt(e.target.value))}
                      style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                        <option key={c} value={c}>Grade {c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>Section:</span>
                    <select
                      value={attendanceSection}
                      onChange={(e) => setAttendanceSection(e.target.value)}
                      style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#ffffff',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '0.3rem 0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {['A', 'B', 'C'].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={fetchAttendanceRoster}
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Reload
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {attendanceSaveMsg && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', color: '#4ade80', fontSize: '0.85rem', fontWeight: '600' }}>
                  {attendanceSaveMsg}
                </div>
              )}
              {attendanceSaveErr && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', fontWeight: '600' }}>
                  {attendanceSaveErr}
                </div>
              )}

              {/* Attendance Table */}
              <div
                className="table-container"
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}
              >
                {attendanceLoading ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                    Loading student roster & attendance history...
                  </div>
                ) : studentsRoster.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                    No students currently enrolled in Grade {attendanceClass} - Section {attendanceSection}.
                  </div>
                ) : (
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ffffff', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(30, 41, 59, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', textTransform: 'uppercase', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '80px' }}>No.</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student ID</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Student Name</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Parent Name</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '120px' }}>Present</th>
                          <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '150px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsRoster.map((student, idx) => {
                          const isPresent = attendanceMap[student.studentId] === 'PRESENT';
                          return (
                            <tr
                              key={student.studentId}
                              style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.3)' : 'rgba(30, 41, 59, 0.3)'
                              }}
                            >
                              <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontWeight: '500' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#38bdf8', fontWeight: '700' }}>
                                {student.studentId}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#ffffff' }}>
                                {student.firstName} {student.lastName}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                                {student.parentName || 'N/A'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isPresent}
                                  onChange={() => toggleAttendance(student.studentId)}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    accentColor: '#10b981'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                <span
                                  style={{
                                    background: isPresent ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: isPresent ? '#10b981' : '#f87171',
                                    border: isPresent ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    display: 'inline-block',
                                    minWidth: '70px'
                                  }}
                                >
                                  {isPresent ? 'PRESENT' : 'ABSENT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Footer stats row */}
                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.85)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                          Total Students: <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{studentsRoster.length}</strong>
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                          Present Count: <strong style={{ color: '#10b981', fontSize: '1rem' }}>{Object.values(attendanceMap).filter(v => v === 'PRESENT').length}</strong>
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                          Absent Count: <strong style={{ color: '#f87171', fontSize: '1rem' }}>{Object.values(attendanceMap).filter(v => v === 'ABSENT').length}</strong>
                        </span>
                      </div>

                      <button
                        onClick={handleSaveAttendance}
                        disabled={attendanceLoading}
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1.25rem',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Save size={16} />
                        Save Attendance
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTHER MODULES WORKSPACE PLACEHOLDERS */}
          {modulesList.map((mod) => {
            if (mod.id === 'module1' || mod.id === 'module2' || mod.id === 'module3' || activeTab !== mod.id) return null;
            return (
              <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${mod.color}20`,
                      border: `1px solid ${mod.color}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {mod.icon}
                  </div>
                  <div>
                    <h3 style={{ color: '#ffffff', fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>
                      {mod.title} – {mod.subtitle}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '3px 0 0 0' }}>
                      {mod.desc}
                    </p>
                  </div>
                </div>

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
                      background: `${mod.color}15`,
                      border: `1px solid ${mod.color}30`,
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
