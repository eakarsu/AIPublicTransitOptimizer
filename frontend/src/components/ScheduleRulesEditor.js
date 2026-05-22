import React, { useState } from 'react';

// NON-VIZ: CRUD editor for schedule/route rules (headway / frequency)
function ScheduleRulesEditor({ rules, onCreate, onUpdate, onDelete }) {
  const empty = { routeName: '', dayType: 'weekday', timeWindow: 'peak', headwayMinutes: 15, frequencyPerHour: 4, notes: '', active: true };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    if (k === 'headwayMinutes' && v) {
      const h = Math.max(1, Number(v));
      next.frequencyPerHour = Math.max(1, Math.round(60 / h));
    } else if (k === 'frequencyPerHour' && v) {
      const f = Math.max(1, Number(v));
      next.headwayMinutes = Math.max(1, Math.round(60 / f));
    }
    setForm(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.routeName) { setError('Route name required'); return; }
    setBusy(true); setError('');
    try {
      if (editId) await onUpdate(editId, form);
      else await onCreate(form);
      setForm(empty); setEditId(null);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    } finally { setBusy(false); }
  };

  const startEdit = (r) => {
    setEditId(r.id);
    setForm({
      routeName: r.routeName || '',
      dayType: r.dayType || 'weekday',
      timeWindow: r.timeWindow || 'peak',
      headwayMinutes: r.headwayMinutes || 15,
      frequencyPerHour: r.frequencyPerHour || 4,
      notes: r.notes || '',
      active: r.active !== false,
    });
  };

  const cancel = () => { setForm(empty); setEditId(null); setError(''); };

  const inputStyle = { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '6px 8px', borderRadius: 4, fontSize: 13 };
  const btn = (bg) => ({ background: bg, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 });

  return (
    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
      <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>Schedule / Route Rules (Headways & Frequency)</h3>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 16 }}>
        <input style={inputStyle} placeholder="Route name" value={form.routeName} onChange={e => set('routeName', e.target.value)} />
        <select style={inputStyle} value={form.dayType} onChange={e => set('dayType', e.target.value)}>
          <option value="weekday">weekday</option>
          <option value="saturday">saturday</option>
          <option value="sunday">sunday</option>
          <option value="holiday">holiday</option>
        </select>
        <select style={inputStyle} value={form.timeWindow} onChange={e => set('timeWindow', e.target.value)}>
          <option value="peak">peak</option>
          <option value="off-peak">off-peak</option>
          <option value="late-night">late-night</option>
        </select>
        <input style={inputStyle} type="number" min="1" placeholder="Headway (min)" value={form.headwayMinutes} onChange={e => set('headwayMinutes', e.target.value)} />
        <input style={inputStyle} type="number" min="1" placeholder="Freq/hour" value={form.frequencyPerHour} onChange={e => set('frequencyPerHour', e.target.value)} />
        <input style={inputStyle} placeholder="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
        <button type="submit" disabled={busy} style={btn('#10b981')}>{editId ? 'Save' : 'Add Rule'}</button>
        {editId && <button type="button" onClick={cancel} style={btn('#64748b')}>Cancel</button>}
      </form>
      {error && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Route</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Day</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Window</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Headway</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Freq/hr</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Notes</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(rules || []).length === 0 && (
            <tr><td colSpan={7} style={{ color: '#64748b', textAlign: 'center', padding: 16 }}>No schedule rules yet — add the first one above.</td></tr>
          )}
          {(rules || []).map(r => (
            <tr key={r.id} style={{ color: '#cbd5e1', borderBottom: '1px solid #0f172a' }}>
              <td style={{ padding: 6 }}>{r.routeName}</td>
              <td style={{ padding: 6 }}>{r.dayType}</td>
              <td style={{ padding: 6 }}>{r.timeWindow}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>{r.headwayMinutes} min</td>
              <td style={{ padding: 6, textAlign: 'right' }}>{r.frequencyPerHour}</td>
              <td style={{ padding: 6, color: '#94a3b8' }}>{r.notes || ''}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>
                <button onClick={() => startEdit(r)} style={{ ...btn('#3b82f6'), marginRight: 6 }}>Edit</button>
                <button onClick={() => onDelete(r.id)} style={btn('#ef4444')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleRulesEditor;
