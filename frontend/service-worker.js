const PREFIXO_CACHE = "gestor-jornadas-";
const CACHE_ESTATICO = `${PREFIXO_CACHE}estaticos-v8`;
const PAGINA_OFFLINE = "/offline.html";
const PAGINA_LOGIN = "/index.html";
const PAGINA_JORNADA = "/paginas/inicio.html";

const ARQUIVOS_INICIAIS = [
    PAGINA_OFFLINE,
    PAGINA_LOGIN,
    "/manifest.webmanifest",
    "/imagens/logo-gestor-jornadas.svg",
    "/imagens/pwa/icone-192.png",
    "/imagens/pwa/icone-512.png",
    "/icones/bootstrap-icons.svg",
    "/icones/icones-operacao.svg",
    "/css/estilo.css",
    "/css/componentes.css",
    "/css/responsivo.css",
    "/css/tela-hoje.css?v=20260801-3",
    "/css/navegacao.css?v=20260801-2",
    "/js/pwa.js",
    "/js/configuracao.js",
    "/js/autenticacao.js",
    "/js/autenticacao.js?v=20260801-2",
    "/js/api.js",
    "/js/inicializacao-pwa.js",
    "/js/login.js",
    "/js/notificacoes-comum.js?v=20260801-3",
    "/js/horario-jornada.js",
    "/js/sincronizacao-offline.js",
    "/js/inicio.js",
    "/js/offline.js",
    PAGINA_JORNADA
];

function recursoEstatico(caminho) {

    return [
        "/css/",
        "/js/",
        "/imagens/",
        "/icones/"
    ].some(prefixo => caminho.startsWith(prefixo)) ||
        caminho === "/manifest.webmanifest";

}

self.addEventListener("install", evento => {

    evento.waitUntil(
        caches.open(CACHE_ESTATICO)
            .then(cache => cache.addAll(ARQUIVOS_INICIAIS))
            .then(() => self.skipWaiting())
    );

});

self.addEventListener("activate", evento => {

    evento.waitUntil(
        caches.keys()
            .then(nomes => Promise.all(
                nomes
                    .filter(nome =>
                        nome.startsWith(PREFIXO_CACHE) &&
                        nome !== CACHE_ESTATICO
                    )
                    .map(nome => caches.delete(nome))
            ))
            .then(() => self.clients.claim())
    );

});

self.addEventListener("fetch", evento => {

    const requisicao = evento.request;

    if (requisicao.method !== "GET") {
        return;
    }

    const endereco = new URL(requisicao.url);

    if (endereco.origin !== self.location.origin) {
        return;
    }

    /*
     * As páginas de entrada e Hoje são estruturas estáticas: podem ser
     * guardadas para iniciar o PWA e registrar offline. Respostas autenticadas
     * da API continuam fora do cache. As demais páginas recebem a tela neutra.
     */
    if (requisicao.mode === "navigate") {

        const paginaLogin = [
            "/",
            PAGINA_LOGIN
        ].includes(endereco.pathname);

        const paginaDeContingencia = paginaLogin
            ? PAGINA_LOGIN
            : endereco.pathname === PAGINA_JORNADA
                ? PAGINA_JORNADA
                : PAGINA_OFFLINE;

        evento.respondWith(
            fetch(requisicao, { cache: "no-store" })
                .then(async resposta => {

                    if (
                        (
                            paginaLogin ||
                            endereco.pathname === PAGINA_JORNADA
                        ) &&
                        resposta.ok
                    ) {
                        const cache = await caches.open(
                            CACHE_ESTATICO
                        );
                        await cache.put(
                            paginaLogin
                                ? PAGINA_LOGIN
                                : PAGINA_JORNADA,
                            resposta.clone()
                        );
                    }

                    return resposta;

                })
                .catch(() => caches.match(
                    paginaDeContingencia
                ))
        );

        return;

    }

    /*
     * Apenas diretórios públicos de CSS, JavaScript, imagens e ícones são
     * elegíveis. Endpoints da API não passam por este bloco.
     */
    if (!recursoEstatico(endereco.pathname)) {
        return;
    }

    /*
     * A rede tem prioridade para evitar servir CSS ou JavaScript antigo após
     * uma atualização. O cache é usado somente se o servidor não responder.
     */
    evento.respondWith(
        fetch(requisicao)
            .then(async resposta => {

                if (resposta.ok && resposta.type === "basic") {

                    const cache = await caches.open(CACHE_ESTATICO);
                    await cache.put(requisicao, resposta.clone());

                }

                return resposta;

            })
            .catch(async () => {

                const cache = await caches.open(CACHE_ESTATICO);
                return cache.match(requisicao);

            })
    );

});
