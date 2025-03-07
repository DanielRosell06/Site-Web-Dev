
window.addEventListener('scroll', function() {
    const cabecalho = document.getElementById('cabecalho');
    const alturaMudanca = 200; // Altura a partir da qual o fundo muda (em pixels)

    if (window.scrollY > alturaMudanca) {
        cabecalho.classList.add('mudar-fundo'); // Adiciona a classe
    } else {
        cabecalho.classList.remove('mudar-fundo'); // Remove a classe
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Remove a classe 'active' de todos os links
            navLinks.forEach(link => link.classList.remove('active'));

            // Adiciona a classe 'active' ao link clicado
            this.classList.add('active');
        });
    });
});

