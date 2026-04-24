import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { incidentsAPI, aiAPI } from '../services/api';

const emptyIncident = { title: '', type: 'mechanical', severity: 'medium', routeAffected: '', location: '', description: '', status: 'open', assignedTo: '' };

const severityBadgeClass = (severity) => {
  switch (severity) {
    case 'low': return 'status-badge status-active';
    case 'medium': return 'status-badge status-maintenance';
    case 'high':
    case 'critical': return 'status-badge status-retired';
    default: return 'status-badge';
  }
};

function IncidentsPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyIncident);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await incidentsAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (editing) {
      await incidentsAPI.update(form.id, form);
    } else {
      await incidentsAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyIncident);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this incident?')) {
      await incidentsAPI.delete(id);
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
      const res = await aiAPI.analyzeIncidents({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['title', 'type', 'routeAffected', 'location', 'assignedTo'],
    defaultSort: 'title',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const open = data.filter(i => i.status === 'open').length;
    const critical = data.filter(i => i.severity === 'critical').length;
    const resolved = data.filter(i => i.status === 'resolved').length;
    return [
      { label: 'Total Incidents', value: total },
      { label: 'Open', value: open },
      { label: 'Critical', value: critical },
      { label: 'Resolved', value: resolved },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'routeAffected', label: 'Route Affected' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'assignedTo', label: 'Assigned To' },
  ];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="incidents" />
      <div className="main-content">
        <div className="page-header">
          <h1>Incidents & Alerts</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyIncident); setEditing(false); setShowForm(true); }}>+ Report Incident</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Incidents'}
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
          filterOptions={['open', 'investigating', 'resolved', 'closed']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="incidents"
        />

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Title" field="title" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Severity" field="severity" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Route" field="routeAffected" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Location" field="location" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Assigned To" field="assignedTo" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="no-data"><div className="no-data-text">No incidents found</div></td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.type}</td>
                    <td><span className={severityBadgeClass(item.severity)}>{item.severity}</span></td>
                    <td>{item.routeAffected}</td>
                    <td>{item.location}</td>
                    <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                    <td>{item.assignedTo}</td>
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
                <h2>{selected.title}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Title</div><div className="detail-value">{selected.title}</div></div>
                  <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
                  <div className="detail-item"><div className="detail-label">Severity</div><div className="detail-value"><span className={severityBadgeClass(selected.severity)}>{selected.severity}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Route Affected</div><div className="detail-value">{selected.routeAffected}</div></div>
                  <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{selected.location}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Assigned To</div><div className="detail-value">{selected.assignedTo}</div></div>
                  <div className="detail-item"><div className="detail-label">Description</div><div className="detail-value">{selected.description}</div></div>
                  <div className="detail-item"><div className="detail-label">Reported At</div><div className="detail-value">{selected.reportedAt}</div></div>
                  <div className="detail-item"><div className="detail-label">Resolved At</div><div className="detail-value">{selected.resolvedAt}</div></div>
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
                <h2>{editing ? 'Edit Incident' : 'Report Incident'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                  <div className="form-group"><label>Assigned To</label><input value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="mechanical">Mechanical</option><option value="safety">Safety</option><option value="infrastructure">Infrastructure</option>
                      <option value="equipment">Equipment</option><option value="external">External</option><option value="security">Security</option>
                      <option value="weather">Weather</option><option value="technology">Technology</option><option value="operational">Operational</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Route Affected</label><input value={form.routeAffected} onChange={e => setForm({...form, routeAffected: e.target.value})} /></div>
                  <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
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

export default IncidentsPage;
