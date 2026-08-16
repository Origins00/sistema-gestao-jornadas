/*
 * Página Hoje do Gestor de Jornadas.
 * Controla a jornada e os registros de horários.
 */


const CAMINHO_ICONES_INICIO =
    "../icones/bootstrap-icons.svg";


/* =========================================================
   ELEMENTOS DO USUÁRIO
   ========================================================= */

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

const saudacaoUsuario =
    document.getElementById(
        "saudacao-usuario"
    );

const dataAtual =
    document.getElementById(
        "data-atual"
    );

const avisoTrocaSenha =
    document.getElementById(
        "aviso-troca-senha"
    );

const botaoAdministracao =
    document.getElementById(
        "botao-administracao"
    );

const botaoSair =
    document.getElementById(
        "botao-sair"
    );


/* =========================================================
   ELEMENTOS DA JORNADA
   ========================================================= */

const indicadorConexao =
    document.getElementById(
        "indicador-conexao"
    );

const descricaoCartaoJornada =
    document.getElementById(
        "descricao-cartao-jornada"
    );

const statusJornada =
    document.getElementById(
        "status-jornada"
    );

const tituloTipoTrabalho =
    document.getElementById(
        "titulo-tipo-trabalho"
    );

const atividadeDoDia =
    document.getElementById(
        "atividade-do-dia"
    );

const botoesTipoTrabalho =
    document.querySelectorAll(
        "[data-tipo-trabalho]"
    );


/* =========================================================
   ELEMENTOS DA AÇÃO PRINCIPAL
   ========================================================= */

const botaoRegistrarHorario =
    document.getElementById(
        "botao-registrar-horario"
    );

const tituloAcaoJornada =
    document.getElementById(
        "titulo-acao-jornada"
    );

const descricaoAcaoJornada =
    document.getElementById(
        "descricao-acao-jornada"
    );

const iconeAcaoJornada =
    document.getElementById(
        "icone-acao-jornada"
    );

const campoHorarioRegistro =
    document.getElementById(
        "horario-registro"
    );

const botaoUsarHorarioAtual =
    document.getElementById(
        "botao-usar-horario-atual"
    );

const textoOrigemHorario =
    document.getElementById(
        "texto-origem-horario"
    );


/* =========================================================
   ELEMENTOS DA LINHA DO TEMPO
   ========================================================= */

const etapaEntrada =
    document.getElementById(
        "etapa-entrada"
    );

const etapaInicioAlmoco =
    document.getElementById(
        "etapa-inicio-almoco"
    );

const etapaFimAlmoco =
    document.getElementById(
        "etapa-fim-almoco"
    );

const etapaSaida =
    document.getElementById(
        "etapa-saida"
    );

const horarioEntrada =
    document.getElementById(
        "horario-entrada"
    );

const horarioInicioAlmoco =
    document.getElementById(
        "horario-inicio-almoco"
    );

const horarioFimAlmoco =
    document.getElementById(
        "horario-fim-almoco"
    );

const horarioSaida =
    document.getElementById(
        "horario-saida"
    );


/* =========================================================
   ELEMENTOS DO RESUMO
   ========================================================= */

const resumoTempoTrabalhado =
    document.getElementById(
        "resumo-tempo-trabalhado"
    );

const resumoTempoEsperado =
    document.getElementById(
        "resumo-tempo-esperado"
    );

const resumoHorasExtras =
    document.getElementById(
        "resumo-horas-extras"
    );

const resumoSaldoDia =
    document.getElementById(
        "resumo-saldo-dia"
    );


/* =========================================================
   ELEMENTOS DO PRÓXIMO PASSO
   ========================================================= */

const cartaoProximoPasso =
    document.querySelector(
        ".cartao-proximo-passo"
    );

const etiquetaProximoPasso =
    document.getElementById(
        "etiqueta-proximo-passo"
    );

const tituloProximoPasso =
    document.getElementById(
        "titulo-proximo-passo"
    );

const descricaoProximoPasso =
    document.getElementById(
        "descricao-proximo-passo"
    );

const iconeProximoPasso =
    document.getElementById(
        "icone-proximo-passo"
    );


/* =========================================================
   OUTROS ELEMENTOS
   ========================================================= */

const mensagemFlutuante =
    document.getElementById(
        "mensagem-flutuante"
    );


/* =========================================================
   ESTADO DA PÁGINA
   ========================================================= */

let usuarioAtual = null;

let dadosJornadaAtual = null;

let tipoTrabalhoSelecionado = null;

let horarioDigitadoManualmente = false;

let acaoEmAndamento = false;

let sincronizacaoEmAndamento = null;

let temporizadorMensagem = null;


/* =========================================================
   DATA E HORÁRIO
   ========================================================= */

