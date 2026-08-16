const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");


function lerArquivo(caminho) {
    return fs.readFileSync(
        path.resolve(__dirname, caminho),
        "utf8"
    );
}


const pagina = lerArquivo("../paginas/relatorios.html");
const comportamento = lerArquivo("../js/relatorios.js");
const estilos = lerArquivo("../css/relatorios.css");

assert.match(
    pagina,
    /data-estilo-excel="colorido"/
);
assert.match(
    pagina,
    /data-estilo-excel="preto_branco"/
);
assert.match(
    pagina,
    /Preto e branco[\s\S]*menor gasto de tinta/
);
assert.match(
    comportamento,
    /estilo:\s*estiloSelecionado/
);
assert.match(
    comportamento,
    /nomeEstilo[\s\S]*preto-e-branco/
);
assert.match(
    comportamento,
    /alternarMenuExportacaoExcel/
);
assert.match(
    estilos,
    /\.menu-exportacao-excel[\s\S]*position:\s*absolute/
);
assert.match(
    estilos,
    /\.menu-exportacao-excel\[hidden\][\s\S]*display:\s*none/
);

console.log(
    "Seletor de exportação Excel: testes aprovados."
);
