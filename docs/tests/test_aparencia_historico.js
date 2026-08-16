const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");


function lerArquivo(caminho) {
    return fs.readFileSync(
        path.resolve(__dirname, caminho),
        "utf8"
    );
}


const pagina = lerArquivo("../paginas/historico.html");
const estilos = lerArquivo("../css/historico.css");
const comportamento = lerArquivo("../js/historico.js");

assert.match(
    pagina,
    /id="campo-novo-horario"[\s\S]*inputmode="numeric"/
);
assert.doesNotMatch(
    pagina,
    /type="time"/
);
assert.match(
    pagina,
    /horario-jornada\.js[\s\S]*historico\.js/
);
assert.match(
    comportamento,
    /montarHorarioDigitado\([\s\S]*campoNovoHorario\.value/
);
assert.match(
    comportamento,
    /"beforeinput"[\s\S]*tratarRemocaoNovoHorario/
);
assert.match(
    pagina,
    /id="indicador-conexao"[\s\S]*class="indicador-conexao"/
);
assert.doesNotMatch(comportamento, /textoIndicadorConexao/);
assert.match(
    comportamento,
    /indicadorConexao\.textContent\s*=\s*[\s\S]*"Sistema conectado"[\s\S]*"Sem conexão"/
);
assert.match(
    comportamento,
    /indicadorConexao\.classList\.toggle\([\s\S]*"sem-conexao"/
);
assert.match(
    pagina,
    /marcador-legenda incompleta[\s\S]*Jornada incompleta/
);
assert.match(
    estilos,
    /\.marcador-legenda\.incompleta[\s\S]*background:\s*#d89614/
);
assert.match(
    estilos,
    /\.botao-dia-calendario\.selecionado\.hoje[\s\S]*border-color:\s*var\(--cor-verde-500\)/
);
assert.match(
    comportamento,
    /Criar jornada neste dia/
);
assert.match(
    pagina,
    /id="formulario-criacao-jornada"[\s\S]*id="horario-entrada-historico"[\s\S]*inputmode="numeric"/
);
assert.equal(
    (pagina.match(/placeholder="--:--"/g) || []).length,
    4
);
assert.match(
    comportamento,
    /"\/jornadas\/historica"[\s\S]*method:\s*"POST"/
);
assert.match(
    comportamento,
    /horarios\.every\([\s\S]*entrada, almoço, retorno e saída/
);
assert.match(
    estilos,
    /\.painel-criacao-jornada[\s\S]*\.grade-horarios-criacao/
);

console.log("Histórico: padronização visual aprovada.");
