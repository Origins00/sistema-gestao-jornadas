/*
 * Painel administrativo com o status das jornadas do dia.
 */


/* =========================================================
   ELEMENTOS DO CABEÇALHO
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

const dataStatusHoje = document.getElementById(
    "data-status-hoje"
);

const indicadorConexao = document.getElementById(
    "indicador-conexao"
);

const botaoAtualizarStatus = document.getElementById(
    "botao-atualizar-status"
);


/* =========================================================
   ELEMENTOS DO RESUMO
   ========================================================= */

const resumoTotalPessoas = document.getElementById(
    "resumo-total-pessoas"
);

const resumoTrabalhando = document.getElementById(
    "resumo-trabalhando"
);

const resumoAlmocando = document.getElementById(
    "resumo-almocando"
);

const resumoEncerrados = document.getElementById(
    "resumo-encerrados"
);

const resumoPendentes = document.getElementById(
    "resumo-pendentes"
);

const resumoEspeciais = document.getElementById(
    "resumo-especiais"
);


/* =========================================================
   ELEMENTOS DOS FILTROS
   ========================================================= */

const campoPesquisaStatus = document.getElementById(
    "campo-pesquisa-status"
);

const botaoLimparPesquisaStatus = document.getElementById(
    "botao-limpar-pesquisa-status"
);

const botoesFiltroStatus = document.querySelectorAll(
    "[data-filtro-status]"
);


/* =========================================================
   ELEMENTOS DA LISTA
   ========================================================= */

const descricaoResultadosStatus = document.getElementById(
    "descricao-resultados-status"
);

const estadoCarregamentoStatus = document.getElementById(
    "estado-carregamento-status"
);

const estadoVazioStatus = document.getElementById(
    "estado-vazio-status"
);

const listaFuncionariosStatus = document.getElementById(
    "lista-funcionarios-status"
);


/* =========================================================
   ELEMENTOS DOS DETALHES
   ========================================================= */

const fundoDetalhesStatus = document.getElementById(
    "fundo-detalhes-status"
);

const tituloDetalhesStatus = document.getElementById(
    "titulo-detalhes-status"
);

const conteudoDetalhesStatus = document.getElementById(
    "conteudo-detalhes-status"
);

const botaoFecharDetalhesStatus = document.getElementById(
    "botao-fechar-detalhes-status"
);


/* =========================================================
   ELEMENTOS DO FORMULÁRIO DE SITUAÇÃO
   ========================================================= */

const fundoFormularioSituacao = document.getElementById(
    "fundo-formulario-situacao"
);

const formularioSituacao = document.getElementById(
    "formulario-situacao"
);

const tituloFormularioSituacao = document.getElementById(
    "titulo-formulario-situacao"
);

const descricaoFormularioSituacao = document.getElementById(
    "descricao-formulario-situacao"
);

const avatarFormularioSituacao = document.getElementById(
    "avatar-formulario-situacao"
);

const nomeFormularioSituacao = document.getElementById(
    "nome-formulario-situacao"
);

const dataFormularioSituacao = document.getElementById(
    "data-formulario-situacao"
);

const campoTipoSituacao = document.getElementById(
    "tipo-situacao"
);

const campoMotivoSituacao = document.getElementById(
    "motivo-situacao"
);

const grupoMotivoAlteracaoSituacao = document.getElementById(
    "grupo-motivo-alteracao-situacao"
);

const campoMotivoAlteracaoSituacao = document.getElementById(
    "motivo-alteracao-situacao"
);

const botaoFecharFormularioSituacao = document.getElementById(
    "botao-fechar-formulario-situacao"
);

const botaoCancelarFormularioSituacao = document.getElementById(
    "botao-cancelar-formulario-situacao"
);

const botaoSalvarSituacao = document.getElementById(
    "botao-salvar-situacao"
);

const textoBotaoSalvarSituacao = document.getElementById(
    "texto-botao-salvar-situacao"
);


/* =========================================================
   ELEMENTOS DA REMOÇÃO
   ========================================================= */

const fundoRemocaoSituacao = document.getElementById(
    "fundo-remocao-situacao"
);

const nomeRemocaoSituacao = document.getElementById(
    "nome-remocao-situacao"
);

const tipoRemocaoSituacao = document.getElementById(
    "tipo-remocao-situacao"
);

const campoMotivoRemocaoSituacao = document.getElementById(
    "motivo-remocao-situacao"
);

const botaoFecharRemocaoSituacao = document.getElementById(
    "botao-fechar-remocao-situacao"
);

const botaoCancelarRemocaoSituacao = document.getElementById(
    "botao-cancelar-remocao-situacao"
);

const botaoConfirmarRemocaoSituacao = document.getElementById(
    "botao-confirmar-remocao-situacao"
);

/* =========================================================
   ELEMENTOS DO HISTÓRICO DE SITUAÇÕES
   ========================================================= */

const fundoHistoricoSituacao = document.getElementById(
    "fundo-historico-situacao"
);

const botaoFecharHistoricoSituacao = document.getElementById(
    "botao-fechar-historico-situacao"
);

const avatarHistoricoSituacao = document.getElementById(
    "avatar-historico-situacao"
);

const nomeHistoricoSituacao = document.getElementById(
    "nome-historico-situacao"
);

const carregamentoHistoricoSituacao = document.getElementById(
    "carregamento-historico-situacao"
);

const vazioHistoricoSituacao = document.getElementById(
    "vazio-historico-situacao"
);

const listaHistoricoSituacao = document.getElementById(
    "lista-historico-situacao"
);


/* =========================================================
   OUTROS ELEMENTOS
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

let funcionariosCarregados = [];

let funcionariosFiltrados = [];

let filtroStatusAtual = "TODOS";

let funcionarioAberto = null;

let elementoFocoAntesDetalhes = null;

let carregandoStatus = false;

let dataReferenciaStatusAtual = null;

let funcionarioSituacaoSelecionado = null;

let modoFormularioSituacao = "CRIAR";

let salvandoSituacao = false;

let removendoSituacao = false;

let funcionarioHistoricoSelecionado = null;

let carregandoHistoricoSituacao = false;

let temporizadorPesquisa = null;

let temporizadorMensagem = null;

let temporizadorAtualizacaoAutomatica = null;


/* =========================================================
   CONSTANTES
   ========================================================= */

const STATUS_ESPECIAIS = [
    "AUSENTE",
    "ATESTADO",
    "FERIAS",
    "FOLGA",
    "DIA_ENCERRADO"
];


