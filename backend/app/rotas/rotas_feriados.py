"""
Rotas administrativas para gerenciamento dos feriados.
"""

from datetime import date, datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)

from mysql.connector import Error

from modelos.feriado import (
    AlteracaoFeriado,
    FeriadoEntrada,
    MudancaSituacaoFeriado
)

from servicos.servico_feriado import (
    alterar_feriado,
    buscar_feriados_por_periodo,
    buscar_historico_feriado,
    criar_feriado,
    desativar_feriado,
    excluir_feriado,
    reativar_feriado
)

from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)


roteador = APIRouter(
    prefix="/administracao/feriados",
    tags=["Administração - Feriados"]
)


# =========================================================
# FORMATAÇÃO
# =========================================================

def formatar_data_hora(
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
# CADASTRO
# =========================================================

@roteador.post(
    "",
    status_code=status.HTTP_201_CREATED
)
def cadastrar_feriado(
    dados: FeriadoEntrada,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Cadastra um novo feriado global.
    """

    try:

        resultado = criar_feriado(
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            motivo = resultado["motivo"]

            if motivo == "NOME_INVALIDO":

                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Informe um nome válido para o feriado."
                    )
                )

            if motivo == "DATA_JA_CADASTRADA":

                feriado_existente = resultado[
                    "feriado_existente"
                ]

                situacao = (
                    "ativo"
                    if bool(feriado_existente["ativo"])
                    else "desativado"
                )

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Já existe um feriado "
                        f"{situacao} cadastrado nessa data."
                    )
                )

        return {
            "mensagem": (
                "Feriado cadastrado com sucesso!"
            ),
            "feriado": {
                "id_feriado": resultado["id_feriado"],
                "data_feriado": (
                    resultado["data_feriado"].isoformat()
                ),
                "nome_feriado": (
                    resultado["nome_feriado"]
                ),
                "descricao": resultado["descricao"],
                "ativo": resultado["ativo"],
                "id_administrador": (
                    resultado["id_administrador"]
                )
            }
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao cadastrar feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível cadastrar o feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao cadastrar feriado: "
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


# =========================================================
# LISTAGEM
# =========================================================

@roteador.get(
    ""
)
def consultar_feriados(
    data_inicio: date | None = Query(
        default=None
    ),
    data_fim: date | None = Query(
        default=None
    ),
    incluir_inativos: bool = Query(
        default=False
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta os feriados dentro de um período.

    Quando nenhuma data for informada, consulta o ano atual.
    """

    try:

        data_atual = date.today()

        ano_referencia = (
            data_inicio.year
            if data_inicio is not None
            else (
                data_fim.year
                if data_fim is not None
                else data_atual.year
            )
        )


        if data_inicio is None:

            data_inicio = date(
                ano_referencia,
                1,
                1
            )


        if data_fim is None:

            data_fim = date(
                ano_referencia,
                12,
                31
            )


        if data_inicio > data_fim:

            raise HTTPException(
                status_code=(
                    status.HTTP_422_UNPROCESSABLE_ENTITY
                ),
                detail=(
                    "A data inicial não pode ser posterior "
                    "à data final."
                )
            )


        registros = buscar_feriados_por_periodo(
            data_inicio=data_inicio,
            data_fim=data_fim,
            incluir_inativos=incluir_inativos
        )


        feriados_formatados = []

        for registro in registros:

            feriados_formatados.append(
                {
                    "id_feriado": (
                        registro["id_feriado"]
                    ),
                    "data_feriado": (
                        registro[
                            "data_feriado"
                        ].isoformat()
                    ),
                    "nome_feriado": (
                        registro["nome_feriado"]
                    ),
                    "descricao": (
                        registro["descricao"]
                    ),
                    "ativo": bool(
                        registro["ativo"]
                    ),
                    "administrador_criacao": {
                        "id_usuario": (
                            registro[
                                "id_administrador_criacao"
                            ]
                        ),
                        "nome_completo": (
                            registro[
                                "nome_administrador_criacao"
                            ]
                        )
                    },
                    "administrador_atualizacao": (
                        {
                            "id_usuario": (
                                registro[
                                    "id_administrador_atualizacao"
                                ]
                            ),
                            "nome_completo": (
                                registro[
                                    "nome_administrador_atualizacao"
                                ]
                            )
                        }
                        if registro[
                            "id_administrador_atualizacao"
                        ] is not None
                        else None
                    ),
                    "data_criacao": (
                        formatar_data_hora(
                            registro["data_criacao"]
                        )
                    ),
                    "data_atualizacao": (
                        formatar_data_hora(
                            registro["data_atualizacao"]
                        )
                    )
                }
            )


        return {
            "periodo": {
                "data_inicio": data_inicio.isoformat(),
                "data_fim": data_fim.isoformat()
            },
            "incluir_inativos": incluir_inativos,
            "quantidade": len(
                feriados_formatados
            ),
            "feriados": feriados_formatados
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao consultar feriados: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível consultar os feriados."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao consultar feriados: "
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


# =========================================================
# EDIÇÃO
# =========================================================

@roteador.put(
    "/{id_feriado}"
)
def editar_feriado(
    id_feriado: int,
    dados: AlteracaoFeriado,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Altera o nome ou a descrição do feriado.
    """

    try:

        resultado = alterar_feriado(
            id_feriado=id_feriado,
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            motivo = resultado["motivo"]

            if motivo == "FERIADO_NAO_ENCONTRADO":

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="O feriado não foi encontrado."
                )

            if motivo == "NOME_INVALIDO":

                raise HTTPException(
                    status_code=(
                        status.HTTP_422_UNPROCESSABLE_ENTITY
                    ),
                    detail=(
                        "Informe um nome válido para o feriado."
                    )
                )

            if motivo == "NENHUMA_ALTERACAO":

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Nenhuma informação do feriado "
                        "foi alterada."
                    )
                )


        return {
            "mensagem": (
                "Feriado alterado com sucesso!"
            ),
            "alteracao": {
                "id_feriado": resultado["id_feriado"],
                "data_feriado": (
                    resultado["data_feriado"].isoformat()
                ),
                "nome_anterior": (
                    resultado["nome_anterior"]
                ),
                "nome_novo": resultado["nome_novo"],
                "descricao_anterior": (
                    resultado["descricao_anterior"]
                ),
                "descricao_nova": (
                    resultado["descricao_nova"]
                ),
                "ativo": resultado["ativo"],
                "motivo_alteracao": (
                    resultado["motivo_alteracao"]
                ),
                "id_administrador": (
                    resultado["id_administrador"]
                )
            }
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao alterar feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível alterar o feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao alterar feriado: "
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


# =========================================================
# EXCLUSÃO
# =========================================================

@roteador.delete(
    "/{id_feriado}"
)
def excluir_feriado_cadastrado(
    id_feriado: int,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Exclui definitivamente um feriado cadastrado por engano.
    """

    try:

        resultado = excluir_feriado(
            id_feriado=id_feriado
        )

        if not resultado["sucesso"]:

            if (
                resultado["motivo"]
                == "FERIADO_NAO_ENCONTRADO"
            ):

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="O feriado não foi encontrado."
                )

        return {
            "mensagem": (
                "Feriado excluído definitivamente."
            ),
            "feriado_excluido": {
                "id_feriado": resultado["id_feriado"],
                "data_feriado": (
                    resultado["data_feriado"].isoformat()
                ),
                "nome_feriado": (
                    resultado["nome_feriado"]
                )
            },
            "recalculo_jornadas": (
                resultado["recalculo_jornadas"]
            )
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao excluir feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível excluir o feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao excluir feriado: "
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


# =========================================================
# DESATIVAÇÃO
# =========================================================

@roteador.patch(
    "/{id_feriado}/desativar"
)
def desativar_feriado_cadastrado(
    id_feriado: int,
    dados: MudancaSituacaoFeriado,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Desativa um feriado sem apagar seu histórico.
    """

    try:

        resultado = desativar_feriado(
            id_feriado=id_feriado,
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            if (
                resultado["motivo"]
                == "FERIADO_NAO_ENCONTRADO"
            ):

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="O feriado não foi encontrado."
                )

            if (
                resultado["motivo"]
                == "FERIADO_JA_DESATIVADO"
            ):

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "O feriado já está desativado."
                    )
                )


        return {
            "mensagem": (
                "Feriado desativado com sucesso!"
            ),
            "feriado": {
                "id_feriado": resultado["id_feriado"],
                "data_feriado": (
                    resultado["data_feriado"].isoformat()
                ),
                "nome_feriado": (
                    resultado["nome_feriado"]
                ),
                "descricao": resultado["descricao"],
                "ativo": resultado["ativo"],
                "motivo_alteracao": (
                    resultado["motivo_alteracao"]
                ),
                "id_administrador": (
                    resultado["id_administrador"]
                )
            }
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao desativar feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível desativar o feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao desativar feriado: "
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


# =========================================================
# REATIVAÇÃO
# =========================================================

@roteador.patch(
    "/{id_feriado}/reativar"
)
def reativar_feriado_cadastrado(
    id_feriado: int,
    dados: MudancaSituacaoFeriado,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Reativa um feriado anteriormente desativado.
    """

    try:

        resultado = reativar_feriado(
            id_feriado=id_feriado,
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            if (
                resultado["motivo"]
                == "FERIADO_NAO_ENCONTRADO"
            ):

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="O feriado não foi encontrado."
                )

            if (
                resultado["motivo"]
                == "FERIADO_JA_ATIVO"
            ):

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="O feriado já está ativo."
                )


        return {
            "mensagem": (
                "Feriado reativado com sucesso!"
            ),
            "feriado": {
                "id_feriado": resultado["id_feriado"],
                "data_feriado": (
                    resultado["data_feriado"].isoformat()
                ),
                "nome_feriado": (
                    resultado["nome_feriado"]
                ),
                "descricao": resultado["descricao"],
                "ativo": resultado["ativo"],
                "motivo_alteracao": (
                    resultado["motivo_alteracao"]
                ),
                "id_administrador": (
                    resultado["id_administrador"]
                )
            }
        }

    except HTTPException:

        raise

    except Error as erro:

        print(
            "Erro ao reativar feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível reativar o feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao reativar feriado: "
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


# =========================================================
# HISTÓRICO
# =========================================================

@roteador.get(
    "/{id_feriado}/historico"
)
def consultar_historico_feriado(
    id_feriado: int,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta o histórico completo de um feriado.
    """

    try:

        registros = buscar_historico_feriado(
            id_feriado=id_feriado
        )

        historico_formatado = []

        for registro in registros:

            historico_formatado.append(
                {
                    "id_historico": (
                        registro["id_historico"]
                    ),
                    "id_feriado": (
                        registro["id_feriado"]
                    ),
                    "data_feriado": (
                        registro[
                            "data_feriado"
                        ].isoformat()
                    ),
                    "acao_realizada": (
                        registro["acao_realizada"]
                    ),
                    "nome_anterior": (
                        registro["nome_anterior"]
                    ),
                    "nome_novo": (
                        registro["nome_novo"]
                    ),
                    "descricao_anterior": (
                        registro["descricao_anterior"]
                    ),
                    "descricao_nova": (
                        registro["descricao_nova"]
                    ),
                    "ativo_anterior": (
                        bool(
                            registro["ativo_anterior"]
                        )
                        if registro["ativo_anterior"]
                        is not None
                        else None
                    ),
                    "ativo_novo": (
                        bool(
                            registro["ativo_novo"]
                        )
                        if registro["ativo_novo"]
                        is not None
                        else None
                    ),
                    "motivo_alteracao": (
                        registro["motivo_alteracao"]
                    ),
                    "administrador": {
                        "id_usuario": (
                            registro[
                                "id_administrador"
                            ]
                        ),
                        "nome_completo": (
                            registro[
                                "nome_administrador"
                            ]
                        )
                    },
                    "data_alteracao": (
                        formatar_data_hora(
                            registro["data_alteracao"]
                        )
                    )
                }
            )


        return {
            "id_feriado": id_feriado,
            "quantidade": len(
                historico_formatado
            ),
            "historico": historico_formatado
        }

    except Error as erro:

        print(
            "Erro ao consultar histórico do feriado: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Não foi possível consultar "
                "o histórico do feriado."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao consultar histórico: "
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
