import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Clock, BookOpen, User, UserCheck, Mail, MessageSquare } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/parent-enquiries';
const DIRECT_URL = 'http://localhost:8084/api/parent-enquiries';

export default function ParentEnquiryModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    childName: '',
    className: 'Grade 10',
    enquire: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [enquiriesList, setEnquiriesList] = useState([]);

  useEffect(() => {
    fetchParentEnquiries();
  }, [user]);

  const fetchParentEnquiries = async () => {
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        // Filter strictly by user email or name for parent privacy & isolation
        const userEnquiries = data.filter(
          (e) =>
            (e.email && user?.email && e.email.toLowerCase() === user.email.toLowerCase()) ||
            (e.parentEmail && user?.email && e.parentEmail.toLowerCase() === user.email.toLowerCase()) ||
            (e.firstName && user?.firstName && e.firstName.toLowerCase() === user.firstName.toLowerCase())
        );
        setEnquiriesList(userEnquiries);
      }
    } catch (err) {
      console.warn('Failed to fetch parent enquiries:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const payload = {
      firstName: formData.firstName || user?.firstName || 'Parent',
      lastName: formData.lastName || user?.lastName || 'User',
      email: formData.email || user?.email || 'parent@example.com',
      childName: formData.childName,
      className: formData.className,
      enquire: formData.enquire,
    };

    try {
      let res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (res && (res.ok || res.status === 201)) {
        const data = await res.json();
        setMessage(data.message || `Parent Enquiry submitted! ID: ${data.enquireId}`);
        setFormData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          childName: '',
          className: 'Grade 10',
          enquire: '',
        });
        fetchParentEnquiries();
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setError(errData.error || 'Failed to submit parent enquiry.');
      }
    } catch (err) {
      setError('Connection error. Please verify parent-enquiry-service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-icon-badge parent-enquire">
          <HelpCircle size={22} color="#ec4899" />
        </div>
        <div>
          <h2 className="module-title">Parent Enquiry Module</h2>
          <p className="module-subtitle">
            Powered by <code>parent-enquiry-service</code> (Parent inquiries submitted directly to school administration & teachers)
          </p>
        </div>
      </div>

      {message && (
        <div className="alert-box success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert-box error">
          <AlertCircle size={18} />
          <span>{error}</span>
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
              name="email"
              value={formData.email}
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
              <BookOpen size={14} /> Child Grade / Class
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

        <div className="form-group">
          <label className="form-label">
            <MessageSquare size={14} /> Parent Enquiry Message
          </label>
          <textarea
            name="enquire"
            placeholder="Type your questions or concerns regarding admissions, fees, transport, or facilities..."
            value={formData.enquire}
            onChange={handleChange}
            required
            className="form-input form-textarea"
            rows="3"
          ></textarea>
        </div>

        <button type="submit" disabled={loading} className="btn-submit enquire-btn">
          {loading ? (
            'Submitting Parent Enquiry...'
          ) : (
            <>
              <Send size={16} />
              Submit Parent Enquiry
            </>
          )}
        </button>
      </form>

      {enquiriesList.length > 0 && (
        <div className="history-section">
          <h3 className="history-title">
            <Clock size={16} /> Parent Enquiries History & Official Responses ({enquiriesList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Child Name & Class</th>
                  <th>Status</th>
                  <th>My Enquiry Question</th>
                  <th>Official Response</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {enquiriesList.map((enq) => {
                  const officialResp = enq.response || enq.adminResponse;
                  const isResponded = enq.status === 'RESPONDED' || Boolean(officialResp && officialResp.trim());
                  return (
                    <tr key={enq.id || enq.enquireId}>
                      <td>
                        <span className="badge-unique enquire">
                          {enq.enquireId}
                        </span>
                      </td>
                      <td><strong>{enq.childName}</strong> <span className="class-pill">{enq.className}</span></td>
                      <td>
                        {isResponded ? (
                          <span className="role-pill teacher" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="role-pill admin" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                            • Pending Response
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{enq.enquire}</td>
                      <td style={{ minWidth: '280px', maxWidth: '360px', whiteSpace: 'normal' }}>
                        {officialResp ? (
                          <div style={{ background: 'rgba(236, 72, 153, 0.12)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fbcfe8', fontSize: '0.85rem' }}>
                            <strong style={{ color: '#f472b6', display: 'block', fontSize: '0.75rem' }}>💬 Official Response:</strong>
                            {officialResp}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            • Awaiting Response...
                          </span>
                        )}
                      </td>
                      <td className="text-muted">
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Just Now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
