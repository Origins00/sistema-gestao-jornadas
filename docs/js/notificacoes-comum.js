/*
 * Mantém o acesso à central de notificações no cabeçalho
 * e o contador de avisos pendentes atualizado.
 */


function usuarioPodeAcessarNotificacoes() {

    const usuario =
        obterUsuarioSalvo();

    return usuario?.tipo_usuario ===
        "ADMINISTRADOR";

}


function removerNotificacoesDosAtalhos() {

    document
        .querySelectorAll(
            '.navegacao-area-administrativa [href="notificacoes.html"]'
        )
        .forEach(
            link => link.remove()
        );

}


function garantirBotaoNotificacoesCabecalho() {

    if (!usuarioPodeAcessarNotificacoes()) {

        return;

    }

    const usuarioCabecalho =
        document.querySelector(
            ".usuario-cabecalho"
        );

    if (
        !usuarioCabecalho ||
        usuarioCabecalho.querySelector(
            ".botao-notificacoes-cabecalho"
        )
    ) {

        return;

    }

    const botao =
        document.createElement(
            "a"
        );

    botao.href =
        "notificacoes.html";

    botao.className =
        "botao-notificacoes-cabecalho";

    botao.setAttribute(
        "aria-label",
        "Notificações: nenhuma pendente"
    );

    botao.title =
        "Notificações";

    const paginaNotificacoes =
        window.location.pathname
            .replace(/\\/g, "/")
            .endsWith(
                "/paginas/notificacoes.html"
            );

    if (paginaNotificacoes) {

        botao.classList.add(
            "ativo"
        );

        botao.setAttribute(
            "aria-current",
            "page"
        );

    }

    botao.innerHTML = `
        <svg
            class="icone-sistema"
            aria-hidden="true"
            focusable="false"
        >
            <use href="../icones/bootstrap-icons.svg#bell-fill"></use>
        </svg>

        <span
            class="botao-notificacoes-cabecalho__contador"
            data-contador-notificacoes
            hidden
        >
            0
        </span>
    `;

    const avatar =
        usuarioCabecalho.querySelector(
            ".usuario-cabecalho__avatar"
        );

    usuarioCabecalho.insertBefore(
        botao,
        avatar || null
    );

}


function garantirLinkRelatorios() {

    if (!usuarioPodeAcessarNotificacoes()) {

        return;

    }

    const navegacao =
        document.querySelector(
            ".navegacao-area-administrativa"
        );

    if (
        !navegacao ||
        navegacao.querySelector(
            '[href="relatorios.html"]'
        )
    ) {

        return;

    }

    const link =
        document.createElement(
            "a"
        );

    link.href =
        "relatorios.html";

    link.className =
        "item-area-administrativa";

    link.innerHTML = `
        <svg
            class="icone-sistema"
            aria-hidden="true"
            focusable="false"
        >
            <use href="../icones/bootstrap-icons.svg#file-earmark-spreadsheet-fill"></use>
        </svg>

        Relatórios
    `;

    navegacao.appendChild(
        link
    );

}


function atualizarContadoresNotificacoes(
    quantidade
) {

    document
        .querySelectorAll(
            "[data-contador-notificacoes]"
        )
        .forEach(
            contador => {

                contador.textContent =
                    quantidade > 99
                        ? "99+"
                        : String(quantidade);

                contador.hidden =
                    quantidade === 0;

                const botao =
                    contador.closest(
                        ".botao-notificacoes-cabecalho"
                    );

                if (botao) {

                    botao.setAttribute(
                        "aria-label",
                        quantidade === 0
                            ? "Notificações: nenhuma pendente"
                            : `Notificações: ${quantidade} ${quantidade === 1
                                ? "pendente"
                                : "pendentes"
                            }`
                    );

                }

            }
        );

}


async function consultarContadorNotificacoes() {

    if (
        !usuarioEstaAutenticado() ||
        !usuarioPodeAcessarNotificacoes()
    ) {

        return;

    }

    try {

        const resposta =
            await requisicaoApi(
                (
                    "/administracao/notificacoes" +
                    "?filtro=PENDENTES"
                ),
                {
                    method: "GET"
                }
            );

        atualizarContadoresNotificacoes(
            resposta.resumo
                ?.quantidade_pendentes || 0
        );

    } catch (erro) {

        if (
            erro.status !== 401 &&
            erro.status !== 403
        ) {

            console.error(
                "Erro ao atualizar notificações:",
                erro
            );

        }

    }

}


removerNotificacoesDosAtalhos();

garantirBotaoNotificacoesCabecalho();

garantirLinkRelatorios();

consultarContadorNotificacoes();
