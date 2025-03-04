const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // Adicionei segurança extra
const path = require('path');

// Configuração do Express
const app = express();

// Segurança para produção
app.use(helmet());
app.use(cors({
  origin: 'https://site-web-dev.onrender.com', // Restringe para seu domínio
  methods: ['POST', 'GET'] // Métodos permitidos
}));

// Configurações do Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Conexão e criação de tabela
(async () => {
  try {
    // Teste de conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Banco de dados conectado!');

    // Criação da tabela
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Mensagem (
        IdMensagem SERIAL PRIMARY KEY,
        NomeMensagem VARCHAR(100) NOT NULL,
        EmailMensagem VARCHAR(100) NOT NULL,
        AssuntoMensagem VARCHAR(50) NOT NULL,
        ConteudoMensagem TEXT NOT NULL,
        TelefoneMensagem VARCHAR(20),
        DataEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);
    console.log('✅ Tabela verificada!');

  } catch (err) {
    console.error('❌ Erro crítico:', err);
    process.exit(1);
  }
})();

// Rota de envio de mensagem
app.post('/enviar-mensagem', async (req, res) => {
  const requiredFields = ['nome', 'email', 'assunto', 'mensagem'];
  
  // Validação aprimorada
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Mensagem 
      (NomeMensagem, EmailMensagem, TelefoneMensagem, AssuntoMensagem, ConteudoMensagem) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING IdMensagem, DataEnvio`,
      [
        req.body.nome,
        req.body.email,
        req.body.telefone || null, // Permite null
        req.body.assunto,
        req.body.mensagem
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Mensagem enviada!',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('Erro na API:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
});

// Rota de health check (obrigatória para Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online' });
});

// Porta dinâmica para produção
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});