import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import LeaveRequestList from './components/LeaveRequestList';

const API_BASE_URL = 'http://localhost:8080/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all initial data
  const fetchData = async () => {
    try {
      const [empRes, leaveRes] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`),
        fetch(`${API_BASE_URL}/leaves`)
      ]);

      if (empRes.ok && leaveRes.ok) {
        const empData = await empRes.json();
        const leaveData = await leaveRes.json();
        setEmployees(empData);
        setLeaves(leaveData);
      } else {
        showToast('Failed to load records from the server.', 'error');
      }
    } catch (err) {
      showToast('Database connection offline.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.message || 'Validation failed.' };
      }

      setEmployees((prev) => [...prev, data]);
      showToast(`Employee "${data.name}" added successfully!`);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Network error. Please try again.' };
    }
  };

  const handleApplyLeave = async (employeeId, leaveData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/employee/${employeeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.message || 'Validation failed.' };
      }

      // Re-fetch all data to ensure leave list and employee balances align
      await fetchData();
      showToast('Leave request submitted successfully!');
      return { success: true };
    } catch (err) {
      console.error(err);
      return { error: 'Network error. Please try again.' };
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Failed to update leave status.', 'error');
        return;
      }

      await fetchData();
      showToast(`Leave request ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server.', 'error');
    }
  };

  const handleCancelRequest = async (leaveId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leaves/${leaveId}/cancel`, {
        method: 'PUT'
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Failed to cancel leave request.', 'error');
        return;
      }

      await fetchData();
      showToast('Leave request cancelled successfully.');
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to backend server.', 'error');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Synchronizing Database Records...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard employees={employees} leaves={leaves} onNavigate={setActiveTab} />;
      case 'employees':
        return <EmployeeList employees={employees} onAddEmployee={handleAddEmployee} />;
      case 'leaves':
        return (
          <LeaveRequestList
            leaves={leaves}
            employees={employees}
            onApplyLeave={handleApplyLeave}
            onUpdateStatus={handleUpdateStatus}
            onCancelRequest={handleCancelRequest}
          />
        );
      default:
        return <Dashboard employees={employees} leaves={leaves} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-icon">LMS</div>
          <span className="logo-text">Leave Tracker</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'employees' ? 'active' : ''}`}
                onClick={() => setActiveTab('employees')}
              >
                👥 Employees
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'leaves' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaves')}
              >
                📋 Leave Audits
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <div className="header-container">
          <div>
            <h1 className="page-title">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'employees' && 'Employee Profiles'}
              {activeTab === 'leaves' && 'Leave Applications'}
            </h1>
            <p className="page-subtitle">
              {activeTab === 'dashboard' && 'Real-time metrics, system health, and quick actions'}
              {activeTab === 'employees' && 'Manage corporate staff details and active balances'}
              {activeTab === 'leaves' && 'Review, audit, cancel, and apply for employee leaves'}
            </p>
          </div>
        </div>

        {/* Dynamic page content */}
        {renderContent()}

        {/* Dynamic Toast Container */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <span>{t.type === 'success' ? '✅' : '❌'}</span>
              <div>{t.message}</div>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
