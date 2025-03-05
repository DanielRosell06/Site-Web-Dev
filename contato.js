const express = require('express');
const bodyParser = require('body-parser');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }) // Salva a sessão na pasta "session"
});

// Configurações para o servidor
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Quando o QR Code for gerado
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima para autenticar no WhatsApp Web.');
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

// Quando ocorrer um erro no cliente
client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    console.log('Reiniciando...');
    client.initialize(); // Tenta reconectar automaticamente
});

// Rota para enviar mensagem
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

        await client.sendMessage("5511993809760@c.us", message); // numero da pessoa que recebera a mensagem
        res.json({ status: 'success', message: 'Mensagem enviada com sucesso!' });
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
        res.status(500).json({ status: 'error', message: 'Erro ao enviar mensagem', details: err.message });
    }
});

// Inicializa o cliente do WhatsApp
client.initialize();

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});