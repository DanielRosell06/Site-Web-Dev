document.getElementById('form-mensagem').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        nome: e.target.nome.value,
        email: e.target.email.value,
        telefone: e.target.telefone.value,
        assunto: e.target.assunto.value,
        mensagem: e.target.mensagem.value
    };

    try {
        const response = await fetch('https://site-web-dev.onrender.com/enviar-mensagem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Mensagem enviada com sucesso!');
            e.target.reset();
        } else {
            alert('Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão');
    }
});
