const express = require("express");
const router = express.Router();
const service = require("../services/workdays");

router.get("/", (req, res) => {
  res.json(service.listWorkdays());
});

router.post("/", (req, res) => {
  try {
    const { dia, horas } = req.body;
    const novo = service.addWorkday(dia, horas);
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.get("/summary", (req, res) => {
  res.json(service.summary());
});

module.exports = router;