/*
 * Tela de perfil do Gestor de Jornadas.
 */


const CAMINHO_ICONES_PERFIL =
    "../icones/bootstrap-icons.svg";


/* =========================================================
   ELEMENTOS DO CABEÇALHO
   ========================================================= */

const nomeUsuarioCabecalho = document.getElementById(
    "nome-usuario-cabecalho"
);

const tipoUsuarioCabecalho = document.getElementById(
    "tipo-usuario-cabecalho"
);

const avatarUsuarioCabecalho = document.getElementById(
    "avatar-usuario-cabecalho"
);

const indicadorConexao = document.getElementById(
    "indicador-conexao"
);

const botaoAdministracao = document.getElementById(
    "botao-administracao"
);


/* =========================================================
   CONTEÚDO DO PERFIL
   ========================================================= */

const estadoCarregamentoPerfil = document.getElementById(
    "estado-carregamento-perfil"
);

const conteudoPerfil = document.getElementById(
    "conteudo-perfil"
);

const avatarPerfil = document.getElementById(
    "avatar-perfil"
);

const nomeCompletoPerfil = document.getElementById(
    "nome-completo-perfil"
);

const tipoContaPerfil = document.getElementById(
    "tipo-conta-perfil"
);

const situacaoContaPerfil = document.getElementById(
    "situacao-conta-perfil"
);

const cpfPerfil = document.getElementById(
    "cpf-perfil"
);

const telefonePerfil = document.getElementById(
    "telefone-perfil"
);

const nascimentoPerfil = document.getElementById(
    "nascimento-perfil"
);

const cadastroPerfil = document.getElementById(
    "cadastro-perfil"
);

const avisoSenhaProvisoria = document.getElementById(
    "aviso-senha-provisoria"
);


/* =========================================================
   FORMULÁRIO DE SENHA
   ========================================================= */

const formularioTrocaSenha = document.getElementById(
    "formulario-troca-senha"
);

const campoSenhaAtual = document.getElementById(
    "senha-atual"
);

const campoNovaSenha = document.getElementById(
    "nova-senha"
);

const campoConfirmacaoNovaSenha = document.getElementById(
    "confirmacao-nova-senha"
);

const botaoAlterarSenha = document.getElementById(
    "botao-alterar-senha"
);

const mensagemTrocaSenha = document.getElementById(
    "mensagem-troca-senha"
);

const botoesVisualizarSenha = document.querySelectorAll(
    "[data-alternar-senha]"
);


/* =========================================================
   OUTROS ELEMENTOS
   ========================================================= */

const botoesSair = document.querySelectorAll(
    "[data-acao-sair]"
);

const botoesPaginasEmConstrucao = document.querySelectorAll(
    ".pagina-em-construcao"
);

const listaSessoesAtivas = document.getElementById(
    "lista-sessoes-ativas"
);

const botaoEncerrarOutrasSessoes =
    document.getElementById(
        "botao-encerrar-outras-sessoes"
    );

const linksNavegacaoProtegida = document.querySelectorAll(
    '.navegacao-principal a:not([href="perfil.html"])'
);

const mensagemFlutuante = document.getElementById(
    "mensagem-flutuante"
);


let perfilAtual = null;

let temporizadorMensagem = null;


/* =========================================================
   FUNÇÕES DE FORMATAÇÃO
   ========================================================= */

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
            month: "long",
            year: "numeric"
        }
    ).format(data);

}


function formatarDataHora(dataIso) {

    if (!dataIso) {

        return "Horário não informado";

    }

    const data = new Date(
        dataIso
    );

    if (Number.isNaN(data.getTime())) {

        return "Horário não informado";

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    ).format(data);

}


function obterTextoTipoUsuario(tipoUsuario) {

    if (
        tipoUsuario ===
        "ADMINISTRADOR"
    ) {

        return "Administrador";

    }

    return "Funcionário";

}


/* =========================================================
   NAVEGAÇÃO E SESSÃO
   ========================================================= */

function voltarParaLogin() {

    window.location.href =
        "../index.html";

}


