const express = require('express');
const { Ridership } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();


router.get('/', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { count, rows } = await Ridership.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await Ridership.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const item = await Ridership.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Ridership.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Ridership.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    await item.destroy();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
