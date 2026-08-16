/*
 * Solicitações de cadastro do Gestor de Jornadas.
 */


const CAMINHO_ICONES_SOLICITACOES =
    "../icones/bootstrap-icons.svg";


/* =========================================================
   CABEÇALHO
   ========================================================= */

const nomeUsuarioCabecalho = document.getElementById(
    "nome-usuario-cabecalho"
);

const tipoUsuarioCabecalho = document.getElementById(
    "tipo-usuario-cabecalho"
);

const avatarUsuario = document.getElementById(
    "avatar-usuario"
);

const indicadorConexao = document.getElementById(
    "indicador-conexao"
);


/* =========================================================
   RESUMO E LISTA
   ========================================================= */

const quantidadeNavegacao = document.getElementById(
    "quantidade-navegacao"
);

const quantidadePendente = document.getElementById(
    "quantidade-pendente"
);

const descricaoSolicitacoes = document.getElementById(
    "descricao-solicitacoes"
);

const botaoAtualizar = document.getElementById(
    "botao-atualizar"
);

const estadoCarregamento = document.getElementById(
    "estado-carregamento"
);

const estadoVazio = document.getElementById(
    "estado-vazio"
);

const listaSolicitacoes = document.getElementById(
    "lista-solicitacoes"
);


/* =========================================================
   DETALHES
   ========================================================= */

const fundoDetalhes = document.getElementById(
    "fundo-detalhes"
);

const tituloDetalhes = document.getElementById(
    "titulo-detalhes"
);

const conteudoDetalhes = document.getElementById(
    "conteudo-detalhes"
);

const botaoFecharDetalhes = document.getElementById(
    "botao-fechar-detalhes"
);


/* =========================================================
   OUTROS
   ========================================================= */

const mensagemFlutuante = document.getElementById(
    "mensagem-flutuante"
);

const botaoSair = document.getElementById(
    "botao-sair"
);


/* =========================================================
   ESTADO DA PÁGINA
   ========================================================= */

let usuarioAtual = null;

let solicitacoesAtuais = [];

let solicitacaoAberta = null;

let acaoSelecionada = null;

let carregandoSolicitacoes = false;

let temporizadorMensagem = null;

let elementoFocoAntesPainel = null;


/* =========================================================
   FORMATAÇÃO E SEGURANÇA
   ========================================================= */

function escaparHtml(valor) {

    const texto = String(
        valor ?? ""
    );

    const caracteres = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        "\"": "&quot;",

        "'": "&#039;"

    };

    return texto.replace(
        /[&<>"']/g,
        caractere => caracteres[caractere]
    );

}


function obterIniciaisNome(nomeCompleto) {

    if (!nomeCompleto) {

        return "--";

    }

    const nomes = nomeCompleto
        .trim()
        .split(/\s+/)
        .filter(Boolean);

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


function formatarCpf(cpf) {

    if (!cpf) {

        return "---";

    }

    const numeros = cpf.replace(
        /\D/g,
        ""
    );

    if (numeros.length !== 11) {

        return cpf;

    }

    return numeros.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4"
    );

}


function formatarTelefone(telefone) {

    if (!telefone) {

        return "Não informado";

    }

    const numeros = telefone.replace(
        /\D/g,
        ""
    );

    if (numeros.length === 11) {

        return numeros.replace(
            /^(\d{2})(\d{5})(\d{4})$/,
            "($1) $2-$3"
        );

    }

    if (numeros.length === 10) {

        return numeros.replace(
            /^(\d{2})(\d{4})(\d{4})$/,
            "($1) $2-$3"
        );

    }

    return telefone;

}


function criarDataLocal(dataIso) {

    if (!dataIso) {

        return null;

    }

    const apenasData = dataIso.slice(
        0,
        10
    );

    const partes = apenasData
        .split("-")
        .map(Number);

    if (partes.length !== 3) {

        return null;

    }

    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

}


