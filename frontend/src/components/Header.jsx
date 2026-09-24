import React from 'react';
import { GraduationCap, FileText, UserPlus, LogOut } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab, user, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo">
          <GraduationCap size={26} />
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">Smart Attendance Management</h1>
          </div>
          <p className="brand-subtitle">
            Smart Attendance Management Portal
          </p>
        </div>
      </div>

      <div className="header-actions">

        <button className="btn-admission" onClick={() => alert('Admission form is available for registered students.')}>
          <FileText size={16} />
          Admission Form
        </button>

        {user ? (
          <button className="btn-signin" onClick={onLogout}>
            <LogOut size={16} style={{ display: 'inline', marginRight: '6px' }} />
            Sign Out
          </button>
        ) : (
          <>
            <button
              className={`btn-signin ${currentTab === 'signin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('signin')}
            >
              Sign In
            </button>
            <button
              className="btn-register"
              onClick={() => setCurrentTab('register')}
            >
              <UserPlus size={16} />
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}
