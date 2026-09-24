import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ onLogin, onSwitchToRegister, error, setError, prefillEmail, prefillPassword, successMessage }) {
  const [email, setEmail] = useState(prefillEmail || 'student@school.com');
  const [password, setPassword] = useState(prefillPassword || 'student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
    if (prefillPassword) setPassword(prefillPassword);
  }, [prefillEmail, prefillPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email/username and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onLogin({ email, password });
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    const roleLower = role.toLowerCase();
    const demoEmail = `${roleLower}@school.com`;
    const demoPass = roleLower;

    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      await onLogin({ email: demoEmail, password: demoPass });
    } catch (err) {
      try {
        await onLogin({ email: roleLower, password: demoPass });
      } catch (err2) {
        setError(err2.message || `Quick demo sign-in for ${role} failed.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="card-header-icon">
        <LogIn size={28} />
      </div>
      <h2 className="card-title">Welcome Back</h2>
      <p className="card-subtitle">Sign in to access your Smart Attendance Management Portal</p>

      {successMessage && (
        <div className="alert-banner success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="text"
              className="form-input"
              placeholder="student@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-wrapper" style={{ position: 'relative' }}>
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '2.5rem' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Hide Password' : 'Show Password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              {showPassword ? <EyeOff size={18} color="#a5b4fc" /> : <Eye size={18} color="#94a3b8" />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In to Portal'}
        </button>
      </form>

      <div className="demo-section">
        <div className="demo-title">
          <Sparkles size={14} />
          QUICK DEMO SIGN-IN
        </div>
        <div className="demo-buttons">
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Admin')}>
            Admin
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Teacher')}>
            Teacher
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Staff')}>
            Staff
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Parent')}>
            Parent
          </button>
          <button type="button" className="btn-demo" onClick={() => handleQuickDemo('Student')}>
            Student
          </button>
        </div>
        <p className="switch-text">
          Don't have an account?{' '}
          <span className="switch-link" onClick={onSwitchToRegister}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}
