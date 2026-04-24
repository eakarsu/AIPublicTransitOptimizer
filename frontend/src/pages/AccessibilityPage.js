import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import { accessibilityAPI, aiAPI } from '../services/api';

const emptyItem = { stationName: '', wheelchairAccess: false, elevatorAvailable: false, tactilePaving: false, audioAnnouncements: false, brailleSignage: false, lowFloorVehicles: false, complianceScore: '', lastAuditDate: '', status: 'partial', notes: '' };

function AccessibilityPage({ onLogout }) {
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

  const load = useCallback(async () => { const res = await accessibilityAPI.getAll(); setData(res.data); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (editing) await accessibilityAPI.update(form.id, form);
    else await accessibilityAPI.create(form);
    setShowForm(false); setForm(emptyItem); setEditing(false); load();
  };

  const handleDelete = async (id) => { if (window.confirm('Delete this record?')) { await accessibilityAPI.delete(id); setSelected(null); load(); } };
  const handleEdit = (item) => { setForm(item); setEditing(true); setShowForm(true); setSelected(null); };

  const runAI = async () => {
    setAiLoading(true); setAiResult(null);
    try { const res = await aiAPI.checkAccessibility({ additionalContext: aiContext }); setAiResult(res.data); }
    catch (err) { setAiResult({ success: false, error: err.message }); }
    setAiLoading(false);
  };

  const BoolIcon = ({ val }) => <span className={val ? 'bool-yes' : 'bool-no'}>{val ? 'Yes' : 'No'}</span>;

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['stationName', 'status'],
    defaultSort: 'stationName',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const compliant = data.filter(i => i.status === 'compliant').length;
    const avgScore = total > 0 ? (data.reduce((s, i) => s + (Number(i.complianceScore) || 0), 0) / total).toFixed(1) : '0';
    const fullAccess = data.filter(i => i.wheelchairAccess && i.elevatorAvailable && i.tactilePaving && i.audioAnnouncements && i.brailleSignage && i.lowFloorVehicles).length;
    return [
      { label: 'Total Stations', value: total },
      { label: 'Compliant', value: compliant },
      { label: 'Avg Score', value: `${avgScore}%` },
      { label: 'Full Access', value: fullAccess },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'stationName', label: 'Station Name' },
    { key: 'wheelchairAccess', label: 'Wheelchair Access' },
    { key: 'elevatorAvailable', label: 'Elevator Available' },
    { key: 'tactilePaving', label: 'Tactile Paving' },
    { key: 'audioAnnouncements', label: 'Audio Announcements' },
    { key: 'brailleSignage', label: 'Braille Signage' },
    { key: 'lowFloorVehicles', label: 'Low Floor Vehicles' },
    { key: 'complianceScore', label: 'Compliance Score' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="accessibility" />
      <div className="main-content">
        <div className="page-header">
          <h1>Accessibility Compliance</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyItem); setEditing(false); setShowForm(true); }}>+ New Station</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>{aiLoading ? 'Analyzing...' : 'AI Check Compliance'}</button>
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
          filterOptions={['compliant', 'partial', 'non-compliant']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="accessibility"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Station" field="stationName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Wheelchair" field="wheelchairAccess" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Elevator" field="elevatorAvailable" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Tactile" field="tactilePaving" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Audio" field="audioAnnouncements" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Braille" field="brailleSignage" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Low Floor" field="lowFloorVehicles" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Score" field="complianceScore" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No stations found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.stationName}</strong></td>
                    <td><BoolIcon val={item.wheelchairAccess} /></td>
                    <td><BoolIcon val={item.elevatorAvailable} /></td>
                    <td><BoolIcon val={item.tactilePaving} /></td>
                    <td><BoolIcon val={item.audioAnnouncements} /></td>
                    <td><BoolIcon val={item.brailleSignage} /></td>
                    <td><BoolIcon val={item.lowFloorVehicles} /></td>
                    <td>{item.complianceScore}%</td>
                    <td><span className={`status-badge status-${item.status === 'compliant' ? 'compliant' : item.status === 'partial' ? 'partial' : 'non-compliant'}`}>{item.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header"><h2>{selected.stationName}</h2><button className="modal-close" onClick={() => setSelected(null)}>&times;</button></div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Station</div><div className="detail-value">{selected.stationName}</div></div>
                  <div className="detail-item"><div className="detail-label">Compliance Score</div><div className="detail-value">{selected.complianceScore}%</div></div>
                  <div className="detail-item"><div className="detail-label">Wheelchair Access</div><div className="detail-value"><BoolIcon val={selected.wheelchairAccess} /></div></div>
                  <div className="detail-item"><div className="detail-label">Elevator</div><div className="detail-value"><BoolIcon val={selected.elevatorAvailable} /></div></div>
                  <div className="detail-item"><div className="detail-label">Tactile Paving</div><div className="detail-value"><BoolIcon val={selected.tactilePaving} /></div></div>
                  <div className="detail-item"><div className="detail-label">Audio Announcements</div><div className="detail-value"><BoolIcon val={selected.audioAnnouncements} /></div></div>
                  <div className="detail-item"><div className="detail-label">Braille Signage</div><div className="detail-value"><BoolIcon val={selected.brailleSignage} /></div></div>
                  <div className="detail-item"><div className="detail-label">Low Floor Vehicles</div><div className="detail-value"><BoolIcon val={selected.lowFloorVehicles} /></div></div>
                  <div className="detail-item"><div className="detail-label">Last Audit</div><div className="detail-value">{selected.lastAuditDate}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                </div>
                {selected.notes && <div className="detail-item" style={{ marginTop: 16 }}><div className="detail-label">Notes</div><div className="detail-value">{selected.notes}</div></div>}
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
              <div className="modal-header"><h2>{editing ? 'Edit Station' : 'New Station'}</h2><button className="modal-close" onClick={() => setShowForm(false)}>&times;</button></div>
              <div className="modal-body">
                <div className="form-group"><label>Station Name</label><input value={form.stationName} onChange={e => setForm({...form, stationName: e.target.value})} /></div>
                <div className="form-group">
                  <label>Accessibility Features</label>
                  <div className="checkbox-group">
                    <label><input type="checkbox" checked={form.wheelchairAccess} onChange={e => setForm({...form, wheelchairAccess: e.target.checked})} /> Wheelchair Access</label>
                    <label><input type="checkbox" checked={form.elevatorAvailable} onChange={e => setForm({...form, elevatorAvailable: e.target.checked})} /> Elevator</label>
                    <label><input type="checkbox" checked={form.tactilePaving} onChange={e => setForm({...form, tactilePaving: e.target.checked})} /> Tactile Paving</label>
                    <label><input type="checkbox" checked={form.audioAnnouncements} onChange={e => setForm({...form, audioAnnouncements: e.target.checked})} /> Audio Announcements</label>
                    <label><input type="checkbox" checked={form.brailleSignage} onChange={e => setForm({...form, brailleSignage: e.target.checked})} /> Braille Signage</label>
                    <label><input type="checkbox" checked={form.lowFloorVehicles} onChange={e => setForm({...form, lowFloorVehicles: e.target.checked})} /> Low Floor Vehicles</label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Compliance Score (%)</label><input type="number" min="0" max="100" value={form.complianceScore} onChange={e => setForm({...form, complianceScore: e.target.value})} /></div>
                  <div className="form-group"><label>Last Audit Date</label><input type="date" value={form.lastAuditDate} onChange={e => setForm({...form, lastAuditDate: e.target.value})} /></div>
                </div>
                <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="compliant">Compliant</option><option value="partial">Partial</option><option value="non-compliant">Non-Compliant</option></select></div>
                <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="3" style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'inherit' }} /></div>
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

export default AccessibilityPage;
