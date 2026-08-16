"use strict";


/* =========================================================
   CAMINHO DOS ÍCONES
   ========================================================= */

const CAMINHO_SPRITE_FERIADOS =
    "../icones/bootstrap-icons.svg";


/* =========================================================
   ELEMENTOS DA PÁGINA
   ========================================================= */

const carregamentoPagina =
    document.getElementById(
        "carregamento-pagina"
    );

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

const botaoAtualizar =
    document.getElementById(
        "botao-atualizar"
    );

const botaoSair =
    document.getElementById(
        "botao-sair"
    );

const botaoNovoFeriado =
    document.getElementById(
        "botao-novo-feriado"
    );

const botaoNovoFeriadoVazio =
    document.getElementById(
        "botao-novo-feriado-vazio"
    );


const resumoAtivos =
    document.getElementById(
        "resumo-ativos"
    );

const resumoInativos =
    document.getElementById(
        "resumo-inativos"
    );

const resumoTotal =
    document.getElementById(
        "resumo-total"
    );


const campoAno =
    document.getElementById(
        "campo-ano"
    );

const campoSituacao =
    document.getElementById(
        "campo-situacao"
    );

const campoBusca =
    document.getElementById(
        "campo-busca"
    );


const textoQuantidadeFeriados =
    document.getElementById(
        "texto-quantidade-feriados"
    );

const listaFeriados =
    document.getElementById(
        "lista-feriados"
    );

const estadoVazioFeriados =
    document.getElementById(
        "estado-vazio-feriados"
    );


/* Formulário */

const fundoFormularioFeriado =
    document.getElementById(
        "fundo-formulario-feriado"
    );

const formularioFeriado =
    document.getElementById(
        "formulario-feriado"
    );

const tituloFormularioFeriado =
    document.getElementById(
        "titulo-formulario-feriado"
    );

const descricaoFormularioFeriado =
    document.getElementById(
        "descricao-formulario-feriado"
    );

const campoDataFeriado =
    document.getElementById(
        "campo-data-feriado"
    );

const campoNomeFeriado =
    document.getElementById(
        "campo-nome-feriado"
    );

const campoDescricaoFeriado =
    document.getElementById(
        "campo-descricao-feriado"
    );

const contadorDescricao =
    document.getElementById(
        "contador-descricao"
    );

const grupoMotivoAlteracao =
    document.getElementById(
        "grupo-motivo-alteracao"
    );

const campoMotivoAlteracao =
    document.getElementById(
        "campo-motivo-alteracao"
    );

const botaoFecharFormulario =
    document.getElementById(
        "botao-fechar-formulario"
    );

const botaoCancelarFormulario =
    document.getElementById(
        "botao-cancelar-formulario"
    );

const botaoSalvarFeriado =
    document.getElementById(
        "botao-salvar-feriado"
    );

const textoBotaoSalvar =
    document.getElementById(
        "texto-botao-salvar"
    );

const botaoExcluirFeriado =
    document.getElementById(
        "botao-excluir-feriado"
    );


/* Exclusão */

const fundoExclusaoFeriado =
    document.getElementById(
        "fundo-exclusao-feriado"
    );

const dataFeriadoExclusao =
    document.getElementById(
        "data-feriado-exclusao"
    );

const nomeFeriadoExclusao =
    document.getElementById(
        "nome-feriado-exclusao"
    );

const botaoFecharExclusao =
    document.getElementById(
        "botao-fechar-exclusao"
    );

const botaoCancelarExclusao =
    document.getElementById(
        "botao-cancelar-exclusao"
    );

const botaoConfirmarExclusao =
    document.getElementById(
        "botao-confirmar-exclusao"
    );

const textoConfirmarExclusao =
    document.getElementById(
        "texto-confirmar-exclusao"
    );


/* Alteração de situação */

const fundoAlteracaoSituacao =
    document.getElementById(
        "fundo-alteracao-situacao"
    );

const tituloAlteracaoSituacao =
    document.getElementById(
        "titulo-alteracao-situacao"
    );

const descricaoAlteracaoSituacao =
    document.getElementById(
        "descricao-alteracao-situacao"
    );

const dataFeriadoSelecionado =
    document.getElementById(
        "data-feriado-selecionado"
    );

const nomeFeriadoSelecionado =
    document.getElementById(
        "nome-feriado-selecionado"
    );

const campoMotivoSituacao =
    document.getElementById(
        "campo-motivo-situacao"
    );

const botaoFecharAlteracao =
    document.getElementById(
        "botao-fechar-alteracao"
    );

const botaoCancelarAlteracao =
    document.getElementById(
        "botao-cancelar-alteracao"
    );

const botaoConfirmarAlteracao =
    document.getElementById(
        "botao-confirmar-alteracao"
    );

const textoConfirmarAlteracao =
    document.getElementById(
        "texto-confirmar-alteracao"
    );


/* Histórico */

const fundoHistoricoFeriado =
    document.getElementById(
        "fundo-historico-feriado"
    );

const nomeHistoricoFeriado =
    document.getElementById(
        "nome-historico-feriado"
    );

const botaoFecharHistorico =
    document.getElementById(
        "botao-fechar-historico"
    );

const carregamentoHistorico =
    document.getElementById(
        "carregamento-historico"
    );

const listaHistorico =
    document.getElementById(
        "lista-historico"
    );


/* Mensagem */

const mensagemFlutuante =
    document.getElementById(
        "mensagem-flutuante"
    );

