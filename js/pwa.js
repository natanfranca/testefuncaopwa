if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // relative path works whether served at / or /static/
    const swPath = new URL("service-worker.js", window.location.href).pathname;
    // Prefer root-relative when possible
    const registerPath = "/service-worker.js";
    navigator.serviceWorker
      .register(registerPath)
      .then((registro) => {
        console.log("PWA ativada:", registro.scope);
      })
      .catch((erro) => {
        // fallback relative
        navigator.serviceWorker
          .register("./service-worker.js")
          .then((r) => console.log("PWA ativada (relativo):", r.scope))
          .catch((e) => console.error("Não foi possível registrar a PWA:", e));
      });
  });
}
