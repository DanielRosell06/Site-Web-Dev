document.addEventListener('DOMContentLoaded', function() {
    const repertorios = document.querySelectorAll('.repertorio');

    repertorios.forEach(repertorio => {
        const images = repertorio.querySelectorAll('.first-imagem-repertorio');
        const leftButton = repertorio.querySelector('.first-slide-left-button');
        const rightButton = repertorio.querySelector('.first-slide-right-button');
        const pointers = repertorio.querySelectorAll('.first-slide-pointer');
        let currentIndex = 0;

        function updateSlide(index) {
            images.forEach((img, i) => {
                img.classList.toggle('first-imagem-repertorio-ativo', i === index);
            });
            pointers.forEach((pointer, i) => {
                pointer.classList.toggle('first-slide-pointer-ativo', i === index);
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
});