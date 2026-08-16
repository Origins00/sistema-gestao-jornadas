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


class LoginEntrada(BaseModel):
    """
    Representa os dados informados na tela de login.
    """

    cpf: str

    senha: str = Field(
        min_length=6,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    descricao_aparelho: str | None = Field(
        default=None,
        max_length=255
    )

    @field_validator("cpf")
    @classmethod
    def validar_numero_cpf(cls, cpf: str) -> str:
        if not validar_cpf(cpf):
            raise ValueError(
                "O CPF informado não é válido."
            )

        return limpar_cpf(cpf)


class TrocaSenhaEntrada(BaseModel):
    """
    Representa os dados necessários para trocar a senha.
    """

    senha_atual: str = Field(
        min_length=6,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    nova_senha: str = Field(
        min_length=TAMANHO_MINIMO_NOVA_SENHA,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    confirmacao_nova_senha: str = Field(
        min_length=TAMANHO_MINIMO_NOVA_SENHA,
        max_length=TAMANHO_MAXIMO_SENHA
    )

    @model_validator(mode="after")
    def validar_troca_senha(self):
        """
        Confere se a nova senha foi confirmada corretamente.
        """

        if self.nova_senha != self.confirmacao_nova_senha:
            raise ValueError(
                "A confirmação da nova senha não corresponde."
            )

        if self.senha_atual == self.nova_senha:
            raise ValueError(
                "A nova senha deve ser diferente da senha atual."
            )

        return self


class UsuarioConectadoResposta(BaseModel):
    """
    Representa os dados básicos do usuário conectado.
    """

    id_usuario: int
    nome_completo: str
    telefone: str | None
    data_nascimento: str | None
    foto_perfil: str | None
    tipo_usuario: str
    precisa_trocar_senha: bool
