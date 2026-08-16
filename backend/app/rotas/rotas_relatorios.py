from datetime import date, time, timedelta
from io import BytesIO
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from mysql.connector import Error

from servicos.servico_relatorio import (
    buscar_relatorio_jornadas
)
from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)
from utilitarios.gerador_planilha_relatorio import (
    gerar_planilha_relatorio_jornadas
)


roteador = APIRouter(
    prefix="/administracao/relatorios",
    tags=["Relatórios administrativos"]
)


def formatar_total_minutos(
    total_minutos: int
) -> str:
    sinal = ""

    if total_minutos < 0:
        sinal = "-"
        total_minutos = abs(total_minutos)

    horas = total_minutos // 60
    minutos = total_minutos % 60

    return f"{sinal}{horas:02d}h{minutos:02d}"


def formatar_horario(
    horario: time | timedelta | None
) -> str | None:
    if horario is None:
        return None

    if isinstance(horario, timedelta):
        minutos_totais = int(
            horario.total_seconds() // 60
        )
    else:
        minutos_totais = (
            horario.hour * 60 +
            horario.minute
        )

    horas = minutos_totais // 60
    minutos = minutos_totais % 60

    return f"{horas:02d}:{minutos:02d}"


def validar_periodo_relatorio(
    data_inicio: date,
    data_fim: date
):
    if data_inicio > data_fim:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "A data inicial não pode ser posterior "
                "à data final."
            )
        )

    quantidade_dias = (
        data_fim - data_inicio
    ).days

    if quantidade_dias > 366:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "O período do relatório não pode "
                "ultrapassar 367 dias."
            )
        )