async function sairDaConta() {

    botoesSair.forEach(
        botao => {

            botao.disabled = true;

        }
    );

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

    botaoAlterarSenha.disabled =
        !conectado;

    botaoEncerrarOutrasSessoes.disabled =
        !conectado;

    listaSessoesAtivas
        .querySelectorAll(
            ".botao-encerrar-sessao"
        )
        .forEach(
            botao => {

                botao.disabled =
                    !conectado;

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
            4000
        );

}


function mostrarMensagemFormulario(
    mensagem,
    tipo
) {

    mensagemTrocaSenha.textContent =
        mensagem;

    mensagemTrocaSenha.className =
        `mensagem-formulario ${tipo} visivel`;

}


function esconderMensagemFormulario() {

    mensagemTrocaSenha.textContent = "";

    mensagemTrocaSenha.className =
        "mensagem-formulario";

}


function atualizarBloqueioNavegacao(bloquear) {

    linksNavegacaoProtegida.forEach(
        link => {

            link.classList.toggle(
                "item-navegacao--bloqueado-senha",
                bloquear
            );

            if (bloquear) {

                link.setAttribute(
                    "aria-disabled",
                    "true"
                );

                return;

            }

            link.removeAttribute(
                "aria-disabled"
            );

        }
    );

}


/* =========================================================
   APARELHOS CONECTADOS
   ========================================================= */

function criarCartaoSessaoAtiva(sessao) {

    const cartao =
        document.createElement(
            "article"
        );

    cartao.className =
        "sessao-ativa-perfil";

    if (sessao.sessao_atual) {

        cartao.classList.add(
            "sessao-ativa-perfil--atual"
        );

    }

    const icone =
        document.createElement(
            "span"
        );

    icone.className =
        "sessao-ativa-perfil__icone";

    icone.setAttribute(
        "aria-hidden",
        "true"
    );

    icone.innerHTML = `
        <svg class="icone-sistema" focusable="false">
            <use href="${CAMINHO_ICONES_PERFIL}#display"></use>
        </svg>
    `;

    const dados =
        document.createElement(
            "div"
        );

    dados.className =
        "sessao-ativa-perfil__dados";

    const titulo =
        document.createElement(
            "div"
        );

    titulo.className =
        "sessao-ativa-perfil__titulo";

    const descricao =
        document.createElement(
            "strong"
        );

    descricao.textContent =
        sessao.descricao_aparelho ||
        "Aparelho não identificado";

    titulo.appendChild(
        descricao
    );

    if (sessao.sessao_atual) {

        const etiqueta =
            document.createElement(
                "span"
            );

        etiqueta.className =
            "etiqueta-sessao-atual";

        etiqueta.textContent =
            "Este aparelho";

        titulo.appendChild(
            etiqueta
        );

    }

    const ultimoAcesso =
        document.createElement(
            "p"
        );

    ultimoAcesso.textContent =
        (
            "Último acesso: " +
            formatarDataHora(
                sessao.ultimo_acesso
            )
        );

    dados.append(
        titulo,
        ultimoAcesso
    );

    cartao.append(
        icone,
        dados
    );

    if (!sessao.sessao_atual) {

        const botao =
            document.createElement(
                "button"
            );

        botao.type =
            "button";

        botao.className =
            "botao-encerrar-sessao";

        botao.textContent =
            "Encerrar acesso";

        botao.disabled =
            !navigator.onLine;

        botao.addEventListener(
            "click",
            () => {

                encerrarSessaoAtiva(
                    sessao.id_sessao,
                    botao
                );

            }
        );

        cartao.appendChild(
            botao
        );

    }

    return cartao;

}


function preencherSessoesAtivas(sessoes) {

    listaSessoesAtivas.replaceChildren();

    if (!sessoes.length) {

        const estado =
            document.createElement(
                "p"
            );

        estado.className =
            "estado-sessoes-perfil";

        estado.textContent =
            "Nenhum aparelho conectado foi encontrado.";

        listaSessoesAtivas.appendChild(
            estado
        );

        botaoEncerrarOutrasSessoes.hidden =
            true;

        return;

    }

    sessoes.forEach(
        sessao => {

            listaSessoesAtivas.appendChild(
                criarCartaoSessaoAtiva(
                    sessao
                )
            );

        }
    );

    botaoEncerrarOutrasSessoes.hidden =
        !sessoes.some(
            sessao =>
                !sessao.sessao_atual
        );

}


async function carregarSessoesAtivas() {

    try {

        const resposta =
            await requisicaoApi(
                "/autenticacao/sessoes",
                {
                    method: "GET"
                }
            );

        preencherSessoesAtivas(
            resposta.sessoes || []
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar sessões:",
            erro
        );

        if (erro.status === 401) {

            limparSessao();
            voltarParaLogin();

            return;

        }

        listaSessoesAtivas.innerHTML = `
            <p class="estado-sessoes-perfil estado-sessoes-perfil--erro">
                Não foi possível consultar os aparelhos conectados.
            </p>
        `;

        botaoEncerrarOutrasSessoes.hidden =
            true;

    }

}


async function encerrarSessaoAtiva(
    idSessao,
    botao
) {

    botao.disabled = true;

    const textoOriginal =
        botao.textContent;

    botao.textContent =
        "Encerrando...";

    try {

        const resposta =
            await requisicaoApi(
                `/autenticacao/sessoes/${idSessao}`,
                {
                    method: "DELETE"
                }
            );

        mostrarMensagemFlutuante(
            resposta.mensagem
        );

        await carregarSessoesAtivas();

    } catch (erro) {

        console.error(
            "Erro ao encerrar acesso:",
            erro
        );

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível encerrar este acesso.",
            "erro"
        );

    } finally {

        botao.disabled =
            !navigator.onLine;

        botao.textContent =
            textoOriginal;

    }

}


