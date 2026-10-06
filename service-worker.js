const CACHE_NAME = "cuidado-puro-v1";

// Paths relative to the service worker location (root of static)
const ARQUIVOS_INICIAIS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/telaLogin.css",
  "./css/telaescolha.css",
  "./css/sobre.css",
  "./css/beneficios.css",
  "./css/opinioes.css",
  "./css/contato.css",
  "./js/config.js",
  "./js/scripts.js",
  "./js/pwa.js",
  "./js/login.js",
  "./telas/sobre.html",
  "./telas/beneficios.html",
  "./telas/opinioes.html",
  "./telas/contato.html",
  "./telas/telaLogin.html",
  "./telas/telaescolha.html",
  "./telas/img/pwa-icon-192.png",
  "./telas/img/pwa-icon-512.png",
  "./telas/img/logo_(2).png",
  "./telas/img/logo.png",
  "./offline.html"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_INICIAIS).catch((err) => {
        console.warn("Alguns arquivos não entraram no cache:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomesDosCaches) => {
      return Promise.all(
        nomesDosCaches
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  const url = new URL(requisicao.url);

  // Não cacheia API / login / cadastro
  if (
    url.pathname.startsWith("/api/") ||
    ["/Login", "/Clientes", "/Profissionais"].includes(url.pathname) ||
    url.pathname.includes("/Login") ||
    url.pathname.includes("/Clientes") ||
    url.pathname.includes("/Profissionais")
  ) {
    return;
  }

  // Network-first com fallback para cache (e página offline)
  evento.respondWith(
    fetch(requisicao)
      .then((resposta) => {
        if (requisicao.method === "GET" && resposta && resposta.status === 200 && resposta.type === "basic") {
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(requisicao, copia);
          });
        }
        return resposta;
      })
      .catch(() => {
        return caches.match(requisicao).then((cached) => {
          if (cached) return cached;
          // Fallback para navegação offline
          if (requisicao.mode === "navigate") {
            return caches.match("./offline.html") || caches.match("./index.html");
          }
          return undefined;
        });
      })
  );
});
