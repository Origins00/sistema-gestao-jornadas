from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status
)
from mysql.connector import Error

from modelos.autenticacao import (
    LoginEntrada,
    TrocaSenhaEntrada
)
from servicos.servico_autenticacao import (
    autenticar_usuario,
    buscar_perfil_usuario,
    encerrar_sessao,
    encerrar_sessao_usuario_por_id,
    encerrar_outras_sessoes_usuario,
    listar_sessoes_ativas_usuario,
    trocar_senha_usuario
)
from utilitarios.dependencias_autenticacao import (
    obter_usuario_conectado
)
from utilitarios.limitador_requisicoes import (
    LimitadorJanela,
    anonimizar_identificador,
    identificar_cliente
)
from utilitarios.seguranca_csrf import (
    definir_cookie_csrf,
    definir_cookie_sessao,
    gerar_token_csrf,
    remover_cookies_sessao
)


roteador = APIRouter(
    prefix="/autenticacao",
    tags=["Autenticação"]
)

limitador_login_conta = LimitadorJanela(
    limite=5,
    janela_segundos=15 * 60
)
limitador_login_cliente = LimitadorJanela(
    limite=30,
    janela_segundos=15 * 60
)


def bloquear_tentativas_excessivas(segundos: int) -> None:
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=(
            "Muitas tentativas foram realizadas. "
            "Aguarde alguns minutos e tente novamente."
        ),
        headers={"Retry-After": str(segundos)}
    )


@roteador.get("/csrf")
def preparar_protecao_csrf(
    requisicao: Request,
    resposta: Response
):
    """Cria o token exigido antes de operações que alteram dados."""

    token_csrf = gerar_token_csrf()
    definir_cookie_csrf(
        resposta,
        requisicao,
        token_csrf
    )

    return {"token_csrf": token_csrf}


