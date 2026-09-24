import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, Users, UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admin/admissions';
const DIRECT_URL = 'http://localhost:8086/api/admin/admissions';

export default function AdminAdmissionModule() {
  const [admissionsList, setAdmissionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('STUDENT'); // 'STUDENT' | 'PARENT'

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAdmissionsList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, type, newStatus, admissionId) => {
    setUpdatingId(`${type}-${id}`);
    const endpointType = type === 'PARENT' ? 'parent' : 'student';
    const admParam = admissionId ? `&admissionId=${encodeURIComponent(admissionId)}` : '';
    const gatewayEndpoint = `http://localhost:8099/api/admin/admissions/${endpointType}/${id}/status?status=${newStatus}${admParam}`;
    const directEndpoint = `http://localhost:8086/api/admin/admissions/${endpointType}/${id}/status?status=${newStatus}${admParam}`;

    try {
      let res = await fetch(gatewayEndpoint, { method: 'PUT' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(directEndpoint, { method: 'PUT' }).catch(() => null);
      }
      if (res && res.ok) {
        // Optimistic UI update
        setAdmissionsList((prev) =>
          prev.map((item) =>
            (item.id === id && item.applicantType === type) || (admissionId && item.admissionId === admissionId)
              ? { ...item, status: newStatus }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
      await fetchAdmissions();
    }
  };

  const studentAdmissions = admissionsList.filter((a) => a.applicantType === 'STUDENT');
  const parentAdmissions = admissionsList.filter((a) => a.applicantType === 'PARENT');

  // Sort function to prioritize PENDING status applications at the top
  const sortPendingFirst = (list) => {
    return [...list].sort((a, b) => {
      const statusA = (a.status || 'PENDING').toUpperCase();
      const statusB = (b.status || 'PENDING').toUpperCase();
      if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
      if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;
      return 0;
    });
  };

  const filterBySearch = (list) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sortPendingFirst(list);
    const filtered = list.filter(
      (adm) =>
        adm.admissionId?.toLowerCase().includes(query) ||
        adm.childName?.toLowerCase().includes(query) ||
        adm.firstName?.toLowerCase().includes(query) ||
        adm.lastName?.toLowerCase().includes(query) ||
        adm.parentName?.toLowerCase().includes(query) ||
        adm.parentEmail?.toLowerCase().includes(query) ||
        adm.className?.toLowerCase().includes(query) ||
        adm.status?.toLowerCase().includes(query)
    );
    return sortPendingFirst(filtered);
  };

  const filteredStudents = filterBySearch(studentAdmissions);
  const filteredParents = filterBySearch(parentAdmissions);

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
        • Pending
      </span>
    );
  };

  const studentPendingCount = studentAdmissions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING').length;
  const parentPendingCount = parentAdmissions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING').length;

  return (
    <div className="module-card">
      <div className="module-header">
        <div className="module-icon-badge admission">
          <ShieldCheck size={22} color="#a855f7" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="module-title">Admin Admissions Management Module</h2>
          <p className="module-subtitle">
            Powered by <code>admin-admissions-service</code> (Pending applications listed first for immediate review)
          </p>
        </div>
        <button onClick={fetchAdmissions} disabled={loading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: '700' }}>Student Applications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{studentAdmissions.length}</span>
            {studentPendingCount > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {studentPendingCount} Pending
              </span>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: '12px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: '700' }}>Parent Applications</div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{parentAdmissions.length}</span>
            {parentPendingCount > 0 && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {parentPendingCount} Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`portal-tab-btn ${activeSubTab === 'STUDENT' ? 'active-admission' : ''}`}
            onClick={() => setActiveSubTab('STUDENT')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <Users size={16} />
            <span>Student Admissions ({studentAdmissions.length})</span>
          </button>

          <button
            className={`portal-tab-btn ${activeSubTab === 'PARENT' ? 'active-admission' : ''}`}
            onClick={() => setActiveSubTab('PARENT')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <UserCheck size={16} />
            <span>Parent Admissions ({parentAdmissions.length})</span>
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search admissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.3rem' }}
          />
        </div>
      </div>

      {/* VIEW 1: STUDENT ADMISSIONS TABLE */}
      {activeSubTab === 'STUDENT' && (
        <div className="history-section" style={{ marginTop: 0 }}>
          <h3 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#60a5fa" />
            <span>Student Admissions Table (Pending listed first)</span>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((adm) => (
                    <tr key={adm.id || adm.admissionId} style={{ background: (adm.status || 'PENDING').toUpperCase() === 'PENDING' ? 'rgba(234, 179, 8, 0.04)' : 'transparent' }}>
                      <td>
                        <span className="badge-unique admission">
                          {adm.admissionId}
                        </span>
                      </td>
                      <td><strong>{adm.firstName} {adm.lastName}</strong></td>
                      <td><span className="class-pill">Class {adm.className}</span></td>
                      <td><span className="role-pill staff" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>Section {adm.section || 'A'}</span></td>
                      <td>{adm.parentName}</td>
                      <td className="text-muted">{adm.parentEmail}</td>
                      <td>{getStatusBadge(adm.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleStatusUpdate(adm.id, 'STUDENT', 'ACCEPTED', adm.admissionId)}
                            disabled={updatingId === `STUDENT-${adm.id}`}
                            className="btn-submit"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.75rem',
                              background: adm.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
                              border: '1px solid #10b981',
                              boxShadow: 'none',
                            }}
                          >
                            <CheckCircle2 size={13} /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(adm.id, 'STUDENT', 'REJECTED', adm.admissionId)}
                            disabled={updatingId === `STUDENT-${adm.id}`}
                            className="btn-submit"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.75rem',
                              background: adm.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.3)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                              border: '1px solid #ef4444',
                              boxShadow: 'none',
                            }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      {loading ? 'Loading student admissions...' : 'No student admission records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PARENT ADMISSIONS TABLE */}
      {activeSubTab === 'PARENT' && (
        <div className="history-section" style={{ marginTop: 0 }}>
          <h3 className="history-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={16} color="#f472b6" />
            <span>Parent Admissions Table (Pending listed first)</span>
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Parent Name</th>
                  <th>Child Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Parent Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.length > 0 ? (
                  filteredParents.map((adm) => (
                    <tr key={adm.id || adm.admissionId} style={{ background: (adm.status || 'PENDING').toUpperCase() === 'PENDING' ? 'rgba(234, 179, 8, 0.04)' : 'transparent' }}>
                      <td>
                        <span className="badge-unique admission">
                          {adm.admissionId}
                        </span>
                      </td>
                      <td>{adm.parentName || `${adm.firstName} ${adm.lastName}`}</td>
                      <td><strong>{adm.childName}</strong></td>
                      <td><span className="class-pill">Class {adm.className}</span></td>
                      <td><span className="role-pill staff" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>Section {adm.section || 'A'}</span></td>
                      <td className="text-muted">{adm.parentEmail}</td>
                      <td>{getStatusBadge(adm.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleStatusUpdate(adm.id, 'PARENT', 'ACCEPTED', adm.admissionId)}
                            disabled={updatingId === `PARENT-${adm.id}`}
                            className="btn-submit"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.75rem',
                              background: adm.status === 'ACCEPTED' ? 'rgba(34, 197, 94, 0.3)' : 'linear-gradient(135deg, #10b981, #059669)',
                              border: '1px solid #10b981',
                              boxShadow: 'none',
                            }}
                          >
                            <CheckCircle2 size={13} /> Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(adm.id, 'PARENT', 'REJECTED', adm.admissionId)}
                            disabled={updatingId === `PARENT-${adm.id}`}
                            className="btn-submit"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.75rem',
                              background: adm.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.3)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                              border: '1px solid #ef4444',
                              boxShadow: 'none',
                            }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      {loading ? 'Loading parent admissions...' : 'No parent admission records found.'}
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
