/*
 * Funções responsáveis por guardar e recuperar
 * os dados da sessão no navegador.
 */

const CHAVES_SESSAO = Object.freeze({

    TOKEN_LEGADO: "gestor_jornadas_token",

    USUARIO: "gestor_jornadas_usuario"

});


// Remove imediatamente credenciais gravadas por versões anteriores.
localStorage.removeItem(
    CHAVES_SESSAO.TOKEN_LEGADO
);


function salvarSessao(dadosLogin) {

    localStorage.removeItem(
        CHAVES_SESSAO.TOKEN_LEGADO
    );

    localStorage.setItem(
        CHAVES_SESSAO.USUARIO,
        JSON.stringify(dadosLogin.usuario)
    );

}


function obterUsuarioSalvo() {

    const usuarioSalvo = localStorage.getItem(
        CHAVES_SESSAO.USUARIO
    );

    if (!usuarioSalvo) {

        return null;

    }

    try {

        return JSON.parse(usuarioSalvo);

    } catch (erro) {

        console.error(
            "Não foi possível recuperar o usuário salvo:",
            erro
        );

        limparSessao();

        return null;

    }

}


function usuarioEstaAutenticado() {

    return Boolean(
        obterUsuarioSalvo()
    );

}


function limparSessao() {

    localStorage.removeItem(
        CHAVES_SESSAO.TOKEN_LEGADO
    );

    localStorage.removeItem(
        CHAVES_SESSAO.USUARIO
    );

}


function redirecionarParaTrocaSenhaSeNecessario() {

    const usuario = obterUsuarioSalvo();

    if (
        !usuario?.precisa_trocar_senha
    ) {

        return false;

    }

    const caminhoAtual =
        window.location.pathname
            .replace(
                /\\/g,
                "/"
            );

    const paginaInterna =
        caminhoAtual.includes(
            "/paginas/"
        );

    const paginaPerfil =
        caminhoAtual.endsWith(
            "/paginas/perfil.html"
        );

    if (
        !paginaInterna ||
        paginaPerfil
    ) {

        return false;

    }

    window.location.replace(
        "perfil.html"
    );

    return true;

}


redirecionarParaTrocaSenhaSeNecessario();


/*
 * Confirmação compartilhada para todos os botões de saída do sistema.
 * O clique aprovado é reenviado ao código de logout de cada página.
 */

const SELETOR_BOTAO_SAIR =
    "#botao-sair, [data-acao-sair]";

const botoesSaidaLiberados =
    new WeakSet();

let confirmacaoSaidaEmAndamento = null;


function criarConfirmacaoSaida() {

    const confirmacaoExistente =
        document.getElementById(
            "confirmacao-saida"
        );

    if (confirmacaoExistente) {

        return confirmacaoExistente;

    }

    const confirmacao =
        document.createElement("div");

    confirmacao.id =
        "confirmacao-saida";

    confirmacao.className =
        "confirmacao-saida";

    confirmacao.hidden = true;

    confirmacao.innerHTML = `
        <section
            class="confirmacao-saida__cartao"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacao-saida"
            aria-describedby="texto-confirmacao-saida"
        >
            <div class="confirmacao-saida__icone" aria-hidden="true">
                <svg
                    class="icone-sistema"
                    focusable="false"
                >
                    <use href="../icones/bootstrap-icons.svg#box-arrow-right"></use>
                </svg>
            </div>

            <div class="confirmacao-saida__conteudo">
                <span class="confirmacao-saida__etiqueta">
                    Encerrar sessão
                </span>

                <h2 id="titulo-confirmacao-saida">
                    Deseja realmente sair?
                </h2>

                <p id="texto-confirmacao-saida">
                    Você precisará informar seu CPF e sua senha para entrar novamente.
                </p>
            </div>

            <div class="confirmacao-saida__acoes">
                <button
                    type="button"
                    class="confirmacao-saida__botao confirmacao-saida__botao--cancelar"
                    data-cancelar-saida
                >
                    Continuar no sistema
                </button>

                <button
                    type="button"
                    class="confirmacao-saida__botao confirmacao-saida__botao--confirmar"
                    data-confirmar-saida
                >
                    Sair da conta
                </button>
            </div>
        </section>
    `;

    document.body.appendChild(
        confirmacao
    );

    return confirmacao;

}


function solicitarConfirmacaoSaida() {

    if (confirmacaoSaidaEmAndamento) {

        return confirmacaoSaidaEmAndamento;

    }

    const confirmacao =
        criarConfirmacaoSaida();

    const botaoCancelar =
        confirmacao.querySelector(
            "[data-cancelar-saida]"
        );

    const botaoConfirmar =
        confirmacao.querySelector(
            "[data-confirmar-saida]"
        );

    const focoAnterior =
        document.activeElement;

    confirmacao.hidden = false;

    document.body.classList.add(
        "confirmacao-saida-aberta"
    );

    confirmacaoSaidaEmAndamento =
        new Promise((resolver) => {

            function finalizar(confirmado) {

                confirmacao.hidden = true;

                document.body.classList.remove(
                    "confirmacao-saida-aberta"
                );

                confirmacao.removeEventListener(
                    "click",
                    tratarCliqueConfirmacao
                );

                document.removeEventListener(
                    "keydown",
                    tratarTeclaConfirmacao
                );

                confirmacaoSaidaEmAndamento = null;

                if (
                    !confirmado &&
                    focoAnterior instanceof HTMLElement
                ) {

                    focoAnterior.focus();

                }

                resolver(confirmado);

            }

            function tratarCliqueConfirmacao(evento) {

                if (
                    evento.target.closest(
                        "[data-confirmar-saida]"
                    )
                ) {

                    finalizar(true);
                    return;

                }

                if (
                    evento.target === confirmacao ||
                    evento.target.closest(
                        "[data-cancelar-saida]"
                    )
                ) {

                    finalizar(false);

                }

            }

            function tratarTeclaConfirmacao(evento) {

                if (evento.key === "Escape") {

                    evento.preventDefault();
                    finalizar(false);
                    return;

                }

                if (evento.key !== "Tab") {

                    return;

                }

                const primeiroBotao =
                    botaoCancelar;

                const ultimoBotao =
                    botaoConfirmar;

                if (
                    evento.shiftKey &&
                    document.activeElement === primeiroBotao
                ) {

                    evento.preventDefault();
                    ultimoBotao.focus();

                } else if (
                    !evento.shiftKey &&
                    document.activeElement === ultimoBotao
                ) {

                    evento.preventDefault();
                    primeiroBotao.focus();

                }

            }

            confirmacao.addEventListener(
                "click",
                tratarCliqueConfirmacao
            );

            document.addEventListener(
                "keydown",
                tratarTeclaConfirmacao
            );

            window.requestAnimationFrame(
                () => botaoCancelar.focus()
            );

        });

    return confirmacaoSaidaEmAndamento;

}


document.addEventListener(
    "click",
    async (evento) => {

        if (!(evento.target instanceof Element)) {

            return;

        }

        const botaoSair =
            evento.target.closest(
                SELETOR_BOTAO_SAIR
            );

        if (!botaoSair) {

            return;

        }

        if (
            botoesSaidaLiberados.has(
                botaoSair
            )
        ) {

            botoesSaidaLiberados.delete(
                botaoSair
            );

            return;

        }

        evento.preventDefault();
        evento.stopImmediatePropagation();

        const saidaConfirmada =
            await solicitarConfirmacaoSaida();

        if (!saidaConfirmada) {

            return;

        }

        botoesSaidaLiberados.add(
            botaoSair
        );

        botaoSair.click();

    },
    true
);
