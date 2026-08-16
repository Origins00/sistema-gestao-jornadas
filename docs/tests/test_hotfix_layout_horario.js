const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");


function lerArquivo(caminho) {
    return fs.readFileSync(
        path.resolve(__dirname, caminho),
        "utf8"
    );
}


const paginaHoje = lerArquivo("../paginas/inicio.html");
const comportamentoHoje = lerArquivo("../js/inicio.js");
const estilosBase = lerArquivo("../css/estilo.css");
const estilosResponsivos = lerArquivo("../css/responsivo.css");
const estilosCadastro = lerArquivo("../css/cadastro.css");

assert.match(
    paginaHoje,
    /id="horario-registro"[\s\S]*inputmode="numeric"/
);
assert.match(
    paginaHoje,
    /for="horario-registro"/
);
assert.doesNotMatch(paginaHoje, /id="hora-registro"/);
assert.doesNotMatch(paginaHoje, /id="minuto-registro"/);
assert.match(comportamentoHoje, /montarHorarioDigitado/);
assert.match(comportamentoHoje, /"beforeinput"[\s\S]*tratarRemocaoHorario/);
assert.match(comportamentoHoje, /removerUltimoDigitoHorario/);
assert.doesNotMatch(comportamentoHoje, /campoHoraRegistro/);
assert.match(estilosBase, /\.pagina-login[\s\S]*overflow-x:\s*clip/);
assert.match(estilosResponsivos, /\.painel-formulario[\s\S]*overflow-x:\s*clip/);
assert.match(estilosCadastro, /\.painel-formulario-cadastro[\s\S]*overflow-x:\s*clip/);

console.log("Hotfix de layout público e horário único: testes aprovados.");
