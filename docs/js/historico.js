"use strict";


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CAMINHO_ICONES_HISTORICO =
    "../icones/bootstrap-icons.svg";

const LIMITE_INICIAL_JORNADAS = 5;


/* =========================================================
   ELEMENTOS DO USUÁRIO
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

const botaoAdministracao = document.getElementById(
    "botao-administracao"
);

const botaoSair = document.getElementById(
    "botao-sair"
);

const indicadorConexao = document.getElementById(
    "indicador-conexao"
);


/* =========================================================
   CALENDÁRIO
   ========================================================= */

const tituloMesCalendario = document.getElementById(
    "titulo-mes-calendario"
);

const botaoMesAnterior = document.getElementById(
    "botao-mes-anterior"
);

const botaoVoltarHoje = document.getElementById(
    "botao-voltar-hoje"
);

const botaoProximoMes = document.getElementById(
    "botao-proximo-mes"
);

const gradeDiasCalendario = document.getElementById(
    "grade-dias-calendario"
);

const carregamentoCalendario = document.getElementById(
    "carregamento-calendario"
);


/* =========================================================
   DIA SELECIONADO
   ========================================================= */

const tituloDiaSelecionado = document.getElementById(
    "titulo-dia-selecionado"
);

const descricaoDiaSelecionado = document.getElementById(
    "descricao-dia-selecionado"
);

const botaoAbrirDetalhesDia = document.getElementById(
    "botao-abrir-detalhes-dia"
);

const carregamentoDiaSelecionado = document.getElementById(
    "carregamento-dia-selecionado"
);

const conteudoDiaSelecionado = document.getElementById(
    "conteudo-dia-selecionado"
);


/* =========================================================
   FILTROS
   ========================================================= */

const botoesPeriodo = document.querySelectorAll(
    "[data-periodo]"
);

const campoDataInicio = document.getElementById(
    "data-inicio"
);

const campoDataFim = document.getElementById(
    "data-fim"
);

const botaoConsultar = document.getElementById(
    "botao-consultar"
);

const mensagemFiltro = document.getElementById(
    "mensagem-filtro"
);


/* =========================================================
   RESUMO E LISTA
   ========================================================= */

const totalJornadas = document.getElementById(
    "total-jornadas"
);

const totalTrabalhado = document.getElementById(
    "total-trabalhado"
);

const totalExtras = document.getElementById(
    "total-extras"
);

const totalSaldo = document.getElementById(
    "total-saldo"
);

const descricaoPeriodoConsultado = document.getElementById(
    "descricao-periodo-consultado"
);

const estadoCarregamento = document.getElementById(
    "estado-carregamento"
);

const estadoVazio = document.getElementById(
    "estado-vazio"
);

const listaJornadas = document.getElementById(
    "lista-jornadas"
);

const areaVerMais = document.getElementById(
    "area-ver-mais"
);

const botaoVerMais = document.getElementById(
    "botao-ver-mais"
);

const textoBotaoVerMais = document.getElementById(
    "texto-botao-ver-mais"
);

const iconeBotaoVerMais = document.getElementById(
    "icone-botao-ver-mais"
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
   CRIAÇÃO DE JORNADA PASSADA
   ========================================================= */

const fundoCriacaoJornada = document.getElementById(
    "fundo-criacao-jornada"
);

const formularioCriacaoJornada = document.getElementById(
    "formulario-criacao-jornada"
);

const dataCriacaoJornadaTexto = document.getElementById(
    "data-criacao-jornada"
);

const camposHorarioCriacao = document.querySelectorAll(
    ".campo-horario-criacao"
);

const horarioEntradaHistorico = document.getElementById(
    "horario-entrada-historico"
);

const horarioInicioAlmocoHistorico = document.getElementById(
    "horario-inicio-almoco-historico"
);

const horarioFimAlmocoHistorico = document.getElementById(
    "horario-fim-almoco-historico"
);

const horarioSaidaHistorico = document.getElementById(
    "horario-saida-historico"
);

const atividadeCriacaoJornada = document.getElementById(
    "atividade-criacao-jornada"
);

const mensagemCriacaoJornada = document.getElementById(
    "mensagem-criacao-jornada"
);

const botaoFecharCriacaoJornada = document.getElementById(
    "botao-fechar-criacao-jornada"
);

const botaoCancelarCriacaoJornada = document.getElementById(
    "botao-cancelar-criacao-jornada"
);

const botaoSalvarCriacaoJornada = document.getElementById(
    "botao-salvar-criacao-jornada"
);


/* =========================================================
   CRIAÇÃO DE JORNADA PASSADA
   ========================================================= */

function normalizarCampoHorarioCriacao(campo) {

    campo.value =
        HORARIO_JORNADA
            .normalizarHorarioDigitado(
                campo.value
            );

    campo.setSelectionRange(
        campo.value.length,
        campo.value.length
    );

}


function tratarRemocaoHorarioCriacao(
    evento,
    campo
) {

    if (
        evento.inputType !==
        "deleteContentBackward"
    ) {
        return;
    }

    const selecaoNoFim =
        campo.selectionStart ===
        campo.selectionEnd
        &&
        campo.selectionEnd ===
        campo.value.length;

    if (!selecaoNoFim) {
        return;
    }

    evento.preventDefault();

    campo.value =
        HORARIO_JORNADA
            .removerUltimoDigitoHorario(
                campo.value
            );

    campo.setSelectionRange(
        campo.value.length,
        campo.value.length
    );

}


function completarCampoHorarioCriacao(campo) {

    const horario =
        HORARIO_JORNADA
            .montarHorarioDigitado(
                campo.value
            );

    if (horario) {
        campo.value = horario;
    }

}


function abrirCriacaoJornada(dataJornada) {

    dataCriacaoJornada = dataJornada;

    formularioCriacaoJornada.reset();

    dataCriacaoJornadaTexto.textContent =
        formatarDataCompleta(
            dataJornada
        );

    esconderErroCriacaoJornada();

    fundoCriacaoJornada.hidden = false;

    atualizarBloqueioRolagem();

    window.setTimeout(
        () => horarioEntradaHistorico.focus(),
        100
    );

}


function fecharCriacaoJornada() {

    if (salvandoCriacaoJornada) {
        return;
    }

    fundoCriacaoJornada.hidden = true;

    dataCriacaoJornada = null;

    formularioCriacaoJornada.reset();

    esconderErroCriacaoJornada();

    atualizarBloqueioRolagem();

}


function definirCarregamentoCriacaoJornada(
    carregando
) {

    salvandoCriacaoJornada = carregando;

    botaoSalvarCriacaoJornada.disabled =
        carregando;

    botaoCancelarCriacaoJornada.disabled =
        carregando;

    botaoFecharCriacaoJornada.disabled =
        carregando;

    botaoSalvarCriacaoJornada.classList.toggle(
        "carregando",
        carregando
    );

}


function obterTipoTrabalhoCriacao(nomeCampo) {

    return formularioCriacaoJornada
        .querySelector(
            `input[name="${nomeCampo}"]:checked`
        )
        ?.value;

}


async function salvarCriacaoJornada(evento) {

    evento.preventDefault();

    if (
        salvandoCriacaoJornada
        || !dataCriacaoJornada
    ) {
        return;
    }

    esconderErroCriacaoJornada();

    const horarios = [
        horarioEntradaHistorico,
        horarioInicioAlmocoHistorico,
        horarioFimAlmocoHistorico,
        horarioSaidaHistorico
    ].map(
        campo =>
            HORARIO_JORNADA
                .montarHorarioDigitado(
                    campo.value
                )
    );

    if (horarios.some(horario => !horario)) {

        mostrarErroCriacaoJornada(
            "Preencha os quatro horários com valores válidos entre 00:00 e 23:59."
        );

        return;

    }

    const horariosEmOrdem =
        horarios.every(
            (horario, indice) =>
                indice === 0
                || horarios[indice - 1] <= horario
        );

    if (!horariosEmOrdem) {

        mostrarErroCriacaoJornada(
            "Os horários devem seguir a ordem: entrada, almoço, retorno e saída."
        );

        return;

    }

    if (!navigator.onLine) {

        mostrarErroCriacaoJornada(
            "A criação de uma jornada passada precisa de conexão com o servidor."
        );

        return;

    }

    const tipoTrabalhoInicio =
        obterTipoTrabalhoCriacao(
            "tipo-trabalho-inicio-historico"
        );

    const tipoTrabalhoTarde =
        obterTipoTrabalhoCriacao(
            "tipo-trabalho-tarde-historico"
        );

    definirCarregamentoCriacaoJornada(
        true
    );

    try {

        const resposta =
            await requisicaoApi(
                "/jornadas/historica",
                {
                    method: "POST",

                    body: JSON.stringify({
                        data_jornada:
                            dataCriacaoJornada,

                        tipo_trabalho_inicio:
                            tipoTrabalhoInicio,

                        horario_entrada:
                            horarios[0],

                        horario_inicio_almoco:
                            horarios[1],

                        horario_fim_almoco:
                            horarios[2],

                        horario_saida:
                            horarios[3],

                        tipo_trabalho_apos_almoco:
                            tipoTrabalhoTarde,

                        atividade_do_dia:
                            atividadeCriacaoJornada.value.trim()
                            || null
                    })
                }
            );

        definirCarregamentoCriacaoJornada(
            false
        );

        fecharCriacaoJornada();

        mostrarMensagemFlutuante(
            resposta.mensagem
            || "Jornada retroativa criada e enviada para revisão."
        );

        await Promise.all([
            consultarMesCalendario(),
            consultarHistorico(),
            consultarDiaSelecionado(
                dataSelecionada
            )
        ]);

    } catch (erro) {

        console.error(
            "Erro ao criar jornada retroativa:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        mostrarErroCriacaoJornada(
            erro.message
            || "Não foi possível criar a jornada retroativa."
        );

    } finally {

        definirCarregamentoCriacaoJornada(
            false
        );

    }

}


/* =========================================================
   EDIÇÃO DE HORÁRIO
   ========================================================= */

const fundoEdicaoHorario = document.getElementById(
    "fundo-edicao-horario"
);

const formularioEdicaoHorario = document.getElementById(
    "formulario-edicao-horario"
);

const tituloEdicaoHorario = document.getElementById(
    "titulo-edicao-horario"
);

const nomeRegistroEdicao = document.getElementById(
    "nome-registro-edicao"
);

const horarioAtualEdicao = document.getElementById(
    "horario-atual-edicao"
);

const campoNovoHorario = document.getElementById(
    "campo-novo-horario"
);

const mensagemEdicaoHorario = document.getElementById(
    "mensagem-edicao-horario"
);

const botaoFecharEdicaoHorario = document.getElementById(
    "botao-fechar-edicao-horario"
);

const botaoCancelarEdicaoHorario = document.getElementById(
    "botao-cancelar-edicao-horario"
);

const botaoSalvarEdicaoHorario = document.getElementById(
    "botao-salvar-edicao-horario"
);


/* =========================================================
   OUTROS
   ========================================================= */

const mensagemFlutuante = document.getElementById(
    "mensagem-flutuante"
);


/* =========================================================
   ESTADO DA PÁGINA
   ========================================================= */

const hoje = new Date();

let mesExibido = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1
);

