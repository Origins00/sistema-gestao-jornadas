import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


PASTA_BACKEND = Path(__file__).resolve().parents[1]
PASTA_APP = PASTA_BACKEND / "app"
sys.path.insert(0, str(PASTA_APP))

os.environ["AMBIENTE"] = "producao"
DOMINIO_PUBLICO = "app.gestor-jornadas.example"


def gerar_cpf_sintetico() -> str:
    """Gera um identificador válido somente para testes automatizados."""

    numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    for quantidade in (9, 10):
        soma = sum(
            numeros[indice] * (quantidade + 1 - indice)
            for indice in range(quantidade)
        )
        digito = 11 - (soma % 11)
        numeros.append(0 if digito >= 10 else digito)

    return "".join(str(numero) for numero in numeros)


CPF_TESTE = gerar_cpf_sintetico()
TELEFONE_TESTE = "37" + ("9" * 9)

os.environ["HOSTS_PERMITIDOS"] = (
    f"127.0.0.1,localhost,{DOMINIO_PUBLICO}"
)

import configuracao_seguranca

configuracao_seguranca.HOSTS_PERMITIDOS = [
    "127.0.0.1",
    "localhost",
    DOMINIO_PUBLICO,
]

from fastapi.testclient import TestClient

from main import aplicacao
from modelos.administracao import RedefinicaoSenhaUsuario
from modelos.autenticacao import LoginEntrada, TrocaSenhaEntrada
from modelos.solicitacao_cadastro import SolicitacaoCadastroEntrada
from utilitarios.limitador_requisicoes import LimitadorJanela


