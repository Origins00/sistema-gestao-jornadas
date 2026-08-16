from mysql.connector import Error

from banco.conexao import criar_conexao


def registrar_notificacao(
    cursor,
    tipo_notificacao: str,
    titulo: str,
    mensagem: str,
    id_usuario_relacionado: int | None = None
) -> int:
    """
    Registra uma notificação usando a transação da ação de origem.
    """

    comando_sql = """
        INSERT INTO notificacoes (
            id_usuario_relacionado,
            tipo_notificacao,
            titulo,
            mensagem
        )
        VALUES (%s, %s, %s, %s)
    """

    cursor.execute(
        comando_sql,
        (
            id_usuario_relacionado,
            tipo_notificacao,
            titulo,
            mensagem
        )
    )

    return cursor.lastrowid


def listar_notificacoes(
    revisada: bool | None
) -> dict:
    """
    Lista notificações administrativas e calcula o resumo.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        filtro_sql = ""
        parametros: tuple = ()

        if revisada is not None:
            filtro_sql = "WHERE notificacao.revisada = %s"
            parametros = (revisada,)

        comando_lista = f"""
            SELECT
                notificacao.id_notificacao,
                notificacao.tipo_notificacao,
                notificacao.titulo,
                notificacao.mensagem,
                notificacao.revisada,
                notificacao.data_criacao,
                notificacao.data_revisao,
                usuario.id_usuario
                    AS id_usuario_relacionado,
                usuario.nome_completo
                    AS nome_usuario_relacionado,
                revisor.id_usuario
                    AS id_administrador_revisor,
                revisor.nome_completo
                    AS nome_administrador_revisor
            FROM notificacoes notificacao
            LEFT JOIN usuarios usuario
                ON usuario.id_usuario =
                    notificacao.id_usuario_relacionado
            LEFT JOIN usuarios revisor
                ON revisor.id_usuario =
                    notificacao.id_administrador_revisor
            {filtro_sql}
            ORDER BY
                notificacao.revisada ASC,
                notificacao.data_criacao DESC,
                notificacao.id_notificacao DESC
            LIMIT 200
        """

        cursor.execute(
            comando_lista,
            parametros
        )

        notificacoes = cursor.fetchall()

        comando_resumo = """
            SELECT
                COUNT(*) AS quantidade_total,
                COALESCE(
                    SUM(revisada = FALSE),
                    0
                ) AS quantidade_pendentes,
                COALESCE(
                    SUM(revisada = TRUE),
                    0
                ) AS quantidade_revisadas
            FROM notificacoes
        """

        cursor.execute(comando_resumo)
        resumo = cursor.fetchone()

        return {
            "notificacoes": notificacoes,
            "resumo": resumo
        }

    finally:
        cursor.close()
        conexao.close()


def revisar_notificacao(
    id_notificacao: int,
    id_administrador: int
) -> dict:
    """
    Marca uma notificação como revisada.
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
                id_notificacao,
                revisada
            FROM notificacoes
            WHERE id_notificacao = %s
            LIMIT 1
            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_notificacao,)
        )

        notificacao = cursor.fetchone()

        if notificacao is None:
            return {
                "sucesso": False,
                "motivo": "NAO_ENCONTRADA"
            }

        if notificacao["revisada"]:
            return {
                "sucesso": True,
                "ja_revisada": True
            }

        comando_atualizacao = """
            UPDATE notificacoes
            SET
                revisada = TRUE,
                data_revisao = CURRENT_TIMESTAMP,
                id_administrador_revisor = %s
            WHERE id_notificacao = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                id_administrador,
                id_notificacao
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "ja_revisada": False
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def revisar_todas_notificacoes(
    id_administrador: int
) -> int:
    """
    Marca todas as notificações pendentes como revisadas.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor()

    try:
        comando_sql = """
            UPDATE notificacoes
            SET
                revisada = TRUE,
                data_revisao = CURRENT_TIMESTAMP,
                id_administrador_revisor = %s
            WHERE revisada = FALSE
        """

        cursor.execute(
            comando_sql,
            (id_administrador,)
        )

        quantidade = cursor.rowcount

        conexao.commit()

        return quantidade

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
