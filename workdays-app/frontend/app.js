const API = "http://127.0.0.1:3001/api/workdays";

const dataEl = document.getElementById("data");
const horasEl = document.getElementById("horas");
const rateEl = document.getElementById("rate");
const btnAdd = document.getElementById("btnAdd");
const btnMes = document.getElementById("btnMes");
const listaMesesEl = document.getElementById("listaMeses");
const msgEl = document.getElementById("msg");

const RATE_KEY = "rate_eur_h";

function setMsg(text, type = "") {
  msgEl.className = type;
  msgEl.textContent = text;
}

function isIsoDate(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nomeMes(yyyyMm) {
  const [y, m] = yyyyMm.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

// Descobre o mês do item, mesmo com banco antigo (dia + criadoEm)
function monthFromItem(item) {
  // novo formato
  if (item.data && isIsoDate(item.data)) return item.data.slice(0, 7);

  // antigo formato: usa criadoEm para pegar mês/ano real
  if (typeof item.dia === "number") {
    const base = item.criadoEm ? new Date(item.criadoEm) : new Date();
    const y = base.getFullYear();
    const m = pad2(base.getMonth() + 1);
    return `${y}-${m}`;
  }

  return null;
}

// --- € por hora automático (salvo no navegador) ---
function salvarRate() {
  const n = Number(rateEl.value);
  if (Number.isFinite(n) && n >= 0) {
    localStorage.setItem(RATE_KEY, String(n));
  }
}
rateEl.addEventListener("input", salvarRate);
rateEl.addEventListener("change", salvarRate);



// Botão "Abrir mês" sempre funciona (muda quando você troca a data)
function atualizarBtnMes() {
  const iso = dataEl.value;

  const agora = new Date();
  const mes = isIsoDate(iso)
    ? iso.slice(0, 7)
    : `${agora.getFullYear()}-${pad2(agora.getMonth() + 1)}`;

  btnMes.href = `mes.html?mes=${encodeURIComponent(mes)}`;
  btnMes.textContent = `Abrir ${nomeMes(mes)}`;
}

dataEl.addEventListener("change", atualizarBtnMes);

// Carrega meses existentes (sem rota nova no backend)
async function carregarMeses() {
  const res = await fetch(API);
  const text = await res.text();

  if (text.trim().startsWith("<")) {
    throw new Error("Backend respondeu HTML (verifique API/porta).");
  }

  const lista = JSON.parse(text);

  const meses = [...new Set((lista || []).map(monthFromItem).filter(Boolean))]
    .sort()
    .reverse();

  listaMesesEl.innerHTML = meses.length
    ? meses.map(m => `<li><a href="mes.html?mes=${encodeURIComponent(m)}">${nomeMes(m)}</a></li>`).join("")
    : "<li>Nenhum mês registrado</li>";
}

// Adicionar (envia no formato novo: { data, horas })
btnAdd.addEventListener("click", async () => {
  const data = dataEl.value;
  const horas = Number(horasEl.value);

  if (!isIsoDate(data)) return setMsg("Selecione uma data válida.", "error");
  if (!horas || horas < 1 || horas > 24) return setMsg("Horas inválidas (1 a 24).", "error");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, horas })
    });

    const bodyText = await res.text();
    const body = bodyText.trim().startsWith("<") ? { error: "Backend devolveu HTML" } : JSON.parse(bodyText);

    if (!res.ok) return setMsg(body.error || "Erro ao salvar.", "error");

    setMsg("Dia registrado ✔", "ok");
    horasEl.value = "";

    // mantém a data para o botão já apontar pro mês correto
    dataEl.value = body.data || dataEl.value;
    atualizarBtnMes();

    await carregarMeses();
  } catch (e) {
    setMsg("Erro: " + e.message, "error");
  }
});

// init
atualizarBtnMes();
carregarMeses().catch(e => setMsg("Erro ao carregar meses: " + e.message, "error"));