function obterDataLocalIso() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${ano}-${mes}-${dia}`;

}


function obterHorarioAtualTexto() {

    const agora =
        new Date();

    const horas =
        String(
            agora.getHours()
        ).padStart(
            2,
            "0"
        );

    const minutos =
        String(
            agora.getMinutes()
        ).padStart(
            2,
            "0"
        );

    return `${horas}:${minutos}`;

}


function preencherCampoHorario(horario) {

    campoHorarioRegistro.value =
        HORARIO_JORNADA
            .montarHorarioDigitado(horario)
        || "";

}


function normalizarCampoHorario() {

    campoHorarioRegistro.value =
        HORARIO_JORNADA
            .normalizarHorarioDigitado(
                campoHorarioRegistro.value
            );

    campoHorarioRegistro.setSelectionRange(
        campoHorarioRegistro.value.length,
        campoHorarioRegistro.value.length
    );

    marcarHorarioComoManual();

}


function tratarRemocaoHorario(evento) {

    if (
        evento.inputType !==
        "deleteContentBackward"
    ) {
        return;
    }

    const selecaoNoFim =
        campoHorarioRegistro.selectionStart ===
        campoHorarioRegistro.selectionEnd
        &&
        campoHorarioRegistro.selectionEnd ===
        campoHorarioRegistro.value.length;

    if (!selecaoNoFim) {
        return;
    }

    evento.preventDefault();

    campoHorarioRegistro.value =
        HORARIO_JORNADA
            .removerUltimoDigitoHorario(
                campoHorarioRegistro.value
            );

    campoHorarioRegistro.setSelectionRange(
        campoHorarioRegistro.value.length,
        campoHorarioRegistro.value.length
    );

    marcarHorarioComoManual();

}


function completarCampoHorario() {

    const horario =
        HORARIO_JORNADA
            .montarHorarioDigitado(
                campoHorarioRegistro.value
            );

    if (horario) {
        campoHorarioRegistro.value = horario;
    }

}


function atualizarDataAtual() {

    const agora =
        new Date();

    const textoData =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        ).format(
            agora
        );

    dataAtual.textContent =
        textoData
            .charAt(0)
            .toUpperCase()
        +
        textoData.slice(1);

}


function atualizarRelogio() {

    if (
        horarioDigitadoManualmente
    ) {

        return;

    }

    preencherCampoHorario(
        obterHorarioAtualTexto()
    );

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function voltarParaLogin() {

    window.location.href =
        "../index.html";

}


function obterIniciaisNome(
    nomeCompleto
) {

    if (!nomeCompleto) {

        return "--";

    }

    const partesNome =
        nomeCompleto
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (
        partesNome.length === 1
    ) {

        return partesNome[0]
            .slice(
                0,
                2
            )
            .toUpperCase();

    }

    return (
        partesNome[0][0]
        +
        partesNome[
            partesNome.length - 1
        ][0]
    ).toUpperCase();

}


function obterPrimeiroNome(
    nomeCompleto
) {

    if (!nomeCompleto) {

        return "";

    }

    return nomeCompleto
        .trim()
        .split(/\s+/)[0];

}


function obterSaudacao() {

    const hora =
        new Date().getHours();

    if (hora < 12) {

        return "Bom dia";

    }

    if (hora < 18) {

        return "Boa tarde";

    }

    return "Boa noite";

}


function preencherDadosUsuario(
    usuario
) {

    usuarioAtual =
        usuario;

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

    saudacaoUsuario.textContent =
        `${obterSaudacao()}, ${
            obterPrimeiroNome(
                usuario.nome_completo
            )
        }`;

    avisoTrocaSenha.hidden =
        !usuario.precisa_trocar_senha;

    botaoAdministracao.hidden =
        usuario.tipo_usuario !==
        "ADMINISTRADOR";

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

    temporizadorMensagem =
        window.setTimeout(
            () => {

                mensagemFlutuante
                    .classList
                    .remove(
                        "visivel"
                    );

            },
            4000
        );

}


/* =========================================================
   CONEXÃO
   ========================================================= */

function atualizarEstadoConexao() {

    const conectado =
        navigator.onLine;

    const quantidadePendente =
        usuarioAtual &&
        window.SINCRONIZACAO_OFFLINE
            ? SINCRONIZACAO_OFFLINE
                .quantidadePendencias(
                    usuarioAtual.id_usuario
                )
            : 0;

    indicadorConexao.textContent =
        conectado
            ? quantidadePendente > 0
                ? `${quantidadePendente} horário(s) aguardando envio`
                : "Sistema conectado"
            : quantidadePendente > 0
                ? `Sem conexão - ${quantidadePendente} horário(s) salvo(s)`
                : "Sem conexão";

    indicadorConexao
        .classList
        .toggle(
            "sem-conexao",
            !conectado
        );

    atualizarAcaoPrincipal();

}


/* =========================================================
   RASCUNHO DA ATIVIDADE
   ========================================================= */

function obterChaveRascunhoAtividade() {

    if (!usuarioAtual) {

        return null;

    }

    return (
        "gestor_jornadas_atividade_"
        +
        usuarioAtual.id_usuario
        +
        "_"
        +
        obterDataLocalIso()
    );

}


function salvarRascunhoAtividade() {

    const chave =
        obterChaveRascunhoAtividade();

    if (!chave) {

        return;

    }

    localStorage.setItem(
        chave,
        atividadeDoDia.value
    );

}


function carregarRascunhoAtividade() {

    const atividadeSalva =
        dadosJornadaAtual
            ?.jornada
            ?.atividade_do_dia;

    if (atividadeSalva) {

        atividadeDoDia.value =
            atividadeSalva;

        return;

    }

    const chave =
        obterChaveRascunhoAtividade();

    if (!chave) {

        return;

    }

    const rascunho =
        localStorage.getItem(
            chave
        );

    if (rascunho !== null) {

        atividadeDoDia.value =
            rascunho;

    }

}


function apagarRascunhoAtividade() {

    const chave =
        obterChaveRascunhoAtividade();

    if (chave) {

        localStorage.removeItem(
            chave
        );

    }

}


/* =========================================================
   TIPO DE TRABALHO
   ========================================================= */

function selecionarTipoTrabalho(
    tipo
) {

    tipoTrabalhoSelecionado =
        tipo;

    botoesTipoTrabalho.forEach(
        botao => {

            const selecionado =
                botao.dataset
                    .tipoTrabalho ===
                tipo;

            botao.classList.toggle(
                "selecionado",
                selecionado
            );

            botao.setAttribute(
                "aria-pressed",
                String(
                    selecionado
                )
            );

        }
    );

    atualizarResumo();

    atualizarAcaoPrincipal();

}


function configurarSeletorTipoTrabalho() {

    const jornada =
        dadosJornadaAtual?.jornada;

    const horarios =
        dadosJornadaAtual?.horarios;

    let seletorHabilitado =
        false;

    let tipoParaExibir =
        null;

    if (!jornada) {

        tituloTipoTrabalho.textContent =
            "Tipo de trabalho";

        seletorHabilitado =
            true;

        tipoParaExibir =
            tipoTrabalhoSelecionado;

    } else if (
        jornada.situacao_jornada ===
            "EM_ANDAMENTO"
        &&
        horarios?.inicio_almoco
        &&
        !horarios?.fim_almoco
    ) {

        tituloTipoTrabalho.textContent =
            "Tipo de trabalho após o almoço";

        seletorHabilitado =
            true;

        tipoParaExibir =
            tipoTrabalhoSelecionado
            ||
            jornada.tipo_trabalho_inicio;

    } else {

        tituloTipoTrabalho.textContent =
            jornada
                .tipo_trabalho_apos_almoco
                ? "Tipo de trabalho da tarde"
                : "Tipo de trabalho";

        tipoParaExibir =
            jornada
                .tipo_trabalho_apos_almoco
            ||
            jornada
                .tipo_trabalho_inicio;

    }

    if (tipoParaExibir) {

        selecionarTipoTrabalho(
            tipoParaExibir
        );

    }

    botoesTipoTrabalho.forEach(
        botao => {

            botao.disabled =
                !seletorHabilitado;

        }
    );

}


/* =========================================================
   SITUAÇÃO E PRÓXIMA AÇÃO
   ========================================================= */

function obterProximaAcao() {

    if (!dadosJornadaAtual) {

        return "ENTRADA";

    }

    const jornada =
        dadosJornadaAtual.jornada;

    const horarios =
        dadosJornadaAtual.horarios;

    if (
        jornada.situacao_jornada !==
        "EM_ANDAMENTO"
    ) {

        return null;

    }

    if (!horarios.entrada) {

        return "ENTRADA";

    }

    if (!horarios.inicio_almoco) {

        return "INICIO_ALMOCO";

    }

    if (!horarios.fim_almoco) {

        return "FIM_ALMOCO";

    }

    if (!horarios.saida) {

        return "SAIDA";

    }

    return null;

}


function obterTextoSituacaoJornada(
    situacao
) {

    const situacoes = {

        EM_ANDAMENTO:
            "Em andamento",

        CONCLUIDA:
            "Concluída",

        INCOMPLETA:
            "Incompleta",

        DIA_ENCERRADO:
            "Dia encerrado",

        ATESTADO:
            "Atestado",

        FERIAS:
            "Férias",

        FOLGA:
            "Folga",

        AUSENCIA:
            "Ausência"

    };

    return (
        situacoes[situacao]
        ||
        situacao
    );

}


function atualizarStatusJornada() {

    statusJornada.className =
        "etiqueta-status";

    if (!dadosJornadaAtual) {

        statusJornada.textContent =
            "Não iniciada";

        statusJornada.classList.add(
            "status-nao-iniciada"
        );

        descricaoCartaoJornada.textContent =
            "Escolha o tipo de trabalho antes de iniciar sua jornada.";

        return;

    }

    const situacao =
        dadosJornadaAtual
            .jornada
            .situacao_jornada;

    statusJornada.textContent =
        obterTextoSituacaoJornada(
            situacao
        );

    if (
        situacao ===
        "EM_ANDAMENTO"
    ) {

        statusJornada.classList.add(
            "status-em-andamento"
        );

        descricaoCartaoJornada.textContent =
            "Registre os horários seguindo a ordem da jornada.";

    } else if (
        situacao ===
        "CONCLUIDA"
    ) {

        statusJornada.classList.add(
            "status-concluida"
        );

        descricaoCartaoJornada.textContent =
            "Todos os horários de hoje foram registrados.";

    } else {

        statusJornada.classList.add(
            "status-especial"
        );

        descricaoCartaoJornada.textContent =
            "Esta jornada possui uma situação especial definida.";

    }

}


/* =========================================================
   LINHA DO TEMPO
   ========================================================= */

function atualizarLinhaTempo() {

    const horarios =
        dadosJornadaAtual
            ?.horarios
        ||
        {};

    const etapas = [

        {
            elemento:
                etapaEntrada,

            horarioElemento:
                horarioEntrada,

            valor:
                horarios.entrada
        },

        {
            elemento:
                etapaInicioAlmoco,

            horarioElemento:
                horarioInicioAlmoco,

            valor:
                horarios.inicio_almoco
        },

        {
            elemento:
                etapaFimAlmoco,

            horarioElemento:
                horarioFimAlmoco,

            valor:
                horarios.fim_almoco
        },

        {
            elemento:
                etapaSaida,

            horarioElemento:
                horarioSaida,

            valor:
                horarios.saida
        }

    ];

    let encontrouEtapaPendente =
        false;

    etapas.forEach(
        etapa => {

            etapa.elemento
                .classList
                .remove(
                    "concluida",
                    "atual"
                );

            if (etapa.valor) {

                etapa.elemento
                    .classList
                    .add(
                        "concluida"
                    );

                etapa
                    .horarioElemento
                    .textContent =
                    etapa.valor;

                return;

            }

            etapa
                .horarioElemento
                .textContent =
                "Pendente";

            if (
                !encontrouEtapaPendente
            ) {

                etapa.elemento
                    .classList
                    .add(
                        "atual"
                    );

                encontrouEtapaPendente =
                    true;

            }

        }
    );

}


/* =========================================================
   RESUMO
   ========================================================= */

function calcularTempoEsperadoVisual() {

    const jornada =
        dadosJornadaAtual?.jornada;

    if (!jornada) {

        if (
            tipoTrabalhoSelecionado ===
            "OPERACIONAL"
        ) {

            return "09h00";

        }

        if (
            tipoTrabalhoSelecionado ===
            "ADMINISTRATIVO"
        ) {

            return "08h00";

        }

        return "--h--";

    }

    const tipoInicio =
        jornada.tipo_trabalho_inicio;

    const tipoTarde =
        jornada.tipo_trabalho_apos_almoco;

    if (
        tipoInicio === "OPERACIONAL"
        &&
        (
            tipoTarde === "OPERACIONAL"
            ||
            tipoTarde === null
        )
    ) {

        return "09h00";

    }

    return "08h00";

}


function atualizarResumo() {

    const resumo =
        dadosJornadaAtual?.resumo;

    const minutosTrabalhadosVisuais =
        HORARIO_JORNADA
            .calcularMinutosTrabalhados(
                dadosJornadaAtual?.horarios
            );

    resumoTempoTrabalhado.textContent =
        minutosTrabalhadosVisuais !== null
            ? HORARIO_JORNADA
                .formatarTotalMinutos(
                    minutosTrabalhadosVisuais
                )
            : resumo
                ?.tempo_trabalhado_formatado
                || "00h00";

    resumoTempoEsperado.textContent =
        resumo?.minutos_esperados > 0
            ? resumo
                .tempo_esperado_formatado
            : calcularTempoEsperadoVisual();

    resumoHorasExtras.textContent =
        resumo
            ?.horas_extras_formatadas
        ||
        "00h00";

    resumoSaldoDia.textContent =
        resumo
            ?.saldo_formatado
        ||
        "00h00";

}


/* =========================================================
   BOTÃO PRINCIPAL E PRÓXIMO PASSO
   ========================================================= */

function definirIconeAcao(
    nomeIcone
) {

    iconeAcaoJornada.setAttribute(
        "href",
        `${CAMINHO_ICONES_INICIO}#${nomeIcone}`
    );

}


