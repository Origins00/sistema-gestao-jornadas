"""
Rotas administrativas para acompanhamento das jornadas
e situações especiais do dia.
"""

from datetime import datetime, time, timedelta

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from mysql.connector import Error

from servicos.servico_status_administrativo import (
    buscar_status_funcionarios
)

from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)


roteador = APIRouter(
    prefix="/administracao",
    tags=["Administração - Status de hoje"]
)


# =========================================================
# FORMATAÇÕES
# =========================================================

def converter_horario_para_texto(
    horario: time | timedelta | None
) -> str | None:
    """
    Converte o horário devolvido pelo MySQL para HH:MM.
    """

    if horario is None:

        return None

    if isinstance(
        horario,
        timedelta
    ):

        minutos_totais = int(
            horario.total_seconds() // 60
        )

        horas = minutos_totais // 60

        minutos = minutos_totais % 60

        return f"{horas:02d}:{minutos:02d}"

    if isinstance(
        horario,
        time
    ):

        return horario.strftime(
            "%H:%M"
        )

    texto = str(
        horario
    )

    return texto[:5]


def converter_data_hora_para_texto(
    data_hora: datetime | None
) -> str | None:
    """
    Converte uma data e hora para o formato ISO.
    """

    if data_hora is None:

        return None

    if isinstance(
        data_hora,
        datetime
    ):

        return data_hora.isoformat()

    return str(
        data_hora
    )


# =========================================================
# DEFINIÇÃO DO STATUS
# =========================================================

def determinar_status_atual(
    funcionario: dict
) -> str:
    """
    Determina o estado atual da pessoa.

    Uma situação especial tem prioridade sobre o andamento
    normal da jornada.
    """

    tipo_situacao_especial = funcionario[
        "tipo_situacao_especial"
    ]

    situacoes_especiais = {

        "ATESTADO": "ATESTADO",

        "FERIAS": "FERIAS",

        "FOLGA": "FOLGA",

        "AUSENCIA": "AUSENTE",

        "DIA_ENCERRADO": "DIA_ENCERRADO"

    }

    # A situação administrativa tem prioridade
    if (
        tipo_situacao_especial
        in situacoes_especiais
    ):

        return situacoes_especiais[
            tipo_situacao_especial
        ]

    # Mantém compatibilidade com jornadas antigas
    situacao_jornada = funcionario[
        "situacao_jornada"
    ]

    situacoes_antigas_jornada = {

        "ATESTADO": "ATESTADO",

        "FERIAS": "FERIAS",

        "FOLGA": "FOLGA",

        "AUSENCIA": "AUSENTE",

        "DIA_ENCERRADO": "DIA_ENCERRADO"

    }

    if (
        situacao_jornada
        in situacoes_antigas_jornada
    ):

        return situacoes_antigas_jornada[
            situacao_jornada
        ]

    # Sem jornada e sem situação especial
    if funcionario["id_jornada"] is None:

        return "PONTO_PENDENTE"

    # Jornada concluída
    if (
        situacao_jornada == "CONCLUIDA"
        or funcionario["horario_saida"] is not None
    ):

        return "EXPEDIENTE_ENCERRADO"

    # Jornada marcada como incompleta
    if situacao_jornada == "INCOMPLETA":

        return "PONTO_PENDENTE"

    # Jornada aberta, mas ainda sem entrada
    if funcionario["horario_entrada"] is None:

        return "PONTO_PENDENTE"

    # Início de almoço sem retorno
    if (
        funcionario["horario_inicio_almoco"]
        is not None

        and funcionario["horario_fim_almoco"]
        is None
    ):

        return "ALMOCANDO"

    # Entrada ou retorno já registrado
    return "TRABALHANDO"


def determinar_tipo_trabalho_atual(
    funcionario: dict
) -> str | None:
    """
    Determina qual tipo de trabalho está sendo realizado
    no momento.
    """

    if funcionario["id_jornada"] is None:

        return None

    if (
        funcionario["horario_fim_almoco"]
        is not None

        and funcionario[
            "tipo_trabalho_apos_almoco"
        ] is not None
    ):

        return funcionario[
            "tipo_trabalho_apos_almoco"
        ]

    return funcionario[
        "tipo_trabalho_inicio"
    ]


# =========================================================
# SITUAÇÃO ESPECIAL
# =========================================================

def formatar_situacao_especial(
    funcionario: dict
) -> dict | None:
    """
    Formata a situação especial atual.

    Quando não existe situação, devolve None.
    """

    if funcionario["id_situacao"] is None:

        return None

    administrador = None

    if (
        funcionario["id_administrador_situacao"]
        is not None
    ):

        administrador = {

            "id_usuario": funcionario[
                "id_administrador_situacao"
            ],

            "nome_completo": funcionario[
                "nome_administrador_situacao"
            ]

        }

    return {

        "id_situacao": funcionario[
            "id_situacao"
        ],

        "tipo_situacao": funcionario[
            "tipo_situacao_especial"
        ],

        "motivo": funcionario[
            "motivo_situacao_especial"
        ],

        "administrador": administrador,

        "data_registro": (
            converter_data_hora_para_texto(
                funcionario[
                    "data_registro_situacao"
                ]
            )
        ),

        "data_atualizacao": (
            converter_data_hora_para_texto(
                funcionario[
                    "data_atualizacao_situacao"
                ]
            )
        )

    }


