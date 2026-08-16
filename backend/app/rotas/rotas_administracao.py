from datetime import time, timedelta
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)
from mysql.connector import Error
from modelos.administracao import (
    AlteracaoSituacaoUsuario,
    AtualizacaoDadosUsuario,
    RedefinicaoSenhaUsuario,
    RespostaSolicitacaoCadastro,
    RevisaoAlteracaoHorario
)
from servicos.servico_administracao import (
    aprovar_solicitacao,
    buscar_alteracoes_pendentes,
    listar_solicitacoes_pendentes,
    revisar_alteracao_horario,
    recusar_solicitacao,
    buscar_funcionarios,
    buscar_funcionario_por_id,
    buscar_historico_conta_usuario,
    buscar_resumo_jornadas_funcionario,
    alterar_situacao_usuario,
    atualizar_dados_usuario,
    buscar_historico_alteracoes,
    redefinir_senha_usuario
)
from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)


def formatar_horario_administracao(
    horario: time | timedelta | None
) -> str | None:
    """
    Converte o horário devolvido pelo banco para HH:MM.
    """

    if horario is None:
        return None

    if isinstance(horario, timedelta):
        minutos_totais = int(
            horario.total_seconds() // 60
        )

        horas = minutos_totais // 60
        minutos = minutos_totais % 60

        return f"{horas:02d}:{minutos:02d}"

    return horario.strftime("%H:%M")

def formatar_minutos_administracao(
    total_minutos: int
) -> str:
    """
    Converte minutos em um texto no formato de horas e minutos.
    """

    sinal = ""

    if total_minutos < 0:
        sinal = "-"
        total_minutos = abs(total_minutos)

    horas = total_minutos // 60
    minutos = total_minutos % 60

    return f"{sinal}{horas:02d}h{minutos:02d}"

roteador = APIRouter(
    prefix="/administracao",
    tags=["Administração"]
)


