const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8080;

// Criar pasta uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 📤 POST /upload → envia ficheiro via multipart/form-data
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });
  }

  res.json({
    message: 'Upload realizado com sucesso!',
    filename: req.file.filename,
    downloadUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  });
});

// 📂 GET /uploads → listar todos os ficheiros enviados
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar ficheiros.' });
    }

    const lista = files.map(filename => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    res.json(lista);
  });
});

// 📥 GET /uploads/:filename → baixar ou visualizar arquivo
app.use('/uploads', express.static(uploadDir));

// ✅ Rota raiz de teste
app.get('/', (req, res) => {
  res.json({ status: 'Servidor de upload está ativo.' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
