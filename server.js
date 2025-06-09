const express = require("express");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const axios = require("axios");
const app = express(), PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/admin", basicAuth({ users: { manar: "secret123" }, challenge: true }));

app.post("/api/reservations", (req, res) => {
  const { date, time, specialty, email, phone } = req.body;
  if (![date, time, specialty, email, phone].every(Boolean)) return res.status(400).send("Champs requis manquants");
  const arr = fs.existsSync("reservations.json") ? JSON.parse(fs.readFileSync("reservations.json")) : [];
  arr.push({ date, time, specialty, email, phone });
  fs.writeFileSync("reservations.json", JSON.stringify(arr,null,2));
  res.send("✅ Réservation enregistrée !");
});

app.post("/api/translate", async (req, res) => {
  const { text, from, to } = req.body;
  if (!text || !from || !to) return res.status(400).json({ error: "Champs manquants" });
  try {
    const response = await axios.post("https://api-free.deepl.com/v2/translate", null, {
      params: { auth_key: "TA_CLÉ_DEEPL", text, source_lang: from, target_lang: to },
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur de traduction" });
  }
});

app.get("/admin", (req, res) => {
  const data = fs.existsSync("reservations.json") ? JSON.parse(fs.readFileSync("reservations.json")) : [];
  res.send(/* HTML + style amélioré comme discuté */);
});

app.listen(PORT, () => console.log(`Server listening: http://localhost:${PORT}`));
