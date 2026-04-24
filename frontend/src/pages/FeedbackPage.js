import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './Dashboard';
import AIResult from '../components/AIResult';
import DataToolbar, { SortableHeader, SummaryCards, useDataTable } from '../components/DataToolbar';
import { feedbackAPI, aiAPI } from '../services/api';

const emptyFeedback = { ticketNumber: '', category: 'suggestion', subject: '', description: '', routeAffected: '', passengerName: '', passengerEmail: '', rating: '', status: 'open', resolution: '' };

function FeedbackPage({ onLogout }) {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyFeedback);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = useCallback(async () => {
    const res = await feedbackAPI.getAll();
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const {
    searchTerm, setSearchTerm,
    filterValue, setFilterValue,
    sortField, sortDir, handleSort,
    filtered: searchSorted,
  } = useDataTable(data, {
    searchFields: ['ticketNumber', 'category', 'subject', 'routeAffected', 'passengerName'],
    defaultSort: 'ticketNumber',
    defaultDir: 'asc',
  });

  const filtered = useMemo(() => {
    if (!filterValue) return searchSorted;
    return searchSorted.filter(item => item.status === filterValue);
  }, [searchSorted, filterValue]);

  const summaryItems = useMemo(() => {
    const total = filtered.length;
    const open = filtered.filter(i => i.status === 'open').length;
    const resolved = filtered.filter(i => i.status === 'resolved').length;
    const rated = filtered.filter(i => i.rating);
    const avgRating = rated.length > 0 ? (rated.reduce((s, i) => s + Number(i.rating), 0) / rated.length).toFixed(1) : '-';
    return [
      { label: 'Total Tickets', value: total },
      { label: 'Open', value: open },
      { label: 'Avg Rating (/5)', value: avgRating },
      { label: 'Resolved', value: resolved },
    ];
  }, [filtered]);

  const exportColumns = [
    { key: 'ticketNumber', label: 'Ticket #' },
    { key: 'category', label: 'Category' },
    { key: 'subject', label: 'Subject' },
    { key: 'routeAffected', label: 'Route' },
    { key: 'rating', label: 'Rating' },
    { key: 'status', label: 'Status' },
  ];

  const handleSave = async () => {
    if (editing) {
      await feedbackAPI.update(form.id, form);
    } else {
      await feedbackAPI.create(form);
    }
    setShowForm(false);
    setForm(emptyFeedback);
    setEditing(false);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this ticket?')) {
      await feedbackAPI.delete(id);
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
      const res = await aiAPI.analyzeFeedback({ additionalContext: aiContext });
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    }
    setAiLoading(false);
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="feedback" />
      <div className="main-content">
        <div className="page-header">
          <h1>Passenger Feedback</h1>
          <div className="header-actions">
            <button className="btn-add" onClick={() => { setForm(emptyFeedback); setEditing(false); setShowForm(true); }}>+ New Ticket</button>
            <button className="btn-ai" onClick={runAI} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : 'AI Analyze Feedback'}
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
          filterOptions={['open', 'investigating', 'under-review', 'resolved', 'closed']}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          columns={exportColumns}
          data={filtered}
          exportFilename="feedback"
        />

        <div className="data-table-container" style={{ marginTop: 24 }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortableHeader label="Ticket #" field="ticketNumber" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Subject" field="subject" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Route" field="routeAffected" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Rating" field="rating" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No tickets found.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}>
                    <td><strong>{item.ticketNumber}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.subject}</td>
                    <td>{item.routeAffected}</td>
                    <td>{item.rating ? `${item.rating}/5` : '-'}</td>
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
                <h2>{selected.subject}</h2>
                <button className="modal-close" onClick={() => setSelected(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><div className="detail-label">Ticket Number</div><div className="detail-value">{selected.ticketNumber}</div></div>
                  <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{selected.category}</div></div>
                  <div className="detail-item"><div className="detail-label">Route Affected</div><div className="detail-value">{selected.routeAffected}</div></div>
                  <div className="detail-item"><div className="detail-label">Rating</div><div className="detail-value">{selected.rating ? `${'★'.repeat(selected.rating)}${'☆'.repeat(5 - selected.rating)} ${selected.rating}/5` : '-'}</div></div>
                  <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value"><span className={`status-badge status-${selected.status}`}>{selected.status}</span></div></div>
                  <div className="detail-item"><div className="detail-label">Passenger Name</div><div className="detail-value">{selected.passengerName}</div></div>
                  <div className="detail-item"><div className="detail-label">Passenger Email</div><div className="detail-value">{selected.passengerEmail}</div></div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}><div className="detail-label">Description</div><div className="detail-value">{selected.description}</div></div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}><div className="detail-label">Resolution</div><div className="detail-value">{selected.resolution || 'No resolution yet'}</div></div>
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
                <h2>{editing ? 'Edit Ticket' : 'New Ticket'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Ticket Number</label><input value={form.ticketNumber} onChange={e => setForm({...form, ticketNumber: e.target.value})} /></div>
                  <div className="form-group"><label>Subject</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="delay">Delay</option><option value="cleanliness">Cleanliness</option><option value="compliment">Compliment</option>
                      <option value="safety">Safety</option><option value="accessibility">Accessibility</option><option value="suggestion">Suggestion</option>
                      <option value="fare">Fare</option><option value="overcrowding">Overcrowding</option><option value="app">App</option>
                      <option value="driver">Driver</option><option value="shelter">Shelter</option><option value="schedule">Schedule</option>
                      <option value="temperature">Temperature</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="open">Open</option><option value="investigating">Investigating</option><option value="under-review">Under Review</option>
                      <option value="resolved">Resolved</option><option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Route Affected</label><input value={form.routeAffected} onChange={e => setForm({...form, routeAffected: e.target.value})} /></div>
                  <div className="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Passenger Name</label><input value={form.passengerName} onChange={e => setForm({...form, passengerName: e.target.value})} /></div>
                  <div className="form-group"><label>Passenger Email</label><input value={form.passengerEmail} onChange={e => setForm({...form, passengerEmail: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}><label>Resolution</label><textarea value={form.resolution} onChange={e => setForm({...form, resolution: e.target.value})} /></div>
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

export default FeedbackPage;
