const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ======================================
// Configurações de Segurança
// ======================================
app.use(helmet());
app.disable('x-powered-by');

// ======================================
// Configuração do CORS
// ======================================
const corsOptions = {
  origin: (origin, callback) => {
    const allowedDomains = [
      'https://peaceful-pavlova-fcd8bc.netlify.app', // Frontend Netlify
      'https://site-web-dev-pw1t.onrender.com',        // Backend Render
    ];

    // Em produção: permite frontend Netlify + backend Render
    if (process.env.NODE_ENV === 'production') {
      const isAllowed = allowedDomains
        .map(domain => new URL(domain).hostname) // Extrai apenas o domínio
        .includes(new URL(origin).hostname);

      return isAllowed 
        ? callback(null, true)
        : callback(new Error(`Origem bloqueada: ${origin}`));
    }

    // Em desenvolvimento: permite tudo
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// ======================================
// Middlewares
// ======================================
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ======================================
// Configuração do WhatsApp
// ======================================
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './session' })
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Escaneie o QR Code acima para autenticar no WhatsApp Web.');
});

client.on('ready', () => {
  console.log('Cliente WhatsApp está pronto!');
});

client.on('auth_failure', (msg) => {
  console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  console.log('Cliente desconectado:', reason);
  client.initialize();
});

client.initialize();

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

const pool = new Pool(poolConfig);

// ======================================
// Inicialização do Banco de Dados
// ======================================
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com NeonDB estabelecida!');
    
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

initializeDatabase();

// ======================================
// Rotas
// ======================================

// Health Check
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

// Envio de Mensagem para o Banco de Dados
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

// Envio de Mensagem para WhatsApp
app.post('/send-message', async (req, res) => {
  const { message, number } = req.body;

  if (!message || !number) {
    return res.status(400).json({ status: 'error', message: 'Mensagem e número são obrigatórios.' });
  }

  const numeroDestino = number.includes('@c.us') ? number : `${number}@c.us`;

  try {
    const isRegistered = await client.isRegisteredUser(numeroDestino);
    if (!isRegistered) {
      return res.status(400).json({ status: 'error', message: 'Número não registrado no WhatsApp.' });
    }

    await client.sendMessage("5511993809760@c.us", message);
    res.json({ status: 'success', message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
    res.status(500).json({ status: 'error', message: 'Erro ao enviar mensagem', details: err.message });
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

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Erro não tratado:', err);
  process.exit(1);
});