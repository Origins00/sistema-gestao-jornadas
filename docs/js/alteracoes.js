/*
 * Revisão de alterações de horários do Gestor de Jornadas.
 */


const CAMINHO_ICONES_ALTERACOES =
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
   RESUMO
   ========================================================= */

const quantidadeTotal = document.getElementById(
    "quantidade-total"
);

const quantidadePendentes = document.getElementById(
    "quantidade-pendentes"
);

const quantidadeRevisadas = document.getElementById(
    "quantidade-revisadas"
);

const quantidadePendenteNavegacao = document.getElementById(
    "quantidade-pendente-navegacao"
);


/* =========================================================
   FILTROS
   ========================================================= */

const campoPesquisa = document.getElementById(
    "campo-pesquisa-alteracoes"
);

const botaoLimparPesquisa = document.getElementById(
    "botao-limpar-pesquisa"
);

const botoesFiltroRevisao = document.querySelectorAll(
    "[data-filtro-revisao]"
);


/* =========================================================
   LISTA
   ========================================================= */

const descricaoResultados = document.getElementById(
    "descricao-resultados"
);

const botaoAtualizarAlteracoes = document.getElementById(
    "botao-atualizar-alteracoes"
);

const estadoCarregamento = document.getElementById(
    "estado-carregamento"
);

const estadoVazio = document.getElementById(
    "estado-vazio"
);