function formatarData(dataIso) {

    const data = criarDataLocal(
        dataIso
    );

    if (!data) {

        return "Não informada";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(data);

}


function formatarDataHora(dataIso) {

    if (!dataIso) {

        return "Não informada";

    }

    const textoIso =
        String(dataIso).replace(
            " ",
            "T"
        );

    const data = new Date(
        textoIso
    );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return dataIso;

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(data);

}


/* =========================================================
   SESSÃO
   ========================================================= */

function voltarParaLogin() {

    window.location.href =
        "../index.html";

}


function voltarParaInicio() {

    window.location.href =
        "inicio.html";

}


async function sairDaConta() {

    botaoSair.disabled = true;

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

        voltarParaLogin();

    }

}


/* =========================================================
   USUÁRIO E CONEXÃO
   ========================================================= */

function preencherUsuario(usuario) {

    usuarioAtual = usuario;

    nomeUsuarioCabecalho.textContent =
        usuario.nome_completo;

    tipoUsuarioCabecalho.textContent =
        "Administrador";

    avatarUsuario.textContent =
        obterIniciaisNome(
            usuario.nome_completo
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
        !conectado ||
        carregandoSolicitacoes;

}


/* =========================================================
   MENSAGENS
   ========================================================= */

function mostrarMensagemFlutuante(
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

    temporizadorMensagem = window.setTimeout(
        () => {

            mensagemFlutuante.classList.remove(
                "visivel"
            );

        },
        4200
    );

}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function definirCarregamentoLista(carregando) {

    carregandoSolicitacoes =
        carregando;

    estadoCarregamento.hidden =
        !carregando;

    if (carregando) {

        listaSolicitacoes.hidden =
            true;

        estadoVazio.hidden =
            true;

    }

    botaoAtualizar.disabled =
        carregando ||
        !navigator.onLine;

    botaoAtualizar.classList.toggle(
        "carregando",
        carregando
    );

    botaoAtualizar.setAttribute(
        "aria-busy",
        String(
            carregando
        )
    );

}


/* =========================================================
   CARTÕES
   ========================================================= */

function criarCartaoSolicitacao(
    solicitacao
) {

    const botao =
        document.createElement(
            "button"
        );

    botao.type = "button";

    botao.className =
        "cartao-solicitacao";

    botao.setAttribute(
        "aria-label",
        (
            "Analisar solicitação de " +
            solicitacao.nome_completo
        )
    );

    botao.innerHTML = `

        <div class="cabecalho-cartao-solicitacao">

            <div class="avatar-solicitacao">

                ${escaparHtml(
                    obterIniciaisNome(
                        solicitacao.nome_completo
                    )
                )}

            </div>


            <div class="identificacao-solicitacao">

                <h3>
                    ${escaparHtml(
                        solicitacao.nome_completo
                    )}
                </h3>

                <p>
                    Solicitação de funcionário
                </p>

            </div>

        </div>


        <div class="grade-dados-solicitacao">

            <div class="dado-solicitacao">

                <span>
                    CPF
                </span>

                <strong>
                    ${escaparHtml(
                        formatarCpf(
                            solicitacao.cpf
                        )
                    )}
                </strong>

            </div>


            <div class="dado-solicitacao">

                <span>
                    Telefone
                </span>

                <strong>
                    ${escaparHtml(
                        formatarTelefone(
                            solicitacao.telefone
                        )
                    )}
                </strong>

            </div>

        </div>


        <div class="rodape-cartao-solicitacao">

            <span class="data-solicitacao">

                Enviado em
                ${escaparHtml(
                    formatarDataHora(
                        solicitacao.data_solicitacao
                    )
                )}

            </span>

            <span class="acao-analisar-solicitacao">

                Analisar

                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_SOLICITACOES}#chevron-right"
                    ></use>
                </svg>

            </span>

        </div>
    `;

    botao.addEventListener(
        "click",
        () => {

            abrirDetalhesSolicitacao(
                solicitacao
            );

        }
    );

    return botao;

}


function preencherListaSolicitacoes(
    solicitacoes
) {

    listaSolicitacoes.innerHTML = "";

    quantidadePendente.textContent =
        solicitacoes.length;

    quantidadeNavegacao.textContent =
        solicitacoes.length;

    quantidadeNavegacao.setAttribute(
        "aria-label",
        (
            solicitacoes.length === 1
                ? "1 solicitação pendente"
                : (
                    solicitacoes.length +
                    " solicitações pendentes"
                )
        )
    );

    if (solicitacoes.length === 0) {

        descricaoSolicitacoes.textContent =
            "Nenhuma solicitação aguardando análise.";

        listaSolicitacoes.hidden =
            true;

        estadoVazio.hidden =
            false;

        return;

    }

    estadoVazio.hidden = true;

    descricaoSolicitacoes.textContent =
        solicitacoes.length === 1
            ? "1 solicitação aguardando análise."
            : `${solicitacoes.length} solicitações aguardando análise.`;

    solicitacoes.forEach(
        solicitacao => {

            listaSolicitacoes.appendChild(
                criarCartaoSolicitacao(
                    solicitacao
                )
            );

        }
    );

    listaSolicitacoes.hidden =
        false;

}


/* =========================================================
   CONSULTAR SOLICITAÇÕES
   ========================================================= */

async function consultarSolicitacoes() {

    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível consultar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    definirCarregamentoLista(true);

    try {

        const resposta =
            await requisicaoApi(
                "/administracao/solicitacoes-pendentes",
                {
                    method: "GET"
                }
            );

        solicitacoesAtuais =
            resposta.solicitacoes || [];

        preencherListaSolicitacoes(
            solicitacoesAtuais
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar solicitações:",
            erro
        );

        if (erro.status === 401) {

            limparSessao();

            voltarParaLogin();

            return;

        }

        if (erro.status === 403) {

            voltarParaInicio();

            return;

        }

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível consultar as solicitações.",
            "erro"
        );

    } finally {

        definirCarregamentoLista(false);

    }

}


