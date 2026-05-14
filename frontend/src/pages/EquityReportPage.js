import React, { useState } from 'react';
import { Sidebar } from './Dashboard';
import { aiAPI } from '../services/api';
import AIResult from '../components/AIResult';

export default function EquityReportPage({ onLogout }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const runReport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await aiAPI.equityReport();
      setResult(res.data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="equity-report" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>Transit Equity Report</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>AI analysis of service equity across transit zones and underserved areas</p>
          </div>
          <div className="header-actions">
            <button className="btn-ai" onClick={runReport} disabled={loading}>
              {loading ? 'Generating Report...' : 'Generate Equity Report'}
            </button>
          </div>
        </div>

        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚖️</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>Transit Equity Analysis</h3>
            <p style={{ maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
              This report analyzes service distribution across all transit zones, identifies underserved areas, and provides equity-based investment recommendations.
            </p>
            <button className="btn-ai" style={{ marginTop: 24 }} onClick={runReport}>
              Generate Report
            </button>
          </div>
        )}

        <AIResult result={result} loading={loading} onClose={() => setResult(null)} />
      </div>
    </div>
  );
}
