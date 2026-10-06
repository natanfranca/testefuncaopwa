if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Registra o Service Worker dinamicamente sem usar a barra '/' que quebra no GitHub Pages
    const swUrl = new URL("../service-worker.js", import.meta.url || window.location.href).href;

    navigator.serviceWorker
      .register(swUrl)
      .then((registro) => {
        console.log("PWA ativada no escopo:", registro.scope);
      })
      .catch((erro) => {
        // Tenta fallback com caminho relativo direto
        navigator.serviceWorker
          .register("./service-worker.js")
          .catch((e) => console.error("Não foi possível registrar a PWA:", e));
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
