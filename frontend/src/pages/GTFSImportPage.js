import React, { useState } from 'react';
import { Sidebar } from './Dashboard';
import { gtfsAPI } from '../services/api';

export default function GTFSImportPage({ onLogout }) {
  const [stopsFile, setStopsFile] = useState(null);
  const [routesFile, setRoutesFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleImport = async (e) => {
    e.preventDefault();
    if (!stopsFile && !routesFile) { setError('Please select at least one file to import'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    if (stopsFile) formData.append('stops', stopsFile);
    if (routesFile) formData.append('routes', routesFile);

    try {
      const res = await gtfsAPI.importGTFS(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar onLogout={onLogout} user={user} active="gtfs-import" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>GTFS Import</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>Import stops and routes from GTFS (General Transit Feed Specification) CSV files</p>
          </div>
        </div>

        <div style={{ maxWidth: 600 }}>
          <div style={{ background: '#1e293b', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: 'white' }}>GTFS File Format</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#0f172a', borderRadius: 6, padding: 12 }}>
                <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: 6, fontSize: 13 }}>stops.txt columns</div>
                {['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'zone_id', 'location_type'].map(c => (
                  <div key={c} style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{c}</div>
                ))}
              </div>
              <div style={{ background: '#0f172a', borderRadius: 6, padding: 12 }}>
                <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 6, fontSize: 13 }}>routes.txt columns</div>
                {['route_id', 'route_short_name', 'route_long_name', 'route_type'].map(c => (
                  <div key={c} style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{c}</div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleImport} style={{ background: '#1e293b', borderRadius: 8, padding: 24 }}>
            <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 20, color: 'white' }}>Upload GTFS Files</h3>

            {[
              { label: 'stops.txt', key: 'stops', setter: setStopsFile, file: stopsFile },
              { label: 'routes.txt', key: 'routes', setter: setRoutesFile, file: routesFile },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>{f.label}</label>
                <div style={{ border: '2px dashed #334155', borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer', position: 'relative' }}
                  onClick={() => document.getElementById(f.key).click()}>
                  <input id={f.key} type="file" accept=".txt,.csv" onChange={e => f.setter(e.target.files[0])} style={{ display: 'none' }} />
                  {f.file ? (
                    <div style={{ color: '#10b981' }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
                      <div style={{ fontSize: 13 }}>{f.file.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{(f.file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div style={{ color: '#64748b' }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
                      <div style={{ fontSize: 13 }}>Click to select {f.label}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 6, padding: 12, marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || (!stopsFile && !routesFile)}
              style={{ width: '100%', padding: '12px', background: loading ? '#374151' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15 }}>
              {loading ? 'Importing...' : 'Import GTFS Data'}
            </button>
          </form>

          {result && (
            <div style={{ background: '#1e293b', borderRadius: 8, padding: 24, marginTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'white', marginBottom: 16 }}>{result.message}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{result.stopsImported}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Stops Imported</div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 6, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{result.routesImported}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Routes Imported</div>
                </div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div>
                  <div style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Warnings ({result.errors.length})</div>
                  {result.errors.slice(0, 10).map((e, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{e}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
