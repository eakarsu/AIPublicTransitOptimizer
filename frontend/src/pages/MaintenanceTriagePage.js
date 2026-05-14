import React, { useState } from 'react';
import { Sidebar } from './Dashboard';
import { aiAPI } from '../services/api';
import AIResult from '../components/AIResult';

export default function MaintenanceTriagePage({ onLogout }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleRun = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const res = await aiAPI.maintenanceTriage({});
      setAiResult(res.data);
    } catch (err) {
      setAiResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const parsed = aiResult?.parsed || aiResult;
  const ranked = parsed?.ranked || parsed?.work_orders || [];
  const deferrable = parsed?.deferrable || [];
  const fleetAtRisk = parsed?.fleet_at_risk || parsed?.at_risk_units || [];

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="maintenance-triage" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Maintenance Triage</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>
              AI ranks work orders, flags deferrable items, and surfaces fleet-at-risk
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-ai" onClick={handleRun} disabled={loading}>
              {loading ? 'Triaging...' : 'AI Triage Maintenance'}
            </button>
          </div>
        </div>

        {ranked.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: 'white' }}>
              Ranked Work Orders ({ranked.length})
            </div>
            <table style={{ width: '100%', fontSize: 13, color: '#cbd5e1' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: 6 }}>#</th>
                  <th style={{ padding: 6 }}>Work Order</th>
                  <th style={{ padding: 6 }}>Vehicle</th>
                  <th style={{ padding: 6 }}>Priority</th>
                  <th style={{ padding: 6 }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: 6 }}>{i + 1}</td>
                    <td style={{ padding: 6 }}>{r.id || r.work_order_id || '-'}</td>
                    <td style={{ padding: 6 }}>{r.vehicle || r.fleet_id || '-'}</td>
                    <td style={{ padding: 6 }}>{r.priority || r.suggested_priority || '-'}</td>
                    <td style={{ padding: 6, color: '#94a3b8' }}>{r.rationale || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deferrable.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#fbbf24' }}>Deferrable</div>
            <ul style={{ color: '#cbd5e1', paddingLeft: 18 }}>
              {deferrable.map((d, i) => (
                <li key={i}>{typeof d === 'string' ? d : JSON.stringify(d)}</li>
              ))}
            </ul>
          </div>
        )}

        {fleetAtRisk.length > 0 && (
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, color: '#f87171' }}>
              Fleet At Risk
            </div>
            <ul style={{ color: '#fca5a5', paddingLeft: 18 }}>
              {fleetAtRisk.map((f, i) => (
                <li key={i}>{typeof f === 'string' ? f : JSON.stringify(f)}</li>
              ))}
            </ul>
          </div>
        )}

        <AIResult result={aiResult} loading={loading} onClose={() => setAiResult(null)} />
      </div>
    </div>
  );
}