let dataSelecionada = converterDataParaIso(
    hoje
);

let dadosMesAtual = {
    jornadas: [],
    feriados: [],
    aniversarios: []
};

let mapaJornadasMes = new Map();
let mapaFeriadosMes = new Map();
let mapaAniversariosMes = new Map();

let dadosDiaSelecionado = null;
let dataDetalhesAtual = null;

let jornadasConsultadas = [];
let listaJornadasExpandida = false;

let registroEmEdicao = null;
let salvandoEdicaoHorario = false;

let dataCriacaoJornada = null;
let salvandoCriacaoJornada = false;

let temporizadorMensagem = null;


/* =========================================================
   SEGURANÇA E ÍCONES
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
        caractere =>
            caracteres[caractere]
    );

}


function criarIcone(
    nome,
    classeExtra = ""
) {

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
                href="${CAMINHO_ICONES_HISTORICO}#${escaparHtml(
                    nome
                )}"
            ></use>
        </svg>
    `;

}


/* =========================================================
   DATAS
   ========================================================= */

function converterDataParaIso(data) {

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function criarDataLocal(dataIso) {

    const partes = String(
        dataIso
    )
        .slice(0, 10)
        .split("-")
        .map(Number);

    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

}


function formatarDataCompleta(dataIso) {

    const texto = new Intl.DateTimeFormat(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        criarDataLocal(dataIso)
    );

    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}


function formatarDataCurta(dataIso) {

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            weekday: "short",
            day: "2-digit",
            month: "short"
        }
    ).format(
        criarDataLocal(dataIso)
    );

}


function formatarMesAno(data) {

    const texto = new Intl.DateTimeFormat(
        "pt-BR",
        {
            month: "long",
            year: "numeric"
        }
    ).format(data);

    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}


function obterUltimoDiaMes(
    ano,
    mesZeroBase
) {

    return new Date(
        ano,
        mesZeroBase + 1,
        0
    ).getDate();

}


function dataEstaNoFuturo(dataIso) {

    return dataIso > converterDataParaIso(
        new Date()
    );

}


function dataEhHoje(dataIso) {

    return dataIso === converterDataParaIso(
        new Date()
    );

}


function definirUltimosDias(quantidadeDias) {

    const dataFim = new Date();

    const dataInicio = new Date();

    dataInicio.setDate(
        dataFim.getDate()
        - (quantidadeDias - 1)
    );

    campoDataInicio.value =
        converterDataParaIso(
            dataInicio
        );

    campoDataFim.value =
        converterDataParaIso(
            dataFim
        );

}


function definirMesAtual() {

    const dataAtual = new Date();

    const primeiroDia = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        1
    );

    campoDataInicio.value =
        converterDataParaIso(
            primeiroDia
        );

    campoDataFim.value =
        converterDataParaIso(
            dataAtual
        );

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function voltarParaLogin() {

    window.location.href =
        "../index.html";

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
        nomes[0][0]
        + nomes[nomes.length - 1][0]
    ).toUpperCase();

}