/* =========================================================
   PAINEL DE DETALHES
   ========================================================= */

function abrirPainelDetalhes() {

    elementoFocoAntesPainel =
        document.activeElement;

    fundoDetalhes.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    botaoFecharDetalhes.focus();

}


function fecharPainelDetalhes() {

    fundoDetalhes.hidden =
        true;

    document.body.style.overflow =
        "";

    solicitacaoAberta =
        null;

    acaoSelecionada =
        null;

    if (
        elementoFocoAntesPainel &&
        document.contains(
            elementoFocoAntesPainel
        )
    ) {

        elementoFocoAntesPainel.focus();

    }

    elementoFocoAntesPainel = null;

}


function abrirDetalhesSolicitacao(
    solicitacao
) {

    solicitacaoAberta =
        solicitacao;

    acaoSelecionada =
        null;

    tituloDetalhes.textContent =
        solicitacao.nome_completo;

    conteudoDetalhes.innerHTML = `

        <section class="identidade-detalhe-solicitacao">

            <div class="avatar-detalhe-solicitacao">

                ${escaparHtml(
                    obterIniciaisNome(
                        solicitacao.nome_completo
                    )
                )}

            </div>


            <div>

                <h3>
                    ${escaparHtml(
                        solicitacao.nome_completo
                    )}
                </h3>

                <p>
                    Enviado em
                    ${escaparHtml(
                        formatarDataHora(
                            solicitacao.data_solicitacao
                        )
                    )}
                </p>

            </div>

        </section>


        <section class="grade-detalhes-solicitacao">

            <div class="dado-detalhe-solicitacao">

                <span>
                    CPF
                </span>

                <strong>
                    ${escaparHtml(
                        formatarCpf(
                            solicitacao.cpf
                        )
                    )}
                </strong>

            </div>


            <div class="dado-detalhe-solicitacao">

                <span>
                    Telefone
                </span>

                <strong>
                    ${escaparHtml(
                        formatarTelefone(
                            solicitacao.telefone
                        )
                    )}
                </strong>

            </div>


            <div class="dado-detalhe-solicitacao">

                <span>
                    Data de nascimento
                </span>

                <strong>
                    ${escaparHtml(
                        formatarData(
                            solicitacao.data_nascimento
                        )
                    )}
                </strong>

            </div>


            <div class="dado-detalhe-solicitacao">

                <span>
                    Tipo da conta após aprovação
                </span>

                <strong>
                    Funcionário
                </strong>

            </div>

        </section>


        <section class="area-decisao-solicitacao">

            <h3>
                Decisão do administrador
            </h3>

            <p>
                A observação é opcional e ficará registrada
                junto com a resposta desta solicitação.
            </p>

            <label for="observacao-decisao">
                Observação
            </label>

            <textarea
                id="observacao-decisao"
                maxlength="500"
                placeholder="Ex.: Dados conferidos com o responsável"
            ></textarea>


            <div
                id="acoes-decisao"
                class="acoes-decisao-solicitacao"
            >

                <button
                    type="button"
                    id="botao-recusar"
                    class="botao-recusar-solicitacao"
                >

                    <svg
                        class="icone-sistema"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <use
                            href="${CAMINHO_ICONES_SOLICITACOES}#x-circle-fill"
                        ></use>
                    </svg>

                    <span>
                        Recusar cadastro
                    </span>

                </button>

                <button
                    type="button"
                    id="botao-aprovar"
                    class="botao-aprovar-solicitacao"
                >

                    <svg
                        class="icone-sistema"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <use
                            href="${CAMINHO_ICONES_SOLICITACOES}#check-circle-fill"
                        ></use>
                    </svg>

                    <span>
                        Aprovar cadastro
                    </span>

                </button>

            </div>


            <div
                id="confirmacao-decisao"
                class="confirmacao-decisao"
                hidden
            >

                <p id="texto-confirmacao-decisao"></p>

                <div class="acoes-confirmacao-decisao">

                    <button
                        type="button"
                        id="botao-cancelar-decisao"
                        class="botao-cancelar-decisao"
                    >

                        <svg
                            class="icone-sistema"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <use
                                href="${CAMINHO_ICONES_SOLICITACOES}#arrow-left"
                            ></use>
                        </svg>

                        <span>
                            Cancelar
                        </span>

                    </button>

                    <button
                        type="button"
                        id="botao-confirmar-decisao"
                        class="botao-confirmar-decisao"
                    >

                        <svg
                            class="icone-sistema"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <use
                                data-icone-confirmar-decisao
                                href="${CAMINHO_ICONES_SOLICITACOES}#check-circle-fill"
                            ></use>
                        </svg>

                        <span data-texto-confirmar-decisao>
                            Confirmar
                        </span>

                    </button>

                </div>

            </div>

        </section>
    `;

    configurarEventosDecisao();

    abrirPainelDetalhes();

}