# =========================================================
# RESUMO DO DIA
# =========================================================

def criar_resumo_status(
    funcionarios: list[dict]
) -> dict:
    """
    Conta quantas pessoas existem em cada estado.
    """

    resumo = {

        "total_pessoas": len(
            funcionarios
        ),

        "trabalhando": 0,

        "almocando": 0,

        "expediente_encerrado": 0,

        "ponto_pendente": 0,

        "ausentes": 0,

        "atestados": 0,

        "ferias": 0,

        "folgas": 0,

        "dias_encerrados": 0

    }

    correspondencia = {

        "TRABALHANDO":
            "trabalhando",

        "ALMOCANDO":
            "almocando",

        "EXPEDIENTE_ENCERRADO":
            "expediente_encerrado",

        "PONTO_PENDENTE":
            "ponto_pendente",

        "AUSENTE":
            "ausentes",

        "ATESTADO":
            "atestados",

        "FERIAS":
            "ferias",

        "FOLGA":
            "folgas",

        "DIA_ENCERRADO":
            "dias_encerrados"

    }

    for funcionario in funcionarios:

        campo_resumo = correspondencia.get(
            funcionario["status_atual"]
        )

        if campo_resumo is not None:

            resumo[campo_resumo] += 1

    return resumo


# =========================================================
# ROTA
# =========================================================

@roteador.get(
    "/status-hoje"
)
def consultar_status_hoje(
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Retorna o estado atual de todas as pessoas ativas.
    """

    try:

        from datetime import date

        data_referencia = date.today()

        registros = buscar_status_funcionarios(
            data_referencia=data_referencia
        )

        funcionarios_formatados = []

        for registro in registros:

            status_atual = determinar_status_atual(
                registro
            )

            tipo_trabalho_atual = (
                determinar_tipo_trabalho_atual(
                    registro
                )
            )

            funcionarios_formatados.append(
                {
                    "id_usuario": (
                        registro["id_usuario"]
                    ),

                    "nome_completo": (
                        registro["nome_completo"]
                    ),

                    "cpf": registro["cpf"],

                    "tipo_usuario": (
                        registro["tipo_usuario"]
                    ),

                    "status_atual": status_atual,

                    "situacao_especial": (
                        formatar_situacao_especial(
                            registro
                        )
                    ),

                    "jornada": {

                        "id_jornada": (
                            registro["id_jornada"]
                        ),

                        "data_jornada": (
                            registro[
                                "data_jornada"
                            ].isoformat()

                            if registro[
                                "data_jornada"
                            ] is not None

                            else None
                        ),

                        "situacao_jornada": (
                            registro[
                                "situacao_jornada"
                            ]
                        ),

                        "tipo_trabalho_inicio": (
                            registro[
                                "tipo_trabalho_inicio"
                            ]
                        ),

                        "tipo_trabalho_apos_almoco": (
                            registro[
                                "tipo_trabalho_apos_almoco"
                            ]
                        ),

                        "tipo_trabalho_atual": (
                            tipo_trabalho_atual
                        ),

                        "atividade_do_dia": (
                            registro[
                                "atividade_do_dia"
                            ]
                        )

                    },

                    "horarios": {

                        "entrada": (
                            converter_horario_para_texto(
                                registro[
                                    "horario_entrada"
                                ]
                            )
                        ),

                        "inicio_almoco": (
                            converter_horario_para_texto(
                                registro[
                                    "horario_inicio_almoco"
                                ]
                            )
                        ),

                        "fim_almoco": (
                            converter_horario_para_texto(
                                registro[
                                    "horario_fim_almoco"
                                ]
                            )
                        ),

                        "saida": (
                            converter_horario_para_texto(
                                registro[
                                    "horario_saida"
                                ]
                            )
                        )

                    },

                    "ultimo_registro": {

                        "tipo_registro": (
                            registro[
                                "tipo_ultimo_registro"
                            ]
                        ),

                        "horario_informado": (
                            converter_horario_para_texto(
                                registro[
                                    "horario_ultimo_registro"
                                ]
                            )
                        ),

                        "data_hora_lancamento": (
                            converter_data_hora_para_texto(
                                registro[
                                    "data_hora_ultimo_lancamento"
                                ]
                            )
                        )

                    }
                }
            )

        return {

            "data_referencia": (
                data_referencia.isoformat()
            ),

            "resumo": criar_resumo_status(
                funcionarios_formatados
            ),

            "funcionarios": (
                funcionarios_formatados
            )

        }

    except Error as erro:

        print(
            "Erro ao consultar status de hoje: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível consultar "
                "o status dos funcionários."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao consultar status: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "O banco de dados está indisponível."
            )
        )