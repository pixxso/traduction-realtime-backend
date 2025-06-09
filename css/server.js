const express = require("express");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Optionnel si tu mets tes fichiers html là

// 🔐 Auth pour accéder à /admin
app.use("/admin", basicAuth({
  users: { "manar": "secret123" }, // identifiant : manar / mot de passe : secret123
  challenge: true,
  realm: 'Zone privée'
}));

// 📄 Voir les réservations (protégé)
app.get("/admin", (req, res) => {
  const filePath = path.join(__dirname, "reservations.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Erreur lecture fichier.");
    const reservations = JSON.parse(data);
    let html = `<h2>📅 Réservations reçues</h2><ul>`;
    for (const r of reservations) {
      html += `<li><strong>${r.specialty}</strong> – ${r.date} à ${r.time}<br>
      📧 ${r.email} | 📱 ${r.phone}</li><hr>`;
    }
    html += `</ul>`;
    res.send(html);
  });
});

// 💾 API pour enregistrer une réservation
app.post("/api/reservations", (req, res) => {
  const { date, time, specialty, email, phone } = req.body;
  if (!date || !time || !specialty || !email || !phone)
    return res.status(400).send("Champs requis manquants");

  const newRes = { date, time, specialty, email, phone };
  const filePath = path.join(__dirname, "reservations.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    let reservations = [];
    if (!err && data) reservations = JSON.parse(data);
    reservations.push(newRes);
    fs.writeFile(filePath, JSON.stringify(reservations, null, 2), (err) => {
      if (err) return res.status(500).send("Erreur d'enregistrement");
      res.send("✅ Réservation enregistrée !");
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
