from datetime import date, datetime, timezone

from mysql.connector import Error

from banco.conexao import criar_conexao
from modelos.jornada import (
    AlteracaoHorario,
    JornadaEntrada,
    JornadaHistoricaCompleta,
    RegistroEntrada,
    RegistroFimAlmoco,
    RegistroInicioAlmoco,
    RegistroSaida
)
from servicos.servico_notificacao import registrar_notificacao
from utilitarios.calculo_jornada import (
    calcular_resumo_jornada
)


def normalizar_data_hora_dispositivo(
    data_hora: datetime | None
) -> datetime | None:
    """
    Converte o instante do aparelho para UTC sem fuso, formato aceito pelo
    campo DATETIME do MySQL.
    """

    if data_hora is None:
        return None

    if data_hora.tzinfo is None:
        return data_hora

    return data_hora.astimezone(timezone.utc).replace(tzinfo=None)


def obter_metadados_offline(dados) -> tuple[str | None, datetime | None]:
    chave = getattr(dados, "chave_operacao_offline", None)
    data_hora = getattr(dados, "data_hora_dispositivo", None)

    return (
        str(chave) if chave is not None else None,
        normalizar_data_hora_dispositivo(data_hora)
    )

# =========================================================
# FERIADOS E FINAIS DE SEMANA
# =========================================================

# =========================================================
# FERIADOS E FINAIS DE SEMANA
# =========================================================

def buscar_feriado_ativo_na_data(
    cursor,
    data_jornada: date
) -> dict | None:
    """
    Verifica se existe um feriado ativo na data da jornada.

    A consulta utiliza o mesmo cursor da operação atual,
    mantendo tudo dentro da mesma conexão.
    """

    comando_sql = """
        SELECT
            id_feriado,
            data_feriado,
            nome_feriado,
            descricao

        FROM feriados

        WHERE data_feriado = %s
          AND ativo = TRUE

        LIMIT 1
    """

    cursor.execute(
        comando_sql,
        (data_jornada,)
    )

    return cursor.fetchone()


def aplicar_regra_dia_especial(
    resumo: dict,
    data_jornada: date,
    feriado: dict | None
) -> dict:
    """
    Aplica a regra de feriado ou final de semana.

    Em sábado, domingo ou feriado ativo, todos os minutos
    trabalhados são considerados minutos extras.
    """

    if resumo is None:

        raise RuntimeError(
            "O cálculo normal da jornada não retornou um resumo."
        )


    final_de_semana = (
        data_jornada.weekday() >= 5
    )

    possui_feriado = (
        feriado is not None
    )


    # Dia comum: preserva completamente o cálculo original.
    if (
        not final_de_semana
        and not possui_feriado
    ):

        return {
            **resumo,
            "dia_especial": False,
            "tipo_dia": "NORMAL",
            "feriado": None
        }


    minutos_trabalhados = int(
        resumo.get(
            "minutos_trabalhados",
            0
        ) or 0
    )


    dados_feriado = None

    if possui_feriado:

        tipo_dia = "FERIADO"

        data_feriado = feriado[
            "data_feriado"
        ]

        dados_feriado = {
            "id_feriado": (
                feriado["id_feriado"]
            ),

            "data_feriado": (
                data_feriado.isoformat()
                if hasattr(
                    data_feriado,
                    "isoformat"
                )
                else str(
                    data_feriado
                )
            ),

            "nome_feriado": (
                feriado["nome_feriado"]
            ),

            "descricao": (
                feriado["descricao"]
            )
        }

    else:

        tipo_dia = "FINAL_DE_SEMANA"


    return {
        **resumo,

        # Dia especial não possui carga horária obrigatória.
        "minutos_esperados": 0,

        # Todo o tempo trabalhado é considerado extra.
        "minutos_extras": minutos_trabalhados,

        # O saldo do dia corresponde ao total trabalhado.
        "minutos_saldo": minutos_trabalhados,

        # Não se aplica tolerância em um dia especial.
        "minutos_tolerancia_aplicada": 0,

        "dia_especial": True,

        "tipo_dia": tipo_dia,

        "feriado": dados_feriado
    }

