const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");


const codigo = fs.readFileSync(
    path.resolve(__dirname, "../service-worker.js"),
    "utf8"
);

assert.match(codigo, /estaticos-v8/);

const eventos = {};
const correspondencias = [];
let arquivosInstalacao = [];

const contexto = {
    URL,
    Promise,
    fetch: async () => {
        throw new Error("Servidor indisponivel no teste.");
    },
    caches: {
        async open() {
            return {
                async addAll(arquivos) {
                    arquivosInstalacao = [...arquivos];
                },
                async put() {}
            };
        },
        async keys() {
            return [];
        },
        async delete() {},
        async match(caminho) {
            correspondencias.push(caminho);
            return caminho;
        }
    },
    self: {
        location: {
            origin: "https://app.gestor-jornadas.example"
        },
        addEventListener(nome, tratador) {
            eventos[nome] = tratador;
        },
        async skipWaiting() {},
        clients: {
            async claim() {}
        }
    }
};

vm.runInNewContext(codigo, contexto);

let instalacao;
eventos.install({
    waitUntil(promessa) {
        instalacao = promessa;
    }
});

(async () => {
    await instalacao;

    assert.ok(arquivosInstalacao.includes("/index.html"));
    assert.ok(arquivosInstalacao.includes("/paginas/inicio.html"));
    assert.ok(arquivosInstalacao.includes("/js/inicializacao-pwa.js"));
    assert.ok(arquivosInstalacao.includes("/js/horario-jornada.js"));

    async function navegar(caminho) {
        let resposta;

        eventos.fetch({
            request: {
                method: "GET",
                mode: "navigate",
                url: `https://app.gestor-jornadas.example${caminho}`
            },
            respondWith(promessa) {
                resposta = promessa;
            }
        });

        return resposta;
    }

    assert.equal(await navegar("/"), "/index.html");
    assert.equal(
        await navegar("/paginas/inicio.html"),
        "/paginas/inicio.html"
    );
    assert.equal(
        await navegar("/paginas/historico.html"),
        "/offline.html"
    );

    assert.deepEqual(correspondencias, [
        "/index.html",
        "/paginas/inicio.html",
        "/offline.html"
    ]);

    console.log(
        "Service worker: inicializacao offline aprovada."
    );
})().catch(erro => {
    console.error(erro);
    process.exitCode = 1;
});
