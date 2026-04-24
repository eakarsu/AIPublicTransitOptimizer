import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { routesAPI, aiAPI } from '../services/api';

const emptyRoute = { name: '', routeNumber: '', startPoint: '', endPoint: '', distance: '', estimatedTime: '', stops: '', status: 'active', type: 'bus', frequency: '' };

function RoutesPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyRoute);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await routesAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['name', 'routeNumber', 'startPoint', 'endPoint', 'type'],
    defaultSort: 'routeNumber',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const active = data.filter(d => d.status === 'active').length;
    const avgDist = data.length ? (data.reduce((s, d) => s + (Number(d.distance) || 0), 0) / data.length).toFixed(1) : 0;
    const totalStops = data.reduce((s, d) => s + (Number(d.stops) || 0), 0);
    return [
      { label: 'Total Routes', value: data.length },
      { label: 'Active', value: active },
      { label: 'Avg Distance (km)', value: avgDist },
      { label: 'Total Stops', value: totalStops },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'routeNumber', label: 'Route #' },
    { key: 'name', label: 'Name' },
    { key: 'startPoint', label: 'From' },
    { key: 'endPoint', label: 'To' },
    { key: 'distance', label: 'Distance (km)' },
    { key: 'estimatedTime', label: 'Time (min)' },
    { key: 'stops', label: 'Stops' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) await routesAPI.update(form.id, form);
    else await routesAPI.create(form);
    setShowForm(false); setForm(emptyRoute); setEditing(false); load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this route?')) { await routesAPI.delete(id); setSelected(null); load(); }
  };

  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };

  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.optimizeRoute({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="routes" />
      <div className="main-content">
        <div className="page-header">
          <h1>Route Planning</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyRoute); setEditing(false); setShowForm(true); }}>+ New Route</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Optimize Routes'}
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
          searchTerm={searchTerm} onSearchChange={setSearchTerm}
          filterField="Status" filterValue={statusFilter} onFilterChange={setStatusFilter}
          filterOptions={['active', 'maintenance', 'retired']}
          data={filtered} columns={exportColumns} exportFilename="routes"
        />
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Route #" field="routeNumber" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="From" field="startPoint" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="To" field="endPoint" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Distance" field="distance" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Time" field="estimatedTime" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Stops" field="stops" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-text">No routes found</div></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td><strong>{item.routeNumber}</strong></td>
                  <td>{item.name}</td>
                  <td>{item.startPoint}</td>
                  <td>{item.endPoint}</td>
                  <td>{item.distance} km</td>
                  <td>{item.estimatedTime} min</td>
                  <td>{item.stops}</td>
                  <td>{item.type}</td>
                  <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{selected.name}</h2><button className="modal-close" onClick={() => setSelected(null)}>&times;</button></div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Route Number</div><div className="detail-value">{selected.routeNumber}</div></div>
                  <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
                  <div className="detail-item"><div className="detail-label">Start Point</div><div className="detail-value">{selected.startPoint}</div></div>
                  <div className="detail-item"><div className="detail-label">End Point</div><div className="detail-value">{selected.endPoint}</div></div>
                  <div className="detail-item"><div className="detail-label">Distance</div><div className="detail-value">{selected.distance} km</div></div>
                  <div className="detail-item"><div className="detail-label">Estimated Time</div><div className="detail-value">{selected.estimatedTime} min</div></div>
                  <div className="detail-item"><div className="detail-label">Stops</div><div className="detail-value">{selected.stops}</div></div>
                  <div className="detail-item"><div className="detail-label">Frequency</div><div className="detail-value">{selected.frequency}</div></div>
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

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{editing ? 'Edit Route' : 'New Route'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Route Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="form-group"><label>Route Number</label><input value={form.routeNumber} onChange={e => setForm({...form, routeNumber: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Start Point</label><input value={form.startPoint} onChange={e => setForm({...form, startPoint: e.target.value})} /></div>
                  <div className="form-group"><label>End Point</label><input value={form.endPoint} onChange={e => setForm({...form, endPoint: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Distance (km)</label><input type="number" value={form.distance} onChange={e => setForm({...form, distance: e.target.value})} /></div>
                  <div className="form-group"><label>Est. Time (min)</label><input type="number" value={form.estimatedTime} onChange={e => setForm({...form, estimatedTime: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Stops</label><input type="number" value={form.stops} onChange={e => setForm({...form, stops: e.target.value})} /></div>
                  <div className="form-group"><label>Frequency</label><input value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="bus">Bus</option><option value="express">Express</option><option value="metro">Metro</option>
                      <option value="tram">Tram</option><option value="shuttle">Shuttle</option><option value="minibus">Minibus</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="active">Active</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option>
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

export default RoutesPage;
