from datetime import datetime, timedelta

from mysql.connector import Error

from banco.conexao import criar_conexao
from configuracao_seguranca import SESSAO_DURACAO_HORAS
from modelos.autenticacao import LoginEntrada
from utilitarios.seguranca_senha import (
    gerar_hash_senha,
    verificar_senha
)
from utilitarios.seguranca_sessao import (
    gerar_hash_token,
    gerar_token_sessao
)


HASH_SENHA_FICTICIA = gerar_hash_senha(
    "comparacao-interna-sem-usuario-real"
)


def buscar_usuario_por_cpf(cpf: str):
    """
    Busca um usuário pelo CPF informado.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                senha_hash,
                foto_perfil,
                tipo_usuario,
                situacao_usuario,
                precisa_trocar_senha
            FROM usuarios
            WHERE cpf = %s
            LIMIT 1
        """

        cursor.execute(comando_sql, (cpf,))

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def criar_sessao_usuario(
    id_usuario: int,
    descricao_aparelho: str | None
) -> str:
    """
    Cria uma nova sessão e devolve o token verdadeiro ao aparelho.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        token_sessao = gerar_token_sessao()
        token_hash = gerar_hash_token(token_sessao)
        data_expiracao = datetime.now() + timedelta(
            hours=SESSAO_DURACAO_HORAS
        )

        comando_encerrar_legadas = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
              AND sessao_ativa = TRUE
              AND data_expiracao IS NULL
        """

        cursor.execute(
            comando_encerrar_legadas,
            (id_usuario,)
        )

        comando_sql = """
            INSERT INTO sessoes_acesso (
                id_usuario,
                token_sessao,
                descricao_aparelho,
                ultimo_acesso,
                data_expiracao,
                sessao_ativa
            )
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP, %s, TRUE)
        """

        cursor.execute(
            comando_sql,
            (
                id_usuario,
                token_hash,
                descricao_aparelho,
                data_expiracao
            )
        )

        conexao.commit()

        return token_sessao

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def autenticar_usuario(dados: LoginEntrada):
    """
    Confere o CPF e a senha antes de criar uma sessão.
    """

    usuario = buscar_usuario_por_cpf(dados.cpf)

    if usuario is None:
        verificar_senha(
            dados.senha,
            HASH_SENHA_FICTICIA
        )

        return {
            "sucesso": False,
            "motivo": "DADOS_INVALIDOS"
        }

    if usuario["situacao_usuario"] != "ATIVO":
        return {
            "sucesso": False,
            "motivo": "USUARIO_INATIVO"
        }

    if not verificar_senha(
        dados.senha,
        usuario["senha_hash"]
    ):
        return {
            "sucesso": False,
            "motivo": "DADOS_INVALIDOS"
        }

    token_sessao = criar_sessao_usuario(
        id_usuario=usuario["id_usuario"],
        descricao_aparelho=dados.descricao_aparelho
    )

    return {
        "sucesso": True,
        "token_sessao": token_sessao,
        "usuario": {
            "id_usuario": usuario["id_usuario"],
            "nome_completo": usuario["nome_completo"],
            "tipo_usuario": usuario["tipo_usuario"],
            "precisa_trocar_senha": bool(
                usuario["precisa_trocar_senha"]
            )
        }
    }


