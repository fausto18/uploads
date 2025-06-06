// index.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  { auth: { persistSession: false } }
);

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://web-repositorio-feliciano-rodinos-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Multer (armazenamento em memória)
const upload = multer({ storage: multer.memoryStorage() });

// Boas-vindas
app.get('/', (req, res) => {
  res.send('Seja Bem-vindo à API do Metanoia!');
});

// Upload
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado.' });

  const { originalname, buffer, mimetype } = req.file;
  const filename = `${Date.now()}-${originalname}`;

  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filename, buffer, { contentType: mimetype });

  if (uploadError) return res.status(500).json({ error: uploadError.message });

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filename);

  const { data, error } = await supabase
    .from('upload')
    .insert([{ original_name: originalname, saved_name: filename }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({
    message: 'Upload realizado com sucesso!',
    url: publicUrlData.publicUrl,
    filename,
    originalname
  });
});

// Lista todos os uploads (rota geral)
app.get('/files', async (req, res) => {
  const { data, error } = await supabase
    .from('upload')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const arquivos = data.map(file => {
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(file.saved_name);
    return {
      ...file,
      url: publicUrlData.publicUrl
    };
  });

  res.json(arquivos);
});

// Lista para frontend
app.get('/uploads', async (req, res) => {
  const { data, error } = await supabase
    .from('upload')
    .select('*')
    .order('uploaded_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const arquivos = data.map(file => {
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(file.saved_name);
    return {
      ...file,
      url: publicUrlData.publicUrl
    };
  });

  res.json(arquivos);
});

// Buscar arquivo por ID
app.get('/files/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('upload')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Registro não encontrado.' });

  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(data.saved_name);

  res.json({ ...data, url: publicUrlData.publicUrl });
});

// Atualizar nome do arquivo

app.put('/files/:id', async (req, res) => {
  if (!req.body || !req.body.original_name) {
    return res.status(400).json({ error: 'Campo original_name é obrigatório.' });
  }

  const { original_name } = req.body;

  const { data, error } = await supabase
    .from('upload')
    .update({ original_name })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Erro ao atualizar registro.' });
  }

  res.json(data);
});


// Deletar
app.delete('/files/:id', async (req, res) => {
  const { data: fileData, error: findError } = await supabase
    .from('upload')
    .select('saved_name')
    .eq('id', req.params.id)
    .single();

  if (findError || !fileData) return res.status(404).json({ error: 'Registro não encontrado.' });

  const { error: storageError } = await supabase
    .storage
    .from('uploads')
    .remove([fileData.saved_name]);

  if (storageError) return res.status(500).json({ error: 'Erro ao excluir arquivo do Storage.' });

  const { error: dbError } = await supabase
    .from('upload')
    .delete()
    .eq('id', req.params.id);

  if (dbError) return res.status(500).json({ error: 'Erro ao excluir do banco de dados.' });

  res.json({ message: 'Arquivo e registro deletados com sucesso.' });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
