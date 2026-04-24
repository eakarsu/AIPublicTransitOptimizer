import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { energyAPI, aiAPI } from '../services/api';

const emptyMetric = { metricName: '', category: 'fuel', currentValue: '', previousValue: '', unit: '', targetValue: '', period: '', vehicleType: '', co2Saved: '', status: 'on-track', notes: '' };

function EnergyPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyMetric);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await energyAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const {
    searchTerm, setSearchTerm,
    filterValue, setFilterValue,
    sortField, sortDir, handleSort,
    filtered: searchSorted,
  } = useDataTable(data, {
    searchFields: ['metricName', 'category', 'vehicleType', 'unit'],
    defaultSort: 'metricName',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!filterValue) return searchSorted;
    return searchSorted.filter(item => item.status === filterValue);
  }, [searchSorted, filterValue]);

  const summaryItems = useMemo(() => {
    const total = filtered.length;
    const onTrack = filtered.filter(i => i.status === 'on-track').length;
    const behind = filtered.filter(i => i.status === 'behind').length;
    const totalCO2 = filtered.reduce((s, i) => s + (Number(i.co2Saved) || 0), 0);
    return [
      { label: 'Total Metrics', value: total },
      { label: 'On Track', value: onTrack },
      { label: 'Total CO2 Saved', value: totalCO2.toLocaleString() },
      { label: 'Behind Target', value: behind },
    ];
  }, [filtered]);

  const exportColumns = [
    { key: 'metricName', label: 'Metric' },
    { key: 'category', label: 'Category' },
    { key: 'currentValue', label: 'Current' },
    { key: 'previousValue', label: 'Previous' },
    { key: 'targetValue', label: 'Target' },
    { key: 'unit', label: 'Unit' },
    { key: 'co2Saved', label: 'CO2 Saved' },
    { key: 'vehicleType', label: 'Vehicle Type' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await energyAPI.update(form.id, form);
    } else {
      await energyAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyMetric);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this metric?')) {
      await energyAPI.delete(id);
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
      const res = await aiAPI.analyzeEnergy({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="energy" />
      <div className="main-content">
        <div className="page-header">
          <h1>Energy & Sustainability</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyMetric); setEditing(false); setShowForm(true); }}>+ New Metric</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Energy'}
            </button>
          </div>
        </div>

        <div className="ai-context-section">
          <label>Additional Context for AI Analysis</label>
          <textarea value={aiContext} onChange={(e) => setAiContext(e.target.value)} placeholder="Add any specific questions or context for the AI analysis..." />
        </div>

        <AIResult result={aiResult} loading={aiLoading} onClose={() => setAiResult(null)} />

        <SummaryCards items={summaryItems} />

        <DataToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterField="Status"
          filterValue={filterValue}
          onFilterChange={setFilterValue}
          filterOptions={['on-track', 'behind', 'exceeded']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="energy"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Metric" field="metricName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Current" field="currentValue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Previous" field="previousValue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Target" field="targetValue" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Unit" field="unit" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="CO2 Saved" field="co2Saved" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Vehicle Type" field="vehicleType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No metrics found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.metricName}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.currentValue}</td>
                    <td>{item.previousValue}</td>
                    <td>{item.targetValue}</td>
                    <td>{item.unit}</td>
                    <td>{item.co2Saved}</td>
                    <td>{item.vehicleType}</td>
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
                <h2>{selected.metricName}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Metric Name</div><div className="detail-value">{selected.metricName}</div></div>
                  <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category}</div></div>
                  <div className="detail-item"><div className="detail-label">Current Value</div><div className="detail-value">{selected.currentValue}</div></div>
                  <div className="detail-item"><div className="detail-label">Previous Value</div><div className="detail-value">{selected.previousValue}</div></div>
                  <div className="detail-item"><div className="detail-label">Target Value</div><div className="detail-value">{selected.targetValue}</div></div>
                  <div className="detail-item"><div className="detail-label">Unit</div><div className="detail-value">{selected.unit}</div></div>
                  <div className="detail-item"><div className="detail-label">Period</div><div className="detail-value">{selected.period}</div></div>
                  <div className="detail-item"><div className="detail-label">Vehicle Type</div><div className="detail-value">{selected.vehicleType}</div></div>
                  <div className="detail-item"><div className="detail-label">CO2 Saved</div><div className="detail-value">{selected.co2Saved}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
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
                      <option value="fuel">Fuel</option><option value="electricity">Electricity</option><option value="emissions">Emissions</option>
                      <option value="renewable">Renewable</option><option value="efficiency">Efficiency</option><option value="water">Water</option>
                      <option value="waste">Waste</option><option value="infrastructure">Infrastructure</option><option value="facilities">Facilities</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Current Value</label><input type="number" value={form.currentValue} onChange={e => setForm({...form, currentValue: e.target.value})} /></div>
                  <div className="form-group"><label>Previous Value</label><input type="number" value={form.previousValue} onChange={e => setForm({...form, previousValue: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Target Value</label><input type="number" value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})} /></div>
                  <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Period</label><input value={form.period} onChange={e => setForm({...form, period: e.target.value})} /></div>
                  <div className="form-group"><label>Vehicle Type</label><input value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>CO2 Saved</label><input type="number" value={form.co2Saved} onChange={e => setForm({...form, co2Saved: e.target.value})} /></div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="on-track">On Track</option><option value="behind">Behind</option><option value="exceeded">Exceeded</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: '1 1 100%' }}><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
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

export default EnergyPage;
