/*
 * Configurações principais utilizadas pelo front-end.
 */

const NOME_SERVIDOR_LOCAL =
    window.location.hostname === "localhost"
        ? "localhost"
        : "127.0.0.1";

const ENDERECO_SERVIDOR_LOCAL =
    `http://${NOME_SERVIDOR_LOCAL}:8000`;

const CAMINHO_PUBLICACAO_DEMONSTRACAO =
    window.location.hostname.endsWith("github.io")
        ? "/sistema-gestao-jornadas"
        : "";

window.MODO_DEMONSTRACAO = true;

const PAGINA_ABERTA_COMO_ARQUIVO =
    window.location.protocol === "file:";

if (PAGINA_ABERTA_COMO_ARQUIVO) {

    /*
     * Um HTML aberto diretamente pela pasta usa o protocolo file:// e não
     * consegue funcionar como servidor. Encaminhamos para a cópia entregue
     * pelo FastAPI, preservando a facilidade de abrir pelo index.html.
     */
    window.location.replace(
        `${ENDERECO_SERVIDOR_LOCAL}/`
    );

}

const CONFIGURACAO = Object.freeze({

    URL_API:
        `${window.location.origin}${CAMINHO_PUBLICACAO_DEMONSTRACAO}`,

    TEMPO_REDIRECIONAMENTO: 700

});
