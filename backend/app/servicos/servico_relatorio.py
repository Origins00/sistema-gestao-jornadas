from datetime import date

from banco.conexao import criar_conexao


def buscar_relatorio_jornadas(
    data_inicio: date,
    data_fim: date,
    id_usuario: int | None
) -> dict:
    """
    Consulta jornadas administrativas dentro de um período.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        filtro_usuario = ""
        parametros: list = [
            data_inicio,
            data_fim
        ]

        if id_usuario is not None:
            filtro_usuario = (
                "AND usuario.id_usuario = %s"
            )
            parametros.append(id_usuario)

        comando_jornadas = f"""
            SELECT
                jornada.id_jornada,
                jornada.data_jornada,
                jornada.tipo_trabalho_inicio,
                jornada.tipo_trabalho_apos_almoco,
                jornada.atividade_do_dia,
                jornada.situacao_jornada,
                jornada.minutos_trabalhados,
                jornada.minutos_esperados,
                jornada.minutos_extras,
                jornada.minutos_saldo,
                jornada.minutos_abonados,
                jornada.minutos_tolerancia_aplicada,
                usuario.id_usuario,
                usuario.nome_completo,
                usuario.cpf,
                MAX(
                    CASE
                        WHEN registro.tipo_registro = 'ENTRADA'
                        THEN registro.horario_informado
                    END
                ) AS horario_entrada,
                MAX(
                    CASE
                        WHEN registro.tipo_registro = 'INICIO_ALMOCO'
                        THEN registro.horario_informado
                    END
                ) AS horario_inicio_almoco,
                MAX(
                    CASE
                        WHEN registro.tipo_registro = 'FIM_ALMOCO'
                        THEN registro.horario_informado
                    END
                ) AS horario_fim_almoco,
                MAX(
                    CASE
                        WHEN registro.tipo_registro = 'SAIDA'
                        THEN registro.horario_informado
                    END
                ) AS horario_saida
            FROM jornadas_diarias jornada
            INNER JOIN usuarios usuario
                ON usuario.id_usuario = jornada.id_usuario
            LEFT JOIN registros_horarios registro
                ON registro.id_jornada = jornada.id_jornada
            WHERE jornada.data_jornada BETWEEN %s AND %s
              AND usuario.tipo_usuario IN (
                    'FUNCIONARIO',
                    'ADMINISTRADOR'
              )
              {filtro_usuario}
            GROUP BY
                jornada.id_jornada,
                jornada.data_jornada,
                jornada.tipo_trabalho_inicio,
                jornada.tipo_trabalho_apos_almoco,
                jornada.atividade_do_dia,
                jornada.situacao_jornada,
                jornada.minutos_trabalhados,
                jornada.minutos_esperados,
                jornada.minutos_extras,
                jornada.minutos_saldo,
                jornada.minutos_abonados,
                jornada.minutos_tolerancia_aplicada,
                usuario.id_usuario,
                usuario.nome_completo,
                usuario.cpf
            ORDER BY
                jornada.data_jornada DESC,
                usuario.nome_completo ASC
        """

        cursor.execute(
            comando_jornadas,
            tuple(parametros)
        )

        jornadas = cursor.fetchall()

        comando_funcionarios = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                situacao_usuario
            FROM usuarios
            WHERE tipo_usuario IN (
                'FUNCIONARIO',
                'ADMINISTRADOR'
            )
            ORDER BY nome_completo ASC
        """

        cursor.execute(
            comando_funcionarios
        )

        funcionarios = cursor.fetchall()

        return {
            "jornadas": jornadas,
            "funcionarios": funcionarios
        }

    finally:
        cursor.close()
        conexao.close()