function atualizarProximoPasso(
    proximaAcao
) {

    let etiqueta =
        "Próximo passo";

    let titulo =
        "Selecione o tipo de trabalho";

    let descricao = (
        "Escolha entre atividade administrativa ou operacional "
        +
        "para liberar o registro da entrada."
    );

    let icone =
        "signpost-2-fill";

    let concluido =
        false;

    const situacao =
        dadosJornadaAtual
            ?.jornada
            ?.situacao_jornada;

    if (
        proximaAcao === "ENTRADA"
        &&
        tipoTrabalhoSelecionado
    ) {

        titulo =
            "Registre sua entrada";

        descricao = (
            "Confira o horário informado e confirme "
            +
            "o primeiro registro do dia."
        );

        icone =
            "box-arrow-in-right";

    }

    if (
        proximaAcao ===
        "INICIO_ALMOCO"
    ) {

        titulo =
            "Registre o início do almoço";

        descricao = (
            "Confira o horário e confirme o início "
            +
            "do intervalo."
        );

        icone =
            "fork-knife";

    }

    if (
        proximaAcao ===
        "FIM_ALMOCO"
    ) {

        titulo =
            "Confirme seu retorno";

        descricao = (
            "Selecione o tipo de trabalho da tarde "
            +
            "e registre o fim do intervalo."
        );

        icone =
            "arrow-return-left";

    }

    if (
        proximaAcao ===
        "SAIDA"
    ) {

        titulo =
            "Finalize a jornada";

        descricao = (
            "Confira a atividade do dia e registre "
            +
            "a saída para calcular os totais."
        );

        icone =
            "box-arrow-right";

    }

    if (
        situacao ===
        "CONCLUIDA"
    ) {

        etiqueta =
            "Jornada concluída";

        titulo =
            "Todos os horários foram registrados";

        descricao = (
            "Consulte os totais de hoje ou acesse "
            +
            "o Histórico para rever os registros."
        );

        icone =
            "check-circle-fill";

        concluido =
            true;

    } else if (
        situacao
        &&
        situacao !==
        "EM_ANDAMENTO"
    ) {

        etiqueta =
            "Situação do dia";

        titulo =
            obterTextoSituacaoJornada(
                situacao
            );

        descricao = (
            "A jornada de hoje possui uma situação "
            +
            "especial definida."
        );

        icone =
            "calendar-plus-fill";

    }

    etiquetaProximoPasso.textContent =
        etiqueta;

    tituloProximoPasso.textContent =
        titulo;

    descricaoProximoPasso.textContent =
        descricao;

    iconeProximoPasso.setAttribute(
        "href",
        `${CAMINHO_ICONES_INICIO}#${icone}`
    );

    cartaoProximoPasso
        .classList
        .toggle(
            "concluido",
            concluido
        );

}


