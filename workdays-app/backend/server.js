const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "workdays.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// GET: listar todos os dias
app.get("/api/workdays", (req, res) => {
  const data = readData();
  res.json(data);
});

// POST: adicionar um dia
app.post("/api/workdays", (req, res) => {
  const { dia, horas } = req.body;

  // validação simples
  if (typeof dia !== "number" || typeof horas !== "number") {
    return res.status(400).json({ error: "dia e horas devem ser números" });
  }
  if (dia < 1 || dia > 31) {
    return res.status(400).json({ error: "dia deve estar entre 1 e 31" });
  }
  if (horas <= 0 || horas > 24) {
    return res.status(400).json({ error: "horas deve estar entre 1 e 24" });
  }

  const data = readData();

  // regra: não permitir dia repetido (se quiser permitir, eu mudo)
  const jaExiste = data.some((item) => item.dia === dia);
  if (jaExiste) {
    return res.status(409).json({ error: `Dia ${dia} já existe` });
  }

  const novo = { dia, horas, criadoEm: new Date().toISOString() };
  data.push(novo);

  // ordena por dia
  data.sort((a, b) => a.dia - b.dia);

  writeData(data);
  res.status(201).json(novo);
});

// GET: resumo (total dias e horas)
app.get("/api/workdays/summary", (req, res) => {
  const data = readData();
  const totalDias = data.length;
  const totalHoras = data.reduce((acc, item) => acc + item.horas, 0);
  res.json({ totalDias, totalHoras });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
