import sys
import unittest
from datetime import date, time
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile


PASTA_BACKEND = Path(__file__).resolve().parents[1]
PASTA_APP = PASTA_BACKEND / "app"
sys.path.insert(0, str(PASTA_APP))

from utilitarios.gerador_planilha_relatorio import (
    gerar_planilha_relatorio_jornadas
)


NAMESPACE = {
    "p": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main"
}


def criar_jornada(
    id_jornada: int,
    data_jornada: date,
    nome_completo: str = "Usuário Demonstração"
) -> dict:
    return {
        "id_jornada": id_jornada,
        "id_usuario": 7,
        "data_jornada": data_jornada,
        "nome_completo": nome_completo,
        "tipo_trabalho_inicio": "ADMINISTRATIVO",
        "tipo_trabalho_apos_almoco": "ADMINISTRATIVO",
        "horario_entrada": time(6, 0),
        "horario_inicio_almoco": time(11, 0),
        "horario_fim_almoco": time(12, 0),
        "horario_saida": time(15, 0),
        "minutos_trabalhados": 480,
        "minutos_esperados": 480,
        "minutos_extras": 0,
        "minutos_saldo": 0,
        "minutos_abonados": 0,
        "atividade_do_dia": "Atendimento externo"
    }


class PlanilhaRelatorioTestes(unittest.TestCase):
    def gerar_arquivo(
        self,
        preto_e_branco: bool = False
    ) -> ZipFile:
        jornadas = [
            criar_jornada(3, date(2026, 8, 14)),
            criar_jornada(1, date(2026, 6, 1)),
            criar_jornada(2, date(2026, 7, 20))
        ]

        conteudo = gerar_planilha_relatorio_jornadas(
            jornadas=jornadas,
            data_inicio=date(2026, 5, 1),
            data_fim=date(2026, 8, 31),
            preto_e_branco=preto_e_branco
        )

        return ZipFile(BytesIO(conteudo))

    def test_jornadas_sao_exportadas_da_mais_antiga_para_a_mais_recente(self):
        with self.gerar_arquivo() as arquivo:
            raiz = ElementTree.fromstring(
                arquivo.read("xl/worksheets/sheet1.xml")
            )

        datas = []

        for numero_linha in (7, 8, 9):
            celula = raiz.find(
                f'.//p:c[@r="A{numero_linha}"]/p:v',
                NAMESPACE
            )
            datas.append(float(celula.text))

        self.assertEqual(datas, sorted(datas))

    def test_impressao_fica_em_a4_paisagem_e_uma_pagina_de_largura(self):
        with self.gerar_arquivo() as arquivo:
            raiz_planilha = ElementTree.fromstring(
                arquivo.read("xl/worksheets/sheet1.xml")
            )
            raiz_pasta = ElementTree.fromstring(
                arquivo.read("xl/workbook.xml")
            )

        configuracao = raiz_planilha.find(
            "p:pageSetup",
            NAMESPACE
        )
        margens = raiz_planilha.find(
            "p:pageMargins",
            NAMESPACE
        )
        ajuste = raiz_planilha.find(
            "p:sheetPr/p:pageSetUpPr",
            NAMESPACE
        )

        self.assertEqual(configuracao.get("paperSize"), "9")
        self.assertEqual(configuracao.get("orientation"), "landscape")
        self.assertEqual(configuracao.get("fitToWidth"), "1")
        self.assertEqual(configuracao.get("fitToHeight"), "0")
        self.assertEqual(ajuste.get("fitToPage"), "1")
        self.assertEqual(margens.get("left"), "0.2")
        self.assertEqual(margens.get("right"), "0.2")

        nomes_definidos = {
            item.get("name"): item.text
            for item in raiz_pasta.findall(
                "p:definedNames/p:definedName",
                NAMESPACE
            )
        }

        self.assertEqual(
            nomes_definidos["_xlnm.Print_Area"],
            "'Jornadas'!$A$1:$L$10"
        )
        self.assertEqual(
            nomes_definidos["_xlnm.Print_Titles"],
            "'Jornadas'!$1:$6"
        )

    def test_modelo_preto_e_branco_economiza_tinta_no_cabecalho(self):
        with self.gerar_arquivo(
            preto_e_branco=True
        ) as arquivo:
            nomes_arquivos = set(
                arquivo.namelist()
            )
            raiz_planilha = ElementTree.fromstring(
                arquivo.read("xl/worksheets/sheet1.xml")
            )
            estilos = arquivo.read(
                "xl/styles.xml"
            ).decode("utf-8")

        configuracao = raiz_planilha.find(
            "p:pageSetup",
            NAMESPACE
        )
        mesclagens = {
            item.get("ref")
            for item in raiz_planilha.findall(
                "p:mergeCells/p:mergeCell",
                NAMESPACE
            )
        }
        desenho = raiz_planilha.find(
            "p:drawing",
            NAMESPACE
        )

        self.assertEqual(
            configuracao.get("blackAndWhite"),
            "1"
        )
        self.assertIn("A1:A3", mesclagens)
        self.assertIn("B1:L3", mesclagens)
        self.assertIsNotNone(desenho)
        self.assertIn(
            "xl/media/logo-gestor-jornadas.png",
            nomes_arquivos
        )
        self.assertIn(
            "xl/drawings/drawing1.xml",
            nomes_arquivos
        )
        with self.gerar_arquivo(
            preto_e_branco=True
        ) as arquivo:
            raiz_desenho = ElementTree.fromstring(
                arquivo.read("xl/drawings/drawing1.xml")
            )

        self.assertIsNotNone(
            raiz_desenho.find(".//a:grayscl", NAMESPACE)
        )
        self.assertNotIn("FF6B4423", estilos)
        self.assertIn("FFE6E6E6", estilos)

    def test_modelo_colorido_permanece_com_identidade_visual(self):
        with self.gerar_arquivo() as arquivo:
            raiz_planilha = ElementTree.fromstring(
                arquivo.read("xl/worksheets/sheet1.xml")
            )
            raiz_desenho = ElementTree.fromstring(
                arquivo.read("xl/drawings/drawing1.xml")
            )
            estilos = arquivo.read(
                "xl/styles.xml"
            ).decode("utf-8")

        configuracao = raiz_planilha.find(
            "p:pageSetup",
            NAMESPACE
        )
        desenho = raiz_planilha.find(
            "p:drawing",
            NAMESPACE
        )

        self.assertEqual(
            configuracao.get("blackAndWhite"),
            "0"
        )
        self.assertIsNotNone(desenho)
        self.assertIsNone(
            raiz_desenho.find(".//a:grayscl", NAMESPACE)
        )
        self.assertIn("FF155E8A", estilos)


if __name__ == "__main__":
    unittest.main()
