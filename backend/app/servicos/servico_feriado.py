"""
Serviço responsável pelo cadastro e administração
dos feriados globais do Gestor de Jornadas.
"""

from datetime import date

from mysql.connector import Error

from banco.conexao import criar_conexao

from modelos.feriado import (
    AlteracaoFeriado,
    FeriadoEntrada,
    MudancaSituacaoFeriado
)

from servicos.servico_jornada import (
    aplicar_regra_dia_especial,
    buscar_feriado_ativo_na_data
)

from utilitarios.calculo_jornada import (
    calcular_resumo_jornada
)


# =========================================================
# FORMATAÇÃO DOS TEXTOS
# =========================================================

def normalizar_texto_opcional(
    texto: str | None
) -> str | None:
    """
    Remove espaços desnecessários.

    Um texto vazio é transformado em None.
    """

    if texto is None:
        return None

    texto_limpo = texto.strip()

    if not texto_limpo:
        return None

    return texto_limpo


def normalizar_texto_obrigatorio(
    texto: str
) -> str | None:
    """
    Limpa um texto obrigatório.

    Retorna None caso o valor contenha apenas espaços.
    """

    texto_limpo = texto.strip()

    if not texto_limpo:
        return None

    return texto_limpo


# =========================================================
# RECÁLCULO DAS JORNADAS
# =========================================================

