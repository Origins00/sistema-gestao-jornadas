/*
 * Comportamento da tela de login.
 */


const formularioLogin = document.getElementById(
    "formulario-login"
);

const campoCpf = document.getElementById(
    "cpf"
);

const campoSenha = document.getElementById(
    "senha"
);

const botaoEntrar = document.getElementById(
    "botao-entrar"
);

const botaoMostrarSenha = document.getElementById(
    "botao-mostrar-senha"
);

const mensagemLogin = document.getElementById(
    "mensagem-login"
);

const MENSAGEM_LOGIN_SEM_CONEXAO =
    "Conecte o aparelho à internet para entrar nesta conta.";


function limparNumeroCpf(cpf) {

    return cpf.replace(/\D/g, "");

}


function formatarCpf(cpf) {

    const numeros = limparNumeroCpf(cpf)
        .slice(0, 11);

    return numeros
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


function mostrarMensagem(
    mensagem,
    tipo
) {

    mensagemLogin.textContent = mensagem;

    mensagemLogin.className =
        `mensagem-formulario visivel ${tipo}`;

}


function esconderMensagem() {

    mensagemLogin.textContent = "";

    mensagemLogin.className =
        "mensagem-formulario";

}


function definirCarregamento(
    carregando
) {

    botaoEntrar.disabled =
        carregando || !navigator.onLine;

    botaoEntrar.classList.toggle(
        "carregando",
        carregando
    );

}


function atualizarDisponibilidadeLogin() {

    if (!navigator.onLine) {

        botaoEntrar.disabled = true;

        mostrarMensagem(
            MENSAGEM_LOGIN_SEM_CONEXAO,
            "erro"
        );

        return;

    }

    botaoEntrar.disabled = false;

    if (
        mensagemLogin.textContent ===
        MENSAGEM_LOGIN_SEM_CONEXAO
    ) {
        esconderMensagem();
    }

}


function obterDescricaoAparelho() {

    const plataforma =
        navigator.userAgentData?.platform ||
        navigator.platform ||
        "Aparelho desconhecido";

    const descricao =
        `${plataforma} - Navegador web`;

    return descricao.slice(0, 255);

}


function validarFormulario() {

    const cpfLimpo = limparNumeroCpf(
        campoCpf.value
    );

    campoCpf.classList.remove(
        "input-invalido"
    );

    campoSenha.classList.remove(
        "input-invalido"
    );

    if (cpfLimpo.length !== 11) {

        campoCpf.classList.add(
            "input-invalido"
        );

        mostrarMensagem(
            "Informe um CPF com 11 números.",
            "erro"
        );

        campoCpf.focus();

        return false;

    }

    if (campoSenha.value.length < 6) {

        campoSenha.classList.add(
            "input-invalido"
        );

        mostrarMensagem(
            "A senha precisa ter pelo menos 6 caracteres.",
            "erro"
        );

        campoSenha.focus();

        return false;

    }

    return true;

}


campoCpf.addEventListener(
    "input",
    evento => {

        evento.target.value = formatarCpf(
            evento.target.value
        );

        evento.target.classList.remove(
            "input-invalido"
        );

        esconderMensagem();

    }
);


campoSenha.addEventListener(
    "input",
    () => {

        campoSenha.classList.remove(
            "input-invalido"
        );

        esconderMensagem();

    }
);


botaoMostrarSenha.addEventListener(
    "click",
    () => {

        const senhaEstaVisivel =
            campoSenha.type === "text";

        campoSenha.type =
            senhaEstaVisivel
                ? "password"
                : "text";

        botaoMostrarSenha.textContent =
            senhaEstaVisivel
                ? "Mostrar"
                : "Ocultar";

        botaoMostrarSenha.setAttribute(
            "aria-label",
            senhaEstaVisivel
                ? "Mostrar senha"
                : "Ocultar senha"
        );

    }
);


formularioLogin.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();

        esconderMensagem();

        if (!validarFormulario()) {

            return;

        }

        definirCarregamento(true);

        try {

            const dadosLogin = await requisicaoApi(
                "/autenticacao/login",
                {
                    method: "POST",

                    body: JSON.stringify({

                        cpf: limparNumeroCpf(
                            campoCpf.value
                        ),

                        senha: campoSenha.value,

                        descricao_aparelho:
                            obterDescricaoAparelho()

                    })
                }
            );

            salvarSessao(dadosLogin);

            mostrarMensagem(
                "Login realizado com sucesso!",
                "sucesso"
            );

            window.setTimeout(
                () => {

                    const caminhoDestino =
                        dadosLogin.usuario
                            .precisa_trocar_senha
                            ? "paginas/perfil.html"
                            : "paginas/inicio.html";

                    window.location.href = new URL(
                        caminhoDestino,
                        `${CONFIGURACAO.URL_API}/`
                    ).href;

                },
                CONFIGURACAO
                    .TEMPO_REDIRECIONAMENTO
            );

        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );

            mostrarMensagem(
                erro.message ||
                "Não foi possível realizar o login.",
                "erro"
            );

        } finally {

            definirCarregamento(false);

        }

    }
);


window.addEventListener(
    "online",
    atualizarDisponibilidadeLogin
);


window.addEventListener(
    "offline",
    atualizarDisponibilidadeLogin
);


atualizarDisponibilidadeLogin();