@roteador.post("/login")
def realizar_login(
    dados: LoginEntrada,
    requisicao: Request,
    resposta: Response
):
    """
    Confere CPF e senha e cria uma sessão persistente.
    """

    try:
        chave_conta = anonimizar_identificador(
            dados.cpf
        )
        chave_cliente = identificar_cliente(
            requisicao
        )

        bloqueio_atual = max(
            limitador_login_conta.tempo_bloqueio(
                chave_conta
            ),
            limitador_login_cliente.tempo_bloqueio(
                chave_cliente
            )
        )

        if bloqueio_atual:
            bloquear_tentativas_excessivas(
                bloqueio_atual
            )

        resultado = autenticar_usuario(dados)

        if not resultado["sucesso"]:
            novo_bloqueio = max(
                limitador_login_conta.registrar(
                    chave_conta
                ),
                limitador_login_cliente.registrar(
                    chave_cliente
                )
            )

            if novo_bloqueio:
                bloquear_tentativas_excessivas(
                    novo_bloqueio
                )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="CPF ou senha incorretos."
            )

        limitador_login_conta.liberar(
            chave_conta
        )

        definir_cookie_sessao(
            resposta,
            requisicao,
            resultado["token_sessao"]
        )

        return {
            "mensagem": "Login realizado com sucesso!",
            "usuario": resultado["usuario"]
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao realizar login: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível realizar o login."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao realizar login: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get("/me")
def consultar_usuario_conectado(
    usuario=Depends(obter_usuario_conectado)
):
    """
    Devolve um resumo do usuário relacionado ao token.
    """

    data_nascimento = usuario["data_nascimento"]

    return {
        "id_usuario": usuario["id_usuario"],
        "nome_completo": usuario["nome_completo"],
        "telefone": usuario["telefone"],
        "data_nascimento": (
            data_nascimento.isoformat()
            if data_nascimento is not None
            else None
        ),
        "foto_perfil": usuario["foto_perfil"],
        "tipo_usuario": usuario["tipo_usuario"],
        "situacao_usuario": usuario["situacao_usuario"],
        "precisa_trocar_senha": bool(
            usuario["precisa_trocar_senha"]
        )
    }


@roteador.get("/perfil")
def consultar_perfil(
    usuario=Depends(obter_usuario_conectado)
):
    """
    Consulta os dados completos do perfil do usuário conectado.
    """

    try:
        perfil = buscar_perfil_usuario(
            id_usuario=usuario["id_usuario"]
        )

        if perfil is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado."
            )

        data_nascimento = perfil["data_nascimento"]
        data_cadastro = perfil["data_cadastro"]
        data_atualizacao = perfil["data_atualizacao"]

        return {
            "perfil": {
                "id_usuario": perfil["id_usuario"],
                "nome_completo": perfil["nome_completo"],
                "cpf": perfil["cpf"],
                "telefone": perfil["telefone"],
                "data_nascimento": (
                    data_nascimento.isoformat()
                    if data_nascimento is not None
                    else None
                ),
                "foto_perfil": perfil["foto_perfil"],
                "tipo_usuario": perfil["tipo_usuario"],
                "situacao_usuario": (
                    perfil["situacao_usuario"]
                ),
                "precisa_trocar_senha": bool(
                    perfil["precisa_trocar_senha"]
                ),
                "data_cadastro": (
                    data_cadastro.isoformat()
                    if data_cadastro is not None
                    else None
                ),
                "data_atualizacao": (
                    data_atualizacao.isoformat()
                    if data_atualizacao is not None
                    else None
                )
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao consultar perfil: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível consultar o perfil."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao consultar perfil: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get("/sessoes")
def consultar_sessoes_ativas(
    usuario=Depends(obter_usuario_conectado)
):
    """
    Lista as sessões ativas da conta e identifica o aparelho atual.
    """

    try:
        sessoes = listar_sessoes_ativas_usuario(
            id_usuario=usuario["id_usuario"]
        )

        return {
            "sessoes": [
                {
                    "id_sessao": sessao["id_sessao"],
                    "descricao_aparelho": (
                        sessao["descricao_aparelho"]
                        or "Aparelho não identificado"
                    ),
                    "data_criacao": (
                        sessao["data_criacao"].isoformat()
                        if sessao["data_criacao"] is not None
                        else None
                    ),
                    "ultimo_acesso": (
                        sessao["ultimo_acesso"].isoformat()
                        if sessao["ultimo_acesso"] is not None
                        else None
                    ),
                    "sessao_atual": (
                        sessao["id_sessao"]
                        == usuario["id_sessao"]
                    )
                }
                for sessao in sessoes
            ]
        }

    except Error as erro:
        print(f"Erro ao consultar sessões: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível consultar as sessões."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao consultar sessões: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.delete("/sessoes/{id_sessao}")
def remover_sessao_ativa(
    id_sessao: int,
    usuario=Depends(obter_usuario_conectado)
):
    """
    Encerra uma sessão específica pertencente ao usuário.
    """

    try:
        resultado = encerrar_sessao_usuario_por_id(
            id_usuario=usuario["id_usuario"],
            id_sessao=id_sessao,
            id_sessao_atual=usuario["id_sessao"]
        )

        if not resultado["sucesso"]:
            if resultado["motivo"] == "SESSAO_ATUAL":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Use a opção Sair da conta para "
                        "encerrar este aparelho."
                    )
                )

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Esta sessão não está mais ativa."
            )

        return {
            "mensagem": "Acesso encerrado com sucesso."
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao encerrar sessão: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível encerrar este acesso."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao encerrar sessão: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.delete("/outras-sessoes")
def remover_outras_sessoes(
    usuario=Depends(obter_usuario_conectado)
):
    """
    Encerra todos os acessos da conta, exceto o aparelho atual.
    """

    try:
        quantidade = encerrar_outras_sessoes_usuario(
            id_usuario=usuario["id_usuario"],
            id_sessao_atual=usuario["id_sessao"]
        )

        return {
            "mensagem": (
                "Os outros acessos foram encerrados."
                if quantidade > 0
                else "Não havia outros acessos ativos."
            ),
            "quantidade_encerrada": quantidade
        }

    except Error as erro:
        print(f"Erro ao encerrar outras sessões: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível encerrar os outros acessos."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao encerrar outras sessões: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post("/logout")
def realizar_logout(
    requisicao: Request,
    resposta: Response,
    usuario=Depends(obter_usuario_conectado)
):
    """
    Encerra a sessão atual do usuário.
    """

    try:
        sessao_encerrada = encerrar_sessao(
            usuario["_token_sessao"]
        )

        if not sessao_encerrada:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="A sessão não pôde ser encerrada."
            )

        remover_cookies_sessao(
            resposta,
            requisicao
        )

        return {
            "mensagem": "Sessão encerrada com sucesso."
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao encerrar sessão: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível encerrar a sessão."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao encerrar sessão: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.put("/trocar-senha")
def trocar_senha(
    dados: TrocaSenhaEntrada,
    usuario=Depends(obter_usuario_conectado)
):
    """
    Troca a senha do usuário conectado.
    """

    try:
        resultado = trocar_senha_usuario(
            id_usuario=usuario["id_usuario"],
            senha_atual=dados.senha_atual,
            nova_senha=dados.nova_senha,
            id_sessao_atual=usuario["id_sessao"]
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "USUARIO_NAO_ENCONTRADO":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado."
                )

            if motivo == "USUARIO_INATIVO":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Este usuário está inativo."
                )

            if motivo == "SENHA_ATUAL_INCORRETA":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A senha atual está incorreta."
                )

            if motivo == "NOVA_SENHA_IGUAL_ATUAL":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "A nova senha deve ser diferente "
                        "da senha atual."
                    )
                )

        return {
            "mensagem": "Senha alterada com sucesso!",
            "usuario": {
                "id_usuario": usuario["id_usuario"],
                "nome_completo": usuario["nome_completo"],
                "precisa_trocar_senha": False
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao trocar senha: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível alterar a senha."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao trocar senha: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
