function sendMessage() {
    // Coleta os valores dos campos
    const name = document.getElementById('nome').value;
    const phone = document.getElementById('telefone').value;
    const gmail = document.getElementById('email').value;
    const subject = document.getElementById('assunto').value;
    const message = document.getElementById('mensagem').value;

    // Valida se todos os campos estão preenchidos
    if (!name || !phone || !subject || !message) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Formata a mensagem sem espaços desnecessários
    const formattedMessage = `*Nome:* ${name}\n*Telefone:* ${phone}\n*email:* ${gmail}\n*Assunto:* ${subject}\n*Mensagem:* ${message}`;

    // Detecta o ambiente automaticamente
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocal
        ? 'http://localhost:3000/send-message'  // URL de desenvolvimento
        : 'https://site-web-dev.onrender.com/send-message';  // URL de produção

    // Envia a mensagem para o servidor
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: formattedMessage, number: phone }) // Envia a mensagem formatada e o número
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Mensagem enviada com sucesso!');
        } else {
            alert('Erro ao enviar mensagem: ' + (data.message || 'Tente novamente.'));
        }
    })
    .catch(err => {
        alert('Erro na comunicação com o servidor!');
        console.error(err);
    });
}