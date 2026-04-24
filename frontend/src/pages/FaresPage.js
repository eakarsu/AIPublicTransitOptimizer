import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { faresAPI, aiAPI } from '../services/api';

const emptyItem = { name: '', fareType: 'single', basePrice: '', discountedPrice: '', zone: '', passengerType: 'adult', validityPeriod: '', revenue: '', status: 'active' };

function FaresPage({ onLogout }) {
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

  const load = useCallback(async () => { const res = await faresAPI.getAll(); setData(res.data); }, []);
  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['name', 'fareType', 'zone', 'passengerType'], defaultSort: 'name',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const active = data.filter(d => d.status === 'active').length;
    const totalRev = data.reduce((s, d) => s + (Number(d.revenue) || 0), 0);
    const avgPrice = data.length ? (data.reduce((s, d) => s + (Number(d.basePrice) || 0), 0) / data.length).toFixed(2) : '0.00';
    return [
      { label: 'Total Fares', value: data.length },
      { label: 'Active', value: active },
      { label: 'Total Revenue', value: `$${totalRev.toLocaleString()}` },
      { label: 'Avg Base Price', value: `$${avgPrice}` },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'name', label: 'Name' }, { key: 'fareType', label: 'Type' },
    { key: 'basePrice', label: 'Base Price' }, { key: 'discountedPrice', label: 'Discounted' },
    { key: 'zone', label: 'Zone' }, { key: 'passengerType', label: 'Passenger' },
    { key: 'validityPeriod', label: 'Validity' }, { key: 'revenue', label: 'Revenue' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) await faresAPI.update(form.id, form);
    else await faresAPI.create(form);
    setShowForm(false); setForm(emptyItem); setEditing(false); load();
  };
  const handleDelete = async (id) => { if (window.confirm('Delete this fare?')) { await faresAPI.delete(id); setSelected(null); load(); } };
  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };
  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.modelFares({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="fares" />
      <div className="main-content">
        <div className="page-header">
          <h1>Fare Modeling</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyItem); setEditing(false); setShowForm(true); }}>+ New Fare</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Model Fares'}</button>
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
          data={filtered} columns={exportColumns} exportFilename="fares"
        />
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="fareType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Base Price" field="basePrice" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Discounted" field="discountedPrice" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Zone" field="zone" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Passenger" field="passengerType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Validity" field="validityPeriod" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Revenue" field="revenue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-text">No fares found</div></td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.fareType}</td>
                  <td>${item.basePrice?.toFixed(2)}</td>
                  <td>{item.discountedPrice ? `$${item.discountedPrice.toFixed(2)}` : '-'}</td>
                  <td>{item.zone}</td>
                  <td>{item.passengerType}</td>
                  <td>{item.validityPeriod}</td>
                  <td>${item.revenue?.toLocaleString()}</td>
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
                  <div className="detail-item"><div className="detail-label">Name</div><div className="detail-value">{selected.name}</div></div>
                  <div className="detail-item"><div className="detail-label">Fare Type</div><div className="detail-value">{selected.fareType}</div></div>
                  <div className="detail-item"><div className="detail-label">Base Price</div><div className="detail-value">${selected.basePrice?.toFixed(2)}</div></div>
                  <div className="detail-item"><div className="detail-label">Discounted Price</div><div className="detail-value">{selected.discountedPrice ? `$${selected.discountedPrice.toFixed(2)}` : 'N/A'}</div></div>
                  <div className="detail-item"><div className="detail-label">Zone</div><div className="detail-value">{selected.zone}</div></div>
                  <div className="detail-item"><div className="detail-label">Passenger Type</div><div className="detail-value">{selected.passengerType}</div></div>
                  <div className="detail-item"><div className="detail-label">Validity</div><div className="detail-value">{selected.validityPeriod}</div></div>
                  <div className="detail-item"><div className="detail-label">Revenue</div><div className="detail-value">${selected.revenue?.toLocaleString()}</div></div>
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
              <div className="modal-header"><h2>{editing ? 'Edit Fare' : 'New Fare'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Fare Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="form-group"><label>Fare Type</label><select value={form.fareType} onChange={e => setForm({...form, fareType: e.target.value})}><option value="single">Single</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annual">Annual</option><option value="multi-day">Multi-Day</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Base Price ($)</label><input type="number" step="0.01" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} /></div>
                  <div className="form-group"><label>Discounted Price ($)</label><input type="number" step="0.01" value={form.discountedPrice || ''} onChange={e => setForm({...form, discountedPrice: e.target.value || null})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} /></div>
                  <div className="form-group"><label>Passenger Type</label><select value={form.passengerType} onChange={e => setForm({...form, passengerType: e.target.value})}><option value="adult">Adult</option><option value="student">Student</option><option value="senior">Senior</option><option value="child">Child</option><option value="disabled">Disabled</option><option value="family">Family</option><option value="corporate">Corporate</option><option value="tourist">Tourist</option></select></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Validity Period</label><input value={form.validityPeriod} onChange={e => setForm({...form, validityPeriod: e.target.value})} /></div>
                  <div className="form-group"><label>Revenue ($)</label><input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} /></div>
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

export default FaresPage;
