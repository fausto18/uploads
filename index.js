const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8080;

// Criar a pasta 'uploads' se ela não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Garante que subpastas também podem ser criadas
}

// Configuração do multer para salvar arquivos com nomes únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Endpoint POST para upload de arquivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
  }

  const downloadUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(201).json({
    message: 'Upload realizado com sucesso!',
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    downloadUrl
  });
});

// Endpoint GET para listar arquivos
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao acessar a pasta de uploads.' });
    }

    const fileList = files.map((filename) => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    res.json(fileList);
  });
});

// Servir arquivos estaticamente
app.use('/uploads', express.static(uploadDir));

// Rota básica
app.get('/', (req, res) => {
  res.send('Servidor de upload ativo. Use POST /upload para enviar arquivos.');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
