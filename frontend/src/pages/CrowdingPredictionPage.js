import React, { useState } from 'react';
import { Sidebar } from './Dashboard';
import { aiAPI } from '../services/api';
import AIResult from '../components/AIResult';

export default function CrowdingPredictionPage({ onLogout }) {
  const [windowHours, setWindowHours] = useState(24);
  const [stopId, setStopId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleRun = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAiResult(null);
    try {
      const payload = { window_hours: Number(windowHours) || 24 };
      if (stopId) payload.stop_id = stopId;
      const res = await aiAPI.crowdingPrediction(payload);
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const parsed = aiResult?.parsed || aiResult;
  const hotspots = parsed?.hotspots || parsed?.crowding_hotspots || [];
  const peaks = parsed?.peak_periods || [];
  const operatorActions = parsed?.operator_actions || [];
  const messaging = parsed?.rider_messaging || parsed?.messaging || [];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="crowding-prediction" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Crowding Prediction</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>
              AI-predicted crowding hotspots, peak periods, operator actions, rider messaging
            </p>
          </div>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <form
            onSubmit={handleRun}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}
          >
            <div style={{ flex: '1 1 240px' }}>
              <label
                style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}
              >
                Stop ID (optional)
              </label>
              <input
                value={stopId}
                onChange={(e) => setStopId(e.target.value)}
                placeholder="Leave blank for system-wide"
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#e2e8f0',
                }}
              />
            </div>
            <div style={{ width: 160 }}>
              <label
                style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}
              >
                Window (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={windowHours}
                onChange={(e) => setWindowHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#e2e8f0',
                }}
              />
            </div>
            <button type="submit" className="btn-ai" disabled={loading}>
              {loading ? 'Predicting...' : 'AI Predict Crowding'}
            </button>
          </form>
        </div>

        {hotspots.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>
              Hotspots ({hotspots.length})
            </div>
            <table style={{ width: '100%', fontSize: 13, color: '#cbd5e1' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: 6 }}>Stop / Time</th>
                  <th style={{ padding: 6 }}>Predicted Load</th>
                  <th style={{ padding: 6 }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: 6 }}>
                      {h.stop || h.stop_id || '-'} {h.time && `@ ${h.time}`}
                    </td>
                    <td style={{ padding: 6 }}>{h.load_pct ?? h.load ?? '-'}</td>
                    <td style={{ padding: 6 }}>{h.severity || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {peaks.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>Peak Periods</div>
            <ul style={{ color: '#cbd5e1', paddingLeft: 18 }}>
              {peaks.map((p, i) => (
                <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>
              ))}
            </ul>
          </div>
        )}

        {operatorActions.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>Operator Actions</div>
            <ul style={{ color: '#cbd5e1', paddingLeft: 18 }}>
              {operatorActions.map((a, i) => (
                <li key={i}>{typeof a === 'string' ? a : JSON.stringify(a)}</li>
              ))}
            </ul>
          </div>
        )}

        {messaging.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>Rider Messaging</div>
            <ul style={{ color: '#cbd5e1', paddingLeft: 18 }}>
              {messaging.map((m, i) => (
                <li key={i}>{typeof m === 'string' ? m : JSON.stringify(m)}</li>
              ))}
            </ul>
          </div>
        )}

        <AIResult result={aiResult} loading={loading} onClose={() => setAiResult(null)} />
      </div>
    </div>
  );
}
