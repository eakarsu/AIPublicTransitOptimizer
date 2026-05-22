import React, { useState } from 'react';

// NON-VIZ: Download route schedule PDF
function RouteSchedulePdfPanel({ onDownload }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const handle = async () => {
    setBusy(true); setMessage('');
    try {
      await onDownload();
      setMessage('PDF generated and downloaded.');
    } catch (e) {
      setMessage('Download failed: ' + (e.message || 'unknown error'));
    } finally { setBusy(false); }
  };
  return (
    <div style={{ background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #1e293b' }}>
      <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>Route Schedule PDF</h3>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Generate a downloadable PDF containing the active routes and their schedule windows
        (first/last departures, peak and off-peak frequencies, total trips).
      </p>
      <button
        onClick={handle}
        disabled={busy}
        style={{
          background: '#3b82f6', color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 6, cursor: busy ? 'wait' : 'pointer',
          fontSize: 13, fontWeight: 600,
        }}
      >
        {busy ? 'Generating…' : 'Download Schedule PDF'}
      </button>
      {message && <div style={{ marginTop: 10, color: message.startsWith('PDF') ? '#10b981' : '#ef4444', fontSize: 12 }}>{message}</div>}
    </div>
  );
}

export default RouteSchedulePdfPanel;
