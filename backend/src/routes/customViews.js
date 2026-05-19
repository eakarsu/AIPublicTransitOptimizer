// Custom Views: Public Transit Optimization
// Provides 4 endpoints:
//   GET  /api/custom-views/route-ridership        (VIZ) ridership by route
//   GET  /api/custom-views/stop-time-heatmap      (VIZ) stop x time-of-day heatmap
//   GET  /api/custom-views/route-schedule-pdf     (NON-VIZ) PDF of route schedule
//   GET/POST/PUT/DELETE /api/custom-views/schedule-rules  (NON-VIZ) CRUD headway/frequency rules

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sequelize, Route, Ridership, Schedule, Stop } = require('../models');
const { DataTypes } = require('sequelize');

// ----- Schedule Rules Model (headways/frequencies) -----
const ScheduleRule = sequelize.define('ScheduleRule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  routeName: { type: DataTypes.STRING, allowNull: false },
  dayType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'weekday' },
  timeWindow: { type: DataTypes.STRING, allowNull: false, defaultValue: 'peak' },
  headwayMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
  frequencyPerHour: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
  notes: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'schedule_rules' });

// Lazy-sync the model to avoid blocking server startup
let _synced = false;
async function ensureSynced() {
  if (_synced) return;
  try { await ScheduleRule.sync(); _synced = true; } catch (e) { console.error('ScheduleRule sync:', e.message); }
}

// ===== VIZ 1: Route ridership chart =====
router.get('/route-ridership', authenticate, async (req, res) => {
  try {
    const rows = await Ridership.findAll({ limit: 500, order: [['date', 'DESC']] });
    const byRoute = {};
    for (const r of rows) {
      const key = r.routeName || 'unknown';
      if (!byRoute[key]) byRoute[key] = { routeName: key, totalRiders: 0, samples: 0, peakRiders: 0, offPeakRiders: 0 };
      byRoute[key].totalRiders += Number(r.dailyRiders) || 0;
      byRoute[key].peakRiders += Number(r.peakHourRiders) || 0;
      byRoute[key].offPeakRiders += Number(r.offPeakRiders) || 0;
      byRoute[key].samples += 1;
    }
    const chart = Object.values(byRoute)
      .map(r => ({ ...r, avgDaily: r.samples ? Math.round(r.totalRiders / r.samples) : 0 }))
      .sort((a, b) => b.totalRiders - a.totalRiders);
    res.json({ ok: true, count: chart.length, chart });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== VIZ 2: Stop x time-of-day heatmap =====
router.get('/stop-time-heatmap', authenticate, async (req, res) => {
  try {
    const stops = await Stop.findAll({ limit: 30, order: [['dailyBoardings', 'DESC']] });
    const buckets = ['05-07', '07-09', '09-12', '12-15', '15-18', '18-21', '21-24'];
    // Distribute dailyBoardings across buckets with deterministic, route-typical weights
    const weights = [0.06, 0.22, 0.12, 0.10, 0.24, 0.16, 0.10];
    const matrix = stops.map(s => {
      const total = Number(s.dailyBoardings) || 0;
      const row = buckets.map((b, i) => Math.round(total * weights[i]));
      return { stopId: s.id, stopName: s.name, stopCode: s.stopCode, dailyBoardings: total, values: row };
    });
    res.json({ ok: true, buckets, count: matrix.length, matrix });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== NON-VIZ 1: Route schedule PDF =====
function buildPdf(title, lines) {
  // Minimal valid PDF (v1.4) with a single page containing wrapped lines of text.
  const fontName = 'F1';
  const safeLines = lines.map(l => String(l).replace(/[()\\]/g, c => '\\' + c).slice(0, 110));
  let y = 760;
  const textOps = [`BT /${fontName} 16 Tf 50 ${y} Td (${title.replace(/[()\\]/g, c => '\\' + c)}) Tj ET`];
  y -= 28;
  for (const line of safeLines) {
    textOps.push(`BT /${fontName} 11 Tf 50 ${y} Td (${line}) Tj ET`);
    y -= 16;
    if (y < 50) break;
  }
  const stream = textOps.join('\n');
  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>');
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
}

router.get('/route-schedule-pdf', authenticate, async (req, res) => {
  try {
    const routes = await Route.findAll({ limit: 25 });
    const schedules = await Schedule.findAll({ limit: 50 });
    const lines = [];
    lines.push('Generated: ' + new Date().toISOString());
    lines.push('');
    lines.push('--- Routes ---');
    for (const r of routes) {
      lines.push(`${r.routeNumber || ''} ${r.name || ''} | ${r.startPoint || '?'} -> ${r.endPoint || '?'} | ${r.type || 'bus'} | ${r.status || ''}`);
    }
    lines.push('');
    lines.push('--- Schedules ---');
    for (const s of schedules) {
      lines.push(`${s.routeName || ''} (${s.dayType || ''}): ${s.firstDeparture || ''} - ${s.lastDeparture || ''} | peak ${s.peakFrequency || '?'}min | off-peak ${s.offPeakFrequency || '?'}min | trips ${s.totalTrips || ''}`);
    }
    const pdf = buildPdf('Public Transit Route Schedule', lines);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="route-schedule.pdf"');
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ===== NON-VIZ 2: Schedule/Route Rules CRUD =====
router.get('/schedule-rules', authenticate, async (req, res) => {
  try {
    await ensureSynced();
    const rules = await ScheduleRule.findAll({ order: [['routeName', 'ASC'], ['dayType', 'ASC'], ['timeWindow', 'ASC']] });
    res.json({ ok: true, count: rules.length, rules });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post('/schedule-rules', authenticate, async (req, res) => {
  try {
    await ensureSynced();
    const body = req.body || {};
    if (!body.routeName) return res.status(400).json({ ok: false, error: 'routeName required' });
    if (body.headwayMinutes && !body.frequencyPerHour) {
      body.frequencyPerHour = Math.max(1, Math.round(60 / Number(body.headwayMinutes)));
    } else if (body.frequencyPerHour && !body.headwayMinutes) {
      body.headwayMinutes = Math.max(1, Math.round(60 / Number(body.frequencyPerHour)));
    }
    const rule = await ScheduleRule.create(body);
    res.status(201).json({ ok: true, rule });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.put('/schedule-rules/:id', authenticate, async (req, res) => {
  try {
    await ensureSynced();
    const rule = await ScheduleRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ ok: false, error: 'Rule not found' });
    const body = req.body || {};
    if (body.headwayMinutes && !body.frequencyPerHour) {
      body.frequencyPerHour = Math.max(1, Math.round(60 / Number(body.headwayMinutes)));
    } else if (body.frequencyPerHour && !body.headwayMinutes) {
      body.headwayMinutes = Math.max(1, Math.round(60 / Number(body.frequencyPerHour)));
    }
    await rule.update(body);
    res.json({ ok: true, rule });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

router.delete('/schedule-rules/:id', authenticate, async (req, res) => {
  try {
    await ensureSynced();
    const rule = await ScheduleRule.findByPk(req.params.id);
    if (!rule) return res.status(404).json({ ok: false, error: 'Rule not found' });
    await rule.destroy();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
