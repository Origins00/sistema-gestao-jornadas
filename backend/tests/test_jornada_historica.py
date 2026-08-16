import sys
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch


PASTA_BACKEND = Path(__file__).resolve().parents[1]
PASTA_APP = PASTA_BACKEND / "app"
sys.path.insert(0, str(PASTA_APP))

from fastapi import HTTPException

from modelos.jornada import JornadaHistoricaCompleta
from rotas.rotas_jornadas import registrar_jornada_historica


def criar_dados(**alteracoes):
    dados = {
        "data_jornada": date.today() - timedelta(days=1),
        "tipo_trabalho_inicio": "ADMINISTRATIVO",
        "horario_entrada": "06:00",
        "horario_inicio_almoco": "11:00",
        "horario_fim_almoco": "12:00",
        "horario_saida": "15:00",
        "tipo_trabalho_apos_almoco": "ADMINISTRATIVO",
        "atividade_do_dia": "Teste de jornada retroativa"
    }
    dados.update(alteracoes)
    return JornadaHistoricaCompleta(**dados)


class JornadaHistoricaTestes(unittest.TestCase):
    def test_exige_data_passada(self):
        with self.assertRaises(ValueError):
            criar_dados(data_jornada=date.today())

    def test_exige_horarios_em_ordem(self):
        with self.assertRaises(ValueError):
            criar_dados(
                horario_inicio_almoco="12:00",
                horario_fim_almoco="11:00"
            )

    def test_rota_cria_jornada_concluida(self):
        dados = criar_dados()

        with patch(
            "rotas.rotas_jornadas.criar_jornada_historica_completa",
            return_value={"id_jornada": 44}
        ) as criar:
            resposta = registrar_jornada_historica(
                dados,
                usuario={"id_usuario": 7}
            )

        criar.assert_called_once_with(
            id_usuario=7,
            dados=dados
        )
        self.assertEqual(
            resposta["jornada"]["situacao_jornada"],
            "CONCLUIDA"
        )

    def test_conflito_de_data_retorna_409(self):
        with patch(
            "rotas.rotas_jornadas.criar_jornada_historica_completa",
            side_effect=ValueError(
                "Já existe uma jornada na data informada."
            )
        ):
            with self.assertRaises(HTTPException) as contexto:
                registrar_jornada_historica(
                    criar_dados(),
                    usuario={"id_usuario": 7}
                )

        self.assertEqual(
            contexto.exception.status_code,
            409
        )


if __name__ == "__main__":
    unittest.main()
