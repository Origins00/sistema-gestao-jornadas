from pwdlib import PasswordHash


TAMANHO_MINIMO_NOVA_SENHA = 12
TAMANHO_MAXIMO_SENHA = 128


# Utiliza as configurações de segurança recomendadas pela biblioteca
gerenciador_senhas = PasswordHash.recommended()


def gerar_hash_senha(senha: str) -> str:
    """
    Transforma a senha original em um hash seguro antes de salvar.
    """

    return gerenciador_senhas.hash(senha)


def verificar_senha(senha_informada: str, senha_hash: str) -> bool:
    """
    Confere se uma senha informada corresponde ao hash armazenado.
    """

    return gerenciador_senhas.verify(senha_informada, senha_hash)
