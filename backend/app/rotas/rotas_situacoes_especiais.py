"""
Rotas administrativas das situações especiais.
"""

from datetime import date, datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from mysql.connector import Error

from modelos.situacao_especial import (
    AlteracaoSituacaoEspecial,
    RemocaoSituacaoEspecial,
    SituacaoEspecialEntrada
)

from servicos.servico_situacao_especial import (
    alterar_situacao_especial,
    buscar_historico_situacoes_usuario,
    buscar_situacoes_por_data,
    criar_situacao_especial,
    remover_situacao_especial
)

from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)


roteador = APIRouter(
    prefix="/administracao",
    tags=["Administração - Situações especiais"]
)


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

    return str(data_hora)


@roteador.post(
    "/situacoes-especiais",
    status_code=status.HTTP_201_CREATED
)
def registrar_situacao_especial(
    dados: SituacaoEspecialEntrada,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Registra uma situação especial para uma pessoa.
    """

    try:

        resultado = criar_situacao_especial(
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            motivo = resultado["motivo"]

            if motivo == "USUARIO_NAO_ENCONTRADO":

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "A pessoa informada não foi encontrada."
                    )
                )

            if motivo == "USUARIO_INATIVO":

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Não é possível marcar uma situação "
                        "para uma pessoa inativa."
                    )
                )

            if motivo == "SITUACAO_JA_EXISTENTE":

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta pessoa já possui uma situação "
                        "especial na data informada."
                    )
                )

        return {
            "mensagem": (
                "Situação especial registrada com sucesso!"
            ),
            "situacao": {
                "id_situacao": resultado["id_situacao"],
                "id_usuario": resultado["id_usuario"],
                "nome_completo": resultado["nome_completo"],
                "data_situacao": (
                    resultado["data_situacao"].isoformat()
                ),
                "tipo_situacao": (
                    resultado["tipo_situacao"]
                ),
                "motivo": (
                    resultado["motivo_situacao"]
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
            "Erro ao registrar situação especial: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível registrar "
                "a situação especial."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao registrar situação: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.put(
    "/situacoes-especiais/{id_situacao}"
)
def editar_situacao_especial(
    id_situacao: int,
    dados: AlteracaoSituacaoEspecial,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Altera o tipo ou o motivo de uma situação.
    """

    try:

        resultado = alterar_situacao_especial(
            id_situacao=id_situacao,
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            motivo = resultado["motivo"]

            if motivo == "SITUACAO_NAO_ENCONTRADA":

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "A situação especial não foi encontrada."
                    )
                )

            if motivo == "NENHUMA_ALTERACAO":

                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Nenhuma informação da situação "
                        "foi alterada."
                    )
                )

        return {
            "mensagem": (
                "Situação especial alterada com sucesso!"
            ),
            "alteracao": {
                "id_situacao": resultado["id_situacao"],
                "id_usuario": resultado["id_usuario"],
                "nome_completo": resultado["nome_completo"],
                "data_situacao": (
                    resultado["data_situacao"].isoformat()
                ),
                "tipo_anterior": (
                    resultado["tipo_anterior"]
                ),
                "tipo_novo": resultado["tipo_novo"],
                "motivo_anterior": (
                    resultado["motivo_anterior"]
                ),
                "motivo_novo": (
                    resultado["motivo_novo"]
                ),
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
            "Erro ao alterar situação especial: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível alterar "
                "a situação especial."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao alterar situação: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.delete(
    "/situacoes-especiais/{id_situacao}"
)
def excluir_situacao_especial(
    id_situacao: int,
    dados: RemocaoSituacaoEspecial,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Remove uma situação atual, preservando seu histórico.
    """

    try:

        resultado = remover_situacao_especial(
            id_situacao=id_situacao,
            dados=dados,
            id_administrador=(
                administrador["id_usuario"]
            )
        )

        if not resultado["sucesso"]:

            if (
                resultado["motivo"]
                == "SITUACAO_NAO_ENCONTRADA"
            ):

                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=(
                        "A situação especial não foi encontrada."
                    )
                )

        return {
            "mensagem": (
                "Situação especial removida com sucesso!"
            ),
            "remocao": {
                "id_situacao": resultado["id_situacao"],
                "id_usuario": resultado["id_usuario"],
                "nome_completo": resultado["nome_completo"],
                "data_situacao": (
                    resultado["data_situacao"].isoformat()
                ),
                "tipo_situacao": (
                    resultado["tipo_situacao"]
                ),
                "motivo_situacao": (
                    resultado["motivo_situacao"]
                ),
                "motivo_remocao": (
                    resultado["motivo_remocao"]
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
            "Erro ao remover situação especial: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível remover "
                "a situação especial."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao remover situação: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get(
    "/situacoes-especiais/data/{data_situacao}"
)
def consultar_situacoes_especiais_por_data(
    data_situacao: date,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta as situações atualmente aplicadas em uma data.
    """

    try:

        situacoes = buscar_situacoes_por_data(
            data_situacao=data_situacao
        )

        situacoes_formatadas = []

        for situacao in situacoes:

            situacoes_formatadas.append(
                {
                    "id_situacao": (
                        situacao["id_situacao"]
                    ),
                    "id_usuario": (
                        situacao["id_usuario"]
                    ),
                    "nome_completo": (
                        situacao["nome_completo"]
                    ),
                    "cpf": situacao["cpf"],
                    "tipo_usuario": (
                        situacao["tipo_usuario"]
                    ),
                    "situacao_usuario": (
                        situacao["situacao_usuario"]
                    ),
                    "data_situacao": (
                        situacao[
                            "data_situacao"
                        ].isoformat()
                    ),
                    "tipo_situacao": (
                        situacao["tipo_situacao"]
                    ),
                    "motivo": situacao["motivo"],
                    "administrador": {
                        "id_usuario": (
                            situacao[
                                "id_administrador_registro"
                            ]
                        ),
                        "nome_completo": (
                            situacao[
                                "nome_administrador"
                            ]
                        )
                    },
                    "data_registro": (
                        formatar_data_hora(
                            situacao["data_registro"]
                        )
                    ),
                    "data_atualizacao": (
                        formatar_data_hora(
                            situacao["data_atualizacao"]
                        )
                    )
                }
            )

        return {
            "data_situacao": data_situacao.isoformat(),
            "quantidade": len(
                situacoes_formatadas
            ),
            "situacoes": situacoes_formatadas
        }

    except Error as erro:

        print(
            "Erro ao consultar situações por data: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar "
                "as situações especiais."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao consultar situações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get(
    "/situacoes-especiais/historico/{id_usuario}"
)
def consultar_historico_situacoes(
    id_usuario: int,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta todo o histórico de situações de uma pessoa.
    """

    try:

        historico = buscar_historico_situacoes_usuario(
            id_usuario=id_usuario
        )

        historico_formatado = []

        for registro in historico:

            historico_formatado.append(
                {
                    "id_historico": (
                        registro["id_historico"]
                    ),
                    "id_usuario": (
                        registro["id_usuario"]
                    ),
                    "nome_completo": (
                        registro["nome_completo"]
                    ),
                    "cpf": registro["cpf"],
                    "data_situacao": (
                        registro[
                            "data_situacao"
                        ].isoformat()
                    ),
                    "id_situacao_origem": (
                        registro[
                            "id_situacao_origem"
                        ]
                    ),
                    "acao_realizada": (
                        registro["acao_realizada"]
                    ),
                    "tipo_anterior": (
                        registro["tipo_anterior"]
                    ),
                    "tipo_novo": (
                        registro["tipo_novo"]
                    ),
                    "motivo_anterior": (
                        registro["motivo_anterior"]
                    ),
                    "motivo_novo": (
                        registro["motivo_novo"]
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
            "id_usuario": id_usuario,
            "quantidade": len(
                historico_formatado
            ),
            "historico": historico_formatado
        }

    except Error as erro:

        print(
            "Erro ao consultar histórico de situações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar "
                "o histórico das situações."
            )
        )

    except RuntimeError as erro:

        print(
            "Erro de conexão ao consultar histórico: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )