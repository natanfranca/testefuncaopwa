# Cuidado Puro – PWA pronta para testar no celular

## O que já está incluído

- `manifest.webmanifest` (nome, ícones, tema roxo #2e008b)
- Ícones 192 e 512 (e maskable)
- `service-worker.js` com cache da interface + página offline
- `js/pwa.js` (registro automático do service worker)
- Tags Apple/Android em todas as páginas HTML
- Página `offline.html` quando não houver rede

## Forma mais fácil de testar no celular (recomendado)

### Opção 1 – Deploy rápido no Render / Netlify / Cloudflare Pages (HTTPS)

1. Extraia este ZIP.
2. Publique a pasta `static_copia` como site estático (HTTPS).
3. No celular, abra a URL HTTPS.
4. No Chrome (Android): menu → "Adicionar à tela inicial" ou o ícone de instalação.
5. No Safari (iPhone): Compartilhar → "Adicionar à Tela de Início".

### Opção 2 – Teste na mesma rede Wi-Fi (computador + celular)

1. No computador, entre na pasta `static_copia` e rode:
   ```bash
   python -m http.server 8080
   ```
2. Descubra o IP do computador na rede (ex.: 192.168.0.15).
   - Windows: `ipconfig`
   - Mac/Linux: `ip a` ou `ifconfig`
3. No celular (mesma Wi-Fi), abra:
   ```
   http://SEU_IP:8080
   ```
4. **Atenção:** em HTTP puro o Chrome/Android às vezes não mostra o botão de instalar.
   Para instalação completa use a Opção 3 (túnel HTTPS).

### Opção 3 – Túnel HTTPS gratuito (melhor para instalar de verdade)

No computador, com a pasta `static_copia` servindo em 8080:

```bash
npx --yes localtunnel --port 8080
```

ou

```bash
npx --yes serve -l 8080
# em outro terminal:
npx --yes cloudflared tunnel --url http://localhost:8080
```

Abra a URL HTTPS gerada no celular. Aí o navegador deve oferecer instalação.

## Checklist no celular

- [ ] Página abre sem erros
- [ ] Ícone e nome "Cuidado Puro" aparecem na instalação
- [ ] App abre em tela cheia (sem barra do navegador)
- [ ] Depois de visitar a home, ative o modo avião → a home ainda carrega
- [ ] Login e listas de pacientes/profissionais **precisam de internet** (esperado)

## Com o backend FastAPI

Substitua a pasta `static` do projeto backend por esta `static_copia` (ou copie o conteúdo).

O `main.py` já monta:

```python
app.mount("/", StaticFiles(directory="static", html=True), name="static")
```

Publique no Render com HTTPS. O celular acessa a URL do Render e instala normalmente.

## Cores e identidade

- Tema: `#2e008b`
- Fundo: branco
- Nome curto: Cuidado Puro

## Observação de segurança (do guia original)

Antes de uso real com pacientes:
- Troque senhas expostas
- Use hash (bcrypt/argon2) para senhas
- Não cacheie dados de saúde no service worker
