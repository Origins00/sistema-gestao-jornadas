/*
 * Centraliza as requisições feitas para o FastAPI.
 */


class ErroApi extends Error {

    constructor(
        mensagem,
        status,
        dados = null
    ) {

        super(mensagem);

        this.name = "ErroApi";

        this.status = status;

        this.dados = dados;

    }

}


const NOME_COOKIE_CSRF =
    "gestor_jornadas_csrf";

const METODOS_SEGUROS = new Set([
    "GET",
    "HEAD",
    "OPTIONS"
]);


function obterCookie(nome) {

    const prefixo = `${nome}=`;

    const item = document.cookie
        .split(";")
        .map(valor => valor.trim())
        .find(valor => valor.startsWith(prefixo));

    if (!item) {
        return null;
    }

    return decodeURIComponent(
        item.slice(prefixo.length)
    );

}


async function garantirTokenCsrf() {

    const tokenExistente = obterCookie(
        NOME_COOKIE_CSRF
    );

    if (tokenExistente) {
        return tokenExistente;
    }

    const resposta = await fetch(
        `${CONFIGURACAO.URL_API}/autenticacao/csrf`,
        {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        }
    );

    if (!resposta.ok) {
        throw new ErroApi(
            "Não foi possível preparar a proteção da solicitação.",
            resposta.status
        );
    }

    const dados = await resposta.json();

    return obterCookie(NOME_COOKIE_CSRF) ||
        dados.token_csrf;

}


function montarMensagemErroValidacao(detalhes) {

    if (!Array.isArray(detalhes)) {

        return null;

    }

    const mensagens = detalhes.map(
        detalhe => detalhe.msg
    );

    return mensagens.join(" ");
}


async function requisicaoApi(
    caminho,
    opcoes = {}
) {

    if (
        window.MODO_DEMONSTRACAO &&
        typeof window.requisicaoApiDemonstracao ===
            "function"
    ) {
        return window.requisicaoApiDemonstracao(
            caminho,
            opcoes
        );
    }

    const cabecalhos = new Headers(
        opcoes.headers || {}
    );

    const metodo = (
        opcoes.method || "GET"
    ).toUpperCase();

    if (
        opcoes.body &&
        !cabecalhos.has("Content-Type")
    ) {

        cabecalhos.set(
            "Content-Type",
            "application/json"
        );

    }

    if (!METODOS_SEGUROS.has(metodo)) {

        cabecalhos.set(
            "X-CSRF-Token",
            await garantirTokenCsrf()
        );

    }

    let resposta;

    try {

        resposta = await fetch(
            `${CONFIGURACAO.URL_API}${caminho}`,
            {
                ...opcoes,
                method: metodo,
                headers: cabecalhos,
                credentials: "include"
            }
        );

    } catch (erro) {

        console.error(
            "Erro de conexão com a API:",
            erro
        );

        throw new ErroApi(
            "Não foi possível conectar ao servidor. Confira se o backend está funcionando.",
            0
        );

    }

    const textoResposta = await resposta.text();

    let dadosResposta = null;

    if (textoResposta) {

        try {

            dadosResposta = JSON.parse(
                textoResposta
            );

        } catch {

            dadosResposta = {
                mensagem: textoResposta
            };

        }

    }

    if (!resposta.ok) {

        let mensagemErro =
            dadosResposta?.detail ||
            dadosResposta?.mensagem ||
            "Não foi possível concluir a operação.";

        const trocaSenhaObrigatoria =
            resposta.status === 403 &&
            typeof dadosResposta?.detail ===
                "string" &&
            dadosResposta.detail.includes(
                "senha provisória"
            );

        if (trocaSenhaObrigatoria) {

            const usuarioSalvo =
                obterUsuarioSalvo();

            if (usuarioSalvo) {

                usuarioSalvo.precisa_trocar_senha =
                    true;

                localStorage.setItem(
                    CHAVES_SESSAO.USUARIO,
                    JSON.stringify(
                        usuarioSalvo
                    )
                );

            }

            const paginaPerfil =
                window.location.pathname
                    .replace(
                        /\\/g,
                        "/"
                    )
                    .endsWith(
                        "/paginas/perfil.html"
                    );

            if (!paginaPerfil) {

                window.location.replace(
                    "perfil.html"
                );

            }

        }

        const mensagemValidacao =
            montarMensagemErroValidacao(
                dadosResposta?.detail
            );

        if (mensagemValidacao) {

            mensagemErro = mensagemValidacao;

        }

        throw new ErroApi(
            mensagemErro,
            resposta.status,
            dadosResposta
        );

    }

    return dadosResposta;

}