@roteador.get(
    "/solicitacoes-pendentes"
)
def buscar_solicitacoes_pendentes(
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Lista as solicitações que aguardam aprovação.
    """

    try:
        solicitacoes = listar_solicitacoes_pendentes()

        return {
            "quantidade": len(solicitacoes),
            "solicitacoes": solicitacoes
        }

    except RuntimeError as erro:
        print(
            "Erro de conexão ao buscar solicitações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/solicitacoes/{id_solicitacao}/aprovar"
)
def aprovar_cadastro(
    id_solicitacao: int,
    dados: RespostaSolicitacaoCadastro,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Aprova um cadastro pendente e cria o funcionário.
    """

    try:
        resultado = aprovar_solicitacao(
            id_solicitacao=id_solicitacao,
            id_administrador=administrador["id_usuario"],
            observacao=dados.observacao
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "SOLICITACAO_NAO_ENCONTRADA":
                mensagem = "Solicitação não encontrada."

            elif motivo == "SOLICITACAO_JA_RESPONDIDA":
                mensagem = (
                    "Esta solicitação já foi respondida."
                )

            else:
                mensagem = "Este CPF já possui uma conta."

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=mensagem
            )

        return {
            "mensagem": "Cadastro aprovado com sucesso!",
            "id_usuario": resultado["id_usuario"],
            "aprovado_por": {
                "id_usuario": administrador["id_usuario"],
                "nome_completo": administrador["nome_completo"]
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao aprovar cadastro: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível aprovar o cadastro."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao aprovar cadastro: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/solicitacoes/{id_solicitacao}/recusar"
)
def recusar_cadastro(
    id_solicitacao: int,
    dados: RespostaSolicitacaoCadastro,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Recusa uma solicitação de cadastro pendente.
    """

    try:
        resultado = recusar_solicitacao(
            id_solicitacao=id_solicitacao,
            id_administrador=administrador["id_usuario"],
            observacao=dados.observacao
        )

        if not resultado["sucesso"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A solicitação não existe "
                    "ou já foi respondida."
                )
            )

        return {
            "mensagem": "Cadastro recusado com sucesso.",
            "recusado_por": {
                "id_usuario": administrador["id_usuario"],
                "nome_completo": administrador["nome_completo"]
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao recusar cadastro: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível recusar o cadastro."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao recusar cadastro: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.get(
    "/alteracoes-pendentes"
)
def listar_alteracoes_pendentes(
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Lista alterações de horários que aguardam revisão.
    """

    try:
        alteracoes = buscar_alteracoes_pendentes()

        alteracoes_formatadas = []

        for alteracao in alteracoes:
            alteracoes_formatadas.append(
                {
                    "id_alteracao": (
                        alteracao["id_alteracao"]
                    ),
                    "registro": {
                        "id_registro": (
                            alteracao["id_registro"]
                        ),
                        "id_jornada": (
                            alteracao["id_jornada"]
                        ),
                        "tipo_registro": (
                            alteracao["tipo_registro"]
                        ),
                        "data_jornada": (
                            alteracao[
                                "data_jornada"
                            ].isoformat()
                        )
                    },
                    "funcionario": {
                        "id_usuario": (
                            alteracao["id_funcionario"]
                        ),
                        "nome_completo": (
                            alteracao["nome_funcionario"]
                        ),
                        "cpf": (
                            alteracao["cpf_funcionario"]
                        )
                    },
                    "alteracao": {
                        "horario_anterior": (
                            formatar_horario_administracao(
                                alteracao[
                                    "horario_anterior"
                                ]
                            )
                        ),
                        "horario_novo": (
                            formatar_horario_administracao(
                                alteracao["horario_novo"]
                            )
                        ),
                        "data_alteracao": (
                            alteracao[
                                "data_alteracao"
                            ].isoformat()
                        ),
                        "revisada": bool(
                            alteracao["revisada"]
                        )
                    },
                    "autor": {
                        "id_usuario": (
                            alteracao[
                                "id_usuario_alteracao"
                            ]
                        ),
                        "nome_completo": (
                            alteracao[
                                "nome_autor_alteracao"
                            ]
                        ),
                        "tipo_usuario": (
                            alteracao[
                                "tipo_autor_alteracao"
                            ]
                        )
                    }
                }
            )

        return {
            "quantidade_pendente": len(
                alteracoes_formatadas
            ),
            "alteracoes": alteracoes_formatadas
        }

    except Error as erro:
        print(
            "Erro ao listar alterações pendentes: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar "
                "as alterações pendentes."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao listar alterações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.put(
    "/alteracoes/{id_alteracao}/revisar"
)
def revisar_alteracao(
    id_alteracao: int,
    dados: RevisaoAlteracaoHorario,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Marca uma alteração de horário como revisada.
    """

    try:
        resultado = revisar_alteracao_horario(
            id_alteracao=id_alteracao,
            id_administrador=administrador["id_usuario"],
            observacao=dados.observacao
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "ALTERACAO_NAO_ENCONTRADA":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Alteração não encontrada."
                )

            if motivo == "ALTERACAO_JA_REVISADA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Esta alteração já foi revisada."
                    )
                )

        return {
            "mensagem": (
                "Alteração marcada como revisada "
                "com sucesso!"
            ),
            "revisao": {
                "id_alteracao": resultado["id_alteracao"],
                "id_registro": resultado["id_registro"],
                "id_administrador_revisor": (
                    administrador["id_usuario"]
                ),
                "nome_administrador_revisor": (
                    administrador["nome_completo"]
                ),
                "observacao": dados.observacao
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao revisar alteração: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível revisar a alteração."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao revisar alteração: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.get(
    "/historico-alteracoes"
)
def consultar_historico_alteracoes(
    revisada: bool | None = Query(
        default=None,
        description=(
            "Use true para revisadas, false para pendentes "
            "ou deixe vazio para consultar todas."
        )
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta o histórico completo das alterações de horários.
    """

    try:
        alteracoes = buscar_historico_alteracoes(
            revisada=revisada
        )

        alteracoes_formatadas = []

        for alteracao in alteracoes:
            data_revisao = alteracao["data_revisao"]

            alteracoes_formatadas.append(
                {
                    "id_alteracao": (
                        alteracao["id_alteracao"]
                    ),
                    "registro": {
                        "id_registro": (
                            alteracao["id_registro"]
                        ),
                        "id_jornada": (
                            alteracao["id_jornada"]
                        ),
                        "tipo_registro": (
                            alteracao["tipo_registro"]
                        ),
                        "data_jornada": (
                            alteracao["data_jornada"].isoformat()
                        )
                    },
                    "funcionario": {
                        "id_usuario": (
                            alteracao["id_funcionario"]
                        ),
                        "nome_completo": (
                            alteracao["nome_funcionario"]
                        ),
                        "cpf": (
                            alteracao["cpf_funcionario"]
                        )
                    },
                    "alteracao": {
                        "horario_anterior": (
                            formatar_horario_administracao(
                                alteracao["horario_anterior"]
                            )
                        ),
                        "horario_novo": (
                            formatar_horario_administracao(
                                alteracao["horario_novo"]
                            )
                        ),
                        "data_alteracao": (
                            alteracao[
                                "data_alteracao"
                            ].isoformat()
                        ),
                        "revisada": bool(
                            alteracao["revisada"]
                        )
                    },
                    "autor": {
                        "id_usuario": (
                            alteracao[
                                "id_usuario_alteracao"
                            ]
                        ),
                        "nome_completo": (
                            alteracao[
                                "nome_autor_alteracao"
                            ]
                        ),
                        "tipo_usuario": (
                            alteracao[
                                "tipo_autor_alteracao"
                            ]
                        )
                    },
                    "revisao": {
                        "id_administrador_revisor": (
                            alteracao[
                                "id_administrador_revisor"
                            ]
                        ),
                        "nome_administrador_revisor": (
                            alteracao[
                                "nome_administrador_revisor"
                            ]
                        ),
                        "data_revisao": (
                            data_revisao.isoformat()
                            if data_revisao is not None
                            else None
                        ),
                        "observacao": (
                            alteracao[
                                "motivo_administrador"
                            ]
                        )
                    }
                }
            )

        quantidade_revisadas = sum(
            1
            for alteracao in alteracoes
            if alteracao["revisada"]
        )

        quantidade_pendentes = (
            len(alteracoes) - quantidade_revisadas
        )

        return {
            "filtro": {
                "revisada": revisada
            },
            "resumo": {
                "quantidade_total": len(alteracoes),
                "quantidade_revisadas": (
                    quantidade_revisadas
                ),
                "quantidade_pendentes": (
                    quantidade_pendentes
                )
            },
            "alteracoes": alteracoes_formatadas
        }

    except Error as erro:
        print(
            "Erro ao consultar histórico de alterações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar o histórico "
                "de alterações."
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
        
@roteador.get(
    "/funcionarios"
)
def listar_funcionarios(
    pesquisa: str | None = Query(
        default=None,
        max_length=150,
        description=(
            "Pesquisa opcional pelo nome ou CPF."
        )
    ),
    situacao_usuario: str | None = Query(
        default=None,
        pattern="^(ATIVO|INATIVO)$",
        description=(
            "Use ATIVO, INATIVO ou deixe vazio "
            "para consultar todos."
        )
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Lista os funcionários cadastrados no sistema.
    """

    try:
        funcionarios = buscar_funcionarios(
            pesquisa=pesquisa,
            situacao_usuario=situacao_usuario
        )

        funcionarios_formatados = []

        for funcionario in funcionarios:
            data_nascimento = funcionario["data_nascimento"]
            data_cadastro = funcionario["data_cadastro"]
            data_atualizacao = funcionario["data_atualizacao"]

            funcionarios_formatados.append(
                {
                    "id_usuario": funcionario["id_usuario"],
                    "nome_completo": (
                        funcionario["nome_completo"]
                    ),
                    "cpf": funcionario["cpf"],
                    "telefone": funcionario["telefone"],
                    "data_nascimento": (
                        data_nascimento.isoformat()
                        if data_nascimento is not None
                        else None
                    ),
                    "foto_perfil": (
                        funcionario["foto_perfil"]
                    ),
                    "tipo_usuario": (
                        funcionario["tipo_usuario"]
                    ),
                    "situacao_usuario": (
                        funcionario["situacao_usuario"]
                    ),
                    "precisa_trocar_senha": bool(
                        funcionario["precisa_trocar_senha"]
                    ),
                    "data_cadastro": (
                        data_cadastro.isoformat()
                        if data_cadastro is not None
                        else None
                    ),
                    "data_atualizacao": (
                        data_atualizacao.isoformat()
                        if data_atualizacao is not None
                        else None
                    )
                }
            )

        quantidade_ativos = sum(
            1
            for funcionario in funcionarios
            if funcionario["situacao_usuario"] == "ATIVO"
        )

        quantidade_inativos = (
            len(funcionarios) - quantidade_ativos
        )

        return {
            "filtros": {
                "pesquisa": pesquisa,
                "situacao_usuario": situacao_usuario
            },
            "resumo": {
                "quantidade_total": len(funcionarios),
                "quantidade_ativos": quantidade_ativos,
                "quantidade_inativos": quantidade_inativos
            },
            "funcionarios": funcionarios_formatados
        }

    except Error as erro:
        print(f"Erro ao listar funcionários: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar os funcionários."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao listar funcionários: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.get(
    "/funcionarios/{id_usuario}"
)
def consultar_funcionario(
    id_usuario: int,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta os dados e o resumo de jornadas de uma pessoa.
    """

    try:
        funcionario = buscar_funcionario_por_id(
            id_usuario=id_usuario
        )

        if funcionario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Funcionário não encontrado."
            )

        dados_jornadas = buscar_resumo_jornadas_funcionario(
            id_usuario=id_usuario
        )

        resumo = dados_jornadas["resumo"]
        jornadas_recentes = dados_jornadas[
            "jornadas_recentes"
        ]

        historico_conta = (
            buscar_historico_conta_usuario(
                id_usuario=id_usuario
            )
        )

        data_nascimento = funcionario["data_nascimento"]
        data_cadastro = funcionario["data_cadastro"]
        data_atualizacao = funcionario["data_atualizacao"]

        jornadas_formatadas = []

        for jornada in jornadas_recentes:
            jornadas_formatadas.append(
                {
                    "id_jornada": jornada["id_jornada"],
                    "data_jornada": (
                        jornada["data_jornada"].isoformat()
                    ),
                    "tipo_trabalho_inicio": (
                        jornada["tipo_trabalho_inicio"]
                    ),
                    "tipo_trabalho_apos_almoco": (
                        jornada[
                            "tipo_trabalho_apos_almoco"
                        ]
                    ),
                    "atividade_do_dia": (
                        jornada["atividade_do_dia"]
                    ),
                    "situacao_jornada": (
                        jornada["situacao_jornada"]
                    ),
                    "horarios": {
                        "entrada": (
                            formatar_horario_administracao(
                                jornada["horario_entrada"]
                            )
                        ),
                        "inicio_almoco": (
                            formatar_horario_administracao(
                                jornada["horario_inicio_almoco"]
                            )
                        ),
                        "fim_almoco": (
                            formatar_horario_administracao(
                                jornada["horario_fim_almoco"]
                            )
                        ),
                        "saida": (
                            formatar_horario_administracao(
                                jornada["horario_saida"]
                            )
                        )
                    },
                    "minutos_trabalhados": (
                        jornada["minutos_trabalhados"]
                    ),
                    "tempo_trabalhado_formatado": (
                        formatar_minutos_administracao(
                            jornada["minutos_trabalhados"]
                        )
                    ),
                    "minutos_esperados": (
                        jornada["minutos_esperados"]
                    ),
                    "tempo_esperado_formatado": (
                        formatar_minutos_administracao(
                            jornada["minutos_esperados"]
                        )
                    ),
                    "minutos_extras": (
                        jornada["minutos_extras"]
                    ),
                    "horas_extras_formatadas": (
                        formatar_minutos_administracao(
                            jornada["minutos_extras"]
                        )
                    ),
                    "minutos_abonados": (
                        jornada["minutos_abonados"]
                    ),
                    "horas_abonadas_formatadas": (
                        formatar_minutos_administracao(
                            jornada["minutos_abonados"]
                        )
                    ),
                    "minutos_saldo": (
                        jornada["minutos_saldo"]
                    ),
                    "saldo_formatado": (
                        formatar_minutos_administracao(
                            jornada["minutos_saldo"]
                        )
                    ),
                    "minutos_tolerancia_aplicada": (
                        jornada[
                            "minutos_tolerancia_aplicada"
                        ]
                    ),
                    "tolerancia_formatada": (
                        formatar_minutos_administracao(
                            jornada[
                                "minutos_tolerancia_aplicada"
                            ]
                        )
                    )
                }
            )

        total_trabalhado = int(
            resumo["total_minutos_trabalhados"]
        )

        total_esperado = int(
            resumo["total_minutos_esperados"]
        )

        total_extras = int(
            resumo["total_minutos_extras"]
        )

        total_saldo = int(
            resumo["total_minutos_saldo"]
        )

        total_tolerancia = int(
            resumo["total_minutos_tolerancia"]
        )

        total_abonado = int(
            resumo["total_minutos_abonados"]
        )

        return {
            "funcionario": {
                "id_usuario": funcionario["id_usuario"],
                "nome_completo": (
                    funcionario["nome_completo"]
                ),
                "cpf": funcionario["cpf"],
                "telefone": funcionario["telefone"],
                "data_nascimento": (
                    data_nascimento.isoformat()
                    if data_nascimento is not None
                    else None
                ),
                "foto_perfil": (
                    funcionario["foto_perfil"]
                ),
                "tipo_usuario": (
                    funcionario["tipo_usuario"]
                ),
                "situacao_usuario": (
                    funcionario["situacao_usuario"]
                ),
                "precisa_trocar_senha": bool(
                    funcionario["precisa_trocar_senha"]
                ),
                "data_cadastro": (
                    data_cadastro.isoformat()
                    if data_cadastro is not None
                    else None
                ),
                "data_atualizacao": (
                    data_atualizacao.isoformat()
                    if data_atualizacao is not None
                    else None
                )
            },
            "resumo_jornadas": {
                "quantidade_jornadas": int(
                    resumo["quantidade_jornadas"]
                ),
                "total_minutos_trabalhados": (
                    total_trabalhado
                ),
                "total_trabalhado_formatado": (
                    formatar_minutos_administracao(
                        total_trabalhado
                    )
                ),
                "total_minutos_esperados": (
                    total_esperado
                ),
                "total_esperado_formatado": (
                    formatar_minutos_administracao(
                        total_esperado
                    )
                ),
                "total_minutos_extras": total_extras,
                "total_extras_formatado": (
                    formatar_minutos_administracao(
                        total_extras
                    )
                ),
                "total_minutos_saldo": total_saldo,
                "total_saldo_formatado": (
                    formatar_minutos_administracao(
                        total_saldo
                    )
                ),
                "total_minutos_tolerancia": (
                    total_tolerancia
                ),
                "total_tolerancia_formatado": (
                    formatar_minutos_administracao(
                        total_tolerancia
                    )
                ),
                "total_minutos_abonados": total_abonado,
                "total_abonado_formatado": (
                    formatar_minutos_administracao(
                        total_abonado
                    )
                )
            },
            # Mantém a resposta antiga limitada a cinco itens para que
            # navegadores que ainda estejam com o JavaScript anterior em
            # memória não exibam todo o histórico de uma vez.
            "jornadas_recentes": jornadas_formatadas[:5],
            "historico_jornadas": jornadas_formatadas,
            "historico_conta": {
                "quantidade": len(
                    historico_conta
                ),
                "eventos": [
                    {
                        "id_evento": evento["id_evento"],
                        "tipo_evento": (
                            evento["tipo_evento"]
                        ),
                        "data_evento": (
                            evento[
                                "data_evento"
                            ].isoformat()
                        ),
                        "administrador": (
                            evento["administrador"]
                        ),
                        "detalhes": evento["detalhes"]
                    }
                    for evento in historico_conta
                ]
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(
            "Erro ao consultar funcionário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar o funcionário."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao consultar funcionário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.put(
    "/funcionarios/{id_usuario}/situacao"
)
def atualizar_situacao_usuario(
    id_usuario: int,
    dados: AlteracaoSituacaoUsuario,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Ativa ou desativa a conta de uma pessoa cadastrada.
    """

    try:
        if id_usuario == administrador["id_usuario"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "O administrador não pode desativar "
                    "a própria conta."
                )
            )

        resultado = alterar_situacao_usuario(
            id_usuario=id_usuario,
            nova_situacao=dados.situacao_usuario.value,
            id_administrador=administrador["id_usuario"],
            observacao=dados.observacao
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "USUARIO_NAO_ENCONTRADO":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado."
                )

            if motivo == "SITUACAO_JA_DEFINIDA":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "A conta já possui a situação "
                        "informada."
                    )
                )

        return {
            "mensagem": (
                "Situação da conta atualizada com sucesso!"
            ),
            "usuario": {
                "id_usuario": resultado["id_usuario"],
                "nome_completo": (
                    resultado["nome_completo"]
                ),
                "tipo_usuario": (
                    resultado["tipo_usuario"]
                ),
                "situacao_anterior": (
                    resultado["situacao_anterior"]
                ),
                "situacao_nova": (
                    resultado["situacao_nova"]
                )
            },
            "alteracao": {
                "id_alteracao_situacao": (
                    resultado[
                        "id_alteracao_situacao"
                    ]
                ),
                "id_administrador": (
                    administrador["id_usuario"]
                ),
                "nome_administrador": (
                    administrador["nome_completo"]
                ),
                "observacao": dados.observacao
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(
            "Erro ao atualizar situação do usuário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível atualizar "
                "a situação da conta."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao atualizar situação: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.put(
    "/funcionarios/{id_usuario}/redefinir-senha"
)
def redefinir_senha_funcionario(
    id_usuario: int,
    dados: RedefinicaoSenhaUsuario,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Cria uma senha provisória para a conta selecionada.
    """

    try:
        if id_usuario == administrador["id_usuario"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Para alterar a própria senha, "
                    "utilize a página de perfil."
                )
            )

        resultado = redefinir_senha_usuario(
            id_usuario=id_usuario,
            nova_senha=dados.nova_senha,
            id_administrador=administrador["id_usuario"]
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "USUARIO_NAO_ENCONTRADO":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado."
                )

            if motivo == "NOVA_SENHA_IGUAL_ATUAL":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "A senha provisória deve ser "
                        "diferente da senha atual."
                    )
                )

        return {
            "mensagem": (
                "Senha provisória definida com sucesso! "
                "A pessoa deverá alterá-la no próximo acesso."
            ),
            "usuario": {
                "id_usuario": resultado["id_usuario"],
                "nome_completo": (
                    resultado["nome_completo"]
                ),
                "tipo_usuario": (
                    resultado["tipo_usuario"]
                ),
                "precisa_trocar_senha": True
            },
            "redefinicao": {
                "id_redefinicao": (
                    resultado["id_redefinicao"]
                ),
                "id_administrador": (
                    administrador["id_usuario"]
                ),
                "nome_administrador": (
                    administrador["nome_completo"]
                ),
                "quantidade_sessoes_encerradas": (
                    resultado[
                        "quantidade_sessoes_encerradas"
                    ]
                )
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(
            "Erro ao redefinir senha do usuário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível redefinir "
                "a senha da conta."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao redefinir senha: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.put(
    "/funcionarios/{id_usuario}/dados"
)
def atualizar_dados_funcionario(
    id_usuario: int,
    dados: AtualizacaoDadosUsuario,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Corrige os dados cadastrais da pessoa selecionada.
    """

    try:
        resultado = atualizar_dados_usuario(
            id_usuario=id_usuario,
            nome_completo=dados.nome_completo,
            cpf=dados.cpf,
            telefone=dados.telefone,
            data_nascimento=dados.data_nascimento,
            id_administrador=administrador["id_usuario"]
        )

        if not resultado["sucesso"]:
            motivo = resultado["motivo"]

            if motivo == "USUARIO_NAO_ENCONTRADO":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário não encontrado."
                )

            if motivo == "CPF_JA_CADASTRADO":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Este CPF já pertence "
                        "a outra conta."
                    )
                )

            if motivo == "SEM_ALTERACOES":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "Nenhuma alteração foi identificada."
                    )
                )

        return {
            "mensagem": (
                "Dados cadastrais atualizados com sucesso!"
            ),
            "usuario": {
                "id_usuario": resultado["id_usuario"],
                "nome_completo": (
                    resultado["nome_completo"]
                ),
                "cpf": resultado["cpf"],
                "telefone": resultado["telefone"],
                "data_nascimento": (
                    resultado[
                        "data_nascimento"
                    ].isoformat()
                ),
                "tipo_usuario": (
                    resultado["tipo_usuario"]
                )
            },
            "alteracao": {
                "id_alteracao_dados": (
                    resultado["id_alteracao_dados"]
                ),
                "id_administrador": (
                    administrador["id_usuario"]
                ),
                "nome_administrador": (
                    administrador["nome_completo"]
                )
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(
            "Erro ao atualizar dados do usuário: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível atualizar "
                "os dados cadastrais."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao atualizar dados: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
