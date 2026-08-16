import sys
import unittest
from contextlib import ExitStack
from datetime import date, datetime, time, timezone
from pathlib import Path
from unittest.mock import patch


PASTA_BACKEND = Path(__file__).resolve().parents[1]
PASTA_APP = PASTA_BACKEND / "app"
sys.path.insert(0, str(PASTA_APP))

from modelos.jornada import OperacaoSincronizacaoOffline
from rotas.rotas_jornadas import sincronizar_operacao_offline


def criar_operacao(**alteracoes):
    dados = {
        "chave_operacao_offline": (
            "550e8400-e29b-41d4-a716-446655440000"
        ),
        "data_hora_dispositivo": datetime.now(timezone.utc),
        "data_jornada": date.today(),
        "tipo_registro": "ENTRADA",
        "horario_informado": "07:00",
        "origem_registro": "HORARIO_ATUAL",
        "tipo_trabalho_inicio": "ADMINISTRATIVO"
    }
    dados.update(alteracoes)
    return OperacaoSincronizacaoOffline(**dados)


class SincronizacaoOfflineTestes(unittest.TestCase):
    def test_entrada_exige_tipo_de_trabalho(self):
        with self.assertRaises(ValueError):
            criar_operacao(tipo_trabalho_inicio=None)

    def test_repeticao_da_mesma_chave_nao_insere_novamente(self):
        registro = {
            "id_jornada": 10,
            "id_registro": 20
        }

        with patch(
            "rotas.rotas_jornadas.buscar_registro_por_chave_offline",
            return_value=registro
        ):
            resposta = sincronizar_operacao_offline(
                criar_operacao(),
                usuario={"id_usuario": 1}
            )

        self.assertEqual(resposta["situacao"], "SINCRONIZADO")
        self.assertTrue(resposta["idempotente"])
        self.assertEqual(resposta["id_registro"], 20)

    def test_nova_entrada_abre_jornada_e_salva_operacao(self):
        jornada = {
            "id_jornada": 10,
            "situacao_jornada": "EM_ANDAMENTO",
            "tipo_trabalho_apos_almoco": None,
            "atividade_do_dia": None
        }

        substituicoes = [
            patch(
                "rotas.rotas_jornadas.buscar_registro_por_chave_offline",
                return_value=None
            ),
            patch(
                "rotas.rotas_jornadas.buscar_conflito_por_chave_offline",
                return_value=None
            ),
            patch(
                "rotas.rotas_jornadas.buscar_jornada_por_usuario_e_data",
                return_value=None
            ),
            patch(
                "rotas.rotas_jornadas.criar_jornada",
                return_value=10
            ),
            patch(
                "rotas.rotas_jornadas.buscar_jornada_por_id_e_usuario",
                return_value=jornada
            ),
            patch(
                "rotas.rotas_jornadas.buscar_registro_da_jornada",
                return_value=None
            ),
            patch(
                "rotas.rotas_jornadas.buscar_horarios_da_jornada",
                return_value={}
            ),
            patch(
                "rotas.rotas_jornadas.criar_registro_entrada",
                return_value=20
            )
        ]

        with ExitStack() as pilha:
            mocks = [pilha.enter_context(item) for item in substituicoes]
            resposta = sincronizar_operacao_offline(
                criar_operacao(),
                usuario={"id_usuario": 1}
            )

        self.assertEqual(resposta["situacao"], "SINCRONIZADO")
        self.assertFalse(resposta["idempotente"])
        self.assertEqual(resposta["id_registro"], 20)
        mocks[-1].assert_called_once()

    def test_valor_divergente_e_preservado_como_conflito(self):
        jornada = {
            "id_jornada": 10,
            "situacao_jornada": "EM_ANDAMENTO",
            "tipo_trabalho_apos_almoco": None,
            "atividade_do_dia": None
        }
        registro = {
            "id_registro": 20,
            "horario_informado": time(8, 0)
        }

        with ExitStack() as pilha:
            pilha.enter_context(patch(
                "rotas.rotas_jornadas.buscar_registro_por_chave_offline",
                return_value=None
            ))
            pilha.enter_context(patch(
                "rotas.rotas_jornadas.buscar_conflito_por_chave_offline",
                return_value=None
            ))
            pilha.enter_context(patch(
                "rotas.rotas_jornadas.buscar_jornada_por_usuario_e_data",
                return_value=jornada
            ))
            pilha.enter_context(patch(
                "rotas.rotas_jornadas.buscar_registro_da_jornada",
                return_value=registro
            ))
            salvar_conflito = pilha.enter_context(patch(
                "rotas.rotas_jornadas.registrar_conflito_sincronizacao",
                return_value=30
            ))

            resposta = sincronizar_operacao_offline(
                criar_operacao(),
                usuario={"id_usuario": 1}
            )

        self.assertEqual(resposta["situacao"], "CONFLITO")
        self.assertEqual(resposta["id_conflito"], 30)
        salvar_conflito.assert_called_once()


if __name__ == "__main__":
    unittest.main()
