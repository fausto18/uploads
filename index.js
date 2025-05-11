require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.json());

// Upload e cadastro no banco
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('Ficheiro não enviado.');

  const sql = 'INSERT INTO documentos (nome_original, caminho) VALUES (?, ?)';
  const values = [file.originalname, file.path];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, message: 'Ficheiro salvo com sucesso!' });
  });
});

// Listar documentos
app.get('/documentos', (_, res) => {
  db.query('SELECT * FROM documentos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Download de documento
app.get('/documentos/:id/download', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM documentos WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).send('Documento não encontrado.');

    const doc = results[0];
    res.download(path.resolve(doc.caminho), doc.nome_original);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
