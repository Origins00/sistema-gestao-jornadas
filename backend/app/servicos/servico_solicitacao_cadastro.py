from mysql.connector import Error

from banco.conexao import criar_conexao
from modelos.solicitacao_cadastro import SolicitacaoCadastroEntrada
from servicos.servico_notificacao import registrar_notificacao
from utilitarios.seguranca_senha import gerar_hash_senha


def cpf_ja_cadastrado(cpf: str) -> bool:
    """
    Verifica se o CPF já pertence a um usuário do sistema.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_sql = """
            SELECT id_usuario
            FROM usuarios
            WHERE cpf = %s
            LIMIT 1
        """

        cursor.execute(comando_sql, (cpf,))

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        conexao.close()


def buscar_solicitacao_por_cpf(cpf: str):
    """
    Busca uma solicitação já existente para o CPF informado.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_solicitacao,
                situacao_solicitacao
            FROM solicitacoes_cadastro
            WHERE cpf = %s
            LIMIT 1
        """

        cursor.execute(comando_sql, (cpf,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def criar_solicitacao_cadastro(
    dados: SolicitacaoCadastroEntrada,
    senha_hash: str | None = None
) -> int:
    """
    Salva uma nova solicitação de cadastro e devolve seu identificador.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        hash_para_salvar = senha_hash or gerar_hash_senha(
            dados.senha
        )

        comando_sql = """
            INSERT INTO solicitacoes_cadastro (
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                senha_hash
            )
            VALUES (%s, %s, %s, %s, %s)
        """

        valores = (
            dados.nome_completo,
            dados.cpf,
            dados.telefone,
            dados.data_nascimento,
            hash_para_salvar
        )

        cursor.execute(comando_sql, valores)

        id_solicitacao = cursor.lastrowid

        registrar_notificacao(
            cursor=cursor,
            tipo_notificacao="SOLICITACAO_CADASTRO",
            titulo="Nova solicitação de cadastro",
            mensagem=(
                f"{dados.nome_completo} solicitou acesso "
                "ao Gestor de Jornadas."
            )
        )

        conexao.commit()

        return id_solicitacao

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
