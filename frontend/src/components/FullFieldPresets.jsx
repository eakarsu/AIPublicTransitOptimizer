import React from 'react';

/** Label a raw key into a human-readable label. */
export const prettyField = (key) => String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());

/**
 * Fill every field in `values` — required and optional — with a domain example.
 * `choices[key]` holds the three per-preset options for that field.
 */
export function fillEveryField(values, variant = 0, choices = {}) {
  const index = variant % 3;
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (['id', 'created_at', 'updated_at', 'user_id'].includes(key)) return [key, value];
    if (choices[key]) return [key, choices[key][index]];
    if (Array.isArray(value)) return [key, []];
    if (value && typeof value === 'object') return [key, value];
    if (typeof value === 'boolean') return [key, true];
    if (typeof value === 'number') return [key, [1, 2, 3][index]];
    if (/date|deadline|valid_until/.test(key)) return [key, new Date(Date.now() + (index + 7) * 86400000).toISOString().slice(0, 10)];
    if (/email/.test(key)) return [key, `example${index + 1}@example.com`];
    return [key, `${prettyField(key)} example ${index + 1}: illustrative input to review before predicting.`];
  }));
}

export default function FullFieldPresets({ value, onChange, choices = {}, presets, disabled = false }) {
  const labels = presets ? presets.map((preset) => preset.label) : ['Weekday peak', 'Weekend service', 'Special event'];
  return (
    <div className="ai-preset-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
      <strong style={{ fontSize: 12, color: '#94a3b8' }}>Fill every field</strong>
      <span style={{ fontSize: 12, color: '#64748b' }}>Each example fills required and optional inputs.</span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            className="btn btn-secondary"
            disabled={disabled}
            onClick={() => onChange(presets ? { ...value, ...presets[index].values } : fillEveryField(value, index, choices))}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
