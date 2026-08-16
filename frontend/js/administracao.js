/*
 * Painel administrativo do Gestor de Jornadas.
 */


const CAMINHO_ICONES_ADMINISTRACAO =
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

const quantidadeAtivos = document.getElementById(
    "quantidade-ativos"
);

const quantidadeInativos = document.getElementById(
    "quantidade-inativos"
);

const quantidadeAdministradores = document.getElementById(
    "quantidade-administradores"
);


/* =========================================================
   PESQUISA E FILTROS
   ========================================================= */

const campoPesquisa = document.getElementById(
    "campo-pesquisa"
);

const botaoLimparPesquisa = document.getElementById(
    "botao-limpar-pesquisa"
);

const botoesFiltroSituacao = document.querySelectorAll(
    "[data-situacao]"
);

const botaoAtualizarLista = document.getElementById(
    "botao-atualizar-lista"
);


/* =========================================================
   LISTA
   ========================================================= */

const descricaoResultados = document.getElementById(
    "descricao-resultados"
);

const estadoCarregamento = document.getElementById(
    "estado-carregamento"
);

const estadoVazio = document.getElementById(
    "estado-vazio"
);

const listaFuncionarios = document.getElementById(
    "lista-funcionarios"
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

let situacaoSelecionada = "";

let temporizadorPesquisa = null;

let temporizadorMensagem = null;

let carregandoFuncionarios = false;

let idFuncionarioAberto = null;

let elementoFocoAntesPainel = null;


/* =========================================================
   FORMATAÇÕES
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


function somenteNumeros(valor) {

    return String(
        valor ?? ""
    ).replace(
        /\D/g,
        ""
    );

}


function formatarCpfCampo(valor) {

    return somenteNumeros(valor)
        .slice(0, 11)
        .replace(
            /^(\d{3})(\d)/,
            "$1.$2"
        )
        .replace(
            /^(\d{3})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1-$2"
        );

}


function formatarTelefoneCampo(valor) {

    const numeros = somenteNumeros(
        valor
    ).slice(
        0,
        11
    );

    if (numeros.length <= 2) {

        return numeros
            ? `(${numeros}`
            : "";

    }

    if (numeros.length <= 6) {

        return numeros.replace(
            /^(\d{2})(\d+)/,
            "($1) $2"
        );

    }

    if (numeros.length <= 10) {

        return numeros.replace(
            /^(\d{2})(\d{4})(\d+)/,
            "($1) $2-$3"
        );

    }

    return numeros.replace(
        /^(\d{2})(\d{5})(\d+)/,
        "($1) $2-$3"
    );

}


function cpfValido(valor) {

    const cpf = somenteNumeros(
        valor
    );

    if (
        cpf.length !== 11 ||
        /^(\d)\1{10}$/.test(cpf)
    ) {

        return false;

    }

    const calcularDigito =
        quantidade => {

            let soma = 0;

            for (
                let indice = 0;
                indice < quantidade;
                indice += 1
            ) {

                soma +=
                    Number(cpf[indice]) *
                    (
                        quantidade +
                        1 -
                        indice
                    );

            }

            const resto = soma % 11;

            return resto < 2
                ? 0
                : 11 - resto;

        };

    return (
        calcularDigito(9) ===
        Number(cpf[9])
        &&
        calcularDigito(10) ===
        Number(cpf[10])
    );

}


function obterDataAtualLocal() {

    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(
        2,
        "0"
    );

    const dia = String(
        agora.getDate()
    ).padStart(
        2,
        "0"
    );

    return `${ano}-${mes}-${dia}`;

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

        return "Data não informada";

    }

    const data = new Date(
        dataIso
    );

    if (Number.isNaN(data.getTime())) {

        return "Data não informada";

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


function obterTextoTipoUsuario(tipoUsuario) {

    return tipoUsuario === "ADMINISTRADOR"
        ? "Administrador"
        : "Funcionário";

}


function obterTextoSituacaoUsuario(situacaoUsuario) {

    return situacaoUsuario === "ATIVO"
        ? "Conta ativa"
        : "Conta inativa";

}


function obterTextoSituacaoJornada(situacao) {

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

    return situacoes[situacao] || situacao;

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
   MENSAGENS E CONEXÃO
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

    botaoAtualizarLista.disabled =
        !conectado;

    botoesFiltroSituacao.forEach(
        botao => {

            botao.disabled =
                !conectado ||
                carregandoFuncionarios;

        }
    );

}


/* =========================================================
   USUÁRIO ADMINISTRADOR
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
   CARREGAMENTO DA LISTA
   ========================================================= */

function definirCarregamentoLista(carregando) {

    carregandoFuncionarios =
        carregando;

    estadoCarregamento.hidden =
        !carregando;

    if (carregando) {

        listaFuncionarios.hidden =
            true;

        estadoVazio.hidden =
            true;

    }

    botaoAtualizarLista.disabled =
        carregando ||
        !navigator.onLine;

    botaoAtualizarLista.classList.toggle(
        "carregando",
        carregando
    );

    botaoAtualizarLista.setAttribute(
        "aria-busy",
        String(
            carregando
        )
    );

    botoesFiltroSituacao.forEach(
        botao => {

            botao.disabled =
                carregando ||
                !navigator.onLine;

        }
    );

}


/* =========================================================
   RESUMO
   ========================================================= */

function preencherResumo(
    resumo,
    funcionarios
) {

    quantidadeTotal.textContent =
        resumo.quantidade_total;

    quantidadeAtivos.textContent =
        resumo.quantidade_ativos;

    quantidadeInativos.textContent =
        resumo.quantidade_inativos;

    const totalAdministradores =
        funcionarios.filter(
            funcionario =>
                funcionario.tipo_usuario ===
                "ADMINISTRADOR"
        ).length;

    quantidadeAdministradores.textContent =
        totalAdministradores;

}


/* =========================================================
   CARTÃO DO FUNCIONÁRIO
   ========================================================= */

function criarCartaoFuncionario(
    funcionario
) {

    const botao =
        document.createElement(
            "button"
        );

    botao.type = "button";

    botao.className =
        "cartao-funcionario";

    botao.dataset.idUsuario =
        funcionario.id_usuario;

    botao.setAttribute(
        "aria-label",
        (
            "Ver detalhes de " +
            funcionario.nome_completo
        )
    );

    const situacaoAtiva =
        funcionario.situacao_usuario ===
        "ATIVO";

    const textoSenha =
        funcionario.precisa_trocar_senha
            ? "Troca de senha pendente"
            : "Senha pessoal definida";

    botao.innerHTML = `

        <div class="cabecalho-cartao-funcionario">

            <div class="avatar-funcionario">

                ${escaparHtml(
        obterIniciaisNome(
            funcionario.nome_completo
        )
    )}

            </div>


            <div class="identificacao-funcionario">

                <h3>
                    ${escaparHtml(
        funcionario.nome_completo
    )}
                </h3>

                <p>
                    ${escaparHtml(
        obterTextoTipoUsuario(
            funcionario.tipo_usuario
        )
    )}
                </p>

            </div>


            <span
                class="
                    situacao-funcionario
                    ${situacaoAtiva
            ? "ativo"
            : "inativo"
        }
                "
            >
                ${situacaoAtiva
            ? "Ativa"
            : "Inativa"
        }
            </span>

        </div>


        <div class="grade-dados-cartao-funcionario">

            <div class="dado-cartao-funcionario">

                <span>
                    CPF
                </span>

                <strong>
                    ${escaparHtml(
            formatarCpf(
                funcionario.cpf
            )
        )}
                </strong>

            </div>


            <div class="dado-cartao-funcionario">

                <span>
                    Telefone
                </span>

                <strong>
                    ${escaparHtml(
            formatarTelefone(
                funcionario.telefone
            )
        )}
                </strong>

            </div>

        </div>


        <div class="rodape-cartao-funcionario">

            <span
                class="
                    etiqueta-senha-funcionario
                    ${funcionario.precisa_trocar_senha
            ? "pendente"
            : ""
        }
                "
            >
                ${escaparHtml(textoSenha)}
            </span>

            <span class="acao-ver-detalhes">

                Ver detalhes

                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_ADMINISTRACAO}#chevron-right"
                    ></use>
                </svg>

            </span>

        </div>
    `;

    botao.addEventListener(
        "click",
        () => {

            abrirDetalhesFuncionario(
                funcionario.id_usuario
            );

        }
    );

    return botao;

}


/* =========================================================
   LISTA
   ========================================================= */

function preencherListaFuncionarios(
    funcionarios
) {

    listaFuncionarios.innerHTML = "";

    if (funcionarios.length === 0) {

        listaFuncionarios.hidden =
            true;

        estadoVazio.hidden =
            false;

        return;

    }

    estadoVazio.hidden = true;

    funcionarios.forEach(
        funcionario => {

            listaFuncionarios.appendChild(
                criarCartaoFuncionario(
                    funcionario
                )
            );

        }
    );

    listaFuncionarios.hidden = false;

}


/* =========================================================
   CONSULTA
   ========================================================= */

async function consultarFuncionarios() {

    if (!navigator.onLine) {

        mostrarMensagemFlutuante(
            "Não foi possível consultar porque o aparelho está sem conexão.",
            "erro"
        );

        return;

    }

    definirCarregamentoLista(true);

    try {

        const parametros =
            new URLSearchParams();

        const pesquisa =
            campoPesquisa.value.trim();

        if (pesquisa) {

            parametros.set(
                "pesquisa",
                pesquisa
            );

        }

        if (situacaoSelecionada) {

            parametros.set(
                "situacao_usuario",
                situacaoSelecionada
            );

        }

        const consulta =
            parametros.toString();

        const caminho =
            consulta
                ? `/administracao/funcionarios?${consulta}`
                : "/administracao/funcionarios";

        const resposta =
            await requisicaoApi(
                caminho,
                {
                    method: "GET"
                }
            );

        preencherResumo(
            resposta.resumo,
            resposta.funcionarios
        );

        preencherListaFuncionarios(
            resposta.funcionarios
        );

        const quantidade =
            resposta.resumo
                .quantidade_total;

        descricaoResultados.textContent =
            quantidade === 1
                ? "1 pessoa encontrada."
                : `${quantidade} pessoas encontradas.`;

    } catch (erro) {

        console.error(
            "Erro ao consultar funcionários:",
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
            erro.status === 403
        ) {

            voltarParaInicio();

            return;

        }

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível consultar as pessoas cadastradas.",
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

    const painelEstavaFechado =
        fundoDetalhes.hidden;

    if (painelEstavaFechado) {

        elementoFocoAntesPainel =
            document.activeElement;

    }

    fundoDetalhes.hidden = false;

    document.body.style.overflow =
        "hidden";

    if (painelEstavaFechado) {

        botaoFecharDetalhes.focus();

    }

}


function fecharPainelDetalhes() {

    fundoDetalhes.hidden = true;

    document.body.style.overflow =
        "";

    idFuncionarioAberto = null;

    if (
        elementoFocoAntesPainel &&
        documentoContemElemento(
            elementoFocoAntesPainel
        )
    ) {

        elementoFocoAntesPainel.focus();

    }

    elementoFocoAntesPainel = null;

}


function documentoContemElemento(
    elemento
) {

    return document.contains(
        elemento
    );

}


function criarHtmlJornadasRecentes(
    jornadas
) {

    if (!jornadas.length) {

        return `

            <div class="estado-lista-administracao">

                <strong>
                    Nenhuma jornada registrada
                </strong>

                <p>
                    Esta pessoa ainda não possui jornadas no sistema.
                </p>

            </div>
        `;

    }

    const limiteInicial = 5;

    const itens = jornadas.map(
        (jornada, indice) => {

            const idDetalhe =
                `detalhe-jornada-${jornada.id_jornada}`;

            const classeSaldo =
                Number(jornada.minutos_saldo) > 0
                    ? "positivo"
                    : Number(jornada.minutos_saldo) < 0
                        ? "negativo"
                        : "neutro";

            const adicional =
                indice >= limiteInicial;

            return `

                <div
                    class="item-jornada-recente ${adicional
            ? "item-jornada-recente--adicional"
            : ""
        }"
                    ${adicional ? "hidden" : ""}
                >

                    <button
                        type="button"
                        class="jornada-recente-administracao"
                        data-acao="alternar-detalhe-jornada"
                        aria-expanded="false"
                        aria-controls="${escaparHtml(idDetalhe)}"
                    >

                        <span class="jornada-recente-administracao__principal">

                            <strong>
                                ${escaparHtml(
                formatarData(
                    jornada.data_jornada
                )
            )}
                            </strong>

                            <span>
                                ${escaparHtml(
                jornada.atividade_do_dia ||
                obterTextoSituacaoJornada(
                    jornada.situacao_jornada
                )
            )}
                            </span>

                        </span>


                        <span class="dado-jornada-recente dado-jornada-recente--trabalhado">

                            <span>
                                Trabalhado
                            </span>

                            <strong>
                                ${escaparHtml(
                jornada.tempo_trabalhado_formatado
            )}
                            </strong>

                        </span>


                        <span class="dado-jornada-recente dado-jornada-recente--extras">

                            <span>
                                Extras
                            </span>

                            <strong>
                                ${escaparHtml(
                jornada.horas_extras_formatadas
            )}
                            </strong>

                        </span>


                        <span class="dado-jornada-recente dado-jornada-recente--saldo ${classeSaldo}">

                            <span>
                                Saldo
                            </span>

                            <strong>
                                ${escaparHtml(
                jornada.saldo_formatado
            )}
                            </strong>

                        </span>


                        <span class="acao-jornada-recente" aria-hidden="true">

                            <svg
                                class="icone-sistema"
                                focusable="false"
                            >
                                <use
                                    href="${CAMINHO_ICONES_ADMINISTRACAO}#chevron-down"
                                ></use>
                            </svg>

                        </span>

                    </button>


                    <div
                        id="${escaparHtml(idDetalhe)}"
                        class="detalhe-jornada-recente"
                        hidden
                    >

                        ${criarHtmlDetalheJornada(
                jornada
            )}

                    </div>

                </div>
            `;

        }
    ).join("");

    const quantidadeAdicional =
        Math.max(
            jornadas.length - limiteInicial,
            0
        );

    return `

        ${itens}

        ${quantidadeAdicional > 0
            ? `
                <button
                    type="button"
                    id="botao-ver-mais-jornadas"
                    class="botao-ver-mais-jornadas"
                    aria-expanded="false"
                >

                    <span class="texto-ver-mais-jornadas">
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
                        <use
                            href="${CAMINHO_ICONES_ADMINISTRACAO}#chevron-down"
                        ></use>
                    </svg>

                </button>
            `
            : ""
        }
    `;

}


function obterTextoTipoTrabalhoJornada(
    jornada
) {

    const obterTexto = tipo =>
        tipo === "OPERACIONAL"
            ? "Operacional"
            : tipo === "ADMINISTRATIVO"
                ? "Atividade administrativa"
                : null;

    const inicio = obterTexto(
        jornada.tipo_trabalho_inicio
    );

    const depoisAlmoco = obterTexto(
        jornada.tipo_trabalho_apos_almoco
    );

    if (
        !depoisAlmoco ||
        depoisAlmoco === inicio
    ) {

        return inicio || "Não informado";

    }

    return `${inicio} pela manhã e ${depoisAlmoco.toLowerCase()} após o almoço`;

}


function criarHtmlHorarioJornada(
    rotulo,
    horario,
    icone
) {

    return `

        <div class="horario-detalhe-jornada">

            <span class="horario-detalhe-jornada__icone">

                <svg
                    class="icone-sistema"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use
                        href="${CAMINHO_ICONES_ADMINISTRACAO}#${icone}"
                    ></use>
                </svg>

            </span>

            <span class="horario-detalhe-jornada__texto">

                <span>
                    ${escaparHtml(rotulo)}
                </span>

                <strong>
                    ${escaparHtml(
        horario || "Não registrado"
    )}
                </strong>

            </span>

        </div>
    `;

}


function obterExplicacaoCalculoJornada(
    jornada
) {

    const saldo = Number(
        jornada.minutos_saldo || 0
    );

    const esperado = Number(
        jornada.minutos_esperados || 0
    );

    if (
        jornada.situacao_jornada === "EM_ANDAMENTO" ||
        jornada.situacao_jornada === "INCOMPLETA"
    ) {

        return "Esta jornada ainda não possui todos os horários. Os valores exibidos podem mudar quando ela for concluída.";

    }

    if (
        esperado === 0 &&
        Number(jornada.minutos_trabalhados) > 0
    ) {

        return "Como este dia não tinha carga horária obrigatória, todo o período trabalhado foi contabilizado como hora extra e saldo positivo.";

    }

    if (saldo > 0) {

        return `Depois de comparar os horários registrados com a jornada prevista, sobraram ${jornada.saldo_formatado}. Esse valor foi contabilizado como hora extra.`;

    }

    if (saldo < 0) {

        return `Depois de comparar os horários registrados com a jornada prevista, faltaram ${String(jornada.saldo_formatado).replace("-", "")}. A tolerância mostrada abaixo já está considerada nesse saldo.`;

    }

    return "Os horários registrados ficaram de acordo com a jornada prevista. Não houve saldo positivo nem negativo neste dia.";

}


function criarHtmlDetalheJornada(
    jornada
) {

    const horarios =
        jornada.horarios || {};

    const minutosSaldo = Number(
        jornada.minutos_saldo || 0
    );

    const classeSaldo =
        minutosSaldo > 0
            ? "positivo"
            : minutosSaldo < 0
                ? "negativo"
                : "neutro";

    return `

        <div class="cabecalho-detalhe-jornada-recente">

            <div>

                <span>
                    Tipo de trabalho
                </span>

                <strong>
                    ${escaparHtml(
        obterTextoTipoTrabalhoJornada(
            jornada
        )
    )}
                </strong>

            </div>

            <span class="situacao-detalhe-jornada">
                ${escaparHtml(
        obterTextoSituacaoJornada(
            jornada.situacao_jornada
        )
    )}
            </span>

        </div>


        <div class="atividade-detalhe-jornada">

            <span>
                Atividade do dia
            </span>

            <strong>
                ${escaparHtml(
        jornada.atividade_do_dia ||
        "Não informada"
    )}
            </strong>

        </div>


        <div class="linha-tempo-detalhe-jornada">

            ${criarHtmlHorarioJornada(
        "Entrada",
        horarios.entrada,
        "box-arrow-in-right"
    )}

            ${criarHtmlHorarioJornada(
        "Início do almoço",
        horarios.inicio_almoco,
        "fork-knife"
    )}

            ${criarHtmlHorarioJornada(
        "Retorno",
        horarios.fim_almoco,
        "arrow-return-left"
    )}

            ${criarHtmlHorarioJornada(
        "Saída",
        horarios.saida,
        "box-arrow-right"
    )}

        </div>


        <div class="titulo-calculo-jornada">

            <svg
                class="icone-sistema"
                aria-hidden="true"
                focusable="false"
            >
                <use
                    href="${CAMINHO_ICONES_ADMINISTRACAO}#calculator-fill"
                ></use>
            </svg>

            <strong>
                Detalhamento das horas
            </strong>

        </div>


        <div class="grade-calculo-jornada">

            <div class="dado-calculo-jornada">
                <span>Tempo trabalhado</span>
                <strong>${escaparHtml(jornada.tempo_trabalhado_formatado)}</strong>
            </div>

            <div class="dado-calculo-jornada">
                <span>Jornada esperada</span>
                <strong>${escaparHtml(jornada.tempo_esperado_formatado)}</strong>
            </div>

            <div class="dado-calculo-jornada ${Number(jornada.minutos_extras) > 0
        ? "positivo"
        : "neutro"
    }">
                <span>Horas extras</span>
                <strong>${escaparHtml(jornada.horas_extras_formatadas)}</strong>
            </div>

            <div class="dado-calculo-jornada ${classeSaldo}">
                <span>Saldo do dia</span>
                <strong>${escaparHtml(jornada.saldo_formatado)}</strong>
            </div>

            <div class="dado-calculo-jornada">
                <span>Tolerância aplicada</span>
                <strong>${escaparHtml(jornada.tolerancia_formatada || "00h00")}</strong>
            </div>

            <div class="dado-calculo-jornada">
                <span>Horas abonadas</span>
                <strong>${escaparHtml(jornada.horas_abonadas_formatadas || "00h00")}</strong>
            </div>

        </div>


        <div class="explicacao-calculo-jornada">

            <strong>
                Como foi calculado
            </strong>

            <p>
                ${escaparHtml(
        obterExplicacaoCalculoJornada(
            jornada
        )
    )}
            </p>

        </div>
    `;

}


function configurarEventosJornadasRecentes() {

    const botoesDetalhe =
        conteudoDetalhes.querySelectorAll(
            '[data-acao="alternar-detalhe-jornada"]'
        );

    botoesDetalhe.forEach(
        botao => botao.addEventListener(
            "click",
            () => {

                const estavaAberto =
                    botao.getAttribute(
                        "aria-expanded"
                    ) === "true";

                botoesDetalhe.forEach(
                    outroBotao => {

                        outroBotao.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        const outroDetalhe =
                            document.getElementById(
                                outroBotao.getAttribute(
                                    "aria-controls"
                                )
                            );

                        if (outroDetalhe) {

                            outroDetalhe.hidden = true;

                        }

                    }
                );

                if (estavaAberto) {

                    return;

                }

                const detalhe =
                    document.getElementById(
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

            }
        )
    );

    const botaoVerMais =
        document.getElementById(
            "botao-ver-mais-jornadas"
        );

    if (!botaoVerMais) {

        return;

    }

    const itensAdicionais =
        conteudoDetalhes.querySelectorAll(
            ".item-jornada-recente--adicional"
        );

    const textoBotao =
        botaoVerMais.querySelector(
            ".texto-ver-mais-jornadas"
        );

    botaoVerMais.addEventListener(
        "click",
        () => {

            const expandido =
                botaoVerMais.getAttribute(
                    "aria-expanded"
                ) === "true";

            itensAdicionais.forEach(
                item => {

                    item.hidden = expandido;

                    if (expandido) {

                        const botaoItem =
                            item.querySelector(
                                '[data-acao="alternar-detalhe-jornada"]'
                            );

                        const detalheItem =
                            item.querySelector(
                                ".detalhe-jornada-recente"
                            );

                        botaoItem?.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        if (detalheItem) {

                            detalheItem.hidden = true;

                        }

                    }

                }
            );

            botaoVerMais.setAttribute(
                "aria-expanded",
                String(!expandido)
            );

            textoBotao.textContent =
                expandido
                    ? `Ver mais ${itensAdicionais.length} ${itensAdicionais.length === 1
                        ? "jornada"
                        : "jornadas"
                    }`
                    : "Mostrar menos";

        }
    );

}


function criarHtmlHistoricoConta(
    historico
) {

    const eventos =
        historico?.eventos || [];

    if (!eventos.length) {

        return `

            <div class="estado-historico-conta">

                <span class="estado-historico-conta__icone">

                    <svg
                        class="icone-sistema"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <use
                            href="${CAMINHO_ICONES_ADMINISTRACAO}#clock-history"
                        ></use>
                    </svg>

                </span>

                <div>

                    <strong>
                        Nenhuma movimentação registrada
                    </strong>

                    <p>
                        As próximas ações administrativas
                        aparecerão neste histórico.
                    </p>

                </div>

            </div>
        `;

    }

    const nomesCampos = {

        nome_completo: "Nome",

        cpf: "CPF",

        telefone: "Telefone",

        data_nascimento:
            "Data de nascimento"

    };

    return eventos.map(
        evento => {

            let titulo;

            let descricao;

            let icone;

            let classe;

            if (
                evento.tipo_evento ===
                "ALTERACAO_SITUACAO"
            ) {

                const contaAtivada =
                    evento.detalhes
                        .situacao_nova ===
                    "ATIVO";

                titulo = contaAtivada
                    ? "Conta ativada"
                    : "Conta desativada";

                descricao =
                    evento.detalhes
                        .observacao ||
                    (
                        contaAtivada
                            ? "O acesso ao sistema foi liberado."
                            : "O acesso ao sistema foi interrompido."
                    );

                icone = contaAtivada
                    ? "person-check-fill"
                    : "person-x-fill";

                classe = contaAtivada
                    ? "ativacao"
                    : "desativacao";

            } else if (
                evento.tipo_evento ===
                "REDEFINICAO_SENHA"
            ) {

                const sessoes =
                    Number(
                        evento.detalhes
                            .quantidade_sessoes_encerradas ||
                        0
                    );

                titulo =
                    "Senha provisória definida";

                descricao = sessoes === 1
                    ? "1 sessão aberta foi encerrada."
                    : `${sessoes} sessões abertas foram encerradas.`;

                icone = "key-fill";

                classe = "senha";

            } else {

                const campos =
                    evento.detalhes
                        .campos_alterados || [];

                const camposFormatados =
                    campos.map(
                        campo =>
                            nomesCampos[campo] ||
                            campo
                    );

                titulo =
                    "Dados cadastrais corrigidos";

                descricao =
                    camposFormatados.length
                        ? `Campos alterados: ${camposFormatados.join(", ")}.`
                        : "Os dados cadastrais foram atualizados.";

                icone = "pencil-square";

                classe = "dados";

            }

            return `

                <article
                    class="
                        evento-historico-conta
                        evento-historico-conta--${classe}
                    "
                >

                    <span class="evento-historico-conta__icone">

                        <svg
                            class="icone-sistema"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <use
                                href="${CAMINHO_ICONES_ADMINISTRACAO}#${icone}"
                            ></use>
                        </svg>

                    </span>


                    <div class="evento-historico-conta__conteudo">

                        <strong>
                            ${escaparHtml(
                titulo
            )}
                        </strong>

                        <p>
                            ${escaparHtml(
                descricao
            )}
                        </p>

                        <span>
                            Por
                            ${escaparHtml(
                evento.administrador
                    ?.nome_completo ||
                "Administrador"
            )}
                            ·
                            ${escaparHtml(
                formatarDataHora(
                    evento.data_evento
                )
            )}
                        </span>

                    </div>

                </article>
            `;

        }
    ).join("");

}


function preencherDetalhesFuncionario(
    resposta
) {

    const funcionario =
        resposta.funcionario;

    const resumo =
        resposta.resumo_jornadas;

    const jornadas =
        resposta.historico_jornadas ||
        resposta.jornadas_recentes ||
        [];

    const historicoConta =
        resposta.historico_conta;

    const contaAtiva =
        funcionario.situacao_usuario ===
        "ATIVO";

    const proprioUsuario =
        usuarioAtual &&
        funcionario.id_usuario ===
        usuarioAtual.id_usuario;

    const novaSituacao =
        contaAtiva
            ? "INATIVO"
            : "ATIVO";

    const textoAcao =
        contaAtiva
            ? "Desativar conta"
            : "Ativar conta";

    const classeAcao =
        contaAtiva
            ? "desativar"
            : "ativar";

    tituloDetalhes.textContent =
        funcionario.nome_completo;

    conteudoDetalhes.innerHTML = `

        <section class="identidade-detalhe-funcionario">

            <div class="avatar-detalhe-funcionario">

                ${escaparHtml(
        obterIniciaisNome(
            funcionario.nome_completo
        )
    )}

            </div>


            <div class="identidade-detalhe-funcionario__texto">

                <h3>
                    ${escaparHtml(
        funcionario.nome_completo
    )}
                </h3>

                <div class="identidade-detalhe-funcionario__etiquetas">

                    <span class="etiqueta-detalhe">

                        ${escaparHtml(
        obterTextoTipoUsuario(
            funcionario.tipo_usuario
        )
    )}

                    </span>

                    <span
                        class="
                            etiqueta-detalhe
                            ${contaAtiva
            ? "ativa"
            : "inativa"
        }
                        "
                    >

                        ${escaparHtml(
            obterTextoSituacaoUsuario(
                funcionario.situacao_usuario
            )
        )}

                    </span>

                    ${funcionario.precisa_trocar_senha
            ? `
                                <span class="etiqueta-detalhe">
                                    Senha provisória
                                </span>
                            `
            : ""
        }

                </div>

            </div>

        </section>


        <section class="secao-detalhe-administracao">

            <div class="cabecalho-secao-detalhe">

                <h3>
                    Dados pessoais
                </h3>

                <button
                    type="button"
                    id="botao-preparar-edicao-dados"
                    class="botao-preparar-edicao-dados"
                >

                    <svg
                        class="icone-sistema"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <use
                            href="${CAMINHO_ICONES_ADMINISTRACAO}#pencil-fill"
                        ></use>
                    </svg>

                    Editar dados
                </button>

            </div>

            <div
                id="dados-pessoais-visualizacao"
                class="grade-dados-detalhe"
            >

                <div class="dado-detalhe-administracao">

                    <span>
                        CPF
                    </span>

                    <strong>
                        ${escaparHtml(
            formatarCpf(
                funcionario.cpf
            )
        )}
                    </strong>

                </div>


                <div class="dado-detalhe-administracao">

                    <span>
                        Telefone
                    </span>

                    <strong>
                        ${escaparHtml(
            formatarTelefone(
                funcionario.telefone
            )
        )}
                    </strong>

                </div>


                <div class="dado-detalhe-administracao">

                    <span>
                        Data de nascimento
                    </span>

                    <strong>
                        ${escaparHtml(
            formatarData(
                funcionario.data_nascimento
            )
        )}
                    </strong>

                </div>


                <div class="dado-detalhe-administracao">

                    <span>
                        Data de cadastro
                    </span>

                    <strong>
                        ${escaparHtml(
            formatarData(
                funcionario.data_cadastro
            )
        )}
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhe-administracao">

            <h3>
                Resumo das jornadas
            </h3>

            <div class="grade-resumo-funcionario">

                <div class="resumo-funcionario">

                    <span>
                        Jornadas
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.quantidade_jornadas
        )}
                    </strong>

                </div>


                <div class="resumo-funcionario">

                    <span>
                        Trabalhado
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.total_trabalhado_formatado
        )}
                    </strong>

                </div>


                <div class="resumo-funcionario">

                    <span>
                        Esperado
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.total_esperado_formatado
        )}
                    </strong>

                </div>


                <div class="resumo-funcionario">

                    <span>
                        Extras
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.total_extras_formatado
        )}
                    </strong>

                </div>


                <div class="resumo-funcionario">

                    <span>
                        Saldo
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.total_saldo_formatado
        )}
                    </strong>

                </div>


                <div class="resumo-funcionario">

                    <span>
                        Tolerância
                    </span>

                    <strong>
                        ${escaparHtml(
            resumo.total_tolerancia_formatado
        )}
                    </strong>

                </div>

            </div>

        </section>


        <section class="secao-detalhe-administracao">

            <h3>
                Jornadas recentes
            </h3>

            <div class="lista-jornadas-recentes">

                ${criarHtmlJornadasRecentes(
            jornadas
        )}

            </div>

        </section>


        <section class="secao-detalhe-administracao">

            <h3>
                Gerenciamento da conta
            </h3>

            <div class="gerenciamento-conta">

                <p>

                    ${proprioUsuario
            ? "Você está visualizando sua própria conta. Por segurança, não é possível desativá-la por esta tela."
            : contaAtiva
                ? "Ao desativar esta conta, as sessões abertas serão encerradas e a pessoa não conseguirá entrar no sistema."
                : "Ao ativar esta conta, a pessoa poderá voltar a entrar no sistema normalmente."
        }

                </p>

                <button
                    type="button"
                    id="botao-preparar-situacao"
                    class="
                        botao-preparar-situacao
                        ${classeAcao}
                    "
                    ${proprioUsuario
            ? "disabled"
            : ""
        }
                >
                    ${proprioUsuario
            ? "Esta é sua conta"
            : textoAcao
        }
                </button>


                <div
                    id="confirmacao-situacao"
                    class="confirmacao-situacao"
                    hidden
                >

                    <label for="observacao-situacao">
                        Observação opcional
                    </label>

                    <textarea
                        id="observacao-situacao"
                        maxlength="500"
                        placeholder="Ex.: Funcionário afastado temporariamente"
                    ></textarea>

                    <div class="confirmacao-situacao__acoes">

                        <button
                            type="button"
                            id="botao-cancelar-situacao"
                            class="botao-cancelar-situacao"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            id="botao-confirmar-situacao"
                            class="
                                botao-confirmar-situacao
                                ${classeAcao}
                            "
                        >
                            Confirmar
                            ${escaparHtml(
            textoAcao.toLowerCase()
        )}
                        </button>

                    </div>

                </div>

            </div>


            <div class="gerenciamento-conta gerenciamento-conta--senha">

                <div>

                    <h4>
                        Redefinição de senha
                    </h4>

                    <p>

                        ${proprioUsuario
            ? "Para alterar sua própria senha, utilize a página de perfil."
            : "Crie uma senha provisória para esta pessoa. As sessões abertas serão encerradas e a troca da senha será solicitada no próximo acesso."
        }

                    </p>

                </div>

                <button
                    type="button"
                    id="botao-preparar-redefinicao-senha"
                    class="botao-preparar-redefinicao-senha"
                    ${proprioUsuario
            ? "disabled"
            : ""
        }
                >
                    ${proprioUsuario
            ? "Altere pelo seu perfil"
            : "Redefinir senha"
        }
                </button>


                <div
                    id="confirmacao-redefinicao-senha"
                    class="confirmacao-redefinicao-senha"
                    hidden
                >

                    <div class="campo-senha-administracao">

                        <label for="nova-senha-provisoria">
                            Nova senha provisória
                        </label>

                        <input
                            type="password"
                            id="nova-senha-provisoria"
                            minlength="12"
                            maxlength="128"
                            autocomplete="new-password"
                            placeholder="Mínimo de 12 caracteres"
                        >

                    </div>


                    <div class="campo-senha-administracao">

                        <label for="confirmacao-senha-provisoria">
                            Confirme a senha provisória
                        </label>

                        <input
                            type="password"
                            id="confirmacao-senha-provisoria"
                            minlength="12"
                            maxlength="128"
                            autocomplete="new-password"
                            placeholder="Digite a mesma senha"
                        >

                    </div>


                    <p
                        id="aviso-redefinicao-senha"
                        class="aviso-redefinicao-senha"
                        role="alert"
                        hidden
                    ></p>


                    <div class="confirmacao-redefinicao-senha__acoes">

                        <button
                            type="button"
                            id="botao-cancelar-redefinicao-senha"
                            class="botao-cancelar-redefinicao-senha"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            id="botao-confirmar-redefinicao-senha"
                            class="botao-confirmar-redefinicao-senha"
                        >
                            Confirmar redefinição
                        </button>

                    </div>

                </div>

            </div>


            <form
                id="formulario-edicao-dados"
                class="formulario-edicao-dados"
                hidden
            >

                <p class="orientacao-edicao-dados">
                    Corrija somente os dados cadastrais. O nível
                    de acesso e a situação da conta não serão
                    alterados.
                </p>

                <div class="grade-campos-edicao-dados">

                    <div class="campo-edicao-dados campo-edicao-dados--completo">

                        <label for="edicao-nome-completo">
                            Nome completo
                        </label>

                        <input
                            type="text"
                            id="edicao-nome-completo"
                            minlength="3"
                            maxlength="150"
                            autocomplete="name"
                            value="${escaparHtml(
            funcionario.nome_completo
        )}"
                        >

                    </div>


                    <div class="campo-edicao-dados">

                        <label for="edicao-cpf">
                            CPF
                        </label>

                        <input
                            type="text"
                            id="edicao-cpf"
                            inputmode="numeric"
                            maxlength="14"
                            autocomplete="off"
                            value="${escaparHtml(
            formatarCpf(
                funcionario.cpf
            )
        )}"
                        >

                    </div>


                    <div class="campo-edicao-dados">

                        <label for="edicao-telefone">
                            Telefone
                        </label>

                        <input
                            type="tel"
                            id="edicao-telefone"
                            inputmode="tel"
                            maxlength="15"
                            autocomplete="tel"
                            value="${escaparHtml(
            formatarTelefone(
                funcionario.telefone
            )
        )}"
                        >

                    </div>


                    <div class="campo-edicao-dados">

                        <label for="edicao-data-nascimento">
                            Data de nascimento
                        </label>

                        <input
                            type="date"
                            id="edicao-data-nascimento"
                            max="${obterDataAtualLocal()}"
                            value="${escaparHtml(
            funcionario.data_nascimento ||
            ""
        )}"
                        >

                    </div>

                </div>


                <p
                    id="aviso-edicao-dados"
                    class="aviso-edicao-dados"
                    role="alert"
                    hidden
                ></p>


                <div class="acoes-edicao-dados">

                    <button
                        type="button"
                        id="botao-cancelar-edicao-dados"
                        class="botao-cancelar-edicao-dados"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        id="botao-salvar-edicao-dados"
                        class="botao-salvar-edicao-dados"
                    >
                        Salvar alterações
                    </button>

                </div>

            </form>

        </section>


        <section class="secao-detalhe-administracao">

            <div class="cabecalho-historico-conta">

                <div>

                    <h3>
                        Histórico da conta
                    </h3>

                    <p>
                        Movimentações administrativas mais recentes
                    </p>

                </div>

                <span class="quantidade-historico-conta">
                    ${escaparHtml(
            historicoConta?.quantidade ||
            0
        )}
                </span>

            </div>

            <div class="lista-historico-conta">

                ${criarHtmlHistoricoConta(
            historicoConta
        )}

            </div>

        </section>
    `;

    configurarEventosJornadasRecentes();

    configurarEventosEdicaoDados(
        funcionario
    );

    if (!proprioUsuario) {

        configurarEventosSituacao(
            funcionario.id_usuario,
            novaSituacao
        );

        configurarEventosRedefinicaoSenha(
            funcionario.id_usuario
        );

    }

}


/* =========================================================
   EDIÇÃO DOS DADOS CADASTRAIS
   ========================================================= */

function configurarEventosEdicaoDados(
    funcionario
) {

    const botaoPreparar =
        document.getElementById(
            "botao-preparar-edicao-dados"
        );

    const visualizacao =
        document.getElementById(
            "dados-pessoais-visualizacao"
        );

    const formulario =
        document.getElementById(
            "formulario-edicao-dados"
        );

    const secaoDadosPessoais =
        botaoPreparar.closest(
            ".secao-detalhe-administracao"
        );

    if (
        secaoDadosPessoais &&
        formulario.parentElement !==
        secaoDadosPessoais
    ) {

        secaoDadosPessoais.appendChild(
            formulario
        );

    }

    const campoNome =
        document.getElementById(
            "edicao-nome-completo"
        );

    const campoCpf =
        document.getElementById(
            "edicao-cpf"
        );

    const campoTelefone =
        document.getElementById(
            "edicao-telefone"
        );

    const campoNascimento =
        document.getElementById(
            "edicao-data-nascimento"
        );

    const aviso =
        document.getElementById(
            "aviso-edicao-dados"
        );

    const botaoCancelar =
        document.getElementById(
            "botao-cancelar-edicao-dados"
        );

    const botaoSalvar =
        document.getElementById(
            "botao-salvar-edicao-dados"
        );

    const campos = [
        campoNome,
        campoCpf,
        campoTelefone,
        campoNascimento
    ];


    function limparAviso() {

        aviso.hidden = true;

        aviso.textContent = "";

        campos.forEach(
            campo => campo.classList.remove(
                "input-invalido"
            )
        );

    }


    function exibirAviso(
        mensagem,
        campo = null
    ) {

        aviso.textContent = mensagem;

        aviso.hidden = false;

        if (campo) {

            campo.classList.add(
                "input-invalido"
            );

            campo.focus();

        }

    }


    function definirCarregamento(
        carregando
    ) {

        botaoSalvar.disabled = carregando;

        botaoCancelar.disabled = carregando;

        campos.forEach(
            campo => {

                campo.disabled = carregando;

            }
        );

        formulario.setAttribute(
            "aria-busy",
            String(carregando)
        );

    }


    function restaurarValores() {

        campoNome.value =
            funcionario.nome_completo;

        campoCpf.value =
            formatarCpf(
                funcionario.cpf
            );

        campoTelefone.value =
            formatarTelefone(
                funcionario.telefone
            );

        campoNascimento.value =
            funcionario.data_nascimento ||
            "";

    }


    function fecharEdicao() {

        formulario.hidden = true;

        visualizacao.hidden = false;

        botaoPreparar.hidden = false;

        restaurarValores();

        limparAviso();

        botaoPreparar.focus();

    }


    botaoPreparar.addEventListener(
        "click",
        () => {

            visualizacao.hidden = true;

            botaoPreparar.hidden = true;

            formulario.hidden = false;

            campoNome.focus();

        }
    );


    botaoCancelar.addEventListener(
        "click",
        fecharEdicao
    );


    campoCpf.addEventListener(
        "input",
        () => {

            campoCpf.value =
                formatarCpfCampo(
                    campoCpf.value
                );

            limparAviso();

        }
    );


    campoTelefone.addEventListener(
        "input",
        () => {

            campoTelefone.value =
                formatarTelefoneCampo(
                    campoTelefone.value
                );

            limparAviso();

        }
    );


    [
        campoNome,
        campoNascimento
    ].forEach(
        campo => {

            campo.addEventListener(
                "input",
                limparAviso
            );

        }
    );


    formulario.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();

            if (botaoSalvar.disabled) {

                return;

            }

            limparAviso();

            const nomeCompleto =
                campoNome.value
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );

            const cpf =
                somenteNumeros(
                    campoCpf.value
                );

            const telefone =
                somenteNumeros(
                    campoTelefone.value
                );

            const dataNascimento =
                campoNascimento.value;

            if (nomeCompleto.length < 3) {

                exibirAviso(
                    "Informe o nome completo.",
                    campoNome
                );

                return;

            }

            if (!cpfValido(cpf)) {

                exibirAviso(
                    "Informe um CPF válido.",
                    campoCpf
                );

                return;

            }

            if (
                telefone.length !== 10
                &&
                telefone.length !== 11
            ) {

                exibirAviso(
                    "Informe um telefone com DDD.",
                    campoTelefone
                );

                return;

            }

            if (!dataNascimento) {

                exibirAviso(
                    "Informe a data de nascimento.",
                    campoNascimento
                );

                return;

            }

            if (
                dataNascimento >
                obterDataAtualLocal()
            ) {

                exibirAviso(
                    "A data de nascimento não pode estar no futuro.",
                    campoNascimento
                );

                return;

            }

            definirCarregamento(
                true
            );

            try {

                const resposta =
                    await requisicaoApi(
                        `/administracao/funcionarios/${funcionario.id_usuario}/dados`,
                        {
                            method: "PUT",

                            body: JSON.stringify({

                                nome_completo:
                                    nomeCompleto,

                                cpf,

                                telefone,

                                data_nascimento:
                                    dataNascimento

                            })
                        }
                    );

                mostrarMensagemFlutuante(
                    resposta.mensagem
                );

                if (
                    usuarioAtual &&
                    usuarioAtual.id_usuario ===
                    funcionario.id_usuario
                ) {

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

                }

                await consultarFuncionarios();

                await abrirDetalhesFuncionario(
                    funcionario.id_usuario
                );

            } catch (erro) {

                console.error(
                    "Erro ao atualizar dados:",
                    erro
                );

                exibirAviso(
                    erro.message ||
                    "Não foi possível atualizar os dados cadastrais."
                );

                definirCarregamento(
                    false
                );

            }

        }
    );

}


