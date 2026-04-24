import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { stopsAPI, aiAPI } from '../services/api';

const emptyStop = { name: '', stopCode: '', type: 'stop', latitude: '', longitude: '', zone: '', shelterAvailable: false, benchAvailable: false, digitalDisplay: false, routesServed: '', dailyBoardings: '', status: 'active' };

function StopsPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyStop);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await stopsAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['name', 'stopCode', 'zone', 'type', 'routesServed'],
    defaultSort: 'stopCode',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => [
    { label: 'Total Stops', value: data.length },
    { label: 'Active', value: data.filter(i => i.status === 'active').length },
    { label: 'Total Daily Boardings', value: data.reduce((sum, i) => sum + (Number(i.dailyBoardings) || 0), 0).toLocaleString() },
    { label: 'With Shelter', value: data.filter(i => i.shelterAvailable).length },
  ], [data]);

  const exportColumns = [
    { key: 'stopCode', label: 'Stop Code' },
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'zone', label: 'Zone' },
    { key: 'shelterAvailable', label: 'Shelter Available' },
    { key: 'benchAvailable', label: 'Bench Available' },
    { key: 'digitalDisplay', label: 'Digital Display' },
    { key: 'routesServed', label: 'Routes Served' },
    { key: 'dailyBoardings', label: 'Daily Boardings' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await stopsAPI.update(form.id, form);
    } else {
      await stopsAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyStop);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this stop?')) {
      await stopsAPI.delete(id);
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
      const res = await aiAPI.optimizeStops({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="stops" />
      <div className="main-content">
        <div className="page-header">
          <h1>Stops & Stations</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyStop); setEditing(false); setShowForm(true); }}>+ New Stop</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Optimize Stops'}
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
          filterOptions={['active', 'maintenance', 'closed']}
          data={filtered}
          columns={exportColumns}
          exportFilename="stops"
        />

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Code" field="stopCode" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Zone" field="zone" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Shelter" field="shelterAvailable" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Bench" field="benchAvailable" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Display" field="digitalDisplay" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Routes" field="routesServed" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Boardings" field="dailyBoardings" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" className="no-data"><div className="no-data-text">No stops found</div></td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.stopCode}</strong></td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.zone}</td>
                    <td><span className={item.shelterAvailable ? 'bool-yes' : 'bool-no'}>{item.shelterAvailable ? 'Yes' : 'No'}</span></td>
                    <td><span className={item.benchAvailable ? 'bool-yes' : 'bool-no'}>{item.benchAvailable ? 'Yes' : 'No'}</span></td>
                    <td><span className={item.digitalDisplay ? 'bool-yes' : 'bool-no'}>{item.digitalDisplay ? 'Yes' : 'No'}</span></td>
                    <td>{item.routesServed}</td>
                    <td>{item.dailyBoardings}</td>
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
                  <div className="detail-item"><div className="detail-label">Stop Code</div><div className="detail-value">{selected.stopCode}</div></div>
                  <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
                  <div className="detail-item"><div className="detail-label">Latitude</div><div className="detail-value">{selected.latitude}</div></div>
                  <div className="detail-item"><div className="detail-label">Longitude</div><div className="detail-value">{selected.longitude}</div></div>
                  <div className="detail-item"><div className="detail-label">Zone</div><div className="detail-value">{selected.zone}</div></div>
                  <div className="detail-item"><div className="detail-label">Shelter Available</div><div className="detail-value">{selected.shelterAvailable ? 'Yes' : 'No'}</div></div>
                  <div className="detail-item"><div className="detail-label">Bench Available</div><div className="detail-value">{selected.benchAvailable ? 'Yes' : 'No'}</div></div>
                  <div className="detail-item"><div className="detail-label">Digital Display</div><div className="detail-value">{selected.digitalDisplay ? 'Yes' : 'No'}</div></div>
                  <div className="detail-item"><div className="detail-label">Routes Served</div><div className="detail-value">{selected.routesServed}</div></div>
                  <div className="detail-item"><div className="detail-label">Daily Boardings</div><div className="detail-value">{selected.dailyBoardings}</div></div>
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
                <h2>{editing ? 'Edit Stop' : 'New Stop'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Stop Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="form-group"><label>Stop Code</label><input value={form.stopCode} onChange={e => setForm({...form, stopCode: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Latitude</label><input type="number" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
                  <div className="form-group"><label>Longitude</label><input type="number" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} /></div>
                  <div className="form-group"><label>Routes Served</label><input value={form.routesServed} onChange={e => setForm({...form, routesServed: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Daily Boardings</label><input type="number" value={form.dailyBoardings} onChange={e => setForm({...form, dailyBoardings: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      <option value="stop">Stop</option><option value="station">Station</option><option value="terminal">Terminal</option><option value="park-ride">Park & Ride</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="active">Active</option><option value="maintenance">Maintenance</option><option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><input type="checkbox" checked={form.shelterAvailable} onChange={e => setForm({...form, shelterAvailable: e.target.checked})} /> Shelter Available</label>
                  </div>
                  <div className="form-group">
                    <label><input type="checkbox" checked={form.benchAvailable} onChange={e => setForm({...form, benchAvailable: e.target.checked})} /> Bench Available</label>
                  </div>
                  <div className="form-group">
                    <label><input type="checkbox" checked={form.digitalDisplay} onChange={e => setForm({...form, digitalDisplay: e.target.checked})} /> Digital Display</label>
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

export default StopsPage;