const INFORMACOES_STATUS = {

    TRABALHANDO: {

        texto: "Trabalhando",

        icone: "person-workspace",

        classe: "trabalhando"

    },

    ALMOCANDO: {

        texto: "Almoçando",

        icone: "cup-hot-fill",

        classe: "almocando"

    },

    EXPEDIENTE_ENCERRADO: {

        texto: "Expediente encerrado",

        icone: "check-circle-fill",

        classe: "encerrado"

    },

    PONTO_PENDENTE: {

        texto: "Ponto pendente",

        icone: "exclamation-circle-fill",

        classe: "pendente"

    },

    AUSENTE: {

        texto: "Ausente",

        icone: "person-x-fill",

        classe: "especial"

    },

    ATESTADO: {

        texto: "Atestado",

        icone: "file-medical-fill",

        classe: "especial"

    },

    FERIAS: {

        texto: "Férias",

        icone: "sun-fill",

        classe: "especial"

    },

    FOLGA: {

        texto: "Folga",

        icone: "house-heart-fill",

        classe: "especial"

    },

    DIA_ENCERRADO: {

        texto: "Dia encerrado",

        icone: "cloud-rain-heavy-fill",

        classe: "especial"

    }

};

const INFORMACOES_TIPOS_SITUACAO = {

    ATESTADO: {
        texto: "Atestado",
        icone: "file-medical-fill"
    },

    FERIAS: {
        texto: "Férias",
        icone: "sun-fill"
    },

    FOLGA: {
        texto: "Folga",
        icone: "house-heart-fill"
    },

    AUSENCIA: {
        texto: "Ausência",
        icone: "person-x-fill"
    },

    DIA_ENCERRADO: {
        texto: "Dia encerrado",
        icone: "cloud-rain-heavy-fill"
    }

};


