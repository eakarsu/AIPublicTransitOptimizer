import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { performanceAPI, aiAPI } from '../services/api';

const emptyMetric = { metricName: '', category: 'Service Quality', currentValue: '', targetValue: '', unit: '', period: '', trend: 'stable', lastUpdated: '', status: 'on-track', notes: '' };

function PerformancePage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyMetric);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await performanceAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searched } = useDataTable(data, {
    searchFields: ['metricName', 'category', 'unit'],
    defaultSort: 'metricName',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searched;
    return searched.filter(item => item.status === statusFilter);
  }, [searched, statusFilter]);

  const summaryItems = useMemo(() => [
    { label: 'Total Metrics', value: filtered.length },
    { label: 'On Track', value: filtered.filter(i => i.status === 'on-track').length },
    { label: 'Below Target', value: filtered.filter(i => i.status === 'below-target').length },
    { label: 'Exceeded', value: filtered.filter(i => i.status === 'exceeded').length },
  ], [filtered]);

  const exportColumns = [
    { key: 'metricName', label: 'Metric Name' },
    { key: 'category', label: 'Category' },
    { key: 'currentValue', label: 'Current Value' },
    { key: 'targetValue', label: 'Target Value' },
    { key: 'unit', label: 'Unit' },
    { key: 'period', label: 'Period' },
    { key: 'trend', label: 'Trend' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await performanceAPI.update(form.id, form);
    } else {
      await performanceAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyMetric);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this metric?')) {
      await performanceAPI.delete(id);
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
      const res = await aiAPI.analyzePerformance({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'on-track': return 'status-active';
      case 'below-target': return 'status-retired';
      case 'improving': return 'status-maintenance';
      default: return 'status-active';
    }
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="performance" />
      <div className="main-content">
        <div className="page-header">
          <h1>Performance KPIs</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyMetric); setEditing(false); setShowForm(true); }}>+ New Metric</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Performance'}
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
          filterOptions={['on-track', 'below-target', 'exceeded']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="performance"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Metric" field="metricName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Current" field="currentValue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Target" field="targetValue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Unit" field="unit" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Period" field="period" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Trend" field="trend" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No metrics found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.metricName}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.currentValue}</td>
                    <td>{item.targetValue}</td>
                    <td>{item.unit}</td>
                    <td>{item.period}</td>
                    <td>{item.trend}</td>
                    <td><span className={`status-badge ${statusBadgeClass(item.status)}`}>{item.status}</span></td>
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
                <h2>{selected.metricName}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Metric Name</div><div className="detail-value">{selected.metricName}</div></div>
                  <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category}</div></div>
                  <div className="detail-item"><div className="detail-label">Current Value</div><div className="detail-value">{selected.currentValue}</div></div>
                  <div className="detail-item"><div className="detail-label">Target Value</div><div className="detail-value">{selected.targetValue}</div></div>
                  <div className="detail-item"><div className="detail-label">Unit</div><div className="detail-value">{selected.unit}</div></div>
                  <div className="detail-item"><div className="detail-label">Period</div><div className="detail-value">{selected.period}</div></div>
                  <div className="detail-item"><div className="detail-label">Trend</div><div className="detail-value">{selected.trend}</div></div>
                  <div className="detail-item"><div className="detail-label">Last Updated</div><div className="detail-value">{selected.lastUpdated}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge ${statusBadgeClass(selected.status)}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Notes</div><div className="detail-value">{selected.notes}</div></div>
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
                <h2>{editing ? 'Edit Metric' : 'New Metric'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Metric Name</label><input value={form.metricName} onChange={e => setForm({...form, metricName: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="Service Quality">Service Quality</option>
                      <option value="Financial">Financial</option>
                      <option value="Operations">Operations</option>
                      <option value="Fleet">Fleet</option>
                      <option value="Safety">Safety</option>
                      <option value="HR">HR</option>
                      <option value="Accessibility">Accessibility</option>
                      <option value="Sustainability">Sustainability</option>
                      <option value="Planning">Planning</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Current Value</label><input value={form.currentValue} onChange={e => setForm({...form, currentValue: e.target.value})} /></div>
                  <div className="form-group"><label>Target Value</label><input value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
                  <div className="form-group"><label>Period</label><input value={form.period} onChange={e => setForm({...form, period: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Trend</label>
                    <select value={form.trend} onChange={e => setForm({...form, trend: e.target.value})}>
                      <option value="improving">Improving</option>
                      <option value="stable">Stable</option>
                      <option value="worsening">Worsening</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="on-track">On Track</option>
                      <option value="below-target">Below Target</option>
                      <option value="exceeded">Exceeded</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Last Updated</label><input value={form.lastUpdated} onChange={e => setForm({...form, lastUpdated: e.target.value})} /></div>
                  <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
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

export default PerformancePage;
