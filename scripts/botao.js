  
  // Script adicional para funcionamento do botão Voltar ao Topo 
  // Botão voltar ao topo
  const backToTopButton = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
          backToTopButton.classList.add('show');
      } else {
          backToTopButton.classList.remove('show');
      }
  });