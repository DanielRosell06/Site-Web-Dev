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
        // Detecta o ambiente automaticamente
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const apiUrl = isLocal
            ? 'http://localhost:3000/enviar-mensagem'  // URL de desenvolvimento
            : 'https://site-web-dev.onrender.com/enviar-mensagem';  // URL de produção

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Mensagem enviada com sucesso!');
            e.target.reset();
        } else {
            const errorData = await response.json();
            alert(`Erro: ${errorData.error || 'Status ' + response.status}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }
});