function atualizarAcaoPrincipal() {

    const proximaAcao =
        obterProximaAcao();

    if (acaoEmAndamento) {

        botaoRegistrarHorario.disabled =
            true;

        campoHorarioRegistro.disabled =
            true;

        botaoUsarHorarioAtual.disabled =
            true;

        botaoRegistrarHorario
            .classList
            .add(
                "carregando"
            );

        tituloAcaoJornada.textContent =
            "Salvando horário...";

        descricaoAcaoJornada.textContent =
            "Aguarde enquanto o registro é confirmado.";

        definirIconeAcao(
            "hourglass-split"
        );

        atualizarProximoPasso(
            proximaAcao
        );

        return;

    }

    botaoRegistrarHorario
        .classList
        .remove(
            "carregando"
        );

    let titulo =
        "Jornada indisponível";

    let descricao =
        "Não existe uma ação disponível.";

    let icone =
        "slash-circle";

    if (
        proximaAcao ===
        "ENTRADA"
    ) {

        titulo =
            "Registrar entrada";

        descricao =
            dadosJornadaAtual
                ? "Registrar o primeiro horário da jornada"
                : "Abrir a jornada e registrar a entrada";

        icone =
            "box-arrow-in-right";

    }

    if (
        proximaAcao ===
        "INICIO_ALMOCO"
    ) {

        titulo =
            "Iniciar almoço";

        descricao =
            "Registrar o início do intervalo";

        icone =
            "fork-knife";

    }

    if (
        proximaAcao ===
        "FIM_ALMOCO"
    ) {

        titulo =
            "Registrar retorno";

        descricao =
            "Confirme o tipo de trabalho da tarde";

        icone =
            "arrow-return-left";

    }

    if (
        proximaAcao ===
        "SAIDA"
    ) {

        titulo =
            "Registrar saída";

        descricao =
            "Concluir e calcular a jornada de hoje";

        icone =
            "box-arrow-right";

    }

    if (
        dadosJornadaAtual
            ?.jornada
            ?.situacao_jornada ===
        "CONCLUIDA"
    ) {

        titulo =
            "Jornada concluída";

        descricao =
            "Todos os horários foram registrados";

        icone =
            "check-circle-fill";

    }

    tituloAcaoJornada.textContent =
        titulo;

    descricaoAcaoJornada.textContent =
        descricao;

    definirIconeAcao(
        icone
    );

    let podeRegistrar =
        Boolean(
            proximaAcao
        );

    if (
        proximaAcao ===
        "ENTRADA"
        &&
        !dadosJornadaAtual
        &&
        !tipoTrabalhoSelecionado
    ) {

        podeRegistrar =
            false;

        descricaoAcaoJornada.textContent =
            "Primeiro selecione o tipo de trabalho";

    }

    if (
        proximaAcao ===
        "FIM_ALMOCO"
        &&
        !tipoTrabalhoSelecionado
    ) {

        podeRegistrar =
            false;

        descricaoAcaoJornada.textContent =
            "Selecione o trabalho realizado após o almoço";

    }

    botaoRegistrarHorario.disabled =
        !podeRegistrar;

    campoHorarioRegistro.disabled =
        !proximaAcao;

    botaoUsarHorarioAtual.disabled =
        !proximaAcao;

    atualizarProximoPasso(
        proximaAcao
    );

}


