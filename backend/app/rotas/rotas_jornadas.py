from datetime import date, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from mysql.connector import Error

from modelos.jornada import (
    AlteracaoHorario,
    JornadaEntrada,
    JornadaHistoricaCompleta,
    OperacaoSincronizacaoOffline,
    RegistroEntrada,
    RegistroFimAlmoco,
    RegistroInicioAlmoco,
    RegistroSaida,
    TipoRegistro
)
from servicos.servico_jornada import (
    alterar_horario_registro,
    buscar_horarios_da_jornada,
    buscar_jornada_por_id_e_usuario,
    buscar_jornada_por_usuario_e_data,
    buscar_jornadas_por_periodo,
    buscar_registro_da_jornada,
    buscar_registro_por_id_e_usuario,
    criar_jornada,
    criar_jornada_historica_completa,
    criar_registro_entrada,
    criar_registro_fim_almoco,
    criar_registro_inicio_almoco,
    criar_registro_saida
)

from servicos.servico_feriado import (
    buscar_feriados_por_periodo
)
from servicos.servico_sincronizacao_offline import (
    buscar_conflito_por_chave_offline,
    buscar_registro_por_chave_offline,
    registrar_conflito_sincronizacao
)

from utilitarios.dependencias_autenticacao import (
    obter_usuario_com_senha_definitiva
)


def converter_horario_para_minutos(
    horario: time | timedelta
) -> int:
    """
    Converte um horário em minutos para permitir comparações.
    """

    if isinstance(horario, timedelta):
        return int(horario.total_seconds() // 60)

    return horario.hour * 60 + horario.minute

def validar_ordem_dos_horarios(
    horarios: dict,
    tipo_registro_alterado: str,
    horario_novo: time
):
    """
    Confere se a alteração mantém a ordem correta da jornada.
    """

    horarios_em_minutos = {}

    for tipo_registro, registro in horarios.items():
        horarios_em_minutos[tipo_registro] = (
            converter_horario_para_minutos(
                registro["horario_informado"]
            )
        )

    horarios_em_minutos[tipo_registro_alterado] = (
        converter_horario_para_minutos(horario_novo)
    )

    entrada = horarios_em_minutos.get("ENTRADA")
    inicio_almoco = horarios_em_minutos.get("INICIO_ALMOCO")
    fim_almoco = horarios_em_minutos.get("FIM_ALMOCO")
    saida = horarios_em_minutos.get("SAIDA")

    if (
        entrada is not None
        and inicio_almoco is not None
        and entrada > inicio_almoco
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "A entrada não pode ser posterior "
                "ao início do almoço."
            )
        )

    if (
        inicio_almoco is not None
        and fim_almoco is not None
        and inicio_almoco > fim_almoco
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "O início do almoço não pode ser posterior "
                "ao fim do almoço."
            )
        )

    if (
        fim_almoco is not None
        and saida is not None
        and fim_almoco > saida
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "O fim do almoço não pode ser posterior "
                "à saída."
            )
        )
        
def formatar_horario(
    horario: time | timedelta | None
) -> str | None:
    """
    Converte o horário devolvido pelo banco para o formato HH:MM.
    """

    if horario is None:
        return None

    minutos_totais = converter_horario_para_minutos(horario)

    horas = minutos_totais // 60
    minutos = minutos_totais % 60

    return f"{horas:02d}:{minutos:02d}"

def formatar_total_minutos(
    total_minutos: int
) -> str:
    """
    Converte minutos para uma apresentação mais amigável.
    """

    sinal = ""

    if total_minutos < 0:

        sinal = "-"

        total_minutos = abs(
            total_minutos
        )

    horas = total_minutos // 60

    minutos = total_minutos % 60

    return f"{sinal}{horas:02d}h{minutos:02d}"


# =========================================================
# CLASSIFICAÇÃO DO DIA DA JORNADA
# =========================================================