/* =========================================================
   DECISÃO
   ========================================================= */

function selecionarDecisao(acao) {

    acaoSelecionada =
        acao;

    const acoes =
        document.getElementById(
            "acoes-decisao"
        );

    const confirmacao =
        document.getElementById(
            "confirmacao-decisao"
        );

    const textoConfirmacao =
        document.getElementById(
            "texto-confirmacao-decisao"
        );

    const botaoConfirmar =
        document.getElementById(
            "botao-confirmar-decisao"
        );

    const textoBotaoConfirmar =
        botaoConfirmar.querySelector(
            "[data-texto-confirmar-decisao]"
        );

    const iconeBotaoConfirmar =
        botaoConfirmar.querySelector(
            "[data-icone-confirmar-decisao]"
        );

    acoes.hidden =
        true;

    confirmacao.hidden =
        false;

    const aprovando =
        acao === "APROVAR";

    textoConfirmacao.textContent =
        aprovando
            ? "Confirma a aprovação? Uma conta ativa de funcionário será criada."
            : "Confirma a recusa? A pessoa não receberá acesso ao sistema.";

    textoBotaoConfirmar.textContent =
        aprovando
            ? "Confirmar aprovação"
            : "Confirmar recusa";

    iconeBotaoConfirmar.setAttribute(
        "href",
        (
            CAMINHO_ICONES_SOLICITACOES +
            (
                aprovando
                    ? "#check-circle-fill"
                    : "#x-circle-fill"
            )
        )
    );

    botaoConfirmar.className =
        `botao-confirmar-decisao ${
            aprovando
                ? "aprovar"
                : "recusar"
        }`;

}


function cancelarDecisao() {

    acaoSelecionada =
        null;

    document.getElementById(
        "acoes-decisao"
    ).hidden = false;

    document.getElementById(
        "confirmacao-decisao"
    ).hidden = true;

}


