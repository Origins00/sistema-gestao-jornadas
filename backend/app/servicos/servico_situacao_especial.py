"""
Serviço responsável pelas situações especiais dos funcionários.

As alterações são preservadas em uma tabela de histórico.
"""

from datetime import date

from mysql.connector import Error

from banco.conexao import criar_conexao

from modelos.situacao_especial import (
    AlteracaoSituacaoEspecial,
    RemocaoSituacaoEspecial,
    SituacaoEspecialEntrada
)


def normalizar_texto_opcional(
    texto: str | None
) -> str | None:
    """
    Remove espaços desnecessários.

    Um texto vazio é transformado em None.
    """

    if texto is None:

        return None

    texto_limpo = texto.strip()

    if not texto_limpo:

        return None

    return texto_limpo


def criar_situacao_especial(
    dados: SituacaoEspecialEntrada,
    id_administrador: int
) -> dict:
    """
    Cria uma situação especial e registra a criação
    no histórico.
    """

    conexao = criar_conexao()

    if conexao is None:

        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(
        dictionary=True
    )

    try:

        # Confere se a pessoa existe e pode registrar jornadas
        comando_usuario = """
            SELECT
                id_usuario,
                nome_completo,
                tipo_usuario,
                situacao_usuario
            FROM usuarios
            WHERE id_usuario = %s
              AND tipo_usuario IN (
                  'FUNCIONARIO',
                  'ADMINISTRADOR'
              )
            LIMIT 1
        """

        cursor.execute(
            comando_usuario,
            (dados.id_usuario,)
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

        # Confere se já existe uma situação nessa data
        comando_situacao_existente = """
            SELECT
                id_situacao,
                tipo_situacao
            FROM situacoes_especiais_dias
            WHERE id_usuario = %s
              AND data_situacao = %s
            LIMIT 1
        """

        cursor.execute(
            comando_situacao_existente,
            (
                dados.id_usuario,
                dados.data_situacao
            )
        )

        situacao_existente = cursor.fetchone()

        if situacao_existente is not None:

            return {
                "sucesso": False,
                "motivo": "SITUACAO_JA_EXISTENTE",
                "id_situacao": (
                    situacao_existente["id_situacao"]
                ),
                "tipo_situacao": (
                    situacao_existente["tipo_situacao"]
                )
            }

        motivo = normalizar_texto_opcional(
            dados.motivo
        )

        # Cria a situação atual
        comando_criacao = """
            INSERT INTO situacoes_especiais_dias (
                id_usuario,
                data_situacao,
                tipo_situacao,
                motivo,
                id_administrador_registro
            )
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(
            comando_criacao,
            (
                dados.id_usuario,
                dados.data_situacao,
                dados.tipo_situacao.value,
                motivo,
                id_administrador
            )
        )

        id_situacao = cursor.lastrowid

        # Registra a criação no histórico
        comando_historico = """
            INSERT INTO historico_situacoes_especiais (
                id_usuario,
                data_situacao,
                id_situacao_origem,
                acao_realizada,
                tipo_anterior,
                tipo_novo,
                motivo_anterior,
                motivo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                %s,
                'CRIADA',
                NULL,
                %s,
                NULL,
                %s,
                NULL,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                dados.id_usuario,
                dados.data_situacao,
                id_situacao,
                dados.tipo_situacao.value,
                motivo,
                id_administrador
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_situacao": id_situacao,
            "id_usuario": dados.id_usuario,
            "nome_completo": usuario["nome_completo"],
            "data_situacao": dados.data_situacao,
            "tipo_situacao": dados.tipo_situacao.value,
            "motivo_situacao": motivo,
            "id_administrador": id_administrador
        }

    except Error:

        conexao.rollback()

        raise

    finally:

        cursor.close()
        conexao.close()


def alterar_situacao_especial(
    id_situacao: int,
    dados: AlteracaoSituacaoEspecial,
    id_administrador: int
) -> dict:
    """
    Altera uma situação e guarda os valores anteriores
    e novos no histórico.
    """

    conexao = criar_conexao()

    if conexao is None:

        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(
        dictionary=True
    )

    try:

        # Bloqueia temporariamente o registro durante a alteração
        comando_busca = """
            SELECT
                situacao.id_situacao,
                situacao.id_usuario,
                situacao.data_situacao,
                situacao.tipo_situacao,
                situacao.motivo,
                usuario.nome_completo
            FROM situacoes_especiais_dias situacao
            INNER JOIN usuarios usuario
                ON usuario.id_usuario = situacao.id_usuario
            WHERE situacao.id_situacao = %s
            LIMIT 1
            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_situacao,)
        )

        situacao = cursor.fetchone()

        if situacao is None:

            return {
                "sucesso": False,
                "motivo": "SITUACAO_NAO_ENCONTRADA"
            }

        tipo_anterior = situacao["tipo_situacao"]

        motivo_anterior = normalizar_texto_opcional(
            situacao["motivo"]
        )

        tipo_novo = dados.tipo_situacao.value

        motivo_novo = normalizar_texto_opcional(
            dados.motivo
        )

        motivo_alteracao = normalizar_texto_opcional(
            dados.motivo_alteracao
        )

        if (
            tipo_anterior == tipo_novo
            and motivo_anterior == motivo_novo
        ):

            return {
                "sucesso": False,
                "motivo": "NENHUMA_ALTERACAO"
            }

        # Atualiza a situação atual
        comando_atualizacao = """
            UPDATE situacoes_especiais_dias
            SET
                tipo_situacao = %s,
                motivo = %s,
                id_administrador_registro = %s
            WHERE id_situacao = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                tipo_novo,
                motivo_novo,
                id_administrador,
                id_situacao
            )
        )

        # Registra a alteração no histórico
        comando_historico = """
            INSERT INTO historico_situacoes_especiais (
                id_usuario,
                data_situacao,
                id_situacao_origem,
                acao_realizada,
                tipo_anterior,
                tipo_novo,
                motivo_anterior,
                motivo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                %s,
                'ALTERADA',
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                situacao["id_usuario"],
                situacao["data_situacao"],
                id_situacao,
                tipo_anterior,
                tipo_novo,
                motivo_anterior,
                motivo_novo,
                motivo_alteracao,
                id_administrador
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_situacao": id_situacao,
            "id_usuario": situacao["id_usuario"],
            "nome_completo": situacao["nome_completo"],
            "data_situacao": situacao["data_situacao"],
            "tipo_anterior": tipo_anterior,
            "tipo_novo": tipo_novo,
            "motivo_anterior": motivo_anterior,
            "motivo_novo": motivo_novo,
            "motivo_alteracao": motivo_alteracao,
            "id_administrador": id_administrador
        }

    except Error:

        conexao.rollback()

        raise

    finally:

        cursor.close()
        conexao.close()


def remover_situacao_especial(
    id_situacao: int,
    dados: RemocaoSituacaoEspecial,
    id_administrador: int
) -> dict:
    """
    Remove a situação atual sem apagar seu histórico.
    """

    conexao = criar_conexao()

    if conexao is None:

        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(
        dictionary=True
    )

    try:

        comando_busca = """
            SELECT
                situacao.id_situacao,
                situacao.id_usuario,
                situacao.data_situacao,
                situacao.tipo_situacao,
                situacao.motivo,
                usuario.nome_completo
            FROM situacoes_especiais_dias situacao
            INNER JOIN usuarios usuario
                ON usuario.id_usuario = situacao.id_usuario
            WHERE situacao.id_situacao = %s
            LIMIT 1
            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_situacao,)
        )

        situacao = cursor.fetchone()

        if situacao is None:

            return {
                "sucesso": False,
                "motivo": "SITUACAO_NAO_ENCONTRADA"
            }

        motivo_remocao = normalizar_texto_opcional(
            dados.motivo_remocao
        )

        # Guarda a remoção antes de excluir a situação atual
        comando_historico = """
            INSERT INTO historico_situacoes_especiais (
                id_usuario,
                data_situacao,
                id_situacao_origem,
                acao_realizada,
                tipo_anterior,
                tipo_novo,
                motivo_anterior,
                motivo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                %s,
                'REMOVIDA',
                %s,
                NULL,
                %s,
                NULL,
                %s,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                situacao["id_usuario"],
                situacao["data_situacao"],
                id_situacao,
                situacao["tipo_situacao"],
                situacao["motivo"],
                motivo_remocao,
                id_administrador
            )
        )

        comando_remocao = """
            DELETE FROM situacoes_especiais_dias
            WHERE id_situacao = %s
        """

        cursor.execute(
            comando_remocao,
            (id_situacao,)
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_situacao": id_situacao,
            "id_usuario": situacao["id_usuario"],
            "nome_completo": situacao["nome_completo"],
            "data_situacao": situacao["data_situacao"],
            "tipo_situacao": situacao["tipo_situacao"],
            "motivo_situacao": situacao["motivo"],
            "motivo_remocao": motivo_remocao,
            "id_administrador": id_administrador
        }

    except Error:

        conexao.rollback()

        raise

    finally:

        cursor.close()
        conexao.close()


def buscar_situacoes_por_data(
    data_situacao: date
) -> list[dict]:
    """
    Lista as situações que estão atualmente aplicadas
    em uma data.
    """

    conexao = criar_conexao()

    if conexao is None:

        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(
        dictionary=True
    )

    try:

        comando_sql = """
            SELECT
                situacao.id_situacao,
                situacao.id_usuario,
                situacao.data_situacao,
                situacao.tipo_situacao,
                situacao.motivo,
                situacao.id_administrador_registro,
                situacao.data_registro,
                situacao.data_atualizacao,

                usuario.nome_completo,
                usuario.cpf,
                usuario.tipo_usuario,
                usuario.situacao_usuario,

                administrador.nome_completo
                    AS nome_administrador

            FROM situacoes_especiais_dias situacao

            INNER JOIN usuarios usuario
                ON usuario.id_usuario = situacao.id_usuario

            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    situacao.id_administrador_registro

            WHERE situacao.data_situacao = %s

            ORDER BY usuario.nome_completo ASC
        """

        cursor.execute(
            comando_sql,
            (data_situacao,)
        )

        return cursor.fetchall()

    finally:

        cursor.close()
        conexao.close()


def buscar_historico_situacoes_usuario(
    id_usuario: int
) -> list[dict]:
    """
    Consulta todas as inclusões, alterações e remoções
    de situações especiais de uma pessoa.
    """

    conexao = criar_conexao()

    if conexao is None:

        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(
        dictionary=True
    )

    try:

        comando_sql = """
            SELECT
                historico.id_historico,
                historico.id_usuario,
                historico.data_situacao,
                historico.id_situacao_origem,
                historico.acao_realizada,
                historico.tipo_anterior,
                historico.tipo_novo,
                historico.motivo_anterior,
                historico.motivo_novo,
                historico.motivo_alteracao,
                historico.id_administrador,
                historico.data_alteracao,

                usuario.nome_completo,
                usuario.cpf,

                administrador.nome_completo
                    AS nome_administrador

            FROM historico_situacoes_especiais historico

            INNER JOIN usuarios usuario
                ON usuario.id_usuario = historico.id_usuario

            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    historico.id_administrador

            WHERE historico.id_usuario = %s

            ORDER BY
                historico.data_alteracao DESC,
                historico.id_historico DESC
        """

        cursor.execute(
            comando_sql,
            (id_usuario,)
        )

        return cursor.fetchall()

    finally:

        cursor.close()
        conexao.close()