/*
 * Central de notificações administrativas do Gestor de Jornadas.
 */


const CAMINHO_ICONES_NOTIFICACOES =
    "../icones/bootstrap-icons.svg";


const nomeUsuarioCabecalho =
    document.getElementById(
        "nome-usuario-cabecalho"
    );

const tipoUsuarioCabecalho =
    document.getElementById(
        "tipo-usuario-cabecalho"
    );

const avatarUsuario =
    document.getElementById(
        "avatar-usuario"
    );

const indicadorConexao =
    document.getElementById(
        "indicador-conexao"
    );

const quantidadeTotal =
    document.getElementById(
        "quantidade-total"
    );

const quantidadePendentes =
    document.getElementById(
        "quantidade-pendentes"
    );

const quantidadeRevisadas =
    document.getElementById(
        "quantidade-revisadas"
    );

const descricaoResultados =
    document.getElementById(
        "descricao-resultados"
    );

const listaNotificacoes =
    document.getElementById(
        "lista-notificacoes"
    );

const botoesFiltro =
    document.querySelectorAll(
        "[data-filtro-notificacao]"
    );

const botaoRevisarTodas =
    document.getElementById(
        "botao-revisar-todas"
    );

const botaoAtualizar =
    document.getElementById(
        "botao-atualizar-notificacoes"
    );

const botaoSair =
    document.getElementById(
        "botao-sair"
    );

const mensagemFlutuante =
    document.getElementById(
        "mensagem-flutuante"
    );


let filtroAtual =
    "PENDENTES";

let carregando =
    false;

let temporizadorMensagem =
    null;


function escaparHtml(valor) {

    const caracteres = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };

    return String(
        valor ?? ""
    ).replace(
        /[&<>"']/g,
        caractere =>
            caracteres[caractere]
    );

}


function obterIniciaisNome(nomeCompleto) {

    const nomes = String(
        nomeCompleto || ""
    )
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!nomes.length) {

        return "--";

    }

    if (nomes.length === 1) {

        return nomes[0]
            .slice(0, 2)
            .toUpperCase();

    }

    return (
        nomes[0][0] +
        nomes[nomes.length - 1][0]
    ).toUpperCase();

}


function formatarDataHora(dataIso) {

    if (!dataIso) {

        return "Data não informada";

    }

    const data =
        new Date(dataIso);

    if (Number.isNaN(data.getTime())) {

        return "Data não informada";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    ).format(data);

}


function obterConfiguracaoTipo(tipo) {

    const configuracoes = {

        SOLICITACAO_CADASTRO: {
            nome: "Cadastro",
            icone: "person-plus-fill",
            link: "solicitacoes.html",
            textoLink: "Ver solicitações"
        },

        REGISTRO_ALTERADO: {
            nome: "Alteração",
            icone: "clock-history",
            link: "alteracoes.html",
            textoLink: "Ver alterações"
        },

        JORNADA_INCOMPLETA: {
            nome: "Jornada",
            icone: "exclamation-triangle-fill",
            link: "status-hoje.html",
            textoLink: "Ver status"
        },

        FUNCIONARIO_SEM_REGISTRO: {
            nome: "Sem registro",
            icone: "person-exclamation",
            link: "status-hoje.html",
            textoLink: "Ver status"
        },

        CONFLITO_SINCRONIZACAO: {
            nome: "Sincronização",
            icone: "arrow-repeat",
            link: "status-hoje.html",
            textoLink: "Ver status"
        }

    };

    return configuracoes[tipo] || {
        nome: "Aviso",
        icone: "bell-fill",
        link: "administracao.html",
        textoLink: "Abrir administração"
    };

}


function mostrarMensagem(
    mensagem,
    tipo = "sucesso"
) {

    mensagemFlutuante.textContent =
        mensagem;

    mensagemFlutuante.className =
        `mensagem-flutuante ${tipo} visivel`;

    window.clearTimeout(
        temporizadorMensagem
    );

    temporizadorMensagem =
        window.setTimeout(
            () => {

                mensagemFlutuante
                    .classList
                    .remove("visivel");

            },
            4000
        );

}


function atualizarEstadoConexao() {

    const conectado =
        navigator.onLine;

    indicadorConexao.textContent =
        conectado
            ? "Sistema conectado"
            : "Sem conexão";

    indicadorConexao.classList.toggle(
        "sem-conexao",
        !conectado
    );

    botaoAtualizar.disabled =
        !conectado || carregando;

    botaoRevisarTodas.disabled =
        !conectado || carregando;

    document
        .querySelectorAll(
            ".botao-revisar-notificacao"
        )
        .forEach(
            botao => {

                botao.disabled =
                    !conectado || carregando;

            }
        );

}


