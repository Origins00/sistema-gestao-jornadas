from mysql.connector import Error

from banco.conexao import criar_conexao
from modelos.jornada import OperacaoSincronizacaoOffline
from servicos.servico_jornada import normalizar_data_hora_dispositivo
from servicos.servico_notificacao import registrar_notificacao


def buscar_registro_por_chave_offline(
    id_usuario: int,
    chave_operacao: str
) -> dict | None:
    """
    Localiza uma operacao que ja chegou ao banco para tornar a repeticao
    idempotente.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Nao foi possivel acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        cursor.execute(
            """
                SELECT
                    registro.id_registro,
                    registro.id_jornada,
                    registro.tipo_registro,
                    registro.horario_informado,
                    registro.origem_registro
                FROM registros_horarios registro
                INNER JOIN jornadas_diarias jornada
                    ON jornada.id_jornada = registro.id_jornada
                WHERE registro.chave_operacao_offline = %s
                  AND jornada.id_usuario = %s
                LIMIT 1
            """,
            (chave_operacao, id_usuario)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def buscar_conflito_por_chave_offline(
    id_usuario: int,
    chave_operacao: str
) -> dict | None:
    """
    Confere se a mesma operacao ja foi preservada como conflito.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Nao foi possivel acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        cursor.execute(
            """
                SELECT
                    id_conflito,
                    id_jornada,
                    tipo_registro,
                    situacao
                FROM conflitos_sincronizacao
                WHERE chave_operacao_offline = %s
                  AND id_usuario = %s
                LIMIT 1
            """,
            (chave_operacao, id_usuario)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def registrar_conflito_sincronizacao(
    id_usuario: int,
    id_jornada: int,
    horario_servidor,
    dados: OperacaoSincronizacaoOffline
) -> int:
    """
    Guarda a versao do servidor e a versao offline sem sobrescrever nenhuma.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Nao foi possivel acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        cursor.execute(
            """
                INSERT INTO conflitos_sincronizacao (
                    id_usuario,
                    id_jornada,
                    chave_operacao_offline,
                    tipo_registro,
                    horario_servidor,
                    horario_dispositivo,
                    origem_dispositivo,
                    data_hora_dispositivo_utc,
                    tipo_trabalho_apos_almoco_dispositivo,
                    atividade_do_dia_dispositivo
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    id_conflito = LAST_INSERT_ID(id_conflito)
            """,
            (
                id_usuario,
                id_jornada,
                str(dados.chave_operacao_offline),
                dados.tipo_registro.value,
                horario_servidor,
                dados.horario_informado,
                dados.origem_registro.value,
                normalizar_data_hora_dispositivo(
                    dados.data_hora_dispositivo
                ),
                (
                    dados.tipo_trabalho_apos_almoco.value
                    if dados.tipo_trabalho_apos_almoco
                    else None
                ),
                dados.atividade_do_dia
            )
        )

        id_conflito = cursor.lastrowid

        if cursor.rowcount == 1:
            registrar_notificacao(
                cursor=cursor,
                tipo_notificacao="CONFLITO_SINCRONIZACAO",
                titulo="Conflito de sincronizacao offline",
                mensagem=(
                    "Um horario registrado offline difere do valor "
                    "existente e precisa de revisao administrativa."
                ),
                id_usuario_relacionado=id_usuario
            )

        conexao.commit()
        return id_conflito

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
