import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './Dashboard';
import api from '../services/api';
import RouteRidershipChart from '../components/RouteRidershipChart';
import StopTimeHeatmap from '../components/StopTimeHeatmap';
import RouteSchedulePdfPanel from '../components/RouteSchedulePdfPanel';
import ScheduleRulesEditor from '../components/ScheduleRulesEditor';

function CustomViewsPage({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [chart, setChart] = useState([]);
  const [heatmap, setHeatmap] = useState({ buckets: [], matrix: [] });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [r1, r2, r3] = await Promise.all([
        api.get('/custom-views/route-ridership'),
        api.get('/custom-views/stop-time-heatmap'),
        api.get('/custom-views/schedule-rules'),
      ]);
      setChart(r1.data?.chart || []);
      setHeatmap({ buckets: r2.data?.buckets || [], matrix: r2.data?.matrix || [] });
      setRules(r3.data?.rules || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const downloadPdf = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/custom-views/route-schedule-pdf', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      // fallback to absolute URL if proxy not set
      const res2 = await fetch((process.env.REACT_APP_API_BASE || 'http://localhost:3601/api') + '/custom-views/route-schedule-pdf', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const blob = await res2.blob();
      triggerDownload(blob);
      return;
    }
    const blob = await res.blob();
    triggerDownload(blob);
  };

  const triggerDownload = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'route-schedule.pdf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const createRule = async (body) => {
    await api.post('/custom-views/schedule-rules', body);
    await loadAll();
  };
  const updateRule = async (id, body) => {
    await api.put(`/custom-views/schedule-rules/${id}`, body);
    await loadAll();
  };
  const deleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    await api.delete(`/custom-views/schedule-rules/${id}`);
    await loadAll();
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="custom-views" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Transit Views</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>Ridership analytics, heatmaps, schedule PDF, and headway rules.</p>
          </div>
          <button onClick={loadAll} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Refresh
          </button>
        </div>

        {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: 10, borderRadius: 6, marginBottom: 16 }}>Error: {error}</div>}
        {loading && <div style={{ color: '#94a3b8', padding: 16 }}>Loading custom views…</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <RouteRidershipChart data={chart} />
          <StopTimeHeatmap buckets={heatmap.buckets} matrix={heatmap.matrix} />
          <RouteSchedulePdfPanel onDownload={downloadPdf} />
          <ScheduleRulesEditor rules={rules} onCreate={createRule} onUpdate={updateRule} onDelete={deleteRule} />
        </div>
      </div>
    </div>
  );
}

export default CustomViewsPage;
