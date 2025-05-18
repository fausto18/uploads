const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors'); // ✅ Importado

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Habilita CORS
app.use(cors({
  origin: 'http://localhost:3000'
}));

// 📁 Cria a pasta uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ⚙️ Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Rotas...
// ✅ GET / → rota básica de teste
app.get('/', (req, res) => {
  res.send('🚀 API de Upload está online!');
});

// ✅ POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({
    message: 'Upload realizado com sucesso!',
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: fileUrl
  });
});

// ✅ GET /uploads
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao acessar os arquivos.' });
    }

    const lista = files.map((filename) => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    res.json(lista);
  });
});

// ✅ GET /uploads/:filename
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado.' });
  }
  res.sendFile(filePath);
});

// 🚀 Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