function preencherUsuario(usuario) {

    nomeUsuarioCabecalho.textContent =
        usuario.nome_completo;

    tipoUsuarioCabecalho.textContent =
        usuario.tipo_usuario ===
        "ADMINISTRADOR"
            ? "Administrador"
            : "Funcionário";

    avatarUsuario.textContent =
        obterIniciaisNome(
            usuario.nome_completo
        );

    botaoAdministracao.hidden =
        usuario.tipo_usuario !==
        "ADMINISTRADOR";

}


function tratarErroAutenticacao(erro) {

    if (
        erro &&
        erro.status === 401
    ) {

        limparSessao();
        voltarParaLogin();

        return true;

    }

    return false;

}


/* =========================================================
   CONEXÃO E MENSAGENS
   ========================================================= */

function atualizarEstadoConexao() {

    const conectado = navigator.onLine;

    indicadorConexao.textContent =
        conectado
            ? "Sistema conectado"
            : "Sem conexão";

    indicadorConexao.classList.toggle(
        "sem-conexao",
        !conectado
    );

    botaoConsultar.disabled =
        !conectado;

    botaoMesAnterior.disabled =
        !conectado;

    botaoProximoMes.disabled =
        !conectado;

    botaoVoltarHoje.disabled =
        !conectado;

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

    temporizadorMensagem = window.setTimeout(
        () => {

            mensagemFlutuante.classList.remove(
                "visivel"
            );

        },
        4500
    );

}


function mostrarErroFiltro(mensagem) {

    mensagemFiltro.textContent =
        mensagem;

    mensagemFiltro.className =
        "mensagem-formulario erro visivel";

}


function esconderErroFiltro() {

    mensagemFiltro.textContent = "";

    mensagemFiltro.className =
        "mensagem-formulario";

}


function mostrarErroEdicao(mensagem) {

    mensagemEdicaoHorario.textContent =
        mensagem;

    mensagemEdicaoHorario.className =
        "mensagem-formulario erro visivel";

}


function esconderErroEdicao() {

    mensagemEdicaoHorario.textContent = "";

    mensagemEdicaoHorario.className =
        "mensagem-formulario";

}


function mostrarErroCriacaoJornada(mensagem) {

    mensagemCriacaoJornada.textContent =
        mensagem;

    mensagemCriacaoJornada.className =
        "mensagem-formulario erro visivel";

}


function esconderErroCriacaoJornada() {

    mensagemCriacaoJornada.textContent = "";

    mensagemCriacaoJornada.className =
        "mensagem-formulario";

}


function atualizarBloqueioRolagem() {

    const modalAberto =
        !fundoDetalhes.hidden
        || !fundoCriacaoJornada.hidden
        || !fundoEdicaoHorario.hidden;

    document.body.style.overflow =
        modalAberto
            ? "hidden"
            : "";

}


/* =========================================================
   TEXTOS
   ========================================================= */

function obterTextoSituacao(situacao) {

    const situacoes = {
        EM_ANDAMENTO: "Em andamento",
        CONCLUIDA: "Concluída",
        INCOMPLETA: "Incompleta",
        DIA_ENCERRADO: "Dia encerrado",
        ATESTADO: "Atestado",
        FERIAS: "Férias",
        FOLGA: "Folga",
        AUSENCIA: "Ausência"
    };

    return situacoes[situacao]
        || situacao
        || "Não informada";

}


function obterClasseSituacao(situacao) {

    if (situacao === "CONCLUIDA") {
        return "concluida";
    }

    if (situacao !== "EM_ANDAMENTO") {
        return "especial";
    }

    return "";

}


function obterTextoTipoTrabalho(tipo) {

    if (tipo === "OPERACIONAL") {
        return "Operacional";
    }

    if (tipo === "ADMINISTRATIVO") {
        return "Administrativo";
    }

    return "Não informado";

}


function obterNomeRegistro(tipoRegistro) {

    const nomes = {
        ENTRADA: "Entrada",
        INICIO_ALMOCO: "Início do almoço",
        FIM_ALMOCO: "Retorno do almoço",
        SAIDA: "Saída"
    };

    return nomes[tipoRegistro]
        || "Horário";

}

/* =========================================================
   CALENDÁRIO - MAPAS
   ========================================================= */

function reconstruirMapasCalendario() {

    mapaJornadasMes = new Map();
    mapaFeriadosMes = new Map();
    mapaAniversariosMes = new Map();

    dadosMesAtual.jornadas.forEach(
        jornada => {

            mapaJornadasMes.set(
                jornada.data_jornada,
                jornada
            );

        }
    );

    dadosMesAtual.feriados.forEach(
        feriado => {

            mapaFeriadosMes.set(
                feriado.data_feriado,
                feriado
            );

        }
    );

    dadosMesAtual.aniversarios.forEach(
        aniversario => {

            const dataEvento =
                aniversario.data_evento;

            if (!mapaAniversariosMes.has(
                dataEvento
            )) {

                mapaAniversariosMes.set(
                    dataEvento,
                    []
                );

            }

            mapaAniversariosMes
                .get(dataEvento)
                .push(aniversario);

        }
    );

}


function obterDescricaoAcessivelDia(
    dataIso,
    jornada,
    feriado,
    aniversarios
) {

    const descricoes = [
        formatarDataCompleta(dataIso)
    ];

    if (jornada) {

        descricoes.push(
            `Jornada ${obterTextoSituacao(
                jornada.situacao_jornada
            )}`
        );

    }

    if (feriado) {

        descricoes.push(
            `Feriado: ${feriado.nome_feriado}`
        );

    }

    if (aniversarios.length > 0) {

        descricoes.push(
            aniversarios.length === 1
                ? `Aniversário de ${
                    aniversarios[0].nome_completo
                }`
                : `${aniversarios.length} aniversários`
        );

    }

    if (jornada?.possui_alteracao) {

        descricoes.push(
            "Possui horário alterado"
        );

    }

    return descricoes.join(". ");

}


/* =========================================================
   CALENDÁRIO - RENDERIZAÇÃO
   ========================================================= */

function criarMarcadorDia(
    classe,
    titulo
) {

    return `
        <span
            class="marcador-dia-calendario ${classe}"
            title="${escaparHtml(titulo)}"
            aria-hidden="true"
        ></span>
    `;

}


