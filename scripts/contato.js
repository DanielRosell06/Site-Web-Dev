document.getElementById('form-mensagem').addEventListener('submit', async (e) => {
    e.preventDefault();
    // Coleta os valores dos campos
    const name = e.target.nome.value;
    const phone = e.target.telefone.value;
    const gmail = e.target.email.value;
    const subject = e.target.assunto.value;
    const message = e.target.mensagem.value;

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
})