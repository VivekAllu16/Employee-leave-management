import React from 'react';

export default function Dashboard({ employees, leaves, onNavigate }) {
  // Statistics calculations
  const totalEmployees = employees.length;
  const pendingRequests = leaves.filter(l => l.status === 'PENDING').length;
  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED').length;
  const rejectedLeaves = leaves.filter(l => l.status === 'REJECTED').length;

  // Get 5 most recent leave applications
  const recentLeaves = [...leaves]
    .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
    .slice(0, 5);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Statistics Cards Grid */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-info">
            <span className="stat-label">Total Employees</span>
            <span className="stat-value">{totalEmployees}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon amber">⏳</div>
          <div className="stat-info">
            <span className="stat-label">Pending Leaves</span>
            <span className="stat-value">{pendingRequests}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon emerald">✅</div>
          <div className="stat-info">
            <span className="stat-label">Approved Leaves</span>
            <span className="stat-value">{approvedLeaves}</span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon rose">❌</div>
          <div className="stat-info">
            <span className="stat-label">Rejected Leaves</span>
            <span className="stat-value">{rejectedLeaves}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Recent Leave Requests List */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.25rem', fontWeight: 600 }}>Recent Leave Applications</h3>
          
          {recentLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon">📋</div>
              <p>No leave requests submitted yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '0' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{req.employee ? req.employee.name : 'Unknown'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {req.employee ? req.employee.email : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, letterSpacing: '0.05em' }}>{req.leaveType}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>{req.startDate} to {req.endDate}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Applied on {req.appliedDate}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Quick Actions</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Administrative operations and request handling.
          </p>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={() => onNavigate('employees')}
          >
            ➕ Add New Employee
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={() => onNavigate('leaves')}
          >
            📋 View Leave Requests
          </button>
        </div>
      </div>
    </div>
  );
}
