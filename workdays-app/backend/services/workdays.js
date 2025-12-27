console.log("✅ workdays.js carregado:", __filename);
const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/workdays.json");
const VALOR_HORA_PADRAO = 6;

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function listWorkdays() {
  return await readData();
}

async function addWorkday(dia, horas) {



  if (dia < 1 || dia > 31) throw new Error("Dia inválido");
  if (horas <= 0 || horas > 24) throw new Error("Horas inválidas");

  const data = await readData();

  if (data.some((item) => item.dia === dia)) {
    const err = new Error(`Dia ${dia} já existe`);
    err.code = 409;
    throw err;
  }

  const valorHora = VALOR_HORA_PADRAO;
  const valorDia = Number((horas * valorHora).toFixed(2));

  const novo = {
    dia,
    horas,
    valorHora,
    valorDia,
    criadoEm: new Date().toISOString(),
  };

  data.push(novo);
  data.sort((a, b) => a.dia - b.dia);

  await writeData(data);
  return novo;
}

async function summary() {

  const data = await readData();
    
  const VALOR_HORA = 6;

  const totalDias = data.length;
  const totalHoras = data.reduce((acc, item) => acc + Number(item.horas || 0), 0);
  const totalGanho = Number ((totalHoras * VALOR_HORA).toFixed(2));

  const result = {
    totalDias,
    totalHoras,
    totalGanho
  };
  console.log("SUMMARY SERVICE RESULT =", result);

  return result;
}


module.exports = {
  listWorkdays,
  addWorkday,
  summary,
};
