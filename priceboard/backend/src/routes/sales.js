const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const WORKERS = ['Sandra', 'Nii', 'Angela', 'Hannah'];

// PUBLIC — workers submit their daily sales
router.post('/', async (req, res) => {
  const { worker, amount, note } = req.body;
  if (!worker || !amount)
    return res.status(400).json({ message: 'Worker name and amount are required' });
  if (!WORKERS.includes(worker))
    return res.status(400).json({ message: 'Invalid worker name' });

  try {
    const entry = await prisma.salesEntry.create({
      data: {
        worker,
        amount: parseFloat(amount),
        note: note || null,
      }
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN — get all sales entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await prisma.salesEntry.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN — get sales summary for today
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const entries = await prisma.salesEntry.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'desc' },
    });

    const summary = WORKERS.map(worker => ({
      worker,
      total: entries
        .filter(e => e.worker === worker)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0),
      entries: entries.filter(e => e.worker === worker),
    }));

    const grandTotal = summary.reduce((sum, w) => sum + w.total, 0);

    res.json({ summary, grandTotal, date: new Date() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// ADMIN — delete a sales entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.salesEntry.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