async function encerrarOutrasSessoes() {

    botaoEncerrarOutrasSessoes.disabled =
        true;

    const textoOriginal =
        botaoEncerrarOutrasSessoes
            .textContent;

    botaoEncerrarOutrasSessoes.textContent =
        "Encerrando...";

    try {

        const resposta =
            await requisicaoApi(
                "/autenticacao/outras-sessoes",
                {
                    method: "DELETE"
                }
            );

        mostrarMensagemFlutuante(
            resposta.mensagem
        );

        await carregarSessoesAtivas();

    } catch (erro) {

        console.error(
            "Erro ao encerrar outros acessos:",
            erro
        );

        mostrarMensagemFlutuante(
            erro.message ||
            "Não foi possível encerrar os outros acessos.",
            "erro"
        );

    } finally {

        botaoEncerrarOutrasSessoes.disabled =
            !navigator.onLine;

        botaoEncerrarOutrasSessoes
            .textContent =
                textoOriginal;

    }

}


/* =========================================================
   PREENCHER PERFIL
   ========================================================= */

function preencherPerfil(perfil) {

    perfilAtual = perfil;

    const iniciais =
        obterIniciaisNome(
            perfil.nome_completo
        );

    nomeUsuarioCabecalho.textContent =
        perfil.nome_completo;

    tipoUsuarioCabecalho.textContent =
        obterTextoTipoUsuario(
            perfil.tipo_usuario
        );

    avatarUsuarioCabecalho.textContent =
        iniciais;

    avatarPerfil.textContent =
        iniciais;

    nomeCompletoPerfil.textContent =
        perfil.nome_completo;

    tipoContaPerfil.textContent =
        obterTextoTipoUsuario(
            perfil.tipo_usuario
        );

    situacaoContaPerfil.textContent =
        perfil.situacao_usuario === "ATIVO"
            ? "Conta ativa"
            : "Conta inativa";

    situacaoContaPerfil.classList.toggle(
        "etiqueta-perfil--ativa",
        perfil.situacao_usuario === "ATIVO"
    );

    situacaoContaPerfil.classList.toggle(
        "etiqueta-perfil--inativa",
        perfil.situacao_usuario !== "ATIVO"
    );

    cpfPerfil.textContent =
        formatarCpf(
            perfil.cpf
        );

    telefonePerfil.textContent =
        formatarTelefone(
            perfil.telefone
        );

    nascimentoPerfil.textContent =
        formatarData(
            perfil.data_nascimento
        );

    cadastroPerfil.textContent =
        formatarData(
            perfil.data_cadastro
        );

    avisoSenhaProvisoria.hidden =
        !perfil.precisa_trocar_senha;

    atualizarBloqueioNavegacao(
        perfil.precisa_trocar_senha
    );

    botaoAdministracao.hidden =
        perfil.tipo_usuario !==
        "ADMINISTRADOR";

}


/* =========================================================
   CARREGAR PERFIL
   ========================================================= */

