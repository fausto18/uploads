const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Criar pasta uploads se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware para aceitar JSONs grandes
app.use(express.json({ limit: '50mb' }));

// Endpoint de upload via JSON base64 e resposta com download
app.post('/upload', (req, res) => {
  const { file, filename } = req.body;

  if (!file || !filename) {
    return res.status(400).json({ error: 'Campos "file" e "filename" são obrigatórios.' });
  }

  const uniqueName = Date.now() + '-' + filename;
  const filePath = path.join(uploadDir, uniqueName);
  const buffer = Buffer.from(file, 'base64');

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar ficheiro.' });
    }
    // Retornar o arquivo como download
    res.download(filePath, filename);
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor de upload via JSON está funcionando!');
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
