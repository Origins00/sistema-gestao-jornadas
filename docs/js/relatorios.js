/*
 * Relatório administrativo de jornadas do Gestor de Jornadas.
 */


const CAMINHO_ICONES_RELATORIOS =
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

const formularioRelatorio =
    document.getElementById(
        "formulario-relatorio"
    );

const campoDataInicio =
    document.getElementById(
        "data-inicio"
    );

const campoDataFim =
    document.getElementById(
        "data-fim"
    );

const campoFuncionario =
    document.getElementById(
        "filtro-funcionario"
    );

const botaoGerarRelatorio =
    document.getElementById(
        "botao-gerar-relatorio"
    );

const botaoExportarExcel =
    document.getElementById(
        "botao-exportar-excel"
    );

const controleExportacaoExcel =
    document.getElementById(
        "controle-exportacao-excel"
    );

const menuExportacaoExcel =
    document.getElementById(
        "menu-exportacao-excel"
    );

const opcoesExportacaoExcel =
    Array.from(
        document.querySelectorAll(
            "[data-estilo-excel]"
        )
    );

const resumoFuncionarios =
    document.getElementById(
        "resumo-funcionarios"
    );

const resumoJornadas =
    document.getElementById(
        "resumo-jornadas"
    );

const resumoTrabalhado =
    document.getElementById(
        "resumo-trabalhado"
    );

const resumoExtras =
    document.getElementById(
        "resumo-extras"
    );

const resumoSaldo =
    document.getElementById(
        "resumo-saldo"
    );

const descricaoRelatorio =
    document.getElementById(
        "descricao-relatorio"
    );

const estadoRelatorio =
    document.getElementById(
        "estado-relatorio"
    );

const listaJornadasRelatorio =
    document.getElementById(
        "lista-jornadas-relatorio"
    );

const mensagemFlutuante =
    document.getElementById(
        "mensagem-flutuante"
    );

const botaoSair =
    document.getElementById(
        "botao-sair"
    );


let jornadasCarregadas = [];

let periodoCarregado = null;

let filtroFuncionarioCarregado = null;

let carregandoRelatorio = false;

let temporizadorMensagem = null;


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


