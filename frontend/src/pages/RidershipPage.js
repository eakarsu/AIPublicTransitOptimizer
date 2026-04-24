import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { ridershipAPI, aiAPI } from '../services/api';

const emptyItem = { routeName: '', date: '', dailyRiders: '', peakHourRiders: '', offPeakRiders: '', weekendRiders: '', trend: 'stable', satisfaction: '', loadFactor: '' };

function RidershipPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => { const res = await ridershipAPI.getAll(); setData(res.data); }, []);
  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['routeName', 'date', 'trend'], defaultSort: 'routeName',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.trend === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const avgDaily = data.length ? Math.round(data.reduce((s, d) => s + (Number(d.dailyRiders) || 0), 0) / data.length) : 0;
    const avgSat = data.length ? (data.reduce((s, d) => s + (Number(d.satisfaction) || 0), 0) / data.length).toFixed(1) : 0;
    const avgLoad = data.length ? (data.reduce((s, d) => s + (Number(d.loadFactor) || 0), 0) / data.length).toFixed(0) : 0;
    return [
      { label: 'Total Records', value: data.length },
      { label: 'Avg Daily Riders', value: avgDaily.toLocaleString() },
      { label: 'Avg Satisfaction', value: `${avgSat}/5` },
      { label: 'Avg Load Factor', value: `${avgLoad}%` },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'routeName', label: 'Route' }, { key: 'date', label: 'Date' },
    { key: 'dailyRiders', label: 'Daily Riders' }, { key: 'peakHourRiders', label: 'Peak Hour' },
    { key: 'offPeakRiders', label: 'Off-Peak' }, { key: 'weekendRiders', label: 'Weekend' },
    { key: 'trend', label: 'Trend' }, { key: 'satisfaction', label: 'Satisfaction' },
    { key: 'loadFactor', label: 'Load %' },
  ];

  const handleSave = async () => {
    if (editing) await ridershipAPI.update(form.id, form);
    else await ridershipAPI.create(form);
    setShowForm(false); setForm(emptyItem); setEditing(false); load();
  };
  const handleDelete = async (id) => { if (window.confirm('Delete this record?')) { await ridershipAPI.delete(id); setSelected(null); load(); } };
  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };
  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.analyzeRidership({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="ridership" />
      <div className="main-content">
        <div className="page-header">
          <h1>Ridership Data</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyItem); setEditing(false); setShowForm(true); }}>+ New Record</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Analyze Ridership'}</button>
          </div>
        </div>

        <SummaryCards items={summaryItems} />

        <div className="ai-context-section">
          <label>Additional Context for AI Analysis</label>
          <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Add any specific questions or context..." />
        </div>
        <AIResult result={aiResult} loading={aiLoading} onClose={() => setAiResult(null)} />

        <DataToolbar
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          filterField="Trend" filterValue={statusFilter} onFilterChange={setStatusFilter}
          filterOptions={['increasing', 'stable', 'decreasing']}
          data={filtered} columns={exportColumns} exportFilename="ridership"
        />
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Route" field="routeName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Daily Riders" field="dailyRiders" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Peak Hour" field="peakHourRiders" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Off-Peak" field="offPeakRiders" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Weekend" field="weekendRiders" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Trend" field="trend" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Satisfaction" field="satisfaction" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Load %" field="loadFactor" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-text">No records found</div></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td><strong>{item.routeName}</strong></td>
                  <td>{item.date}</td>
                  <td>{item.dailyRiders?.toLocaleString()}</td>
                  <td>{item.peakHourRiders?.toLocaleString()}</td>
                  <td>{item.offPeakRiders?.toLocaleString()}</td>
                  <td>{item.weekendRiders?.toLocaleString()}</td>
                  <td><span className={`status-badge status-${item.trend === 'increasing' ? 'active' : item.trend === 'decreasing' ? 'retired' : 'maintenance'}`}>{item.trend}</span></td>
                  <td>{item.satisfaction}/5</td>
                  <td>{item.loadFactor}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{selected.routeName} - Ridership</h2><button className="modal-close" onClick={() => setSelected(null)}>&times;</button></div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Route</div><div className="detail-value">{selected.routeName}</div></div>
                  <div className="detail-item"><div className="detail-label">Date</div><div className="detail-value">{selected.date}</div></div>
                  <div className="detail-item"><div className="detail-label">Daily Riders</div><div className="detail-value">{selected.dailyRiders?.toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Peak Hour</div><div className="detail-value">{selected.peakHourRiders?.toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Off-Peak</div><div className="detail-value">{selected.offPeakRiders?.toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Weekend</div><div className="detail-value">{selected.weekendRiders?.toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Trend</div><div className="detail-value">{selected.trend}</div></div>
                  <div className="detail-item"><div className="detail-label">Satisfaction</div><div className="detail-value">{selected.satisfaction}/5</div></div>
                  <div className="detail-item"><div className="detail-label">Load Factor</div><div className="detail-value">{selected.loadFactor}%</div></div>
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

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{editing ? 'Edit Record' : 'New Ridership Record'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Route Name</label><input value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} /></div>
                  <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Daily Riders</label><input type="number" value={form.dailyRiders} onChange={e => setForm({...form, dailyRiders: e.target.value})} /></div>
                  <div className="form-group"><label>Peak Hour Riders</label><input type="number" value={form.peakHourRiders} onChange={e => setForm({...form, peakHourRiders: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Off-Peak Riders</label><input type="number" value={form.offPeakRiders} onChange={e => setForm({...form, offPeakRiders: e.target.value})} /></div>
                  <div className="form-group"><label>Weekend Riders</label><input type="number" value={form.weekendRiders} onChange={e => setForm({...form, weekendRiders: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Trend</label><select value={form.trend} onChange={e => setForm({...form, trend: e.target.value})}><option value="increasing">Increasing</option><option value="stable">Stable</option><option value="decreasing">Decreasing</option></select></div>
                  <div className="form-group"><label>Satisfaction (1-5)</label><input type="number" step="0.1" min="1" max="5" value={form.satisfaction} onChange={e => setForm({...form, satisfaction: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Load Factor (%)</label><input type="number" value={form.loadFactor} onChange={e => setForm({...form, loadFactor: e.target.value})} /></div>
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

export default RidershipPage;
