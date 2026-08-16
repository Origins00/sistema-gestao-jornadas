from datetime import date, time, timedelta

from banco.conexao import criar_conexao

from servicos.servico_feriado import (
    buscar_feriados_por_periodo
)

from servicos.servico_jornada import (
    buscar_horarios_da_jornada,
    buscar_jornada_por_usuario_e_data,
    buscar_jornadas_por_periodo
)


# =========================================================
# FORMATAÇÃO
# =========================================================

def converter_horario_para_minutos(
    horario: time | timedelta
) -> int:
    """
    Converte um horário vindo do MySQL para minutos.
    """

    if isinstance(horario, timedelta):
        return int(
            horario.total_seconds() // 60
        )

    return (
        horario.hour * 60
        + horario.minute
    )


def formatar_horario_calendario(
    horario: time | timedelta | None
) -> str | None:
    """
    Formata um horário no padrão HH:MM.
    """

    if horario is None:
        return None

    minutos_totais = (
        converter_horario_para_minutos(
            horario
        )
    )

    horas = minutos_totais // 60
    minutos = minutos_totais % 60

    return f"{horas:02d}:{minutos:02d}"


def formatar_total_minutos_calendario(
    total_minutos: int
) -> str:
    """
    Formata um total de minutos no padrão 00h00.
    """

    sinal = ""

    if total_minutos < 0:
        sinal = "-"
        total_minutos = abs(
            total_minutos
        )

    horas = total_minutos // 60
    minutos = total_minutos % 60

    return (
        f"{sinal}{horas:02d}h{minutos:02d}"
    )


# =========================================================
# ANIVERSÁRIOS
# =========================================================

def buscar_aniversarios_por_periodo(
    data_inicio: date,
    data_fim: date
) -> list[dict]:
    """
    Retorna somente o nome e a ocorrência do aniversário
    dentro do período consultado.

    O ano de nascimento não é enviado ao calendário.
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
                id_usuario,
                nome_completo,
                data_nascimento

            FROM usuarios

            WHERE data_nascimento IS NOT NULL
              AND situacao_usuario = 'ATIVO'
              AND tipo_usuario IN (
                    'FUNCIONARIO',
                    'ADMINISTRADOR'
              )

            ORDER BY nome_completo ASC
        """

        cursor.execute(
            comando_sql
        )

        usuarios = cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()

    aniversarios = []

    for usuario in usuarios:
        data_nascimento = usuario[
            "data_nascimento"
        ]

        for ano in range(
            data_inicio.year,
            data_fim.year + 1
        ):
            try:
                data_evento = date(
                    ano,
                    data_nascimento.month,
                    data_nascimento.day
                )

            except ValueError:
                # Exemplo: 29 de fevereiro em ano não bissexto.
                continue

            if (
                data_inicio
                <= data_evento
                <= data_fim
            ):
                aniversarios.append(
                    {
                        "id_usuario": (
                            usuario["id_usuario"]
                        ),
                        "nome_completo": (
                            usuario["nome_completo"]
                        ),
                        "data_evento": (
                            data_evento.isoformat()
                        )
                    }
                )

    aniversarios.sort(
        key=lambda aniversario: (
            aniversario["data_evento"],
            aniversario["nome_completo"]
        )
    )

    return aniversarios


# =========================================================
# ALTERAÇÕES DE HORÁRIOS
# =========================================================

def buscar_datas_com_alteracoes(
    id_usuario: int,
    data_inicio: date,
    data_fim: date
) -> dict[str, int]:
    """
    Informa em quais jornadas do período existem alterações
    de horários registradas na auditoria.
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
                jornada.data_jornada,
                COUNT(alteracao.id_alteracao)
                    AS quantidade_alteracoes

            FROM alteracoes_registros alteracao

            INNER JOIN registros_horarios registro
                ON registro.id_registro =
                    alteracao.id_registro

            INNER JOIN jornadas_diarias jornada
                ON jornada.id_jornada =
                    registro.id_jornada

            WHERE jornada.id_usuario = %s
              AND jornada.data_jornada
                    BETWEEN %s AND %s

            GROUP BY jornada.data_jornada
        """

        cursor.execute(
            comando_sql,
            (
                id_usuario,
                data_inicio,
                data_fim
            )
        )

        registros = cursor.fetchall()

        return {
            registro[
                "data_jornada"
            ].isoformat(): int(
                registro[
                    "quantidade_alteracoes"
                ]
                or 0
            )
            for registro in registros
        }

    finally:
        cursor.close()
        conexao.close()


# =========================================================
# MONTAGEM DOS DADOS DO MÊS
# =========================================================