def recalcular_jornadas_concluidas_na_data(
    cursor,
    data_jornada: date
) -> dict:
    """
    Recalcula todas as jornadas concluídas na data.

    Esta função é executada quando um feriado é criado,
    desativado ou reativado.

    O mesmo cursor é utilizado para que a alteração do
    feriado e os recálculos pertençam à mesma transação.
    """

    comando_jornadas = """
        SELECT
            id_jornada,
            data_jornada,
            tipo_trabalho_inicio,
            tipo_trabalho_apos_almoco

        FROM jornadas_diarias

        WHERE data_jornada = %s
          AND situacao_jornada = 'CONCLUIDA'

        ORDER BY id_jornada ASC

        FOR UPDATE
    """

    cursor.execute(
        comando_jornadas,
        (data_jornada,)
    )

    jornadas = cursor.fetchall()

    if not jornadas:
        return {
            "jornadas_encontradas": 0,
            "jornadas_recalculadas": 0,
            "jornadas_ignoradas": 0,
            "detalhes_ignoradas": []
        }

    feriado = buscar_feriado_ativo_na_data(
        cursor=cursor,
        data_jornada=data_jornada
    )

    quantidade_recalculadas = 0
    detalhes_ignoradas = []

    for jornada in jornadas:
        id_jornada = jornada["id_jornada"]

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
            registro["tipo_registro"]: registro["horario_informado"]
            for registro in registros
        }

        tipos_obrigatorios = {
            "ENTRADA",
            "INICIO_ALMOCO",
            "FIM_ALMOCO",
            "SAIDA"
        }

        tipos_encontrados = set(
            horarios.keys()
        )

        tipos_ausentes = sorted(
            tipos_obrigatorios - tipos_encontrados
        )

        # Uma jornada incompleta não pode ser recalculada.
        if tipos_ausentes:
            detalhes_ignoradas.append(
                {
                    "id_jornada": id_jornada,
                    "motivo": (
                        "Horários obrigatórios ausentes: "
                        + ", ".join(tipos_ausentes)
                    )
                }
            )

            continue

        tipo_trabalho_apos_almoco = (
            jornada["tipo_trabalho_apos_almoco"]
            or jornada["tipo_trabalho_inicio"]
        )

        resumo_normal = calcular_resumo_jornada(
            horario_entrada=horarios["ENTRADA"],
            horario_inicio_almoco=horarios["INICIO_ALMOCO"],
            horario_fim_almoco=horarios["FIM_ALMOCO"],
            horario_saida=horarios["SAIDA"],
            tipo_trabalho_inicio=(
                jornada["tipo_trabalho_inicio"]
            ),
            tipo_trabalho_apos_almoco=(
                tipo_trabalho_apos_almoco
            )
        )

        if resumo_normal is None:
            detalhes_ignoradas.append(
                {
                    "id_jornada": id_jornada,
                    "motivo": (
                        "O cálculo normal não retornou "
                        "os totais da jornada."
                    )
                }
            )

            continue

        resumo_atualizado = aplicar_regra_dia_especial(
            resumo=resumo_normal,
            data_jornada=jornada["data_jornada"],
            feriado=feriado
        )

        if resumo_atualizado is None:
            detalhes_ignoradas.append(
                {
                    "id_jornada": id_jornada,
                    "motivo": (
                        "A regra do dia especial não "
                        "retornou os totais."
                    )
                }
            )

            continue

        comando_atualizacao = """
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
            comando_atualizacao,
            (
                resumo_atualizado["minutos_trabalhados"],
                resumo_atualizado["minutos_esperados"],
                resumo_atualizado["minutos_extras"],
                resumo_atualizado["minutos_saldo"],
                resumo_atualizado[
                    "minutos_tolerancia_aplicada"
                ],
                id_jornada
            )
        )

        quantidade_recalculadas += 1

    return {
        "jornadas_encontradas": len(jornadas),
        "jornadas_recalculadas": quantidade_recalculadas,
        "jornadas_ignoradas": len(detalhes_ignoradas),
        "detalhes_ignoradas": detalhes_ignoradas
    }
    
    # =========================================================
# CRIAÇÃO DO FERIADO
# =========================================================

def criar_feriado(
    dados: FeriadoEntrada,
    id_administrador: int
) -> dict:
    """
    Cadastra um novo feriado global e registra a criação
    no histórico.

    As jornadas concluídas na data são recalculadas antes
    da confirmação da transação.
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
        nome_feriado = normalizar_texto_obrigatorio(
            dados.nome_feriado
        )

        if nome_feriado is None:
            return {
                "sucesso": False,
                "motivo": "NOME_INVALIDO"
            }

        descricao = normalizar_texto_opcional(
            dados.descricao
        )

        comando_busca = """
            SELECT
                id_feriado,
                data_feriado,
                nome_feriado,
                ativo

            FROM feriados

            WHERE data_feriado = %s

            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (dados.data_feriado,)
        )

        feriado_existente = cursor.fetchone()

        if feriado_existente is not None:
            return {
                "sucesso": False,
                "motivo": "DATA_JA_CADASTRADA",
                "feriado_existente": feriado_existente
            }

        comando_criacao = """
            INSERT INTO feriados (
                data_feriado,
                nome_feriado,
                descricao,
                ativo,
                id_administrador_criacao
            )
            VALUES (
                %s,
                %s,
                %s,
                TRUE,
                %s
            )
        """

        cursor.execute(
            comando_criacao,
            (
                dados.data_feriado,
                nome_feriado,
                descricao,
                id_administrador
            )
        )

        id_feriado = cursor.lastrowid

        comando_historico = """
            INSERT INTO historico_feriados (
                id_feriado,
                data_feriado,
                acao_realizada,
                nome_anterior,
                nome_novo,
                descricao_anterior,
                descricao_nova,
                ativo_anterior,
                ativo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                'CRIADO',
                NULL,
                %s,
                NULL,
                %s,
                NULL,
                TRUE,
                NULL,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                id_feriado,
                dados.data_feriado,
                nome_feriado,
                descricao,
                id_administrador
            )
        )

        recalculo_jornadas = (
            recalcular_jornadas_concluidas_na_data(
                cursor=cursor,
                data_jornada=dados.data_feriado
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_feriado": id_feriado,
            "data_feriado": dados.data_feriado,
            "nome_feriado": nome_feriado,
            "descricao": descricao,
            "ativo": True,
            "id_administrador": id_administrador,
            "recalculo_jornadas": recalculo_jornadas
        }

    except Error:
        conexao.rollback()
        raise

    except RuntimeError:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
# =========================================================
# EDIÇÃO DO FERIADO
# =========================================================

def alterar_feriado(
    id_feriado: int,
    dados: AlteracaoFeriado,
    id_administrador: int
) -> dict:
    """
    Altera o nome ou a descrição de um feriado.

    A data e a situação ativa do feriado não são alteradas
    por esta operação, por isso as jornadas não precisam
    ser recalculadas.
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
        nome_novo = normalizar_texto_obrigatorio(
            dados.nome_feriado
        )

        if nome_novo is None:
            return {
                "sucesso": False,
                "motivo": "NOME_INVALIDO"
            }

        descricao_nova = normalizar_texto_opcional(
            dados.descricao
        )

        motivo_alteracao = normalizar_texto_opcional(
            dados.motivo_alteracao
        )

        comando_busca = """
            SELECT
                id_feriado,
                data_feriado,
                nome_feriado,
                descricao,
                ativo

            FROM feriados

            WHERE id_feriado = %s

            LIMIT 1

            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_feriado,)
        )

        feriado = cursor.fetchone()

        if feriado is None:
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_NAO_ENCONTRADO"
            }

        nome_anterior = feriado["nome_feriado"]

        descricao_anterior = normalizar_texto_opcional(
            feriado["descricao"]
        )

        ativo_atual = bool(
            feriado["ativo"]
        )

        if (
            nome_anterior == nome_novo
            and descricao_anterior == descricao_nova
        ):
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "NENHUMA_ALTERACAO"
            }

        comando_atualizacao = """
            UPDATE feriados

            SET
                nome_feriado = %s,
                descricao = %s,
                id_administrador_atualizacao = %s

            WHERE id_feriado = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                nome_novo,
                descricao_nova,
                id_administrador,
                id_feriado
            )
        )

        comando_historico = """
            INSERT INTO historico_feriados (
                id_feriado,
                data_feriado,
                acao_realizada,
                nome_anterior,
                nome_novo,
                descricao_anterior,
                descricao_nova,
                ativo_anterior,
                ativo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                'ALTERADO',
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                id_feriado,
                feriado["data_feriado"],
                nome_anterior,
                nome_novo,
                descricao_anterior,
                descricao_nova,
                ativo_atual,
                ativo_atual,
                motivo_alteracao,
                id_administrador
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_feriado": id_feriado,
            "data_feriado": feriado["data_feriado"],
            "nome_anterior": nome_anterior,
            "nome_novo": nome_novo,
            "descricao_anterior": descricao_anterior,
            "descricao_nova": descricao_nova,
            "ativo": ativo_atual,
            "motivo_alteracao": motivo_alteracao,
            "id_administrador": id_administrador
        }

    except Error:
        conexao.rollback()
        raise

    except RuntimeError:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
