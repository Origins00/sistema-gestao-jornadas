from datetime import date
from enum import Enum

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator
)

from utilitarios.validador_cpf import (
    limpar_cpf,
    validar_cpf
)
from utilitarios.seguranca_senha import (
    TAMANHO_MAXIMO_SENHA,
    TAMANHO_MINIMO_NOVA_SENHA
)


class RespostaSolicitacaoCadastro(BaseModel):
    """
    Representa a decisão do administrador sobre uma solicitação.
    """

    observacao: str | None = Field(
        default=None,
        max_length=500
    )


class RevisaoAlteracaoHorario(BaseModel):
    """
    Representa a revisão de uma alteração de horário.
    """

    observacao: str | None = Field(
        default=None,
        max_length=500
    )


class SituacaoUsuario(str, Enum):
    """
    Situações permitidas para uma conta.
    """

    ATIVO = "ATIVO"
    INATIVO = "INATIVO"


class AlteracaoSituacaoUsuario(BaseModel):
    """
    Representa a ativação ou desativação de uma conta.
    """

    situacao_usuario: SituacaoUsuario

    observacao: str | None = Field(
        default=None,
        max_length=500
    )


class RedefinicaoSenhaUsuario(BaseModel):
    """
    Representa a criação de uma senha provisória pelo administrador.
    """

    nova_senha: str = Field(
        min_length=TAMANHO_MINIMO_NOVA_SENHA,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    confirmacao_nova_senha: str = Field(
        min_length=TAMANHO_MINIMO_NOVA_SENHA,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    @model_validator(mode="after")
    def validar_confirmacao_senha(self):
        """
        Confere se a senha provisória foi confirmada corretamente.
        """

        if self.nova_senha != self.confirmacao_nova_senha:
            raise ValueError(
                "A confirmação da nova senha não corresponde."
            )

        return self


class AtualizacaoDadosUsuario(BaseModel):
    """
    Representa a correção de dados cadastrais pelo administrador.
    """

    nome_completo: str = Field(
        min_length=3,
        max_length=150
    )

    cpf: str

    telefone: str = Field(
        min_length=8,
        max_length=20
    )

    data_nascimento: date

    @field_validator("nome_completo")
    @classmethod
    def validar_nome_completo(
        cls,
        nome_completo: str
    ) -> str:
        nome_ajustado = " ".join(
            nome_completo.split()
        )

        if len(nome_ajustado) < 3:
            raise ValueError(
                "O nome completo precisa ter "
                "pelo menos 3 caracteres."
            )

        return nome_ajustado

    @field_validator("cpf")
    @classmethod
    def validar_numero_cpf(
        cls,
        cpf: str
    ) -> str:
        if not validar_cpf(cpf):
            raise ValueError(
                "O CPF informado não é válido."
            )

        return limpar_cpf(cpf)

    @field_validator("telefone")
    @classmethod
    def validar_telefone(
        cls,
        telefone: str
    ) -> str:
        telefone_limpo = "".join(
            numero
            for numero in telefone
            if numero.isdigit()
        )

        if len(telefone_limpo) not in (10, 11):
            raise ValueError(
                "O telefone precisa ter 10 ou 11 números."
            )

        return telefone_limpo

    @field_validator("data_nascimento")
    @classmethod
    def validar_data_nascimento(
        cls,
        data_nascimento: date
    ) -> date:
        if data_nascimento > date.today():
            raise ValueError(
                "A data de nascimento não pode "
                "estar no futuro."
            )

        return data_nascimento
