from datetime import time, timedelta


# Horários normais das jornadas da Empresa Demonstração
HORARIO_ENTRADA_PADRAO = 6 * 60
HORARIO_INICIO_ALMOCO_PADRAO = 11 * 60
HORARIO_FIM_ALMOCO_PADRAO = 12 * 60

HORARIO_SAIDA_ADMINISTRATIVO = 15 * 60
HORARIO_SAIDA_OPERACIONAL = 16 * 60

TOLERANCIA_DIARIA = 5


def converter_horario_para_minutos(
    horario: time | timedelta
) -> int:
    """
    Converte um horário para a quantidade total de minutos.
    """

    if isinstance(horario, timedelta):
        return int(horario.total_seconds() // 60)

    return horario.hour * 60 + horario.minute


def calcular_resumo_jornada(
    horario_entrada: time | timedelta,
    horario_inicio_almoco: time | timedelta,
    horario_fim_almoco: time | timedelta,
    horario_saida: time | timedelta,
    tipo_trabalho_inicio: str,
    tipo_trabalho_apos_almoco: str
) -> dict:
    """
    Calcula o tempo trabalhado, atrasos, tolerância e saldo do dia.
    """

    entrada_minutos = converter_horario_para_minutos(
        horario_entrada
    )

    inicio_almoco_minutos = converter_horario_para_minutos(
        horario_inicio_almoco
    )

    fim_almoco_minutos = converter_horario_para_minutos(
        horario_fim_almoco
    )

    saida_minutos = converter_horario_para_minutos(
        horario_saida
    )

    minutos_manha = (
        inicio_almoco_minutos - entrada_minutos
    )

    minutos_tarde = (
        saida_minutos - fim_almoco_minutos
    )

    minutos_trabalhados = (
        minutos_manha + minutos_tarde
    )

    # Somente um dia completamente de operacional exige nove horas
    jornada_totalmente_operacional = (
        tipo_trabalho_inicio == "OPERACIONAL"
        and tipo_trabalho_apos_almoco == "OPERACIONAL"
    )

    if jornada_totalmente_operacional:
        minutos_esperados = 540
        horario_saida_esperado = HORARIO_SAIDA_OPERACIONAL

    else:
        minutos_esperados = 480
        horario_saida_esperado = HORARIO_SAIDA_ADMINISTRATIVO

    # Diferença da entrada:
    # positivo quando entra antes e negativo quando entra atrasado
    saldo_entrada = (
        HORARIO_ENTRADA_PADRAO - entrada_minutos
    )

    duracao_almoco = (
        fim_almoco_minutos - inicio_almoco_minutos
    )

    duracao_almoco_esperada = (
        HORARIO_FIM_ALMOCO_PADRAO
        - HORARIO_INICIO_ALMOCO_PADRAO
    )

    # Positivo quando o almoço dura menos de uma hora.
    # Negativo quando o almoço passa de uma hora.
    saldo_almoco = (
        duracao_almoco_esperada - duracao_almoco
    )

    # Positivo quando sai depois e negativo quando sai antes
    saldo_saida = (
        saida_minutos - horario_saida_esperado
    )

    saldo_bruto = (
        saldo_entrada
        + saldo_almoco
        + saldo_saida
    )

    # Soma somente as partes negativas do dia
    minutos_negativos = (
        max(-saldo_entrada, 0)
        + max(-saldo_almoco, 0)
        + max(-saldo_saida, 0)
    )

    # A tolerância perdoa até cinco minutos negativos,
    # mesmo quando o saldo total do dia termina positivo
    minutos_tolerancia_aplicada = min(
        minutos_negativos,
        TOLERANCIA_DIARIA
    )

    minutos_saldo = (
        saldo_bruto
        + minutos_tolerancia_aplicada
    )

    minutos_extras = max(
        minutos_saldo,
        0
    )

    return {
        "minutos_manha": minutos_manha,
        "minutos_tarde": minutos_tarde,
        "minutos_trabalhados": minutos_trabalhados,
        "minutos_esperados": minutos_esperados,
        "saldo_bruto": saldo_bruto,
        "minutos_tolerancia_aplicada": (
            minutos_tolerancia_aplicada
        ),
        "minutos_saldo": minutos_saldo,
        "minutos_extras": minutos_extras
    }