# =========================================================
# EXCLUSÃO
# =========================================================

def excluir_feriado(
    id_feriado: int
) -> dict:
    """
    Exclui definitivamente um feriado e o seu histórico.

    As jornadas concluídas na data são recalculadas dentro
    da mesma transação, já sem a regra do feriado excluído.
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
        comando_busca = """
            SELECT
                id_feriado,
                data_feriado,
                nome_feriado

            FROM feriados

            WHERE id_feriado = %s

            LIMIT 1

            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_feriado,)
        )

        feriado = cursor.fetchone()

        if feriado is None:
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_NAO_ENCONTRADO"
            }

        cursor.execute(
            """
                DELETE FROM historico_feriados
                WHERE id_feriado = %s
            """,
            (id_feriado,)
        )

        cursor.execute(
            """
                DELETE FROM feriados
                WHERE id_feriado = %s
            """,
            (id_feriado,)
        )

        recalculo_jornadas = (
            recalcular_jornadas_concluidas_na_data(
                cursor=cursor,
                data_jornada=feriado["data_feriado"]
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_feriado": id_feriado,
            "data_feriado": feriado["data_feriado"],
            "nome_feriado": feriado["nome_feriado"],
            "recalculo_jornadas": recalculo_jornadas
        }

    except Error:
        conexao.rollback()
        raise

    except RuntimeError:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


# =========================================================
# DESATIVAÇÃO
# =========================================================

def desativar_feriado(
    id_feriado: int,
    dados: MudancaSituacaoFeriado,
    id_administrador: int
) -> dict:
    """
    Desativa um feriado sem apagá-lo do banco.

    Depois da desativação, as jornadas concluídas na data
    são recalculadas como dia normal ou final de semana.
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
        comando_busca = """
            SELECT
                id_feriado,
                data_feriado,
                nome_feriado,
                descricao,
                ativo

            FROM feriados

            WHERE id_feriado = %s

            LIMIT 1

            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_feriado,)
        )

        feriado = cursor.fetchone()

        if feriado is None:
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_NAO_ENCONTRADO"
            }

        if not bool(
            feriado["ativo"]
        ):
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_JA_DESATIVADO"
            }

        motivo_alteracao = normalizar_texto_opcional(
            dados.motivo_alteracao
        )

        comando_atualizacao = """
            UPDATE feriados

            SET
                ativo = FALSE,
                id_administrador_atualizacao = %s

            WHERE id_feriado = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                id_administrador,
                id_feriado
            )
        )

        comando_historico = """
            INSERT INTO historico_feriados (
                id_feriado,
                data_feriado,
                acao_realizada,
                nome_anterior,
                nome_novo,
                descricao_anterior,
                descricao_nova,
                ativo_anterior,
                ativo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                'DESATIVADO',
                %s,
                %s,
                %s,
                %s,
                TRUE,
                FALSE,
                %s,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                id_feriado,
                feriado["data_feriado"],
                feriado["nome_feriado"],
                feriado["nome_feriado"],
                feriado["descricao"],
                feriado["descricao"],
                motivo_alteracao,
                id_administrador
            )
        )

        recalculo_jornadas = (
            recalcular_jornadas_concluidas_na_data(
                cursor=cursor,
                data_jornada=feriado["data_feriado"]
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_feriado": id_feriado,
            "data_feriado": feriado["data_feriado"],
            "nome_feriado": feriado["nome_feriado"],
            "descricao": feriado["descricao"],
            "ativo": False,
            "motivo_alteracao": motivo_alteracao,
            "id_administrador": id_administrador,
            "recalculo_jornadas": recalculo_jornadas
        }

    except Error:
        conexao.rollback()
        raise

    except RuntimeError:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
# =========================================================
# REATIVAÇÃO
# =========================================================

def reativar_feriado(
    id_feriado: int,
    dados: MudancaSituacaoFeriado,
    id_administrador: int
) -> dict:
    """
    Reativa um feriado que havia sido desativado.

    Depois da reativação, todas as jornadas concluídas
    na data são recalculadas.
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
        comando_busca = """
            SELECT
                id_feriado,
                data_feriado,
                nome_feriado,
                descricao,
                ativo

            FROM feriados

            WHERE id_feriado = %s

            LIMIT 1

            FOR UPDATE
        """

        cursor.execute(
            comando_busca,
            (id_feriado,)
        )

        feriado = cursor.fetchone()

        if feriado is None:
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_NAO_ENCONTRADO"
            }

        if bool(
            feriado["ativo"]
        ):
            conexao.rollback()

            return {
                "sucesso": False,
                "motivo": "FERIADO_JA_ATIVO"
            }

        motivo_alteracao = normalizar_texto_opcional(
            dados.motivo_alteracao
        )

        comando_atualizacao = """
            UPDATE feriados

            SET
                ativo = TRUE,
                id_administrador_atualizacao = %s

            WHERE id_feriado = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                id_administrador,
                id_feriado
            )
        )

        comando_historico = """
            INSERT INTO historico_feriados (
                id_feriado,
                data_feriado,
                acao_realizada,
                nome_anterior,
                nome_novo,
                descricao_anterior,
                descricao_nova,
                ativo_anterior,
                ativo_novo,
                motivo_alteracao,
                id_administrador
            )
            VALUES (
                %s,
                %s,
                'REATIVADO',
                %s,
                %s,
                %s,
                %s,
                FALSE,
                TRUE,
                %s,
                %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                id_feriado,
                feriado["data_feriado"],
                feriado["nome_feriado"],
                feriado["nome_feriado"],
                feriado["descricao"],
                feriado["descricao"],
                motivo_alteracao,
                id_administrador
            )
        )

        recalculo_jornadas = (
            recalcular_jornadas_concluidas_na_data(
                cursor=cursor,
                data_jornada=feriado["data_feriado"]
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_feriado": id_feriado,
            "data_feriado": feriado["data_feriado"],
            "nome_feriado": feriado["nome_feriado"],
            "descricao": feriado["descricao"],
            "ativo": True,
            "motivo_alteracao": motivo_alteracao,
            "id_administrador": id_administrador,
            "recalculo_jornadas": recalculo_jornadas
        }

    except Error:
        conexao.rollback()
        raise

    except RuntimeError:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
# =========================================================
# CONSULTA POR PERÍODO
# =========================================================

def buscar_feriados_por_periodo(
    data_inicio: date,
    data_fim: date,
    incluir_inativos: bool
) -> list[dict]:
    """
    Consulta os feriados existentes dentro de um período.
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
        filtro_ativo = ""

        if not incluir_inativos:
            filtro_ativo = """
                AND feriado.ativo = TRUE
            """

        comando_sql = f"""
            SELECT
                feriado.id_feriado,
                feriado.data_feriado,
                feriado.nome_feriado,
                feriado.descricao,
                feriado.ativo,
                feriado.id_administrador_criacao,
                feriado.id_administrador_atualizacao,
                feriado.data_criacao,
                feriado.data_atualizacao,

                administrador_criacao.nome_completo
                    AS nome_administrador_criacao,

                administrador_atualizacao.nome_completo
                    AS nome_administrador_atualizacao

            FROM feriados feriado

            INNER JOIN usuarios administrador_criacao
                ON administrador_criacao.id_usuario =
                    feriado.id_administrador_criacao

            LEFT JOIN usuarios administrador_atualizacao
                ON administrador_atualizacao.id_usuario =
                    feriado.id_administrador_atualizacao

            WHERE feriado.data_feriado
                BETWEEN %s AND %s

            {filtro_ativo}

            ORDER BY
                feriado.data_feriado ASC,
                feriado.nome_feriado ASC
        """

        cursor.execute(
            comando_sql,
            (
                data_inicio,
                data_fim
            )
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()


# =========================================================
# HISTÓRICO DO FERIADO
# =========================================================

def buscar_historico_feriado(
    id_feriado: int
) -> list[dict]:
    """
    Consulta todas as alterações realizadas em um feriado.
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
                historico.id_historico,
                historico.id_feriado,
                historico.data_feriado,
                historico.acao_realizada,
                historico.nome_anterior,
                historico.nome_novo,
                historico.descricao_anterior,
                historico.descricao_nova,
                historico.ativo_anterior,
                historico.ativo_novo,
                historico.motivo_alteracao,
                historico.id_administrador,
                historico.data_alteracao,

                administrador.nome_completo
                    AS nome_administrador

            FROM historico_feriados historico

            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    historico.id_administrador

            WHERE historico.id_feriado = %s

            ORDER BY
                historico.data_alteracao DESC,
                historico.id_historico DESC
        """

        cursor.execute(
            comando_sql,
            (id_feriado,)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()