function formatarDataInput(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarDataBrasileira(dataIso) {

    if (!dataIso) {

        return "";

    }

    const partes =
        dataIso.split("-");

    if (partes.length !== 3) {

        return dataIso;

    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


function formatarCpf(cpf) {

    const numeros =
        String(cpf || "")
            .replace(/\D/g, "");

    if (numeros.length !== 11) {

        return cpf || "";

    }

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );

}


function obterTextoSituacao(situacao) {

    const textos = {
        EM_ANDAMENTO: "Em andamento",
        CONCLUIDA: "Concluída",
        INCOMPLETA: "Incompleta",
        DIA_ENCERRADO: "Dia encerrado",
        ATESTADO: "Atestado",
        FOLGA: "Folga",
        FERIAS: "Férias",
        AUSENCIA: "Ausência"
    };

    return textos[situacao] ||
        situacao ||
        "Não informada";

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

    botaoGerarRelatorio.disabled =
        !conectado ||
        carregandoRelatorio;

    botaoExportarExcel.disabled =
        !conectado ||
        jornadasCarregadas.length === 0 ||
        carregandoRelatorio;

    if (botaoExportarExcel.disabled) {

        fecharMenuExportacaoExcel();

    }

}


function definirCarregamento(ativo) {

    carregandoRelatorio =
        ativo;

    campoDataInicio.disabled =
        ativo;

    campoDataFim.disabled =
        ativo;

    campoFuncionario.disabled =
        ativo;

    atualizarEstadoConexao();

}


function definirDatasIniciais() {

    const hoje =
        new Date();

    const primeiroDia =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );

    const ultimoDia =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            0
        );

    campoDataInicio.value =
        formatarDataInput(
            primeiroDia
        );

    campoDataFim.value =
        formatarDataInput(
            ultimoDia
        );

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


function preencherFuncionarios(
    funcionarios
) {

    const valorAtual =
        campoFuncionario.value;

    campoFuncionario.replaceChildren();

    const opcaoTodos =
        document.createElement(
            "option"
        );

    opcaoTodos.value = "";

    opcaoTodos.textContent =
        "Todos os funcionários";

    campoFuncionario.appendChild(
        opcaoTodos
    );

    funcionarios.forEach(
        funcionario => {

            const opcao =
                document.createElement(
                    "option"
                );

            opcao.value =
                String(
                    funcionario.id_usuario
                );

            opcao.textContent =
                funcionario.nome_completo +
                (
                    funcionario.situacao_usuario ===
                    "INATIVO"
                        ? " (inativo)"
                        : ""
                );

            campoFuncionario.appendChild(
                opcao
            );

        }
    );

    if (
        Array.from(
            campoFuncionario.options
        ).some(
            opcao =>
                opcao.value === valorAtual
        )
    ) {

        campoFuncionario.value =
            valorAtual;

    }

}


function preencherResumo(resumo) {

    resumoFuncionarios.textContent =
        resumo.quantidade_funcionarios || 0;

    resumoJornadas.textContent =
        resumo.quantidade_jornadas || 0;

    resumoTrabalhado.textContent =
        resumo.tempo_trabalhado_formatado ||
        "00h00";

    resumoExtras.textContent =
        resumo.horas_extras_formatadas ||
        "00h00";

    resumoSaldo.textContent =
        resumo.saldo_formatado ||
        "00h00";

    resumoSaldo.classList.toggle(
        "valor-saldo-negativo",
        (resumo.minutos_saldo || 0) < 0
    );

    resumoSaldo.classList.toggle(
        "valor-saldo-positivo",
        (resumo.minutos_saldo || 0) > 0
    );

}


function obterClasseSaldo(minutos) {

    const valor = Number(
        minutos || 0
    );

    if (valor > 0) {

        return "positivo";

    }

    if (valor < 0) {

        return "negativo";

    }

    return "neutro";

}


function obterTextoTipoTrabalho(jornada) {

    const nomes = {
        OPERACIONAL: "Operacional",
        ADMINISTRATIVO: "Administrativo"
    };

    const inicial = nomes[
        jornada.tipo_trabalho_inicio
    ];

    const depoisAlmoco = nomes[
        jornada.tipo_trabalho_apos_almoco
    ];

    if (
        depoisAlmoco &&
        inicial &&
        depoisAlmoco !== inicial
    ) {

        return (
            "Misto — " +
            inicial +
            " pela manhã e " +
            depoisAlmoco.toLowerCase() +
            " após o almoço"
        );

    }

    return inicial ||
        depoisAlmoco ||
        "Não informado";

}


function criarHtmlHorarioRelatorio(
    rotulo,
    horario,
    icone
) {

    return `
        <div class="horario-detalhe-relatorio">
            <span class="horario-detalhe-relatorio__icone">
                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use href="${CAMINHO_ICONES_RELATORIOS}#${icone}"></use>
                </svg>
            </span>

            <span class="horario-detalhe-relatorio__texto">
                <span>${escaparHtml(rotulo)}</span>
                <strong>${escaparHtml(horario || "Não registrado")}</strong>
            </span>
        </div>
    `;

}


function obterExplicacaoCalculoRelatorio(
    jornada
) {

    const totais = jornada.totais || {};
    const saldo = Number(
        totais.minutos_saldo || 0
    );
    const esperado = Number(
        totais.minutos_esperados || 0
    );

    if (
        jornada.situacao_jornada === "EM_ANDAMENTO" ||
        jornada.situacao_jornada === "INCOMPLETA"
    ) {

        return "Esta jornada ainda não possui todos os horários. Os valores podem mudar quando ela for concluída.";

    }

    if (
        esperado === 0 &&
        Number(totais.minutos_trabalhados || 0) > 0
    ) {

        return "Como este dia não tinha carga horária obrigatória, todo o período trabalhado foi contabilizado como hora extra e saldo positivo.";

    }

    if (saldo > 0) {

        return `Depois de comparar os horários com a jornada prevista, sobraram ${totais.saldo_formatado}. Esse valor foi contabilizado como hora extra.`;

    }

    if (saldo < 0) {

        return `Depois de comparar os horários com a jornada prevista, faltaram ${String(totais.saldo_formatado).replace("-", "")}. A tolerância exibida já está considerada nesse saldo.`;

    }

    return "Os horários registrados ficaram de acordo com a jornada prevista. Não houve saldo positivo nem negativo neste dia.";

}


function criarHtmlDetalheRelatorio(jornada) {

    const horarios = jornada.horarios || {};
    const totais = jornada.totais || {};
    const classeSaldo = obterClasseSaldo(
        totais.minutos_saldo
    );

    return `
        <div class="cabecalho-detalhe-relatorio">
            <div>
                <span>Tipo de trabalho</span>
                <strong>${escaparHtml(obterTextoTipoTrabalho(jornada))}</strong>
            </div>

            <span class="situacao-detalhe-relatorio">
                ${escaparHtml(obterTextoSituacao(jornada.situacao_jornada))}
            </span>
        </div>

        <div class="atividade-detalhe-relatorio">
            <span>Atividade do dia</span>
            <strong>${escaparHtml(jornada.atividade_do_dia || "Não informada")}</strong>
        </div>

        <div class="linha-tempo-detalhe-relatorio">
            ${criarHtmlHorarioRelatorio(
                "Entrada",
                horarios.entrada,
                "box-arrow-in-right"
            )}
            ${criarHtmlHorarioRelatorio(
                "Início do almoço",
                horarios.inicio_almoco,
                "fork-knife"
            )}
            ${criarHtmlHorarioRelatorio(
                "Retorno",
                horarios.fim_almoco,
                "arrow-return-left"
            )}
            ${criarHtmlHorarioRelatorio(
                "Saída",
                horarios.saida,
                "box-arrow-right"
            )}
        </div>

        <div class="titulo-calculo-relatorio">
            <svg
                class="icone-sistema"
                aria-hidden="true"
                focusable="false"
            >
                <use href="${CAMINHO_ICONES_RELATORIOS}#calculator-fill"></use>
            </svg>
            <strong>Detalhamento das horas</strong>
        </div>

        <div class="grade-calculo-relatorio">
            <div class="dado-calculo-relatorio">
                <span>Tempo trabalhado</span>
                <strong>${escaparHtml(totais.trabalhado_formatado || "00h00")}</strong>
            </div>

            <div class="dado-calculo-relatorio">
                <span>Jornada esperada</span>
                <strong>${escaparHtml(totais.esperado_formatado || "00h00")}</strong>
            </div>

            <div class="dado-calculo-relatorio ${Number(totais.minutos_extras) > 0
                ? "positivo"
                : "neutro"
            }">
                <span>Horas extras</span>
                <strong>${escaparHtml(totais.extras_formatadas || "00h00")}</strong>
            </div>

            <div class="dado-calculo-relatorio ${classeSaldo}">
                <span>Saldo do dia</span>
                <strong>${escaparHtml(totais.saldo_formatado || "00h00")}</strong>
            </div>

            <div class="dado-calculo-relatorio">
                <span>Tolerância aplicada</span>
                <strong>${escaparHtml(totais.tolerancia_formatada || "00h00")}</strong>
            </div>

            <div class="dado-calculo-relatorio">
                <span>Horas abonadas</span>
                <strong>${escaparHtml(totais.abonado_formatado || "00h00")}</strong>
            </div>
        </div>

        <div class="explicacao-calculo-relatorio">
            <strong>Como foi calculado</strong>
            <p>${escaparHtml(obterExplicacaoCalculoRelatorio(jornada))}</p>
        </div>
    `;

}


function criarHtmlItemJornadaRelatorio(
    jornada,
    adicional
) {

    const totais = jornada.totais || {};
    const idDetalhe =
        `detalhe-relatorio-${jornada.id_jornada}`;
    const classeSaldo = obterClasseSaldo(
        totais.minutos_saldo
    );

    return `
        <article
            class="item-jornada-relatorio ${adicional
                ? "item-jornada-relatorio--adicional"
                : ""
            }"
            ${adicional ? "hidden" : ""}
        >
            <button
                type="button"
                class="resumo-jornada-relatorio"
                data-acao="alternar-detalhe-relatorio"
                aria-expanded="false"
                aria-controls="${escaparHtml(idDetalhe)}"
            >
                <span class="resumo-jornada-relatorio__principal">
                    <span class="data-jornada-relatorio">
                        ${escaparHtml(formatarDataBrasileira(jornada.data_jornada))}
                    </span>
                    <strong>${escaparHtml(jornada.funcionario.nome_completo)}</strong>
                    <small>${escaparHtml(
                        jornada.atividade_do_dia ||
                        obterTextoSituacao(jornada.situacao_jornada)
                    )}</small>
                </span>

                <span class="dado-resumo-jornada dado-resumo-jornada--trabalhado">
                    <span>Trabalhado</span>
                    <strong>${escaparHtml(totais.trabalhado_formatado || "00h00")}</strong>
                </span>

                <span class="dado-resumo-jornada dado-resumo-jornada--extras">
                    <span>Extras</span>
                    <strong>${escaparHtml(totais.extras_formatadas || "00h00")}</strong>
                </span>

                <span class="dado-resumo-jornada dado-resumo-jornada--saldo ${classeSaldo}">
                    <span>Saldo</span>
                    <strong>${escaparHtml(totais.saldo_formatado || "00h00")}</strong>
                </span>

                <span class="acao-jornada-relatorio" aria-hidden="true">
                    <svg class="icone-sistema" focusable="false">
                        <use href="${CAMINHO_ICONES_RELATORIOS}#chevron-down"></use>
                    </svg>
                </span>
            </button>

            <div
                id="${escaparHtml(idDetalhe)}"
                class="detalhe-jornada-relatorio"
                hidden
            >
                ${criarHtmlDetalheRelatorio(jornada)}
            </div>
        </article>
    `;

}


function preencherListaJornadas(jornadas) {

    listaJornadasRelatorio
        .replaceChildren();

    if (!jornadas.length) {

        listaJornadasRelatorio.hidden =
            true;

        estadoRelatorio.hidden =
            false;

        estadoRelatorio.className =
            "estado-relatorio";

        estadoRelatorio.innerHTML = `
            <svg
                class="icone-sistema estado-relatorio__icone"
                aria-hidden="true"
                focusable="false"
            >
                <use href="${
                    CAMINHO_ICONES_RELATORIOS
                }#file-earmark-spreadsheet"></use>
            </svg>

            <div>
                <strong>Nenhuma jornada encontrada</strong>
                <p>
                    Altere o período ou escolha outro funcionário.
                </p>
            </div>
        `;

        return;

    }

    const limiteInicial = 5;
    const quantidadeAdicional = Math.max(
        jornadas.length - limiteInicial,
        0
    );

    const itens = jornadas.map(
        (jornada, indice) =>
            criarHtmlItemJornadaRelatorio(
                jornada,
                indice >= limiteInicial
            )
    ).join("");

    const botaoVerMais = quantidadeAdicional > 0
        ? `
            <button
                type="button"
                class="botao-ver-mais-relatorio"
                data-acao="ver-mais-relatorio"
                data-quantidade="${quantidadeAdicional}"
                aria-expanded="false"
            >
                <span class="texto-ver-mais-relatorio">
                    Ver mais ${quantidadeAdicional}
                    ${quantidadeAdicional === 1
                        ? "jornada"
                        : "jornadas"
                    }
                </span>
                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use href="${CAMINHO_ICONES_RELATORIOS}#chevron-down"></use>
                </svg>
            </button>
        `
        : "";

    listaJornadasRelatorio.innerHTML =
        itens + botaoVerMais;

    estadoRelatorio.hidden =
        true;

    listaJornadasRelatorio.hidden =
        false;

}


function fecharDetalhesRelatorio(
    botaoMantido = null
) {

    const botoes =
        listaJornadasRelatorio.querySelectorAll(
            '[data-acao="alternar-detalhe-relatorio"]'
        );

    botoes.forEach(
        botao => {

            if (botao === botaoMantido) {

                return;

            }

            botao.setAttribute(
                "aria-expanded",
                "false"
            );

            const detalhe =
                document.getElementById(
                    botao.getAttribute(
                        "aria-controls"
                    )
                );

            if (detalhe) {

                detalhe.hidden = true;

            }

        }
    );

}


function tratarCliqueListaRelatorio(evento) {

    const botao = evento.target.closest(
        "button[data-acao]"
    );

    if (
        !botao ||
        !listaJornadasRelatorio.contains(botao)
    ) {

        return;

    }

    const acao = botao.dataset.acao;

    if (acao === "alternar-detalhe-relatorio") {

        const estavaAberto =
            botao.getAttribute(
                "aria-expanded"
            ) === "true";

        fecharDetalhesRelatorio();

        if (estavaAberto) {

            return;

        }

        const detalhe = document.getElementById(
            botao.getAttribute(
                "aria-controls"
            )
        );

        botao.setAttribute(
            "aria-expanded",
            "true"
        );

        if (detalhe) {

            detalhe.hidden = false;

        }

        return;

    }

    if (acao !== "ver-mais-relatorio") {

        return;

    }

    const expandido =
        botao.getAttribute(
            "aria-expanded"
        ) === "true";

    const itensAdicionais =
        listaJornadasRelatorio.querySelectorAll(
            ".item-jornada-relatorio--adicional"
        );

    itensAdicionais.forEach(
        item => {

            item.hidden = expandido;

            if (expandido) {

                const botaoDetalhe = item.querySelector(
                    '[data-acao="alternar-detalhe-relatorio"]'
                );

                botaoDetalhe?.setAttribute(
                    "aria-expanded",
                    "false"
                );

                const detalhe = item.querySelector(
                    ".detalhe-jornada-relatorio"
                );

                if (detalhe) {

                    detalhe.hidden = true;

                }

            }

        }
    );

    botao.setAttribute(
        "aria-expanded",
        String(!expandido)
    );

    const texto = botao.querySelector(
        ".texto-ver-mais-relatorio"
    );

    const quantidade = Number(
        botao.dataset.quantidade || 0
    );

    if (texto) {

        texto.textContent = expandido
            ? `Ver mais ${quantidade} ${quantidade === 1
                ? "jornada"
                : "jornadas"
            }`
            : "Mostrar menos";

    }

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


function validarPeriodo() {

    if (
        !campoDataInicio.value ||
        !campoDataFim.value
    ) {

        mostrarMensagem(
            "Informe as duas datas do relatório.",
            "erro"
        );

        return false;

    }

    if (
        campoDataInicio.value >
        campoDataFim.value
    ) {

        mostrarMensagem(
            "A data inicial não pode ser posterior à data final.",
            "erro"
        );

        return false;

    }

    const inicio =
        new Date(
            campoDataInicio.value +
            "T00:00:00"
        );

    const fim =
        new Date(
            campoDataFim.value +
            "T00:00:00"
        );

    const dias =
        Math.round(
            (
                fim.getTime() -
                inicio.getTime()
            ) /
            86400000
        );

    if (dias > 366) {

        mostrarMensagem(
            "O período máximo é de 367 dias.",
            "erro"
        );

        return false;

    }

    return true;

}


async function gerarRelatorio(evento) {

    evento?.preventDefault();

    if (
        carregandoRelatorio ||
        !validarPeriodo()
    ) {

        return;

    }

    definirCarregamento(
        true
    );

    estadoRelatorio.hidden =
        false;

    estadoRelatorio.className =
        "estado-relatorio";

    estadoRelatorio.innerHTML = `
        <span class="carregamento-administracao" aria-hidden="true"></span>
        <p>Consultando jornadas...</p>
    `;

    listaJornadasRelatorio.hidden =
        true;

    const parametros =
        new URLSearchParams({
            data_inicio:
                campoDataInicio.value,
            data_fim:
                campoDataFim.value
        });

    if (campoFuncionario.value) {

        parametros.set(
            "id_usuario",
            campoFuncionario.value
        );

    }

    try {

        const resposta =
            await requisicaoApi(
                (
                    "/administracao/relatorios/jornadas?" +
                    parametros.toString()
                ),
                {
                    method: "GET"
                }
            );

        jornadasCarregadas =
            resposta.jornadas || [];

        periodoCarregado =
            resposta.periodo;

        filtroFuncionarioCarregado =
            resposta.filtro?.id_usuario ||
            null;

        preencherFuncionarios(
            resposta.funcionarios || []
        );

        preencherResumo(
            resposta.resumo
        );

        preencherListaJornadas(
            jornadasCarregadas
        );

        descricaoRelatorio.textContent =
            (
                jornadasCarregadas.length === 1
                    ? "1 jornada encontrada"
                    : (
                        jornadasCarregadas.length +
                        " jornadas encontradas"
                    )
            ) +
            " entre " +
            formatarDataBrasileira(
                resposta.periodo.data_inicio
            ) +
            " e " +
            formatarDataBrasileira(
                resposta.periodo.data_fim
            ) +
            ".";

    } catch (erro) {

        console.error(
            "Erro ao gerar relatório:",
            erro
        );

        jornadasCarregadas = [];

        periodoCarregado = null;

        filtroFuncionarioCarregado = null;

        preencherResumo({});

        estadoRelatorio.hidden =
            false;

        estadoRelatorio.className =
            "estado-relatorio estado-relatorio--erro";

        estadoRelatorio.innerHTML = `
            <strong>Não foi possível gerar o relatório</strong>
            <p>
                ${escaparHtml(
                    erro.message ||
                    "Tente novamente."
                )}
            </p>
        `;

        descricaoRelatorio.textContent =
            "Falha ao consultar as jornadas.";

    } finally {

        definirCarregamento(
            false
        );

    }

}


function fecharMenuExportacaoExcel(
    focarBotao = false
) {

    menuExportacaoExcel.hidden = true;

    botaoExportarExcel.setAttribute(
        "aria-expanded",
        "false"
    );

    if (focarBotao) {

        botaoExportarExcel.focus();

    }

}


function alternarMenuExportacaoExcel() {

    if (botaoExportarExcel.disabled) {

        return;

    }

    const abrir =
        menuExportacaoExcel.hidden;

    menuExportacaoExcel.hidden =
        !abrir;

    botaoExportarExcel.setAttribute(
        "aria-expanded",
        String(abrir)
    );

    if (abrir) {

        opcoesExportacaoExcel[0]?.focus();

    }

}


async function exportarExcel(
    estilo = "colorido"
) {

    if (
        !jornadasCarregadas.length ||
        !periodoCarregado
    ) {

        mostrarMensagem(
            "Gere um relatório com jornadas antes de exportar.",
            "erro"
        );

        return;

    }

    const conteudoOriginal =
        botaoExportarExcel.innerHTML;

    const estiloSelecionado =
        estilo === "preto_branco"
            ? "preto_branco"
            : "colorido";

    const nomeEstilo =
        estiloSelecionado === "preto_branco"
            ? "preto-e-branco"
            : "colorido";

    fecharMenuExportacaoExcel();

    botaoExportarExcel.disabled =
        true;

    opcoesExportacaoExcel.forEach(
        opcao => {
            opcao.disabled = true;
        }
    );

    botaoExportarExcel.textContent =
        "Gerando Excel...";

    try {

        const parametros =
            new URLSearchParams({
                data_inicio:
                    periodoCarregado.data_inicio,
                data_fim:
                    periodoCarregado.data_fim,
                estilo:
                    estiloSelecionado
            });

        if (filtroFuncionarioCarregado) {

            parametros.set(
                "id_usuario",
                filtroFuncionarioCarregado
            );

        }

        const enderecoExportacao =
            window.MODO_DEMONSTRACAO
                ? new URL(
                    "../arquivos/relatorio-demonstrativo-" +
                    nomeEstilo +
                    ".xlsx",
                    window.location.href
                ).href
                : (
                    CONFIGURACAO.URL_API +
                    "/administracao/relatorios/jornadas/excel?" +
                    parametros.toString()
                );

        const resposta =
            await fetch(
                enderecoExportacao,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!resposta.ok) {

            let mensagemErro =
                "Não foi possível gerar a planilha.";

            try {

                const dadosErro =
                    await resposta.json();

                if (
                    typeof dadosErro.detail ===
                    "string"
                ) {

                    mensagemErro =
                        dadosErro.detail;

                }

            } catch (erroLeitura) {

                console.warn(
                    "Resposta de erro sem JSON:",
                    erroLeitura
                );

            }

            if (resposta.status === 401) {

                limparSessao();

                window.location.href =
                    "../index.html";

                return;

            }

            throw new Error(
                mensagemErro
            );

        }

        const arquivo =
            await resposta.blob();

        if (!arquivo.size) {

            throw new Error(
                "A planilha foi gerada vazia."
            );

        }

        const endereco =
            URL.createObjectURL(
                arquivo
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            endereco;

        link.download =
            (
                "relatorio-jornadas-" +
                periodoCarregado.data_inicio +
                "-a-" +
                periodoCarregado.data_fim +
                "-" +
                nomeEstilo +
                ".xlsx"
            );

        document.body.appendChild(
            link
        );

        link.click();
        link.remove();

        window.setTimeout(
            () => URL.revokeObjectURL(
                endereco
            ),
            1000
        );

        mostrarMensagem(
            (
                "Planilha " +
                (
                    estiloSelecionado === "preto_branco"
                        ? "em preto e branco"
                        : "colorida"
                ) +
                " exportada com sucesso."
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao exportar planilha:",
            erro
        );

        mostrarMensagem(
            erro.message ||
                "Não foi possível gerar a planilha.",
            "erro"
        );

    } finally {

        botaoExportarExcel.innerHTML =
            conteudoOriginal;

        opcoesExportacaoExcel.forEach(
            opcao => {
                opcao.disabled = false;
            }
        );

        atualizarEstadoConexao();

    }

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

        window.location.href =
            "../index.html";

    }

}


formularioRelatorio.addEventListener(
    "submit",
    gerarRelatorio
);

botaoExportarExcel.addEventListener(
    "click",
    alternarMenuExportacaoExcel
);

menuExportacaoExcel.addEventListener(
    "click",
    evento => {

        const opcao =
            evento.target.closest(
                "[data-estilo-excel]"
            );

        if (!opcao || opcao.disabled) {

            return;

        }

        exportarExcel(
            opcao.dataset.estiloExcel
        );

    }
);

document.addEventListener(
    "click",
    evento => {

        if (
            !menuExportacaoExcel.hidden &&
            !controleExportacaoExcel.contains(
                evento.target
            )
        ) {

            fecharMenuExportacaoExcel();

        }

    }
);

document.addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Escape" &&
            !menuExportacaoExcel.hidden
        ) {

            fecharMenuExportacaoExcel(true);

        }

    }
);

listaJornadasRelatorio.addEventListener(
    "click",
    tratarCliqueListaRelatorio
);

botaoSair.addEventListener(
    "click",
    sairDaConta
);

window.addEventListener(
    "online",
    atualizarEstadoConexao
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

    definirDatasIniciais();
    atualizarEstadoConexao();

    const administradorValido =
        await carregarUsuario();

    if (!administradorValido) {

        return;

    }

    await gerarRelatorio();

}


iniciarPagina();
