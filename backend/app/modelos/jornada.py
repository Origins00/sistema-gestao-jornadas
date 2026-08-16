from datetime import date, datetime, time
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator


class TipoTrabalho(str, Enum):
    """
    Tipos de trabalho disponíveis durante a jornada.
    """

    ADMINISTRATIVO = "ADMINISTRATIVO"
    OPERACIONAL = "OPERACIONAL"


class OrigemRegistro(str, Enum):
    """
    Informa como o horário foi preenchido pelo usuário.
    """

    HORARIO_ATUAL = "HORARIO_ATUAL"
    DIGITADO_MANUALMENTE = "DIGITADO_MANUALMENTE"


class TipoRegistro(str, Enum):
    """
    Etapas que podem ser mantidas na fila offline.
    """

    ENTRADA = "ENTRADA"
    INICIO_ALMOCO = "INICIO_ALMOCO"
    FIM_ALMOCO = "FIM_ALMOCO"
    SAIDA = "SAIDA"


class DadosOperacaoOffline(BaseModel):
    """
    Metadados opcionais enviados por uma operacao criada no aparelho.
    """

    chave_operacao_offline: UUID | None = None
    data_hora_dispositivo: datetime | None = None


class JornadaEntrada(BaseModel):
    """
    Representa os dados necessários para abrir uma jornada.
    """

    data_jornada: date
    tipo_trabalho_inicio: TipoTrabalho

    @field_validator("data_jornada")
    @classmethod
    def impedir_data_futura(cls, data_jornada: date) -> date:
        # Não permite criar registros em dias que ainda não aconteceram
        if data_jornada > date.today():
            raise ValueError(
                "Não é possível abrir uma jornada em uma data futura."
            )

        return data_jornada


class JornadaHistoricaCompleta(BaseModel):
    """
    Representa uma jornada esquecida que será criada por completo
    em uma data anterior ao dia atual.
    """

    data_jornada: date
    tipo_trabalho_inicio: TipoTrabalho
    horario_entrada: time
    horario_inicio_almoco: time
    horario_fim_almoco: time
    horario_saida: time
    tipo_trabalho_apos_almoco: TipoTrabalho
    atividade_do_dia: str | None = None

    @field_validator("data_jornada")
    @classmethod
    def exigir_data_passada(cls, data_jornada: date) -> date:
        if data_jornada >= date.today():
            raise ValueError(
                "A criação pelo histórico é permitida somente em datas passadas."
            )

        return data_jornada

    @field_validator("atividade_do_dia")
    @classmethod
    def normalizar_atividade(cls, atividade: str | None) -> str | None:
        if atividade is None:
            return None

        atividade = atividade.strip()

        return atividade or None

    @model_validator(mode="after")
    def validar_ordem_horarios(self):
        horarios = (
            self.horario_entrada,
            self.horario_inicio_almoco,
            self.horario_fim_almoco,
            self.horario_saida
        )

        if any(
            horario_atual > horario_seguinte
            for horario_atual, horario_seguinte in zip(
                horarios,
                horarios[1:]
            )
        ):
            raise ValueError(
                "Os horários devem seguir a ordem: entrada, almoço, retorno e saída."
            )

        return self


class RegistroEntrada(DadosOperacaoOffline):
    """
    Representa o horário de entrada informado pelo usuário.
    """

    horario_informado: time
    origem_registro: OrigemRegistro


class RegistroInicioAlmoco(DadosOperacaoOffline):
    """
    Representa o horário de início do almoço.
    """

    horario_informado: time
    origem_registro: OrigemRegistro


class RegistroFimAlmoco(DadosOperacaoOffline):
    """
    Representa o retorno do almoço e o tipo de trabalho da tarde.
    """

    horario_informado: time
    origem_registro: OrigemRegistro
    tipo_trabalho_apos_almoco: TipoTrabalho


class RegistroSaida(DadosOperacaoOffline):
    """
    Representa o horário de saída do expediente.
    """

    horario_informado: time
    origem_registro: OrigemRegistro
    atividade_do_dia: str | None = None


class OperacaoSincronizacaoOffline(DadosOperacaoOffline):
    """
    Representa um horario guardado no aparelho e enviado posteriormente.
    """

    chave_operacao_offline: UUID
    data_hora_dispositivo: datetime
    data_jornada: date
    tipo_registro: TipoRegistro
    horario_informado: time
    origem_registro: OrigemRegistro
    tipo_trabalho_inicio: TipoTrabalho | None = None
    tipo_trabalho_apos_almoco: TipoTrabalho | None = None
    atividade_do_dia: str | None = None

    @field_validator("data_jornada")
    @classmethod
    def impedir_data_futura(cls, data_jornada: date) -> date:
        if data_jornada > date.today():
            raise ValueError(
                "Nao e possivel sincronizar uma jornada futura."
            )

        return data_jornada

    @model_validator(mode="after")
    def validar_campos_da_etapa(self):
        if (
            self.tipo_registro == TipoRegistro.ENTRADA
            and self.tipo_trabalho_inicio is None
        ):
            raise ValueError(
                "O tipo de trabalho inicial e obrigatorio na entrada."
            )

        if (
            self.tipo_registro == TipoRegistro.FIM_ALMOCO
            and self.tipo_trabalho_apos_almoco is None
        ):
            raise ValueError(
                "O tipo de trabalho apos o almoco e obrigatorio."
            )

        return self


class AlteracaoHorario(BaseModel):
    """
    Representa a alteração de um horário já registrado.
    """

    horario_novo: time