def obter_classificacao_dia(
    data_jornada: date
) -> dict:
    """
    Identifica se a data é um dia normal,
    final de semana ou feriado ativo.

    O feriado possui prioridade sobre o final de semana.
    """

    feriados = buscar_feriados_por_periodo(
        data_inicio=data_jornada,
        data_fim=data_jornada,
        incluir_inativos=False
    )


    if feriados:

        feriado = feriados[0]

        data_feriado = feriado[
            "data_feriado"
        ]

        return {
            "dia_especial": True,

            "tipo_dia": "FERIADO",

            "feriado": {
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
        }


    if data_jornada.weekday() >= 5:

        return {
            "dia_especial": True,
            "tipo_dia": "FINAL_DE_SEMANA",
            "feriado": None
        }


    return {
        "dia_especial": False,
        "tipo_dia": "NORMAL",
        "feriado": None
    }


roteador = APIRouter(
    prefix="/jornadas",
    tags=["Jornadas"]
)


@roteador.post("/sincronizar-offline")
def sincronizar_operacao_offline(
    dados: OperacaoSincronizacaoOffline,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Recebe uma operacao guardada no aparelho. A chave UUID torna a repeticao
    segura; uma divergencia preserva as duas versoes para revisao.
    """

    try:
        id_usuario = usuario["id_usuario"]
        chave_operacao = str(dados.chave_operacao_offline)

        registro_repetido = buscar_registro_por_chave_offline(
            id_usuario=id_usuario,
            chave_operacao=chave_operacao
        )

        if registro_repetido is not None:
            return {
                "situacao": "SINCRONIZADO",
                "idempotente": True,
                "id_jornada": registro_repetido["id_jornada"],
                "id_registro": registro_repetido["id_registro"]
            }

        conflito_repetido = buscar_conflito_por_chave_offline(
            id_usuario=id_usuario,
            chave_operacao=chave_operacao
        )

        if conflito_repetido is not None:
            return {
                "situacao": "CONFLITO",
                "idempotente": True,
                "id_jornada": conflito_repetido["id_jornada"],
                "id_conflito": conflito_repetido["id_conflito"]
            }

        jornada = buscar_jornada_por_usuario_e_data(
            id_usuario=id_usuario,
            data_jornada=dados.data_jornada
        )

        if jornada is None:
            if dados.tipo_registro != TipoRegistro.ENTRADA:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "A entrada offline precisa ser sincronizada "
                        "antes das demais etapas."
                    )
                )

            id_jornada = criar_jornada(
                id_usuario=id_usuario,
                dados=JornadaEntrada(
                    data_jornada=dados.data_jornada,
                    tipo_trabalho_inicio=dados.tipo_trabalho_inicio
                )
            )

            jornada = buscar_jornada_por_id_e_usuario(
                id_jornada=id_jornada,
                id_usuario=id_usuario
            )

        id_jornada = jornada["id_jornada"]
        tipo_registro = dados.tipo_registro.value

        registro_existente = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro=tipo_registro
        )

        if registro_existente is not None:
            horario_igual = (
                converter_horario_para_minutos(
                    registro_existente["horario_informado"]
                )
                ==
                converter_horario_para_minutos(
                    dados.horario_informado
                )
            )

            dados_complementares_iguais = True

            if dados.tipo_registro == TipoRegistro.FIM_ALMOCO:
                dados_complementares_iguais = (
                    jornada["tipo_trabalho_apos_almoco"]
                    == dados.tipo_trabalho_apos_almoco.value
                )

            if dados.tipo_registro == TipoRegistro.SAIDA:
                dados_complementares_iguais = (
                    (jornada["atividade_do_dia"] or None)
                    == (dados.atividade_do_dia or None)
                )

            if horario_igual and dados_complementares_iguais:
                return {
                    "situacao": "SINCRONIZADO",
                    "idempotente": True,
                    "id_jornada": id_jornada,
                    "id_registro": registro_existente["id_registro"]
                }

            id_conflito = registrar_conflito_sincronizacao(
                id_usuario=id_usuario,
                id_jornada=id_jornada,
                horario_servidor=(
                    registro_existente["horario_informado"]
                ),
                dados=dados
            )

            return {
                "situacao": "CONFLITO",
                "idempotente": False,
                "id_jornada": id_jornada,
                "id_conflito": id_conflito
            }

        if jornada["situacao_jornada"] != "EM_ANDAMENTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A jornada nao esta aberta para receber "
                    "um novo horario offline."
                )
            )

        horarios = buscar_horarios_da_jornada(id_jornada)

        dependencias = {
            TipoRegistro.INICIO_ALMOCO: "ENTRADA",
            TipoRegistro.FIM_ALMOCO: "INICIO_ALMOCO",
            TipoRegistro.SAIDA: "FIM_ALMOCO"
        }

        dependencia = dependencias.get(dados.tipo_registro)

        if dependencia and dependencia not in horarios:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Os horarios offline precisam ser sincronizados "
                    "na ordem da jornada."
                )
            )

        validar_ordem_dos_horarios(
            horarios=horarios,
            tipo_registro_alterado=tipo_registro,
            horario_novo=dados.horario_informado
        )

        metadados = {
            "chave_operacao_offline": dados.chave_operacao_offline,
            "data_hora_dispositivo": dados.data_hora_dispositivo,
            "horario_informado": dados.horario_informado,
            "origem_registro": dados.origem_registro
        }

        if dados.tipo_registro == TipoRegistro.ENTRADA:
            id_registro = criar_registro_entrada(
                id_jornada,
                RegistroEntrada(**metadados)
            )
        elif dados.tipo_registro == TipoRegistro.INICIO_ALMOCO:
            id_registro = criar_registro_inicio_almoco(
                id_jornada,
                RegistroInicioAlmoco(**metadados)
            )
        elif dados.tipo_registro == TipoRegistro.FIM_ALMOCO:
            id_registro = criar_registro_fim_almoco(
                id_jornada,
                RegistroFimAlmoco(
                    **metadados,
                    tipo_trabalho_apos_almoco=(
                        dados.tipo_trabalho_apos_almoco
                    )
                )
            )
        else:
            resultado = criar_registro_saida(
                id_jornada,
                RegistroSaida(
                    **metadados,
                    atividade_do_dia=dados.atividade_do_dia
                )
            )
            id_registro = resultado["id_registro"]

        return {
            "situacao": "SINCRONIZADO",
            "idempotente": False,
            "id_jornada": id_jornada,
            "id_registro": id_registro
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao sincronizar operacao offline: {erro}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Nao foi possivel sincronizar o horario offline."
        )

    except RuntimeError as erro:
        print(f"Erro de acesso ao sincronizar operacao offline: {erro}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados esta indisponivel."
        )


@roteador.post(
    "",
    status_code=status.HTTP_201_CREATED
)
def abrir_jornada(
    dados: JornadaEntrada,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Abre a jornada do usuário conectado em uma determinada data.
    """

    try:
        jornada_existente = buscar_jornada_por_usuario_e_data(
            id_usuario=usuario["id_usuario"],
            data_jornada=dados.data_jornada
        )

        if jornada_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Já existe uma jornada para este usuário "
                    "na data informada."
                )
            )

        id_jornada = criar_jornada(
            id_usuario=usuario["id_usuario"],
            dados=dados
        )

        return {
            "mensagem": "Jornada aberta com sucesso!",
            "jornada": {
                "id_jornada": id_jornada,
                "data_jornada": dados.data_jornada.isoformat(),
                "tipo_trabalho_inicio": (
                    dados.tipo_trabalho_inicio.value
                ),
                "situacao_jornada": "EM_ANDAMENTO"
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao abrir jornada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível abrir a jornada."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao abrir jornada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/historica",
    status_code=status.HTTP_201_CREATED
)
def registrar_jornada_historica(
    dados: JornadaHistoricaCompleta,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Registra de uma só vez uma jornada completa esquecida no passado.
    """

    try:
        resultado = criar_jornada_historica_completa(
            id_usuario=usuario["id_usuario"],
            dados=dados
        )

        return {
            "mensagem": "Jornada retroativa criada com sucesso!",
            "jornada": {
                "id_jornada": resultado["id_jornada"],
                "data_jornada": dados.data_jornada.isoformat(),
                "situacao_jornada": "CONCLUIDA"
            }
        }

    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(erro)
        )

    except Error as erro:
        print(f"Erro ao criar jornada retroativa: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível criar a jornada retroativa."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao criar jornada retroativa: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/{id_jornada}/entrada",
    status_code=status.HTTP_201_CREATED
)
def registrar_entrada(
    id_jornada: int,
    dados: RegistroEntrada,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Registra o primeiro horário da jornada.
    """

    try:
        jornada = buscar_jornada_por_id_e_usuario(
            id_jornada=id_jornada,
            id_usuario=usuario["id_usuario"]
        )

        if jornada is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jornada não encontrada."
            )

        if jornada["situacao_jornada"] != "EM_ANDAMENTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Não é possível registrar entrada "
                    "nesta jornada."
                )
            )

        entrada_existente = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="ENTRADA"
        )

        if entrada_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A entrada desta jornada já foi registrada."
                )
            )

        id_registro = criar_registro_entrada(
            id_jornada=id_jornada,
            dados=dados
        )

        return {
            "mensagem": "Entrada registrada com sucesso!",
            "registro": {
                "id_registro": id_registro,
                "id_jornada": id_jornada,
                "tipo_registro": "ENTRADA",
                "horario_informado": (
                    dados.horario_informado.strftime("%H:%M")
                ),
                "origem_registro": dados.origem_registro.value
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao registrar entrada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível registrar a entrada."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao registrar entrada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/{id_jornada}/inicio-almoco",
    status_code=status.HTTP_201_CREATED
)
def registrar_inicio_almoco(
    id_jornada: int,
    dados: RegistroInicioAlmoco,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Registra o início do almoço da jornada.
    """

    try:
        jornada = buscar_jornada_por_id_e_usuario(
            id_jornada=id_jornada,
            id_usuario=usuario["id_usuario"]
        )

        if jornada is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jornada não encontrada."
            )

        if jornada["situacao_jornada"] != "EM_ANDAMENTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Não é possível registrar o início do almoço "
                    "nesta jornada."
                )
            )

        entrada = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="ENTRADA"
        )

        if entrada is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Registre a entrada antes de iniciar o almoço."
                )
            )

        inicio_almoco_existente = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="INICIO_ALMOCO"
        )

        if inicio_almoco_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "O início do almoço desta jornada "
                    "já foi registrado."
                )
            )

        minutos_inicio_almoco = converter_horario_para_minutos(
            dados.horario_informado
        )

        minutos_entrada = converter_horario_para_minutos(
            entrada["horario_informado"]
        )

        if minutos_inicio_almoco < minutos_entrada:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "O início do almoço não pode ser anterior "
                    "ao horário de entrada."
                )
            )

        id_registro = criar_registro_inicio_almoco(
            id_jornada=id_jornada,
            dados=dados
        )

        return {
            "mensagem": "Início do almoço registrado com sucesso!",
            "registro": {
                "id_registro": id_registro,
                "id_jornada": id_jornada,
                "tipo_registro": "INICIO_ALMOCO",
                "horario_informado": (
                    dados.horario_informado.strftime("%H:%M")
                ),
                "origem_registro": dados.origem_registro.value
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao registrar início do almoço: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível registrar o início do almoço."
            )
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao registrar início do almoço: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/{id_jornada}/fim-almoco",
    status_code=status.HTTP_201_CREATED
)
def registrar_fim_almoco(
    id_jornada: int,
    dados: RegistroFimAlmoco,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Registra o fim do almoço e o tipo de trabalho da tarde.
    """

    try:
        jornada = buscar_jornada_por_id_e_usuario(
            id_jornada=id_jornada,
            id_usuario=usuario["id_usuario"]
        )

        if jornada is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jornada não encontrada."
            )

        if jornada["situacao_jornada"] != "EM_ANDAMENTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Não é possível registrar o fim do almoço "
                    "nesta jornada."
                )
            )

        inicio_almoco = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="INICIO_ALMOCO"
        )

        if inicio_almoco is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Registre o início do almoço antes "
                    "de registrar o retorno."
                )
            )

        fim_almoco_existente = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="FIM_ALMOCO"
        )

        if fim_almoco_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "O fim do almoço desta jornada "
                    "já foi registrado."
                )
            )

        minutos_inicio_almoco = converter_horario_para_minutos(
            inicio_almoco["horario_informado"]
        )

        minutos_fim_almoco = converter_horario_para_minutos(
            dados.horario_informado
        )

        if minutos_fim_almoco < minutos_inicio_almoco:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "O fim do almoço não pode ser anterior "
                    "ao início do almoço."
                )
            )

        id_registro = criar_registro_fim_almoco(
            id_jornada=id_jornada,
            dados=dados
        )

        return {
            "mensagem": "Fim do almoço registrado com sucesso!",
            "registro": {
                "id_registro": id_registro,
                "id_jornada": id_jornada,
                "tipo_registro": "FIM_ALMOCO",
                "horario_informado": (
                    dados.horario_informado.strftime("%H:%M")
                ),
                "origem_registro": dados.origem_registro.value,
                "tipo_trabalho_apos_almoco": (
                    dados.tipo_trabalho_apos_almoco.value
                )
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao registrar fim do almoço: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível registrar o fim do almoço."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao registrar fim do almoço: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.post(
    "/{id_jornada}/saida",
    status_code=status.HTTP_201_CREATED
)
def registrar_saida(
    id_jornada: int,
    dados: RegistroSaida,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Registra a saída e conclui a jornada.
    """

    try:
        jornada = buscar_jornada_por_id_e_usuario(
            id_jornada=id_jornada,
            id_usuario=usuario["id_usuario"]
        )

        if jornada is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Jornada não encontrada."
            )

        if jornada["situacao_jornada"] != "EM_ANDAMENTO":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Não é possível registrar saída "
                    "nesta jornada."
                )
            )

        fim_almoco = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="FIM_ALMOCO"
        )

        if fim_almoco is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Registre o fim do almoço antes "
                    "de registrar a saída."
                )
            )

        saida_existente = buscar_registro_da_jornada(
            id_jornada=id_jornada,
            tipo_registro="SAIDA"
        )

        if saida_existente is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A saída desta jornada já foi registrada."
                )
            )

        minutos_fim_almoco = converter_horario_para_minutos(
            fim_almoco["horario_informado"]
        )

        minutos_saida = converter_horario_para_minutos(
            dados.horario_informado
        )

        if minutos_saida < minutos_fim_almoco:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "A saída não pode ser anterior "
                    "ao fim do almoço."
                )
            )

        resultado = criar_registro_saida(
            id_jornada=id_jornada,
            dados=dados
        )

        return {
    "mensagem": "Saída registrada com sucesso!",
    "registro": {
        "id_registro": resultado["id_registro"],
        "id_jornada": id_jornada,
        "tipo_registro": "SAIDA",
        "horario_informado": (
            dados.horario_informado.strftime("%H:%M")
        ),
        "origem_registro": dados.origem_registro.value,
        "atividade_do_dia": dados.atividade_do_dia
    },
    "resumo_jornada": {

    "minutos_manha": (
        resultado["minutos_manha"]
    ),

    "minutos_tarde": (
        resultado["minutos_tarde"]
    ),

    "minutos_trabalhados": (
        resultado["minutos_trabalhados"]
    ),

    "minutos_esperados": (
        resultado["minutos_esperados"]
    ),

    "minutos_extras": (
        resultado["minutos_extras"]
    ),

    "saldo_bruto": (
        resultado["saldo_bruto"]
    ),

    "minutos_tolerancia_aplicada": (
        resultado[
            "minutos_tolerancia_aplicada"
        ]
    ),

    "minutos_saldo": (
        resultado["minutos_saldo"]
    ),

    "dia_especial": (
        resultado["dia_especial"]
    ),

    "tipo_dia": (
        resultado["tipo_dia"]
    ),

    "feriado": (
        resultado["feriado"]
    )
},
    "situacao_jornada": "CONCLUIDA"
}

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao registrar saída: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível registrar a saída."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao registrar saída: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.put(
    "/registros/{id_registro}/horario"
)
def editar_horario(
    id_registro: int,
    dados: AlteracaoHorario,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Altera um horário já registrado e cria a auditoria.
    """

    try:
        registro = buscar_registro_por_id_e_usuario(
            id_registro=id_registro,
            id_usuario=usuario["id_usuario"]
        )

        if registro is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de horário não encontrado."
            )

        horarios = buscar_horarios_da_jornada(
            id_jornada=registro["id_jornada"]
        )

        validar_ordem_dos_horarios(
            horarios=horarios,
            tipo_registro_alterado=(
                registro["tipo_registro"]
            ),
            horario_novo=dados.horario_novo
        )

        resultado = alterar_horario_registro(
            registro=registro,
            id_usuario_alteracao=usuario["id_usuario"],
            dados=dados
        )

        return {
            "mensagem": "Horário alterado com sucesso!",
            "aviso": (
                "A alteração foi registrada no histórico "
                "de auditoria."
            ),
            "alteracao": {
                "id_alteracao": resultado["id_alteracao"],
                "id_registro": resultado["id_registro"],
                "id_jornada": resultado["id_jornada"],
                "tipo_registro": resultado["tipo_registro"],
                "horario_anterior": str(
                    resultado["horario_anterior"]
                ),
                "horario_novo": (
                    resultado["horario_novo"].strftime("%H:%M")
                )
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao alterar horário: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível alterar o horário."
        )

    except RuntimeError as erro:
        print(f"Erro ao alterar horário: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(erro)
        )
        
@roteador.get(
    "/data/{data_jornada}"
)
def consultar_jornada_por_data(
    data_jornada: date,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Consulta a jornada do usuário conectado em uma determinada data.
    """

    try:
        if data_jornada > date.today():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Não é possível consultar uma jornada "
                    "em uma data futura."
                )
            )

        jornada = buscar_jornada_por_usuario_e_data(
            id_usuario=usuario["id_usuario"],
            data_jornada=data_jornada
        )

        if jornada is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Nenhuma jornada foi encontrada "
                    "na data informada."
                )
            )

        horarios = buscar_horarios_da_jornada(
            id_jornada=jornada["id_jornada"]
        )

        entrada = horarios.get("ENTRADA")
        inicio_almoco = horarios.get("INICIO_ALMOCO")
        fim_almoco = horarios.get("FIM_ALMOCO")
        saida = horarios.get("SAIDA")

        minutos_trabalhados = jornada["minutos_trabalhados"]
        minutos_esperados = jornada["minutos_esperados"]
        minutos_extras = jornada["minutos_extras"]
        minutos_saldo = jornada["minutos_saldo"]

        classificacao_dia = obter_classificacao_dia(
            data_jornada
        )
       

        return {
            "jornada": {
                "id_jornada": jornada["id_jornada"],
                "data_jornada": (
                    jornada["data_jornada"].isoformat()
                ),
                "tipo_trabalho_inicio": (
                    jornada["tipo_trabalho_inicio"]
                ),
                "tipo_trabalho_apos_almoco": (
                    jornada["tipo_trabalho_apos_almoco"]
                ),
                "atividade_do_dia": (
                    jornada["atividade_do_dia"]
                ),
                "situacao_jornada": (
                    jornada["situacao_jornada"]
                )
            },
            "horarios": {
                "entrada": formatar_horario(
                    entrada["horario_informado"]
                    if entrada is not None
                    else None
                ),
                "inicio_almoco": formatar_horario(
                    inicio_almoco["horario_informado"]
                    if inicio_almoco is not None
                    else None
                ),
                "fim_almoco": formatar_horario(
                    fim_almoco["horario_informado"]
                    if fim_almoco is not None
                    else None
                ),
                "saida": formatar_horario(
                    saida["horario_informado"]
                    if saida is not None
                    else None
                )
            },
            "resumo": {
                "minutos_trabalhados": minutos_trabalhados,
                "tempo_trabalhado_formatado": (
                    formatar_total_minutos(
                        minutos_trabalhados
                    )
                ),
                "minutos_esperados": minutos_esperados,
                "tempo_esperado_formatado": (
                    formatar_total_minutos(
                        minutos_esperados
                    )
                ),
                "minutos_extras": minutos_extras,
                "horas_extras_formatadas": (
                    formatar_total_minutos(
                        minutos_extras
                    )
                ),
                "minutos_saldo": minutos_saldo,
                "saldo_formatado": (
                    formatar_total_minutos(
                        minutos_saldo
                    )
                ),
                "minutos_tolerancia_aplicada": (
    jornada[
        "minutos_tolerancia_aplicada"
    ]
),

"minutos_abonados": (
    jornada["minutos_abonados"]
),

"dia_especial": (
    classificacao_dia[
        "dia_especial"
    ]
),

"tipo_dia": (
    classificacao_dia[
        "tipo_dia"
    ]
),

"feriado": (
    classificacao_dia[
        "feriado"
    ]
)
            }
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao consultar jornada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível consultar a jornada."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão ao consultar jornada: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
        
@roteador.get(
    "/historico"
)
def consultar_historico_jornadas(
    data_inicio: date,
    data_fim: date,
    usuario=Depends(
        obter_usuario_com_senha_definitiva
    )
):
    """
    Consulta as jornadas do usuário conectado em um período.
    """

    try:
        if data_inicio > data_fim:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "A data inicial não pode ser posterior "
                    "à data final."
                )
            )

        if data_fim > date.today():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "A data final não pode estar no futuro."
                )
            )

        quantidade_dias = (
            data_fim - data_inicio
        ).days

        if quantidade_dias > 366:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "O período consultado não pode ultrapassar "
                    "366 dias."
                )
            )

        jornadas = buscar_jornadas_por_periodo(
            id_usuario=usuario["id_usuario"],
            data_inicio=data_inicio,
            data_fim=data_fim
        )

        total_minutos_trabalhados = sum(
            jornada["minutos_trabalhados"]
            for jornada in jornadas
        )

        total_minutos_esperados = sum(
            jornada["minutos_esperados"]
            for jornada in jornadas
        )

        total_minutos_extras = sum(
            jornada["minutos_extras"]
            for jornada in jornadas
        )

        total_minutos_saldo = sum(
            jornada["minutos_saldo"]
            for jornada in jornadas
        )

        jornadas_formatadas = []

        for jornada in jornadas:
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
                        jornada["tipo_trabalho_apos_almoco"]
                    ),
                    "atividade_do_dia": (
                        jornada["atividade_do_dia"]
                    ),
                    "situacao_jornada": (
                        jornada["situacao_jornada"]
                    ),
                    "minutos_trabalhados": (
                        jornada["minutos_trabalhados"]
                    ),
                    "tempo_trabalhado_formatado": (
                        formatar_total_minutos(
                            jornada["minutos_trabalhados"]
                        )
                    ),
                    "minutos_esperados": (
                        jornada["minutos_esperados"]
                    ),
                    "tempo_esperado_formatado": (
                        formatar_total_minutos(
                            jornada["minutos_esperados"]
                        )
                    ),
                    "minutos_extras": (
                        jornada["minutos_extras"]
                    ),
                    "horas_extras_formatadas": (
                        formatar_total_minutos(
                            jornada["minutos_extras"]
                        )
                    ),
                    "minutos_saldo": (
                        jornada["minutos_saldo"]
                    ),
                    "saldo_formatado": (
                        formatar_total_minutos(
                            jornada["minutos_saldo"]
                        )
                    ),
                    "minutos_tolerancia_aplicada": (
                        jornada[
                            "minutos_tolerancia_aplicada"
                        ]
                    ),
                    "minutos_abonados": (
                        jornada["minutos_abonados"]
                    )
                }
            )

        return {
            "periodo": {
                "data_inicio": data_inicio.isoformat(),
                "data_fim": data_fim.isoformat()
            },
            "resumo": {
                "quantidade_jornadas": len(jornadas),
                "total_minutos_trabalhados": (
                    total_minutos_trabalhados
                ),
                "total_trabalhado_formatado": (
                    formatar_total_minutos(
                        total_minutos_trabalhados
                    )
                ),
                "total_minutos_esperados": (
                    total_minutos_esperados
                ),
                "total_esperado_formatado": (
                    formatar_total_minutos(
                        total_minutos_esperados
                    )
                ),
                "total_minutos_extras": (
                    total_minutos_extras
                ),
                "total_extras_formatado": (
                    formatar_total_minutos(
                        total_minutos_extras
                    )
                ),
                "total_minutos_saldo": (
                    total_minutos_saldo
                ),
                "total_saldo_formatado": (
                    formatar_total_minutos(
                        total_minutos_saldo
                    )
                )
            },
            "jornadas": jornadas_formatadas
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao consultar histórico: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Não foi possível consultar o histórico."
            )
        )

    except RuntimeError as erro:
        print(
            f"Erro de conexão ao consultar histórico: {erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
