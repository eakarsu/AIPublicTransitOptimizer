const express = require('express');
const { Accessibility } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const data = await Accessibility.findAll({ order: [['createdAt', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await Accessibility.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const item = await Accessibility.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Accessibility.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Accessibility.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Record not found' });
    await item.destroy();
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
