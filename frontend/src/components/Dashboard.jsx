import React, { useState } from 'react';
import { User, LogOut, Shield, Mail, IdCard, Sparkles, FileText, HelpCircle, LayoutDashboard, ShieldCheck, BookOpen } from 'lucide-react';
import { decodeJwt } from '../utils/jwt';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';
import ParentAdmissionModule from './ParentAdmissionModule';
import ParentEnquiryModule from './ParentEnquiryModule';
import AdminAdmissionModule from './AdminAdmissionModule';
import AdminEnquiryModule from './AdminEnquiryModule';
import TeacherEnquiryModule from './TeacherEnquiryModule';
import StaffEnquiryModule from './StaffEnquiryModule';
import StudentPortalModule from './StudentPortalModule';
import TeacherPortalModule from './TeacherPortalModule';
import StaffPortalModule from './StaffPortalModule';

export default function Dashboard({ user, token, onLogout }) {
  const decodedClaims = decodeJwt(token);
  const currentRole = (user?.role || decodedClaims?.role || 'STUDENT').toUpperCase();
  const [activeTab, setActiveTab] = useState(currentRole === 'STAFF' ? 'profile' : 'admission');

  const isStudent = currentRole === 'STUDENT';
  const isParent = currentRole === 'PARENT';
  const isAdmin = currentRole === 'ADMIN';
  const isTeacher = currentRole === 'TEACHER';
  const isStaff = currentRole === 'STAFF';

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-pill admin';
      case 'TEACHER': return 'role-pill teacher';
      case 'STAFF': return 'role-pill staff';
      case 'PARENT': return 'role-pill parent';
      case 'STUDENT': return 'role-pill student';
      default: return 'role-pill student';
    }
  };

  if (isStudent) {
    return <StudentPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  if (isTeacher) {
    return <TeacherPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  return (
    <div className="dashboard-card">
      {/* Welcome & User Header */}
      <div className="dashboard-header">
        <div className="user-welcome-info">
          <div className="avatar-badge">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'A'}
          </div>
          <div>
            <h2 className="welcome-title">
              {isStudent ? 'Student Portal' : isParent ? 'Parent Portal' : isAdmin ? 'Admin Portal' : isTeacher ? 'Teacher Portal' : isStaff ? 'Staff Portal' : `${currentRole} Portal`}: {user?.firstName} {user?.lastName}
            </h2>
            <p className="user-email-text">{user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className={getRoleBadgeClass(currentRole)}>
            <Shield size={14} />
            {currentRole}
          </span>
          <button className="btn-admission" onClick={onLogout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ADMIN PORTAL */}
      {isAdmin && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
              onClick={() => setActiveTab('admission')}
            >
              <ShieldCheck size={18} />
              <span>Admin Admissions Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={18} />
              <span>Admin Enquiries Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'session' || activeTab === 'profile' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <LayoutDashboard size={18} />
              <span>Admin Profile Info</span>
            </button>
          </div>

          {activeTab === 'admission' && <AdminAdmissionModule />}
          {activeTab === 'enquiry' && <AdminEnquiryModule />}
          {(activeTab === 'session' || activeTab === 'profile') && (
            <div className="session-info-container" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
                Administrator Profile Details
              </h3>

              <div className="claims-grid">
                <div className="claim-card">
                  <div className="claim-label"><IdCard size={14} style={{ display: 'inline', marginRight: '4px' }} /> User ID</div>
                  <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> Assigned Role</div>
                  <div className="claim-value" style={{ color: '#ec4899' }}>{currentRole}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><User size={14} /> Registered Username</div>
                  <div className="claim-value">{user?.username || decodedClaims?.username}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Mail size={14} /> Registered Email</div>
                  <div className="claim-value" style={{ fontSize: '0.9rem' }}>{user?.email || decodedClaims?.email}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">First Name</div>
                  <div className="claim-value">{user?.firstName}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Last Name</div>
                  <div className="claim-value">{user?.lastName}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* STUDENT PORTAL */}
      {isStudent && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
              onClick={() => setActiveTab('admission')}
            >
              <FileText size={18} />
              <span>Admission Form Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={18} />
              <span>Student Enquiry Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'session' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <LayoutDashboard size={18} />
              <span>Student Profile Info</span>
            </button>
          </div>

          {activeTab === 'admission' && <AdmissionModule user={user} />}
          {activeTab === 'enquiry' && <EnquiryModule user={user} />}
          {activeTab === 'session' && (
            <div className="session-info-container" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
                Student Profile Details
              </h3>

              <div className="claims-grid">
                <div className="claim-card">
                  <div className="claim-label"><IdCard size={14} style={{ display: 'inline', marginRight: '4px' }} /> User ID</div>
                  <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> Assigned Role</div>
                  <div className="claim-value" style={{ color: '#818cf8' }}>{user?.role || decodedClaims?.role}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><User size={14} /> Registered Username</div>
                  <div className="claim-value">{user?.username || decodedClaims?.username}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Mail size={14} /> Registered Email</div>
                  <div className="claim-value" style={{ fontSize: '0.9rem' }}>{user?.email || decodedClaims?.email}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Registered First Name</div>
                  <div className="claim-value">{user?.firstName}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Registered Last Name</div>
                  <div className="claim-value">{user?.lastName}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PARENT PORTAL */}
      {isParent && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
              onClick={() => setActiveTab('admission')}
            >
              <FileText size={18} />
              <span>Parent Admission Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={18} />
              <span>Parent Enquiry Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'session' || activeTab === 'profile' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <LayoutDashboard size={18} />
              <span>Parent Profile Info</span>
            </button>
          </div>

          {activeTab === 'admission' && <ParentAdmissionModule user={user} />}
          {activeTab === 'enquiry' && <ParentEnquiryModule user={user} />}
          {(activeTab === 'session' || activeTab === 'profile') && (
            <div className="session-info-container" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
                Parent Profile Details
              </h3>

              <div className="claims-grid">
                <div className="claim-card">
                  <div className="claim-label"><IdCard size={14} style={{ display: 'inline', marginRight: '4px' }} /> User ID</div>
                  <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> Assigned Role</div>
                  <div className="claim-value" style={{ color: '#818cf8' }}>{currentRole}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><User size={14} /> Registered Username</div>
                  <div className="claim-value">{user?.username || decodedClaims?.username}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Mail size={14} /> Registered Email</div>
                  <div className="claim-value" style={{ fontSize: '0.9rem' }}>{user?.email || decodedClaims?.email}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">First Name</div>
                  <div className="claim-value">{user?.firstName}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Last Name</div>
                  <div className="claim-value">{user?.lastName}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* STAFF PORTAL */}
      {isStaff && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'session' || activeTab === 'profile' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <LayoutDashboard size={18} />
              <span>Staff Profile & Dashboard</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={18} />
              <span>Staff Enquiry Module</span>
            </button>
          </div>

          {(activeTab === 'session' || activeTab === 'profile') && (
            <div style={{ marginTop: '1.5rem' }}>
              <StaffPortalModule user={user} token={token} onLogout={onLogout} />
            </div>
          )}

          {activeTab === 'enquiry' && <StaffEnquiryModule user={user} />}
        </>
      )}

      {/* OTHER UNRECOGNIZED ROLES */}
      {!isStudent && !isParent && !isAdmin && !isTeacher && !isStaff && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#ffffff' }}>
            {currentRole} Account Details
          </h3>

          <div className="claims-grid">
            <div className="claim-card">
              <div className="claim-label"><IdCard size={14} style={{ display: 'inline', marginRight: '4px' }} /> User ID</div>
              <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
            </div>
            <div className="claim-card">
              <div className="claim-label"><Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> Assigned Role</div>
              <div className="claim-value" style={{ color: '#818cf8' }}>{currentRole}</div>
            </div>
            <div className="claim-card">
              <div className="claim-label"><User size={14} /> Username</div>
              <div className="claim-value">{user?.username || decodedClaims?.username}</div>
            </div>
            <div className="claim-card">
              <div className="claim-label"><Mail size={14} /> Registered Email</div>
              <div className="claim-value" style={{ fontSize: '0.9rem' }}>{user?.email || decodedClaims?.email}</div>
            </div>
            <div className="claim-card">
              <div className="claim-label">First Name</div>
              <div className="claim-value">{user?.firstName}</div>
            </div>
            <div className="claim-card">
              <div className="claim-label">Last Name</div>
              <div className="claim-value">{user?.lastName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
