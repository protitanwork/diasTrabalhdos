const express = require ("express");
const cors = require ("cors");

const app = express ();
app.use(cors());
app.use(express.json());

const workdaysRouts = require ("./routes/workdays");
app.use("/api/workdays", workdaysRouts);

app.listen (3001, () => {
  console.log("backend rodando em http://localhost:3001");
});