/* =========================================================
   ALTERAÇÃO DA SITUAÇÃO
   ========================================================= */

function configurarEventosSituacao(
    idUsuario,
    novaSituacao
) {

    const botaoPreparar =
        document.getElementById(
            "botao-preparar-situacao"
        );

    const confirmacao =
        document.getElementById(
            "confirmacao-situacao"
        );

    const botaoCancelar =
        document.getElementById(
            "botao-cancelar-situacao"
        );

    const botaoConfirmar =
        document.getElementById(
            "botao-confirmar-situacao"
        );

    const campoObservacao =
        document.getElementById(
            "observacao-situacao"
        );

    botaoPreparar.addEventListener(
        "click",
        () => {

            botaoPreparar.hidden =
                true;

            confirmacao.hidden =
                false;

            campoObservacao.focus();

        }
    );


    botaoCancelar.addEventListener(
        "click",
        () => {

            confirmacao.hidden =
                true;

            botaoPreparar.hidden =
                false;

            campoObservacao.value = "";

        }
    );


    botaoConfirmar.addEventListener(
        "click",
        async () => {

            botaoConfirmar.disabled =
                true;

            botaoCancelar.disabled =
                true;

            try {

                const resposta =
                    await requisicaoApi(
                        `/administracao/funcionarios/${idUsuario}/situacao`,
                        {
                            method: "PUT",

                            body: JSON.stringify({

                                situacao_usuario:
                                    novaSituacao,

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

                await consultarFuncionarios();

                await abrirDetalhesFuncionario(
                    idUsuario
                );

            } catch (erro) {

                console.error(
                    "Erro ao alterar situação:",
                    erro
                );

                mostrarMensagemFlutuante(
                    erro.message ||
                    "Não foi possível alterar a situação da conta.",
                    "erro"
                );

                botaoConfirmar.disabled =
                    false;

                botaoCancelar.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   REDEFINIÇÃO ADMINISTRATIVA DE SENHA
   ========================================================= */

function configurarEventosRedefinicaoSenha(
    idUsuario
) {

    const botaoPreparar =
        document.getElementById(
            "botao-preparar-redefinicao-senha"
        );

    const confirmacao =
        document.getElementById(
            "confirmacao-redefinicao-senha"
        );

    const campoNovaSenha =
        document.getElementById(
            "nova-senha-provisoria"
        );

    const campoConfirmacao =
        document.getElementById(
            "confirmacao-senha-provisoria"
        );

    const aviso =
        document.getElementById(
            "aviso-redefinicao-senha"
        );

    const botaoCancelar =
        document.getElementById(
            "botao-cancelar-redefinicao-senha"
        );

    const botaoConfirmar =
        document.getElementById(
            "botao-confirmar-redefinicao-senha"
        );


    function limparAviso() {

        aviso.hidden = true;

        aviso.textContent = "";

    }


    function exibirAviso(mensagem) {

        aviso.textContent = mensagem;

        aviso.hidden = false;

    }


    function cancelarRedefinicao() {

        confirmacao.hidden = true;

        botaoPreparar.hidden = false;

        campoNovaSenha.value = "";

        campoConfirmacao.value = "";

        limparAviso();

    }


    async function confirmarRedefinicao() {

        if (botaoConfirmar.disabled) {

            return;

        }

        const novaSenha =
            campoNovaSenha.value;

        const confirmacaoNovaSenha =
            campoConfirmacao.value;

        limparAviso();

        if (novaSenha.length < 12) {

            exibirAviso(
                "A senha provisória deve ter pelo menos 12 caracteres."
            );

            campoNovaSenha.focus();

            return;

        }

        if (
            novaSenha !==
            confirmacaoNovaSenha
        ) {

            exibirAviso(
                "A confirmação não corresponde à nova senha."
            );

            campoConfirmacao.focus();

            return;

        }

        botaoConfirmar.disabled = true;

        botaoCancelar.disabled = true;

        campoNovaSenha.disabled = true;

        campoConfirmacao.disabled = true;

        try {

            const resposta =
                await requisicaoApi(
                    `/administracao/funcionarios/${idUsuario}/redefinir-senha`,
                    {
                        method: "PUT",

                        body: JSON.stringify({

                            nova_senha:
                                novaSenha,

                            confirmacao_nova_senha:
                                confirmacaoNovaSenha

                        })
                    }
                );

            mostrarMensagemFlutuante(
                resposta.mensagem
            );

            await consultarFuncionarios();

            await abrirDetalhesFuncionario(
                idUsuario
            );

        } catch (erro) {

            console.error(
                "Erro ao redefinir senha:",
                erro
            );

            exibirAviso(
                erro.message ||
                "Não foi possível redefinir a senha."
            );

            botaoConfirmar.disabled = false;

            botaoCancelar.disabled = false;

            campoNovaSenha.disabled = false;

            campoConfirmacao.disabled = false;

        }

    }


    botaoPreparar.addEventListener(
        "click",
        () => {

            botaoPreparar.hidden = true;

            confirmacao.hidden = false;

            campoNovaSenha.focus();

        }
    );


    botaoCancelar.addEventListener(
        "click",
        cancelarRedefinicao
    );


    botaoConfirmar.addEventListener(
        "click",
        confirmarRedefinicao
    );


    campoConfirmacao.addEventListener(
        "keydown",
        evento => {

            if (evento.key !== "Enter") {

                return;

            }

            evento.preventDefault();

            confirmarRedefinicao();

        }
    );

}


/* =========================================================
   CONSULTA DOS DETALHES
   ========================================================= */

async function abrirDetalhesFuncionario(
    idUsuario
) {

    idFuncionarioAberto =
        idUsuario;

    abrirPainelDetalhes();

    tituloDetalhes.textContent =
        "Carregando...";

    conteudoDetalhes.innerHTML = `

        <div
            class="estado-lista-administracao"
            role="status"
            aria-live="polite"
        >

            <span
                class="carregamento-administracao"
                aria-hidden="true"
            ></span>

            <p>
                Carregando dados e jornadas...
            </p>

        </div>
    `;

    try {

        const resposta =
            await requisicaoApi(
                `/administracao/funcionarios/${idUsuario}`,
                {
                    method: "GET"
                }
            );

        preencherDetalhesFuncionario(
            resposta
        );

    } catch (erro) {

        console.error(
            "Erro ao consultar detalhes:",
            erro
        );

        conteudoDetalhes.innerHTML = `

            <div class="estado-lista-administracao">

                <strong>
                    Não foi possível carregar os detalhes
                </strong>

                <p>
                    ${escaparHtml(
            erro.message ||
            "Ocorreu um erro inesperado."
        )}
                </p>

            </div>
        `;

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

        await consultarFuncionarios();

    } catch (erro) {

        console.error(
            "Erro ao carregar administração:",
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
            "Não foi possível carregar o painel administrativo.",
            "erro"
        );

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

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
                consultarFuncionarios,
                400
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

        consultarFuncionarios();

    }
);


botoesFiltroSituacao.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                botoesFiltroSituacao.forEach(
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

                situacaoSelecionada =
                    botao.dataset.situacao;

                consultarFuncionarios();

            }
        );

    }
);


botaoAtualizarLista.addEventListener(
    "click",
    consultarFuncionarios
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

        await consultarFuncionarios();

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
