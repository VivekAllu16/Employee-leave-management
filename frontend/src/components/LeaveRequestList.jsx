import React, { useState } from 'react';
import LeaveApplyModal from './LeaveApplyModal';

export default function LeaveRequestList({ leaves, employees, onApplyLeave, onUpdateStatus, onCancelRequest }) {
  const [filter, setFilter] = useState('ALL');
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const calculateDays = (start, end) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate - sDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filter === 'ALL') return true;
    return l.status === filter;
  });

  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Apply Button */}
        <button className="btn btn-primary" onClick={() => setIsApplyOpen(true)}>
          ➕ Apply for Leave
        </button>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>{filter === 'ALL' ? 'No leave requests recorded yet.' : `No leave requests in ${filter} status.`}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates & Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((req) => {
                const duration = calculateDays(req.startDate, req.endDate);
                return (
                  <tr key={req.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>#{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.employee ? req.employee.name : 'Unknown'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {req.employee ? req.employee.email : ''}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>{req.leaveType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{req.startDate} to {req.endDate}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                        {duration} {duration === 1 ? 'Day' : 'Days'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Applied on {req.appliedDate}
                      </div>
                    </td>
                    <td>
                      <p style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                        {req.reason}
                      </p>
                    </td>
                    <td>
                      <span className={`badge badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              className="btn btn-success"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => onUpdateStatus(req.id, 'APPROVED')}
                              title="Approve Leave"
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => onUpdateStatus(req.id, 'REJECTED')}
                              title="Reject Leave"
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              onClick={() => onCancelRequest(req.id)}
                              title="Cancel Request"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', paddingRight: '0.5rem' }}>
                            Processed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      <LeaveApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        employees={employees}
        onApplyLeave={onApplyLeave}
      />
    </div>
  );
}
