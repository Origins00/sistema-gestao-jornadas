import os
import sys
from datetime import date
from getpass import getpass
from pathlib import Path

from mysql.connector import Error


CAMINHO_APP = Path(__file__).resolve().parents[1]
sys.path.append(str(CAMINHO_APP))

from banco.conexao import criar_conexao
from utilitarios.seguranca_senha import (
    TAMANHO_MAXIMO_SENHA,
    TAMANHO_MINIMO_NOVA_SENHA,
    gerar_hash_senha,
)


def gerar_cpf_sintetico(base: str) -> str:
    """Calcula um CPF sintético a partir de nove dígitos de demonstração."""

    numeros = [int(numero) for numero in base]

    if len(numeros) != 9:
        raise ValueError("A base do CPF sintético precisa ter nove dígitos.")

    for quantidade in (9, 10):
        soma = sum(
            numeros[indice] * (quantidade + 1 - indice)
            for indice in range(quantidade)
        )
        digito = 11 - (soma % 11)
        numeros.append(0 if digito >= 10 else digito)

    return "".join(str(numero) for numero in numeros)


def solicitar_senha() -> str:
    senha = getpass("Senha para as contas fictícias: ")
    confirmacao = getpass("Confirme a senha: ")

    if senha != confirmacao:
        raise ValueError("As senhas informadas não são iguais.")

    if not TAMANHO_MINIMO_NOVA_SENHA <= len(senha) <= TAMANHO_MAXIMO_SENHA:
        raise ValueError(
            "A senha deve possuir entre "
            f"{TAMANHO_MINIMO_NOVA_SENHA} e {TAMANHO_MAXIMO_SENHA} caracteres."
        )

    return senha


def criar_dados_demonstracao() -> None:
    ambiente = os.getenv("AMBIENTE", "producao").strip().lower()

    if ambiente not in {"desenvolvimento", "demonstracao"}:
        raise RuntimeError(
            "A criação de dados fictícios só é permitida em desenvolvimento."
        )

    senha_hash = gerar_hash_senha(solicitar_senha())
    usuarios = [
        (
            "Ana Demonstração",
            gerar_cpf_sintetico("123456789"),
            "0" * 11,
            date(1992, 4, 15),
            "ADMINISTRADOR",
        ),
        (
            "Bruno Exemplo",
            gerar_cpf_sintetico("987654321"),
            "0" * 11,
            date(1997, 9, 20),
            "FUNCIONARIO",
        ),
    ]

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível conectar ao banco de dados local.")

    cursor = conexao.cursor()

    try:
        for nome, cpf, telefone, nascimento, tipo in usuarios:
            cursor.execute(
                """
                INSERT INTO usuarios (
                    nome_completo,
                    cpf,
                    telefone,
                    data_nascimento,
                    senha_hash,
                    tipo_usuario,
                    situacao_usuario
                )
                VALUES (%s, %s, %s, %s, %s, %s, 'ATIVO')
                ON DUPLICATE KEY UPDATE
                    nome_completo = VALUES(nome_completo),
                    telefone = VALUES(telefone),
                    data_nascimento = VALUES(data_nascimento),
                    senha_hash = VALUES(senha_hash),
                    tipo_usuario = VALUES(tipo_usuario),
                    situacao_usuario = 'ATIVO'
                """,
                (nome, cpf, telefone, nascimento, senha_hash, tipo),
            )

        conexao.commit()

        print("\nDados fictícios criados com sucesso.")

        for nome, cpf, *_ in usuarios:
            print(f"- {nome}: CPF de demonstração {cpf}")

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


if __name__ == "__main__":
    criar_dados_demonstracao()