function criarBotaoDiaCalendario(
    data,
    pertenceAoMesExibido = true
) {

    const dataIso =
        converterDataParaIso(data);

    const jornada =
        mapaJornadasMes.get(dataIso);

    const feriado =
        mapaFeriadosMes.get(dataIso);

    const aniversarios =
        mapaAniversariosMes.get(dataIso)
        || [];

    const classes = [
        "botao-dia-calendario"
    ];

    if (!pertenceAoMesExibido) {
        classes.push("fora-mes");
    }

    if (
        data.getDay() === 0
        || data.getDay() === 6
    ) {

        classes.push("final-semana");

    }

    if (dataEhHoje(dataIso)) {
        classes.push("hoje");
    }

    if (feriado) {
        classes.push("feriado");
    }

    if (dataIso === dataSelecionada) {
        classes.push("selecionado");
    }

    const marcadores = [];

    if (jornada) {

        marcadores.push(
            criarMarcadorDia(
                jornada.situacao_jornada ===
                    "CONCLUIDA"
                    ? "jornada"
                    : "incompleta",
                jornada.situacao_jornada ===
                    "CONCLUIDA"
                    ? "Jornada registrada"
                    : "Jornada incompleta"
            )
        );

    }

    if (aniversarios.length > 0) {

        marcadores.push(
            criarMarcadorDia(
                "aniversario",
                aniversarios.length === 1
                    ? `Aniversário de ${
                        aniversarios[0].nome_completo
                    }`
                    : `${aniversarios.length} aniversários`
            )
        );

    }

    if (jornada?.possui_alteracao) {

        marcadores.push(
            criarMarcadorDia(
                "alteracao",
                "Possui horário alterado"
            )
        );

    }

    const botao = document.createElement(
        "button"
    );

    botao.type = "button";

    botao.className =
        classes.join(" ");

    botao.dataset.dataCalendario =
        dataIso;

    botao.setAttribute(
        "aria-label",
        obterDescricaoAcessivelDia(
            dataIso,
            jornada,
            feriado,
            aniversarios
        )
    );

    botao.innerHTML = `
        <span class="numero-dia-calendario">
            ${data.getDate()}
        </span>

        ${
            dataEhHoje(dataIso)
                ? `
                    <span class="rotulo-hoje-calendario">
                        Hoje
                    </span>
                `
                : ""
        }

        <span class="marcadores-dia-calendario">
            ${marcadores.join("")}
        </span>
    `;

    botao.addEventListener(
        "click",
        async () => {

            if (!pertenceAoMesExibido) {

                mesExibido = new Date(
                    data.getFullYear(),
                    data.getMonth(),
                    1
                );

                dataSelecionada = dataIso;

                await carregarMesEDataSelecionada();

                return;

            }

            await selecionarDataCalendario(
                dataIso
            );

        }
    );

    return botao;

}


function renderizarCalendario() {

    const ano = mesExibido.getFullYear();

    const mesZeroBase =
        mesExibido.getMonth();

    tituloMesCalendario.textContent =
        formatarMesAno(
            mesExibido
        );

    gradeDiasCalendario.innerHTML = "";

    const primeiroDiaSemana = new Date(
        ano,
        mesZeroBase,
        1
    ).getDay();

    const quantidadeDias =
        obterUltimoDiaMes(
            ano,
            mesZeroBase
        );

    const quantidadeDiasMesAnterior =
        obterUltimoDiaMes(
            ano,
            mesZeroBase - 1
        );

    for (
        let indice = primeiroDiaSemana - 1;
        indice >= 0;
        indice -= 1
    ) {

        const numeroDia =
            quantidadeDiasMesAnterior - indice;

        const data = new Date(
            ano,
            mesZeroBase - 1,
            numeroDia
        );

        gradeDiasCalendario.appendChild(
            criarBotaoDiaCalendario(
                data,
                false
            )
        );

    }

    for (
        let numeroDia = 1;
        numeroDia <= quantidadeDias;
        numeroDia += 1
    ) {

        const data = new Date(
            ano,
            mesZeroBase,
            numeroDia
        );

        gradeDiasCalendario.appendChild(
            criarBotaoDiaCalendario(
                data,
                true
            )
        );

    }

    const quantidadeCelulasAtuais =
        gradeDiasCalendario.children.length;

    const quantidadeTotalCelulas =
        Math.ceil(
            quantidadeCelulasAtuais / 7
        ) * 7;

    const quantidadeDiasProximoMes =
        quantidadeTotalCelulas
        - quantidadeCelulasAtuais;

    for (
        let numeroDia = 1;
        numeroDia <= quantidadeDiasProximoMes;
        numeroDia += 1
    ) {

        const data = new Date(
            ano,
            mesZeroBase + 1,
            numeroDia
        );

        gradeDiasCalendario.appendChild(
            criarBotaoDiaCalendario(
                data,
                false
            )
        );

    }

}


function definirCarregamentoCalendario(
    carregando
) {

    carregamentoCalendario.hidden =
        !carregando;

    botaoMesAnterior.disabled =
        carregando || !navigator.onLine;

    botaoProximoMes.disabled =
        carregando || !navigator.onLine;

    botaoVoltarHoje.disabled =
        carregando || !navigator.onLine;

}


async function consultarMesCalendario() {

    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível atualizar o calendário porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    definirCarregamentoCalendario(
        true
    );

    try {

        const ano =
            mesExibido.getFullYear();

        const mes =
            mesExibido.getMonth() + 1;

        const parametros =
            new URLSearchParams({
                ano: String(ano),
                mes: String(mes)
            });

        const resposta =
            await requisicaoApi(
                `/calendario/mes?${parametros.toString()}`,
                {
                    method: "GET"
                }
            );

        dadosMesAtual = {
            jornadas:
                resposta.jornadas || [],

            feriados:
                resposta.feriados || [],

            aniversarios:
                resposta.aniversarios || []
        };

        reconstruirMapasCalendario();

        renderizarCalendario();

    } catch (erro) {

        console.error(
            "Erro ao consultar calendário:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        mostrarMensagemFlutuante(
            erro.message
            || "Não foi possível consultar o calendário.",
            "erro"
        );

    } finally {

        definirCarregamentoCalendario(
            false
        );

    }

}


function alterarMesExibido(diferenca) {

    const dataAnterior =
        criarDataLocal(
            dataSelecionada
        );

    const novoMes = new Date(
        mesExibido.getFullYear(),
        mesExibido.getMonth() + diferenca,
        1
    );

    const ultimoDiaNovoMes =
        obterUltimoDiaMes(
            novoMes.getFullYear(),
            novoMes.getMonth()
        );

    const novoDia =
        Math.min(
            dataAnterior.getDate(),
            ultimoDiaNovoMes
        );

    mesExibido = novoMes;

    dataSelecionada =
        converterDataParaIso(
            new Date(
                novoMes.getFullYear(),
                novoMes.getMonth(),
                novoDia
            )
        );

    carregarMesEDataSelecionada();

}


async function voltarParaHojeCalendario() {

    const dataAtual = new Date();

    mesExibido = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        1
    );

    dataSelecionada =
        converterDataParaIso(
            dataAtual
        );

    await carregarMesEDataSelecionada();

}


async function carregarMesEDataSelecionada() {

    await consultarMesCalendario();

    await consultarDiaSelecionado(
        dataSelecionada
    );

}


async function selecionarDataCalendario(
    dataIso
) {

    dataSelecionada = dataIso;

    renderizarCalendario();

    await consultarDiaSelecionado(
        dataIso
    );

}


/* =========================================================
   DIA SELECIONADO
   ========================================================= */

function definirCarregamentoDiaSelecionado(
    carregando
) {

    carregamentoDiaSelecionado.hidden =
        !carregando;

    conteudoDiaSelecionado.hidden =
        carregando;

    if (carregando) {
        botaoAbrirDetalhesDia.hidden = true;
    }

}


function criarEventoFeriado(feriado) {

    return `
        <article class="evento-dia-selecionado feriado">

            ${criarIcone("calendar-event")}

            <div>
                <strong>
                    ${escaparHtml(
                        feriado.nome_feriado
                    )}
                </strong>

                <span>
                    ${escaparHtml(
                        feriado.descricao
                        || "Feriado cadastrado no calendário da organização."
                    )}
                </span>
            </div>

        </article>
    `;

}


