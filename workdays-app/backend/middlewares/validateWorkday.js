function validateWorkday(req, res, next) {
  const { dia, horas } = req.body;

  if (typeof dia !== "number" || typeof horas !== "number") {
    return res.status(400).json({ error: "dia e horas devem ser números" });
  }

  if (dia < 1 || dia > 31) {
    return res.status(400).json({ error: "dia inválido" });
  }

  if (horas <= 0 || horas > 24) {
    return res.status(400).json({ error: "horas inválidas" });
  }

  // passou em tudo → deixa seguir
  next();
}

module.exports = validateWorkday;
