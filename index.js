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

// ✅ Rota GET /upload → formulário HTML para envio
app.get('/upload', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <title>Enviar Ficheiro</title>
    </head>
    <body>
      <h2>Upload de Ficheiro</h2>
      <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" required />
        <button type="submit">Enviar</button>
      </form>
    </body>
    </html>
  `);
});

// ✅ Upload e download imediato
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum ficheiro enviado.');
  }

  // Forçar download após upload
  res.download(req.file.path, req.file.originalname);
});

// ✅ Listar todos os uploads
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao ler a pasta de uploads.' });
    }

    const lista = files.map(filename => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    res.json(lista);
  });
});

// ✅ Rota para acessar os arquivos diretamente
app.use('/uploads', express.static(uploadDir));

// ✅ Página inicial simples
app.get('/', (req, res) => {
  res.send('Servidor de upload via multipart/form-data está funcionando!');
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
