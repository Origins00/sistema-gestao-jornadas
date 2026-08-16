import hashlib
import secrets


def gerar_token_sessao() -> str:
    """
    Cria um token seguro que será entregue ao aparelho conectado.
    """

    return secrets.token_urlsafe(32)


def gerar_hash_token(token: str) -> str:
    """
    Gera o hash usado para procurar o token no banco de dados.
    """

    return hashlib.sha256(token.encode("utf-8")).hexdigest()