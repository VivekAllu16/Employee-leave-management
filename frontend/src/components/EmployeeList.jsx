import React, { useState } from 'react';

export default function EmployeeList({ employees, onAddEmployee }) {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    leaveBalance: 20
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'leaveBalance' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!formData.name || !formData.email || !formData.department || !formData.designation) {
      setErrorMsg('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const result = await onAddEmployee(formData);
      if (result && result.error) {
        setErrorMsg(result.error);
      } else {
        // Reset form and close
        setFormData({
          name: '',
          email: '',
          department: '',
          designation: '',
          leaveBalance: 20
        });
        setShowModal(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="glass-card" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name, email or department..." 
            style={{ width: '320px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="btn btn-primary" onClick={() => { setErrorMsg(''); setShowModal(true); }}>
          ➕ Add Employee
        </button>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>{searchQuery ? 'No matching employees found.' : 'No employees in the database. Add your first employee above!'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Details</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Leave Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>#{emp.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{emp.email}</div>
                  </td>
                  <td>{emp.department || 'N/A'}</td>
                  <td>{emp.designation || 'N/A'}</td>
                  <td>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        color: emp.leaveBalance > 5 ? 'var(--color-approved)' : 'var(--color-rejected)',
                        backgroundColor: emp.leaveBalance > 5 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px'
                      }}
                    >
                      {emp.leaveBalance} Days
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create Employee Profile</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            {errorMsg && (
              <div style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.12)', 
                color: 'var(--color-rejected)', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                fontSize: '0.9rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    className="form-control" 
                    placeholder="e.g. Engineering"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <input 
                    type="text" 
                    name="designation" 
                    className="form-control" 
                    placeholder="e.g. Software Engineer"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Leave Balance</label>
                <input 
                  type="number" 
                  name="leaveBalance" 
                  className="form-control" 
                  min="0"
                  value={formData.leaveBalance}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