/* =========================================================
   SEGURANÇA DE TEXTO
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


/* =========================================================
   FORMATAÇÕES
   ========================================================= */

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

    const numeros = String(cpf).replace(
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

    const partes = String(dataIso)
        .slice(0, 10)
        .split("-")
        .map(Number);

    if (
        partes.length !== 3 ||
        partes.some(
            parte => Number.isNaN(parte)
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


function formatarDataCompleta(dataIso) {

    const data = criarDataLocal(
        dataIso
    );

    if (!data) {

        return "Data não informada";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(data);

}


function formatarDataHora(dataIso) {

    if (!dataIso) {

        return "Não informado";

    }

    const textoIso = String(dataIso).replace(
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
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(data);

}


function formatarHorario(horario) {

    return horario || "--:--";

}


function obterTextoTipoTrabalho(tipoTrabalho) {

    const tipos = {

        ADMINISTRATIVO: "Atividade administrativa",

        OPERACIONAL: "Operacional"

    };

    return tipos[tipoTrabalho] ||
        "Não informado";

}


function obterTextoTipoRegistro(tipoRegistro) {

    const tipos = {

        ENTRADA: "Entrada",

        INICIO_ALMOCO: "Início do almoço",

        FIM_ALMOCO: "Retorno do almoço",

        SAIDA: "Saída"

    };

    return tipos[tipoRegistro] ||
        "Nenhum registro";

}


function obterTextoTipoUsuario(tipoUsuario) {

    return tipoUsuario ===
        "ADMINISTRADOR"
        ? "Administrador"
        : "Funcionário";

}


function obterInformacaoStatus(statusAtual) {

    return (
        INFORMACOES_STATUS[statusAtual] ||
        {
            texto: statusAtual || "Não informado",
            icone: "question-circle-fill",
            classe: "pendente"
        }
    );

}


/* =========================================================
   SESSÃO E NAVEGAÇÃO
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
            "Erro ao encerrar a sessão:",
            erro
        );

    } finally {

        limparSessao();

        voltarParaLogin();

    }

}


/* =========================================================
   DADOS DO ADMINISTRADOR
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
   CONEXÃO
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

    botaoAtualizarStatus.disabled =
        !conectado ||
        carregandoStatus;

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

    carregandoStatus =
        carregando;


    if (carregando) {

        estadoCarregamentoStatus.hidden =
            false;

        estadoCarregamentoStatus.style.display =
            "grid";


        /*
         * No primeiro carregamento ainda não existem
         * funcionários para exibir.
         */
        if (
            funcionariosCarregados.length === 0
        ) {

            listaFuncionariosStatus.hidden =
                true;

            estadoVazioStatus.hidden =
                true;

        }

    } else {

        /*
         * Esconde definitivamente o círculo e a mensagem
         * quando a consulta terminar.
         */
        estadoCarregamentoStatus.hidden =
            true;

        estadoCarregamentoStatus.style.display =
            "none";

    }

    botaoAtualizarStatus.classList.toggle(
        "carregando",
        carregando
    );

    botaoAtualizarStatus.setAttribute(
        "aria-busy",
        String(carregando)
    );


    atualizarEstadoConexao();

}
/* =========================================================
   RESUMO
   ========================================================= */

function preencherResumo(
    resumo
) {

    const totalEspeciais =
        resumo.ausentes +
        resumo.atestados +
        resumo.ferias +
        resumo.folgas +
        resumo.dias_encerrados;

    resumoTotalPessoas.textContent =
        resumo.total_pessoas;

    resumoTrabalhando.textContent =
        resumo.trabalhando;

    resumoAlmocando.textContent =
        resumo.almocando;

    resumoEncerrados.textContent =
        resumo.expediente_encerrado;

    resumoPendentes.textContent =
        resumo.ponto_pendente;

    resumoEspeciais.textContent =
        totalEspeciais;

}


/* =========================================================
   CARTÃO DO FUNCIONÁRIO
   ========================================================= */

function criarHorarioResumido(
    nome,
    horario
) {

    const classeVazio =
        horario
            ? ""
            : "vazio";

    return `

        <div class="horario-resumido-status ${classeVazio}">

            <span>
                ${escaparHtml(nome)}
            </span>

            <strong>
                ${escaparHtml(
        formatarHorario(horario)
    )}
            </strong>

        </div>
    `;

}


function criarCartaoFuncionario(
    funcionario
) {

    const informacaoStatus =
        obterInformacaoStatus(
            funcionario.status_atual
        );

    const jornada =
        funcionario.jornada;

    const horarios =
        funcionario.horarios;

    const ultimoRegistro =
        funcionario.ultimo_registro;

    const botao =
        document.createElement(
            "button"
        );

    botao.type = "button";

    botao.className =
        "cartao-funcionario-status";

    botao.setAttribute(
        "aria-label",
        `Ver status de ${funcionario.nome_completo}`
    );

    const textoUltimoRegistro =
        ultimoRegistro.tipo_registro
            ? (
                `${obterTextoTipoRegistro(
                    ultimoRegistro.tipo_registro
                )}: ${ultimoRegistro.horario_informado
                }`
            )
            : "Nenhum horário registrado hoje";

    botao.innerHTML = `

        <div class="cabecalho-funcionario-status">

            <div class="identificacao-funcionario-status">

                <div class="avatar-funcionario-status">

                    ${escaparHtml(
        obterIniciaisNome(
            funcionario.nome_completo
        )
    )}

                </div>

                <div>

                    <h3>
                        ${escaparHtml(
        funcionario.nome_completo
    )}
                    </h3>

                    <p>
                        ${escaparHtml(
        formatarCpf(
            funcionario.cpf
        )
    )}
                    </p>

                </div>

            </div>


            <span
                class="
                    etiqueta-status-funcionario
                    ${informacaoStatus.classe}
                "
            >

                ${criarIconeSvg(
        informacaoStatus.icone,
        "icone-sistema--etiqueta"
    )}

${escaparHtml(
        informacaoStatus.texto
    )}

            </span>

        </div>


        <div class="grade-informacoes-status">

            <div class="informacao-status">

                <span>
                    Trabalho atual
                </span>

                <strong>
                    ${escaparHtml(
        obterTextoTipoTrabalho(
            jornada.tipo_trabalho_atual
        )
    )}
                </strong>

            </div>


            <div class="informacao-status">

                <span>
                    Tipo de usuário
                </span>

                <strong>
                    ${escaparHtml(
        obterTextoTipoUsuario(
            funcionario.tipo_usuario
        )
    )}
                </strong>

            </div>

        </div>


        <div class="horarios-resumidos-status">

            ${criarHorarioResumido(
        "Entrada",
        horarios.entrada
    )}

            ${criarHorarioResumido(
        "Almoço",
        horarios.inicio_almoco
    )}

            ${criarHorarioResumido(
        "Retorno",
        horarios.fim_almoco
    )}

            ${criarHorarioResumido(
        "Saída",
        horarios.saida
    )}

        </div>


        <div class="rodape-cartao-status">

            <span class="ultimo-registro-status">

                Último registro:

                <strong>
                    ${escaparHtml(
        textoUltimoRegistro
    )}
                </strong>

            </span>

            <span class="acao-ver-detalhes-status">

    Ver detalhes

    ${criarIconeSvg(
        "chevron-right"
    )}

</span>

        </div>
    `;

    botao.addEventListener(
        "click",
        () => {

            abrirDetalhesFuncionario(
                funcionario
            );

        }
    );

    return botao;

}


/* =========================================================
   FILTROS
   ========================================================= */

function funcionarioCorrespondeAoFiltro(
    funcionario
) {

    if (
        filtroStatusAtual ===
        "TODOS"
    ) {

        return true;

    }

    if (
        filtroStatusAtual ===
        "ESPECIAIS"
    ) {

        return STATUS_ESPECIAIS.includes(
            funcionario.status_atual
        );

    }

    return funcionario.status_atual ===
        filtroStatusAtual;

}


function funcionarioCorrespondeAPesquisa(
    funcionario
) {

    const pesquisa =
        normalizarTexto(
            campoPesquisaStatus.value
        );

    if (!pesquisa) {

        return true;

    }

    const nome =
        normalizarTexto(
            funcionario.nome_completo
        );

    const cpf =
        String(
            funcionario.cpf || ""
        ).replace(
            /\D/g,
            ""
        );

    const pesquisaNumerica =
        campoPesquisaStatus.value.replace(
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


function aplicarFiltros() {

    funcionariosFiltrados =
        funcionariosCarregados.filter(
            funcionario => {

                return (
                    funcionarioCorrespondeAoFiltro(
                        funcionario
                    ) &&
                    funcionarioCorrespondeAPesquisa(
                        funcionario
                    )
                );

            }
        );

    preencherListaFuncionarios(
        funcionariosFiltrados
    );

}


/* =========================================================
   PREENCHIMENTO DA LISTA
   ========================================================= */

function preencherListaFuncionarios(
    funcionarios
) {

    listaFuncionariosStatus.innerHTML =
        "";

    if (funcionarios.length === 0) {

        listaFuncionariosStatus.hidden =
            true;

        estadoVazioStatus.hidden =
            false;

        descricaoResultadosStatus.textContent =
            "Nenhuma pessoa encontrada.";

        return;

    }

    estadoVazioStatus.hidden =
        true;

    funcionarios.forEach(
        funcionario => {

            listaFuncionariosStatus.appendChild(
                criarCartaoFuncionario(
                    funcionario
                )
            );

        }
    );

    listaFuncionariosStatus.hidden =
        false;

    descricaoResultadosStatus.textContent =
        funcionarios.length === 1
            ? "1 pessoa encontrada."
            : `${funcionarios.length} pessoas encontradas.`;

}


/* =========================================================
   CONSULTA DO STATUS
   ========================================================= */

async function consultarStatusHoje(
    mostrarConfirmacao = false,
    mostrarCarregamento = true
) {

    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível atualizar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }


    if (mostrarCarregamento) {

        definirCarregamento(
            true
        );

    }


    try {

        const resposta =
            await requisicaoApi(
                "/administracao/status-hoje",
                {
                    method: "GET"
                }
            );


        funcionariosCarregados =
            resposta.funcionarios || [];


        dataReferenciaStatusAtual =
            resposta.data_referencia;


        dataStatusHoje.textContent =
            formatarDataCompleta(
                resposta.data_referencia
            );


        preencherResumo(
            resposta.resumo
        );


        aplicarFiltros();


        if (mostrarConfirmacao) {

            mostrarMensagemFlutuante(
                "Status do dia atualizado com sucesso!"
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao consultar o status de hoje:",
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
            "Não foi possível consultar o status do dia.",
            "erro"
        );

    } finally {

        /*
         * O finally sempre será executado, mesmo quando
         * ocorrer erro durante a consulta.
         */
        if (mostrarCarregamento) {

            definirCarregamento(
                false
            );

        }

    }

}


/* =========================================================
   DETALHES DO FUNCIONÁRIO
   ========================================================= */

function atualizarBloqueioRolagem() {

    const existeJanelaAberta = (

        !fundoDetalhesStatus.hidden ||

        !fundoFormularioSituacao.hidden ||

        !fundoRemocaoSituacao.hidden ||

        !fundoHistoricoSituacao.hidden

    );


    document.body.style.overflow =
        existeJanelaAberta
            ? "hidden"
            : "";

}


function abrirPainelDetalhesStatus() {

    const painelEstavaFechado =
        fundoDetalhesStatus.hidden;

    if (painelEstavaFechado) {

        elementoFocoAntesDetalhes =
            document.activeElement;

    }

    fundoDetalhesStatus.hidden =
        false;

    atualizarBloqueioRolagem();

    if (painelEstavaFechado) {

        botaoFecharDetalhesStatus.focus();

    }

}


function fecharPainelDetalhesStatus() {

    fundoDetalhesStatus.hidden =
        true;

    funcionarioAberto =
        null;

    atualizarBloqueioRolagem();

    if (
        elementoFocoAntesDetalhes &&
        document.contains(
            elementoFocoAntesDetalhes
        )
    ) {

        elementoFocoAntesDetalhes.focus();

    }

    elementoFocoAntesDetalhes =
        null;

}


function criarHorarioDetalhado(
    nome,
    horario
) {

    const classeVazio =
        horario
            ? ""
            : "vazio";

    return `

        <div class="horario-detalhes-status ${classeVazio}">

            <span>
                ${escaparHtml(nome)}
            </span>

            <strong>
                ${escaparHtml(
        formatarHorario(horario)
    )}
            </strong>

        </div>
    `;

}


function criarHtmlSemJornada() {

    return `

        <div class="aviso-sem-jornada-status">

            <div class="aviso-sem-jornada-status__icone">

                ${criarIconeSvg(
        "exclamation-circle-fill"
    )}

            </div>

            <strong>
                Nenhuma jornada registrada hoje
            </strong>

            <p>
                A pessoa ainda não abriu a jornada nesta data.
                Por isso, aparece como ponto pendente e não
                como ausência automática.
            </p>

        </div>
    `;

}


function criarHtmlComJornada(
    funcionario
) {

    const jornada =
        funcionario.jornada;

    const horarios =
        funcionario.horarios;

    const ultimoRegistro =
        funcionario.ultimo_registro;

    const atividade =
        jornada.atividade_do_dia ||
        "Nenhuma atividade foi informada até o momento.";

    return `

        <section class="secao-detalhes-status">

            <h3>
                Horários registrados
            </h3>

            <div class="grade-horarios-detalhes-status">

                ${criarHorarioDetalhado(
        "Entrada",
        horarios.entrada
    )}

                ${criarHorarioDetalhado(
        "Início do almoço",
        horarios.inicio_almoco
    )}

                ${criarHorarioDetalhado(
        "Retorno",
        horarios.fim_almoco
    )}

                ${criarHorarioDetalhado(
        "Saída",
        horarios.saida
    )}

            </div>

        </section>


        <section class="secao-detalhes-status">

            <h3>
                Informações da jornada
            </h3>

            <div class="grade-dados-detalhes-status">

                <div class="dado-detalhes-status">

                    <span>
                        Tipo no início
                    </span>

                    <strong>
                        ${escaparHtml(
        obterTextoTipoTrabalho(
            jornada.tipo_trabalho_inicio
        )
    )}
                    </strong>

                </div>


                <div class="dado-detalhes-status">

                    <span>
                        Tipo após o almoço
                    </span>

                    <strong>
                        ${escaparHtml(
        obterTextoTipoTrabalho(
            jornada.tipo_trabalho_apos_almoco
        )
    )}
                    </strong>

                </div>


                <div class="dado-detalhes-status">

                    <span>
                        Situação da jornada
                    </span>

                    <strong>
                        ${escaparHtml(
        jornada.situacao_jornada ||
        "Não informada"
    )}
                    </strong>

                </div>


                <div class="dado-detalhes-status">

                    <span>
                        Último lançamento
                    </span>

                    <strong>
                        ${escaparHtml(
        formatarDataHora(
            ultimoRegistro
                .data_hora_lancamento
        )
    )}
                    </strong>

                </div>


                <div class="dado-detalhes-status">

                    <span>
                        Último registro
                    </span>

                    <strong>
                        ${escaparHtml(
        obterTextoTipoRegistro(
            ultimoRegistro
                .tipo_registro
        )
    )}
                    </strong>

                </div>


                <div class="dado-detalhes-status">

                    <span>
                        Horário informado
                    </span>

                    <strong>
                        ${escaparHtml(
        formatarHorario(
            ultimoRegistro
                .horario_informado
        )
    )}
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhes-status">

            <h3>
                Atividade do dia
            </h3>

            <div class="atividade-detalhes-status">

                ${escaparHtml(
        atividade
    )}

            </div>

        </section>
    `;

}

function obterInformacaoTipoSituacao(
    tipoSituacao
) {

    return (
        INFORMACOES_TIPOS_SITUACAO[
        tipoSituacao
        ] ||
        {
            texto: tipoSituacao || "Não informada",
            icone: "question-circle-fill"
        }
    );

}


function criarHtmlSituacaoEspecial(
    funcionario
) {

    const situacao =
        funcionario.situacao_especial;

    const informacao =
        obterInformacaoTipoSituacao(
            situacao.tipo_situacao
        );

    const motivo =
        situacao.motivo ||
        "Nenhum motivo ou observação foi informado.";

    const administrador =
        situacao.administrador
            ? situacao.administrador.nome_completo
            : "Não informado";

    return `

        <section class="secao-detalhes-status">

            <h3>
                Situação especial
            </h3>

            <div class="situacao-especial-detalhes">

                <div class="cabecalho-situacao-especial-detalhes">

                    <div class="icone-situacao-especial-detalhes">

                        ${criarIconeSvg(
        informacao.icone
    )}

                    </div>

                    <div>

                        <span>
                            Situação aplicada
                        </span>

                        <strong>
                            ${escaparHtml(
        informacao.texto
    )}
                        </strong>

                    </div>

                </div>


                <div class="grade-situacao-especial-detalhes">

                    <div class="dado-situacao-especial-detalhes">

                        <span>
                            Administrador responsável
                        </span>

                        <strong>
                            ${escaparHtml(
        administrador
    )}
                        </strong>

                    </div>


                    <div class="dado-situacao-especial-detalhes">

                        <span>
                            Última atualização
                        </span>

                        <strong>
                            ${escaparHtml(
        formatarDataHora(
            situacao.data_atualizacao
        )
    )}
                        </strong>

                    </div>

                </div>


                <div class="motivo-situacao-especial-detalhes">

                    ${escaparHtml(
        motivo
    )}

                </div>

            </div>

        </section>
    `;

}


function criarHtmlAcoesSituacao(
    funcionario
) {

    if (funcionario.situacao_especial) {

        return `

            <section class="secao-acoes-situacao">

                <h3>
                    Administração da situação
                </h3>

                <p>
                    A alteração e a remoção serão guardadas
                    no histórico administrativo.
                </p>

                <div class="acoes-situacao-detalhes">

                    <button
                        type="button"
                        id="botao-editar-situacao-detalhes"
                        class="botao-situacao-detalhes editar"
                    >

                        ${criarIconeSvg(
            "pencil-square",
            "icone-sistema--botao"
        )}

                        Editar situação

                    </button>


                    <button
                        type="button"
                        id="botao-remover-situacao-detalhes"
                        class="botao-situacao-detalhes remover"
                    >

                        ${criarIconeSvg(
            "trash3-fill",
            "icone-sistema--botao"
        )}

                        Remover situação

                    </button>


                    <button
                        type="button"
                        id="botao-historico-situacao-detalhes"
                        class="botao-situacao-detalhes editar"
                    >

                        ${criarIconeSvg(
            "clock-history",
            "icone-sistema--botao"
        )}

                        Ver histórico

                    </button>

                </div>

            </section>
        `;

    }


    return `

        <section class="secao-acoes-situacao">

            <h3>
                Situação especial
            </h3>

            <p>
                Marque atestado, férias, folga, ausência
                ou encerramento do dia.
            </p>

            <div class="acoes-situacao-detalhes">

                <button
                    type="button"
                    id="botao-marcar-situacao-detalhes"
                    class="botao-situacao-detalhes principal"
                >

                    ${criarIconeSvg(
        "calendar2-plus-fill",
        "icone-sistema--botao"
    )}

                    Marcar situação especial

                </button>


                <button
                    type="button"
                    id="botao-historico-situacao-detalhes"
                    class="botao-situacao-detalhes editar"
                >

                    ${criarIconeSvg(
        "clock-history",
        "icone-sistema--botao"
    )}

                    Ver histórico

                </button>

            </div>

        </section>
    `;

}

function abrirDetalhesFuncionario(
    funcionario
) {

    funcionarioAberto =
        funcionario;

    const informacaoStatus =
        obterInformacaoStatus(
            funcionario.status_atual
        );

    tituloDetalhesStatus.textContent =
        funcionario.nome_completo;

    conteudoDetalhesStatus.innerHTML = `

        <section class="identidade-detalhes-status">

            <div class="avatar-detalhes-status">

                ${escaparHtml(
        obterIniciaisNome(
            funcionario.nome_completo
        )
    )}

            </div>

            <div>

                <h3>
                    ${escaparHtml(
        funcionario.nome_completo
    )}
                </h3>

                <p>
                    ${escaparHtml(
        formatarCpf(
            funcionario.cpf
        )
    )}

                    ·

                    ${escaparHtml(
        obterTextoTipoUsuario(
            funcionario.tipo_usuario
        )
    )}
                </p>

            </div>

        </section>


        <section
            class="
                faixa-status-detalhes
                ${informacaoStatus.classe}
            "
        >

            <div>

                <span class="faixa-status-detalhes__icone">

                    ${criarIconeSvg(
        informacaoStatus.icone
    )}

                </span>

                <div>

                    <span>
                        Estado atual
                    </span>

                    <strong>
                        ${escaparHtml(
        informacaoStatus.texto
    )}
                    </strong>

                </div>

            </div>


            <span
                class="
                    etiqueta-status-funcionario
                    ${informacaoStatus.classe}
                "
            >

                ${criarIconeSvg(
        informacaoStatus.icone,
        "icone-sistema--etiqueta"
    )}

                ${escaparHtml(
        informacaoStatus.texto
    )}

            </span>

        </section>


        ${funcionario.situacao_especial
            ? criarHtmlSituacaoEspecial(
                funcionario
            )
            : ""
        }


        ${funcionario.jornada.id_jornada
            ? criarHtmlComJornada(
                funcionario
            )
            : (
                funcionario.situacao_especial
                    ? ""
                    : criarHtmlSemJornada()
            )
        }


        ${criarHtmlAcoesSituacao(
            funcionario
        )}
    `;


    const botaoMarcar =
        document.getElementById(
            "botao-marcar-situacao-detalhes"
        );

    const botaoEditar =
        document.getElementById(
            "botao-editar-situacao-detalhes"
        );

    const botaoRemover =
        document.getElementById(
            "botao-remover-situacao-detalhes"
        );

    const botaoHistorico =
        document.getElementById(
            "botao-historico-situacao-detalhes"
        );


    if (botaoMarcar) {

        botaoMarcar.addEventListener(
            "click",
            () => abrirFormularioCriacaoSituacao(
                funcionario
            )
        );

    }


    if (botaoEditar) {

        botaoEditar.addEventListener(
            "click",
            () => abrirFormularioEdicaoSituacao(
                funcionario
            )
        );

    }


    if (botaoRemover) {

        botaoRemover.addEventListener(
            "click",
            () => abrirConfirmacaoRemocaoSituacao(
                funcionario
            )
        );

    }

    if (botaoHistorico) {

        botaoHistorico.addEventListener(
            "click",
            () => abrirHistoricoSituacao(
                funcionario
            )
        );

    }


    abrirPainelDetalhesStatus();

}

/* =========================================================
   FORMULÁRIO DE SITUAÇÃO ESPECIAL
   ========================================================= */

function abrirFormularioSituacao() {

    fundoFormularioSituacao.hidden =
        false;

    atualizarBloqueioRolagem();

    window.setTimeout(
        () => campoTipoSituacao.focus(),
        80
    );

}


function fecharFormularioSituacao() {

    if (salvandoSituacao) {

        return;

    }

    fundoFormularioSituacao.hidden =
        true;

    formularioSituacao.reset();

    funcionarioSituacaoSelecionado =
        null;

    atualizarBloqueioRolagem();

}


function abrirFormularioCriacaoSituacao(
    funcionario
) {

    modoFormularioSituacao =
        "CRIAR";

    funcionarioSituacaoSelecionado =
        funcionario;

    formularioSituacao.reset();

    tituloFormularioSituacao.textContent =
        "Marcar situação especial";

    descricaoFormularioSituacao.textContent =
        "A situação será aplicada ao dia exibido no painel.";

    textoBotaoSalvarSituacao.textContent =
        "Registrar situação";

    grupoMotivoAlteracaoSituacao.hidden =
        true;

    avatarFormularioSituacao.textContent =
        obterIniciaisNome(
            funcionario.nome_completo
        );

    nomeFormularioSituacao.textContent =
        funcionario.nome_completo;

    dataFormularioSituacao.textContent =
        formatarDataCompleta(
            dataReferenciaStatusAtual
        );

    abrirFormularioSituacao();

}


function abrirFormularioEdicaoSituacao(
    funcionario
) {

    modoFormularioSituacao =
        "EDITAR";

    funcionarioSituacaoSelecionado =
        funcionario;

    const situacao =
        funcionario.situacao_especial;

    formularioSituacao.reset();

    tituloFormularioSituacao.textContent =
        "Editar situação especial";

    descricaoFormularioSituacao.textContent =
        "A alteração será preservada no histórico.";

    textoBotaoSalvarSituacao.textContent =
        "Salvar alteração";

    grupoMotivoAlteracaoSituacao.hidden =
        false;

    avatarFormularioSituacao.textContent =
        obterIniciaisNome(
            funcionario.nome_completo
        );

    nomeFormularioSituacao.textContent =
        funcionario.nome_completo;

    dataFormularioSituacao.textContent =
        formatarDataCompleta(
            dataReferenciaStatusAtual
        );

    campoTipoSituacao.value =
        situacao.tipo_situacao;

    campoMotivoSituacao.value =
        situacao.motivo || "";

    abrirFormularioSituacao();

}


async function salvarSituacaoEspecial(
    evento
) {

    evento.preventDefault();


    if (
        salvandoSituacao ||
        !funcionarioSituacaoSelecionado
    ) {

        return;

    }


    const tipoSituacao =
        campoTipoSituacao.value;


    if (!tipoSituacao) {

        mostrarMensagemFlutuante(
            "Selecione uma situação especial.",
            "erro"
        );

        campoTipoSituacao.focus();

        return;

    }


    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível salvar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }


    salvandoSituacao =
        true;

    botaoSalvarSituacao.disabled =
        true;


    const idUsuario =
        funcionarioSituacaoSelecionado.id_usuario;


    try {

        let resposta;


        if (
            modoFormularioSituacao ===
            "CRIAR"
        ) {

            resposta =
                await requisicaoApi(
                    "/administracao/situacoes-especiais",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            {
                                id_usuario:
                                    idUsuario,

                                data_situacao:
                                    dataReferenciaStatusAtual,

                                tipo_situacao:
                                    tipoSituacao,

                                motivo:
                                    campoMotivoSituacao
                                        .value
                                        .trim() || null
                            }
                        )
                    }
                );

        } else {

            const idSituacao =
                funcionarioSituacaoSelecionado
                    .situacao_especial
                    .id_situacao;


            resposta =
                await requisicaoApi(
                    `/administracao/situacoes-especiais/${idSituacao}`,
                    {
                        method: "PUT",

                        body: JSON.stringify(
                            {
                                tipo_situacao:
                                    tipoSituacao,

                                motivo:
                                    campoMotivoSituacao
                                        .value
                                        .trim() || null,

                                motivo_alteracao:
                                    campoMotivoAlteracaoSituacao
                                        .value
                                        .trim() || null
                            }
                        )
                    }
                );

        }


        fundoFormularioSituacao.hidden =
            true;

        funcionarioSituacaoSelecionado =
            null;

        atualizarBloqueioRolagem();


        /*
         * Atualiza os dados silenciosamente.
         * O carregamento não aparece atrás do modal.
         */
        await consultarStatusHoje(
            false,
            false
        );


        const funcionarioAtualizado =
            funcionariosCarregados.find(
                funcionario =>
                    funcionario.id_usuario ===
                    idUsuario
            );


        if (funcionarioAtualizado) {

            abrirDetalhesFuncionario(
                funcionarioAtualizado
            );

        }


        mostrarMensagemFlutuante(
            resposta.mensagem ||
            "Situação especial salva com sucesso!"
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar situação especial:",
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
            "Não foi possível salvar a situação especial.",
            "erro"
        );

    } finally {

        salvandoSituacao =
            false;

        botaoSalvarSituacao.disabled =
            false;

    }

}


/* =========================================================
   REMOÇÃO DA SITUAÇÃO
   ========================================================= */

function abrirConfirmacaoRemocaoSituacao(
    funcionario
) {

    funcionarioSituacaoSelecionado =
        funcionario;

    const situacao =
        funcionario.situacao_especial;

    const informacao =
        obterInformacaoTipoSituacao(
            situacao.tipo_situacao
        );

    nomeRemocaoSituacao.textContent =
        funcionario.nome_completo;

    tipoRemocaoSituacao.textContent =
        informacao.texto;

    campoMotivoRemocaoSituacao.value =
        "";

    fundoRemocaoSituacao.hidden =
        false;

    atualizarBloqueioRolagem();

}


function fecharConfirmacaoRemocaoSituacao() {

    if (removendoSituacao) {

        return;

    }

    fundoRemocaoSituacao.hidden =
        true;

    campoMotivoRemocaoSituacao.value =
        "";

    funcionarioSituacaoSelecionado =
        null;

    atualizarBloqueioRolagem();

}


async function confirmarRemocaoSituacao() {

    if (
        removendoSituacao ||
        !funcionarioSituacaoSelecionado
    ) {

        return;

    }


    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível remover porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }


    const idUsuario =
        funcionarioSituacaoSelecionado.id_usuario;


    const idSituacao =
        funcionarioSituacaoSelecionado
            .situacao_especial
            .id_situacao;


    removendoSituacao =
        true;

    botaoConfirmarRemocaoSituacao.disabled =
        true;


    try {

        const resposta =
            await requisicaoApi(
                `/administracao/situacoes-especiais/${idSituacao}`,
                {
                    method: "DELETE",

                    body: JSON.stringify(
                        {
                            motivo_remocao:
                                campoMotivoRemocaoSituacao
                                    .value
                                    .trim() || null
                        }
                    )
                }
            );


        fundoRemocaoSituacao.hidden =
            true;

        funcionarioSituacaoSelecionado =
            null;

        atualizarBloqueioRolagem();


        /*
         * Atualiza sem exibir o carregamento.
         */
        await consultarStatusHoje(
            false,
            false
        );


        const funcionarioAtualizado =
            funcionariosCarregados.find(
                funcionario =>
                    funcionario.id_usuario ===
                    idUsuario
            );


        if (funcionarioAtualizado) {

            abrirDetalhesFuncionario(
                funcionarioAtualizado
            );

        }


        mostrarMensagemFlutuante(
            resposta.mensagem ||
            "Situação especial removida com sucesso!"
        );

    } catch (erro) {

        console.error(
            "Erro ao remover situação especial:",
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
            "Não foi possível remover a situação especial.",
            "erro"
        );

    } finally {

        removendoSituacao =
            false;

        botaoConfirmarRemocaoSituacao.disabled =
            false;

    }

}

/* =========================================================
   HISTÓRICO DE SITUAÇÕES ESPECIAIS
   ========================================================= */

function obterInformacaoAcaoHistorico(
    acao
) {

    const informacoes = {

        CRIADA: {
            texto: "Criada",
            icone: "plus-lg",
            classe: "criada"
        },

        ALTERADA: {
            texto: "Alterada",
            icone: "pencil-square",
            classe: "alterada"
        },

        REMOVIDA: {
            texto: "Removida",
            icone: "trash3-fill",
            classe: "removida"
        }

    };


    return (
        informacoes[acao] ||
        {
            texto: acao || "Alteração",
            icone: "clock-history",
            classe: "alterada"
        }
    );

}


function obterTituloRegistroHistorico(
    registro
) {

    const tipoAnterior =
        obterInformacaoTipoSituacao(
            registro.tipo_anterior
        ).texto;


    const tipoNovo =
        obterInformacaoTipoSituacao(
            registro.tipo_novo
        ).texto;


    if (
        registro.acao_realizada ===
        "CRIADA"
    ) {

        return `Situação criada: ${tipoNovo}`;

    }


    if (
        registro.acao_realizada ===
        "ALTERADA"
    ) {

        return `${tipoAnterior} → ${tipoNovo}`;

    }


    if (
        registro.acao_realizada ===
        "REMOVIDA"
    ) {

        return `Situação removida: ${tipoAnterior}`;

    }


    return "Alteração de situação especial";

}


function criarHtmlMotivosHistorico(
    registro
) {

    const partes = [];


    if (
        registro.acao_realizada ===
        "CRIADA"
    ) {

        partes.push(`

            <div class="observacao-historico-situacao">

                <strong>
                    Motivo informado:
                </strong>

                ${escaparHtml(
            registro.motivo_novo ||
            "Nenhum motivo foi informado."
        )}

            </div>
        `);

    }


    if (
        registro.acao_realizada ===
        "ALTERADA"
    ) {

        partes.push(`

            <div class="grade-dados-historico">

                <div class="dado-historico-situacao">

                    <span>
                        Motivo anterior
                    </span>

                    <strong>
                        ${escaparHtml(
            registro.motivo_anterior ||
            "Não informado"
        )}
                    </strong>

                </div>


                <div class="dado-historico-situacao">

                    <span>
                        Motivo novo
                    </span>

                    <strong>
                        ${escaparHtml(
            registro.motivo_novo ||
            "Não informado"
        )}
                    </strong>

                </div>

            </div>
        `);


        if (registro.motivo_alteracao) {

            partes.push(`

                <div class="observacao-historico-situacao">

                    <strong>
                        Observação da alteração:
                    </strong>

                    ${escaparHtml(
                registro.motivo_alteracao
            )}

                </div>
            `);

        }

    }


    if (
        registro.acao_realizada ===
        "REMOVIDA"
    ) {

        partes.push(`

            <div class="observacao-historico-situacao">

                <strong>
                    Motivo da remoção:
                </strong>

                ${escaparHtml(
            registro.motivo_alteracao ||
            "Nenhum motivo foi informado."
        )}

            </div>
        `);

    }


    return partes.join("");

}


function criarItemHistoricoSituacao(
    registro
) {

    const informacaoAcao =
        obterInformacaoAcaoHistorico(
            registro.acao_realizada
        );


    const administrador =
        registro.administrador
            ? registro.administrador.nome_completo
            : "Não informado";


    return `

        <article
            class="
                item-historico-situacao
                ${informacaoAcao.classe}
            "
        >

            <div class="marcador-historico-situacao">

                ${criarIconeSvg(
        informacaoAcao.icone
    )}

            </div>


            <header class="cabecalho-item-historico">

                <div>

                    <span
                        class="
                            etiqueta-acao-historico
                            ${informacaoAcao.classe}
                        "
                    >

                        ${criarIconeSvg(
        informacaoAcao.icone
    )}

                        ${escaparHtml(
        informacaoAcao.texto
    )}

                    </span>


                    <strong class="titulo-item-historico">

                        ${escaparHtml(
        obterTituloRegistroHistorico(
            registro
        )
    )}

                    </strong>

                </div>


                <span class="data-item-historico">

                    ${escaparHtml(
        formatarDataHora(
            registro.data_alteracao
        )
    )}

                </span>

            </header>


            <div class="grade-dados-historico">

                <div class="dado-historico-situacao">

                    <span>
                        Data da situação
                    </span>

                    <strong>
                        ${escaparHtml(
        formatarDataCompleta(
            registro.data_situacao
        )
    )}
                    </strong>

                </div>


                <div class="dado-historico-situacao">

                    <span>
                        Administrador responsável
                    </span>

                    <strong>
                        ${escaparHtml(
        administrador
    )}
                    </strong>

                </div>

            </div>


            ${criarHtmlMotivosHistorico(
        registro
    )}

        </article>
    `;

}


function preencherHistoricoSituacao(
    registros
) {

    listaHistoricoSituacao.innerHTML =
        "";


    if (
        !registros ||
        registros.length === 0
    ) {

        listaHistoricoSituacao.hidden =
            true;

        vazioHistoricoSituacao.hidden =
            false;

        return;

    }


    vazioHistoricoSituacao.hidden =
        true;


    listaHistoricoSituacao.innerHTML =
        registros
            .map(
                criarItemHistoricoSituacao
            )
            .join("");


    listaHistoricoSituacao.hidden =
        false;

}


async function abrirHistoricoSituacao(
    funcionario
) {

    if (
        carregandoHistoricoSituacao
    ) {

        return;

    }


    funcionarioHistoricoSelecionado =
        funcionario;


    avatarHistoricoSituacao.textContent =
        obterIniciaisNome(
            funcionario.nome_completo
        );


    nomeHistoricoSituacao.textContent =
        funcionario.nome_completo;


    carregamentoHistoricoSituacao.hidden =
        false;

    carregamentoHistoricoSituacao.style.display =
        "grid";

    vazioHistoricoSituacao.hidden =
        true;

    listaHistoricoSituacao.hidden =
        true;

    listaHistoricoSituacao.innerHTML =
        "";


    fundoHistoricoSituacao.hidden =
        false;

    atualizarBloqueioRolagem();


    if (!navigator.onLine) {

        carregamentoHistoricoSituacao.hidden =
            true;

        carregamentoHistoricoSituacao.style.display =
            "none";


        mostrarMensagemFlutuante(
            "Não foi possível consultar o histórico porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }


    carregandoHistoricoSituacao =
        true;


    try {

        const resposta =
            await requisicaoApi(
                `/administracao/situacoes-especiais/historico/${funcionario.id_usuario}`,
                {
                    method: "GET"
                }
            );


        preencherHistoricoSituacao(
            resposta.historico || []
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar histórico de situações:",
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


        vazioHistoricoSituacao.hidden =
            false;


        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível consultar o histórico.",
            "erro"
        );

    } finally {

        carregandoHistoricoSituacao =
            false;


        carregamentoHistoricoSituacao.hidden =
            true;

        carregamentoHistoricoSituacao.style.display =
            "none";

    }

}


function fecharHistoricoSituacao() {

    if (
        carregandoHistoricoSituacao
    ) {

        return;

    }


    fundoHistoricoSituacao.hidden =
        true;


    listaHistoricoSituacao.innerHTML =
        "";

    listaHistoricoSituacao.hidden =
        true;

    vazioHistoricoSituacao.hidden =
        true;


    funcionarioHistoricoSelecionado =
        null;


    atualizarBloqueioRolagem();

}

/* =========================================================
   ÍCONES SVG OFFLINE
   ========================================================= */

const CAMINHO_SPRITE_ICONES =
    "../icones/bootstrap-icons.svg";


function criarIconeSvg(
    nomeIcone,
    classeExtra = ""
) {

    /*
     * Remove qualquer caractere que não possa fazer parte
     * do nome de um Bootstrap Icon.
     */
    const nomeSeguro = String(
        nomeIcone || "question-circle"
    ).replace(
        /[^a-z0-9-]/gi,
        ""
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
                href="${CAMINHO_SPRITE_ICONES}#${nomeSeguro}"
            ></use>

        </svg>
    `;

}


/* =========================================================
   CARREGAMENTO DA PÁGINA
   ========================================================= */

async function carregarPaginaStatus() {

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

        await consultarStatusHoje();

    } catch (erro) {

        console.error(
            "Erro ao carregar a página de status:",
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
   ATUALIZAÇÃO AUTOMÁTICA
   ========================================================= */

function iniciarAtualizacaoAutomatica() {

    window.clearInterval(
        temporizadorAtualizacaoAutomatica
    );


    temporizadorAtualizacaoAutomatica =
        window.setInterval(
            async () => {

                if (
                    navigator.onLine &&
                    document.visibilityState ===
                    "visible" &&
                    !carregandoStatus
                ) {

                    /*
                     * Atualização automática silenciosa.
                     */
                    await consultarStatusHoje(
                        false,
                        false
                    );

                }

            },
            60000
        );

}

/* =========================================================
   EVENTOS
   ========================================================= */

botoesFiltroStatus.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                botoesFiltroStatus.forEach(
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

                filtroStatusAtual =
                    botao.dataset.filtroStatus;

                aplicarFiltros();

            }
        );

    }
);


campoPesquisaStatus.addEventListener(
    "input",
    () => {

        botaoLimparPesquisaStatus.hidden =
            !campoPesquisaStatus.value;

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


botaoLimparPesquisaStatus.addEventListener(
    "click",
    () => {

        campoPesquisaStatus.value = "";

        botaoLimparPesquisaStatus.hidden =
            true;

        campoPesquisaStatus.focus();

        aplicarFiltros();

    }
);


botaoAtualizarStatus.addEventListener(
    "click",
    async () => {

        await consultarStatusHoje(
            true
        );

    }
);


botaoFecharDetalhesStatus.addEventListener(
    "click",
    fecharPainelDetalhesStatus
);


fundoDetalhesStatus.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoDetalhesStatus
        ) {

            fecharPainelDetalhesStatus();

        }

    }
);


document.addEventListener(
    "keydown",
    evento => {

        if (evento.key !== "Escape") {

            return;

        }

        if (!fundoHistoricoSituacao.hidden) {

            fecharHistoricoSituacao();

            return;

        }

        if (!fundoRemocaoSituacao.hidden) {

            fecharConfirmacaoRemocaoSituacao();

            return;

        }

        if (!fundoFormularioSituacao.hidden) {

            fecharFormularioSituacao();

            return;

        }

        if (!fundoDetalhesStatus.hidden) {

            fecharPainelDetalhesStatus();

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


        await consultarStatusHoje(
            false,
            false
        );

    }
);


window.addEventListener(
    "offline",
    atualizarEstadoConexao
);


document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState ===
            "visible" &&
            navigator.onLine &&
            !carregandoStatus
        ) {

            await consultarStatusHoje(
                false,
                false
            );

        }

    }
);

formularioSituacao.addEventListener(
    "submit",
    salvarSituacaoEspecial
);


botaoFecharFormularioSituacao.addEventListener(
    "click",
    fecharFormularioSituacao
);


botaoCancelarFormularioSituacao.addEventListener(
    "click",
    fecharFormularioSituacao
);


fundoFormularioSituacao.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoFormularioSituacao
        ) {

            fecharFormularioSituacao();

        }

    }
);


botaoFecharRemocaoSituacao.addEventListener(
    "click",
    fecharConfirmacaoRemocaoSituacao
);


botaoCancelarRemocaoSituacao.addEventListener(
    "click",
    fecharConfirmacaoRemocaoSituacao
);


botaoConfirmarRemocaoSituacao.addEventListener(
    "click",
    confirmarRemocaoSituacao
);


fundoRemocaoSituacao.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoRemocaoSituacao
        ) {

            fecharConfirmacaoRemocaoSituacao();

        }

    }
);

botaoFecharHistoricoSituacao.addEventListener(
    "click",
    fecharHistoricoSituacao
);


fundoHistoricoSituacao.addEventListener(
    "click",
    evento => {

        if (
            evento.target ===
            fundoHistoricoSituacao
        ) {

            fecharHistoricoSituacao();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarEstadoConexao();

iniciarAtualizacaoAutomatica();

carregarPaginaStatus();
