document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.repertorio-right-content .first-imagem-repertorio');
    const leftButton = document.querySelector('.first-slide-left-button');
    const rightButton = document.querySelector('.first-slide-right-button');
    const pointers = document.querySelectorAll('.first-slide-pointer');
    let currentIndex = 0;

    function updateSlide(index) {
        images.forEach((img, i) => {
            img.classList.toggle('first-imagem-repertorio-ativo', i === index);
            pointers[i].classList.toggle('first-slide-pointer-ativo', i === index);
        });
    }

    leftButton.addEventListener('click', function() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        updateSlide(currentIndex);
    });

    rightButton.addEventListener('click', function() {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        updateSlide(currentIndex);
    });

    pointers.forEach((pointer, index) => {
        pointer.addEventListener('click', function() {
            currentIndex = index;
            updateSlide(currentIndex);
        });
    });

    // Initialize the first slide
    updateSlide(currentIndex);
});



window.addEventListener('scroll', function() {
    const cabecalho = document.getElementById('cabecalho');
    const alturaMudanca = 500; // Altura a partir da qual o fundo muda (em pixels)

    if (window.scrollY > alturaMudanca) {
        cabecalho.classList.add('mudar-fundo'); // Adiciona a classe
    } else {
        cabecalho.classList.remove('mudar-fundo'); // Remove a classe
    }
});