function criarEventoAniversario(
    aniversario
) {

    return `
        <article class="evento-dia-selecionado aniversario">

            ${criarIcone("gift")}

            <div>
                <strong>
                    Aniversário de ${escaparHtml(
                        aniversario.nome_completo
                    )}
                </strong>

                <span>
                    Data comemorativa exibida sem informar
                    o ano de nascimento.
                </span>
            </div>

        </article>
    `;

}


function montarEventosDia(dados) {

    const eventos = [];

    if (dados.feriado) {

        eventos.push(
            criarEventoFeriado(
                dados.feriado
            )
        );

    }

    (dados.aniversarios || []).forEach(
        aniversario => {

            eventos.push(
                criarEventoAniversario(
                    aniversario
                )
            );

        }
    );

    if (dados.possui_alteracao) {

        eventos.push(`
            <article class="evento-dia-selecionado alteracao">

                ${criarIcone("pencil-square")}

                <div>
                    <strong>
                        Horário alterado
                    </strong>

                    <span>
                        Esta jornada possui ${
                            dados.quantidade_alteracoes
                        } alteração${
                            dados.quantidade_alteracoes === 1
                                ? ""
                                : "ões"
                        } registrada${
                            dados.quantidade_alteracoes === 1
                                ? ""
                                : "s"
                        } na auditoria.
                    </span>
                </div>

            </article>
        `);

    }

    if (eventos.length === 0) {
        return "";
    }

    return `
        <div class="lista-eventos-dia-selecionado">
            ${eventos.join("")}
        </div>
    `;

}


function renderizarDiaSelecionado(dados) {

    dadosDiaSelecionado = dados;

    tituloDiaSelecionado.textContent =
        formatarDataCompleta(
            dados.data_calendario
        );

    const eventosHtml =
        montarEventosDia(dados);

    if (dados.data_futura) {

        descricaoDiaSelecionado.textContent =
            "Data futura disponível somente para consulta.";

        botaoAbrirDetalhesDia.hidden = true;

        conteudoDiaSelecionado.innerHTML = `
            ${eventosHtml}

            <div class="estado-sem-jornada-dia">

                ${criarIcone("calendar2-event")}

                <div>
                    <strong>
                        Data futura
                    </strong>

                    <p>
                        É possível visualizar feriados e
                        aniversários, mas não registrar ou editar
                        horários antecipadamente.
                    </p>
                </div>

            </div>
        `;

        return;

    }

    if (!dados.jornada) {

        descricaoDiaSelecionado.textContent =
            dataEhHoje(
                dados.data_calendario
            )
                ? "Ainda não existe uma jornada nesta data."
                : "Nenhuma jornada foi encontrada nesta data.";

        botaoAbrirDetalhesDia.hidden = true;

        conteudoDiaSelecionado.innerHTML = `
            ${eventosHtml}

            <div class="estado-sem-jornada-dia">

                ${criarIcone("calendar2-x")}

                <div>
                    <strong>
                        Nenhuma jornada registrada
                    </strong>

                    <p>
                        ${
                            dataEhHoje(
                                dados.data_calendario
                            )
                                ? "Utilize a página Hoje para iniciar ou continuar a jornada atual."
                                : "Não existem horários de trabalho registrados para esta data."
                        }
                    </p>

                    ${
                        dataEhHoje(
                            dados.data_calendario
                        )
                            ? ""
                            : `
                                <button
                                    type="button"
                                    class="acao-criar-jornada-passada"
                                    ${
                                        navigator.onLine
                                            ? ""
                                            : "disabled"
                                    }
                                >
                                    ${criarIcone("calendar2-plus")}
                                    Criar jornada neste dia
                                </button>
                            `
                    }
                </div>

            </div>
        `;

        const botaoCriarJornada =
            conteudoDiaSelecionado.querySelector(
                ".acao-criar-jornada-passada"
            );

        if (botaoCriarJornada) {
            botaoCriarJornada.addEventListener(
                "click",
                () => abrirCriacaoJornada(
                    dados.data_calendario
                )
            );
        }

        return;

    }

    const jornada = dados.jornada;

    const resumo = dados.resumo;

    descricaoDiaSelecionado.textContent =
        `${obterTextoSituacao(
            jornada.situacao_jornada
        )} • ${
            jornada.atividade_do_dia
            || "Atividade não informada"
        }`;

    botaoAbrirDetalhesDia.hidden = false;

    conteudoDiaSelecionado.innerHTML = `
        ${eventosHtml}

        <div class="grade-resumo-dia-selecionado">

            <article class="resumo-dia-selecionado">
                <span>Trabalhado</span>

                <strong>
                    ${escaparHtml(
                        resumo.tempo_trabalhado_formatado
                    )}
                </strong>
            </article>

            <article class="resumo-dia-selecionado">
                <span>Esperado</span>

                <strong>
                    ${escaparHtml(
                        resumo.tempo_esperado_formatado
                    )}
                </strong>
            </article>

            <article class="resumo-dia-selecionado">
                <span>Horas extras</span>

                <strong>
                    ${escaparHtml(
                        resumo.horas_extras_formatadas
                    )}
                </strong>
            </article>

            <article class="resumo-dia-selecionado">
                <span>Saldo</span>

                <strong>
                    ${escaparHtml(
                        resumo.saldo_formatado
                    )}
                </strong>
            </article>

        </div>
    `;

}