def buscar_jornada_por_usuario_e_data(
    id_usuario: int,
    data_jornada: date
):
    """
    Busca a jornada de um usuário em uma determinada data.
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
                id_jornada,
                id_usuario,
                data_jornada,
                tipo_trabalho_inicio,
                tipo_trabalho_apos_almoco,
                atividade_do_dia,
                situacao_jornada,
                minutos_trabalhados,
                minutos_esperados,
                minutos_extras,
                minutos_saldo,
                minutos_tolerancia_aplicada,
                minutos_abonados
            FROM jornadas_diarias
            WHERE id_usuario = %s
              AND data_jornada = %s
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (
                id_usuario,
                data_jornada
            )
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def criar_jornada(
    id_usuario: int,
    dados: JornadaEntrada
) -> int:
    """
    Cria uma nova jornada e devolve seu identificador.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_sql = """
            INSERT INTO jornadas_diarias (
                id_usuario,
                data_jornada,
                tipo_trabalho_inicio,
                situacao_jornada
            )
            VALUES (%s, %s, %s, 'EM_ANDAMENTO')
        """

        valores = (
            id_usuario,
            dados.data_jornada,
            dados.tipo_trabalho_inicio.value
        )

        cursor.execute(comando_sql, valores)
        conexao.commit()

        return cursor.lastrowid

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def criar_jornada_historica_completa(
    id_usuario: int,
    dados: JornadaHistoricaCompleta
) -> dict:
    """
    Cria uma jornada retroativa concluída em uma única transação.

    Os quatro horários são registrados como digitados manualmente e também
    entram na auditoria para que a administração saiba que foram incluídos
    depois da data original.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        cursor.execute(
            """
                SELECT id_jornada
                FROM jornadas_diarias
                WHERE id_usuario = %s
                  AND data_jornada = %s
                LIMIT 1
                FOR UPDATE
            """,
            (
                id_usuario,
                dados.data_jornada
            )
        )

        if cursor.fetchone() is not None:
            raise ValueError(
                "Já existe uma jornada na data informada."
            )

        resumo_normal = calcular_resumo_jornada(
            horario_entrada=dados.horario_entrada,
            horario_inicio_almoco=(
                dados.horario_inicio_almoco
            ),
            horario_fim_almoco=(
                dados.horario_fim_almoco
            ),
            horario_saida=dados.horario_saida,
            tipo_trabalho_inicio=(
                dados.tipo_trabalho_inicio.value
            ),
            tipo_trabalho_apos_almoco=(
                dados.tipo_trabalho_apos_almoco.value
            )
        )

        feriado = buscar_feriado_ativo_na_data(
            cursor=cursor,
            data_jornada=dados.data_jornada
        )

        resumo = aplicar_regra_dia_especial(
            resumo=resumo_normal,
            data_jornada=dados.data_jornada,
            feriado=feriado
        )

        cursor.execute(
            """
                INSERT INTO jornadas_diarias (
                    id_usuario,
                    data_jornada,
                    tipo_trabalho_inicio,
                    tipo_trabalho_apos_almoco,
                    atividade_do_dia,
                    situacao_jornada,
                    minutos_trabalhados,
                    minutos_esperados,
                    minutos_extras,
                    minutos_saldo,
                    minutos_tolerancia_aplicada
                )
                VALUES (
                    %s, %s, %s, %s, %s, 'CONCLUIDA',
                    %s, %s, %s, %s, %s
                )
            """,
            (
                id_usuario,
                dados.data_jornada,
                dados.tipo_trabalho_inicio.value,
                dados.tipo_trabalho_apos_almoco.value,
                dados.atividade_do_dia,
                resumo["minutos_trabalhados"],
                resumo["minutos_esperados"],
                resumo["minutos_extras"],
                resumo["minutos_saldo"],
                resumo["minutos_tolerancia_aplicada"]
            )
        )

        id_jornada = cursor.lastrowid

        registros = (
            ("ENTRADA", dados.horario_entrada),
            ("INICIO_ALMOCO", dados.horario_inicio_almoco),
            ("FIM_ALMOCO", dados.horario_fim_almoco),
            ("SAIDA", dados.horario_saida)
        )

        ids_registros = []

        for tipo_registro, horario in registros:
            cursor.execute(
                """
                    INSERT INTO registros_horarios (
                        id_jornada,
                        tipo_registro,
                        horario_informado,
                        origem_registro,
                        sincronizado,
                        data_sincronizacao
                    )
                    VALUES (
                        %s, %s, %s,
                        'DIGITADO_MANUALMENTE',
                        TRUE,
                        CURRENT_TIMESTAMP
                    )
                """,
                (
                    id_jornada,
                    tipo_registro,
                    horario
                )
            )

            id_registro = cursor.lastrowid
            ids_registros.append(id_registro)

            cursor.execute(
                """
                    INSERT INTO alteracoes_registros (
                        id_registro,
                        id_usuario_alteracao,
                        horario_anterior,
                        horario_novo,
                        revisada
                    )
                    VALUES (%s, %s, NULL, %s, FALSE)
                """,
                (
                    id_registro,
                    id_usuario,
                    horario
                )
            )

        registrar_notificacao(
            cursor=cursor,
            tipo_notificacao="REGISTRO_ALTERADO",
            titulo="Jornada retroativa criada",
            mensagem=(
                "Uma jornada de "
                f"{dados.data_jornada.strftime('%d/%m/%Y')} "
                "foi criada manualmente e aguarda revisão."
            ),
            id_usuario_relacionado=id_usuario
        )

        conexao.commit()

        return {
            "id_jornada": id_jornada,
            "ids_registros": ids_registros,
            **resumo
        }

    except (Error, ValueError):
        conexao.rollback()
        raise

    except (KeyError, RuntimeError):
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def buscar_jornada_por_id_e_usuario(
    id_jornada: int,
    id_usuario: int
):
    """
    Confere se a jornada existe e pertence ao usuário conectado.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_jornada,
                id_usuario,
                data_jornada,
                tipo_trabalho_inicio,
                tipo_trabalho_apos_almoco,
                atividade_do_dia,
                situacao_jornada
            FROM jornadas_diarias
            WHERE id_jornada = %s
              AND id_usuario = %s
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (
                id_jornada,
                id_usuario
            )
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def buscar_registro_da_jornada(
    id_jornada: int,
    tipo_registro: str
):
    """
    Verifica se determinado horário já foi salvo na jornada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_registro,
                tipo_registro,
                horario_informado,
                origem_registro,
                data_hora_lancamento
            FROM registros_horarios
            WHERE id_jornada = %s
              AND tipo_registro = %s
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (
                id_jornada,
                tipo_registro
            )
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()


def criar_registro_entrada(
    id_jornada: int,
    dados: RegistroEntrada
) -> int:
    """
    Salva o horário de entrada da jornada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_sql = """
            INSERT INTO registros_horarios (
                chave_operacao_offline,
                id_jornada,
                tipo_registro,
                horario_informado,
                data_hora_dispositivo_utc,
                origem_registro,
                sincronizado,
                data_sincronizacao
            )
            VALUES (
                %s,
                %s,
                'ENTRADA',
                %s,
                %s,
                %s,
                TRUE,
                CURRENT_TIMESTAMP
            )
        """

        chave_offline, data_hora_dispositivo = (
            obter_metadados_offline(dados)
        )

        valores = (
            chave_offline,
            id_jornada,
            dados.horario_informado,
            data_hora_dispositivo,
            dados.origem_registro.value
        )

        cursor.execute(comando_sql, valores)
        conexao.commit()

        return cursor.lastrowid

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def criar_registro_inicio_almoco(
    id_jornada: int,
    dados: RegistroInicioAlmoco
) -> int:
    """
    Salva o horário de início do almoço da jornada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_sql = """
            INSERT INTO registros_horarios (
                chave_operacao_offline,
                id_jornada,
                tipo_registro,
                horario_informado,
                data_hora_dispositivo_utc,
                origem_registro,
                sincronizado,
                data_sincronizacao
            )
            VALUES (
                %s,
                %s,
                'INICIO_ALMOCO',
                %s,
                %s,
                %s,
                TRUE,
                CURRENT_TIMESTAMP
            )
        """

        chave_offline, data_hora_dispositivo = (
            obter_metadados_offline(dados)
        )

        valores = (
            chave_offline,
            id_jornada,
            dados.horario_informado,
            data_hora_dispositivo,
            dados.origem_registro.value
        )

        cursor.execute(comando_sql, valores)
        conexao.commit()

        return cursor.lastrowid

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def criar_registro_fim_almoco(
    id_jornada: int,
    dados: RegistroFimAlmoco
) -> int:
    """
    Salva o fim do almoço e o tipo de trabalho após o almoço.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_registro = """
            INSERT INTO registros_horarios (
                chave_operacao_offline,
                id_jornada,
                tipo_registro,
                horario_informado,
                data_hora_dispositivo_utc,
                origem_registro,
                sincronizado,
                data_sincronizacao
            )
            VALUES (
                %s,
                %s,
                'FIM_ALMOCO',
                %s,
                %s,
                %s,
                TRUE,
                CURRENT_TIMESTAMP
            )
        """

        chave_offline, data_hora_dispositivo = (
            obter_metadados_offline(dados)
        )

        valores_registro = (
            chave_offline,
            id_jornada,
            dados.horario_informado,
            data_hora_dispositivo,
            dados.origem_registro.value
        )

        cursor.execute(
            comando_registro,
            valores_registro
        )

        id_registro = cursor.lastrowid

        comando_jornada = """
            UPDATE jornadas_diarias
            SET tipo_trabalho_apos_almoco = %s
            WHERE id_jornada = %s
        """

        cursor.execute(
            comando_jornada,
            (
                dados.tipo_trabalho_apos_almoco.value,
                id_jornada
            )
        )

        conexao.commit()

        return id_registro

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def criar_registro_saida(
    id_jornada: int,
    dados: RegistroSaida
) -> dict:
    """
    Salva a saída, calcula os totais e conclui a jornada.

    Em finais de semana e feriados ativos, todos os minutos
    trabalhados são considerados extras.
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

        # Busca os dados necessários da jornada.
        comando_jornada = """
            SELECT
                data_jornada,
                tipo_trabalho_inicio,
                tipo_trabalho_apos_almoco

            FROM jornadas_diarias

            WHERE id_jornada = %s

            LIMIT 1
        """

        cursor.execute(
            comando_jornada,
            (id_jornada,)
        )

        jornada = cursor.fetchone()


        if jornada is None:

            raise RuntimeError(
                "A jornada não foi encontrada."
            )


        # Busca os horários já registrados.
        comando_horarios = """
            SELECT
                tipo_registro,
                horario_informado

            FROM registros_horarios

            WHERE id_jornada = %s
        """

        cursor.execute(
            comando_horarios,
            (id_jornada,)
        )

        registros = cursor.fetchall()


        horarios = {
            registro["tipo_registro"]:
                registro["horario_informado"]

            for registro in registros
        }


        # Executa primeiro o cálculo normal.
        resumo_normal = calcular_resumo_jornada(
            horario_entrada=(
                horarios["ENTRADA"]
            ),

            horario_inicio_almoco=(
                horarios["INICIO_ALMOCO"]
            ),

            horario_fim_almoco=(
                horarios["FIM_ALMOCO"]
            ),

            horario_saida=(
                dados.horario_informado
            ),

            tipo_trabalho_inicio=(
                jornada["tipo_trabalho_inicio"]
            ),

            tipo_trabalho_apos_almoco=(
                jornada[
                    "tipo_trabalho_apos_almoco"
                ]
            )
        )


        if resumo_normal is None:

            raise RuntimeError(
                "O cálculo da jornada não retornou os totais."
            )


        # Verifica se existe feriado ativo na data.
        feriado = buscar_feriado_ativo_na_data(
            cursor=cursor,
            data_jornada=(
                jornada["data_jornada"]
            )
        )


        # Aplica a regra de feriado ou final de semana.
        resumo = aplicar_regra_dia_especial(
            resumo=resumo_normal,
            data_jornada=(
                jornada["data_jornada"]
            ),
            feriado=feriado
        )


        if resumo is None:

            raise RuntimeError(
                "A regra do dia especial não retornou os totais."
            )


        # Registra o horário de saída.
        comando_registro = """
            INSERT INTO registros_horarios (
                chave_operacao_offline,
                id_jornada,
                tipo_registro,
                horario_informado,
                data_hora_dispositivo_utc,
                origem_registro,
                sincronizado,
                data_sincronizacao
            )
            VALUES (
                %s,
                %s,
                'SAIDA',
                %s,
                %s,
                %s,
                TRUE,
                CURRENT_TIMESTAMP
            )
        """

        chave_offline, data_hora_dispositivo = (
            obter_metadados_offline(dados)
        )

        cursor.execute(
            comando_registro,
            (
                chave_offline,
                id_jornada,
                dados.horario_informado,
                data_hora_dispositivo,
                dados.origem_registro.value
            )
        )

        id_registro = cursor.lastrowid


        # Conclui a jornada com o resumo calculado.
        comando_atualizacao = """
            UPDATE jornadas_diarias

            SET
                atividade_do_dia = %s,
                situacao_jornada = 'CONCLUIDA',
                minutos_trabalhados = %s,
                minutos_esperados = %s,
                minutos_extras = %s,
                minutos_saldo = %s,
                minutos_tolerancia_aplicada = %s

            WHERE id_jornada = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                dados.atividade_do_dia,

                resumo[
                    "minutos_trabalhados"
                ],

                resumo[
                    "minutos_esperados"
                ],

                resumo[
                    "minutos_extras"
                ],

                resumo[
                    "minutos_saldo"
                ],

                resumo[
                    "minutos_tolerancia_aplicada"
                ],

                id_jornada
            )
        )


        conexao.commit()


        return {
            "id_registro": id_registro,
            **resumo
        }


    except Error:

        conexao.rollback()

        raise


    except KeyError as erro:

        conexao.rollback()

        raise RuntimeError(
            "Horário obrigatório não encontrado: "
            f"{erro}"
        )


    except RuntimeError:

        conexao.rollback()

        raise


    finally:

        cursor.close()
        conexao.close()
        