/* =========================================================
   HORÁRIO DO REGISTRO
   ========================================================= */

function atualizarTextoOrigemHorario() {

    textoOrigemHorario
        .classList
        .toggle(
            "manual",
            horarioDigitadoManualmente
        );

    textoOrigemHorario.textContent =
        horarioDigitadoManualmente
            ? "Horário digitado manualmente."
            : "Horário atual selecionado.";

}


function usarHorarioAtual() {

    horarioDigitadoManualmente =
        false;

    preencherCampoHorario(
        obterHorarioAtualTexto()
    );

    atualizarTextoOrigemHorario();

}


function marcarHorarioComoManual() {

    horarioDigitadoManualmente =
        true;

    atualizarTextoOrigemHorario();

}


function obterDadosDoHorario() {

    const horario =
        HORARIO_JORNADA.montarHorarioDigitado(
            campoHorarioRegistro.value
        );

    if (!horario) {

        throw new Error(
            "Informe um horário válido entre 00:00 e 23:59."
        );

    }

    preencherCampoHorario(horario);

    return {

        horario_informado:
            horario,

        origem_registro:
            horarioDigitadoManualmente
                ? "DIGITADO_MANUALMENTE"
                : "HORARIO_ATUAL"

    };

}


/* =========================================================
   CONSULTAR A JORNADA
   ========================================================= */

