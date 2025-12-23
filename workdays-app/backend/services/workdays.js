const fs = require("fs");
const path = require("path");


const DATA_FILE = path.join(__dirname, "../data/workdays.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8") || "[]");
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function listWorkdays(){
    return readData();
}

function addWorkday(dia, horas) {
  if (dia < 1 || dia > 31) throw new Error("Dia inválido");
  if (horas <= 0 || horas > 24) throw new Error("Horas inválidas");

  const data = readData();
  if (data.some(d => d.dia === dia)) {
    throw new Error("Dia já existe");
  }

   const novo = { dia, horas, criadoEm: new Date().toISOString() };
  data.push(novo);
  data.sort((a, b) => a.dia - b.dia);
  writeData(data);
  return novo;
}

function summary(){
    const data = readData();
    return {
        totalDias : data.length,
        totalHoras : data.reduce((acc, d )=> acc + d.horas, 0 )
    };
}

module.exports = {
  listWorkdays,
  addWorkday,
  summary
};