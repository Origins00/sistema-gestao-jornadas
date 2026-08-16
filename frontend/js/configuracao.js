/*
 * Configurações principais utilizadas pelo front-end.
 */

const NOME_SERVIDOR_LOCAL =
    window.location.hostname === "localhost"
        ? "localhost"
        : "127.0.0.1";

const ENDERECO_SERVIDOR_LOCAL =
    `http://${NOME_SERVIDOR_LOCAL}:8000`;

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

    URL_API: PAGINA_ABERTA_COMO_ARQUIVO ||
        ["5500", "5501"].includes(
            window.location.port
        )
        ? ENDERECO_SERVIDOR_LOCAL
        : window.location.origin,

    TEMPO_REDIRECIONAMENTO: 700

});
