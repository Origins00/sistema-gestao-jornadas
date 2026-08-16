import hashlib
import time
from collections import defaultdict, deque
from ipaddress import ip_address
from threading import Lock


class LimitadorJanela:
    def __init__(self, limite: int, janela_segundos: int):
        self.limite = limite
        self.janela_segundos = janela_segundos
        self._eventos = defaultdict(deque)
        self._trava = Lock()

    def _limpar_expirados(self, eventos, agora: float) -> None:
        inicio_janela = agora - self.janela_segundos

        while eventos and eventos[0] <= inicio_janela:
            eventos.popleft()

    def tempo_bloqueio(self, chave: str) -> int:
        agora = time.monotonic()

        with self._trava:
            eventos = self._eventos[chave]
            self._limpar_expirados(eventos, agora)

            if len(eventos) < self.limite:
                if not eventos:
                    self._eventos.pop(chave, None)
                return 0

            restante = self.janela_segundos - (
                agora - eventos[0]
            )

            return max(1, int(restante) + 1)

    def registrar(self, chave: str) -> int:
        agora = time.monotonic()

        with self._trava:
            eventos = self._eventos[chave]
            self._limpar_expirados(eventos, agora)
            eventos.append(agora)

            if len(eventos) < self.limite:
                return 0

            restante = self.janela_segundos - (
                agora - eventos[0]
            )

            return max(1, int(restante) + 1)

    def liberar(self, chave: str) -> None:
        with self._trava:
            self._eventos.pop(chave, None)


def identificar_cliente(requisicao) -> str:
    endereco_direto = (
        requisicao.client.host
        if requisicao.client is not None
        else "desconhecido"
    )

    if endereco_direto in {"127.0.0.1", "::1", "localhost"}:
        endereco_cloudflare = requisicao.headers.get(
            "cf-connecting-ip",
            ""
        ).strip()

        if endereco_cloudflare:
            try:
                return str(ip_address(endereco_cloudflare))
            except ValueError:
                pass

    return endereco_direto


def anonimizar_identificador(valor: str) -> str:
    return hashlib.sha256(
        valor.encode("utf-8")
    ).hexdigest()
