/*
 * Comportamento da solicitação pública de acesso.
 */

const formularioCadastro = document.getElementById(
    "formulario-cadastro"
);

const cabecalhoCadastro = document.getElementById(
    "cabecalho-cadastro"
);

const campoNomeCompleto = document.getElementById(
    "nome-completo"
);

const campoCpfCadastro = document.getElementById(
    "cpf-cadastro"
);

const campoTelefone = document.getElementById(
    "telefone"
);

const campoDataNascimento = document.getElementById(
    "data-nascimento"
);

const campoSenhaCadastro = document.getElementById(
    "senha-cadastro"
);

const campoConfirmacaoSenha = document.getElementById(
    "confirmacao-senha"
);

const botaoEnviarCadastro = document.getElementById(
    "botao-enviar-cadastro"
);

const mensagemCadastro = document.getElementById(
    "mensagem-cadastro"
);

const cadastroConcluido = document.getElementById(
    "cadastro-concluido"
);

const mensagemCadastroConcluido = document.getElementById(
    "mensagem-cadastro-concluido"
);


function somenteNumeros(valor) {

    return valor.replace(/\D/g, "");

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


function formatarCpf(valor) {

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


function formatarTelefone(valor) {

    const numeros = somenteNumeros(valor)
        .slice(0, 11);

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

    const cpf = somenteNumeros(valor);

    if (
        cpf.length !== 11 ||
        /^(\d)\1{10}$/.test(cpf)
    ) {

        return false;

    }

    const calcularDigito = quantidade => {

        let soma = 0;

        for (
            let indice = 0;
            indice < quantidade;
            indice += 1
        ) {

            soma +=
                Number(cpf[indice]) *
                (quantidade + 1 - indice);

        }

        const resto = soma % 11;

        return resto < 2
            ? 0
            : 11 - resto;

    };

    return (
        calcularDigito(9) === Number(cpf[9]) &&
        calcularDigito(10) === Number(cpf[10])
    );

}


function mostrarMensagem(
    mensagem,
    tipo = "erro"
) {

    mensagemCadastro.textContent = mensagem;

    mensagemCadastro.className =
        `mensagem-formulario campo-formulario--completo visivel ${tipo}`;

}


function esconderMensagem() {

    mensagemCadastro.textContent = "";

    mensagemCadastro.className =
        "mensagem-formulario campo-formulario--completo";

}


function marcarCampoInvalido(
    campo,
    mensagem
) {

    campo.classList.add(
        "input-invalido"
    );

    mostrarMensagem(
        mensagem
    );

    campo.focus();

    return false;

}


function limparCampoInvalido(campo) {

    campo.classList.remove(
        "input-invalido"
    );

    esconderMensagem();

}


function definirCarregamento(carregando) {

    botaoEnviarCadastro.disabled = carregando;

    botaoEnviarCadastro.classList.toggle(
        "carregando",
        carregando
    );

    formularioCadastro.setAttribute(
        "aria-busy",
        String(carregando)
    );

}


function validarFormularioCadastro() {

    const nomeCompleto =
        campoNomeCompleto.value
            .trim()
            .replace(/\s+/g, " ");

    const telefone =
        somenteNumeros(
            campoTelefone.value
        );

    const hoje =
        obterDataAtualLocal();

    [
        campoNomeCompleto,
        campoCpfCadastro,
        campoTelefone,
        campoDataNascimento,
        campoSenhaCadastro,
        campoConfirmacaoSenha
    ].forEach(
        campo => campo.classList.remove(
            "input-invalido"
        )
    );

    if (nomeCompleto.length < 3) {

        return marcarCampoInvalido(
            campoNomeCompleto,
            "Informe seu nome completo."
        );

    }

    if (!cpfValido(campoCpfCadastro.value)) {

        return marcarCampoInvalido(
            campoCpfCadastro,
            "Informe um CPF válido."
        );

    }

    if (
        telefone.length !== 10 &&
        telefone.length !== 11
    ) {

        return marcarCampoInvalido(
            campoTelefone,
            "Informe um telefone com DDD."
        );

    }

    if (!campoDataNascimento.value) {

        return marcarCampoInvalido(
            campoDataNascimento,
            "Informe sua data de nascimento."
        );

    }

    if (campoDataNascimento.value > hoje) {

        return marcarCampoInvalido(
            campoDataNascimento,
            "A data de nascimento não pode estar no futuro."
        );

    }

    if (campoSenhaCadastro.value.length < 12) {

        return marcarCampoInvalido(
            campoSenhaCadastro,
            "A senha precisa ter pelo menos 12 caracteres."
        );

    }

    if (
        campoConfirmacaoSenha.value !==
        campoSenhaCadastro.value
    ) {

        return marcarCampoInvalido(
            campoConfirmacaoSenha,
            "As senhas informadas não são iguais."
        );

    }

    campoNomeCompleto.value = nomeCompleto;

    return true;

}


function exibirCadastroConcluido(mensagem) {

    formularioCadastro.hidden = true;
    cabecalhoCadastro.hidden = true;

    mensagemCadastroConcluido.textContent =
        mensagem ||
        "Seu pedido foi enviado para análise do administrador.";

    cadastroConcluido.hidden = false;
    cadastroConcluido.focus();

}


campoCpfCadastro.addEventListener(
    "input",
    evento => {

        evento.target.value =
            formatarCpf(
                evento.target.value
            );

        limparCampoInvalido(
            evento.target
        );

    }
);


campoTelefone.addEventListener(
    "input",
    evento => {

        evento.target.value =
            formatarTelefone(
                evento.target.value
            );

        limparCampoInvalido(
            evento.target
        );

    }
);


[
    campoNomeCompleto,
    campoDataNascimento,
    campoSenhaCadastro,
    campoConfirmacaoSenha
].forEach(
    campo => campo.addEventListener(
        "input",
        () => limparCampoInvalido(campo)
    )
);


document.querySelectorAll(
    "[data-alternar-senha]"
).forEach(
    botao => botao.addEventListener(
        "click",
        () => {

            const campo = document.getElementById(
                botao.dataset.alternarSenha
            );

            const senhaEstaVisivel =
                campo.type === "text";

            campo.type =
                senhaEstaVisivel
                    ? "password"
                    : "text";

            botao.querySelector("span").textContent =
                senhaEstaVisivel
                    ? "Mostrar"
                    : "Ocultar";

            botao.querySelector("use").setAttribute(
                "href",
                senhaEstaVisivel
                    ? "icones/bootstrap-icons.svg#eye-fill"
                    : "icones/bootstrap-icons.svg#eye-slash-fill"
            );

            botao.setAttribute(
                "aria-label",
                senhaEstaVisivel
                    ? "Mostrar senha"
                    : "Ocultar senha"
            );

        }
    )
);


formularioCadastro.addEventListener(
    "submit",
    async evento => {

        evento.preventDefault();

        esconderMensagem();

        if (!validarFormularioCadastro()) {

            return;

        }

        definirCarregamento(true);

        try {

            const resposta =
                await requisicaoApi(
                    "/solicitacoes-cadastro",
                    {
                        method: "POST",

                        body: JSON.stringify({

                            nome_completo:
                                campoNomeCompleto.value,

                            cpf:
                                somenteNumeros(
                                    campoCpfCadastro.value
                                ),

                            telefone:
                                somenteNumeros(
                                    campoTelefone.value
                                ),

                            data_nascimento:
                                campoDataNascimento.value,

                            senha:
                                campoSenhaCadastro.value

                        })
                    }
                );

            exibirCadastroConcluido(
                resposta?.mensagem
            );

        } catch (erro) {

            console.error(
                "Erro ao solicitar acesso:",
                erro
            );

            mostrarMensagem(
                erro.message ||
                "Não foi possível enviar a solicitação."
            );

        } finally {

            definirCarregamento(false);

        }

    }
);


campoDataNascimento.max =
    obterDataAtualLocal();