def buscar_usuario_por_token(token_sessao: str):
    """
    Busca o usuário relacionado a uma sessão ativa.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        token_hash = gerar_hash_token(token_sessao)

        comando_sql = """
            SELECT
                u.id_usuario,
                u.nome_completo,
                u.telefone,
                u.data_nascimento,
                u.foto_perfil,
                u.tipo_usuario,
                u.situacao_usuario,
                u.precisa_trocar_senha,
                s.id_sessao
            FROM sessoes_acesso s
            INNER JOIN usuarios u
                ON u.id_usuario = s.id_usuario
            WHERE s.token_sessao = %s
              AND s.sessao_ativa = TRUE
              AND u.situacao_usuario = 'ATIVO'
              AND s.data_expiracao > CURRENT_TIMESTAMP
            LIMIT 1
        """

        cursor.execute(comando_sql, (token_hash,))
        usuario = cursor.fetchone()

        if usuario is None:
            return None

        comando_atualizacao = """
            UPDATE sessoes_acesso
            SET ultimo_acesso = CURRENT_TIMESTAMP
            WHERE id_sessao = %s
        """

        cursor.execute(
            comando_atualizacao,
            (usuario["id_sessao"],)
        )

        conexao.commit()

        return usuario

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def encerrar_sessao(token_sessao: str) -> bool:
    """
    Desativa a sessão quando o usuário toca em Sair da conta.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        token_hash = gerar_hash_token(token_sessao)

        comando_sql = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE token_sessao = %s
              AND sessao_ativa = TRUE
        """

        cursor.execute(comando_sql, (token_hash,))
        conexao.commit()

        return cursor.rowcount > 0

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
def listar_sessoes_ativas_usuario(
    id_usuario: int
) -> list[dict]:
    """
    Lista os aparelhos que ainda possuem acesso à conta.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_sessao,
                descricao_aparelho,
                data_criacao,
                ultimo_acesso
            FROM sessoes_acesso
            WHERE id_usuario = %s
              AND sessao_ativa = TRUE
              AND data_expiracao > CURRENT_TIMESTAMP
            ORDER BY ultimo_acesso DESC, id_sessao DESC
        """

        cursor.execute(
            comando_sql,
            (id_usuario,)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()


def encerrar_sessao_usuario_por_id(
    id_usuario: int,
    id_sessao: int,
    id_sessao_atual: int
) -> dict:
    """
    Encerra um acesso pertencente ao usuário, preservando a sessão atual.
    """

    if id_sessao == id_sessao_atual:
        return {
            "sucesso": False,
            "motivo": "SESSAO_ATUAL"
        }

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor()

    try:
        comando_sql = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE id_sessao = %s
              AND id_usuario = %s
              AND sessao_ativa = TRUE
        """

        cursor.execute(
            comando_sql,
            (
                id_sessao,
                id_usuario
            )
        )

        conexao.commit()

        if cursor.rowcount == 0:
            return {
                "sucesso": False,
                "motivo": "SESSAO_NAO_ENCONTRADA"
            }

        return {
            "sucesso": True
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def encerrar_outras_sessoes_usuario(
    id_usuario: int,
    id_sessao_atual: int
) -> int:
    """
    Encerra todos os outros acessos, mantendo o aparelho em uso conectado.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor()

    try:
        comando_sql = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
              AND id_sessao <> %s
              AND sessao_ativa = TRUE
        """

        cursor.execute(
            comando_sql,
            (
                id_usuario,
                id_sessao_atual
            )
        )

        quantidade_encerrada = cursor.rowcount

        conexao.commit()

        return quantidade_encerrada

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def buscar_perfil_usuario(
    id_usuario: int
):
    """
    Busca os dados completos do perfil do usuário conectado.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                foto_perfil,
                tipo_usuario,
                situacao_usuario,
                precisa_trocar_senha,
                data_cadastro,
                data_atualizacao
            FROM usuarios
            WHERE id_usuario = %s
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (id_usuario,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()
        
def trocar_senha_usuario(
    id_usuario: int,
    senha_atual: str,
    nova_senha: str,
    id_sessao_atual: int
) -> dict:
    """
    Confere a senha atual e atualiza a senha do usuário.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT
                id_usuario,
                senha_hash,
                situacao_usuario
            FROM usuarios
            WHERE id_usuario = %s
            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (id_usuario,)
        )

        usuario = cursor.fetchone()

        if usuario is None:
            return {
                "sucesso": False,
                "motivo": "USUARIO_NAO_ENCONTRADO"
            }

        if usuario["situacao_usuario"] != "ATIVO":
            return {
                "sucesso": False,
                "motivo": "USUARIO_INATIVO"
            }

        senha_hash_atual = usuario["senha_hash"]

        if not verificar_senha(
            senha_atual,
            senha_hash_atual
        ):
            return {
                "sucesso": False,
                "motivo": "SENHA_ATUAL_INCORRETA"
            }

        if verificar_senha(
            nova_senha,
            senha_hash_atual
        ):
            return {
                "sucesso": False,
                "motivo": "NOVA_SENHA_IGUAL_ATUAL"
            }

        nova_senha_hash = gerar_hash_senha(
            nova_senha
        )

        comando_atualizacao = """
            UPDATE usuarios
            SET
                senha_hash = %s,
                precisa_trocar_senha = FALSE,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                nova_senha_hash,
                id_usuario
            )
        )

        comando_encerrar_outras_sessoes = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
              AND id_sessao <> %s
              AND sessao_ativa = TRUE
        """

        cursor.execute(
            comando_encerrar_outras_sessoes,
            (
                id_usuario,
                id_sessao_atual
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_usuario": id_usuario
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
