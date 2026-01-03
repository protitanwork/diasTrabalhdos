const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Arquivo onde vamos persistir os dados
const DB_PATH = path.join(__dirname, "..", "data", "workdays.json");

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]", "utf-8");
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function isIsoDate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function mesDaData(isoDate) {
  // "2026-01-03" => "2026-01"
  return String(isoDate).slice(0, 7);
}

/**
 * GET /api/workdays
 * Opcional: ?mes=YYYY-MM
 */
router.get("/", (req, res) => {
  const { mes } = req.query; // ex: "2026-01"
  const lista = readDb();

  const filtrada = mes
    ? lista.filter((item) => item.data && mesDaData(item.data) === mes)
    : lista;

  // Ordena por data crescente
  filtrada.sort((a, b) => String(a.data).localeCompare(String(b.data)));

  res.json(filtrada);
});

/**
 * GET /api/workdays/summary
 * Opcional: ?mes=YYYY-MM
 */
router.get("/summary", (req, res) => {
  const { mes } = req.query;
  const lista = readDb();

  const filtrada = mes
    ? lista.filter((item) => item.data && mesDaData(item.data) === mes)
    : lista;

  const totalDias = filtrada.length;
  const totalHoras = filtrada.reduce((acc, item) => acc + (Number(item.horas) || 0), 0);

  // Se você quiser calcular ganho, ajuste o valorHora aqui (ou salve ganho no registro)
  const valorHora = 0; // coloque, por exemplo, 6 se quiser 6€/hora
  const totalGanho = totalHoras * valorHora;

  res.json({ totalDias, totalHoras, totalGanho });
});

/**
 * POST /api/workdays
 * body: { data: "YYYY-MM-DD", horas: number }
 */
router.post("/", (req, res) => {
  const { data, horas } = req.body;

  if (!isIsoDate(data)) {
    return res.status(400).json({ error: "Campo 'data' inválido. Use YYYY-MM-DD." });
  }

  const h = Number(horas);
  if (!h || h < 1 || h > 24) {
    return res.status(400).json({ error: "Campo 'horas' inválido (1 a 24)." });
  }

  const lista = readDb();

  // (Opcional) impedir duplicar o mesmo dia:
  const jaExiste = lista.some((item) => item.data === data);
  if (jaExiste) {
    return res.status(409).json({ error: "Esse dia já foi registrado." });
  }

  const novo = { data, horas: h };
  lista.push(novo);
  writeDb(lista);

  res.status(201).json(novo);
});

module.exports = router;