const textoMensagemFlutuante =
    document.getElementById(
        "texto-mensagem-flutuante"
    );

const iconeMensagemFlutuante =
    document.getElementById(
        "icone-mensagem-flutuante"
    );


/* =========================================================
   ESTADO DA PÁGINA
   ========================================================= */

let feriadosCarregados = [];

let elementoFocoAntesFormulario = null;

let elementoFocoAntesAlteracao = null;

let elementoFocoAntesExclusao = null;

let elementoFocoAntesHistorico = null;

let modoFormulario = "CRIAR";

let feriadoSelecionado = null;

let acaoSituacaoAtual = null;

let paginaCarregada = false;

let salvandoFeriado = false;

let alterandoSituacao = false;

let excluindoFeriado = false;

let temporizadorMensagem = null;

let temporizadorPesquisa = null;


/* =========================================================
   SEGURANÇA E FORMATAÇÃO
   ========================================================= */

function escaparHtml(
    valor
) {

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
        caractere =>
            caracteres[caractere]
    );

}


function normalizarTexto(
    texto
) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


function criarIcone(
    nome,
    classeExtra = ""
) {

    const nomeSeguro =
        escaparHtml(
            nome
        );

    const classes = [
        "icone-sistema",
        classeExtra
    ]
        .filter(Boolean)
        .join(" ");

    return `
        <svg
            class="${classes}"
            aria-hidden="true"
            focusable="false"
        >
            <use
                href="${CAMINHO_SPRITE_FERIADOS}#${nomeSeguro}"
            ></use>
        </svg>
    `;

}


function criarDataLocal(
    dataIso
) {

    if (!dataIso) {

        return null;

    }

    const partes = String(
        dataIso
    )
        .slice(0, 10)
        .split("-")
        .map(Number);

    if (
        partes.length !== 3 ||
        partes.some(
            parte =>
                Number.isNaN(parte)
        )
    ) {

        return null;

    }

    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

}


