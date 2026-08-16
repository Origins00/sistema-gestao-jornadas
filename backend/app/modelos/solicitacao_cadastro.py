from datetime import date

from pydantic import BaseModel, Field, field_validator

from utilitarios.validador_cpf import limpar_cpf, validar_cpf
from utilitarios.seguranca_senha import (
    TAMANHO_MAXIMO_SENHA,
    TAMANHO_MINIMO_NOVA_SENHA
)


class SolicitacaoCadastroEntrada(BaseModel):
    """
    Representa os dados enviados por uma pessoa ao solicitar acesso.
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

    senha: str = Field(
        min_length=TAMANHO_MINIMO_NOVA_SENHA,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    @field_validator("nome_completo")
    @classmethod
    def validar_nome_completo(cls, nome_completo: str) -> str:
        nome_ajustado = " ".join(nome_completo.split())

        if len(nome_ajustado) < 3:
            raise ValueError("O nome completo precisa ter pelo menos 3 caracteres.")

        return nome_ajustado

    @field_validator("cpf")
    @classmethod
    def validar_numero_cpf(cls, cpf: str) -> str:
        if not validar_cpf(cpf):
            raise ValueError("O CPF informado não é válido.")

        return limpar_cpf(cpf)

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, telefone: str) -> str:
        telefone_limpo = "".join(
            numero for numero in telefone if numero.isdigit()
        )

        if len(telefone_limpo) < 10 or len(telefone_limpo) > 11:
            raise ValueError(
                "O telefone precisa ter 10 ou 11 números."
            )

        return telefone_limpo