class SegurancaPublicacaoTestes(unittest.TestCase):
    def setUp(self):
        self.cliente = TestClient(
            aplicacao,
            base_url="http://127.0.0.1",
            client=("127.0.0.1", 50000)
        )
        self.cliente_publico = TestClient(
            aplicacao,
            base_url=f"https://{DOMINIO_PUBLICO}",
            client=("127.0.0.1", 50002)
        )

    def preparar_csrf(self) -> str:
        resposta = self.cliente.get("/autenticacao/csrf")

        self.assertEqual(resposta.status_code, 200)
        token = resposta.json()["token_csrf"]
        self.assertEqual(
            self.cliente.cookies.get("gestor_jornadas_csrf"),
            token
        )

        return token

    def efetuar_login_ficticio(self):
        token_csrf = self.preparar_csrf()
        resultado = {
            "sucesso": True,
            "token_sessao": "token-seguro-de-teste",
            "usuario": {
                "id_usuario": 1,
                "nome_completo": "Usuário de Teste",
                "tipo_usuario": "ADMINISTRADOR",
                "precisa_trocar_senha": False
            }
        }

        with patch(
            "rotas.rotas_autenticacao.autenticar_usuario",
            return_value=resultado
        ):
            resposta = self.cliente.post(
                "/autenticacao/login",
                headers={"X-CSRF-Token": token_csrf},
                json={
                    "cpf": CPF_TESTE,
                    "senha": "senha-legada",
                    "descricao_aparelho": "Teste automatizado"
                }
            )

        return resposta

    def test_documentacao_publica_desativada(self):
        for caminho in ("/docs", "/redoc", "/openapi.json"):
            with self.subTest(caminho=caminho):
                self.assertEqual(
                    self.cliente.get(caminho).status_code,
                    404
                )

    def test_cabecalhos_de_seguranca_e_cache(self):
        resposta = self.cliente.get("/api/saude")

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.json(), {"funcionando": True})
        self.assertEqual(resposta.headers["cache-control"], "no-store")
        self.assertEqual(
            resposta.headers["x-content-type-options"],
            "nosniff"
        )
        self.assertEqual(resposta.headers["x-frame-options"], "DENY")
        self.assertIn(
            "default-src 'self'",
            resposta.headers["content-security-policy"]
        )

    def test_dominio_publico_usa_https_cookie_seguro_e_sem_cors(self):
        resposta = self.cliente_publico.get("/autenticacao/csrf")

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(
            resposta.headers["strict-transport-security"],
            "max-age=31536000"
        )
        self.assertNotIn(
            "access-control-allow-origin",
            resposta.headers
        )

        cookie_csrf = next(
            item
            for item in resposta.headers.get_list("set-cookie")
            if item.startswith("gestor_jornadas_csrf=")
        )
        self.assertIn("Secure", cookie_csrf)
        self.assertIn("SameSite=strict", cookie_csrf)

    def test_dominio_publico_aceita_origem_correta(self):
        resposta_csrf = self.cliente_publico.get(
            "/autenticacao/csrf"
        )
        token_csrf = resposta_csrf.json()["token_csrf"]
        resultado = {
            "sucesso": True,
            "token_sessao": "token-publico-seguro",
            "usuario": {
                "id_usuario": 1,
                "nome_completo": "Usuario de Teste",
                "tipo_usuario": "ADMINISTRADOR",
                "precisa_trocar_senha": False
            }
        }

        with patch(
            "rotas.rotas_autenticacao.autenticar_usuario",
            return_value=resultado
        ):
            resposta = self.cliente_publico.post(
                "/autenticacao/login",
                headers={
                    "Origin": f"https://{DOMINIO_PUBLICO}",
                    "Sec-Fetch-Site": "same-origin",
                    "X-CSRF-Token": token_csrf
                },
                json={
                    "cpf": CPF_TESTE,
                    "senha": "senha-legada",
                    "descricao_aparelho": "Dominio publico"
                }
            )

        self.assertEqual(resposta.status_code, 200)
        cookie_sessao = next(
            item
            for item in resposta.headers.get_list("set-cookie")
            if item.startswith("gestor_jornadas_sessao=")
        )
        self.assertIn("Secure", cookie_sessao)
        self.assertIn("HttpOnly", cookie_sessao)

    def test_tunel_local_reconhece_https_e_oculta_diagnostico(self):
        cliente_origem = TestClient(
            aplicacao,
            base_url=f"http://{DOMINIO_PUBLICO}",
            client=("127.0.0.1", 50004)
        )
        cabecalhos_tunel = {
            "CF-Connecting-IP": "203.0.113.10",
            "X-Forwarded-For": "203.0.113.10",
            "X-Forwarded-Proto": "https"
        }

        resposta_csrf = cliente_origem.get(
            "/autenticacao/csrf",
            headers=cabecalhos_tunel
        )
        resposta_diagnostico = cliente_origem.get(
            "/teste-banco",
            headers=cabecalhos_tunel
        )

        self.assertEqual(resposta_csrf.status_code, 200)
        self.assertEqual(
            resposta_csrf.headers["strict-transport-security"],
            "max-age=31536000"
        )
        self.assertIn(
            "Secure",
            resposta_csrf.headers["set-cookie"]
        )
        self.assertEqual(resposta_diagnostico.status_code, 404)

    def test_host_nao_permitido_continua_rejeitado(self):
        cliente_invalido = TestClient(
            aplicacao,
            base_url="https://host-invalido.example",
            client=("127.0.0.1", 50003)
        )

        self.assertEqual(
            cliente_invalido.get("/api/saude").status_code,
            400
        )

    def test_csrf_obrigatorio_em_operacoes_de_escrita(self):
        resposta = self.cliente.post(
            "/autenticacao/login",
            json={
                "cpf": CPF_TESTE,
                "senha": "senha-legada"
            }
        )

        self.assertEqual(resposta.status_code, 403)
        self.assertIn("validação de segurança", resposta.json()["detail"])

    def test_csrf_rejeita_origem_cruzada(self):
        token_csrf = self.preparar_csrf()

        resposta = self.cliente.post(
            "/autenticacao/login",
            headers={
                "X-CSRF-Token": token_csrf,
                "Origin": "https://site-malicioso.example",
                "Sec-Fetch-Site": "cross-site"
            },
            json={
                "cpf": CPF_TESTE,
                "senha": "senha-legada"
            }
        )

        self.assertEqual(resposta.status_code, 403)
        self.assertEqual(
            resposta.json()["detail"],
            "Origem da solicitação não autorizada."
        )

    def test_login_usa_cookie_httponly_e_nao_expoe_token(self):
        resposta = self.efetuar_login_ficticio()

        self.assertEqual(resposta.status_code, 200)
        self.assertNotIn("token_acesso", resposta.json())
        self.assertEqual(
            self.cliente.cookies.get("gestor_jornadas_sessao"),
            "token-seguro-de-teste"
        )

        cookies = resposta.headers.get_list("set-cookie")
        cookie_sessao = next(
            item for item in cookies
            if item.startswith("gestor_jornadas_sessao=")
        )
        self.assertIn("HttpOnly", cookie_sessao)
        self.assertIn("SameSite=strict", cookie_sessao)

    def test_cookie_autentica_e_bearer_sozinho_nao_autentica(self):
        resposta_login = self.efetuar_login_ficticio()
        self.assertEqual(resposta_login.status_code, 200)

        usuario = {
            "id_usuario": 1,
            "nome_completo": "Usuário de Teste",
            "telefone": None,
            "data_nascimento": None,
            "foto_perfil": None,
            "tipo_usuario": "ADMINISTRADOR",
            "situacao_usuario": "ATIVO",
            "precisa_trocar_senha": False,
            "id_sessao": 10
        }

        with patch(
            "utilitarios.dependencias_autenticacao.buscar_usuario_por_token",
            return_value=usuario
        ):
            resposta = self.cliente.get("/autenticacao/me")

        self.assertEqual(resposta.status_code, 200)

        cliente_sem_cookie = TestClient(
            aplicacao,
            base_url="http://127.0.0.1",
            client=("127.0.0.1", 50001)
        )
        resposta_bearer = cliente_sem_cookie.get(
            "/autenticacao/me",
            headers={"Authorization": "Bearer token-antigo"}
        )
        self.assertEqual(resposta_bearer.status_code, 401)

    def test_logout_remove_cookies(self):
        self.assertEqual(
            self.efetuar_login_ficticio().status_code,
            200
        )
        token_csrf = self.cliente.cookies.get("gestor_jornadas_csrf")

        usuario = {
            "id_usuario": 1,
            "nome_completo": "Usuário de Teste",
            "telefone": None,
            "data_nascimento": None,
            "foto_perfil": None,
            "tipo_usuario": "ADMINISTRADOR",
            "situacao_usuario": "ATIVO",
            "precisa_trocar_senha": False,
            "id_sessao": 10
        }

        with (
            patch(
                "utilitarios.dependencias_autenticacao.buscar_usuario_por_token",
                return_value=usuario
            ),
            patch(
                "rotas.rotas_autenticacao.encerrar_sessao",
                return_value=True
            )
        ):
            resposta = self.cliente.post(
                "/autenticacao/logout",
                headers={"X-CSRF-Token": token_csrf}
            )

        self.assertEqual(resposta.status_code, 200)
        self.assertIsNone(
            self.cliente.cookies.get("gestor_jornadas_sessao")
        )
        self.assertIsNone(
            self.cliente.cookies.get("gestor_jornadas_csrf")
        )

    def test_diagnostico_banco_apenas_local(self):
        with patch("main.testar_conexao", return_value=True):
            resposta_local = self.cliente.get("/teste-banco")
            resposta_externa = self.cliente.get(
                "/teste-banco",
                headers={
                    "CF-Connecting-IP": "203.0.113.10",
                    "X-Forwarded-For": "203.0.113.10"
                }
            )

        self.assertEqual(resposta_local.status_code, 200)
        self.assertEqual(resposta_externa.status_code, 404)

    def test_solicitacao_nao_revela_existencia_do_cpf(self):
        token_csrf = self.preparar_csrf()
        dados = {
            "nome_completo": "Pessoa de Teste",
            "cpf": CPF_TESTE,
            "telefone": TELEFONE_TESTE,
            "data_nascimento": "1990-01-01",
            "senha": "frase-segura-de-teste"
        }

        with patch(
            "rotas.rotas_solicitacoes_cadastro.cpf_ja_cadastrado",
            return_value=True
        ):
            existente = self.cliente.post(
                "/solicitacoes-cadastro",
                headers={"X-CSRF-Token": token_csrf},
                json=dados
            )

        with (
            patch(
                "rotas.rotas_solicitacoes_cadastro.cpf_ja_cadastrado",
                return_value=False
            ),
            patch(
                "rotas.rotas_solicitacoes_cadastro.buscar_solicitacao_por_cpf",
                return_value={"situacao_solicitacao": "PENDENTE"}
            )
        ):
            pendente = self.cliente.post(
                "/solicitacoes-cadastro",
                headers={"X-CSRF-Token": token_csrf},
                json=dados
            )

        self.assertEqual(existente.status_code, 202)
        self.assertEqual(pendente.status_code, 202)
        self.assertEqual(existente.json(), pendente.json())
        self.assertNotIn("id_solicitacao", existente.json())

    def test_politica_de_senhas_preserva_login_legado(self):
        LoginEntrada(cpf=CPF_TESTE, senha="123456")

        with self.assertRaises(ValueError):
            SolicitacaoCadastroEntrada(
                nome_completo="Pessoa de Teste",
                cpf=CPF_TESTE,
                telefone=TELEFONE_TESTE,
                data_nascimento="1990-01-01",
                senha="curta123"
            )

        with self.assertRaises(ValueError):
            TrocaSenhaEntrada(
                senha_atual="123456",
                nova_senha="curta123",
                confirmacao_nova_senha="curta123"
            )

        with self.assertRaises(ValueError):
            RedefinicaoSenhaUsuario(
                nova_senha="curta123",
                confirmacao_nova_senha="curta123"
            )

    def test_limitador_bloqueia_e_libera_chave(self):
        limitador = LimitadorJanela(
            limite=2,
            janela_segundos=60
        )

        self.assertEqual(limitador.registrar("conta"), 0)
        self.assertGreater(limitador.registrar("conta"), 0)
        self.assertGreater(limitador.tempo_bloqueio("conta"), 0)
        limitador.liberar("conta")
        self.assertEqual(limitador.tempo_bloqueio("conta"), 0)


if __name__ == "__main__":
    unittest.main()
