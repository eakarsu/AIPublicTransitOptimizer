import React, { useState, useEffect } from 'react';
import { Sidebar } from './Dashboard';
import { aiAPI, ridershipAPI } from '../services/api';
import AIResult from '../components/AIResult';

// Simple bar chart using plain CSS (recharts-style but without the package)
function BarChart({ data, xKey, yKey, color = '#3b82f6', height = 200 }) {
  if (!data || !data.length) return null;
  const maxVal = Math.max(...data.map(d => Number(d[yKey]) || 0)) || 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, padding: '8px 0' }}>
      {data.slice(0, 20).map((d, i) => {
        const h = Math.max(4, (Number(d[yKey]) / maxVal) * (height - 30));
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>{Number(d[yKey]).toLocaleString()}</div>
            <div
              title={`${d[xKey]}: ${d[yKey]}`}
              style={{ width: '100%', height: h, background: color, borderRadius: '3px 3px 0 0', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = '0.7'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            />
            <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {String(d[xKey]).slice(0, 6)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DemandForecastPage({ onLogout }) {
  const [ridershipData, setRidershipData] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    ridershipAPI.getAll().then(res => {
      const d = res.data;
      setRidershipData(d.data || d || []);
      setDataLoading(false);
    }).catch(() => setDataLoading(false));
  }, []);

  const runForecast = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const res = await aiAPI.forecastDemand({});
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Aggregate by route for chart
  const routeAgg = {};
  (Array.isArray(ridershipData) ? ridershipData : []).forEach(r => {
    if (!routeAgg[r.routeName]) routeAgg[r.routeName] = 0;
    routeAgg[r.routeName] += Number(r.dailyRiders) || 0;
  });
  const chartData = Object.entries(routeAgg).map(([route, total]) => ({ route, total })).sort((a, b) => b.total - a.total);

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="demand-forecast" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Demand Forecast</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>AI-powered ridership demand forecasting and headway recommendations</p>
          </div>
          <div className="header-actions">
            <button className="btn-ai" onClick={runForecast} disabled={loading}>
              {loading ? 'Forecasting...' : 'AI Forecast Demand'}
            </button>
          </div>
        </div>

        {!dataLoading && chartData.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>Total Ridership by Route</div>
            <BarChart data={chartData} xKey="route" yKey="total" color="#3b82f6" height={200} />
          </div>
        )}

        <AIResult result={aiResult} loading={loading} onClose={() => setAiResult(null)} />

        {!dataLoading && (
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>
            {Array.isArray(ridershipData) ? ridershipData.length : 0} ridership records analyzed
          </div>
        )}
      </div>
    </div>
  );
}