def buscar_registro_por_id_e_usuario(
    id_registro: int,
    id_usuario: int
):
    """
    Busca um registro e confirma que ele pertence ao usuário.
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
    rh.id_registro,
    rh.id_jornada,
    rh.tipo_registro,
    rh.horario_informado,
    rh.origem_registro,

    jd.id_usuario,
    jd.data_jornada,
    jd.situacao_jornada,
    jd.tipo_trabalho_inicio,
    jd.tipo_trabalho_apos_almoco
            FROM registros_horarios rh
            INNER JOIN jornadas_diarias jd
                ON jd.id_jornada = rh.id_jornada
            WHERE rh.id_registro = %s
              AND jd.id_usuario = %s
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (
                id_registro,
                id_usuario
            )
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()   

def buscar_horarios_da_jornada(
    id_jornada: int
) -> dict:
    """
    Busca todos os horários existentes em uma jornada.
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
                id_registro,
                tipo_registro,
                horario_informado
            FROM registros_horarios
            WHERE id_jornada = %s
        """

        cursor.execute(
            comando_sql,
            (id_jornada,)
        )

        registros = cursor.fetchall()

        return {
            registro["tipo_registro"]: registro
            for registro in registros
        }

    finally:
        cursor.close()
        conexao.close() 

def alterar_horario_registro(
    registro: dict,
    id_usuario_alteracao: int,
    dados: AlteracaoHorario
) -> dict:
    """
    Altera um horário, cria a auditoria e recalcula a jornada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        horario_anterior = registro["horario_informado"]
        id_registro = registro["id_registro"]
        id_jornada = registro["id_jornada"]

        comando_auditoria = """
            INSERT INTO alteracoes_registros (
                id_registro,
                id_usuario_alteracao,
                horario_anterior,
                horario_novo,
                revisada
            )
            VALUES (%s, %s, %s, %s, FALSE)
        """

        cursor.execute(
            comando_auditoria,
            (
                id_registro,
                id_usuario_alteracao,
                horario_anterior,
                dados.horario_novo
            )
        )

        id_alteracao = cursor.lastrowid

        comando_atualizacao = """
            UPDATE registros_horarios
            SET
                horario_informado = %s,
                origem_registro = 'DIGITADO_MANUALMENTE'
            WHERE id_registro = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                dados.horario_novo,
                id_registro
            )
        )

        if registro["situacao_jornada"] == "CONCLUIDA":
            comando_horarios = """
                SELECT
                    tipo_registro,
                    horario_informado
                FROM registros_horarios
                WHERE id_jornada = %s
            """

            cursor.execute(
                comando_horarios,
                (id_jornada,)
            )

            registros_horarios = cursor.fetchall()

            horarios = {
                item["tipo_registro"]:
                    item["horario_informado"]
                for item in registros_horarios
            }

            resumo_normal = calcular_resumo_jornada(
                horario_entrada=(
                    horarios["ENTRADA"]
                ),

                horario_inicio_almoco=(
                    horarios["INICIO_ALMOCO"]
                ),

                horario_fim_almoco=(
                    horarios["FIM_ALMOCO"]
                ),

                horario_saida=(
                    horarios["SAIDA"]
                ),

                tipo_trabalho_inicio=(
                    registro[
                        "tipo_trabalho_inicio"
                    ]
                ),

                tipo_trabalho_apos_almoco=(
                    registro[
                        "tipo_trabalho_apos_almoco"
                    ]
                )
            )


            if resumo_normal is None:

                raise RuntimeError(
                    "O recálculo da jornada não retornou os totais."
                )


            feriado = buscar_feriado_ativo_na_data(
                cursor=cursor,
                data_jornada=(
                    registro["data_jornada"]
                )
            )


            resumo = aplicar_regra_dia_especial(
                resumo=resumo_normal,
                data_jornada=(
                    registro["data_jornada"]
                ),
                feriado=feriado
            )
            comando_recalculo = """
                UPDATE jornadas_diarias
                SET
                    minutos_trabalhados = %s,
                    minutos_esperados = %s,
                    minutos_extras = %s,
                    minutos_saldo = %s,
                    minutos_tolerancia_aplicada = %s
                WHERE id_jornada = %s
            """

            cursor.execute(
                comando_recalculo,
                (
                    resumo["minutos_trabalhados"],
                    resumo["minutos_esperados"],
                    resumo["minutos_extras"],
                    resumo["minutos_saldo"],
                    resumo[
                        "minutos_tolerancia_aplicada"
                    ],
                    id_jornada
                )
            )

        registrar_notificacao(
            cursor=cursor,
            tipo_notificacao="REGISTRO_ALTERADO",
            titulo="Horário de jornada alterado",
            mensagem=(
                "Um horário da jornada de "
                f"{registro['data_jornada'].strftime('%d/%m/%Y')} "
                "foi alterado e aguarda revisão."
            ),
            id_usuario_relacionado=registro["id_usuario"]
        )

        conexao.commit()

        return {
            "id_alteracao": id_alteracao,
            "id_registro": id_registro,
            "id_jornada": id_jornada,
            "tipo_registro": registro["tipo_registro"],
            "horario_anterior": horario_anterior,
            "horario_novo": dados.horario_novo
        }

    except Error:
        conexao.rollback()
        raise

    except KeyError as erro:
        conexao.rollback()

        raise RuntimeError(
            f"Horário necessário não encontrado: {erro}"
        )

    finally:
        cursor.close()
        conexao.close()    

def buscar_jornadas_por_periodo(
    id_usuario: int,
    data_inicio: date,
    data_fim: date
) -> list[dict]:
    """
    Busca as jornadas do usuário dentro de um período.
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
                id_jornada,
                data_jornada,
                tipo_trabalho_inicio,
                tipo_trabalho_apos_almoco,
                atividade_do_dia,
                situacao_jornada,
                minutos_trabalhados,
                minutos_esperados,
                minutos_extras,
                minutos_saldo,
                minutos_tolerancia_aplicada,
                minutos_abonados
            FROM jornadas_diarias
            WHERE id_usuario = %s
              AND data_jornada BETWEEN %s AND %s
            ORDER BY data_jornada DESC
        """

        cursor.execute(
            comando_sql,
            (
                id_usuario,
                data_inicio,
                data_fim
            )
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()
