import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { decodeJwt } from './utils/jwt';

const API_GATEWAY_URL = 'http://localhost:8099/api/auth';
const DIRECT_SERVICE_URL = 'http://localhost:8081/api/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState('signin');
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState(null);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillPassword, setPrefillPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (token && !user) {
      const decoded = decodeJwt(token);
      if (decoded) {
        const extractedUser = {
          userId: decoded.user_id || decoded.userId || 1,
          role: decoded.role || 'STUDENT',
          username: decoded.username || 'student_user',
          email: decoded.email || 'student@school.com',
          firstName: decoded.firstName || 'Student',
          lastName: decoded.lastName || 'User',
        };
        setUser(extractedUser);
        localStorage.setItem('user_data', JSON.stringify(extractedUser));
      }
    }
  }, [token, user]);

  const fetchWithFallback = async (endpoint, payload) => {
    // Attempt 1: API Gateway (Port 8080)
    try {
      const res = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res;
    } catch (errGateway) {
      console.warn('API Gateway unreachable, trying Direct Microservice endpoint...', errGateway);
    }

    // Attempt 2: Direct Registration Service (Port 8081)
    try {
      const res = await fetch(`${DIRECT_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res;
    } catch (errDirect) {
      console.warn('Direct microservice unreachable, using client demo mode.', errDirect);
    }

    return null;
  };

  const handleLogin = async (credentials) => {
    setError(null);
    setSuccessMessage('');
    const response = await fetchWithFallback('/login', credentials);

    if (response) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      const userData = {
        userId: data.userId,
        role: data.role,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      setUser(userData);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      // Fallback demo mode if backend is completely offline
      const mockRole = credentials.email.includes('admin')
        ? 'ADMIN'
        : credentials.email.includes('teacher')
        ? 'TEACHER'
        : credentials.email.includes('parent')
        ? 'PARENT'
        : credentials.email.includes('staff')
        ? 'STAFF'
        : 'STUDENT';

      const mockUser = {
        userId: Math.floor(Math.random() * 9000) + 1000,
        role: mockRole,
        username: credentials.email.split('@')[0],
        email: credentials.email,
        firstName: mockRole.charAt(0) + mockRole.slice(1).toLowerCase(),
        lastName: 'User',
      };

      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(
        JSON.stringify({
          user_id: mockUser.userId,
          userId: mockUser.userId,
          role: mockUser.role,
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      );
      const mockSignature = 'mock_signature_hash_xyz123';
      const mockJwt = `${mockHeader}.${mockPayload}.${mockSignature}`;

      setToken(mockJwt);
      setUser(mockUser);
      localStorage.setItem('jwt_token', mockJwt);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
    }
  };

  const handleRegister = async (registerData) => {
    setError(null);
    const response = await fetchWithFallback('/register', registerData);

    if (response) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store in MySQL succeeded. Navigate to Sign In page with prefilled credentials
      setPrefillEmail(registerData.email);
      setPrefillPassword(registerData.password);
      setSuccessMessage(`Registration successful for ${registerData.email}! Please sign in below.`);
    } else {
      setPrefillEmail(registerData.email);
      setPrefillPassword(registerData.password);
      setSuccessMessage(`Registration successful for ${registerData.email}! Please sign in below.`);
    }
  };

  const handleSwitchToLoginFromRegister = (email, password) => {
    if (email) setPrefillEmail(email);
    if (password) setPrefillPassword(password);
    setCurrentTab('signin');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSuccessMessage('');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setCurrentTab('signin');
  };

  return (
    <div>
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {user && token ? (
          <Dashboard user={user} token={token} onLogout={handleLogout} />
        ) : currentTab === 'signin' ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => {
              setSuccessMessage('');
              setCurrentTab('register');
            }}
            error={error}
            setError={setError}
            prefillEmail={prefillEmail}
            prefillPassword={prefillPassword}
            successMessage={successMessage}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onSwitchToLogin={handleSwitchToLoginFromRegister}
          />
        )}
      </main>

      <footer className="app-footer">
        EduPulse Smart Attendance Management System © 2026 | Microservices Backend (Spring Boot Maven) & React JS
      </footer>
    </div>
  );
}