async function consultarDiaSelecionado(
    dataIso
) {

    definirCarregamentoDiaSelecionado(
        true
    );

    tituloDiaSelecionado.textContent =
        formatarDataCompleta(
            dataIso
        );

    descricaoDiaSelecionado.textContent =
        "Buscando informações da data selecionada.";

    try {

        const dados =
            await requisicaoApi(
                `/calendario/dia/${dataIso}`,
                {
                    method: "GET"
                }
            );

        renderizarDiaSelecionado(
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar dia do calendário:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        botaoAbrirDetalhesDia.hidden = true;

        conteudoDiaSelecionado.innerHTML = `
            <div class="estado-sem-jornada-dia">

                ${criarIcone("exclamation-circle")}

                <div>
                    <strong>
                        Não foi possível consultar a data
                    </strong>

                    <p>
                        ${escaparHtml(
                            erro.message
                            || "Tente novamente em alguns instantes."
                        )}
                    </p>
                </div>

            </div>
        `;

    } finally {

        definirCarregamentoDiaSelecionado(
            false
        );

    }

}

/* =========================================================
   RESUMO DO PERÍODO
   ========================================================= */

function preencherResumo(resumo) {

    totalJornadas.textContent =
        resumo.quantidade_jornadas;

    totalTrabalhado.textContent =
        resumo.total_trabalhado_formatado;

    totalExtras.textContent =
        resumo.total_extras_formatado;

    totalSaldo.textContent =
        resumo.total_saldo_formatado;

}


/* =========================================================
   LISTA DE JORNADAS
   ========================================================= */

function criarCartaoJornada(jornada) {

    const botao = document.createElement(
        "button"
    );

    botao.type = "button";

    botao.className =
        "cartao-dia-historico";

    botao.dataset.dataJornada =
        jornada.data_jornada;

    const atividade =
        jornada.atividade_do_dia
        || "Atividade não informada";

    const classeSituacao =
        obterClasseSituacao(
            jornada.situacao_jornada
        );

    const iconeSituacao =
        jornada.situacao_jornada ===
        "CONCLUIDA"
            ? "check-circle"
            : "clock";

    botao.innerHTML = `
        <div class="dia-historico__cabecalho">

            <span class="dia-historico__icone">
                ${criarIcone("calendar2-week")}
            </span>

            <div>
                <span class="dia-historico__data">
                    ${escaparHtml(
                        formatarDataCurta(
                            jornada.data_jornada
                        )
                    )}
                </span>

                <span class="dia-historico__atividade">
                    ${escaparHtml(
                        atividade
                    )}
                </span>
            </div>

        </div>

        <div class="dado-dia-historico">
            <span class="dado-dia-historico__nome">
                Trabalhado
            </span>

            <strong class="dado-dia-historico__valor">
                ${escaparHtml(
                    jornada.tempo_trabalhado_formatado
                )}
            </strong>
        </div>

        <div class="dado-dia-historico">
            <span class="dado-dia-historico__nome">
                Extras
            </span>

            <strong class="dado-dia-historico__valor">
                ${escaparHtml(
                    jornada.horas_extras_formatadas
                )}
            </strong>
        </div>

        <div class="dado-dia-historico">
            <span class="dado-dia-historico__nome">
                Saldo
            </span>

            <strong class="dado-dia-historico__valor">
                ${escaparHtml(
                    jornada.saldo_formatado
                )}
            </strong>
        </div>

        <span class="situacao-dia ${classeSituacao}">
            ${criarIcone(
                iconeSituacao
            )}

            ${escaparHtml(
                obterTextoSituacao(
                    jornada.situacao_jornada
                )
            )}
        </span>
    `;

    botao.addEventListener(
        "click",
        () => {

            abrirDetalhesJornada(
                jornada.data_jornada
            );

        }
    );

    return botao;

}


function atualizarBotaoVerMais() {

    const quantidadeTotal =
        jornadasConsultadas.length;

    if (
        quantidadeTotal <=
        LIMITE_INICIAL_JORNADAS
    ) {

        areaVerMais.hidden = true;

        return;

    }

    areaVerMais.hidden = false;

    if (listaJornadasExpandida) {

        textoBotaoVerMais.textContent =
            "Mostrar somente as 5 mais recentes";

        iconeBotaoVerMais.setAttribute(
            "href",
            `${CAMINHO_ICONES_HISTORICO}#chevron-up`
        );

        return;

    }

    const quantidadeRestante =
        quantidadeTotal
        - LIMITE_INICIAL_JORNADAS;

    textoBotaoVerMais.textContent =
        `Ver mais ${quantidadeRestante} jornada${
            quantidadeRestante === 1
                ? ""
                : "s"
        }`;

    iconeBotaoVerMais.setAttribute(
        "href",
        `${CAMINHO_ICONES_HISTORICO}#chevron-down`
    );

}


function renderizarListaJornadas() {

    listaJornadas.innerHTML = "";

    if (
        jornadasConsultadas.length === 0
    ) {

        listaJornadas.hidden = true;

        estadoVazio.hidden = false;

        areaVerMais.hidden = true;

        return;

    }

    estadoVazio.hidden = true;

    const jornadasVisiveis =
        listaJornadasExpandida
            ? jornadasConsultadas
            : jornadasConsultadas.slice(
                0,
                LIMITE_INICIAL_JORNADAS
            );

    jornadasVisiveis.forEach(
        jornada => {

            listaJornadas.appendChild(
                criarCartaoJornada(
                    jornada
                )
            );

        }
    );

    listaJornadas.hidden = false;

    atualizarBotaoVerMais();

}


function preencherLista(jornadas) {

    jornadasConsultadas =
        [...jornadas];

    listaJornadasExpandida =
        false;

    renderizarListaJornadas();

}


/* =========================================================
   CONSULTA DO HISTÓRICO
   ========================================================= */

function definirCarregamentoHistorico(
    carregando
) {

    botaoConsultar.disabled =
        carregando
        || !navigator.onLine;

    botaoConsultar.classList.toggle(
        "carregando",
        carregando
    );

    estadoCarregamento.hidden =
        !carregando;

    if (carregando) {

        listaJornadas.hidden = true;

        estadoVazio.hidden = true;

        areaVerMais.hidden = true;

    }

}


function validarPeriodo() {

    esconderErroFiltro();

    const dataInicio =
        campoDataInicio.value;

    const dataFim =
        campoDataFim.value;

    if (!dataInicio || !dataFim) {

        mostrarErroFiltro(
            "Informe a data inicial e a data final."
        );

        return false;

    }

    if (dataInicio > dataFim) {

        mostrarErroFiltro(
            "A data inicial não pode ser posterior à data final."
        );

        return false;

    }

    const dataHoje =
        converterDataParaIso(
            new Date()
        );

    if (dataFim > dataHoje) {

        mostrarErroFiltro(
            "A data final não pode estar no futuro."
        );

        return false;

    }

    return true;

}


async function consultarHistorico() {

    if (!validarPeriodo()) {
        return;
    }

    definirCarregamentoHistorico(
        true
    );

    try {

        const parametros =
            new URLSearchParams({
                data_inicio:
                    campoDataInicio.value,

                data_fim:
                    campoDataFim.value
            });

        const resposta =
            await requisicaoApi(
                `/jornadas/historico?${parametros.toString()}`,
                {
                    method: "GET"
                }
            );

        preencherResumo(
            resposta.resumo
        );

        preencherLista(
            resposta.jornadas
        );

        descricaoPeriodoConsultado.textContent =
            `${formatarDataCompleta(
                resposta.periodo.data_inicio
            )} até ${formatarDataCompleta(
                resposta.periodo.data_fim
            )}`;

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

        mostrarMensagemFlutuante(
            erro.message
            || "Não foi possível consultar o histórico.",
            "erro"
        );

    } finally {

        definirCarregamentoHistorico(
            false
        );

    }

}


/* =========================================================
   DETALHES DA JORNADA
   ========================================================= */

function abrirPainelDetalhes() {

    fundoDetalhes.hidden = false;

    atualizarBloqueioRolagem();

}


function fecharPainelDetalhes() {

    if (!fundoEdicaoHorario.hidden) {
        return;
    }

    fundoDetalhes.hidden = true;

    dataDetalhesAtual = null;

    atualizarBloqueioRolagem();

}


function criarHorarioDetalhe(
    nome,
    registro,
    podeEditar
) {

    const horario =
        registro?.horario_informado
        || "--:--";

    const botaoEditar =
        podeEditar && registro
            ? `
                <button
                    type="button"
                    class="botao-editar-horario"
                    data-id-registro="${registro.id_registro}"
                    data-tipo-registro="${escaparHtml(
                        registro.tipo_registro
                    )}"
                    data-horario-atual="${escaparHtml(
                        registro.horario_informado
                    )}"
                >
                    ${criarIcone("pencil")}
                    Editar
                </button>
            `
            : "";

    return `
        <article class="horario-detalhe">

            <span>
                ${escaparHtml(nome)}
            </span>

            <strong>
                ${escaparHtml(horario)}
            </strong>

            ${botaoEditar}

        </article>
    `;

}


function preencherDetalhes(dados) {

    dataDetalhesAtual =
        dados.data_calendario;

    tituloDetalhes.textContent =
        formatarDataCompleta(
            dados.data_calendario
        );

    if (!dados.jornada) {

        conteudoDetalhes.innerHTML = `
            ${montarEventosDia(dados)}

            <div class="estado-lista-historico">

                <div class="estado-lista-historico__icone">
                    ${criarIcone("calendar2-x")}
                </div>

                <strong>
                    Nenhuma jornada encontrada
                </strong>

                <p>
                    Esta data possui apenas informações de
                    calendário, sem horários de trabalho registrados.
                </p>

            </div>
        `;

        return;

    }

    const jornada = dados.jornada;

    const horarios = dados.horarios;

    const resumo = dados.resumo;

    const eventosHtml =
        montarEventosDia(
            dados
        );

    conteudoDetalhes.innerHTML = `
        ${
            eventosHtml
                ? `
                    <div class="bloco-eventos-detalhes">
                        ${eventosHtml}
                    </div>
                `
                : ""
        }

        <div class="grade-horarios-detalhes">

            ${criarHorarioDetalhe(
                "Entrada",
                horarios.entrada,
                dados.pode_editar_horarios
            )}

            ${criarHorarioDetalhe(
                "Almoço",
                horarios.inicio_almoco,
                dados.pode_editar_horarios
            )}

            ${criarHorarioDetalhe(
                "Retorno",
                horarios.fim_almoco,
                dados.pode_editar_horarios
            )}

            ${criarHorarioDetalhe(
                "Saída",
                horarios.saida,
                dados.pode_editar_horarios
            )}

        </div>

        <div class="grade-informacoes-detalhes">

            <article class="informacao-detalhe">
                <span>Situação</span>

                <strong>
                    ${escaparHtml(
                        obterTextoSituacao(
                            jornada.situacao_jornada
                        )
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Trabalho da manhã</span>

                <strong>
                    ${escaparHtml(
                        obterTextoTipoTrabalho(
                            jornada.tipo_trabalho_inicio
                        )
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Trabalho da tarde</span>

                <strong>
                    ${escaparHtml(
                        obterTextoTipoTrabalho(
                            jornada.tipo_trabalho_apos_almoco
                        )
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Atividade</span>

                <strong>
                    ${escaparHtml(
                        jornada.atividade_do_dia
                        || "Não informada"
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Tempo trabalhado</span>

                <strong>
                    ${escaparHtml(
                        resumo.tempo_trabalhado_formatado
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Jornada esperada</span>

                <strong>
                    ${escaparHtml(
                        resumo.tempo_esperado_formatado
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Horas extras</span>

                <strong>
                    ${escaparHtml(
                        resumo.horas_extras_formatadas
                    )}
                </strong>
            </article>

            <article class="informacao-detalhe">
                <span>Saldo do dia</span>

                <strong>
                    ${escaparHtml(
                        resumo.saldo_formatado
                    )}
                </strong>
            </article>

        </div>
    `;

    conteudoDetalhes
        .querySelectorAll(
            ".botao-editar-horario"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirEdicaoHorario({
                            id_registro: Number(
                                botao.dataset.idRegistro
                            ),

                            tipo_registro:
                                botao.dataset.tipoRegistro,

                            horario_informado:
                                botao.dataset.horarioAtual
                        });

                    }
                );

            }
        );

}


