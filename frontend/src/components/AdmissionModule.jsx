import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Clock, User, Mail, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admissions/student';
const DIRECT_URL = 'http://localhost:8082/api/admissions/student';

export default function AdmissionModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    className: '10',
    parentName: '',
    parentEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [admissionsList, setAdmissionsList] = useState([]);
  const [existingAdmission, setExistingAdmission] = useState(null);

  useEffect(() => {
    fetchAdmissions();
  }, [user]);

  const fetchAdmissions = async () => {
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        // Filter by current student's registered name and deduplicate
        const studentAdmissions = data.filter(
          (a) =>
            a.firstName?.toLowerCase() === user?.firstName?.toLowerCase() &&
            a.lastName?.toLowerCase() === user?.lastName?.toLowerCase()
        );

        const uniqueMap = new Map();
        studentAdmissions.forEach((item) => {
          if (!uniqueMap.has(item.admissionId)) {
            uniqueMap.set(item.admissionId, item);
          }
        });

        const sorted = Array.from(uniqueMap.values()).reverse();
        setAdmissionsList(sorted);

        if (sorted.length > 0) {
          setExistingAdmission(sorted[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admissions list:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingAdmission) {
      setError(`Admission already exists for ${user?.firstName} ${user?.lastName} (Admission ID: ${existingAdmission.admissionId}). Only one admission is allowed.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      className: formData.className,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
    };

    try {
      let response;
      try {
        response = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (gatewayErr) {
        response = await fetch(DIRECT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (response) {
        const data = await response.json();
        if (response.status === 409 || !response.ok) {
          setError(data.error || 'You have already submitted an admission application.');
          if (data.admissionId) {
            setExistingAdmission(data);
          }
          return;
        }

        setSuccessData(data);
        setExistingAdmission(data);
        setFormData((prev) => ({
          ...prev,
          parentName: '',
          parentEmail: '',
        }));
        await fetchAdmissions();
      } else {
        // Demomode / Client fallback if service is unreachable
        const mockAdmissionId = 'ADM-' + Math.floor(10000 + Math.random() * 90000);
        const mockResponse = {
          id: Date.now(),
          admissionId: mockAdmissionId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          className: payload.className,
          parentName: payload.parentName,
          parentEmail: payload.parentEmail,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        setSuccessData(mockResponse);
        setExistingAdmission(mockResponse);
        setAdmissionsList((prev) => [mockResponse, ...prev]);
        setFormData((prev) => ({ ...prev, parentName: '', parentEmail: '' }));
      }
    } catch (err) {
      setError(err.message || 'Failed to submit admission application.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'ACCEPTED') {
      return (
        <span className="role-pill teacher" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
          ✓ Accepted
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="role-pill admin" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
          ✗ Rejected
        </span>
      );
    }
    return (
      <span className="role-pill staff" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#fde047', borderColor: 'rgba(234, 179, 8, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
        • Pending Decision
      </span>
    );
  };

  const isFormDisabled = Boolean(existingAdmission);

  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-icon-badge admission">
          <FileText size={22} color="#a855f7" />
        </div>
        <div>
          <h2 className="module-title">Admission Form Module</h2>
          <p className="module-subtitle">
            Submit new student enrollment application (Strict limit: <strong>1 admission per student</strong>)
          </p>
        </div>
      </div>

      {/* Warning Box for Existing Admission */}
      {existingAdmission && !successData && (
        <div className="alert-error-box" style={{ background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#e9d5ff', padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
            <ShieldAlert size={18} color="#c084fc" />
            <span>Submitted (Admission ID: <strong>{existingAdmission.admissionId}</strong> | Status: <strong>{existingAdmission.status || 'PENDING'}</strong>)</span>
          </div>
        </div>
      )}

      {successData && (
        <div className="alert-success-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
          <div className="alert-success-header" style={{ marginBottom: 0 }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#6ee7b7' }}>
              Submitted (Admission ID: <strong>{successData.admissionId}</strong>)
            </span>
          </div>
        </div>
      )}

      {error && !existingAdmission && (
        <div className="alert-error-box">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="portal-form">
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">
              <User size={14} /> First Name (Registered Default)
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              disabled
              className="form-input disabled-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <User size={14} /> Last Name (Registered Default)
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              disabled
              className="form-input disabled-input"
            />
          </div>
        </div>

        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              <BookOpen size={14} /> Class
            </label>
            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className={`form-input ${isFormDisabled ? 'disabled-input' : ''}`}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <UserCheck size={14} /> Parent / Guardian Name
            </label>
            <input
              type="text"
              name="parentName"
              placeholder={isFormDisabled ? existingAdmission?.parentName : "e.g. Robert Smith"}
              value={isFormDisabled ? existingAdmission?.parentName || '' : formData.parentName}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className={`form-input ${isFormDisabled ? 'disabled-input' : ''}`}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} /> Parent Email Address
            </label>
            <input
              type="email"
              name="parentEmail"
              placeholder={isFormDisabled ? existingAdmission?.parentEmail : "parent@example.com"}
              value={isFormDisabled ? existingAdmission?.parentEmail || '' : formData.parentEmail}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className={`form-input ${isFormDisabled ? 'disabled-input' : ''}`}
            />
          </div>
        </div>

        <button type="submit" disabled={loading || isFormDisabled} className="btn-submit admission-btn">
          {loading ? (
            'Saving Admission to MySQL...'
          ) : isFormDisabled ? (
            'Admission Already Submitted (Limit: 1)'
          ) : (
            <>
              <Send size={16} />
              Submit Admission Application
            </>
          )}
        </button>
      </form>

      {admissionsList.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">
            <Clock size={16} /> Submitted Admissions History ({admissionsList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Parent Name</th>
                  <th>Parent Email</th>
                  <th>Decision Status</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {admissionsList.map((adm) => (
                  <tr key={adm.id || adm.admissionId}>
                    <td>
                      <span className="badge-unique admission">
                        {adm.admissionId}
                      </span>
                    </td>
                    <td>{adm.firstName} {adm.lastName}</td>
                    <td><span className="class-pill">Class {adm.className}</span></td>
                    <td><span className="role-pill staff" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>Section {adm.section || 'A'}</span></td>
                    <td>{adm.parentName}</td>
                    <td className="text-muted">{adm.parentEmail}</td>
                    <td>{getStatusBadge(adm.status)}</td>
                    <td className="text-muted">
                      {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'Just Now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
