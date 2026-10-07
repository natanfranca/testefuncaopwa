if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Registra o Service Worker buscando a partir da raiz do repositório
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registro) => {
        console.log("PWA ativada no escopo:", registro.scope);
      })
      .catch(() => {
        // Fallback caso esteja em uma subpasta (como /telas/)
        navigator.serviceWorker
          .register("../service-worker.js")
          .then((registro) => console.log("PWA ativada (subpasta):", registro.scope))
          .catch((erro) => console.error("Não foi possível registrar a PWA:", erro));
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