function formatarData(
    dataIso
) {

    const data =
        criarDataLocal(
            dataIso
        );

    if (!data) {

        return "Data não informada";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(data);

}


function formatarDataHora(
    dataIso
) {

    if (!dataIso) {

        return "Não informado";

    }

    const textoIso =
        String(dataIso)
            .replace(
                " ",
                "T"
            );

    const data =
        new Date(
            textoIso
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return String(
            dataIso
        );

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(data);

}


function obterPartesData(
    dataIso
) {

    const data =
        criarDataLocal(
            dataIso
        );

    if (!data) {

        return {
            dia: "--",
            mes: "---",
            ano: "----"
        };

    }

    const meses = [
        "JAN",
        "FEV",
        "MAR",
        "ABR",
        "MAI",
        "JUN",
        "JUL",
        "AGO",
        "SET",
        "OUT",
        "NOV",
        "DEZ"
    ];

    return {

        dia: String(
            data.getDate()
        ).padStart(
            2,
            "0"
        ),

        mes: meses[
            data.getMonth()
        ],

        ano: String(
            data.getFullYear()
        )

    };

}


function obterTextoAcaoHistorico(
    acao
) {

    const textos = {

        CRIADO:
            "Feriado cadastrado",

        ALTERADO:
            "Informações alteradas",

        DESATIVADO:
            "Feriado desativado",

        REATIVADO:
            "Feriado reativado"

    };

    return textos[acao] ||
        acao ||
        "Alteração registrada";

}


function obterIconeAcaoHistorico(
    acao
) {

    const icones = {

        CRIADO:
            "calendar-plus",

        ALTERADO:
            "pencil",

        DESATIVADO:
            "calendar-x",

        REATIVADO:
            "calendar-check"

    };

    return icones[acao] ||
        "clock-history";

}


/* =========================================================
   NAVEGAÇÃO E SESSÃO
   ========================================================= */

function obterIniciaisNomeFeriados(
    nomeCompleto
) {

    const partes =
        String(
            nomeCompleto || ""
        )
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    return partes
        .slice(0, 2)
        .map(
            parte =>
                parte.charAt(0)
                    .toUpperCase()
        )
        .join("") || "--";

}


function preencherUsuarioFeriados(
    usuario
) {

    nomeUsuarioCabecalho.textContent =
        usuario.nome_completo;

    tipoUsuarioCabecalho.textContent =
        "Administrador";

    avatarUsuario.textContent =
        obterIniciaisNomeFeriados(
            usuario.nome_completo
        );

}


function atualizarEstadoConexaoFeriados() {

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
        botaoAtualizar.classList.contains(
            "carregando"
        );

}


function voltarParaLoginFeriados() {

    window.location.href =
        "../index.html";

}


function voltarParaInicioFeriados() {

    window.location.href =
        "inicio.html";

}


async function sairDaContaFeriados() {

    try {

        await requisicaoApi(
            "/autenticacao/logout",
            {
                method: "POST"
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao encerrar a sessão:",
            erro
        );

    } finally {

        if (
            typeof limparSessao ===
            "function"
        ) {

            limparSessao();

        }

        voltarParaLoginFeriados();

    }

}


async function validarAdministrador() {

    if (
        typeof usuarioEstaAutenticado ===
            "function" &&
        !usuarioEstaAutenticado()
    ) {

        voltarParaLoginFeriados();

        return false;

    }

    const usuarioSalvo = (
        typeof obterUsuarioSalvo ===
        "function"
    )
        ? obterUsuarioSalvo()
        : null;

    if (
        usuarioSalvo &&
        usuarioSalvo.tipo_usuario !==
            "ADMINISTRADOR"
    ) {

        voltarParaInicioFeriados();

        return false;

    }

    if (usuarioSalvo) {

        preencherUsuarioFeriados(
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
            usuarioAtualizado
                .tipo_usuario !==
            "ADMINISTRADOR"
        ) {

            voltarParaInicioFeriados();

            return false;

        }

        if (
            typeof CHAVES_SESSAO !==
            "undefined"
        ) {

            localStorage.setItem(
                CHAVES_SESSAO.USUARIO,
                JSON.stringify(
                    usuarioAtualizado
                )
            );

        }

        preencherUsuarioFeriados(
            usuarioAtualizado
        );

        return true;

    } catch (erro) {

        tratarErroAutenticacao(
            erro
        );

        return false;

    }

}


function tratarErroAutenticacao(
    erro
) {

    if (
        erro &&
        erro.status === 401
    ) {

        if (
            typeof limparSessao ===
            "function"
        ) {

            limparSessao();

        }

        voltarParaLoginFeriados();

        return true;

    }

    if (
        erro &&
        erro.status === 403
    ) {

        voltarParaInicioFeriados();

        return true;

    }

    return false;

}


/* =========================================================
   CARREGAMENTO E MENSAGENS
   ========================================================= */

function definirCarregamentoPagina(
    carregando
) {

    carregamentoPagina.hidden =
        !carregando;

}


function atualizarBloqueioRolagem() {

    const existeModalAberto = (
        !fundoFormularioFeriado.hidden ||
        !fundoExclusaoFeriado.hidden ||
        !fundoAlteracaoSituacao.hidden ||
        !fundoHistoricoFeriado.hidden
    );

    document.body.style.overflow =
        existeModalAberto
            ? "hidden"
            : "";

}


function mostrarMensagem(
    texto,
    tipo = "sucesso"
) {

    window.clearTimeout(
        temporizadorMensagem
    );

    mensagemFlutuante.classList.toggle(
        "erro",
        tipo === "erro"
    );

    textoMensagemFlutuante.textContent =
        texto;

    const nomeIcone = (
        tipo === "erro"
    )
        ? "exclamation-circle-fill"
        : "check-circle-fill";

    iconeMensagemFlutuante
        .querySelector("use")
        .setAttribute(
            "href",
            `${CAMINHO_SPRITE_FERIADOS}#${nomeIcone}`
        );

    mensagemFlutuante.hidden =
        false;

    temporizadorMensagem =
        window.setTimeout(
            () => {

                mensagemFlutuante.hidden =
                    true;

            },
            5000
        );

}


function montarMensagemRecalculo(
    resposta,
    mensagemPadrao
) {

    const recalculo =
        resposta &&
        resposta.recalculo_jornadas;

    if (!recalculo) {

        return mensagemPadrao;

    }

    const recalculadas =
        Number(
            recalculo
                .jornadas_recalculadas ||
            0
        );

    const ignoradas =
        Number(
            recalculo
                .jornadas_ignoradas ||
            0
        );

    if (
        recalculadas === 0 &&
        ignoradas === 0
    ) {

        return (
            `${mensagemPadrao} ` +
            "Nenhuma jornada concluída precisava ser recalculada."
        );

    }

    let mensagem = (
        `${mensagemPadrao} ` +
        `${recalculadas} jornada` +
        `${recalculadas === 1 ? "" : "s"} ` +
        `${recalculadas === 1
            ? "foi recalculada"
            : "foram recalculadas"}.`
    );

    if (ignoradas > 0) {

        mensagem += (
            ` ${ignoradas} jornada` +
            `${ignoradas === 1 ? "" : "s"} ` +
            `${ignoradas === 1
                ? "foi ignorada"
                : "foram ignoradas"} ` +
            "por estar incompleta."
        );

    }

    return mensagem;

}


/* =========================================================
   ANOS
   ========================================================= */

function preencherAnos() {

    const anoAtual =
        new Date()
            .getFullYear();

    campoAno.innerHTML = "";

    for (
        let ano = anoAtual - 4;
        ano <= anoAtual + 5;
        ano += 1
    ) {

        const opcao =
            document.createElement(
                "option"
            );

        opcao.value =
            String(ano);

        opcao.textContent =
            String(ano);

        if (ano === anoAtual) {

            opcao.selected =
                true;

        }

        campoAno.appendChild(
            opcao
        );

    }

}


/* =========================================================
   CONSULTA
   ========================================================= */

async function consultarFeriados(
    mostrarConfirmacao = false
) {

    if (!navigator.onLine) {

        mostrarMensagem(
            "Não foi possível atualizar os feriados porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    botaoAtualizar.disabled =
        true;

    botaoAtualizar.classList.add(
        "carregando"
    );

    botaoAtualizar.setAttribute(
        "aria-busy",
        "true"
    );

    try {

        const ano =
            Number(
                campoAno.value
            );

        const dataInicio =
            `${ano}-01-01`;

        const dataFim =
            `${ano}-12-31`;

        const parametros =
            new URLSearchParams(
                {
                    data_inicio:
                        dataInicio,

                    data_fim:
                        dataFim,

                    incluir_inativos:
                        "true"
                }
            );

        const resposta =
            await requisicaoApi(
                `/administracao/feriados?${parametros.toString()}`,
                {
                    method: "GET"
                }
            );

        feriadosCarregados =
            resposta.feriados || [];

        atualizarResumo();

        aplicarFiltros();

        if (mostrarConfirmacao) {

            mostrarMensagem(
                "Feriados atualizados com sucesso!"
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao consultar feriados:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {

            return;

        }

        mostrarMensagem(
            erro.message ||
            "Não foi possível consultar os feriados.",
            "erro"
        );

    } finally {

        botaoAtualizar.classList.remove(
            "carregando"
        );

        botaoAtualizar.setAttribute(
            "aria-busy",
            "false"
        );

        atualizarEstadoConexaoFeriados();

    }

}


/* =========================================================
   RESUMO E FILTROS
   ========================================================= */

function atualizarResumo() {

    const quantidadeAtivos =
        feriadosCarregados.filter(
            feriado =>
                Boolean(
                    feriado.ativo
                )
        ).length;

    const quantidadeInativos =
        feriadosCarregados.length -
        quantidadeAtivos;

    resumoAtivos.textContent =
        String(
            quantidadeAtivos
        );

    resumoInativos.textContent =
        String(
            quantidadeInativos
        );

    resumoTotal.textContent =
        String(
            feriadosCarregados.length
        );

}


function feriadoCorrespondeAosFiltros(
    feriado
) {

    const situacao =
        campoSituacao.value;

    if (
        situacao === "ATIVOS" &&
        !feriado.ativo
    ) {

        return false;

    }

    if (
        situacao === "INATIVOS" &&
        feriado.ativo
    ) {

        return false;

    }

    const busca =
        normalizarTexto(
            campoBusca.value
        );

    if (!busca) {

        return true;

    }

    const textoFeriado =
        normalizarTexto(
            [
                feriado.nome_feriado,
                feriado.descricao,
                feriado.data_feriado
            ].join(" ")
        );

    return textoFeriado.includes(
        busca
    );

}


function aplicarFiltros() {

    const feriadosFiltrados =
        feriadosCarregados.filter(
            feriadoCorrespondeAosFiltros
        );

    renderizarFeriados(
        feriadosFiltrados
    );

}


/* =========================================================
   RENDERIZAÇÃO DOS FERIADOS
   ========================================================= */

function renderizarFeriados(
    feriados
) {

    listaFeriados.innerHTML =
        "";

    estadoVazioFeriados.hidden =
        feriados.length !== 0;

    listaFeriados.hidden =
        feriados.length === 0;

    textoQuantidadeFeriados.textContent = (
        feriados.length === 0
    )
        ? "Nenhum feriado encontrado"
        : (
            feriados.length === 1
                ? "1 feriado encontrado"
                : `${feriados.length} feriados encontrados`
        );

    feriados.forEach(
        feriado => {

            listaFeriados.appendChild(
                criarCartaoFeriado(
                    feriado
                )
            );

        }
    );

}


function criarCartaoFeriado(
    feriado
) {

    const artigo =
        document.createElement(
            "article"
        );

    artigo.className = (
        "cartao-feriado" +
        (
            feriado.ativo
                ? ""
                : " inativo"
        )
    );

    const partesData =
        obterPartesData(
            feriado.data_feriado
        );

    const descricao = (
        feriado.descricao ||
        "Nenhuma descrição foi informada."
    );

    const nomeAdministrador = (
        feriado.administrador_criacao &&
        feriado.administrador_criacao
            .nome_completo
    )
        ? feriado.administrador_criacao
            .nome_completo
        : "Administrador";

    const textoSituacao =
        feriado.ativo
            ? "Ativo"
            : "Desativado";

    const iconeSituacao =
        feriado.ativo
            ? "check-circle-fill"
            : "x-circle-fill";

    const textoBotaoSituacao =
        feriado.ativo
            ? "Desativar"
            : "Reativar";

    const iconeBotaoSituacao =
        feriado.ativo
            ? "calendar-x"
            : "calendar-check";

    artigo.innerHTML = `

        <div class="conteudo-cartao-feriado">

            <div class="cabecalho-cartao-feriado">

                <div class="data-cartao-feriado">

                    <span class="data-cartao-feriado__mes">
                        ${escaparHtml(
                            partesData.mes
                        )}
                    </span>

                    <strong class="data-cartao-feriado__dia">
                        ${escaparHtml(
                            partesData.dia
                        )}
                    </strong>

                    <span class="data-cartao-feriado__ano">
                        ${escaparHtml(
                            partesData.ano
                        )}
                    </span>

                </div>


                <div class="informacoes-cartao-feriado">

                    <div class="linha-titulo-cartao-feriado">

                        <h3>
                            ${escaparHtml(
                                feriado.nome_feriado
                            )}
                        </h3>

                        <span
                            class="
                                etiqueta-situacao-feriado
                                ${feriado.ativo
                                    ? "ativo"
                                    : "inativo"}
                            "
                        >

                            ${criarIcone(
                                iconeSituacao
                            )}

                            ${textoSituacao}

                        </span>

                    </div>


                    <p class="descricao-cartao-feriado">
                        ${escaparHtml(
                            descricao
                        )}
                    </p>


                    <div class="metadados-cartao-feriado">

                        <span>

                            ${criarIcone(
                                "person"
                            )}

                            ${escaparHtml(
                                nomeAdministrador
                            )}

                        </span>


                        <span>

                            ${criarIcone(
                                "clock"
                            )}

                            ${escaparHtml(
                                formatarDataHora(
                                    feriado.data_criacao
                                )
                            )}

                        </span>

                    </div>

                </div>

            </div>

        </div>


        <div class="acoes-cartao-feriado">

            <button
                type="button"
                class="botao-acao-feriado"
                data-acao="editar"
            >

                ${criarIcone(
                    "pencil"
                )}

                Editar

            </button>


            <button
                type="button"
                class="botao-acao-feriado"
                data-acao="historico"
            >

                ${criarIcone(
                    "clock-history"
                )}

                Histórico

            </button>


            <button
                type="button"
                class="
                    botao-acao-feriado
                    situacao
                    ${feriado.ativo
                        ? ""
                        : "reativar"}
                "
                data-acao="situacao"
            >

                ${criarIcone(
                    iconeBotaoSituacao
                )}

                ${textoBotaoSituacao}

            </button>

        </div>
    `;

    artigo
        .querySelector(
            '[data-acao="editar"]'
        )
        .addEventListener(
            "click",
            () => {

                abrirFormularioEdicao(
                    feriado
                );

            }
        );

    artigo
        .querySelector(
            '[data-acao="historico"]'
        )
        .addEventListener(
            "click",
            () => {

                abrirHistorico(
                    feriado
                );

            }
        );

    artigo
        .querySelector(
            '[data-acao="situacao"]'
        )
        .addEventListener(
            "click",
            () => {

                abrirAlteracaoSituacao(
                    feriado
                );

            }
        );

    return artigo;

}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

function abrirFormularioCriacao() {

    elementoFocoAntesFormulario =
        document.activeElement;

    modoFormulario =
        "CRIAR";

    feriadoSelecionado =
        null;

    formularioFeriado.reset();

    tituloFormularioFeriado.textContent =
        "Novo feriado";

    descricaoFormularioFeriado.textContent =
        "Informe a data e os dados do feriado.";

    textoBotaoSalvar.textContent =
        "Cadastrar feriado";

    botaoExcluirFeriado.hidden =
        true;

    campoDataFeriado.disabled =
        false;

    grupoMotivoAlteracao.hidden =
        true;

    contadorDescricao.textContent =
        "0";

    fundoFormularioFeriado.hidden =
        false;

    atualizarBloqueioRolagem();

    window.setTimeout(
        () => {

            campoDataFeriado.focus();

        },
        100
    );

}


function abrirFormularioEdicao(
    feriado
) {

    elementoFocoAntesFormulario =
        document.activeElement;

    modoFormulario =
        "EDITAR";

    feriadoSelecionado =
        feriado;

    formularioFeriado.reset();

    tituloFormularioFeriado.textContent =
        "Editar feriado";

    descricaoFormularioFeriado.textContent =
        "A data será mantida e a alteração ficará no histórico.";

    textoBotaoSalvar.textContent =
        "Salvar alteração";

    botaoExcluirFeriado.hidden =
        false;

    campoDataFeriado.value =
        feriado.data_feriado;

    campoDataFeriado.disabled =
        true;

    campoNomeFeriado.value =
        feriado.nome_feriado || "";

    campoDescricaoFeriado.value =
        feriado.descricao || "";

    campoMotivoAlteracao.value =
        "";

    grupoMotivoAlteracao.hidden =
        false;

    atualizarContadorDescricao();

    fundoFormularioFeriado.hidden =
        false;

    atualizarBloqueioRolagem();

    window.setTimeout(
        () => {

            campoNomeFeriado.focus();

        },
        100
    );

}


function fecharFormulario() {

    if (
        salvandoFeriado ||
        excluindoFeriado
    ) {

        return;

    }

    fundoFormularioFeriado.hidden =
        true;

    formularioFeriado.reset();

    feriadoSelecionado =
        null;

    atualizarBloqueioRolagem();

    if (
        elementoFocoAntesFormulario &&
        document.contains(
            elementoFocoAntesFormulario
        )
    ) {

        elementoFocoAntesFormulario.focus();

    }

    elementoFocoAntesFormulario =
        null;

}


function atualizarContadorDescricao() {

    contadorDescricao.textContent =
        String(
            campoDescricaoFeriado
                .value
                .length
        );

}


async function salvarFeriado(
    evento
) {

    evento.preventDefault();

    if (salvandoFeriado) {

        return;

    }

    const nomeFeriado =
        campoNomeFeriado
            .value
            .trim();

    if (!nomeFeriado) {

        mostrarMensagem(
            "Informe o nome do feriado.",
            "erro"
        );

        campoNomeFeriado.focus();

        return;

    }

    if (
        modoFormulario === "CRIAR" &&
        !campoDataFeriado.value
    ) {

        mostrarMensagem(
            "Informe a data do feriado.",
            "erro"
        );

        campoDataFeriado.focus();

        return;

    }

    if (!navigator.onLine) {

        mostrarMensagem(
            "Não foi possível salvar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    salvandoFeriado =
        true;

    botaoSalvarFeriado.disabled =
        true;

    botaoSalvarFeriado.setAttribute(
        "aria-busy",
        "true"
    );

    textoBotaoSalvar.textContent =
        "Salvando...";

    try {

        let resposta;

        if (
            modoFormulario ===
            "CRIAR"
        ) {

            resposta =
                await requisicaoApi(
                    "/administracao/feriados",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            {
                                data_feriado:
                                    campoDataFeriado
                                        .value,

                                nome_feriado:
                                    nomeFeriado,

                                descricao:
                                    campoDescricaoFeriado
                                        .value
                                        .trim() ||
                                    null
                            }
                        )
                    }
                );

        } else {

            resposta =
                await requisicaoApi(
                    `/administracao/feriados/${feriadoSelecionado.id_feriado}`,
                    {
                        method: "PUT",

                        body: JSON.stringify(
                            {
                                nome_feriado:
                                    nomeFeriado,

                                descricao:
                                    campoDescricaoFeriado
                                        .value
                                        .trim() ||
                                    null,

                                motivo_alteracao:
                                    campoMotivoAlteracao
                                        .value
                                        .trim() ||
                                    null
                            }
                        )
                    }
                );

        }

        salvandoFeriado =
            false;

        fecharFormulario();

        await consultarFeriados();

        const mensagemPadrao = (
            modoFormulario === "CRIAR"
        )
            ? "Feriado cadastrado com sucesso!"
            : "Feriado alterado com sucesso!";

        mostrarMensagem(
            montarMensagemRecalculo(
                resposta,
                mensagemPadrao
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar feriado:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {

            return;

        }

        mostrarMensagem(
            erro.message ||
            "Não foi possível salvar o feriado.",
            "erro"
        );

    } finally {

        salvandoFeriado =
            false;

        botaoSalvarFeriado.disabled =
            false;

        botaoSalvarFeriado.setAttribute(
            "aria-busy",
            "false"
        );

        textoBotaoSalvar.textContent = (
            modoFormulario === "CRIAR"
        )
            ? "Cadastrar feriado"
            : "Salvar alteração";

    }

}


/* =========================================================
   EXCLUSÃO
   ========================================================= */

function abrirConfirmacaoExclusao() {

    if (
        modoFormulario !== "EDITAR" ||
        !feriadoSelecionado
    ) {

        return;

    }

    elementoFocoAntesExclusao =
        document.activeElement;

    dataFeriadoExclusao.textContent =
        formatarData(
            feriadoSelecionado.data_feriado
        );

    nomeFeriadoExclusao.textContent =
        feriadoSelecionado.nome_feriado;

    fundoExclusaoFeriado.hidden =
        false;

    atualizarBloqueioRolagem();

    botaoFecharExclusao.focus();

}


function fecharConfirmacaoExclusao() {

    if (excluindoFeriado) {

        return;

    }

    fundoExclusaoFeriado.hidden =
        true;

    atualizarBloqueioRolagem();

    if (
        elementoFocoAntesExclusao &&
        document.contains(
            elementoFocoAntesExclusao
        )
    ) {

        elementoFocoAntesExclusao.focus();

    }

    elementoFocoAntesExclusao =
        null;

}


async function confirmarExclusaoFeriado() {

    if (
        excluindoFeriado ||
        !feriadoSelecionado
    ) {

        return;

    }

    if (!navigator.onLine) {

        mostrarMensagem(
            "Não foi possível excluir porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    excluindoFeriado =
        true;

    botaoConfirmarExclusao.disabled =
        true;

    botaoConfirmarExclusao.setAttribute(
        "aria-busy",
        "true"
    );

    textoConfirmarExclusao.textContent =
        "Excluindo...";

    try {

        const resposta =
            await requisicaoApi(
                `/administracao/feriados/${feriadoSelecionado.id_feriado}`,
                {
                    method: "DELETE"
                }
            );

        excluindoFeriado =
            false;

        fecharConfirmacaoExclusao();
        fecharFormulario();

        await consultarFeriados();

        mostrarMensagem(
            montarMensagemRecalculo(
                resposta,
                "Feriado excluído definitivamente."
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao excluir feriado:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {

            return;

        }

        mostrarMensagem(
            erro.message ||
            "Não foi possível excluir o feriado.",
            "erro"
        );

    } finally {

        excluindoFeriado =
            false;

        botaoConfirmarExclusao.disabled =
            false;

        botaoConfirmarExclusao.setAttribute(
            "aria-busy",
            "false"
        );

        textoConfirmarExclusao.textContent =
            "Excluir definitivamente";

    }

}


/* =========================================================
   DESATIVAÇÃO E REATIVAÇÃO
   ========================================================= */

function abrirAlteracaoSituacao(
    feriado
) {

    elementoFocoAntesAlteracao =
        document.activeElement;

    feriadoSelecionado =
        feriado;

    campoMotivoSituacao.value =
        "";

    dataFeriadoSelecionado.textContent =
        formatarData(
            feriado.data_feriado
        );

    nomeFeriadoSelecionado.textContent =
        feriado.nome_feriado;

    if (feriado.ativo) {

        acaoSituacaoAtual =
            "DESATIVAR";

        tituloAlteracaoSituacao.textContent =
            "Desativar feriado";

        descricaoAlteracaoSituacao.textContent =
            "A data deixará de ser tratada como feriado.";

        textoConfirmarAlteracao.textContent =
            "Desativar";

    } else {

        acaoSituacaoAtual =
            "REATIVAR";

        tituloAlteracaoSituacao.textContent =
            "Reativar feriado";

        descricaoAlteracaoSituacao.textContent =
            "A data voltará a ser tratada como feriado.";

        textoConfirmarAlteracao.textContent =
            "Reativar";

    }

    fundoAlteracaoSituacao.hidden =
        false;

    atualizarBloqueioRolagem();

    botaoFecharAlteracao.focus();

}


function fecharAlteracaoSituacao() {

    if (alterandoSituacao) {

        return;

    }

    fundoAlteracaoSituacao.hidden =
        true;

    feriadoSelecionado =
        null;

    acaoSituacaoAtual =
        null;

    campoMotivoSituacao.value =
        "";

    atualizarBloqueioRolagem();

    if (
        elementoFocoAntesAlteracao &&
        document.contains(
            elementoFocoAntesAlteracao
        )
    ) {

        elementoFocoAntesAlteracao.focus();

    }

    elementoFocoAntesAlteracao =
        null;

}


async function confirmarAlteracaoSituacao() {

    if (
        alterandoSituacao ||
        !feriadoSelecionado ||
        !acaoSituacaoAtual
    ) {

        return;

    }

    if (!navigator.onLine) {

        mostrarMensagem(
            "Não foi possível alterar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    alterandoSituacao =
        true;

    botaoConfirmarAlteracao.disabled =
        true;

    botaoConfirmarAlteracao.setAttribute(
        "aria-busy",
        "true"
    );

    textoConfirmarAlteracao.textContent =
        "Salvando...";

    try {

        const complementoRota = (
            acaoSituacaoAtual ===
            "DESATIVAR"
        )
            ? "desativar"
            : "reativar";

        const resposta =
            await requisicaoApi(
                `/administracao/feriados/${feriadoSelecionado.id_feriado}/${complementoRota}`,
                {
                    method: "PATCH",

                    body: JSON.stringify(
                        {
                            motivo_alteracao:
                                campoMotivoSituacao
                                    .value
                                    .trim() ||
                                null
                        }
                    )
                }
            );

        const mensagemPadrao = (
            acaoSituacaoAtual ===
            "DESATIVAR"
        )
            ? "Feriado desativado com sucesso!"
            : "Feriado reativado com sucesso!";

        alterandoSituacao =
            false;

        fecharAlteracaoSituacao();

        await consultarFeriados();

        mostrarMensagem(
            montarMensagemRecalculo(
                resposta,
                mensagemPadrao
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao alterar situação do feriado:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {

            return;

        }

        mostrarMensagem(
            erro.message ||
            "Não foi possível alterar a situação do feriado.",
            "erro"
        );

    } finally {

        alterandoSituacao =
            false;

        botaoConfirmarAlteracao.disabled =
            false;

        botaoConfirmarAlteracao.setAttribute(
            "aria-busy",
            "false"
        );

        textoConfirmarAlteracao.textContent = (
            acaoSituacaoAtual ===
            "REATIVAR"
        )
            ? "Reativar"
            : "Desativar";

    }

}


/* =========================================================
   HISTÓRICO
   ========================================================= */

async function abrirHistorico(
    feriado
) {

    elementoFocoAntesHistorico =
        document.activeElement;

    feriadoSelecionado =
        feriado;

    nomeHistoricoFeriado.textContent =
        `${feriado.nome_feriado} • ${formatarData(
            feriado.data_feriado
        )}`;

    listaHistorico.innerHTML =
        "";

    carregamentoHistorico.hidden =
        false;

    fundoHistoricoFeriado.hidden =
        false;

    atualizarBloqueioRolagem();

    botaoFecharHistorico.focus();

    try {

        const resposta =
            await requisicaoApi(
                `/administracao/feriados/${feriado.id_feriado}/historico`,
                {
                    method: "GET"
                }
            );

        renderizarHistorico(
            resposta.historico || []
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar histórico:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {

            return;

        }

        listaHistorico.innerHTML = `

            <div class="estado-vazio-feriados">

                <span class="estado-vazio-feriados__icone">

                    ${criarIcone(
                        "exclamation-circle"
                    )}

                </span>

                <h3>
                    Não foi possível carregar
                </h3>

                <p>
                    ${escaparHtml(
                        erro.message ||
                        "O histórico do feriado não pôde ser consultado."
                    )}
                </p>

            </div>
        `;

    } finally {

        carregamentoHistorico.hidden =
            true;

    }

}


function fecharHistorico() {

    fundoHistoricoFeriado.hidden =
        true;

    listaHistorico.innerHTML =
        "";

    feriadoSelecionado =
        null;

    atualizarBloqueioRolagem();

    if (
        elementoFocoAntesHistorico &&
        document.contains(
            elementoFocoAntesHistorico
        )
    ) {

        elementoFocoAntesHistorico.focus();

    }

    elementoFocoAntesHistorico =
        null;

}


function renderizarHistorico(
    historico
) {

    listaHistorico.innerHTML =
        "";

    if (!historico.length) {

        listaHistorico.innerHTML = `

            <div class="estado-vazio-feriados">

                <span class="estado-vazio-feriados__icone">

                    ${criarIcone(
                        "clock-history"
                    )}

                </span>

                <h3>
                    Histórico vazio
                </h3>

                <p>
                    Nenhuma alteração foi encontrada.
                </p>

            </div>
        `;

        return;

    }

    historico.forEach(
        registro => {

            listaHistorico.appendChild(
                criarItemHistorico(
                    registro
                )
            );

        }
    );

}


function criarItemHistorico(
    registro
) {

    const item =
        document.createElement(
            "article"
        );

    item.className =
        "item-historico-feriados";

    const motivo = (
        registro.motivo_alteracao
    )
        ? `
            <p>
                <strong>Motivo:</strong>
                ${escaparHtml(
                    registro.motivo_alteracao
                )}
            </p>
        `
        : "";

    let alteracoes = "";

    if (
        registro.nome_anterior &&
        registro.nome_novo &&
        registro.nome_anterior !==
            registro.nome_novo
    ) {

        alteracoes += `

            <div class="dado-alteracao-historico">

                <strong>Nome:</strong>

                ${escaparHtml(
                    registro.nome_anterior
                )}

                →

                ${escaparHtml(
                    registro.nome_novo
                )}

            </div>
        `;

    }

    if (
        registro.descricao_anterior !==
        registro.descricao_nova
    ) {

        alteracoes += `

            <div class="dado-alteracao-historico">

                <strong>Descrição:</strong>

                ${escaparHtml(
                    registro.descricao_anterior ||
                    "Sem descrição"
                )}

                →

                ${escaparHtml(
                    registro.descricao_nova ||
                    "Sem descrição"
                )}

            </div>
        `;

    }

    item.innerHTML = `

        <span class="marcador-historico-feriados">

            ${criarIcone(
                obterIconeAcaoHistorico(
                    registro.acao_realizada
                )
            )}

        </span>


        <div class="conteudo-historico-feriados">

            <div class="cabecalho-item-historico">

                <strong>
                    ${escaparHtml(
                        obterTextoAcaoHistorico(
                            registro.acao_realizada
                        )
                    )}
                </strong>

                <time>
                    ${escaparHtml(
                        formatarDataHora(
                            registro.data_alteracao
                        )
                    )}
                </time>

            </div>


            <p>

                Realizado por

                <strong>
                    ${escaparHtml(
                        registro.administrador
                            ?.nome_completo ||
                        "Administrador"
                    )}
                </strong>

            </p>


            ${motivo}


            ${
                alteracoes
                    ? `
                        <div class="dados-alteracao-historico">
                            ${alteracoes}
                        </div>
                    `
                    : ""
            }

        </div>
    `;

    return item;

}


/* =========================================================
   EVENTOS
   ========================================================= */

botaoSair.addEventListener(
    "click",
    sairDaContaFeriados
);


botaoAtualizar.addEventListener(
    "click",
    () => {

        consultarFeriados(
            true
        );

    }
);


botaoNovoFeriado.addEventListener(
    "click",
    abrirFormularioCriacao
);


botaoNovoFeriadoVazio.addEventListener(
    "click",
    abrirFormularioCriacao
);


campoAno.addEventListener(
    "change",
    () => {

        consultarFeriados();

    }
);


campoSituacao.addEventListener(
    "change",
    aplicarFiltros
);


campoBusca.addEventListener(
    "input",
    () => {

        window.clearTimeout(
            temporizadorPesquisa
        );

        temporizadorPesquisa =
            window.setTimeout(
                aplicarFiltros,
                250
            );

    }
);


campoDescricaoFeriado.addEventListener(
    "input",
    atualizarContadorDescricao
);


formularioFeriado.addEventListener(
    "submit",
    salvarFeriado
);


botaoFecharFormulario.addEventListener(
    "click",
    fecharFormulario
);


botaoCancelarFormulario.addEventListener(
    "click",
    fecharFormulario
);


botaoExcluirFeriado.addEventListener(
    "click",
    abrirConfirmacaoExclusao
);


botaoFecharExclusao.addEventListener(
    "click",
    fecharConfirmacaoExclusao
);


botaoCancelarExclusao.addEventListener(
    "click",
    fecharConfirmacaoExclusao
);


botaoConfirmarExclusao.addEventListener(
    "click",
    confirmarExclusaoFeriado
);


botaoFecharAlteracao.addEventListener(
    "click",
    fecharAlteracaoSituacao
);


botaoCancelarAlteracao.addEventListener(
    "click",
    fecharAlteracaoSituacao
);


botaoConfirmarAlteracao.addEventListener(
    "click",
    confirmarAlteracaoSituacao
);


botaoFecharHistorico.addEventListener(
    "click",
    fecharHistorico
);


fundoFormularioFeriado.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoFormularioFeriado
        ) {

            fecharFormulario();

        }

    }
);


fundoExclusaoFeriado.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoExclusaoFeriado
        ) {

            fecharConfirmacaoExclusao();

        }

    }
);


fundoAlteracaoSituacao.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoAlteracaoSituacao
        ) {

            fecharAlteracaoSituacao();

        }

    }
);


fundoHistoricoFeriado.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoHistoricoFeriado
        ) {

            fecharHistorico();

        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key !==
            "Escape"
        ) {

            return;

        }

        if (
            !fundoHistoricoFeriado.hidden
        ) {

            fecharHistorico();

            return;

        }

        if (
            !fundoExclusaoFeriado.hidden
        ) {

            fecharConfirmacaoExclusao();

            return;

        }

        if (
            !fundoAlteracaoSituacao.hidden
        ) {

            fecharAlteracaoSituacao();

            return;

        }

        if (
            !fundoFormularioFeriado.hidden
        ) {

            fecharFormulario();

        }

    }
);


window.addEventListener(
    "online",
    async () => {

        atualizarEstadoConexaoFeriados();

        if (paginaCarregada) {

            await consultarFeriados();

        }

    }
);


window.addEventListener(
    "offline",
    atualizarEstadoConexaoFeriados
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function carregarPaginaFeriados() {

    definirCarregamentoPagina(
        true
    );

    preencherAnos();

    const administradorValido =
        await validarAdministrador();

    if (!administradorValido) {

        return;

    }

    try {

        await consultarFeriados();

        paginaCarregada =
            true;

    } finally {

        definirCarregamentoPagina(
            false
        );

    }

}


atualizarEstadoConexaoFeriados();


document.addEventListener(
    "DOMContentLoaded",
    carregarPaginaFeriados
);
