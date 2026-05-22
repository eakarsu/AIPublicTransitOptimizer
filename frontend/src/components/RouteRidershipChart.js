import React from 'react';

// VIZ: Horizontal bar chart of total ridership by route
function RouteRidershipChart({ data }) {
  const rows = Array.isArray(data) ? data : [];
  if (rows.length === 0) {
    return <div style={{ color: '#94a3b8', padding: 16 }}>No ridership data available.</div>;
  }
  const max = Math.max(...rows.map(r => Number(r.totalRiders) || 0), 1);
  return (
    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
      <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: 12 }}>Route Ridership (Total Riders)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.slice(0, 25).map((r, i) => {
          const pct = ((Number(r.totalRiders) || 0) / max) * 100;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px', gap: 10, alignItems: 'center' }}>
              <div style={{ color: '#cbd5e1', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.routeName}</div>
              <div style={{ background: '#1e293b', height: 18, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#06b6d4)', height: '100%' }} />
              </div>
              <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'right' }}>
                {Number(r.totalRiders).toLocaleString()} (avg {Number(r.avgDaily).toLocaleString()})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RouteRidershipChart;
