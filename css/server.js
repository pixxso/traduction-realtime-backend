const express = require("express");
const basicAuth = require("express-basic-auth");
const fs = require("fs");
const path = require("path");
const app = express(), PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/admin", basicAuth({ users:{ manar: "secret123" }, challenge:true, realm:'Zone privée' }));

app.get("/admin", (req, res) => {
  const data = fs.existsSync("reservations.json") ? JSON.parse(fs.readFileSync("reservations.json","utf8")) : [];
  res.send(`
  <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Admin Réservations</title>
     <link rel="stylesheet" href="/css/style.css"><style>
     table{width:100%;border-collapse:collapse;margin:2rem auto;}
     th,td{padding:1rem;border-bottom:1px solid #ddd;}
     th{background:#0d47a1;color:#fff;}
     tr:hover{background:#f1f1f1;}body{padding:2rem;font-family:'Segoe UI',sans-serif;}
     </style></head><body>
     <h2 style="text-align:center;color:#0d47a1;">📋 Réservations reçues</h2>
     <table><thead><tr><th>Date</th><th>Heure</th><th>Domaine</th><th>Email</th><th>Téléphone</th></tr></thead><tbody>
     ${data.map(r=>`<tr><td>${r.date}</td><td>${r.time}</td><td>${r.specialty}</td><td>${r.email}</td><td>${r.phone}</td></tr>`).join('')}
     </tbody></table></body></html>
  `);
});

app.post("/api/reservations", (req,res) => {
  const { date, time, specialty, email, phone } = req.body;
  if (![date,time,specialty,email,phone].every(Boolean)) return res.status(400).send("Champs requis manquants");
  const arr = fs.existsSync("reservations.json") ? JSON.parse(fs.readFileSync("reservations.json","utf8")) : [];
  arr.push({date, time, specialty, email, phone});
  fs.writeFileSync("reservations.json", JSON.stringify(arr,null,2));
  res.send("✅ Réservation enregistrée !");
});

app.listen(PORT, () => console.log(`✅ Serveur: http://localhost:${PORT}`));
