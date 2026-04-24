const express = require('express');
const { Performance } = require('../models');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try { res.json(await Performance.findAll({ order: [['createdAt', 'DESC']] })); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const item = await Performance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', authenticate, async (req, res) => {
  try { res.status(201).json(await Performance.create(req.body)); }
  catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const item = await Performance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const item = await Performance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
