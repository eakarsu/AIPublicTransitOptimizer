import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { safetyAPI, aiAPI } from '../services/api';

const emptyForm = { title: '', category: 'vehicle', inspectionType: 'annual', location: '', inspector: '', inspectionDate: '', nextInspection: '', findings: '', riskLevel: 'low', correctiveAction: '', status: 'passed', score: '' };

function SafetyPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await safetyAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['title', 'category', 'location', 'inspector', 'inspectionType'],
    defaultSort: 'title',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const passed = data.filter(i => i.status === 'passed').length;
    const highCritical = data.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length;
    const scored = data.filter(i => i.score);
    const avgScore = scored.length > 0 ? (scored.reduce((s, i) => s + Number(i.score), 0) / scored.length).toFixed(1) : '-';
    return [
      { label: 'Total Inspections', value: total },
      { label: 'Passed', value: passed },
      { label: 'High/Critical Risk', value: highCritical },
      { label: 'Avg Score (%)', value: avgScore },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'inspectionType', label: 'Inspection Type' },
    { key: 'location', label: 'Location' },
    { key: 'inspector', label: 'Inspector' },
    { key: 'inspectionDate', label: 'Inspection Date' },
    { key: 'riskLevel', label: 'Risk Level' },
    { key: 'score', label: 'Score' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await safetyAPI.update(form.id, form);
    } else {
      await safetyAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inspection?')) {
      await safetyAPI.delete(id);
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
      const res = await aiAPI.analyzeSafety({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  const riskBadgeClass = (level) => {
    if (level === 'low') return 'status-active';
    if (level === 'medium') return 'status-maintenance';
    return 'status-retired';
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="safety" />
      <div className="main-content">
        <div className="page-header">
          <h1>Safety & Compliance</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyForm); setEditing(false); setShowForm(true); }}>+ New Inspection</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Safety'}
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
          filterOptions={['passed', 'conditional', 'failed', 'action-required']}
          data={filtered}
          columns={exportColumns}
          exportFilename="safety"
        />

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Title" field="title" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="inspectionType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Location" field="location" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Inspector" field="inspector" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Date" field="inspectionDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Risk Level" field="riskLevel" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Score (%)" field="score" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-text">No inspections found</div></td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.inspectionType}</td>
                    <td>{item.location}</td>
                    <td>{item.inspector}</td>
                    <td>{item.inspectionDate}</td>
                    <td><span className={`status-badge ${riskBadgeClass(item.riskLevel)}`}>{item.riskLevel}</span></td>
                    <td>{item.score}</td>
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
                <h2>{selected.title}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category}</div></div>
                  <div className="detail-item"><div className="detail-label">Inspection Type</div><div className="detail-value">{selected.inspectionType}</div></div>
                  <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{selected.location}</div></div>
                  <div className="detail-item"><div className="detail-label">Inspector</div><div className="detail-value">{selected.inspector}</div></div>
                  <div className="detail-item"><div className="detail-label">Inspection Date</div><div className="detail-value">{selected.inspectionDate}</div></div>
                  <div className="detail-item"><div className="detail-label">Next Inspection</div><div className="detail-value">{selected.nextInspection}</div></div>
                  <div className="detail-item"><div className="detail-label">Risk Level</div><div className="detail-value"><span className={`status-badge ${riskBadgeClass(selected.riskLevel)}`}>{selected.riskLevel}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Score (%)</div><div className="detail-value">{selected.score}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Findings</div><div className="detail-value">{selected.findings}</div></div>
                  <div className="detail-item"><div className="detail-label">Corrective Action</div><div className="detail-value">{selected.correctiveAction}</div></div>
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
                <h2>{editing ? 'Edit Inspection' : 'New Inspection'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                  <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Inspector</label><input value={form.inspector} onChange={e => setForm({...form, inspector: e.target.value})} /></div>
                  <div className="form-group"><label>Score (%)</label><input type="number" value={form.score} onChange={e => setForm({...form, score: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Inspection Date</label><input type="date" value={form.inspectionDate} onChange={e => setForm({...form, inspectionDate: e.target.value})} /></div>
                  <div className="form-group"><label>Next Inspection</label><input type="date" value={form.nextInspection} onChange={e => setForm({...form, nextInspection: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="vehicle">Vehicle</option><option value="station">Station</option><option value="personnel">Personnel</option>
                      <option value="infrastructure">Infrastructure</option><option value="security">Security</option><option value="emergency">Emergency</option>
                      <option value="environmental">Environmental</option><option value="fuel">Fuel</option><option value="technology">Technology</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Inspection Type</label>
                    <select value={form.inspectionType} onChange={e => setForm({...form, inspectionType: e.target.value})}>
                      <option value="annual">Annual</option><option value="semi-annual">Semi-Annual</option>
                      <option value="quarterly">Quarterly</option><option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Risk Level</label>
                    <select value={form.riskLevel} onChange={e => setForm({...form, riskLevel: e.target.value})}>
                      <option value="low">Low</option><option value="medium">Medium</option>
                      <option value="high">High</option><option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="passed">Passed</option><option value="conditional">Conditional</option>
                      <option value="failed">Failed</option><option value="action-required">Action Required</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Findings</label><textarea value={form.findings} onChange={e => setForm({...form, findings: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Corrective Action</label><textarea value={form.correctiveAction} onChange={e => setForm({...form, correctiveAction: e.target.value})} /></div>
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

export default SafetyPage;
