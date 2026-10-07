if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Verifica se a página atual está dentro da subpasta 'telas'
    const estaEmSubpasta = window.location.pathname.includes("/telas/");
    const swPath = estaEmSubpasta ? "../service-worker.js" : "./service-worker.js";

    navigator.serviceWorker
      .register(swPath)
      .then((registro) => {
        console.log("PWA ativada com sucesso no escopo:", registro.scope);
      })
      .catch((erro) => {
        console.error("Não foi possível registrar a PWA:", erro);
      });
  });
}

// === CÓDIGO DO MENU MOBILE ===
document.addEventListener('DOMContentLoaded', () => {
  const btnMenu = document.getElementById('btn-menu');
  const navLinks = document.querySelector('.nav-links');

  if (btnMenu && navLinks) {
    btnMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      btnMenu.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !btnMenu.contains(e.target)) {
        navLinks.classList.remove('active');
        btnMenu.textContent = '☰';
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        btnMenu.textContent = '☰';
      });
    });
  }
});
