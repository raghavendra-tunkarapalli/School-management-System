import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, Users, UserCheck, MessageSquare, Send, CheckCircle2, Edit2, Clock } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admin/enquiries';
const DIRECT_URL = 'http://localhost:8085/api/admin/enquiries';

export default function AdminEnquiryModule() {
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('STUDENT'); // 'STUDENT' | 'PARENT'
  const [responseInputs, setResponseInputs] = useState({});
  const [editingIds, setEditingIds] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setEnquiriesList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (key, text) => {
    setResponseInputs((prev) => ({ ...prev, [key]: text }));
  };

  const toggleEditing = (key, initialText = '') => {
    setEditingIds((prev) => ({ ...prev, [key]: !prev[key] }));
    setResponseInputs((prev) => ({ ...prev, [key]: initialText }));
  };

  const handleSendResponse = async (id, type) => {
    const key = `${type}-${id}`;
    const text = responseInputs[key]?.trim();
    if (!text) return;

    setSubmittingId(key);

    const primaryEndpoint = type === 'PARENT'
      ? `http://localhost:8099/api/parent-enquiries/${id}/response`
      : `http://localhost:8099/api/enquiries/${id}/response`;

    const fallbackEndpoint = type === 'PARENT'
      ? `http://localhost:8084/api/parent-enquiries/${id}/response`
      : `http://localhost:8083/api/enquiries/${id}/response`;

    try {
      let res = await fetch(primaryEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: text }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(fallbackEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: text }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        // Optimistic local state update
        setEnquiriesList((prev) =>
          prev.map((item) =>
            String(item.id) === String(id) && item.applicantType === type
              ? { ...item, adminResponse: text, status: 'RESPONDED' }
              : item
          )
        );
        // Clear temporary input draft & exit edit mode so official sent card shows
        setResponseInputs((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setEditingIds((prev) => ({ ...prev, [key]: false }));
      }
    } catch (err) {
      console.error('Failed to send response:', err);
    } finally {
      setSubmittingId(null);
      await fetchEnquiries();
    }
  };

  const studentEnquiries = enquiriesList.filter((e) => e.applicantType === 'STUDENT');
  const parentEnquiries = enquiriesList.filter((e) => e.applicantType === 'PARENT');

  // Priority Sort: PENDING / Unresponded enquiries appear FIRST at the top
  const sortUnrespondedFirst = (list) => {
    return [...list].sort((a, b) => {
      const isPendingA = a.status === 'PENDING' || !a.adminResponse || !a.adminResponse.trim();
      const isPendingB = b.status === 'PENDING' || !b.adminResponse || !b.adminResponse.trim();
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      return 0;
    });
  };

  const filterBySearch = (list) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sortUnrespondedFirst(list);
    const filtered = list.filter(
      (enq) =>
        enq.enquireId?.toLowerCase().includes(query) ||
        enq.childName?.toLowerCase().includes(query) ||
        enq.firstName?.toLowerCase().includes(query) ||
        enq.lastName?.toLowerCase().includes(query) ||
        enq.parentName?.toLowerCase().includes(query) ||
        enq.parentEmail?.toLowerCase().includes(query) ||
        enq.email?.toLowerCase().includes(query) ||
        enq.className?.toLowerCase().includes(query) ||
        enq.enquire?.toLowerCase().includes(query) ||
        enq.adminResponse?.toLowerCase().includes(query)
    );
    return sortUnrespondedFirst(filtered);
  };

  const filteredStudents = filterBySearch(studentEnquiries);
  const filteredParents = filterBySearch(parentEnquiries);

  const studentPendingResponseCount = studentEnquiries.filter((e) => e.status === 'PENDING' || !e.adminResponse || !e.adminResponse.trim()).length;
  const parentPendingResponseCount = parentEnquiries.filter((e) => e.status === 'PENDING' || !e.adminResponse || !e.adminResponse.trim()).length;

  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-icon-badge enquire">
          <ShieldCheck size={22} color="#3b82f6" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="module-title">Admin Enquiries Management Module</h2>
          <p className="module-subtitle">
            Powered by <code>admin-enquiries-service</code> (Pending enquiries listed at top, sent responses saved persistently to MySQL)
          </p>
        </div>
        <button onClick={fetchEnquiries} disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: '700' }}>Student Enquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{studentEnquiries.length}</span>
            {studentPendingResponseCount > 0 ? (
              <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {studentPendingResponseCount} Pending Response
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                ✓ All Responded
              </span>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: '700' }}>Parent Enquiries</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{parentEnquiries.length}</span>
            {parentPendingResponseCount > 0 ? (
              <span style={{ fontSize: '0.75rem', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {parentPendingResponseCount} Pending Response
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                ✓ All Responded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`portal-tab-btn ${activeSubTab === 'STUDENT' ? 'active-enquiry' : ''}`}
            onClick={() => setActiveSubTab('STUDENT')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <Users size={16} />
            <span>Student Enquiries ({studentEnquiries.length})</span>
          </button>

          <button
            className={`portal-tab-btn ${activeSubTab === 'PARENT' ? 'active-enquiry' : ''}`}
            onClick={() => setActiveSubTab('PARENT')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={16} />
            <span>Parent Enquiries ({parentEnquiries.length})</span>
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search enquiries or responses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>
      </div>

      {/* VIEW 1: STUDENT ENQUIRIES TABLE */}
      {activeSubTab === 'STUDENT' && (
        <div className="history-section" style={{ marginTop: 0 }}>
          <h3 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#60a5fa" />
            <span>Student Enquiries Table (Pending enquiries listed at top)</span>
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Status</th>
                  <th>Enquiry Message</th>
                  <th>Admin Response</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((enq) => {
                    const key = `STUDENT-${enq.id}`;
                    const hasResponse = enq.status === 'RESPONDED' || Boolean(enq.adminResponse && enq.adminResponse.trim());
                    const isEditing = editingIds[key];

                    return (
                      <tr key={enq.id || enq.enquireId} style={{ background: !hasResponse ? 'rgba(59, 130, 246, 0.06)' : 'transparent' }}>
                        <td>
                          <span className="badge-unique enquire">
                            {enq.enquireId}
                          </span>
                        </td>
                        <td><strong>{enq.firstName} {enq.lastName}</strong></td>
                        <td><span className="class-pill">{enq.className}</span></td>
                        <td>
                          {hasResponse ? (
                            <span className="role-pill teacher" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                              ✓ Responded
                            </span>
                          ) : (
                            <span className="role-pill staff" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.5)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', fontWeight: '700' }}>
                              • Pending Response
                            </span>
                          )}
                        </td>
                        <td style={{ maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {enq.enquire}
                        </td>
                        <td style={{ minWidth: '360px', maxWidth: '460px', whiteSpace: 'normal' }}>
                          {hasResponse && !isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                              <div style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: '1.4' }}>
                                <strong style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                                  <CheckCircle2 size={13} color="#4ade80" /> Official Response Sent:
                                </strong>
                                {enq.adminResponse}
                              </div>
                              <button onClick={() => toggleEditing(key, enq.adminResponse)} className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', flexShrink: 0 }}>
                                <Edit2 size={11} /> Edit
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="Type official response..."
                                value={responseInputs[key] !== undefined ? responseInputs[key] : (enq.adminResponse || '')}
                                onChange={(e) => handleResponseChange(key, e.target.value)}
                                className="form-input no-icon"
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.85rem',
                                  flex: 1,
                                  color: '#ffffff',
                                  background: '#1a2035',
                                  border: '1px solid rgba(99, 102, 241, 0.4)',
                                  borderRadius: '8px',
                                }}
                              />
                              <button
                                onClick={() => handleSendResponse(enq.id, 'STUDENT')}
                                disabled={submittingId === key}
                                className="btn-submit enquire-btn"
                                style={{
                                  width: 'auto',
                                  minWidth: 'auto',
                                  padding: '0.45rem 0.65rem',
                                  fontSize: '0.75rem',
                                  flexShrink: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Send size={12} /> Send
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      {loading ? 'Loading student enquiries...' : 'No student enquiry records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PARENT ENQUIRIES TABLE */}
      {activeSubTab === 'PARENT' && (
        <div className="history-section" style={{ marginTop: 0 }}>
          <h3 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} color="#f472b6" />
            <span>Parent Enquiries Table (Pending enquiries listed at top)</span>
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Parent Name</th>
                  <th>Child Name & Class</th>
                  <th>Status</th>
                  <th>Enquiry Message</th>
                  <th>Admin Response</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.length > 0 ? (
                  filteredParents.map((enq) => {
                    const key = `PARENT-${enq.id}`;
                    const hasResponse = enq.status === 'RESPONDED' || Boolean(enq.adminResponse && enq.adminResponse.trim());
                    const isEditing = editingIds[key];

                    return (
                      <tr key={enq.id || enq.enquireId} style={{ background: !hasResponse ? 'rgba(236, 72, 153, 0.06)' : 'transparent' }}>
                        <td>
                          <span className="badge-unique enquire">
                            {enq.enquireId}
                          </span>
                        </td>
                        <td>{enq.parentName || `${enq.firstName} ${enq.lastName}`}</td>
                        <td>
                          <strong>{enq.childName}</strong> <span className="class-pill">{enq.className}</span>
                        </td>
                        <td>
                          {hasResponse ? (
                            <span className="role-pill teacher" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                              ✓ Responded
                            </span>
                          ) : (
                            <span className="role-pill admin" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.5)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', fontWeight: '700' }}>
                              • Pending Response
                            </span>
                          )}
                        </td>
                        <td style={{ maxWidth: '240px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {enq.enquire}
                        </td>
                        <td style={{ minWidth: '360px', maxWidth: '460px', whiteSpace: 'normal' }}>
                          {hasResponse && !isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                              <div style={{ fontSize: '0.85rem', color: '#ffffff', lineHeight: '1.4' }}>
                                <strong style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                                  <CheckCircle2 size={13} color="#4ade80" /> Official Response Sent:
                                </strong>
                                {enq.adminResponse}
                              </div>
                              <button onClick={() => toggleEditing(key, enq.adminResponse)} className="btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', flexShrink: 0 }}>
                                <Edit2 size={11} /> Edit
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', width: '100%', alignItems: 'center' }}>
                              <input
                                type="text"
                                placeholder="Type official response..."
                                value={responseInputs[key] !== undefined ? responseInputs[key] : (enq.adminResponse || '')}
                                onChange={(e) => handleResponseChange(key, e.target.value)}
                                className="form-input no-icon"
                                style={{
                                  padding: '0.45rem 0.75rem',
                                  fontSize: '0.85rem',
                                  flex: 1,
                                  color: '#ffffff',
                                  background: '#1a2035',
                                  border: '1px solid rgba(236, 72, 153, 0.4)',
                                  borderRadius: '8px',
                                }}
                              />
                              <button
                                onClick={() => handleSendResponse(enq.id, 'PARENT')}
                                disabled={submittingId === key}
                                className="btn-submit enquire-btn"
                                style={{
                                  width: 'auto',
                                  minWidth: 'auto',
                                  padding: '0.45rem 0.65rem',
                                  fontSize: '0.75rem',
                                  flexShrink: 0,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                }}
                              >
                                <Send size={12} /> Send
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      {loading ? 'Loading parent enquiries...' : 'No parent enquiry records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
