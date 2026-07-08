import React, { useState, useEffect } from 'react';

export default function LeaveApplyModal({ isOpen, onClose, employees, onApplyLeave }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate days in real time when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
        setCalculatedDays(diffDays);
        setErrorMsg('');
      } else {
        setCalculatedDays(0);
        setErrorMsg('End date cannot be before start date.');
      }
    } else {
      setCalculatedDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.employeeId) {
      setErrorMsg('Please select an employee.');
      return;
    }
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setErrorMsg('All fields are required.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) {
      setErrorMsg('End date cannot be before start date.');
      return;
    }

    setLoading(true);
    try {
      const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId.toString());
      if (selectedEmployee && calculatedDays > selectedEmployee.leaveBalance) {
        setErrorMsg(`Insufficient leave balance. Required: ${calculatedDays} days, Available: ${selectedEmployee.leaveBalance} days.`);
        setLoading(false);
        return;
      }

      const leaveDto = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      };

      const result = await onApplyLeave(formData.employeeId, leaveDto);
      if (result && result.error) {
        setErrorMsg(result.error);
      } else {
        // Reset form and close
        setFormData({
          employeeId: '',
          leaveType: 'CASUAL',
          startDate: '',
          endDate: '',
          reason: ''
        });
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedEmployee = employees.find(emp => emp.id.toString() === formData.employeeId.toString());

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Apply for Leave</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {errorMsg && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.12)', 
            color: 'var(--color-rejected)', 
            padding: '0.75rem 1rem', 
            borderRadius: '8px', 
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select 
              name="employeeId" 
              className="form-control" 
              value={formData.employeeId}
              onChange={handleInputChange}
              required
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} - Bal: {emp.leaveBalance} days)
                </option>
              ))}
            </select>
            {selectedEmployee && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Designation: {selectedEmployee.designation}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>Available Leave: {selectedEmployee.leaveBalance} Days</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select 
              name="leaveType" 
              className="form-control"
              value={formData.leaveType}
              onChange={handleInputChange}
              required
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="EARNED">Earned Leave</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                className="form-control"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                className="form-control"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div style={{ 
              backgroundColor: 'rgba(6, 182, 212, 0.1)', 
              border: '1px solid rgba(6, 182, 212, 0.25)', 
              borderRadius: '8px', 
              padding: '0.75rem 1rem', 
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.9rem'
            }}>
              <span>Requested Leave Duration:</span>
              <span style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>{calculatedDays} Days</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reason for Leave</label>
            <textarea 
              name="reason" 
              className="form-control" 
              rows="3" 
              placeholder="Provide a reason..."
              value={formData.reason}
              onChange={handleInputChange}
              required
              style={{ resize: 'none' }}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !!errorMsg && calculatedDays === 0}>
              {loading ? 'Submitting...' : 'Apply Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