const listaAlteracoes = document.getElementById(
    "lista-alteracoes"
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

let filtroAtual = "PENDENTES";

let alteracoesCarregadas = [];

let alteracoesFiltradas = [];

let alteracaoAberta = null;

let elementoFocoAntesPainel = null;

let carregandoAlteracoes = false;

let temporizadorPesquisa = null;

let temporizadorMensagem = null;


/* =========================================================
   SEGURANÇA E FORMATAÇÕES
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


function normalizarTexto(texto) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase();

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


function criarDataLocal(dataIso) {

    if (!dataIso) {

        return null;

    }

    const apenasData = String(
        dataIso
    ).slice(
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

    const data =
        new Date(textoIso);

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


function obterTextoTipoRegistro(tipoRegistro) {

    const tipos = {

        ENTRADA: "Entrada",

        INICIO_ALMOCO: "Início do almoço",

        FIM_ALMOCO: "Retorno do almoço",

        SAIDA: "Saída"

    };

    return tipos[tipoRegistro] ||
        tipoRegistro;
}


function obterTextoTipoUsuario(tipoUsuario) {

    return tipoUsuario ===
        "ADMINISTRADOR"
            ? "Administrador"
            : "Funcionário";

}


/* =========================================================
   NAVEGAÇÃO E SESSÃO
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
   USUÁRIO
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


/* =========================================================
   CONEXÃO E MENSAGENS
   ========================================================= */

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

    botaoAtualizarAlteracoes.disabled =
        !conectado ||
        carregandoAlteracoes;

    botoesFiltroRevisao.forEach(
        botao => {

            botao.disabled =
                !conectado ||
                carregandoAlteracoes;

        }
    );

}


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

    temporizadorMensagem =
        window.setTimeout(
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

function definirCarregamento(
    carregando
) {

    carregandoAlteracoes =
        carregando;

    estadoCarregamento.hidden =
        !carregando;

    if (carregando) {

        listaAlteracoes.hidden =
            true;

        estadoVazio.hidden =
            true;

    }

    botaoAtualizarAlteracoes.classList.toggle(
        "carregando",
        carregando
    );

    botaoAtualizarAlteracoes.setAttribute(
        "aria-busy",
        String(carregando)
    );

    atualizarEstadoConexao();

}


/* =========================================================
   RESUMO GERAL
   ========================================================= */

function preencherResumoGeral(
    resumo
) {

    quantidadeTotal.textContent =
        resumo.quantidade_total;

    quantidadePendentes.textContent =
        resumo.quantidade_pendentes;

    quantidadeRevisadas.textContent =
        resumo.quantidade_revisadas;

    quantidadePendenteNavegacao.textContent =
        resumo.quantidade_pendentes;

    quantidadePendenteNavegacao.setAttribute(
        "aria-label",
        resumo.quantidade_pendentes === 1
            ? "1 alteração pendente"
            : `${resumo.quantidade_pendentes} alterações pendentes`
    );

}


async function consultarResumoGeral() {

    const resposta =
        await requisicaoApi(
            "/administracao/historico-alteracoes",
            {
                method: "GET"
            }
        );

    preencherResumoGeral(
        resposta.resumo
    );

}


/* =========================================================
   CARTÃO DA ALTERAÇÃO
   ========================================================= */

function criarCartaoAlteracao(
    alteracao
) {

    const botao =
        document.createElement(
            "button"
        );

    botao.type = "button";

    botao.className =
        "cartao-alteracao";

    const revisada =
        alteracao.alteracao.revisada;

    botao.setAttribute(
        "aria-label",
        `Ver alteração de ${
            alteracao.funcionario.nome_completo
        } em ${
            formatarData(
                alteracao.registro.data_jornada
            )
        }`
    );

    botao.innerHTML = `

        <div class="identificacao-alteracao">

            <div class="identificacao-alteracao__cabecalho">

                <div class="avatar-alteracao">

                    ${escaparHtml(
                        obterIniciaisNome(
                            alteracao.funcionario
                                .nome_completo
                        )
                    )}

                </div>

                <div>

                    <h3>
                        ${escaparHtml(
                            alteracao.funcionario
                                .nome_completo
                        )}
                    </h3>

                    <p>
                        ${escaparHtml(
                            formatarCpf(
                                alteracao.funcionario.cpf
                            )
                        )}
                    </p>

                </div>

            </div>

        </div>


        <div class="comparacao-horarios">

            <div class="horario-comparacao">

                <span>
                    Anterior
                </span>

                <strong>
                    ${escaparHtml(
                        alteracao.alteracao
                            .horario_anterior
                    )}
                </strong>

            </div>

            <span
                class="seta-comparacao"
                aria-hidden="true"
            >
                <svg
                    class="icone-sistema"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_ALTERACOES}#arrow-right"
                    ></use>
                </svg>
            </span>

            <div class="horario-comparacao novo">

                <span>
                    Novo
                </span>

                <strong>
                    ${escaparHtml(
                        alteracao.alteracao
                            .horario_novo
                    )}
                </strong>

            </div>

        </div>


        <div class="dados-registro-alteracao">

            <span>
                ${escaparHtml(
                    obterTextoTipoRegistro(
                        alteracao.registro
                            .tipo_registro
                    )
                )}
            </span>

            <strong>
                ${escaparHtml(
                    formatarData(
                        alteracao.registro
                            .data_jornada
                    )
                )}
            </strong>

        </div>


        <span
            class="
                status-revisao
                ${
                    revisada
                        ? "revisada"
                        : "pendente"
                }
            "
        >
            <svg
                class="icone-sistema"
                aria-hidden="true"
                focusable="false"
            >
                <use
                    href="${CAMINHO_ICONES_ALTERACOES}#${
                        revisada
                            ? "check-circle-fill"
                            : "hourglass-split"
                    }"
                ></use>
            </svg>
            ${
                revisada
                    ? "Revisada"
                    : "Pendente"
            }
        </span>
    `;

    botao.addEventListener(
        "click",
        () => {

            abrirDetalhesAlteracao(
                alteracao
            );

        }
    );

    return botao;

}


/* =========================================================
   PESQUISA LOCAL
   ========================================================= */

function aplicarPesquisaLocal() {

    const pesquisa =
        normalizarTexto(
            campoPesquisa.value
        );

    if (!pesquisa) {

        alteracoesFiltradas = [
            ...alteracoesCarregadas
        ];

    } else {

        alteracoesFiltradas =
            alteracoesCarregadas.filter(
                alteracao => {

                    const nome =
                        normalizarTexto(
                            alteracao.funcionario
                                .nome_completo
                        );

                    const cpf =
                        String(
                            alteracao.funcionario
                                .cpf || ""
                        ).replace(
                            /\D/g,
                            ""
                        );

                    const pesquisaNumerica =
                        campoPesquisa.value.replace(
                            /\D/g,
                            ""
                        );

                    return (
                        nome.includes(pesquisa) ||
                        (
                            pesquisaNumerica &&
                            cpf.includes(
                                pesquisaNumerica
                            )
                        )
                    );

                }
            );

    }

    preencherLista(
        alteracoesFiltradas
    );

}


/* =========================================================
   LISTA
   ========================================================= */

function preencherLista(
    alteracoes
) {

    listaAlteracoes.innerHTML = "";

    if (alteracoes.length === 0) {

        listaAlteracoes.hidden =
            true;

        estadoVazio.hidden =
            false;

        descricaoResultados.textContent =
            "Nenhuma alteração encontrada.";

        return;

    }

    estadoVazio.hidden = true;

    alteracoes.forEach(
        alteracao => {

            listaAlteracoes.appendChild(
                criarCartaoAlteracao(
                    alteracao
                )
            );

        }
    );

    listaAlteracoes.hidden = false;

    descricaoResultados.textContent =
        alteracoes.length === 1
            ? "1 alteração encontrada."
            : `${alteracoes.length} alterações encontradas.`;

}


/* =========================================================
   CONSULTA DAS ALTERAÇÕES
   ========================================================= */

function obterCaminhoConsulta() {

    if (
        filtroAtual ===
        "PENDENTES"
    ) {

        return (
            "/administracao/" +
            "historico-alteracoes?revisada=false"
        );

    }

    if (
        filtroAtual ===
        "REVISADAS"
    ) {

        return (
            "/administracao/" +
            "historico-alteracoes?revisada=true"
        );

    }

    return (
        "/administracao/" +
        "historico-alteracoes"
    );

}


async function consultarAlteracoes() {

    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível consultar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    definirCarregamento(true);

    try {

        const caminho =
            obterCaminhoConsulta();

        const resposta =
            await requisicaoApi(
                caminho,
                {
                    method: "GET"
                }
            );

        alteracoesCarregadas =
            resposta.alteracoes || [];

        aplicarPesquisaLocal();

    } catch (erro) {

        console.error(
            "Erro ao consultar alterações:",
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
            "Não foi possível consultar as alterações.",
            "erro"
        );

    } finally {

        definirCarregamento(false);

    }

}


/* =========================================================
   PAINEL DE DETALHES
   ========================================================= */

function abrirPainelDetalhes() {

    const painelEstavaFechado =
        fundoDetalhes.hidden;

    if (painelEstavaFechado) {

        elementoFocoAntesPainel =
            document.activeElement;

    }

    fundoDetalhes.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    if (painelEstavaFechado) {

        botaoFecharDetalhes.focus();

    }

}


function fecharPainelDetalhes() {

    fundoDetalhes.hidden =
        true;

    document.body.style.overflow =
        "";

    alteracaoAberta =
        null;

    if (
        elementoFocoAntesPainel &&
        document.contains(
            elementoFocoAntesPainel
        )
    ) {

        elementoFocoAntesPainel.focus();

    }

    elementoFocoAntesPainel =
        null;

}


function criarHtmlRevisaoConcluida(
    alteracao
) {

    const revisao =
        alteracao.revisao;

    return `

        <div class="aviso-revisao-concluida">

            <span
                class="aviso-revisao-concluida__icone"
                aria-hidden="true"
            >
                <svg
                    class="icone-sistema"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_ALTERACOES}#check-circle-fill"
                    ></use>
                </svg>
            </span>

            <div class="aviso-revisao-concluida__texto">

                <strong>
                    Alteração já revisada
                </strong>

                <p>
                    Revisada por
                    ${escaparHtml(
                        revisao.nome_administrador_revisor ||
                        "administrador não informado"
                    )}
                    em
                    ${escaparHtml(
                        formatarDataHora(
                            revisao.data_revisao
                        )
                    )}.
                </p>

                <p>
                    Observação:
                    ${escaparHtml(
                        revisao.observacao ||
                        "Nenhuma observação registrada."
                    )}
                </p>

            </div>

        </div>
    `;

}


function criarHtmlFormularioRevisao() {

    return `

        <div class="area-revisao-alteracao">

            <h3>
                Marcar como revisada
            </h3>

            <p>
                Esta ação apenas confirma que o administrador
                conferiu a mudança. O novo horário continuará
                registrado na jornada.
            </p>

            <label for="observacao-revisao">
                Observação opcional
            </label>

            <textarea
                id="observacao-revisao"
                maxlength="500"
                placeholder="Ex.: Horário conferido com o funcionário"
            ></textarea>

            <button
                type="button"
                id="botao-marcar-revisada"
                class="botao-marcar-revisada"
            >
                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_ALTERACOES}#clipboard-check-fill"
                    ></use>
                </svg>
                <span data-texto-revisao>
                    Marcar alteração como revisada
                </span>
            </button>

        </div>
    `;

}


function abrirDetalhesAlteracao(
    alteracao
) {

    alteracaoAberta =
        alteracao;

    const revisada =
        alteracao.alteracao.revisada;

    tituloDetalhes.textContent =
        obterTextoTipoRegistro(
            alteracao.registro
                .tipo_registro
        );

    conteudoDetalhes.innerHTML = `

        <section class="identidade-detalhe-alteracao">

            <div class="avatar-detalhe-alteracao">

                ${escaparHtml(
                    obterIniciaisNome(
                        alteracao.funcionario
                            .nome_completo
                    )
                )}

            </div>

            <div>

                <h3>
                    ${escaparHtml(
                        alteracao.funcionario
                            .nome_completo
                    )}
                </h3>

                <p>
                    ${escaparHtml(
                        formatarCpf(
                            alteracao.funcionario.cpf
                        )
                    )}
                </p>

            </div>

        </section>


        <section class="secao-detalhe-alteracao">

            <h3>
                Horário alterado
            </h3>

            <div class="comparacao-detalhe-alteracao">

                <div class="horario-detalhe-alteracao">

                    <span>
                        Horário anterior
                    </span>

                    <strong>
                        ${escaparHtml(
                            alteracao.alteracao
                                .horario_anterior
                        )}
                    </strong>

                </div>

                <span
                    class="seta-detalhe-alteracao"
                    aria-hidden="true"
                >
                    <svg
                        class="icone-sistema"
                        focusable="false"
                    >
                        <use
                            href="${CAMINHO_ICONES_ALTERACOES}#arrow-right"
                        ></use>
                    </svg>
                </span>

                <div class="horario-detalhe-alteracao novo">

                    <span>
                        Novo horário
                    </span>

                    <strong>
                        ${escaparHtml(
                            alteracao.alteracao
                                .horario_novo
                        )}
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhe-alteracao">

            <h3>
                Informações do registro
            </h3>

            <div class="grade-dados-alteracao">

                <div class="dado-detalhe-alteracao">

                    <span>
                        Data da jornada
                    </span>

                    <strong>
                        ${escaparHtml(
                            formatarData(
                                alteracao.registro
                                    .data_jornada
                            )
                        )}
                    </strong>

                </div>


                <div class="dado-detalhe-alteracao">

                    <span>
                        Tipo do horário
                    </span>

                    <strong>
                        ${escaparHtml(
                            obterTextoTipoRegistro(
                                alteracao.registro
                                    .tipo_registro
                            )
                        )}
                    </strong>

                </div>


                <div class="dado-detalhe-alteracao">

                    <span>
                        Alteração feita em
                    </span>

                    <strong>
                        ${escaparHtml(
                            formatarDataHora(
                                alteracao.alteracao
                                    .data_alteracao
                            )
                        )}
                    </strong>

                </div>


                <div class="dado-detalhe-alteracao">

                    <span>
                        Situação
                    </span>

                    <strong>
                        ${
                            revisada
                                ? "Revisada"
                                : "Aguardando revisão"
                        }
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhe-alteracao">

            <h3>
                Autor da alteração
            </h3>

            <div class="grade-dados-alteracao">

                <div class="dado-detalhe-alteracao">

                    <span>
                        Nome
                    </span>

                    <strong>
                        ${escaparHtml(
                            alteracao.autor
                                .nome_completo
                        )}
                    </strong>

                </div>


                <div class="dado-detalhe-alteracao">

                    <span>
                        Tipo de usuário
                    </span>

                    <strong>
                        ${escaparHtml(
                            obterTextoTipoUsuario(
                                alteracao.autor
                                    .tipo_usuario
                            )
                        )}
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhe-alteracao">

            ${
                revisada
                    ? criarHtmlRevisaoConcluida(
                        alteracao
                    )
                    : criarHtmlFormularioRevisao()
            }

        </section>
    `;

    if (!revisada) {

        document.getElementById(
            "botao-marcar-revisada"
        ).addEventListener(
            "click",
            revisarAlteracaoAberta
        );

    }

    abrirPainelDetalhes();

}


/* =========================================================
   REVISAR ALTERAÇÃO
   ========================================================= */

async function revisarAlteracaoAberta() {

    if (
        !alteracaoAberta ||
        alteracaoAberta.alteracao.revisada
    ) {

        return;

    }

    const botao =
        document.getElementById(
            "botao-marcar-revisada"
        );

    const campoObservacao =
        document.getElementById(
            "observacao-revisao"
        );

    const textoBotao =
        botao.querySelector(
            "[data-texto-revisao]"
        );

    botao.disabled =
        true;

    botao.classList.add(
        "carregando"
    );

    botao.setAttribute(
        "aria-busy",
        "true"
    );

    textoBotao.textContent =
        "Registrando revisão...";

    try {

        const idAlteracao =
            alteracaoAberta.id_alteracao;

        const resposta =
            await requisicaoApi(
                `/administracao/alteracoes/${idAlteracao}/revisar`,
                {
                    method: "PUT",

                    body: JSON.stringify({

                        observacao:
                            campoObservacao
                                .value
                                .trim() ||
                            null

                    })
                }
            );

        mostrarMensagemFlutuante(
            resposta.mensagem
        );

        fecharPainelDetalhes();

        await Promise.all([
            consultarResumoGeral(),
            consultarAlteracoes()
        ]);

    } catch (erro) {

        console.error(
            "Erro ao revisar alteração:",
            erro
        );

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível revisar a alteração.",
            "erro"
        );

        botao.disabled =
            false;

        botao.classList.remove(
            "carregando"
        );

        botao.setAttribute(
            "aria-busy",
            "false"
        );

        textoBotao.textContent =
            "Marcar alteração como revisada";

    }

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

        await consultarResumoGeral();

        await consultarAlteracoes();

    } catch (erro) {

        console.error(
            "Erro ao carregar alterações:",
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

botoesFiltroRevisao.forEach(
    botao => {

        botao.addEventListener(
            "click",
            async () => {

                botoesFiltroRevisao.forEach(
                    outroBotao => {

                        outroBotao.classList.remove(
                            "ativo"
                        );

                        outroBotao.setAttribute(
                            "aria-pressed",
                            "false"
                        );

                    }
                );

                botao.classList.add(
                    "ativo"
                );

                botao.setAttribute(
                    "aria-pressed",
                    "true"
                );

                filtroAtual =
                    botao.dataset
                        .filtroRevisao;

                await consultarAlteracoes();

            }
        );

    }
);


campoPesquisa.addEventListener(
    "input",
    () => {

        botaoLimparPesquisa.hidden =
            !campoPesquisa.value;

        window.clearTimeout(
            temporizadorPesquisa
        );

        temporizadorPesquisa =
            window.setTimeout(
                aplicarPesquisaLocal,
                250
            );

    }
);


botaoLimparPesquisa.addEventListener(
    "click",
    () => {

        campoPesquisa.value = "";

        botaoLimparPesquisa.hidden =
            true;

        campoPesquisa.focus();

        aplicarPesquisaLocal();

    }
);


botaoAtualizarAlteracoes.addEventListener(
    "click",
    async () => {

        await Promise.all([
            consultarResumoGeral(),
            consultarAlteracoes()
        ]);

    }
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

        await Promise.all([
            consultarResumoGeral(),
            consultarAlteracoes()
        ]);

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
