import os
from ipaddress import ip_address
from pathlib import Path

from dotenv import load_dotenv


PASTA_BACKEND = Path(__file__).resolve().parents[1]
load_dotenv(PASTA_BACKEND / ".env")


AMBIENTE = os.getenv("AMBIENTE", "producao").strip().lower()
MODO_PRODUCAO = AMBIENTE != "desenvolvimento"


def _lista_configuracao(nome: str, padrao: str = "") -> list[str]:
    return [
        item.strip()
        for item in os.getenv(nome, padrao).split(",")
        if item.strip()
    ]


HOSTS_PERMITIDOS = _lista_configuracao(
    "HOSTS_PERMITIDOS",
    "127.0.0.1,localhost"
)

ORIGENS_DESENVOLVIMENTO = _lista_configuracao(
    "ORIGENS_DESENVOLVIMENTO",
    (
        "http://127.0.0.1:5500,http://localhost:5500,"
        "http://127.0.0.1:5501,http://localhost:5501"
    )
)


def _inteiro_limitado(
    nome: str,
    padrao: int,
    minimo: int,
    maximo: int
) -> int:
    try:
        valor = int(os.getenv(nome, str(padrao)))
    except ValueError:
        return padrao

    return max(minimo, min(maximo, valor))


SESSAO_DURACAO_HORAS = _inteiro_limitado(
    "SESSAO_DURACAO_HORAS",
    168,
    1,
    720
)

SESSAO_DURACAO_SEGUNDOS = SESSAO_DURACAO_HORAS * 60 * 60

NOME_COOKIE_SESSAO = "gestor_jornadas_sessao"
NOME_COOKIE_CSRF = "gestor_jornadas_csrf"


def cliente_eh_local(endereco: str | None) -> bool:
    if not endereco:
        return False

    try:
        return ip_address(endereco).is_loopback
    except ValueError:
        return endereco.lower() == "localhost"


def requisicao_usa_https(requisicao) -> bool:
    if requisicao.url.scheme == "https":
        return True

    endereco_cliente = (
        requisicao.client.host
        if requisicao.client is not None
        else None
    )

    protocolo_encaminhado = requisicao.headers.get(
        "x-forwarded-proto",
        ""
    ).split(",", 1)[0].strip().lower()

    return (
        cliente_eh_local(endereco_cliente) and
        protocolo_encaminhado == "https"
    )


def acesso_local_direto(requisicao) -> bool:
    endereco_cliente = (
        requisicao.client.host
        if requisicao.client is not None
        else None
    )

    return (
        cliente_eh_local(endereco_cliente) and
        not requisicao.headers.get("cf-connecting-ip") and
        not requisicao.headers.get("x-forwarded-for")
    )
