import sys
from datetime import datetime
from getpass import getpass
from pathlib import Path

from mysql.connector import Error


# Permite executar este arquivo diretamente pelo terminal
caminho_app = Path(__file__).resolve().parents[1]
sys.path.append(str(caminho_app))

from banco.conexao import criar_conexao
from utilitarios.seguranca_senha import (
    TAMANHO_MAXIMO_SENHA,
    TAMANHO_MINIMO_NOVA_SENHA,
    gerar_hash_senha
)
from utilitarios.validador_cpf import limpar_cpf, validar_cpf


def criar_admin_inicial():
    """
    Cria o primeiro administrador do Gestor de Jornadas.
    """

    print("\n=== Criação do administrador inicial ===\n")

    nome_completo = input("Nome completo: ").strip()
    cpf_informado = input("CPF: ").strip()
    telefone = input("Telefone: ").strip()
    data_nascimento_texto = input(
        "Data de nascimento (AAAA-MM-DD): "
    ).strip()

    senha = getpass("Senha: ")
    confirmar_senha = getpass("Confirme a senha: ")

    cpf = limpar_cpf(cpf_informado)

    if not validar_cpf(cpf):
        print("\nCPF inválido.")
        return

    if senha != confirmar_senha:
        print("\nAs senhas não são iguais.")
        return

    if len(senha) < TAMANHO_MINIMO_NOVA_SENHA:
        print(
            "\nA senha precisa ter pelo menos "
            f"{TAMANHO_MINIMO_NOVA_SENHA} caracteres."
        )
        return

    if len(senha) > TAMANHO_MAXIMO_SENHA:
        print(
            "\nA senha pode ter no máximo "
            f"{TAMANHO_MAXIMO_SENHA} caracteres."
        )
        return

    try:
        data_nascimento = datetime.strptime(
            data_nascimento_texto,
            "%Y-%m-%d"
        ).date()

    except ValueError:
        print("\nA data precisa estar no formato AAAA-MM-DD.")
        return

    conexao = criar_conexao()

    if conexao is None:
        print("\nNão foi possível acessar o banco de dados.")
        return

    cursor = conexao.cursor()

    try:
        comando_busca = """
            SELECT id_usuario
            FROM usuarios
            WHERE cpf = %s
            LIMIT 1
        """

        cursor.execute(comando_busca, (cpf,))

        if cursor.fetchone() is not None:
            print("\nJá existe um usuário com esse CPF.")
            return

        senha_hash = gerar_hash_senha(senha)

        comando_insercao = """
            INSERT INTO usuarios (
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                senha_hash,
                tipo_usuario,
                situacao_usuario
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        valores = (
            nome_completo,
            cpf,
            telefone,
            data_nascimento,
            senha_hash,
            "ADMINISTRADOR",
            "ATIVO"
        )

        cursor.execute(comando_insercao, valores)
        conexao.commit()

        print("\nAdministrador criado com sucesso!")
        print(f"ID do administrador: {cursor.lastrowid}")

    except Error as erro:
        conexao.rollback()
        print(f"\nErro ao criar administrador: {erro}")

    finally:
        cursor.close()
        conexao.close()


if __name__ == "__main__":
    criar_admin_inicial()
