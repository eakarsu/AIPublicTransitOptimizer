import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { fleetAPI, aiAPI } from '../services/api';

const emptyItem = { vehicleId: '', type: 'Standard Bus', make: '', model: '', year: '', capacity: '', fuelType: 'diesel', mileage: '', status: 'active', assignedRoute: '', lastMaintenance: '', nextMaintenance: '' };

function FleetPage({ onLogout }) {
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

  const load = useCallback(async () => { const res = await fleetAPI.getAll(); setData(res.data); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (editing) await fleetAPI.update(form.id, form);
    else await fleetAPI.create(form);
    setShowForm(false); setForm(emptyItem); setEditing(false); load();
  };

  const handleDelete = async (id) => { if (window.confirm('Delete this vehicle?')) { await fleetAPI.delete(id); setSelected(null); load(); } };
  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };

  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.allocateFleet({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['vehicleId', 'type', 'make', 'model', 'assignedRoute', 'fuelType'],
    defaultSort: 'vehicleId',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const active = data.filter(i => i.status === 'active').length;
    const avgMileage = total > 0 ? Math.round(data.reduce((s, i) => s + (Number(i.mileage) || 0), 0) / total).toLocaleString() : '0';
    const electricHybrid = data.filter(i => i.fuelType === 'electric' || i.fuelType === 'hybrid').length;
    return [
      { label: 'Total Vehicles', value: total },
      { label: 'Active', value: active },
      { label: 'Avg Mileage (km)', value: avgMileage },
      { label: 'Electric/Hybrid', value: electricHybrid },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'vehicleId', label: 'Vehicle ID' },
    { key: 'type', label: 'Type' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'assignedRoute', label: 'Assigned Route' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="fleet" />
      <div className="main-content">
        <div className="page-header">
          <h1>Fleet Allocation</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyItem); setEditing(false); setShowForm(true); }}>+ New Vehicle</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Allocate Fleet'}</button>
          </div>
        </div>

        <SummaryCards items={summaryItems} />

        <div className="ai-context-section">
          <label>Additional Context for AI Analysis</label>
          <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Add any specific questions or context..." />
        </div>
        <AIResult result={aiResult} loading={aiLoading} onClose={() => setAiResult(null)} />

        <DataToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterField="Status"
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={['active', 'maintenance', 'retired']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="fleet"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Vehicle ID" field="vehicleId" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="type" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Make/Model" field="make" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Year" field="year" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Capacity" field="capacity" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Fuel" field="fuelType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Mileage" field="mileage" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Route" field="assignedRoute" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No vehicles found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.vehicleId}</strong></td>
                    <td>{item.type}</td>
                    <td>{item.make} {item.model}</td>
                    <td>{item.year}</td>
                    <td>{item.capacity}</td>
                    <td>{item.fuelType}</td>
                    <td>{item.mileage?.toLocaleString()} km</td>
                    <td>{item.assignedRoute || '-'}</td>
                    <td><span className={`status-badge status-${item.status}`}>{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{selected.vehicleId}</h2><button className="modal-close" onClick={() => setSelected(null)}>&times;</button></div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Vehicle ID</div><div className="detail-value">{selected.vehicleId}</div></div>
                  <div className="detail-item"><div className="detail-label">Type</div><div className="detail-value">{selected.type}</div></div>
                  <div className="detail-item"><div className="detail-label">Make</div><div className="detail-value">{selected.make}</div></div>
                  <div className="detail-item"><div className="detail-label">Model</div><div className="detail-value">{selected.model}</div></div>
                  <div className="detail-item"><div className="detail-label">Year</div><div className="detail-value">{selected.year}</div></div>
                  <div className="detail-item"><div className="detail-label">Capacity</div><div className="detail-value">{selected.capacity} passengers</div></div>
                  <div className="detail-item"><div className="detail-label">Fuel Type</div><div className="detail-value">{selected.fuelType}</div></div>
                  <div className="detail-item"><div className="detail-label">Mileage</div><div className="detail-value">{selected.mileage?.toLocaleString()} km</div></div>
                  <div className="detail-item"><div className="detail-label">Assigned Route</div><div className="detail-value">{selected.assignedRoute || 'Unassigned'}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Last Maintenance</div><div className="detail-value">{selected.lastMaintenance}</div></div>
                  <div className="detail-item"><div className="detail-label">Next Maintenance</div><div className="detail-value">{selected.nextMaintenance || 'N/A'}</div></div>
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
              <div className="modal-header"><h2>{editing ? 'Edit Vehicle' : 'New Vehicle'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Vehicle ID</label><input value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} /></div>
                  <div className="form-group"><label>Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Standard Bus</option><option>Articulated Bus</option><option>Electric Bus</option><option>Minibus</option><option>Light Rail</option><option>Coach Bus</option><option>School Bus</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Make</label><input value={form.make} onChange={e => setForm({...form, make: e.target.value})} /></div>
                  <div className="form-group"><label>Model</label><input value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Year</label><input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} /></div>
                  <div className="form-group"><label>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Fuel Type</label><select value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})}><option value="diesel">Diesel</option><option value="CNG">CNG</option><option value="electric">Electric</option><option value="hybrid">Hybrid</option><option value="gasoline">Gasoline</option></select></div>
                  <div className="form-group"><label>Mileage (km)</label><input type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="maintenance">Maintenance</option><option value="retired">Retired</option></select></div>
                  <div className="form-group"><label>Assigned Route</label><input value={form.assignedRoute || ''} onChange={e => setForm({...form, assignedRoute: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Last Maintenance</label><input type="date" value={form.lastMaintenance} onChange={e => setForm({...form, lastMaintenance: e.target.value})} /></div>
                  <div className="form-group"><label>Next Maintenance</label><input type="date" value={form.nextMaintenance || ''} onChange={e => setForm({...form, nextMaintenance: e.target.value})} /></div>
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

export default FleetPage;
