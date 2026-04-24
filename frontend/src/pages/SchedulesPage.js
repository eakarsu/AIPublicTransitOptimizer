import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { schedulesAPI, aiAPI } from '../services/api';

const emptyItem = { routeName: '', dayType: 'Weekday', firstDeparture: '', lastDeparture: '', peakFrequency: '', offPeakFrequency: '', totalTrips: '', status: 'active', effectiveDate: '' };

function SchedulesPage({ onLogout }) {
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

  const load = useCallback(async () => { const res = await schedulesAPI.getAll(); setData(res.data); }, []);
  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['routeName', 'dayType'], defaultSort: 'routeName',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const active = data.filter(d => d.status === 'active').length;
    const avgPeak = data.length ? (data.reduce((s, d) => s + (Number(d.peakFrequency) || 0), 0) / data.length).toFixed(0) : 0;
    const totalTrips = data.reduce((s, d) => s + (Number(d.totalTrips) || 0), 0);
    return [
      { label: 'Total Schedules', value: data.length },
      { label: 'Active', value: active },
      { label: 'Avg Peak Freq (min)', value: avgPeak },
      { label: 'Total Trips', value: totalTrips.toLocaleString() },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'routeName', label: 'Route' }, { key: 'dayType', label: 'Day Type' },
    { key: 'firstDeparture', label: 'First' }, { key: 'lastDeparture', label: 'Last' },
    { key: 'peakFrequency', label: 'Peak Freq' }, { key: 'offPeakFrequency', label: 'Off-Peak Freq' },
    { key: 'totalTrips', label: 'Trips' }, { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) await schedulesAPI.update(form.id, form);
    else await schedulesAPI.create(form);
    setShowForm(false); setForm(emptyItem); setEditing(false); load();
  };
  const handleDelete = async (id) => { if (window.confirm('Delete this schedule?')) { await schedulesAPI.delete(id); setSelected(null); load(); } };
  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };
  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.optimizeSchedule({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="schedules" />
      <div className="main-content">
        <div className="page-header">
          <h1>Schedule Optimization</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyItem); setEditing(false); setShowForm(true); }}>+ New Schedule</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Optimize Schedules'}</button>
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
          filterField="Status" filterValue={statusFilter} onFilterChange={setStatusFilter}
          filterOptions={['active', 'maintenance', 'retired']}
          data={filtered} columns={exportColumns} exportFilename="schedules"
        />
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Route" field="routeName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Day Type" field="dayType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="First" field="firstDeparture" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Last" field="lastDeparture" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Peak Freq" field="peakFrequency" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Off-Peak Freq" field="offPeakFrequency" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Trips" field="totalTrips" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="no-data"><div className="no-data-text">No schedules found</div></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td><strong>{item.routeName}</strong></td>
                  <td>{item.dayType}</td>
                  <td>{item.firstDeparture}</td>
                  <td>{item.lastDeparture}</td>
                  <td>{item.peakFrequency} min</td>
                  <td>{item.offPeakFrequency} min</td>
                  <td>{item.totalTrips}</td>
                  <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{selected.routeName} - Schedule</h2><button className="modal-close" onClick={() => setSelected(null)}>&times;</button></div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Route</div><div className="detail-value">{selected.routeName}</div></div>
                  <div className="detail-item"><div className="detail-label">Day Type</div><div className="detail-value">{selected.dayType}</div></div>
                  <div className="detail-item"><div className="detail-label">First Departure</div><div className="detail-value">{selected.firstDeparture}</div></div>
                  <div className="detail-item"><div className="detail-label">Last Departure</div><div className="detail-value">{selected.lastDeparture}</div></div>
                  <div className="detail-item"><div className="detail-label">Peak Frequency</div><div className="detail-value">{selected.peakFrequency} min</div></div>
                  <div className="detail-item"><div className="detail-label">Off-Peak Frequency</div><div className="detail-value">{selected.offPeakFrequency} min</div></div>
                  <div className="detail-item"><div className="detail-label">Total Trips</div><div className="detail-value">{selected.totalTrips}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Effective Date</div><div className="detail-value">{selected.effectiveDate}</div></div>
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
              <div className="modal-header"><h2>{editing ? 'Edit Schedule' : 'New Schedule'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Route Name</label><input value={form.routeName} onChange={e => setForm({...form, routeName: e.target.value})} /></div>
                  <div className="form-group"><label>Day Type</label><select value={form.dayType} onChange={e => setForm({...form, dayType: e.target.value})}><option>Weekday</option><option>Weekend</option><option>Daily</option><option>Fri-Sat</option><option>School Days</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>First Departure</label><input type="time" value={form.firstDeparture} onChange={e => setForm({...form, firstDeparture: e.target.value})} /></div>
                  <div className="form-group"><label>Last Departure</label><input type="time" value={form.lastDeparture} onChange={e => setForm({...form, lastDeparture: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Peak Frequency (min)</label><input type="number" value={form.peakFrequency} onChange={e => setForm({...form, peakFrequency: e.target.value})} /></div>
                  <div className="form-group"><label>Off-Peak Frequency (min)</label><input type="number" value={form.offPeakFrequency} onChange={e => setForm({...form, offPeakFrequency: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Total Trips</label><input type="number" value={form.totalTrips} onChange={e => setForm({...form, totalTrips: e.target.value})} /></div>
                  <div className="form-group"><label>Effective Date</label><input type="date" value={form.effectiveDate} onChange={e => setForm({...form, effectiveDate: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="maintenance">Suspended</option><option value="retired">Retired</option></select></div>
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

export default SchedulesPage;