async function carregarPerfil() {

    if (!usuarioEstaAutenticado()) {

        voltarParaLogin();

        return;

    }

    estadoCarregamentoPerfil.classList.remove(
        "estado-carregamento-perfil--erro"
    );

    estadoCarregamentoPerfil.setAttribute(
        "aria-busy",
        "true"
    );

    try {

        const resposta =
            await requisicaoApi(
                "/autenticacao/perfil",
                {
                    method: "GET"
                }
            );

        preencherPerfil(
            resposta.perfil
        );

        const usuarioSalvo =
            obterUsuarioSalvo() || {};

        const usuarioAtualizado = {
            ...usuarioSalvo,

            id_usuario:
                resposta.perfil.id_usuario,

            nome_completo:
                resposta.perfil.nome_completo,

            tipo_usuario:
                resposta.perfil.tipo_usuario,

            precisa_trocar_senha:
                resposta.perfil.precisa_trocar_senha
        };

        localStorage.setItem(
            CHAVES_SESSAO.USUARIO,
            JSON.stringify(
                usuarioAtualizado
            )
        );

        estadoCarregamentoPerfil.hidden =
            true;

        estadoCarregamentoPerfil.setAttribute(
            "aria-busy",
            "false"
        );

        conteudoPerfil.hidden =
            false;

    } catch (erro) {

        console.error(
            "Erro ao carregar perfil:",
            erro
        );

        if (erro.status === 401) {

            limparSessao();

            voltarParaLogin();

            return;

        }

        estadoCarregamentoPerfil.classList.add(
            "estado-carregamento-perfil--erro"
        );

        estadoCarregamentoPerfil.setAttribute(
            "aria-busy",
            "false"
        );

        const tituloErro =
            document.createElement(
                "strong"
            );

        tituloErro.textContent =
            "Não foi possível carregar o perfil";

        const descricaoErro =
            document.createElement(
                "p"
            );

        descricaoErro.textContent =
            erro.message ||
            "Tente novamente em alguns instantes.";

        estadoCarregamentoPerfil.replaceChildren(
            tituloErro,
            descricaoErro
        );

    }

}


/* =========================================================
   VISIBILIDADE DAS SENHAS
   ========================================================= */

botoesVisualizarSenha.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                const idCampo =
                    botao.dataset
                        .alternarSenha;

                const campo =
                    document.getElementById(
                        idCampo
                    );

                const estaVisivel =
                    campo.type === "text";

                campo.type =
                    estaVisivel
                        ? "password"
                        : "text";

                const textoBotao =
                    botao.querySelector(
                        "[data-texto-visualizar-senha]"
                    );

                const iconeBotao =
                    botao.querySelector(
                        "[data-icone-senha]"
                    );

                const vaiFicarVisivel =
                    !estaVisivel;

                textoBotao.textContent =
                    estaVisivel
                        ? "Mostrar"
                        : "Ocultar";

                iconeBotao.setAttribute(
                    "href",
                    (
                        CAMINHO_ICONES_PERFIL +
                        (
                            estaVisivel
                                ? "#eye-fill"
                                : "#eye-slash-fill"
                        )
                    )
                );

                botao.setAttribute(
                    "aria-pressed",
                    String(
                        vaiFicarVisivel
                    )
                );

                const nomeCampo =
                    campo.labels?.[0]
                        ?.textContent
                        ?.trim()
                        ?.toLowerCase() ||
                    "senha";

                botao.setAttribute(
                    "aria-label",
                    (
                        estaVisivel
                            ? "Mostrar "
                            : "Ocultar "
                    ) +
                    nomeCampo
                );

            }
        );

    }
);


/* =========================================================
   VALIDAÇÃO DA TROCA DE SENHA
   ========================================================= */

function limparCamposInvalidos() {

    [
        campoSenhaAtual,
        campoNovaSenha,
        campoConfirmacaoNovaSenha
    ].forEach(
        campo => {

            campo.classList.remove(
                "input-invalido"
            );

        }
    );

}


function marcarCampoInvalido(campo) {

    campo.classList.add(
        "input-invalido"
    );

    campo.focus();

}


function validarTrocaSenha() {

    esconderMensagemFormulario();

    limparCamposInvalidos();

    const senhaAtual =
        campoSenhaAtual.value;

    const novaSenha =
        campoNovaSenha.value;

    const confirmacao =
        campoConfirmacaoNovaSenha.value;

    if (senhaAtual.length < 6) {

        mostrarMensagemFormulario(
            "Informe corretamente sua senha atual.",
            "erro"
        );

        marcarCampoInvalido(
            campoSenhaAtual
        );

        return false;

    }

    if (novaSenha.length < 12) {

        mostrarMensagemFormulario(
            "A nova senha precisa ter pelo menos 12 caracteres.",
            "erro"
        );

        marcarCampoInvalido(
            campoNovaSenha
        );

        return false;

    }

    if (novaSenha === senhaAtual) {

        mostrarMensagemFormulario(
            "A nova senha deve ser diferente da senha atual.",
            "erro"
        );

        marcarCampoInvalido(
            campoNovaSenha
        );

        return false;

    }

    if (novaSenha !== confirmacao) {

        mostrarMensagemFormulario(
            "A confirmação não corresponde à nova senha.",
            "erro"
        );

        marcarCampoInvalido(
            campoConfirmacaoNovaSenha
        );

        return false;

    }

    return true;

}


