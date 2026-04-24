import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { staffAPI, aiAPI } from '../services/api';

const emptyStaff = { employeeId: '', name: '', role: 'Bus Driver', department: 'Operations', assignedRoute: '', hireDate: '', certifications: '', shiftType: 'Day', phone: '', status: 'active' };

function StaffPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyStaff);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await staffAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searched } = useDataTable(data, {
    searchFields: ['employeeId', 'name', 'role', 'department', 'assignedRoute'],
    defaultSort: 'name',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searched;
    return searched.filter(item => item.status === statusFilter);
  }, [searched, statusFilter]);

  const summaryItems = useMemo(() => [
    { label: 'Total Employees', value: filtered.length },
    { label: 'Active', value: filtered.filter(i => i.status === 'active').length },
    { label: 'Departments', value: new Set(filtered.map(i => i.department)).size },
    { label: 'Drivers', value: filtered.filter(i => i.role === 'Bus Driver').length },
  ], [filtered]);

  const exportColumns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'department', label: 'Department' },
    { key: 'assignedRoute', label: 'Assigned Route' },
    { key: 'shiftType', label: 'Shift Type' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await staffAPI.update(form.id, form);
    } else {
      await staffAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyStaff);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      await staffAPI.delete(id);
      setSelected(null);
      load();
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditing(true);
    setShowForm(true);
    setSelected(null);
  };

  const runAI = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await aiAPI.optimizeStaff({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="staff" />
      <div className="main-content">
        <div className="page-header">
          <h1>Staff Management</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyStaff); setEditing(false); setShowForm(true); }}>+ Add Employee</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Optimize Staff'}
            </button>
          </div>
        </div>

        <SummaryCards items={summaryItems} />

        <div className="ai-context-section">
          <label>Additional Context for AI Analysis</label>
          <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Add any specific questions or context for the AI analysis..." />
        </div>

        <AIResult result={aiResult} loading={aiLoading} onClose={() => setAiResult(null)} />

        <DataToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterField="Status"
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={['active', 'on-leave', 'terminated']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="staff"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Employee ID" field="employeeId" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Role" field="role" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Department" field="department" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Route" field="assignedRoute" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Shift" field="shiftType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No employees found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.employeeId}</strong></td>
                    <td>{item.name}</td>
                    <td>{item.role}</td>
                    <td>{item.department}</td>
                    <td>{item.assignedRoute}</td>
                    <td>{item.shiftType}</td>
                    <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selected.name}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Employee ID</div><div className="detail-value">{selected.employeeId}</div></div>
                  <div className="detail-item"><div className="detail-label">Role</div><div className="detail-value">{selected.role}</div></div>
                  <div className="detail-item"><div className="detail-label">Department</div><div className="detail-value">{selected.department}</div></div>
                  <div className="detail-item"><div className="detail-label">Assigned Route</div><div className="detail-value">{selected.assignedRoute}</div></div>
                  <div className="detail-item"><div className="detail-label">Hire Date</div><div className="detail-value">{selected.hireDate}</div></div>
                  <div className="detail-item"><div className="detail-label">Certifications</div><div className="detail-value">{selected.certifications}</div></div>
                  <div className="detail-item"><div className="detail-label">Shift Type</div><div className="detail-value">{selected.shiftType}</div></div>
                  <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{selected.phone}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-delete" onClick={() => handleDelete(selected.id)}>Delete</button>
                <button className="btn-edit" onClick={() => handleEdit(selected)}>Edit</button>
                <button className="btn-cancel" onClick={() => setSelected(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editing ? 'Edit Employee' : 'New Employee'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Employee ID</label><input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} /></div>
                  <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option value="Bus Driver">Bus Driver</option><option value="Maintenance Technician">Maintenance Technician</option><option value="Station Attendant">Station Attendant</option>
                      <option value="Route Supervisor">Route Supervisor</option><option value="Dispatcher">Dispatcher</option><option value="Safety Inspector">Safety Inspector</option>
                      <option value="IT Specialist">IT Specialist</option><option value="Financial Analyst">Financial Analyst</option><option value="Customer Relations">Customer Relations</option>
                      <option value="Facilities Manager">Facilities Manager</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Assigned Route</label><input value={form.assignedRoute} onChange={e => setForm({...form, assignedRoute: e.target.value})} /></div>
                  <div className="form-group"><label>Hire Date</label><input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Certifications</label><input value={form.certifications} onChange={e => setForm({...form, certifications: e.target.value})} /></div>
                  <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Shift Type</label>
                    <select value={form.shiftType} onChange={e => setForm({...form, shiftType: e.target.value})}>
                      <option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option>
                      <option value="Night">Night</option><option value="Day">Day</option><option value="Split">Split</option>
                      <option value="Rotating">Rotating</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="active">Active</option><option value="on-leave">On Leave</option><option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn-save" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffPage;
