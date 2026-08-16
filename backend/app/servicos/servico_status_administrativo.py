"""
Serviço responsável pelo acompanhamento das jornadas
e situações especiais do dia.
"""

from datetime import date

from banco.conexao import criar_conexao


def buscar_status_funcionarios(
    data_referencia: date
) -> list[dict]:
    """
    Busca todas as pessoas ativas que podem registrar jornada.

    Pessoas sem jornada também são retornadas, permitindo
    que o painel mostre ponto pendente ou situação especial.
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

                usuario.id_usuario,
                usuario.nome_completo,
                usuario.cpf,
                usuario.tipo_usuario,

                jornada.id_jornada,
                jornada.data_jornada,
                jornada.tipo_trabalho_inicio,
                jornada.tipo_trabalho_apos_almoco,
                jornada.atividade_do_dia,
                jornada.situacao_jornada,

                situacao.id_situacao,

                situacao.tipo_situacao
                    AS tipo_situacao_especial,

                situacao.motivo
                    AS motivo_situacao_especial,

                situacao.id_administrador_registro
                    AS id_administrador_situacao,

                situacao.data_registro
                    AS data_registro_situacao,

                situacao.data_atualizacao
                    AS data_atualizacao_situacao,

                administrador_situacao.nome_completo
                    AS nome_administrador_situacao,

                MAX(
                    CASE

                        WHEN registro.tipo_registro = 'ENTRADA'

                        THEN registro.horario_informado

                    END
                ) AS horario_entrada,

                MAX(
                    CASE

                        WHEN registro.tipo_registro =
                            'INICIO_ALMOCO'

                        THEN registro.horario_informado

                    END
                ) AS horario_inicio_almoco,

                MAX(
                    CASE

                        WHEN registro.tipo_registro =
                            'FIM_ALMOCO'

                        THEN registro.horario_informado

                    END
                ) AS horario_fim_almoco,

                MAX(
                    CASE

                        WHEN registro.tipo_registro = 'SAIDA'

                        THEN registro.horario_informado

                    END
                ) AS horario_saida,

                (
                    SELECT
                        ultimo_registro.tipo_registro

                    FROM registros_horarios ultimo_registro

                    WHERE ultimo_registro.id_jornada =
                        jornada.id_jornada

                    ORDER BY

                        ultimo_registro
                            .data_hora_lancamento DESC,

                        ultimo_registro.id_registro DESC

                    LIMIT 1
                ) AS tipo_ultimo_registro,

                (
                    SELECT
                        ultimo_registro.horario_informado

                    FROM registros_horarios ultimo_registro

                    WHERE ultimo_registro.id_jornada =
                        jornada.id_jornada

                    ORDER BY

                        ultimo_registro
                            .data_hora_lancamento DESC,

                        ultimo_registro.id_registro DESC

                    LIMIT 1
                ) AS horario_ultimo_registro,

                (
                    SELECT
                        ultimo_registro.data_hora_lancamento

                    FROM registros_horarios ultimo_registro

                    WHERE ultimo_registro.id_jornada =
                        jornada.id_jornada

                    ORDER BY

                        ultimo_registro
                            .data_hora_lancamento DESC,

                        ultimo_registro.id_registro DESC

                    LIMIT 1
                ) AS data_hora_ultimo_lancamento

            FROM usuarios usuario

            LEFT JOIN jornadas_diarias jornada

                ON jornada.id_usuario =
                    usuario.id_usuario

                AND jornada.data_jornada =
                    %s

            LEFT JOIN registros_horarios registro

                ON registro.id_jornada =
                    jornada.id_jornada

            LEFT JOIN situacoes_especiais_dias situacao

                ON situacao.id_usuario =
                    usuario.id_usuario

                AND situacao.data_situacao =
                    %s

            LEFT JOIN usuarios administrador_situacao

                ON administrador_situacao.id_usuario =
                    situacao.id_administrador_registro

            WHERE usuario.tipo_usuario IN (
                'FUNCIONARIO',
                'ADMINISTRADOR'
            )

            AND usuario.situacao_usuario = 'ATIVO'

            GROUP BY

                usuario.id_usuario,
                usuario.nome_completo,
                usuario.cpf,
                usuario.tipo_usuario,

                jornada.id_jornada,
                jornada.data_jornada,
                jornada.tipo_trabalho_inicio,
                jornada.tipo_trabalho_apos_almoco,
                jornada.atividade_do_dia,
                jornada.situacao_jornada,

                situacao.id_situacao,
                situacao.tipo_situacao,
                situacao.motivo,
                situacao.id_administrador_registro,
                situacao.data_registro,
                situacao.data_atualizacao,

                administrador_situacao.nome_completo

            ORDER BY usuario.nome_completo ASC
        """

        cursor.execute(
            comando_sql,
            (
                data_referencia,
                data_referencia
            )
        )

        return cursor.fetchall()

    finally:

        cursor.close()
        conexao.close()