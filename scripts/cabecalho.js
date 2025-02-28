
window.addEventListener('scroll', function() {
    const cabecalho = document.getElementById('cabecalho');
    const alturaMudanca = 200; // Altura a partir da qual o fundo muda (em pixels)

    if (window.scrollY > alturaMudanca) {
        cabecalho.classList.add('mudar-fundo'); // Adiciona a classe
    } else {
        cabecalho.classList.remove('mudar-fundo'); // Remove a classe
    }
});