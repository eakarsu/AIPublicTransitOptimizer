const express = require('express');
const { Fleet } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const data = await Fleet.findAll({ order: [['createdAt', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await Fleet.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const item = await Fleet.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Fleet.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Vehicle not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Fleet.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Vehicle not found' });
    await item.destroy();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