function definirCarregamento(ativo) {

    carregando =
        ativo;

    listaNotificacoes.setAttribute(
        "aria-busy",
        String(ativo)
    );

    botoesFiltro.forEach(
        botao => {

            botao.disabled =
                ativo;

        }
    );

    atualizarEstadoConexao();

}


function preencherCabecalho(usuario) {

    nomeUsuarioCabecalho.textContent =
        usuario.nome_completo;

    tipoUsuarioCabecalho.textContent =
        "Administrador";

    avatarUsuario.textContent =
        obterIniciaisNome(
            usuario.nome_completo
        );

}


function preencherResumo(resumo) {

    quantidadeTotal.textContent =
        resumo.quantidade_total || 0;

    quantidadePendentes.textContent =
        resumo.quantidade_pendentes || 0;

    quantidadeRevisadas.textContent =
        resumo.quantidade_revisadas || 0;

    atualizarContadoresNotificacoes(
        resumo.quantidade_pendentes || 0
    );

    botaoRevisarTodas.hidden =
        (resumo.quantidade_pendentes || 0)
        === 0;

}


function criarCartaoNotificacao(
    notificacao
) {

    const configuracao =
        obterConfiguracaoTipo(
            notificacao.tipo_notificacao
        );

    const nomeRelacionado =
        notificacao.usuario_relacionado
            ?.nome_completo;

    const dadosRevisao =
        notificacao.revisada &&
        notificacao.revisor
            ?.nome_completo
            ? (
                "Revisada por " +
                notificacao.revisor
                    .nome_completo
            )
            : "";

    const cartao =
        document.createElement(
            "article"
        );

    cartao.className =
        "cartao-notificacao";

    if (!notificacao.revisada) {

        cartao.classList.add(
            "cartao-notificacao--pendente"
        );

    }

    cartao.innerHTML = `
        <span class="cartao-notificacao__icone" aria-hidden="true">
            <svg class="icone-sistema" focusable="false">
                <use href="${
                    CAMINHO_ICONES_NOTIFICACOES
                }#${
                    configuracao.icone
                }"></use>
            </svg>
        </span>

        <div class="cartao-notificacao__conteudo">

            <div class="cartao-notificacao__cabecalho">

                <h2>${escaparHtml(notificacao.titulo)}</h2>

                <span class="etiqueta-notificacao ${
                    notificacao.revisada
                        ? "revisada"
                        : ""
                }">
                    ${
                        notificacao.revisada
                            ? "Revisada"
                            : escaparHtml(configuracao.nome)
                    }
                </span>

            </div>

            <p class="cartao-notificacao__mensagem">
                ${escaparHtml(notificacao.mensagem)}
            </p>

            <div class="cartao-notificacao__metadados">

                <span>
                    ${escaparHtml(
                        formatarDataHora(
                            notificacao.data_criacao
                        )
                    )}
                </span>

                ${
                    nomeRelacionado
                        ? `
                            <span>
                                ${escaparHtml(nomeRelacionado)}
                            </span>
                        `
                        : ""
                }

                ${
                    dadosRevisao
                        ? `
                            <span>
                                ${escaparHtml(dadosRevisao)}
                            </span>
                        `
                        : ""
                }

            </div>

        </div>

        <div class="cartao-notificacao__acoes">

            <a
                href="${configuracao.link}"
                class="link-notificacao"
            >
                ${escaparHtml(configuracao.textoLink)}
            </a>

            ${
                !notificacao.revisada
                    ? `
                        <button
                            type="button"
                            class="botao-revisar-notificacao"
                            data-id-notificacao="${
                                notificacao.id_notificacao
                            }"
                        >
                            Marcar como revisada
                        </button>
                    `
                    : ""
            }

        </div>
    `;

    const botaoRevisar =
        cartao.querySelector(
            ".botao-revisar-notificacao"
        );

    if (botaoRevisar) {

        botaoRevisar.addEventListener(
            "click",
            () => {

                revisarNotificacao(
                    notificacao.id_notificacao,
                    botaoRevisar
                );

            }
        );

    }

    return cartao;

}


function preencherLista(notificacoes) {

    listaNotificacoes.replaceChildren();

    if (!notificacoes.length) {

        listaNotificacoes.innerHTML = `
            <div class="estado-notificacoes">

                <svg
                    class="icone-sistema estado-notificacoes__icone"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use href="${
                        CAMINHO_ICONES_NOTIFICACOES
                    }#bell"></use>
                </svg>

                <div>
                    <strong>Nenhuma notificação encontrada</strong>
                    <p>
                        Não há avisos neste filtro no momento.
                    </p>
                </div>

            </div>
        `;

        descricaoResultados.textContent =
            "Nenhuma notificação encontrada.";

        return;

    }

    notificacoes.forEach(
        notificacao => {

            listaNotificacoes.appendChild(
                criarCartaoNotificacao(
                    notificacao
                )
            );

        }
    );

    descricaoResultados.textContent =
        notificacoes.length === 1
            ? "1 notificação encontrada."
            : (
                notificacoes.length +
                " notificações encontradas."
            );

}


