const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg'); // ✅ PostgreSQL

const app = express();
const PORT = process.env.PORT || 8080;

// 🔐 Conexão com PostgreSQL via variável DATABASE_URL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 🌐 Habilita CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://web-repositorio-feliciano-rodinos-projects.vercel.app'
  ],
  credentials: true
}));

// 📁 Cria pasta uploads se não existir
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

// ✅ Rota básica
app.get('/', (req, res) => {
  res.send('API de Upload está online!');
});

// ✅ POST /upload → salva no disco + insere no PostgreSQL
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });

  const { originalname, filename } = req.file;
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

  try {
    await db.query(
      'INSERT INTO upload (original_name, saved_name) VALUES ($1, $2)',
      [originalname, filename]
    );

    res.status(201).json({
      message: 'Upload realizado com sucesso!',
      filename,
      originalname,
      url: fileUrl
    });
  } catch (err) {
    console.error('ERRO DETALHADO:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET /uploads → lista os arquivos do disco
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

// ✅ GET /uploads/:filename → serve um arquivo específico
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado.' });
  }
  res.sendFile(filePath);
});

// ✅ NOVA ROTA: GET /files → lista os registros do banco de dados
app.get('/files', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM uploads_final ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar uploads:', err.stack);
    res.status(500).json({ error: 'Erro ao buscar uploads no banco de dados.' });
  }
});

// 🚀 Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
