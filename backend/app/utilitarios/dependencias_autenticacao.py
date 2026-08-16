from fastapi import Depends, HTTPException, Request, status

from configuracao_seguranca import NOME_COOKIE_SESSAO
from servicos.servico_autenticacao import buscar_usuario_por_token


def obter_usuario_conectado(
    requisicao: Request
):
    """
    Confere o cookie HttpOnly e devolve os dados do usuário conectado.
    """

    token_sessao = requisicao.cookies.get(
        NOME_COOKIE_SESSAO
    )

    if not token_sessao:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Acesso não autorizado."
        )

    usuario = buscar_usuario_por_token(
        token_sessao
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou encerrada."
        )

    usuario["_token_sessao"] = token_sessao

    return usuario


def obter_usuario_com_senha_definitiva(
    usuario=Depends(obter_usuario_conectado)
):
    """
    Impede o acesso ao sistema enquanto a senha for provisória.
    """

    if usuario["precisa_trocar_senha"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Você precisa alterar a senha provisória "
                "antes de acessar esta funcionalidade."
            )
        )

    return usuario


def obter_administrador_conectado(
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Confere se o usuário conectado possui permissão de administrador.
    """

    if usuario["tipo_usuario"] != "ADMINISTRADOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Esta funcionalidade está disponível "
                "apenas para administradores."
            )
        )

    return usuario
