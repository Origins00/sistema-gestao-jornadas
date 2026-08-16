import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error


# Localiza o arquivo .env dentro da pasta backend
caminho_backend = Path(__file__).resolve().parents[2]
caminho_env = caminho_backend / ".env"

# Carrega as configurações privadas do banco
load_dotenv(caminho_env)

def criar_conexao():
    """
    Cria e devolve uma conexão com o banco de dados do Gestor de Jornadas.
    """

    try:
        conexao = mysql.connector.connect(
            host=os.getenv("BANCO_HOST"),
            port=int(os.getenv("BANCO_PORTA", "3306")),
            user=os.getenv("BANCO_USUARIO"),
            password=os.getenv("BANCO_SENHA"),
            database=os.getenv("BANCO_NOME"),
            # A implementacao nativa (libmysql.dll) apresentou uma falha de
            # memoria no Windows e encerrou todo o servidor. A implementacao
            # pura em Python e compativel com as mesmas consultas e evita que
            # uma DLL do conector derrube o backend.
            use_pure=True,
            connection_timeout=10,
        )

        return conexao

    except Error as erro:
        print(f"Erro ao conectar ao banco de dados: {erro}")
        return None


def testar_conexao():
    """
    Testa se o Python consegue acessar o MySQL e fecha a conexão depois.
    """

    conexao = criar_conexao()

    if conexao is None:
        return False

    try:
        return conexao.is_connected()

    finally:
        if conexao.is_connected():
            conexao.close()