async function confirmarDecisao() {

    if (
        !solicitacaoAberta ||
        !acaoSelecionada
    ) {

        return;

    }

    const botaoConfirmar =
        document.getElementById(
            "botao-confirmar-decisao"
        );

    const botaoCancelar =
        document.getElementById(
            "botao-cancelar-decisao"
        );

    const observacao =
        document.getElementById(
            "observacao-decisao"
        ).value.trim();

    botaoConfirmar.disabled =
        true;

    botaoConfirmar.setAttribute(
        "aria-busy",
        "true"
    );

    botaoCancelar.disabled =
        true;

    const idSolicitacao =
        solicitacaoAberta.id_solicitacao;

    const caminho =
        acaoSelecionada === "APROVAR"
            ? `/administracao/solicitacoes/${idSolicitacao}/aprovar`
            : `/administracao/solicitacoes/${idSolicitacao}/recusar`;

    try {

        const resposta =
            await requisicaoApi(
                caminho,
                {
                    method: "POST",

                    body: JSON.stringify({

                        observacao:
                            observacao || null

                    })
                }
            );

        mostrarMensagemFlutuante(
            resposta.mensagem
        );

        fecharPainelDetalhes();

        await consultarSolicitacoes();

    } catch (erro) {

        console.error(
            "Erro ao responder solicitação:",
            erro
        );

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível responder à solicitação.",
            "erro"
        );

        botaoConfirmar.disabled =
            false;

        botaoConfirmar.setAttribute(
            "aria-busy",
            "false"
        );

        botaoCancelar.disabled =
            false;

    }

}


function configurarEventosDecisao() {

    document.getElementById(
        "botao-aprovar"
    ).addEventListener(
        "click",
        () => {

            selecionarDecisao(
                "APROVAR"
            );

        }
    );


    document.getElementById(
        "botao-recusar"
    ).addEventListener(
        "click",
        () => {

            selecionarDecisao(
                "RECUSAR"
            );

        }
    );


    document.getElementById(
        "botao-cancelar-decisao"
    ).addEventListener(
        "click",
        cancelarDecisao
    );


    document.getElementById(
        "botao-confirmar-decisao"
    ).addEventListener(
        "click",
        confirmarDecisao
    );

}


/* =========================================================
   CARREGAMENTO DA PÁGINA
   ========================================================= */

async function carregarPagina() {

    if (!usuarioEstaAutenticado()) {

        voltarParaLogin();

        return;

    }

    const usuarioSalvo =
        obterUsuarioSalvo();

    if (
        usuarioSalvo &&
        usuarioSalvo.tipo_usuario ===
            "ADMINISTRADOR"
    ) {

        preencherUsuario(
            usuarioSalvo
        );

    }

    try {

        const usuarioAtualizado =
            await requisicaoApi(
                "/autenticacao/me",
                {
                    method: "GET"
                }
            );

        if (
            usuarioAtualizado.tipo_usuario !==
                       "ADMINISTRADOR"
        ) {

            voltarParaInicio();

            return;

        }

        preencherUsuario(
            usuarioAtualizado
        );

        localStorage.setItem(
            CHAVES_SESSAO.USUARIO,
            JSON.stringify(
                usuarioAtualizado
            )
        );

        await consultarSolicitacoes();

    } catch (erro) {

        console.error(
            "Erro ao carregar solicitações:",
            erro
        );

        if (erro.status === 401) {

            limparSessao();

            voltarParaLogin();

            return;

        }

        if (erro.status === 403) {

            voltarParaInicio();

            return;

        }

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível carregar a página.",
            "erro"
        );

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

botaoAtualizar.addEventListener(
    "click",
    consultarSolicitacoes
);


botaoFecharDetalhes.addEventListener(
    "click",
    fecharPainelDetalhes
);


fundoDetalhes.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoDetalhes
        ) {

            fecharPainelDetalhes();

        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape" &&
            !fundoDetalhes.hidden
        ) {

            fecharPainelDetalhes();

        }

    }
);


botaoSair.addEventListener(
    "click",
    sairDaConta
);


window.addEventListener(
    "online",
    async () => {

        atualizarEstadoConexao();

        await consultarSolicitacoes();

    }
);


window.addEventListener(
    "offline",
    atualizarEstadoConexao
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarEstadoConexao();

carregarPagina();
