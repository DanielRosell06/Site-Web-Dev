document.getElementById('form-contato').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coleta de dados
    const formData = {
      nome: e.target.nome.value,
      email: e.target.email.value,
      telefone: e.target.telefone.value,
      assunto: e.target.assunto.value,
      mensagem: e.target.mensagem.value
    };
  
    try {
      // Configuração dinâmica da URL
      const isLocal = window.location.hostname.includes('localhost');
      const baseURL = isLocal
        ? 'http://localhost:3000'
        : 'https://site-web-dev.onrender.com';
  
      // Envio para o banco de dados
      const dbResponse = await fetch(`${baseURL}/enviar-mensagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      if (!dbResponse.ok) {
        throw new Error('Falha ao salvar no banco de dados');
      }
  
      // Envio para WhatsApp
      const whatsappMessage = `
        *Nova Mensagem do Site*
        Nome: ${formData.nome}
        Telefone: ${formData.telefone}
        Email: ${formData.email}
        Assunto: ${formData.assunto}
        Mensagem: ${formData.mensagem}
      `;
  
      const whatsappResponse = await fetch(`${baseURL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: whatsappMessage,
          number: '5511993809760' // Número fixo ou formData.telefone
        })
      });
  
      if (!whatsappResponse.ok) {
        throw new Error('Falha no envio para WhatsApp');
      }
  
      // Feedback ao usuário
      alert('Mensagem enviada com sucesso!');
      e.target.reset();
  
    } catch (error) {
      console.error('Erro:', error);
      alert(`Erro: ${error.message || 'Tente novamente mais tarde'}`);
    }
  });