async function carregarUsuario() {

    try {

        const usuario =
            await requisicaoApi(
                "/autenticacao/me",
                {
                    method: "GET"
                }
            );

        if (
            usuario.tipo_usuario !==
            "ADMINISTRADOR"
        ) {

            window.location.href =
                "inicio.html";

            return false;

        }

        preencherCabecalho(
            usuario
        );

        return true;

    } catch (erro) {

        console.error(
            "Erro ao validar administrador:",
            erro
        );

        limparSessao();

        window.location.href =
            "../index.html";

        return false;

    }

}


async function carregarNotificacoes() {

    if (carregando) {

        return;

    }

    definirCarregamento(
        true
    );

    listaNotificacoes.innerHTML = `
        <div class="estado-notificacoes">
            <span class="carregamento-administracao" aria-hidden="true"></span>
            <p>Carregando notificações...</p>
        </div>
    `;

    try {

        const resposta =
            await requisicaoApi(
                (
                    "/administracao/notificacoes" +
                    "?filtro=" +
                    encodeURIComponent(
                        filtroAtual
                    )
                ),
                {
                    method: "GET"
                }
            );

        preencherResumo(
            resposta.resumo
        );

        preencherLista(
            resposta.notificacoes || []
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar notificações:",
            erro
        );

        listaNotificacoes.innerHTML = `
            <div class="estado-notificacoes estado-notificacoes--erro">
                <strong>Não foi possível carregar as notificações</strong>
                <p>
                    ${
                        escaparHtml(
                            erro.message ||
                            "Tente novamente."
                        )
                    }
                </p>
            </div>
        `;

        descricaoResultados.textContent =
            "Falha ao consultar notificações.";

    } finally {

        definirCarregamento(
            false
        );

    }

}


async function revisarNotificacao(
    idNotificacao,
    botao
) {

    botao.disabled = true;

    const textoOriginal =
        botao.textContent;

    botao.textContent =
        "Revisando...";

    try {

        const resposta =
            await requisicaoApi(
                (
                    "/administracao/notificacoes/" +
                    idNotificacao +
                    "/revisar"
                ),
                {
                    method: "PUT"
                }
            );

        mostrarMensagem(
            resposta.mensagem
        );

        await carregarNotificacoes();

    } catch (erro) {

        console.error(
            "Erro ao revisar notificação:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível revisar a notificação.",
            "erro"
        );

        botao.disabled =
            !navigator.onLine;

        botao.textContent =
            textoOriginal;

    }

}


async function revisarTodas() {

    botaoRevisarTodas.disabled =
        true;

    try {

        const resposta =
            await requisicaoApi(
                (
                    "/administracao/notificacoes" +
                    "/revisar-todas"
                ),
                {
                    method: "PUT"
                }
            );

        mostrarMensagem(
            resposta.mensagem
        );

        await carregarNotificacoes();

    } catch (erro) {

        console.error(
            "Erro ao revisar notificações:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível revisar as notificações.",
            "erro"
        );

    } finally {

        botaoRevisarTodas.disabled =
            !navigator.onLine;

    }

}


async function sairDaConta() {

    botaoSair.disabled =
        true;

    try {

        await requisicaoApi(
            "/autenticacao/logout",
            {
                method: "POST"
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao encerrar sessão:",
            erro
        );

    } finally {

        limparSessao();

        window.location.href =
            "../index.html";

    }

}


botoesFiltro.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                filtroAtual =
                    botao.dataset
                        .filtroNotificacao;

                botoesFiltro.forEach(
                    item => {

                        const ativo =
                            item === botao;

                        item.classList.toggle(
                            "ativo",
                            ativo
                        );

                        item.setAttribute(
                            "aria-pressed",
                            String(ativo)
                        );

                    }
                );

                carregarNotificacoes();

            }
        );

    }
);


botaoAtualizar.addEventListener(
    "click",
    carregarNotificacoes
);

botaoRevisarTodas.addEventListener(
    "click",
    revisarTodas
);

botaoSair.addEventListener(
    "click",
    sairDaConta
);

window.addEventListener(
    "online",
    () => {

        atualizarEstadoConexao();
        carregarNotificacoes();

    }
);

window.addEventListener(
    "offline",
    atualizarEstadoConexao
);


async function iniciarPagina() {

    if (!usuarioEstaAutenticado()) {

        window.location.href =
            "../index.html";

        return;

    }

    atualizarEstadoConexao();

    const administradorValido =
        await carregarUsuario();

    if (!administradorValido) {

        return;

    }

    await carregarNotificacoes();

}


iniciarPagina();
