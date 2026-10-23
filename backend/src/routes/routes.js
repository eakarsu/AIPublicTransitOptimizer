const express = require('express');
const { Op } = require('sequelize');
const { Route } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
function buildWhere(q) { const w = {}; if (q.status) w.status = q.status; if (q.type) w.type = q.type; if (q.search) w[Op.or] = ['name','routeNumber','startPoint','endPoint'].map(f => ({ [f]: { [Op.iLike]: `%${q.search}%` } })); return w; }
router.get('/export', authenticate, async (req, res) => {
  try {
    const rows = await Route.findAll({ where: buildWhere(req.query), order: [['createdAt', 'DESC']] });
    const fmt = String(req.query.format || 'json').toLowerCase();
    if (fmt === 'csv') { const h = ['id','name','routeNumber','startPoint','endPoint','status','type']; const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }; res.setHeader('Content-Type','text/csv'); res.setHeader('Content-Disposition','attachment; filename="routes.csv"'); return res.send([h.join(','), ...rows.map(r => h.map(k => esc(r[k])).join(','))].join('\n')); }
    if (fmt !== 'json') return res.status(400).json({ error: 'format must be json or csv' });
    res.setHeader('Content-Disposition','attachment; filename="routes.json"'); return res.json({ data: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const { count, rows } = await Route.findAndCountAll({ where: buildWhere(req.query), order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    await route.update(req.body);
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findByPk(req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    await route.destroy();
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
