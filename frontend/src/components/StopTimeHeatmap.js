import React from 'react';

// VIZ: Stop x time-of-day heatmap
function StopTimeHeatmap({ buckets, matrix }) {
  const cols = Array.isArray(buckets) ? buckets : [];
  const rows = Array.isArray(matrix) ? matrix : [];
  if (rows.length === 0 || cols.length === 0) {
    return <div style={{ color: '#94a3b8', padding: 16 }}>No heatmap data available.</div>;
  }
  const flat = rows.flatMap(r => r.values || []);
  const max = Math.max(...flat, 1);
  const color = (v) => {
    const intensity = Math.min(1, v / max);
    const r = Math.round(15 + intensity * 240);
    const g = Math.round(23 + intensity * 50);
    const b = Math.round(42 + (1 - intensity) * 50);
    return `rgb(${r},${g},${b})`;
  };
  return (
    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b', overflowX: 'auto' }}>
      <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: 12 }}>Stop × Time-of-Day Boardings Heatmap</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ color: '#94a3b8', textAlign: 'left', padding: '6px 8px', fontSize: 12 }}>Stop</th>
            {cols.map(b => (
              <th key={b} style={{ color: '#94a3b8', textAlign: 'center', padding: '6px 4px', fontSize: 11 }}>{b}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 25).map((row, i) => (
            <tr key={i}>
              <td style={{ color: '#cbd5e1', padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {row.stopName || row.stopCode || `Stop ${row.stopId}`}
              </td>
              {(row.values || []).map((v, j) => (
                <td key={j} title={`${row.stopName}: ${v}`} style={{
                  background: color(v), color: '#fff', textAlign: 'center', padding: '8px 4px',
                  fontSize: 11, border: '1px solid #0f172a', minWidth: 50,
                }}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StopTimeHeatmap;
