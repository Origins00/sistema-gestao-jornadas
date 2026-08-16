const assert = require("node:assert/strict");
const path = require("node:path");


function criarArmazenamento() {
    const itens = new Map();

    return {
        getItem(chave) {
            return itens.has(chave) ? itens.get(chave) : null;
        },
        setItem(chave, valor) {
            itens.set(chave, String(valor));
        }
    };
}


global.localStorage = criarArmazenamento();
global.window = {
    crypto: {
        randomUUID: (() => {
            let sequencia = 0;
            return () => {
                sequencia += 1;
                return `00000000-0000-4000-8000-${String(
                    sequencia
                ).padStart(12, "0")}`;
            };
        })()
    }
};

require(path.resolve(
    __dirname,
    "../js/sincronizacao-offline.js"
));

const fila = window.SINCRONIZACAO_OFFLINE;
const dataJornada = "2026-08-10";

const etapas = [
    ["ENTRADA", "07:00"],
    ["INICIO_ALMOCO", "11:00"],
    ["FIM_ALMOCO", "12:00"],
    ["SAIDA", "16:00"]
];

for (const [tipoRegistro, horario] of etapas) {
    fila.registrarHorario(1, {
        data_jornada: dataJornada,
        tipo_registro: tipoRegistro,
        horario_informado: horario,
        origem_registro: "HORARIO_ATUAL",
        tipo_trabalho_inicio: "ADMINISTRATIVO",
        tipo_trabalho_apos_almoco:
            tipoRegistro === "FIM_ALMOCO" ? "ADMINISTRATIVO" : null,
        atividade_do_dia:
            tipoRegistro === "SAIDA" ? "Visita externa" : null
    });
}

assert.equal(fila.quantidadePendencias(1), 4);
assert.equal(fila.quantidadePendencias(2), 0);

const jornada = fila.obterJornada(1, dataJornada);
assert.deepEqual(jornada.horarios, {
    entrada: "07:00",
    inicio_almoco: "11:00",
    fim_almoco: "12:00",
    saida: "16:00"
});
assert.equal(jornada.jornada.situacao_jornada, "CONCLUIDA");

(async () => {
    const recebidas = [];
    const resultado = await fila.sincronizarPendencias(
        1,
        async operacao => {
            recebidas.push(operacao.tipo_registro);
            return { situacao: "SINCRONIZADO" };
        }
    );

    assert.deepEqual(recebidas, etapas.map(item => item[0]));
    assert.equal(resultado.sincronizadas, 4);
    assert.equal(resultado.restantes, 0);
    assert.equal(fila.quantidadePendencias(1), 0);

    console.log("Fila offline: testes concluidos com sucesso.");
})().catch(erro => {
    console.error(erro);
    process.exitCode = 1;
});