async function carregarJornadaHoje() {

    const dataHoje =
        obterDataLocalIso();

    try {

        dadosJornadaAtual =
            await requisicaoApi(
                `/jornadas/data/${dataHoje}`,
                {
                    method: "GET"
                }
            );

    } catch (erro) {

        if (
            erro.status === 404
        ) {

            dadosJornadaAtual =
                null;

        } else {

            throw erro;

        }

    }

    if (
        usuarioAtual &&
        window.SINCRONIZACAO_OFFLINE
    ) {

        dadosJornadaAtual =
            SINCRONIZACAO_OFFLINE
                .salvarJornadaServidor(
                    usuarioAtual.id_usuario,
                    dataHoje,
                    dadosJornadaAtual
                );

    }

    configurarSeletorTipoTrabalho();

    carregarRascunhoAtividade();

    atualizarStatusJornada();

    atualizarLinhaTempo();

    atualizarResumo();

    atualizarAcaoPrincipal();

    atividadeDoDia.disabled =
        Boolean(
            dadosJornadaAtual
            &&
            dadosJornadaAtual
                .jornada
                .situacao_jornada !==
                "EM_ANDAMENTO"
        );

}


/* =========================================================
   ABRIR A JORNADA
   ========================================================= */

async function abrirJornadaSeNecessario() {

    if (dadosJornadaAtual) {

        return dadosJornadaAtual
            .jornada
            .id_jornada;

    }

    const resposta =
        await requisicaoApi(
            "/jornadas",
            {
                method: "POST",

                body: JSON.stringify(
                    {
                        data_jornada:
                            obterDataLocalIso(),

                        tipo_trabalho_inicio:
                            tipoTrabalhoSelecionado
                    }
                )
            }
        );

    return resposta
        .jornada
        .id_jornada;

}


/* =========================================================
   REGISTRAR A PRÓXIMA AÇÃO
   ========================================================= */

