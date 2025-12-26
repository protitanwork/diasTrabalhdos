const fs = require("fs/promises");
const path = require("path");


const DATA_FILE = path.join(__dirname, "../data/workdays.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeData(data) {
  await fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

 async function listWorkdays(){
    return await readData();
}

async function addWorkday(dia, horas) {
  if (dia < 1 || dia > 31) throw new Error("Dia inválido");
  if (horas <= 0 || horas > 24) throw new Error("Horas inválidas");

  const data = await readData();

  // Conflito: dia já existe
  if (data.some((item) => item.dia === dia)) {
    const err = new Error(`Dia ${dia} já existe`);
    err.code = 409;
    throw err;
  }

   const novo = { dia, horas, criadoEm: new Date().toISOString() };
  data.push(novo);
  data.sort((a, b) => a.dia - b.dia);


  writeData(data);
  return novo;
}

async function summary(){
    const data =  await readData();
    return {
        totalDias : data.length,
        totalHoras : data.reduce((acc, item ) => acc + item.horas, 0 )
    };
}

module.exports = {
  listWorkdays,
  addWorkday,
  summary
};