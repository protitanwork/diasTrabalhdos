console.log("✅ routes/workdays.js carregado:", __filename);

const express = require("express");
const router = express.Router();

const service = require("../services/workdays");
const validateWorkday = require("../middlewares/validateWorkday");

// GET /api/workdays
router.get("/", async (req, res) => {
  const list = await service.listWorkdays();
  res.json(list);
});


router.get("/summary", async (req, res) => {
  const result = await service.summary();
  console.log("✅ RESULT DO SERVICE.SUMMARY =", result);
  res.json(result);
});

// POST /api/workdays
router.post("/", validateWorkday, async (req, res) => {
  try {
    const { dia, horas } = req.body;
    const novo = await service.addWorkday(dia, horas);
    res.status(201).json(novo);
  } catch (err) {
    const status = err.code || 400;
    res.status(status).json({ error: err.message });
  }
});

module.exports = router;
