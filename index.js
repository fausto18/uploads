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

// Endpoint para upload e resposta com download imediato
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum ficheiro enviado.');
  }

  // Retornar o arquivo como download após o upload
  res.download(req.file.path, req.file.originalname);
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor de upload via multipart/form-data está funcionando!');
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
