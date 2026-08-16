from calendar import monthrange
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from mysql.connector import Error

from servicos.servico_calendario import (
    buscar_dados_dia_calendario,
    buscar_dados_mes_calendario
)

from utilitarios.dependencias_autenticacao import (
    obter_usuario_com_senha_definitiva
)


roteador = APIRouter(
    prefix="/calendario",
    tags=["Calendário"]
)


# =========================================================
# CONSULTA DO MÊS
# =========================================================

@roteador.get(
    "/mes"
)
def consultar_mes_calendario(
    ano: int,
    mes: int,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Retorna as jornadas do usuário conectado, os feriados
    ativos e os aniversários existentes no mês informado.
    """

    try:
        if mes < 1 or mes > 12:
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "O mês deve estar entre 1 e 12."
                )
            )

        if ano < 2000 or ano > 2100:
            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "O ano informado não é válido."
                )
            )

        ultimo_dia = monthrange(
            ano,
            mes
        )[1]

        data_inicio = date(
            ano,
            mes,
            1
        )

        data_fim = date(
            ano,
            mes,
            ultimo_dia
        )

        return buscar_dados_mes_calendario(
            id_usuario=usuario[
                "id_usuario"
            ],
            data_inicio=data_inicio,
            data_fim=data_fim
        )

    except HTTPException:
        raise

    except Error as erro:
        print(
            "Erro ao consultar o calendário mensal: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível consultar o calendário."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao consultar o calendário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "O banco de dados está indisponível."
            )
        )


# =========================================================
# CONSULTA DE UM DIA
# =========================================================

@roteador.get(
    "/dia/{data_calendario}"
)
def consultar_dia_calendario(
    data_calendario: date,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Retorna a jornada, os eventos e os registros editáveis
    da data selecionada no calendário.
    """

    try:
        return buscar_dados_dia_calendario(
            id_usuario=usuario[
                "id_usuario"
            ],
            data_calendario=data_calendario
        )

    except Error as erro:
        print(
            "Erro ao consultar o dia do calendário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível consultar a data selecionada."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao consultar o dia: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "O banco de dados está indisponível."
            )
        )
