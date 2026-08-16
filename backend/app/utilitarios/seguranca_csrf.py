import secrets
from urllib.parse import urlsplit

from fastapi import HTTPException, status

from configuracao_seguranca import (
    MODO_PRODUCAO,
    NOME_COOKIE_CSRF,
    NOME_COOKIE_SESSAO,
    SESSAO_DURACAO_SEGUNDOS,
    requisicao_usa_https
)


def gerar_token_csrf() -> str:
    return secrets.token_urlsafe(32)


def definir_cookie_csrf(resposta, requisicao, token: str) -> None:
    resposta.set_cookie(
        key=NOME_COOKIE_CSRF,
        value=token,
        max_age=SESSAO_DURACAO_SEGUNDOS,
        path="/",
        secure=requisicao_usa_https(requisicao),
        httponly=False,
        samesite="strict"
    )


def definir_cookie_sessao(
    resposta,
    requisicao,
    token_sessao: str
) -> str:
    resposta.set_cookie(
        key=NOME_COOKIE_SESSAO,
        value=token_sessao,
        max_age=SESSAO_DURACAO_SEGUNDOS,
        path="/",
        secure=requisicao_usa_https(requisicao),
        httponly=True,
        samesite="strict"
    )

    token_csrf = gerar_token_csrf()
    definir_cookie_csrf(
        resposta,
        requisicao,
        token_csrf
    )

    return token_csrf


def remover_cookies_sessao(resposta, requisicao) -> None:
    seguro = requisicao_usa_https(requisicao)

    resposta.delete_cookie(
        key=NOME_COOKIE_SESSAO,
        path="/",
        secure=seguro,
        httponly=True,
        samesite="strict"
    )
    resposta.delete_cookie(
        key=NOME_COOKIE_CSRF,
        path="/",
        secure=seguro,
        httponly=False,
        samesite="strict"
    )


def validar_token_csrf(requisicao) -> None:
    origem = requisicao.headers.get("origin", "").strip()
    host = requisicao.headers.get("host", "").strip().lower()
    contexto_navegacao = requisicao.headers.get(
        "sec-fetch-site",
        ""
    ).strip().lower()

    if MODO_PRODUCAO and contexto_navegacao == "cross-site":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Origem da solicitação não autorizada."
        )

    if MODO_PRODUCAO and origem:
        host_origem = urlsplit(origem).netloc.lower()

        if not host_origem or host_origem != host:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Origem da solicitação não autorizada."
            )

    token_cookie = requisicao.cookies.get(NOME_COOKIE_CSRF, "")
    token_cabecalho = requisicao.headers.get("x-csrf-token", "")

    if (
        not token_cookie or
        not token_cabecalho or
        not secrets.compare_digest(
            token_cookie,
            token_cabecalho
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "A validação de segurança da solicitação expirou. "
                "Atualize a página e tente novamente."
            )
        )
