const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

// Configuração do Express
const app = express();

// ======================================
// Configurações de Segurança
// ======================================
app.use(helmet());
app.disable('x-powered-by');

// ======================================
// Configuração do CORS (Desenvolvimento/Produção)
// ======================================
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://site-web-dev.onrender.com', // Produção
      'http://localhost:5500',            // Live Server
      'http://localhost:3000',            // Frontend local
      'http://127.0.0.1:5500'             // Alternativa local
    ];

    const isAllowed = process.env.NODE_ENV === 'production'
      ? origin === 'https://site-web-dev.onrender.com'
      : !origin || allowedOrigins.includes(origin);

    isAllowed 
      ? callback(null, true)
      : callback(new Error('Bloqueado por política de CORS'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));

// ======================================
// Middlewares
// ======================================
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// ======================================
// Configuração do PostgreSQL (NeonDB)
// ======================================
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
};

// Log seguro da configuração
console.log('[NEONDB] Config:', {
  ...poolConfig,
  connectionString: poolConfig.connectionString?.replace(/\/\/.*@/, '//[REDACTED]@')
});

const pool = new Pool(poolConfig);

// ======================================
// Inicialização do Banco de Dados
// ======================================
const initializeDatabase = async () => {
  try {
    // Teste de conexão básica
    const client = await pool.connect();
    console.log('✅ Conexão com NeonDB estabelecida!');
    
    // Criação da tabela
    await client.query(`
      CREATE TABLE IF NOT EXISTS Mensagem (
        IdMensagem SERIAL PRIMARY KEY,
        NomeMensagem VARCHAR(100) NOT NULL,
        EmailMensagem VARCHAR(100) NOT NULL,
        AssuntoMensagem VARCHAR(50) NOT NULL,
        ConteudoMensagem TEXT NOT NULL,
        TelefoneMensagem VARCHAR(20),
        DataEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );
    
    client.release();
    console.log('✅ Tabela verificada com sucesso!');

  } catch (err) {
    console.error('❌ Falha crítica na inicialização:', err);
    process.exit(1);
  }
};

// Executar inicialização
initializeDatabase();

// ======================================
// Rotas
// ======================================

// Health Check (Obrigatório para Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    db: 'connected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota Principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contato.html'));
});

// Envio de Mensagem
app.post('/enviar-mensagem', async (req, res) => {
  const requiredFields = ['nome', 'email', 'assunto', 'mensagem'];
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
        req.body.telefone || null,
        req.body.assunto,
        req.body.mensagem
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('📛 Erro no processamento:', err);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message })
    });
  }
});

// ======================================
// Inicialização do Servidor
// ======================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  ==================================
  🚀 Servidor iniciado na porta ${PORT}
  🔒 Modo: ${process.env.NODE_ENV || 'development'}
  📡 NeonDB: ${process.env.DATABASE_URL ? 'configurado' : 'não configurado!'}
  ==================================
  `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Erro não tratado:', err);
  process.exit(1);
});