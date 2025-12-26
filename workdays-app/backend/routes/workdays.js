const express = require("express");
const router = express.Router();

const service = require("../services/workdays");
const validateWorkday = require("../middlewares/validateWorkdays");

// GET /api/workdays
router.get("/", async (req, res) => {
  const list = await service.listWorkdays();
  res.json(list);
});

// GET /api/workdays/summary
router.get("/summary", async (req, res) => {
  const result = await service.summary();
  res.json(result);
});

// POST /api/workdays
router.post("/", validateWorkday, async (req, res) => {
  try {
    const { dia, horas } = req.body;
    const novo = await service.addWorkday(dia, horas);
    res.status(201).json(novo);
  } catch (err) {
    const status = err.code || 400; // 409 para duplicado, 400 para outros
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