async function sincronizarFilaOffline() {

    if (
        !navigator.onLine ||
        !usuarioAtual ||
        !window.SINCRONIZACAO_OFFLINE
    ) {
        return null;
    }

    if (sincronizacaoEmAndamento) {
        return sincronizacaoEmAndamento;
    }

    sincronizacaoEmAndamento =
        SINCRONIZACAO_OFFLINE
            .sincronizarPendencias(
                usuarioAtual.id_usuario,
                operacao => requisicaoApi(
                    "/jornadas/sincronizar-offline",
                    {
                        method: "POST",
                        body: JSON.stringify(operacao)
                    }
                )
            );

    try {
        return await sincronizacaoEmAndamento;
    } finally {
        sincronizacaoEmAndamento = null;
    }

}

async function sincronizarAoRetomarUso() {

    if (
        !navigator.onLine ||
        !usuarioAtual ||
        acaoEmAndamento ||
        !window.SINCRONIZACAO_OFFLINE ||
        SINCRONIZACAO_OFFLINE.quantidadePendencias(
            usuarioAtual.id_usuario
        ) === 0
    ) {
        return;
    }

    try {

        const resultado = await sincronizarFilaOffline();

        if (resultado && resultado.restantes === 0) {
            await carregarJornadaHoje();
        }

        atualizarEstadoConexao();

    } catch (erro) {
        console.error(
            "Erro ao retomar a sincronização offline:",
            erro
        );
    }

}

function carregarModoOffline(usuario) {

    dadosJornadaAtual =
        SINCRONIZACAO_OFFLINE
            .obterJornada(
                usuario.id_usuario,
                obterDataLocalIso()
            );

    configurarSeletorTipoTrabalho();
    carregarRascunhoAtividade();
    atualizarStatusJornada();
    atualizarLinhaTempo();
    atualizarResumo();
    atualizarAcaoPrincipal();
    atualizarEstadoConexao();

    atividadeDoDia.disabled =
        Boolean(
            dadosJornadaAtual &&
            dadosJornadaAtual
                .jornada
                .situacao_jornada !==
                "EM_ANDAMENTO"
        );

}

async function registrarProximaAcao() {

    if (acaoEmAndamento) {

        return;

    }

    const proximaAcao =
        obterProximaAcao();

    if (!proximaAcao) {

        return;

    }

    acaoEmAndamento =
        true;

    atualizarAcaoPrincipal();

    try {

        const dadosHorario =
            obterDadosDoHorario();

        if (
            !usuarioAtual ||
            !window.SINCRONIZACAO_OFFLINE
        ) {
            throw new Error(
                "A fila segura de sincronização não está disponível."
            );
        }

        const resultadoLocal =
            SINCRONIZACAO_OFFLINE
                .registrarHorario(
                    usuarioAtual.id_usuario,
                    {
                        data_jornada:
                            obterDataLocalIso(),
                        tipo_registro:
                            proximaAcao,
                        horario_informado:
                            dadosHorario
                                .horario_informado,
                        origem_registro:
                            dadosHorario
                                .origem_registro,
                        tipo_trabalho_inicio:
                            dadosJornadaAtual
                                ?.jornada
                                ?.tipo_trabalho_inicio
                            ||
                            tipoTrabalhoSelecionado,
                        tipo_trabalho_apos_almoco:
                            proximaAcao === "FIM_ALMOCO"
                                ? tipoTrabalhoSelecionado
                                : null,
                        atividade_do_dia:
                            proximaAcao === "SAIDA"
                                ? atividadeDoDia
                                    .value
                                    .trim()
                                    || null
                                : null
                    }
                );

        dadosJornadaAtual =
            resultadoLocal.jornada;

        if (proximaAcao === "SAIDA") {
            apagarRascunhoAtividade();
        }

        configurarSeletorTipoTrabalho();
        atualizarStatusJornada();
        atualizarLinhaTempo();
        atualizarResumo();
        atividadeDoDia.disabled =
            proximaAcao === "SAIDA";

        usarHorarioAtual();

        if (!navigator.onLine) {

            mostrarMensagemFlutuante(
                "Horário salvo no aparelho. Ele será enviado quando a conexão voltar."
            );

        } else {

            const resultadoSincronizacao =
                await sincronizarFilaOffline();

            if (resultadoSincronizacao?.conflitos > 0) {
                mostrarMensagemFlutuante(
                    "O horário foi enviado e ficou aguardando revisão administrativa.",
                    "aviso"
                );
            } else if (
                resultadoSincronizacao?.restantes > 0
            ) {
                mostrarMensagemFlutuante(
                    "Horário salvo no aparelho. O envio será tentado novamente automaticamente."
                );
            } else {
                mostrarMensagemFlutuante(
                    "Horário registrado e sincronizado com sucesso!"
                );
            }

            if (
                resultadoSincronizacao &&
                resultadoSincronizacao.restantes === 0
            ) {
                await carregarJornadaHoje();
            }

        }

        atualizarEstadoConexao();

    } catch (erro) {

        console.error(
            "Erro ao registrar horário:",
            erro
        );

        mostrarMensagemFlutuante(
            erro.message
            ||
            "Não foi possível registrar o horário.",
            "erro"
        );

    } finally {

        acaoEmAndamento =
            false;

        atualizarAcaoPrincipal();

    }

}


