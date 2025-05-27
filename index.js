const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8080;

// 🔐 Conexão com PostgreSQL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 🌐 CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://web-repositorio-feliciano-rodinos-projects.vercel.app'
  ],
  credentials: true
}));

// 📁 Pasta de uploads
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

// ✅ Middleware JSON para rotas PUT
app.use(express.json());

// 🔹 Rota básica
app.get('/', (req, res) => {
  res.send('Seja Bem-vindo a API do Metanoia!');
});

// 🔹 POST /upload → criar novo upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });

  const { originalname, filename } = req.file;
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

  try {
    await db.query(
      'INSERT INTO upload (original_name, saved_name, uploaded_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
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

// 🔹 GET /uploads → lista arquivos no disco
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao acessar os arquivos.' });

    const lista = files.map((filename) => ({
      filename,
      url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
    }));

    res.json(lista);
  });
});

// 🔹 GET /uploads/:filename → acessa arquivo físico
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado.' });
  }
  res.sendFile(filePath);
});

// 🔹 GET /files → listar todos os uploads no banco
app.get('/files', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM upload ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar uploads:', err.stack);
    res.status(500).json({ error: 'Erro ao buscar uploads no banco de dados.' });
  }
});

// 🔹 GET /files/:id → buscar um upload por ID
app.get('/files/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM upload WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar registro:', err.stack);
    res.status(500).json({ error: 'Erro ao buscar registro.' });
  }
});

// 🔹 PUT /files/:id → atualizar nome_original
app.put('/files/:id', async (req, res) => {
  const { original_name } = req.body;
  if (!original_name) {
    return res.status(400).json({ error: 'Campo original_name é obrigatório.' });
  }

  try {
    const result = await db.query(
      'UPDATE upload SET original_name = $1 WHERE id = $2 RETURNING *',
      [original_name, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar registro:', err.stack);
    res.status(500).json({ error: 'Erro ao atualizar registro.' });
  }
});

// 🔹 DELETE /files/:id → remove do banco e do disco
app.delete('/files/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT saved_name FROM upload WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }

    const filename = result.rows[0].saved_name;
    const filePath = path.join(uploadDir, filename);

    await db.query('DELETE FROM upload WHERE id = $1', [req.params.id]);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Arquivo e registro deletados com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar registro:', err.stack);
    res.status(500).json({ error: 'Erro ao deletar registro.' });
  }
});

// 🚀 Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
