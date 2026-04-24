import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { maintenanceAPI, aiAPI } from '../services/api';

const emptyRecord = { vehicleId: '', type: 'preventive', description: '', scheduledDate: '', completedDate: '', cost: '', technician: '', partsUsed: '', mileageAtService: '', status: 'scheduled', priority: 'normal' };

function MaintenancePage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyRecord);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await maintenanceAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searched } = useDataTable(data, {
    searchFields: ['vehicleId', 'type', 'description', 'technician'],
    defaultSort: 'vehicleId',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searched;
    return searched.filter(item => item.status === statusFilter);
  }, [searched, statusFilter]);

  const summaryItems = useMemo(() => [
    { label: 'Total Records', value: filtered.length },
    { label: 'Scheduled', value: filtered.filter(i => i.status === 'scheduled').length },
    { label: 'Total Cost ($)', value: '$' + filtered.reduce((sum, i) => sum + (Number(i.cost) || 0), 0).toLocaleString() },
    { label: 'Completed', value: filtered.filter(i => i.status === 'completed').length },
  ], [filtered]);

  const exportColumns = [
    { key: 'vehicleId', label: 'Vehicle ID' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'scheduledDate', label: 'Scheduled Date' },
    { key: 'completedDate', label: 'Completed Date' },
    { key: 'cost', label: 'Cost' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await maintenanceAPI.update(form.id, form);
    } else {
      await maintenanceAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyRecord);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await maintenanceAPI.delete(id);
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
      const res = await aiAPI.planMaintenance({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="maintenance" />
      <div className="main-content">
        <div className="page-header">
          <h1>Maintenance Logs</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyRecord); setEditing(false); setShowForm(true); }}>+ New Record</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Plan Maintenance'}
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
          filterOptions={['scheduled', 'in-progress', 'completed', 'cancelled']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="maintenance"
        />

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Vehicle ID" field="vehicleId" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Description" field="description" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Scheduled" field="scheduledDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Completed" field="completedDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Cost ($)" field="cost" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Priority" field="priority" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="no-data"><div className="no-data-text">No maintenance records found</div></td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.vehicleId}</strong></td>
                    <td>{item.type}</td>
                    <td>{item.description && item.description.length > 40 ? item.description.substring(0, 40) + '...' : item.description}</td>
                    <td>{item.scheduledDate}</td>
                    <td>{item.completedDate}</td>
                    <td>{item.cost}</td>
                    <td>{item.priority}</td>
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
                <h2>Vehicle {selected.vehicleId}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Vehicle ID</div><div className="detail-value">{selected.vehicleId}</div></div>
                  <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
                  <div className="detail-item"><div className="detail-label">Description</div><div className="detail-value">{selected.description}</div></div>
                  <div className="detail-item"><div className="detail-label">Scheduled Date</div><div className="detail-value">{selected.scheduledDate}</div></div>
                  <div className="detail-item"><div className="detail-label">Completed Date</div><div className="detail-value">{selected.completedDate}</div></div>
                  <div className="detail-item"><div className="detail-label">Cost</div><div className="detail-value">${selected.cost}</div></div>
                  <div className="detail-item"><div className="detail-label">Technician</div><div className="detail-value">{selected.technician}</div></div>
                  <div className="detail-item"><div className="detail-label">Parts Used</div><div className="detail-value">{selected.partsUsed}</div></div>
                  <div className="detail-item"><div className="detail-label">Mileage at Service</div><div className="detail-value">{selected.mileageAtService}</div></div>
                  <div className="detail-item"><div className="detail-label">Priority</div><div className="detail-value">{selected.priority}</div></div>
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
                <h2>{editing ? 'Edit Record' : 'New Record'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Vehicle ID</label><input value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="preventive">Preventive</option><option value="corrective">Corrective</option><option value="inspection">Inspection</option>
                      <option value="warranty">Warranty</option><option value="decommission">Decommission</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                  <div className="form-group"><label>Technician</label><input value={form.technician} onChange={e => setForm({...form, technician: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Scheduled Date</label><input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} /></div>
                  <div className="form-group"><label>Completed Date</label><input type="date" value={form.completedDate} onChange={e => setForm({...form, completedDate: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Cost ($)</label><input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} /></div>
                  <div className="form-group"><label>Parts Used</label><input value={form.partsUsed} onChange={e => setForm({...form, partsUsed: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Mileage at Service</label><input type="number" value={form.mileageAtService} onChange={e => setForm({...form, mileageAtService: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                      <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="scheduled">Scheduled</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
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

export default MaintenancePage;