def montar_jornada_do_calendario(
    jornada: dict,
    alteracoes_por_data: dict[str, int]
) -> dict:
    """
    Prepara uma jornada para ser exibida no calendário.
    """

    data_jornada = jornada[
        "data_jornada"
    ].isoformat()

    quantidade_alteracoes = (
        alteracoes_por_data.get(
            data_jornada,
            0
        )
    )

    return {
        "id_jornada": jornada[
            "id_jornada"
        ],
        "data_jornada": data_jornada,
        "situacao_jornada": jornada[
            "situacao_jornada"
        ],
        "atividade_do_dia": jornada[
            "atividade_do_dia"
        ],
        "tipo_trabalho_inicio": jornada[
            "tipo_trabalho_inicio"
        ],
        "tipo_trabalho_apos_almoco": jornada[
            "tipo_trabalho_apos_almoco"
        ],
        "minutos_trabalhados": int(
            jornada[
                "minutos_trabalhados"
            ]
            or 0
        ),
        "tempo_trabalhado_formatado": (
            formatar_total_minutos_calendario(
                int(
                    jornada[
                        "minutos_trabalhados"
                    ]
                    or 0
                )
            )
        ),
        "minutos_extras": int(
            jornada[
                "minutos_extras"
            ]
            or 0
        ),
        "horas_extras_formatadas": (
            formatar_total_minutos_calendario(
                int(
                    jornada[
                        "minutos_extras"
                    ]
                    or 0
                )
            )
        ),
        "minutos_saldo": int(
            jornada[
                "minutos_saldo"
            ]
            or 0
        ),
        "saldo_formatado": (
            formatar_total_minutos_calendario(
                int(
                    jornada[
                        "minutos_saldo"
                    ]
                    or 0
                )
            )
        ),
        "possui_alteracao": (
            quantidade_alteracoes > 0
        ),
        "quantidade_alteracoes": (
            quantidade_alteracoes
        )
    }


def buscar_dados_mes_calendario(
    id_usuario: int,
    data_inicio: date,
    data_fim: date
) -> dict:
    """
    Reúne jornadas, feriados e aniversários de um mês.
    """

    jornadas = buscar_jornadas_por_periodo(
        id_usuario=id_usuario,
        data_inicio=data_inicio,
        data_fim=data_fim
    )

    feriados = buscar_feriados_por_periodo(
        data_inicio=data_inicio,
        data_fim=data_fim,
        incluir_inativos=False
    )

    aniversarios = buscar_aniversarios_por_periodo(
        data_inicio=data_inicio,
        data_fim=data_fim
    )

    alteracoes_por_data = (
        buscar_datas_com_alteracoes(
            id_usuario=id_usuario,
            data_inicio=data_inicio,
            data_fim=data_fim
        )
    )

    jornadas_formatadas = [
        montar_jornada_do_calendario(
            jornada=jornada,
            alteracoes_por_data=(
                alteracoes_por_data
            )
        )
        for jornada in jornadas
    ]

    feriados_formatados = [
        {
            "id_feriado": feriado[
                "id_feriado"
            ],
            "data_feriado": feriado[
                "data_feriado"
            ].isoformat(),
            "nome_feriado": feriado[
                "nome_feriado"
            ],
            "descricao": feriado[
                "descricao"
            ]
        }
        for feriado in feriados
    ]

    return {
        "periodo": {
            "data_inicio": (
                data_inicio.isoformat()
            ),
            "data_fim": (
                data_fim.isoformat()
            )
        },
        "hoje": date.today().isoformat(),
        "jornadas": jornadas_formatadas,
        "feriados": feriados_formatados,
        "aniversarios": aniversarios
    }


# =========================================================
# MONTAGEM DOS DADOS DE UM DIA
# =========================================================

def montar_registro_horario(
    registro: dict | None
) -> dict | None:
    """
    Prepara um registro de horário para consulta e edição.
    """

    if registro is None:
        return None

    return {
        "id_registro": registro[
            "id_registro"
        ],
        "tipo_registro": registro[
            "tipo_registro"
        ],
        "horario_informado": (
            formatar_horario_calendario(
                registro[
                    "horario_informado"
                ]
            )
        )
    }