/* =========================================================
   CARREGAR USUÁRIO E PÁGINA
   ========================================================= */

async function carregarPagina() {

    if (
        !usuarioEstaAutenticado()
    ) {

        voltarParaLogin();

        return;

    }

    const usuarioSalvo =
        obterUsuarioSalvo();

    if (usuarioSalvo) {

        preencherDadosUsuario(
            usuarioSalvo
        );

    }

    if (
        !navigator.onLine &&
        usuarioSalvo &&
        window.SINCRONIZACAO_OFFLINE
    ) {

        carregarModoOffline(usuarioSalvo);

        mostrarMensagemFlutuante(
            "Modo offline: os horários ficarão salvos neste aparelho."
        );

        return;

    }

    try {

        const usuarioAtualizado =
            await requisicaoApi(
                "/autenticacao/me",
                {
                    method: "GET"
                }
            );

        preencherDadosUsuario(
            usuarioAtualizado
        );

        localStorage.setItem(
            CHAVES_SESSAO.USUARIO,
            JSON.stringify(
                usuarioAtualizado
            )
        );

        const resultadoSincronizacao =
            await sincronizarFilaOffline();

        if (resultadoSincronizacao?.conflitos > 0) {
            mostrarMensagemFlutuante(
                "Um horário offline ficou aguardando revisão administrativa.",
                "aviso"
            );
        }

        await carregarJornadaHoje();

    } catch (erro) {

        console.error(
            "Erro ao carregar a página:",
            erro
        );

        if (
            erro.status === 401
        ) {

            limparSessao();

            voltarParaLogin();

            return;

        }

        if (
            erro.status === 0 &&
            usuarioSalvo &&
            window.SINCRONIZACAO_OFFLINE
        ) {

            carregarModoOffline(usuarioSalvo);

            mostrarMensagemFlutuante(
                "Servidor indisponível: os horários ficarão salvos neste aparelho."
            );

            return;

        }

        mostrarMensagemFlutuante(
            erro.message
            ||
            "Não foi possível carregar os dados da jornada.",
            "erro"
        );

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

botoesTipoTrabalho.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                if (botao.disabled) {

                    return;

                }

                selecionarTipoTrabalho(
                    botao.dataset
                        .tipoTrabalho
                );

            }
        );

    }
);


atividadeDoDia.addEventListener(
    "input",
    salvarRascunhoAtividade
);


campoHorarioRegistro.addEventListener(
    "beforeinput",
    tratarRemocaoHorario
);


campoHorarioRegistro.addEventListener(
    "input",
    normalizarCampoHorario
);


campoHorarioRegistro.addEventListener(
    "focus",
    () => campoHorarioRegistro.select()
);


campoHorarioRegistro.addEventListener(
    "blur",
    completarCampoHorario
);


botaoUsarHorarioAtual.addEventListener(
    "click",
    usarHorarioAtual
);


botaoRegistrarHorario.addEventListener(
    "click",
    registrarProximaAcao
);


botaoSair.addEventListener(
    "click",
    async () => {

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

            voltarParaLogin();

        }

    }
);


window.addEventListener(
    "online",
    async () => {

        atualizarEstadoConexao();

        try {

            const resultadoSincronizacao =
                await sincronizarFilaOffline();

            await carregarJornadaHoje();

            if (resultadoSincronizacao?.conflitos > 0) {
                mostrarMensagemFlutuante(
                    "Um horário offline foi enviado para revisão administrativa.",
                    "aviso"
                );
            } else if (
                resultadoSincronizacao?.sincronizadas > 0
            ) {
                mostrarMensagemFlutuante(
                    "Horários offline sincronizados com sucesso!"
                );
            }

            atualizarEstadoConexao();

        } catch (erro) {

            console.error(
                "Erro ao atualizar a jornada:",
                erro
            );

        }

    }
);


window.addEventListener(
    "offline",
    atualizarEstadoConexao
);


window.addEventListener(
    "focus",
    sincronizarAoRetomarUso
);


document.addEventListener(
    "visibilitychange",
    () => {
        if (document.visibilityState === "visible") {
            sincronizarAoRetomarUso();
        }
    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarDataAtual();

usarHorarioAtual();

atualizarRelogio();

atualizarEstadoConexao();

window.setInterval(
    atualizarRelogio,
    1000
);

window.setInterval(
    sincronizarAoRetomarUso,
    30000
);

carregarPagina();
