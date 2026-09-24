import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Shield,
  Mail,
  IdCard,
  Sparkles,
  FileText,
  HelpCircle,
  LayoutDashboard,
  CheckCircle2,
  CheckCircle,
  Clock,
  Lock,
  BookOpen,
  Calendar,
  Award,
  BookMarked,
  CreditCard,
  Check,
  ChevronRight,
  Unlock,
  ArrowLeft,
  Search,
  Book,
  Download,
  Ban,
  XCircle
} from 'lucide-react';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';

const GATEWAY_URL = 'http://localhost:8099/api/student-portal';
const DIRECT_URL = 'http://localhost:8090/api/student-portal';

export default function StudentPortalModule({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('session'); // Default to main Student Portal session overview (Profile + 5 Modules Grid)
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [profileData, setProfileData] = useState(null);
  const [status, setStatus] = useState('PENDING'); // 'PENDING' | 'CONFIRMED' | 'REJECTED'
  const [loading, setLoading] = useState(true);

  const username = user?.username || 'student';
  const email = user?.email || 'student@school.com';
  const firstName = profileData?.firstName || user?.firstName || 'Alex';
  const lastName = profileData?.lastName || user?.lastName || 'Morgan';
  const fullName = `${firstName} ${lastName}`.trim();
  const studentClass = profileData?.studentClass || profileData?.grade || user?.studentClass || '10th Standard';
  const [academicsSchedule, setAcademicsSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const userId = user?.userId || 10;

  useEffect(() => {
    fetchProfileStatus();
    fetchAcademicsSchedule(selectedDate);
    const interval = setInterval(() => {
      fetchProfileStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    fetchAcademicsSchedule(selectedDate);
  }, [selectedDate, username]);

  const fetchAcademicsSchedule = async (dateVal) => {
    try {
      const url = `http://localhost:8099/api/student-schedule/timetable?username=${username}&date=${dateVal}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8095/api/student-schedule/timetable?username=${username}&date=${dateVal}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAcademicsSchedule(data.schedules || []);
      } else {
        setAcademicsSchedule([]);
      }
    } catch (err) {
      console.warn('Failed to fetch student academics schedule:', err);
      setAcademicsSchedule([]);
    }
  };

  const fetchProfileStatus = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/profile/${username}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/profile/${username}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setProfileData(data);
        const currentStat = (data.status || (data.admissionConfirmed ? 'CONFIRMED' : 'PENDING')).toUpperCase();
        setStatus(currentStat);
      } else {
        setProfileData({
          userId: userId,
          username: username,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'STUDENT',
          admissionConfirmed: false,
          status: 'PENDING'
        });
        setStatus('PENDING');
      }
    } catch (err) {
      console.warn('Failed to fetch student portal status:', err);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = status === 'CONFIRMED' || status === 'ACCEPTED';
  const isRejected = status === 'REJECTED';
  const isPending = !isConfirmed && !isRejected;

  const initialLetter = firstName ? firstName[0].toUpperCase() : 'A';

  const modulesList = [
    {
      id: 'module1',
      title: 'Schedule',
      subtitle: 'Daily Class Schedule',
      desc: 'Daily subject schedule (timings, teacher, subject) assigned by the staff.',
      icon: <Calendar size={18} color="#6366f1" />,
      color: '#6366f1'
    },
    {
      id: 'module2',
      title: 'Module 2',
      subtitle: 'Attendance & Timetable',
      desc: 'Daily attendance logs, weekly class timetable & academic schedule.',
      icon: <Calendar size={18} color="#10b981" />,
      color: '#10b981'
    },
    {
      id: 'module3',
      title: 'Module 3',
      subtitle: 'Examinations & Grades',
      desc: 'Exam dates, term report cards, performance analytics & grade sheets.',
      icon: <Award size={18} color="#f59e0b" />,
      color: '#f59e0b'
    },
    {
      id: 'module4',
      title: 'Module 4',
      subtitle: 'Digital Library & E-Books',
      desc: 'E-journals, online book reservations & digital research resources.',
      icon: <BookMarked size={18} color="#ec4899" />,
      color: '#ec4899'
    },
    {
      id: 'module5',
      title: 'Module 5',
      subtitle: 'Fees & Financial Records',
      desc: 'Online fee payments, payment receipts & financial summary.',
      icon: <CreditCard size={18} color="#06b6d4" />,
      color: '#06b6d4'
    }
  ];

  return (
    <div className="dashboard-card" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header matching screenshot */}
      <div className="dashboard-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.2rem' }}>
        <div className="user-welcome-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            className="avatar-badge"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isRejected
                ? 'linear-gradient(135deg, #ef4444, #991b1b)'
                : isConfirmed
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            {initialLetter}
          </div>
          <div>
            <h2 className="welcome-title" style={{ fontSize: '1.35rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
              Student Portal: {firstName} {lastName}
            </h2>
            <p className="user-email-text" style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <span className="role-pill student" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={14} />
            STUDENT
          </span>
          {onLogout && (
            <button className="btn-admission" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={16} />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className="portal-tabs-nav"
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.5rem 0.75rem',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Less Priority: Admission Form Module */}
        <button
          className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
          onClick={() => setActiveTab('admission')}
          style={{
            fontSize: '0.78rem',
            padding: '0.4rem 0.65rem',
            opacity: activeTab === 'admission' ? 1 : 0.6,
            color: activeTab === 'admission' ? '#ffffff' : '#94a3b8'
          }}
        >
          <FileText size={14} />
          <span>Admission Form Module</span>
        </button>

        {/* Less Priority: Student Enquiry Module */}
        <button
          className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
          onClick={() => setActiveTab('enquiry')}
          style={{
            fontSize: '0.78rem',
            padding: '0.4rem 0.65rem',
            opacity: activeTab === 'enquiry' ? 1 : 0.6,
            color: activeTab === 'enquiry' ? '#ffffff' : '#94a3b8'
          }}
        >
          <HelpCircle size={14} />
          <span>Student Enquiry Module</span>
        </button>

        {/* Highlighted Primary Tab: Student Portal */}
        <button
          className={`portal-tab-btn ${!['admission', 'enquiry'].includes(activeTab) ? 'active-session' : ''}`}
          onClick={() => setActiveTab('session')}
          style={{
            padding: '0.55rem 1rem',
            fontWeight: '700',
            background: !['admission', 'enquiry'].includes(activeTab) ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.06)',
            border: !['admission', 'enquiry'].includes(activeTab) ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            color: '#ffffff',
            boxShadow: !['admission', 'enquiry'].includes(activeTab) ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          <LayoutDashboard size={17} />
          <span>Student Portal</span>
        </button>
      </div>

      {/* Less Priority Tab 1: Admission Form Module */}
      {activeTab === 'admission' && <AdmissionModule user={user} />}

      {/* Less Priority Tab 2: Student Enquiry Module */}
      {activeTab === 'enquiry' && <EnquiryModule user={user} />}

      {/* STUDENT PORTAL MAIN SECTION */}
      {!['admission', 'enquiry'].includes(activeTab) && (
        <>
          {/* ALWAYS DISPLAY STUDENT PROFILE DETAILS AT THE TOP FOR ALL USERS/STATUSES */}
          <div className="session-info-container" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>
                Student Profile Details
              </h3>

              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontWeight: '700',
                  background: isConfirmed ? 'rgba(34, 197, 94, 0.15)' : isRejected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: isConfirmed ? '#4ade80' : isRejected ? '#ef4444' : '#fde047',
                  border: `1px solid ${isConfirmed ? 'rgba(34, 197, 94, 0.3)' : isRejected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {isConfirmed && <CheckCircle size={14} />}
                {isPending && <Clock size={14} />}
                {isRejected && <XCircle size={14} />}
                STATUS: {status}
              </span>
            </div>

            <div className="claims-grid">
              <div className="claim-card">
                <div className="claim-label">
                  <IdCard size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  USER ID
                </div>
                <div className="claim-value">Stu_{userId}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label">
                  <Shield size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  ASSIGNED ROLE
                </div>
                <div className="claim-value" style={{ color: '#818cf8', fontWeight: '700' }}>
                  STUDENT
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-label">
                  <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  REGISTERED USERNAME
                </div>
                <div className="claim-value">{username}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label">
                  <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  REGISTERED EMAIL
                </div>
                <div className="claim-value" style={{ fontSize: '0.9rem' }}>
                  {email}
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-label">
                  <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  STUDENT NAME
                </div>
                <div className="claim-value">{fullName}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label">
                  <BookOpen size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  ENROLLED CLASS
                </div>
                <div className="claim-value" style={{ color: '#38bdf8', fontWeight: '700' }}>
                  {studentClass}
                </div>
              </div>
            </div>
          </div>

          {/* CASE 1: REJECTED STATE */}
          {isRejected && (
            <div
              style={{
                padding: '2.5rem 2rem',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <Ban size={32} color="#ef4444" />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem' }}>
                <XCircle size={14} /> ADMISSION REJECTED - ACCESS BLOCKED
              </div>

              <h3 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                Student Portal Access Blocked
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.75rem', maxWidth: '600px', margin: '0.75rem auto 0', lineHeight: '1.5' }}>
                Your admission application has been rejected by the admin. Access to the Student Portal and its modules is blocked under your account.
              </p>
            </div>
          )}

          {/* CASE 2: PENDING STATE */}
          {isPending && (
            <div
              style={{
                padding: '2.5rem 2rem',
                background: 'rgba(234, 179, 8, 0.06)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '16px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <Clock size={32} color="#fde047" />
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.5)', color: '#fde047', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1rem' }}>
                <Lock size={13} /> PENDING ADMIN CONFIRMATION
              </div>

              <h3 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                Student Portal Access Pending
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.75rem', maxWidth: '640px', margin: '0.75rem auto 0', lineHeight: '1.5' }}>
                student_portal access pending after admin confirm admission of a student. Please wait for the admin to confirm your admission to unlock the Student Portal.
              </p>
            </div>
          )}

          {/* CASE 3: CONFIRMED STATE - FULL ACCESS MODULE WORKSPACE */}
          {isConfirmed && (
            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.5rem' }}>
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
                <button
                  onClick={() => setActiveTab('module1')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    marginBottom: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Student Portal
                </button>

                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.2rem' }}>
                  STUDENT PORTAL MODULES
                </div>

                {modulesList.map((mod) => {
                  const isActive = (activeTab === 'session' ? 'module1' : activeTab) === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveTab(mod.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.7rem 0.9rem',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? '700' : '500',
                        background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        border: isActive ? '1px solid #6366f1' : '1px solid transparent',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isActive ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
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

              {/* Right Content Workspace - Matching Screenshot 2 Layout */}
              <div>
                {modulesList.map((mod) => {
                  const effectiveTab = activeTab === 'session' ? 'module1' : activeTab;
                  if (effectiveTab !== mod.id) return null;
                  return (
                    <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Module Header Box matching Screenshot 2 */}
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

                      {/* Render Schedule Table for Module 1, otherwise render placeholder container */}
                      {mod.id === 'module1' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                          
                          {/* Date Navigation and Selector Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.75rem 1rem', borderRadius: '14px' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  const d = new Date(selectedDate + 'T00:00:00');
                                  d.setDate(d.getDate() - 1);
                                  setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.35rem 0.75rem', color: '#ffffff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                &larr; Prev Day
                              </button>
                              <button
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                style={{ background: 'rgba(99, 102, 241, 0.25)', border: '1px solid #6366f1', borderRadius: '8px', padding: '0.35rem 0.75rem', color: '#ffffff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Today
                              </button>
                              <button
                                onClick={() => {
                                  const d = new Date(selectedDate + 'T00:00:00');
                                  d.setDate(d.getDate() + 1);
                                  setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.35rem 0.75rem', color: '#ffffff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Next Day &rarr;
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>Schedule Date:</span>
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.3rem 0.5rem', color: '#ffffff', fontSize: '0.82rem', fontWeight: '700', outline: 'none' }}
                              />
                            </div>
                          </div>

                          {/* Dynamic Schedule Table */}
                          <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.25rem' }}>
                            <div className="table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
                              <table className="portal-table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', width: '140px' }}>Period Timing</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Subject</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Assigned Faculty</th>
                                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center', width: '150px' }}>Classroom / Venue</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(() => {
                                    const PERIOD_TIMINGS = ['9-10 AM', '10-11 AM', '11-12 PM', '12-01 PM (Lunch)', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM'];
                                    
                                    return PERIOD_TIMINGS.map((timing, idx) => {
                                      if (idx === 3) {
                                        // Lunch Break
                                        return (
                                          <tr key={idx} style={{ background: 'rgba(15, 23, 42, 0.35)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: '700', fontSize: '0.82rem' }}>
                                              {timing}
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#ec4899', fontWeight: '700', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                              Lunch Break / Recess
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                              -
                                            </td>
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                              <span style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                Cafeteria
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      }

                                      // Find schedule cell for this period index
                                      const cell = academicsSchedule.find(s => s.periodIndex === idx);
                                      const hasAssignment = cell && ((cell.teacherName && cell.teacherName.trim() !== '') || (cell.subjectName && cell.subjectName.trim() !== ''));
                                      
                                      const sub = hasAssignment ? cell.subjectName : 'Free Period';
                                      const teacher = hasAssignment ? cell.teacherName : 'Unassigned';
                                      const room = hasAssignment && cell.roomNo ? cell.roomNo : 'Study Hall';

                                      return (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent' }}>
                                          <td style={{ padding: '0.85rem 1rem', color: '#ffffff', fontWeight: '700', fontSize: '0.82rem' }}>
                                            {timing}
                                          </td>
                                          <td style={{ padding: '0.85rem 1rem', color: hasAssignment ? '#ffffff' : '#94a3b8', fontWeight: '600', fontSize: '0.85rem' }}>
                                            {sub}
                                          </td>
                                          <td style={{ padding: '0.85rem 1rem', color: hasAssignment ? '#38bdf8' : '#64748b', fontWeight: '600', fontSize: '0.85rem' }}>
                                            {teacher}
                                          </td>
                                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                            <span style={{
                                              background: hasAssignment ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                              color: hasAssignment ? '#38bdf8' : '#64748b',
                                              border: hasAssignment ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(255, 255, 255, 0.15)',
                                              padding: '0.2rem 0.55rem',
                                              borderRadius: '6px',
                                              fontSize: '0.78rem',
                                              fontWeight: '700'
                                            }}>
                                              {room}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
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
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