async function abrirDetalhesJornada(
    dataJornada
) {

    abrirPainelDetalhes();

    dataDetalhesAtual =
        dataJornada;

    tituloDetalhes.textContent =
        "Carregando...";

    conteudoDetalhes.innerHTML = `
        <div class="estado-lista-historico">
            <span class="carregamento-historico"></span>

            <p>
                Carregando detalhes...
            </p>
        </div>
    `;

    try {

        const dados =
            await requisicaoApi(
                `/calendario/dia/${dataJornada}`,
                {
                    method: "GET"
                }
            );

        preencherDetalhes(
            dados
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar detalhes:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        conteudoDetalhes.innerHTML = `
            <div class="estado-lista-historico">

                <div class="estado-lista-historico__icone">
                    ${criarIcone("exclamation-circle")}
                </div>

                <strong>
                    Não foi possível carregar os detalhes
                </strong>

                <p>
                    ${escaparHtml(
                        erro.message
                        || "Tente novamente em alguns instantes."
                    )}
                </p>

            </div>
        `;

    }

}

/* =========================================================
   EDIÇÃO DE HORÁRIO
   ========================================================= */

function normalizarCampoNovoHorario() {

    campoNovoHorario.value =
        HORARIO_JORNADA
            .normalizarHorarioDigitado(
                campoNovoHorario.value
            );

    campoNovoHorario.setSelectionRange(
        campoNovoHorario.value.length,
        campoNovoHorario.value.length
    );

}


function tratarRemocaoNovoHorario(evento) {

    if (
        evento.inputType !==
        "deleteContentBackward"
    ) {
        return;
    }

    const selecaoNoFim =
        campoNovoHorario.selectionStart ===
        campoNovoHorario.selectionEnd
        &&
        campoNovoHorario.selectionEnd ===
        campoNovoHorario.value.length;

    if (!selecaoNoFim) {
        return;
    }

    evento.preventDefault();

    campoNovoHorario.value =
        HORARIO_JORNADA
            .removerUltimoDigitoHorario(
                campoNovoHorario.value
            );

    campoNovoHorario.setSelectionRange(
        campoNovoHorario.value.length,
        campoNovoHorario.value.length
    );

}


function completarCampoNovoHorario() {

    const horario =
        HORARIO_JORNADA
            .montarHorarioDigitado(
                campoNovoHorario.value
            );

    if (horario) {
        campoNovoHorario.value = horario;
    }

}

function abrirEdicaoHorario(registro) {

    registroEmEdicao = registro;

    const nomeRegistro =
        obterNomeRegistro(
            registro.tipo_registro
        );

    tituloEdicaoHorario.textContent =
        `Alterar ${nomeRegistro.toLowerCase()}`;

    nomeRegistroEdicao.textContent =
        nomeRegistro;

    horarioAtualEdicao.textContent =
        registro.horario_informado;

    campoNovoHorario.value =
        registro.horario_informado;

    esconderErroEdicao();

    fundoEdicaoHorario.hidden = false;

    atualizarBloqueioRolagem();

    window.setTimeout(
        () => {

            campoNovoHorario.focus();
            campoNovoHorario.select();

        },
        100
    );

}


function fecharEdicaoHorario() {

    if (salvandoEdicaoHorario) {
        return;
    }

    fundoEdicaoHorario.hidden = true;

    registroEmEdicao = null;

    formularioEdicaoHorario.reset();

    esconderErroEdicao();

    atualizarBloqueioRolagem();

}


function definirCarregamentoEdicao(
    carregando
) {

    salvandoEdicaoHorario =
        carregando;

    botaoSalvarEdicaoHorario.disabled =
        carregando;

    botaoCancelarEdicaoHorario.disabled =
        carregando;

    botaoFecharEdicaoHorario.disabled =
        carregando;

    botaoSalvarEdicaoHorario.classList.toggle(
        "carregando",
        carregando
    );

}


async function salvarEdicaoHorario(
    evento
) {

    evento.preventDefault();

    if (
        salvandoEdicaoHorario
        || !registroEmEdicao
    ) {
        return;
    }

    esconderErroEdicao();

    const horarioNovo =
        HORARIO_JORNADA
            .montarHorarioDigitado(
                campoNovoHorario.value
            );

    if (!horarioNovo) {

        mostrarErroEdicao(
            "Informe um horário válido entre 00:00 e 23:59."
        );

        return;

    }

    if (
        horarioNovo ===
        registroEmEdicao.horario_informado
    ) {

        mostrarErroEdicao(
            "O novo horário deve ser diferente do horário atual."
        );

        return;

    }

    if (!navigator.onLine) {

        mostrarErroEdicao(
            "Não é possível alterar o horário sem conexão."
        );

        return;

    }

    definirCarregamentoEdicao(
        true
    );

    try {

        const resposta =
            await requisicaoApi(
                `/jornadas/registros/${registroEmEdicao.id_registro}/horario`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        horario_novo:
                            horarioNovo
                    })
                }
            );

        const dataAtualizada =
            dataDetalhesAtual
            || dataSelecionada;

        definirCarregamentoEdicao(
            false
        );

        fecharEdicaoHorario();

        mostrarMensagemFlutuante(
            resposta.aviso
            || "Horário alterado e registrado na auditoria."
        );

        await Promise.all([
            consultarMesCalendario(),

            consultarHistorico(),

            consultarDiaSelecionado(
                dataSelecionada
            )
        ]);

        if (
            !fundoDetalhes.hidden
            && dataAtualizada
        ) {

            await abrirDetalhesJornada(
                dataAtualizada
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao alterar horário:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        mostrarErroEdicao(
            erro.message
            || "Não foi possível alterar o horário."
        );

    } finally {

        definirCarregamentoEdicao(
            false
        );

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

    if (usuarioSalvo) {

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

        preencherUsuario(
            usuarioAtualizado
        );

        localStorage.setItem(
            CHAVES_SESSAO.USUARIO,
            JSON.stringify(
                usuarioAtualizado
            )
        );

        await Promise.all([
            consultarMesCalendario(),
            consultarHistorico()
        ]);

        await consultarDiaSelecionado(
            dataSelecionada
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        if (
            tratarErroAutenticacao(
                erro
            )
        ) {
            return;
        }

        mostrarMensagemFlutuante(
            erro.message
            || "Não foi possível carregar a página.",
            "erro"
        );

    }

}


/* =========================================================
   EVENTOS DO CALENDÁRIO
   ========================================================= */

botaoMesAnterior.addEventListener(
    "click",
    () => {

        alterarMesExibido(
            -1
        );

    }
);


botaoProximoMes.addEventListener(
    "click",
    () => {

        alterarMesExibido(
            1
        );

    }
);


botaoVoltarHoje.addEventListener(
    "click",
    voltarParaHojeCalendario
);


botaoAbrirDetalhesDia.addEventListener(
    "click",
    () => {

        if (
            dadosDiaSelecionado?.jornada
        ) {

            abrirDetalhesJornada(
                dadosDiaSelecionado
                    .data_calendario
            );

        }

    }
);


/* =========================================================
   EVENTOS DO HISTÓRICO
   ========================================================= */

botoesPeriodo.forEach(
    botao => {

        botao.addEventListener(
            "click",
            async () => {

                botoesPeriodo.forEach(
                    outroBotao => {

                        outroBotao.classList.remove(
                            "ativo"
                        );

                    }
                );

                botao.classList.add(
                    "ativo"
                );

                const periodo =
                    botao.dataset.periodo;

                if (
                    periodo ===
                    "MES_ATUAL"
                ) {

                    definirMesAtual();

                } else {

                    definirUltimosDias(
                        Number(periodo)
                    );

                }

                await consultarHistorico();

            }
        );

    }
);


campoDataInicio.addEventListener(
    "change",
    () => {

        botoesPeriodo.forEach(
            botao => {

                botao.classList.remove(
                    "ativo"
                );

            }
        );

        esconderErroFiltro();

    }
);


campoDataFim.addEventListener(
    "change",
    () => {

        botoesPeriodo.forEach(
            botao => {

                botao.classList.remove(
                    "ativo"
                );

            }
        );

        esconderErroFiltro();

    }
);


botaoConsultar.addEventListener(
    "click",
    consultarHistorico
);


botaoVerMais.addEventListener(
    "click",
    () => {

        listaJornadasExpandida =
            !listaJornadasExpandida;

        renderizarListaJornadas();

        if (!listaJornadasExpandida) {

            document
                .querySelector(
                    ".secao-lista-jornadas"
                )
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }

    }
);


/* =========================================================
   EVENTOS DOS MODAIS
   ========================================================= */

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


formularioCriacaoJornada.addEventListener(
    "submit",
    salvarCriacaoJornada
);


camposHorarioCriacao.forEach(
    campo => {

        campo.addEventListener(
            "beforeinput",
            evento =>
                tratarRemocaoHorarioCriacao(
                    evento,
                    campo
                )
        );

        campo.addEventListener(
            "input",
            () => normalizarCampoHorarioCriacao(
                campo
            )
        );

        campo.addEventListener(
            "blur",
            () => completarCampoHorarioCriacao(
                campo
            )
        );

    }
);


botaoFecharCriacaoJornada.addEventListener(
    "click",
    fecharCriacaoJornada
);


botaoCancelarCriacaoJornada.addEventListener(
    "click",
    fecharCriacaoJornada
);


fundoCriacaoJornada.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoCriacaoJornada
        ) {

            fecharCriacaoJornada();

        }

    }
);