@roteador.get("/jornadas")
def consultar_relatorio_jornadas(
    data_inicio: date,
    data_fim: date,
    id_usuario: int | None = Query(
        default=None,
        ge=1
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Gera o relatório administrativo de jornadas.
    """

    validar_periodo_relatorio(
        data_inicio=data_inicio,
        data_fim=data_fim
    )

    try:
        resultado = buscar_relatorio_jornadas(
            data_inicio=data_inicio,
            data_fim=data_fim,
            id_usuario=id_usuario
        )

        jornadas = resultado["jornadas"]

        total_trabalhado = sum(
            int(jornada["minutos_trabalhados"] or 0)
            for jornada in jornadas
        )

        total_esperado = sum(
            int(jornada["minutos_esperados"] or 0)
            for jornada in jornadas
        )

        total_extra = sum(
            int(jornada["minutos_extras"] or 0)
            for jornada in jornadas
        )

        total_saldo = sum(
            int(jornada["minutos_saldo"] or 0)
            for jornada in jornadas
        )

        funcionarios_encontrados = {
            jornada["id_usuario"]
            for jornada in jornadas
        }

        return {
            "periodo": {
                "data_inicio": data_inicio.isoformat(),
                "data_fim": data_fim.isoformat()
            },
            "filtro": {
                "id_usuario": id_usuario
            },
            "resumo": {
                "quantidade_funcionarios": len(
                    funcionarios_encontrados
                ),
                "quantidade_jornadas": len(jornadas),
                "minutos_trabalhados": total_trabalhado,
                "minutos_esperados": total_esperado,
                "minutos_extras": total_extra,
                "minutos_saldo": total_saldo,
                "tempo_trabalhado_formatado": (
                    formatar_total_minutos(
                        total_trabalhado
                    )
                ),
                "tempo_esperado_formatado": (
                    formatar_total_minutos(
                        total_esperado
                    )
                ),
                "horas_extras_formatadas": (
                    formatar_total_minutos(
                        total_extra
                    )
                ),
                "saldo_formatado": (
                    formatar_total_minutos(
                        total_saldo
                    )
                )
            },
            "funcionarios": [
                {
                    "id_usuario": funcionario["id_usuario"],
                    "nome_completo": funcionario["nome_completo"],
                    "cpf": funcionario["cpf"],
                    "situacao_usuario": (
                        funcionario["situacao_usuario"]
                    )
                }
                for funcionario
                in resultado["funcionarios"]
            ],
            "jornadas": [
                {
                    "id_jornada": jornada["id_jornada"],
                    "data_jornada": (
                        jornada["data_jornada"].isoformat()
                    ),
                    "funcionario": {
                        "id_usuario": jornada["id_usuario"],
                        "nome_completo": (
                            jornada["nome_completo"]
                        ),
                        "cpf": jornada["cpf"]
                    },
                    "tipo_trabalho_inicio": (
                        jornada["tipo_trabalho_inicio"]
                    ),
                    "tipo_trabalho_apos_almoco": (
                        jornada["tipo_trabalho_apos_almoco"]
                    ),
                    "atividade_do_dia": (
                        jornada["atividade_do_dia"]
                    ),
                    "situacao_jornada": (
                        jornada["situacao_jornada"]
                    ),
                    "horarios": {
                        "entrada": formatar_horario(
                            jornada["horario_entrada"]
                        ),
                        "inicio_almoco": formatar_horario(
                            jornada["horario_inicio_almoco"]
                        ),
                        "fim_almoco": formatar_horario(
                            jornada["horario_fim_almoco"]
                        ),
                        "saida": formatar_horario(
                            jornada["horario_saida"]
                        )
                    },
                    "totais": {
                        "minutos_trabalhados": int(
                            jornada["minutos_trabalhados"] or 0
                        ),
                        "minutos_esperados": int(
                            jornada["minutos_esperados"] or 0
                        ),
                        "minutos_extras": int(
                            jornada["minutos_extras"] or 0
                        ),
                        "minutos_saldo": int(
                            jornada["minutos_saldo"] or 0
                        ),
                        "minutos_abonados": int(
                            jornada["minutos_abonados"] or 0
                        ),
                        "minutos_tolerancia_aplicada": int(
                            jornada[
                                "minutos_tolerancia_aplicada"
                            ] or 0
                        ),
                        "trabalhado_formatado": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_trabalhados"
                                    ] or 0
                                )
                            )
                        ),
                        "esperado_formatado": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_esperados"
                                    ] or 0
                                )
                            )
                        ),
                        "extras_formatadas": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_extras"
                                    ] or 0
                                )
                            )
                        ),
                        "saldo_formatado": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_saldo"
                                    ] or 0
                                )
                            )
                        ),
                        "abonado_formatado": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_abonados"
                                    ] or 0
                                )
                            )
                        ),
                        "tolerancia_formatada": (
                            formatar_total_minutos(
                                int(
                                    jornada[
                                        "minutos_tolerancia_aplicada"
                                    ] or 0
                                )
                            )
                        )
                    }
                }
                for jornada in jornadas
            ]
        }

    except Error as erro:
        print(f"Erro ao gerar relatório: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível gerar o relatório."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao gerar relatório: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get("/jornadas/excel")
def exportar_relatorio_jornadas_excel(
    data_inicio: date,
    data_fim: date,
    estilo: Literal[
        "colorido",
        "preto_branco"
    ] = Query(default="colorido"),
    id_usuario: int | None = Query(
        default=None,
        ge=1
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Exporta o relatório como uma planilha XLSX real.
    """

    validar_periodo_relatorio(
        data_inicio=data_inicio,
        data_fim=data_fim
    )

    try:
        resultado = buscar_relatorio_jornadas(
            data_inicio=data_inicio,
            data_fim=data_fim,
            id_usuario=id_usuario
        )

        conteudo = gerar_planilha_relatorio_jornadas(
            jornadas=resultado["jornadas"],
            data_inicio=data_inicio,
            data_fim=data_fim,
            preto_e_branco=(
                estilo == "preto_branco"
            )
        )

        sufixo_estilo = (
            "-preto-e-branco"
            if estilo == "preto_branco"
            else "-colorido"
        )

        nome_arquivo = (
            "relatorio-jornadas-" +
            data_inicio.isoformat() +
            "-a-" +
            data_fim.isoformat() +
            sufixo_estilo +
            ".xlsx"
        )

        return StreamingResponse(
            BytesIO(conteudo),
            media_type=(
                "application/vnd.openxmlformats-"
                "officedocument.spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{nome_arquivo}"'
                ),
                "Content-Length": str(len(conteudo))
            }
        )

    except Error as erro:
        print(f"Erro ao exportar relatório: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível exportar o relatório."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao exportar relatório: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
