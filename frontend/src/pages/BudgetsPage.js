import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { budgetsAPI, aiAPI } from '../services/api';

const emptyBudget = { name: '', contractType: 'procurement', vendor: '', totalAmount: '', spentAmount: '', startDate: '', endDate: '', department: '', status: 'active', notes: '' };

function BudgetsPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyBudget);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await budgetsAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { searchTerm, setSearchTerm, sortField, sortDir, handleSort, filtered: searchFiltered } = useDataTable(data, {
    searchFields: ['name', 'vendor', 'department', 'contractType'],
    defaultSort: 'name',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!statusFilter) return searchFiltered;
    return searchFiltered.filter(item => item.status === statusFilter);
  }, [searchFiltered, statusFilter]);

  const summaryItems = useMemo(() => {
    const total = data.length;
    const active = data.filter(i => i.status === 'active').length;
    const totalBudget = data.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
    const totalSpent = data.reduce((s, i) => s + (Number(i.spentAmount) || 0), 0);
    return [
      { label: 'Total Contracts', value: total },
      { label: 'Active', value: active },
      { label: 'Total Budget ($)', value: `$${totalBudget.toLocaleString()}` },
      { label: 'Total Spent ($)', value: `$${totalSpent.toLocaleString()}` },
    ];
  }, [data]);

  const exportColumns = [
    { key: 'name', label: 'Name' },
    { key: 'contractType', label: 'Contract Type' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'spentAmount', label: 'Spent Amount' },
    { key: 'department', label: 'Department' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await budgetsAPI.update(form.id, form);
    } else {
      await budgetsAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyBudget);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this contract?')) {
      await budgetsAPI.delete(id);
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
      const res = await aiAPI.analyzeBudget({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="budgets" />
      <div className="main-content">
        <div className="page-header">
          <h1>Budget & Contracts</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyBudget); setEditing(false); setShowForm(true); }}>+ New Contract</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Budget'}
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
          filterOptions={['active', 'completed', 'pending', 'cancelled']}
          data={filtered}
          columns={exportColumns}
          exportFilename="budgets"
        />

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Type" field="contractType" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Vendor" field="vendor" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Total ($)" field="totalAmount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Spent ($)" field="spentAmount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Remaining ($)" field="totalAmount" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Department" field="department" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Start" field="startDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="End" field="endDate" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" className="no-data"><div className="no-data-text">No contracts found</div></td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.contractType}</td>
                    <td>{item.vendor}</td>
                    <td>{Number(item.totalAmount).toLocaleString()}</td>
                    <td>{Number(item.spentAmount).toLocaleString()}</td>
                    <td>{(item.totalAmount - item.spentAmount).toLocaleString()}</td>
                    <td>{item.department}</td>
                    <td>{item.startDate}</td>
                    <td>{item.endDate}</td>
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
                  <div className="detail-item"><div className="detail-label">Contract Type</div><div className="detail-value">{selected.contractType}</div></div>
                  <div className="detail-item"><div className="detail-label">Vendor</div><div className="detail-value">{selected.vendor}</div></div>
                  <div className="detail-item"><div className="detail-label">Total Amount</div><div className="detail-value">${Number(selected.totalAmount).toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Spent Amount</div><div className="detail-value">${Number(selected.spentAmount).toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Remaining</div><div className="detail-value">${(selected.totalAmount - selected.spentAmount).toLocaleString()}</div></div>
                  <div className="detail-item"><div className="detail-label">Department</div><div className="detail-value">{selected.department}</div></div>
                  <div className="detail-item"><div className="detail-label">Start Date</div><div className="detail-value">{selected.startDate}</div></div>
                  <div className="detail-item"><div className="detail-label">End Date</div><div className="detail-value">{selected.endDate}</div></div>
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
                <h2>{editing ? 'Edit Contract' : 'New Contract'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="form-group"><label>Vendor</label><input value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Total Amount</label><input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} /></div>
                  <div className="form-group"><label>Spent Amount</label><input type="number" value={form.spentAmount} onChange={e => setForm({...form, spentAmount: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                  <div className="form-group"><label>End Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Department</label><input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                  <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contract Type</label>
                    <select value={form.contractType} onChange={e => setForm({...form, contractType: e.target.value})}>
                      <option value="procurement">Procurement</option><option value="technology">Technology</option><option value="construction">Construction</option>
                      <option value="service">Service</option><option value="supply">Supply</option><option value="insurance">Insurance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="active">Active</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
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

export default BudgetsPage;
