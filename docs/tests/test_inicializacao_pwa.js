const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");


const codigo = fs.readFileSync(
    path.resolve(
        __dirname,
        "../js/inicializacao-pwa.js"
    ),
    "utf8"
);


function executarInicializacao(usuario, conectado = true) {
    const destinos = [];
    const contexto = {
        CONFIGURACAO: {
            URL_API: "https://app.gestor-jornadas.example"
        },
        navigator: {
            onLine: conectado
        },
        obterUsuarioSalvo: () => usuario,
        URL,
        window: {
            location: {
                replace: destino => destinos.push(destino)
            }
        }
    };

    vm.runInNewContext(codigo, contexto);
    return destinos;
}


assert.deepEqual(executarInicializacao(null), []);

assert.deepEqual(
    executarInicializacao({
        id_usuario: 1,
        precisa_trocar_senha: false
    }),
    ["https://app.gestor-jornadas.example/paginas/inicio.html"]
);

assert.deepEqual(
    executarInicializacao({
        id_usuario: 2,
        precisa_trocar_senha: false
    }, false),
    ["https://app.gestor-jornadas.example/paginas/inicio.html"]
);

assert.deepEqual(
    executarInicializacao({
        id_usuario: 3,
        precisa_trocar_senha: true
    }, false),
    []
);

console.log(
    "Inicializacao do PWA com sessao lembrada: testes aprovados."
);
