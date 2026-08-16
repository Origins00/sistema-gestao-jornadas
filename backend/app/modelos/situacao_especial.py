from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


# Tipos de situações que podem ser marcadas pelo administrador
class TipoSituacaoEspecial(str, Enum):

    ATESTADO = "ATESTADO"

    FERIAS = "FERIAS"

    FOLGA = "FOLGA"

    AUSENCIA = "AUSENCIA"

    DIA_ENCERRADO = "DIA_ENCERRADO"


# Dados usados ao criar uma situação especial
class SituacaoEspecialEntrada(BaseModel):

    id_usuario: int = Field(
        gt=0
    )

    data_situacao: date

    tipo_situacao: TipoSituacaoEspecial

    motivo: str | None = Field(
        default=None,
        max_length=500
    )


# Dados usados ao alterar uma situação existente
class AlteracaoSituacaoEspecial(BaseModel):

    tipo_situacao: TipoSituacaoEspecial

    motivo: str | None = Field(
        default=None,
        max_length=500
    )

    motivo_alteracao: str | None = Field(
        default=None,
        max_length=500
    )


# Dados usados ao remover uma situação especial
class RemocaoSituacaoEspecial(BaseModel):

    motivo_remocao: str | None = Field(
        default=None,
        max_length=500
    )