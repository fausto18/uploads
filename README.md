
# 📁 Upload API com CRUD (Node.js + Express + PostgreSQL)

# Descrição da API
A Upload API com CRUD é uma aplicação backend desenvolvida em Node.js com Express, que permite o envio, armazenamento e gestão de arquivos de forma eficiente. Os arquivos são armazenados localmente no servidor, enquanto seus metadados (nome original, nome salvo, data de envio) são salvos em um banco de dados PostgreSQL.

Esta API suporta um conjunto completo de operações CRUD (Criar, Ler, Atualizar, Deletar) sobre os registros de upload, além de servir os arquivos para download. É ideal para aplicações como repositórios acadêmicos, sistemas de submissão de documentos, bibliotecas digitais e plataformas de armazenamento interno.

---

## 🚀 Funcionalidades

- ✅ Upload de arquivos com salvamento local
- ✅ Armazenamento de metadados no PostgreSQL
- ✅ Listagem de arquivos salvos
- ✅ Consulta por ID
- ✅ Atualização de nome do arquivo
- ✅ Remoção do arquivo e registro
- ✅ Validações de entrada com `express-validator`
- ✅ Rota de teste de conexão

---

## 🧰 Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- Multer
- express-validator
- Railway (deploy sugerido)

---

## 📦 Instalação

```bash
git clone https://github.com/fausto18/uploads.git
cd upload-api
npm install
```

---

## ⚙️ Configuração

Crie um arquivo `.env` com a variável de conexão:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
```

---

## ▶️ Executar o Servidor

```bash
node index.js
```

A API estará acessível em: `http://localhost:8080`

---

## 📁 Endpoints da API com exemplos

### 🔹 Teste de Conexão

```http
GET http://localhost:8080
```

### 🔹 Upload de Arquivo

```http
POST http://localhost:8080/uploads
Body (form-data):
- Key: file
- Type: File
- Value: selecione um arquivo
```

### 🔹 Listar Arquivos Locais

```http
GET http://localhost:8080/uploads
```

### 🔹 Acessar Arquivo Local

```http
GET http://localhost:8080/uploads/1700000000000-nome-do-arquivo.pdf
```

### 🔹 Listar Registros do Banco

```http
GET http://localhost:8080/files
```

### 🔹 Buscar Upload por ID

```http
GET http://localhost:8080/files/1
```

### 🔹 Atualizar Nome Original

```http
PUT http://localhost:8080/files/1
Headers:
- Content-Type: application/json

Body:
{
  "original_name": "novo_nome.pdf"
}
```

### 🔹 Deletar Upload + Arquivo

```http
DELETE http://localhost:8080/files/1
```

---

## 🧾 Estrutura da Tabela (PostgreSQL)

```sql
CREATE TABLE upload (
  id SERIAL PRIMARY KEY,
  original_name TEXT NOT NULL,
  saved_name TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 🧪 Teste com Postman

Importe o arquivo `Upload_API_CRUD.postman_collection.json` para testar todos os endpoints rapidamente.

---

## 👨‍💻 Autor

Desenvolvido por [Fausto Sacufundala]  
2025 · API em produção com Railway

---
