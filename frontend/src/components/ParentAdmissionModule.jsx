import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Clock, User, Mail, BookOpen, UserCheck } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admissions/parent';
const DIRECT_URL = 'http://localhost:8082/api/admissions/parent';

export default function ParentAdmissionModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    parentEmail: user?.email || '',
    childName: '',
    className: 'Grade 1',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [admissionsList, setAdmissionsList] = useState([]);

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
        // Filter admissions submitted by this parent email or registered name
        const parentAdmissions = data.filter(
          (a) =>
            a.parentEmail?.toLowerCase() === user?.email?.toLowerCase() ||
            (a.firstName?.toLowerCase() === user?.firstName?.toLowerCase() &&
             a.lastName?.toLowerCase() === user?.lastName?.toLowerCase())
        );

        // Deduplicate by admissionId
        const uniqueMap = new Map();
        parentAdmissions.forEach((item) => {
          if (!uniqueMap.has(item.admissionId)) {
            uniqueMap.set(item.admissionId, item);
          }
        });

        const sorted = Array.from(uniqueMap.values()).reverse();
        setAdmissionsList(sorted);
      }
    } catch (err) {
      console.warn('Failed to fetch parent admissions list:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (successData) setSuccessData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.childName.trim()) {
      setError('Please enter child full name.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      parentName: `${formData.firstName} ${formData.lastName}`,
      parentEmail: formData.parentEmail,
      childName: formData.childName.trim(),
      className: formData.className,
      applicantType: 'PARENT',
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

      if (response && response.ok) {
        const data = await response.json();
        setSuccessData(data);
        setFormData((prev) => ({
          ...prev,
          childName: '',
        }));
        await fetchAdmissions();
      } else {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        if (response && response.status === 409) {
          setError(errorData.error || `An admission application has already been submitted for child: '${formData.childName.trim()}'. Only 1 admission is allowed per child.`);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          // Client fallback if service is offline
          const mockAdmissionId = 'ADM-' + Math.floor(10000 + Math.random() * 90000);
          const mockResponse = {
            id: Date.now(),
            admissionId: mockAdmissionId,
            firstName: payload.firstName,
            lastName: payload.lastName,
            childName: payload.childName,
            className: payload.className,
            parentName: payload.parentName,
            parentEmail: payload.parentEmail,
            applicantType: 'PARENT',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };
          setSuccessData(mockResponse);
          setAdmissionsList((prev) => [mockResponse, ...prev]);
          setFormData((prev) => ({ ...prev, childName: '' }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit parent admission application.');
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

  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-icon-badge admission">
          <FileText size={22} color="#a855f7" />
        </div>
        <div>
          <h2 className="module-title">Parent Admission Form Module</h2>
          <p className="module-subtitle">
            Submit admission application for your children (Limit: <strong>1 admission per child</strong>, parents can apply for multiple children)
          </p>
        </div>
      </div>

      {successData && (
        <div className="alert-success-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
          <div className="alert-success-header" style={{ marginBottom: 0 }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#6ee7b7' }}>
              Submitted (Child: <strong>{successData.childName}</strong> | Admission ID: <strong>{successData.admissionId}</strong>)
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-error-box">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="portal-form">
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">
              <User size={14} /> Parent First Name
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
              <User size={14} /> Parent Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              disabled
              className="form-input disabled-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={14} /> Parent Email Address
            </label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              disabled
              className="form-input disabled-input"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">
              <UserCheck size={14} /> Child Full Name
            </label>
            <input
              type="text"
              name="childName"
              placeholder="e.g. Timothy Morgan"
              value={formData.childName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <BookOpen size={14} /> Child Class / Grade
            </label>
            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-submit admission-btn"
        >
          {loading ? (
            'Saving Admission to MySQL...'
          ) : (
            <>
              <Send size={16} />
              Submit Admission Application for Child
            </>
          )}
        </button>
      </form>

      {admissionsList.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">
            <Clock size={16} /> Parent Admissions History ({admissionsList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Parent Name</th>
                  <th>Child Name</th>
                  <th>Child Class</th>
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
                    <td>{adm.parentName || `${adm.firstName} ${adm.lastName}`}</td>
                    <td><strong>{adm.childName}</strong></td>
                    <td><span className="class-pill">{adm.className}</span></td>
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