def buscar_dados_dia_calendario(
    id_usuario: int,
    data_calendario: date
) -> dict:
    """
    Retorna os eventos e, quando existir, a jornada do dia.
    """

    feriados = buscar_feriados_por_periodo(
        data_inicio=data_calendario,
        data_fim=data_calendario,
        incluir_inativos=False
    )

    aniversarios = buscar_aniversarios_por_periodo(
        data_inicio=data_calendario,
        data_fim=data_calendario
    )

    feriado = None

    if feriados:
        feriado_encontrado = feriados[0]

        feriado = {
            "id_feriado": feriado_encontrado[
                "id_feriado"
            ],
            "data_feriado": feriado_encontrado[
                "data_feriado"
            ].isoformat(),
            "nome_feriado": feriado_encontrado[
                "nome_feriado"
            ],
            "descricao": feriado_encontrado[
                "descricao"
            ]
        }

    data_futura = (
        data_calendario > date.today()
    )

    if data_futura:
        return {
            "data_calendario": (
                data_calendario.isoformat()
            ),
            "data_futura": True,
            "feriado": feriado,
            "aniversarios": aniversarios,
            "jornada": None,
            "horarios": None,
            "resumo": None,
            "possui_alteracao": False,
            "quantidade_alteracoes": 0,
            "pode_editar_horarios": False
        }

    jornada = buscar_jornada_por_usuario_e_data(
        id_usuario=id_usuario,
        data_jornada=data_calendario
    )

    if jornada is None:
        return {
            "data_calendario": (
                data_calendario.isoformat()
            ),
            "data_futura": False,
            "feriado": feriado,
            "aniversarios": aniversarios,
            "jornada": None,
            "horarios": None,
            "resumo": None,
            "possui_alteracao": False,
            "quantidade_alteracoes": 0,
            "pode_editar_horarios": False
        }

    horarios = buscar_horarios_da_jornada(
        id_jornada=jornada[
            "id_jornada"
        ]
    )

    alteracoes_por_data = (
        buscar_datas_com_alteracoes(
            id_usuario=id_usuario,
            data_inicio=data_calendario,
            data_fim=data_calendario
        )
    )

    quantidade_alteracoes = (
        alteracoes_por_data.get(
            data_calendario.isoformat(),
            0
        )
    )

    minutos_trabalhados = int(
        jornada[
            "minutos_trabalhados"
        ]
        or 0
    )

    minutos_esperados = int(
        jornada[
            "minutos_esperados"
        ]
        or 0
    )

    minutos_extras = int(
        jornada[
            "minutos_extras"
        ]
        or 0
    )

    minutos_saldo = int(
        jornada[
            "minutos_saldo"
        ]
        or 0
    )

    return {
        "data_calendario": (
            data_calendario.isoformat()
        ),
        "data_futura": False,
        "feriado": feriado,
        "aniversarios": aniversarios,
        "jornada": {
            "id_jornada": jornada[
                "id_jornada"
            ],
            "data_jornada": jornada[
                "data_jornada"
            ].isoformat(),
            "tipo_trabalho_inicio": jornada[
                "tipo_trabalho_inicio"
            ],
            "tipo_trabalho_apos_almoco": jornada[
                "tipo_trabalho_apos_almoco"
            ],
            "atividade_do_dia": jornada[
                "atividade_do_dia"
            ],
            "situacao_jornada": jornada[
                "situacao_jornada"
            ]
        },
        "horarios": {
            "entrada": montar_registro_horario(
                horarios.get(
                    "ENTRADA"
                )
            ),
            "inicio_almoco": montar_registro_horario(
                horarios.get(
                    "INICIO_ALMOCO"
                )
            ),
            "fim_almoco": montar_registro_horario(
                horarios.get(
                    "FIM_ALMOCO"
                )
            ),
            "saida": montar_registro_horario(
                horarios.get(
                    "SAIDA"
                )
            )
        },
        "resumo": {
            "minutos_trabalhados": (
                minutos_trabalhados
            ),
            "tempo_trabalhado_formatado": (
                formatar_total_minutos_calendario(
                    minutos_trabalhados
                )
            ),
            "minutos_esperados": (
                minutos_esperados
            ),
            "tempo_esperado_formatado": (
                formatar_total_minutos_calendario(
                    minutos_esperados
                )
            ),
            "minutos_extras": (
                minutos_extras
            ),
            "horas_extras_formatadas": (
                formatar_total_minutos_calendario(
                    minutos_extras
                )
            ),
            "minutos_saldo": (
                minutos_saldo
            ),
            "saldo_formatado": (
                formatar_total_minutos_calendario(
                    minutos_saldo
                )
            ),
            "minutos_tolerancia_aplicada": int(
                jornada[
                    "minutos_tolerancia_aplicada"
                ]
                or 0
            ),
            "minutos_abonados": int(
                jornada[
                    "minutos_abonados"
                ]
                or 0
            ),
            "dia_especial": (
                feriado is not None
                or data_calendario.weekday() >= 5
            ),
            "tipo_dia": (
                "FERIADO"
                if feriado is not None
                else (
                    "FINAL_DE_SEMANA"
                    if data_calendario.weekday() >= 5
                    else "NORMAL"
                )
            )
        },
        "possui_alteracao": (
            quantidade_alteracoes > 0
        ),
        "quantidade_alteracoes": (
            quantidade_alteracoes
        ),
        "pode_editar_horarios": True
    }