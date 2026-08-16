"""
Modelos usados nas operações administrativas de feriados.
"""

from datetime import date

from pydantic import BaseModel, Field


class FeriadoEntrada(BaseModel):
    """
    Dados necessários para cadastrar um feriado.
    """

    data_feriado: date

    nome_feriado: str = Field(
        min_length=1,
        max_length=120
    )

    descricao: str | None = Field(
        default=None,
        max_length=500
    )


class AlteracaoFeriado(BaseModel):
    """
    Dados usados para editar o nome ou a descrição.
    """

    nome_feriado: str = Field(
        min_length=1,
        max_length=120
    )

    descricao: str | None = Field(
        default=None,
        max_length=500
    )

    motivo_alteracao: str | None = Field(
        default=None,
        max_length=500
    )


class MudancaSituacaoFeriado(BaseModel):
    """
    Dados usados ao desativar ou reativar um feriado.
    """

    motivo_alteracao: str | None = Field(
        default=None,
        max_length=500
    )