/* =========================================================
   ALTERAR SENHA
   ========================================================= */

function definirCarregamentoSenha(
    carregando
) {

    botaoAlterarSenha.disabled =
        carregando ||
        !navigator.onLine;

    botaoAlterarSenha.classList.toggle(
        "carregando",
        carregando
    );

}


async function alterarSenha(evento) {

    evento.preventDefault();

    if (!validarTrocaSenha()) {

        return;

    }

    definirCarregamentoSenha(true);

    try {

        const resposta =
            await requisicaoApi(
                "/autenticacao/trocar-senha",
                {
                    method: "PUT",

                    body: JSON.stringify({

                        senha_atual:
                            campoSenhaAtual.value,

                        nova_senha:
                            campoNovaSenha.value,

                        confirmacao_nova_senha:
                            campoConfirmacaoNovaSenha.value

                    })
                }
            );

        mostrarMensagemFormulario(
            resposta.mensagem,
            "sucesso"
        );

        mostrarMensagemFlutuante(
            "Sua senha foi alterada com sucesso!"
        );

        formularioTrocaSenha.reset();

        botoesVisualizarSenha.forEach(
            botao => {

                const campo =
                    document.getElementById(
                        botao.dataset
                            .alternarSenha
                    );

                const textoBotao =
                    botao.querySelector(
                        "[data-texto-visualizar-senha]"
                    );

                const iconeBotao =
                    botao.querySelector(
                        "[data-icone-senha]"
                    );

                campo.type =
                    "password";

                textoBotao.textContent =
                    "Mostrar";

                iconeBotao.setAttribute(
                    "href",
                    (
                        CAMINHO_ICONES_PERFIL +
                        "#eye-fill"
                    )
                );

                botao.setAttribute(
                    "aria-pressed",
                    "false"
                );

                const nomeCampo =
                    campo.labels?.[0]
                        ?.textContent
                        ?.trim()
                        ?.toLowerCase() ||
                    "senha";

                botao.setAttribute(
                    "aria-label",
                    "Mostrar " + nomeCampo
                );

            }
        );

        limparCamposInvalidos();

        avisoSenhaProvisoria.hidden =
            true;

        atualizarBloqueioNavegacao(
            false
        );

        if (perfilAtual) {

            perfilAtual.precisa_trocar_senha =
                false;

        }

        const usuarioSalvo =
            obterUsuarioSalvo();

        if (usuarioSalvo) {

            usuarioSalvo.precisa_trocar_senha =
                false;

            localStorage.setItem(
                CHAVES_SESSAO.USUARIO,
                JSON.stringify(
                    usuarioSalvo
                )
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao trocar senha:",
            erro
        );

        mostrarMensagemFormulario(
            erro.message ||
            "Não foi possível alterar a senha.",
            "erro"
        );

    } finally {

        definirCarregamentoSenha(false);

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

formularioTrocaSenha.addEventListener(
    "submit",
    alterarSenha
);


[
    campoSenhaAtual,
    campoNovaSenha,
    campoConfirmacaoNovaSenha
].forEach(
    campo => {

        campo.addEventListener(
            "input",
            () => {

                campo.classList.remove(
                    "input-invalido"
                );

                esconderMensagemFormulario();

            }
        );

    }
);


botoesSair.forEach(
    botao => {

        botao.addEventListener(
            "click",
            sairDaConta
        );

    }
);


botoesPaginasEmConstrucao.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                mostrarMensagemFlutuante(
                    `A página ${botao.dataset.pagina} será criada nas próximas etapas.`
                );

            }
        );

    }
);


botaoEncerrarOutrasSessoes.addEventListener(
    "click",
    encerrarOutrasSessoes
);


linksNavegacaoProtegida.forEach(
    link => {

        link.addEventListener(
            "click",
            evento => {

                if (
                    !perfilAtual
                    ?.precisa_trocar_senha
                ) {

                    return;

                }

                evento.preventDefault();

                mostrarMensagemFlutuante(
                    "Altere a senha provisória para liberar as outras áreas.",
                    "erro"
                );

                formularioTrocaSenha.scrollIntoView({
                    block: "center"
                });

                campoSenhaAtual.focus({
                    preventScroll: true
                });

            }
        );

    }
);


window.addEventListener(
    "online",
    atualizarEstadoConexao
);


window.addEventListener(
    "offline",
    atualizarEstadoConexao
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

atualizarEstadoConexao();

carregarPerfil();

carregarSessoesAtivas();
