console.log("app.js carregou ✅");

const API = "http://127.0.0.1:3001/api/workdays";


const diaEl = document.getElementById("dia");
const horasEl = document.getElementById("horas");
const msgEl = document.getElementById("msg");
const listEl = document.getElementById("list");
const summaryEl = document.getElementById("summary");
const btnAdd = document.getElementById("btnAdd");

function setMsg(text, type = "") {
  msgEl.className = type;
  msgEl.textContent = text;
}

async function carregar() {
  try {
  const [listRes, sumRes] = await Promise.all([
    fetch(API),
    fetch(API + "/summary")
  ]);

  const lista = await listRes.json();
  const resumo = await sumRes.json();

  summaryEl.textContent = 
  `Total: ${resumo.totalDias} dias, ${resumo.totalHoras} horas.` +
  `€ ${Number(resumo.totalGanho || 0).toFixed(2)}.`;

  const linhas = lista
    .map (item => `Dia ${item.dia}: ${item.horas} horas`)
    .join("\n");

  listEl.textContent = linhas || "Sem registros ainda.";
} catch (e){
  setMsg("Erro ao carregar: " + e.message, "error");
    summaryEl.textContent = "";
    listEl.textContent = "";
}
}

btnAdd.addEventListener("click", async () => {
  const dia = Number(diaEl.value);
  const horas = Number(horasEl.value);

  if (!dia || !horas) {
    return setMsg("Preencha dia e horas.", "error");
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dia, horas })
    });

    const data = await res.json();

    if (!res.ok) {
      return setMsg(data.error || "Erro ao salvar.", "error");
    }

    setMsg(`Salvo: Dia ${data.dia} com ${data.horas} horas.`, "ok");
    diaEl.value = "";
    horasEl.value = "";
    carregar();
  } catch {
    setMsg("Backend não está rodando.", "error");
  }
});

carregar();