formularioEdicaoHorario.addEventListener(
    "submit",
    salvarEdicaoHorario
);


campoNovoHorario.addEventListener(
    "beforeinput",
    tratarRemocaoNovoHorario
);


campoNovoHorario.addEventListener(
    "input",
    normalizarCampoNovoHorario
);


campoNovoHorario.addEventListener(
    "blur",
    completarCampoNovoHorario
);


botaoFecharEdicaoHorario.addEventListener(
    "click",
    fecharEdicaoHorario
);


botaoCancelarEdicaoHorario.addEventListener(
    "click",
    fecharEdicaoHorario
);


fundoEdicaoHorario.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoEdicaoHorario
        ) {

            fecharEdicaoHorario();

        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (evento.key !== "Escape") {
            return;
        }

        if (
            !fundoCriacaoJornada.hidden
        ) {

            fecharCriacaoJornada();

            return;

        }

        if (
            !fundoEdicaoHorario.hidden
        ) {

            fecharEdicaoHorario();

            return;

        }

        if (!fundoDetalhes.hidden) {

            fecharPainelDetalhes();

        }

    }
);


/* =========================================================
   SAÍDA
   ========================================================= */

botaoSair.addEventListener(
    "click",
    async () => {

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
);


/* =========================================================
   CONEXÃO
   ========================================================= */

window.addEventListener(
    "online",
    async () => {

        atualizarEstadoConexao();

        await Promise.all([
            consultarMesCalendario(),

            consultarHistorico(),

            consultarDiaSelecionado(
                dataSelecionada
            )
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

definirUltimosDias(
    7
);

atualizarEstadoConexao();

renderizarCalendario();

carregarPagina();
