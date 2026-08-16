from mysql.connector import Error

from banco.conexao import criar_conexao
from utilitarios.seguranca_senha import (
    gerar_hash_senha,
    verificar_senha
)


def verificar_administrador(id_administrador: int) -> bool:
    """
    Confere se o usuário informado é um administrador ativo.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor()

    try:
        comando_sql = """
            SELECT id_usuario
            FROM usuarios
            WHERE id_usuario = %s
              AND tipo_usuario = 'ADMINISTRADOR'
              AND situacao_usuario = 'ATIVO'
            LIMIT 1
        """

        cursor.execute(comando_sql, (id_administrador,))

        return cursor.fetchone() is not None

    finally:
        cursor.close()
        conexao.close()


def listar_solicitacoes_pendentes():
    """
    Lista os cadastros que ainda aguardam uma decisão.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_solicitacao,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                foto_perfil,
                data_solicitacao
            FROM solicitacoes_cadastro
            WHERE situacao_solicitacao = 'PENDENTE'
            ORDER BY data_solicitacao ASC
        """

        cursor.execute(comando_sql)

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()


def aprovar_solicitacao(
    id_solicitacao: int,
    id_administrador: int,
    observacao: str | None
):
    """
    Aprova uma solicitação e cria o usuário no sistema.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        conexao.start_transaction()

        comando_busca = """
            SELECT
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                senha_hash,
                foto_perfil,
                situacao_solicitacao
            FROM solicitacoes_cadastro
            WHERE id_solicitacao = %s
            FOR UPDATE
        """

        cursor.execute(comando_busca, (id_solicitacao,))
        solicitacao = cursor.fetchone()

        if solicitacao is None:
            conexao.rollback()
            return {
                "sucesso": False,
                "motivo": "SOLICITACAO_NAO_ENCONTRADA"
            }

        if solicitacao["situacao_solicitacao"] != "PENDENTE":
            conexao.rollback()
            return {
                "sucesso": False,
                "motivo": "SOLICITACAO_JA_RESPONDIDA"
            }

        comando_usuario_existente = """
            SELECT id_usuario
            FROM usuarios
            WHERE cpf = %s
            LIMIT 1
        """

        cursor.execute(
            comando_usuario_existente,
            (solicitacao["cpf"],)
        )

        if cursor.fetchone() is not None:
            conexao.rollback()
            return {
                "sucesso": False,
                "motivo": "CPF_JA_CADASTRADO"
            }

        comando_criar_usuario = """
            INSERT INTO usuarios (
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                senha_hash,
                foto_perfil,
                tipo_usuario,
                situacao_usuario
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        valores_usuario = (
            solicitacao["nome_completo"],
            solicitacao["cpf"],
            solicitacao["telefone"],
            solicitacao["data_nascimento"],
            solicitacao["senha_hash"],
            solicitacao["foto_perfil"],
            "FUNCIONARIO",
            "ATIVO"
        )

        cursor.execute(
            comando_criar_usuario,
            valores_usuario
        )

        id_usuario_criado = cursor.lastrowid

        comando_atualizar_solicitacao = """
            UPDATE solicitacoes_cadastro
            SET
                situacao_solicitacao = 'APROVADA',
                observacao_administrador = %s,
                data_resposta = CURRENT_TIMESTAMP,
                id_administrador_responsavel = %s
            WHERE id_solicitacao = %s
        """

        cursor.execute(
            comando_atualizar_solicitacao,
            (
                observacao,
                id_administrador,
                id_solicitacao
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_usuario": id_usuario_criado
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def recusar_solicitacao(
    id_solicitacao: int,
    id_administrador: int,
    observacao: str | None
):
    """
    Recusa uma solicitação sem apagar os dados enviados.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError("Não foi possível acessar o banco de dados.")

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT situacao_solicitacao
            FROM solicitacoes_cadastro
            WHERE id_solicitacao = %s
            LIMIT 1
        """

        cursor.execute(comando_busca, (id_solicitacao,))
        solicitacao = cursor.fetchone()

        if solicitacao is None:
            return {
                "sucesso": False,
                "motivo": "SOLICITACAO_NAO_ENCONTRADA"
            }

        if solicitacao["situacao_solicitacao"] != "PENDENTE":
            return {
                "sucesso": False,
                "motivo": "SOLICITACAO_JA_RESPONDIDA"
            }

        comando_atualizacao = """
            UPDATE solicitacoes_cadastro
            SET
                situacao_solicitacao = 'RECUSADA',
                observacao_administrador = %s,
                data_resposta = CURRENT_TIMESTAMP,
                id_administrador_responsavel = %s
            WHERE id_solicitacao = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                observacao,
                id_administrador,
                id_solicitacao
            )
        )

        conexao.commit()

        return {
            "sucesso": True
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
def buscar_alteracoes_pendentes() -> list[dict]:
    """
    Busca todas as alterações de horário ainda não revisadas.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                ar.id_alteracao,
                ar.id_registro,
                ar.id_usuario_alteracao,
                ar.horario_anterior,
                ar.horario_novo,
                ar.motivo_administrador,
                ar.data_alteracao,
                ar.revisada,

                rh.id_jornada,
                rh.tipo_registro,

                jd.data_jornada,

                funcionario.id_usuario AS id_funcionario,
                funcionario.nome_completo AS nome_funcionario,
                funcionario.cpf AS cpf_funcionario,

                autor.nome_completo AS nome_autor_alteracao,
                autor.tipo_usuario AS tipo_autor_alteracao

            FROM alteracoes_registros ar

            INNER JOIN registros_horarios rh
                ON rh.id_registro = ar.id_registro

            INNER JOIN jornadas_diarias jd
                ON jd.id_jornada = rh.id_jornada

            INNER JOIN usuarios funcionario
                ON funcionario.id_usuario = jd.id_usuario

            INNER JOIN usuarios autor
                ON autor.id_usuario = ar.id_usuario_alteracao

            WHERE ar.revisada = FALSE

            ORDER BY ar.data_alteracao DESC
        """

        cursor.execute(comando_sql)

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()
        
def revisar_alteracao_horario(
    id_alteracao: int,
    id_administrador: int,
    observacao: str | None
) -> dict:
    """
    Marca uma alteração de horário como revisada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT
                id_alteracao,
                id_registro,
                revisada
            FROM alteracoes_registros
            WHERE id_alteracao = %s
            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (id_alteracao,)
        )

        alteracao = cursor.fetchone()

        if alteracao is None:
            return {
                "sucesso": False,
                "motivo": "ALTERACAO_NAO_ENCONTRADA"
            }

        if alteracao["revisada"]:
            return {
                "sucesso": False,
                "motivo": "ALTERACAO_JA_REVISADA"
            }

        comando_atualizacao = """
            UPDATE alteracoes_registros
            SET
                revisada = TRUE,
                data_revisao = CURRENT_TIMESTAMP,
                id_administrador_revisor = %s,
                motivo_administrador = %s
            WHERE id_alteracao = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                id_administrador,
                observacao,
                id_alteracao
            )
        )

        conexao.commit()

        return {
            "sucesso": True,
            "id_alteracao": id_alteracao,
            "id_registro": alteracao["id_registro"]
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
        
def buscar_historico_alteracoes(
    revisada: bool | None = None
) -> list[dict]:
    """
    Busca o histórico completo das alterações de horários.

    Quando o filtro for informado, retorna somente alterações
    revisadas ou pendentes.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                ar.id_alteracao,
                ar.id_registro,
                ar.id_usuario_alteracao,
                ar.horario_anterior,
                ar.horario_novo,
                ar.motivo_administrador,
                ar.data_alteracao,
                ar.revisada,
                ar.data_revisao,
                ar.id_administrador_revisor,

                rh.id_jornada,
                rh.tipo_registro,

                jd.data_jornada,

                funcionario.id_usuario AS id_funcionario,
                funcionario.nome_completo AS nome_funcionario,
                funcionario.cpf AS cpf_funcionario,

                autor.nome_completo AS nome_autor_alteracao,
                autor.tipo_usuario AS tipo_autor_alteracao,

                revisor.nome_completo AS nome_administrador_revisor

            FROM alteracoes_registros ar

            INNER JOIN registros_horarios rh
                ON rh.id_registro = ar.id_registro

            INNER JOIN jornadas_diarias jd
                ON jd.id_jornada = rh.id_jornada

            INNER JOIN usuarios funcionario
                ON funcionario.id_usuario = jd.id_usuario

            INNER JOIN usuarios autor
                ON autor.id_usuario = ar.id_usuario_alteracao

            LEFT JOIN usuarios revisor
                ON revisor.id_usuario = ar.id_administrador_revisor
        """

        valores = []

        if revisada is not None:
            comando_sql += """
                WHERE ar.revisada = %s
            """

            valores.append(revisada)

        comando_sql += """
            ORDER BY ar.data_alteracao DESC
        """

        cursor.execute(
            comando_sql,
            tuple(valores)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()
        
def buscar_funcionarios(
    pesquisa: str | None = None,
    situacao_usuario: str | None = None
) -> list[dict]:
    """
    Busca as pessoas cadastradas que podem registrar jornadas.

    A pesquisa pode ser feita pelo nome ou pelo CPF.
    Inclui funcionários e administradores.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                foto_perfil,
                tipo_usuario,
                situacao_usuario,
                precisa_trocar_senha,
                data_cadastro,
                data_atualizacao
            FROM usuarios
            WHERE tipo_usuario IN (
                'FUNCIONARIO',
                'ADMINISTRADOR'
            )
        """

        valores = []

        if pesquisa is not None and pesquisa.strip():
            pesquisa_limpa = pesquisa.strip()

            comando_sql += """
                AND (
                    nome_completo LIKE %s
                    OR cpf LIKE %s
                )
            """

            valores.extend(
                [
                    f"%{pesquisa_limpa}%",
                    f"%{pesquisa_limpa}%"
                ]
            )

        if situacao_usuario is not None:
            comando_sql += """
                AND situacao_usuario = %s
            """

            valores.append(situacao_usuario)

        comando_sql += """
            ORDER BY nome_completo ASC
        """

        cursor.execute(
            comando_sql,
            tuple(valores)
        )

        return cursor.fetchall()

    finally:
        cursor.close()
        conexao.close()
        
def buscar_funcionario_por_id(
    id_usuario: int
):
    """
    Busca uma pessoa cadastrada pelo identificador.

    Inclui funcionários e administradores que registram jornada.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_sql = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                foto_perfil,
                tipo_usuario,
                situacao_usuario,
                precisa_trocar_senha,
                data_cadastro,
                data_atualizacao
            FROM usuarios
            WHERE id_usuario = %s
              AND tipo_usuario IN (
                  'FUNCIONARIO',
                  'ADMINISTRADOR'
              )
            LIMIT 1
        """

        cursor.execute(
            comando_sql,
            (id_usuario,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()
        conexao.close()
        
def buscar_resumo_jornadas_funcionario(
    id_usuario: int
) -> dict:
    """
    Calcula o resumo geral das jornadas de uma pessoa.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_resumo = """
            SELECT
                COUNT(*) AS quantidade_jornadas,

                COALESCE(
                    SUM(minutos_trabalhados),
                    0
                ) AS total_minutos_trabalhados,

                COALESCE(
                    SUM(minutos_esperados),
                    0
                ) AS total_minutos_esperados,

                COALESCE(
                    SUM(minutos_extras),
                    0
                ) AS total_minutos_extras,

                COALESCE(
                    SUM(minutos_saldo),
                    0
                ) AS total_minutos_saldo,

                COALESCE(
                    SUM(minutos_tolerancia_aplicada),
                    0
                ) AS total_minutos_tolerancia,

                COALESCE(
                    SUM(minutos_abonados),
                    0
                ) AS total_minutos_abonados

            FROM jornadas_diarias
            WHERE id_usuario = %s
        """

        cursor.execute(
            comando_resumo,
            (id_usuario,)
        )

        resumo = cursor.fetchone()

        comando_jornadas_recentes = """
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
                jornada.minutos_abonados,
                jornada.minutos_saldo,
                jornada.minutos_tolerancia_aplicada,

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

            LEFT JOIN registros_horarios registro
                ON registro.id_jornada = jornada.id_jornada

            WHERE jornada.id_usuario = %s

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
                jornada.minutos_abonados,
                jornada.minutos_saldo,
                jornada.minutos_tolerancia_aplicada

            ORDER BY
                jornada.data_jornada DESC,
                jornada.id_jornada DESC
        """

        cursor.execute(
            comando_jornadas_recentes,
            (id_usuario,)
        )

        jornadas_recentes = cursor.fetchall()

        return {
            "resumo": resumo,
            "jornadas_recentes": jornadas_recentes
        }

    finally:
        cursor.close()
        conexao.close()
        
def alterar_situacao_usuario(
    id_usuario: int,
    nova_situacao: str,
    id_administrador: int,
    observacao: str | None
) -> dict:
    """
    Ativa ou desativa uma conta e registra a alteração.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT
                id_usuario,
                nome_completo,
                tipo_usuario,
                situacao_usuario
            FROM usuarios
            WHERE id_usuario = %s
            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (id_usuario,)
        )

        usuario = cursor.fetchone()

        if usuario is None:
            return {
                "sucesso": False,
                "motivo": "USUARIO_NAO_ENCONTRADO"
            }

        situacao_anterior = usuario["situacao_usuario"]

        if situacao_anterior == nova_situacao:
            return {
                "sucesso": False,
                "motivo": "SITUACAO_JA_DEFINIDA"
            }

        comando_atualizacao = """
            UPDATE usuarios
            SET situacao_usuario = %s
            WHERE id_usuario = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                nova_situacao,
                id_usuario
            )
        )

        comando_historico = """
            INSERT INTO alteracoes_situacao_usuarios (
                id_usuario,
                situacao_anterior,
                situacao_nova,
                id_administrador,
                observacao
            )
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(
            comando_historico,
            (
                id_usuario,
                situacao_anterior,
                nova_situacao,
                id_administrador,
                observacao
            )
        )

        id_alteracao_situacao = cursor.lastrowid

        # Ao desativar, encerra todas as sessões abertas da conta
        if nova_situacao == "INATIVO":
            comando_sessoes = """
                UPDATE sessoes_acesso
                SET
                    sessao_ativa = FALSE,
                    data_encerramento = CURRENT_TIMESTAMP
                WHERE id_usuario = %s
                  AND sessao_ativa = TRUE
            """

            cursor.execute(
                comando_sessoes,
                (id_usuario,)
            )

        conexao.commit()

        return {
            "sucesso": True,
            "id_alteracao_situacao": (
                id_alteracao_situacao
            ),
            "id_usuario": id_usuario,
            "nome_completo": usuario["nome_completo"],
            "tipo_usuario": usuario["tipo_usuario"],
            "situacao_anterior": situacao_anterior,
            "situacao_nova": nova_situacao
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def redefinir_senha_usuario(
    id_usuario: int,
    nova_senha: str,
    id_administrador: int
) -> dict:
    """
    Define uma senha provisória, encerra as sessões e registra a ação.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT
                id_usuario,
                nome_completo,
                tipo_usuario,
                senha_hash
            FROM usuarios
            WHERE id_usuario = %s
              AND tipo_usuario IN (
                  'FUNCIONARIO',
                  'ADMINISTRADOR'
              )
            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (id_usuario,)
        )

        usuario = cursor.fetchone()

        if usuario is None:
            return {
                "sucesso": False,
                "motivo": "USUARIO_NAO_ENCONTRADO"
            }

        if verificar_senha(
            nova_senha,
            usuario["senha_hash"]
        ):
            return {
                "sucesso": False,
                "motivo": "NOVA_SENHA_IGUAL_ATUAL"
            }

        nova_senha_hash = gerar_hash_senha(
            nova_senha
        )

        comando_atualizacao = """
            UPDATE usuarios
            SET
                senha_hash = %s,
                precisa_trocar_senha = TRUE,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                nova_senha_hash,
                id_usuario
            )
        )

        comando_sessoes = """
            UPDATE sessoes_acesso
            SET
                sessao_ativa = FALSE,
                data_encerramento = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
              AND sessao_ativa = TRUE
        """

        cursor.execute(
            comando_sessoes,
            (id_usuario,)
        )

        quantidade_sessoes_encerradas = (
            cursor.rowcount
        )

        comando_historico = """
            INSERT INTO redefinicoes_senha_usuarios (
                id_usuario,
                id_administrador,
                quantidade_sessoes_encerradas
            )
            VALUES (%s, %s, %s)
        """

        cursor.execute(
            comando_historico,
            (
                id_usuario,
                id_administrador,
                quantidade_sessoes_encerradas
            )
        )

        id_redefinicao = cursor.lastrowid

        conexao.commit()

        return {
            "sucesso": True,
            "id_redefinicao": id_redefinicao,
            "id_usuario": id_usuario,
            "nome_completo": usuario["nome_completo"],
            "tipo_usuario": usuario["tipo_usuario"],
            "quantidade_sessoes_encerradas": (
                quantidade_sessoes_encerradas
            )
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def atualizar_dados_usuario(
    id_usuario: int,
    nome_completo: str,
    cpf: str,
    telefone: str,
    data_nascimento,
    id_administrador: int
) -> dict:
    """
    Atualiza dados cadastrais e registra os valores anteriores.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        comando_busca = """
            SELECT
                id_usuario,
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                tipo_usuario
            FROM usuarios
            WHERE id_usuario = %s
              AND tipo_usuario IN (
                  'FUNCIONARIO',
                  'ADMINISTRADOR'
              )
            LIMIT 1
        """

        cursor.execute(
            comando_busca,
            (id_usuario,)
        )

        usuario = cursor.fetchone()

        if usuario is None:
            return {
                "sucesso": False,
                "motivo": "USUARIO_NAO_ENCONTRADO"
            }

        comando_cpf_existente = """
            SELECT id_usuario
            FROM usuarios
            WHERE cpf = %s
              AND id_usuario <> %s
            LIMIT 1
        """

        cursor.execute(
            comando_cpf_existente,
            (
                cpf,
                id_usuario
            )
        )

        if cursor.fetchone() is not None:
            return {
                "sucesso": False,
                "motivo": "CPF_JA_CADASTRADO"
            }

        dados_iguais = (
            usuario["nome_completo"] == nome_completo
            and usuario["cpf"] == cpf
            and usuario["telefone"] == telefone
            and usuario["data_nascimento"] == data_nascimento
        )

        if dados_iguais:
            return {
                "sucesso": False,
                "motivo": "SEM_ALTERACOES"
            }

        comando_atualizacao = """
            UPDATE usuarios
            SET
                nome_completo = %s,
                cpf = %s,
                telefone = %s,
                data_nascimento = %s,
                data_atualizacao = CURRENT_TIMESTAMP
            WHERE id_usuario = %s
        """

        cursor.execute(
            comando_atualizacao,
            (
                nome_completo,
                cpf,
                telefone,
                data_nascimento,
                id_usuario
            )
        )

        comando_historico = """
            INSERT INTO alteracoes_dados_usuarios (
                id_usuario,
                nome_anterior,
                nome_novo,
                cpf_anterior,
                cpf_novo,
                telefone_anterior,
                telefone_novo,
                data_nascimento_anterior,
                data_nascimento_nova,
                id_administrador
            )
            VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """

        cursor.execute(
            comando_historico,
            (
                id_usuario,
                usuario["nome_completo"],
                nome_completo,
                usuario["cpf"],
                cpf,
                usuario["telefone"],
                telefone,
                usuario["data_nascimento"],
                data_nascimento,
                id_administrador
            )
        )

        id_alteracao_dados = cursor.lastrowid

        conexao.commit()

        return {
            "sucesso": True,
            "id_alteracao_dados": id_alteracao_dados,
            "id_usuario": id_usuario,
            "nome_completo": nome_completo,
            "cpf": cpf,
            "telefone": telefone,
            "data_nascimento": data_nascimento,
            "tipo_usuario": usuario["tipo_usuario"]
        }

    except Error:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


def buscar_historico_conta_usuario(
    id_usuario: int,
    limite: int = 20
) -> list[dict]:
    """
    Reúne as movimentações administrativas recentes de uma conta.
    """

    conexao = criar_conexao()

    if conexao is None:
        raise RuntimeError(
            "Não foi possível acessar o banco de dados."
        )

    cursor = conexao.cursor(dictionary=True)

    try:
        eventos = []

        comando_situacoes = """
            SELECT
                alteracao.id_alteracao_situacao,
                alteracao.situacao_anterior,
                alteracao.situacao_nova,
                alteracao.observacao,
                alteracao.data_alteracao,
                administrador.id_usuario
                    AS id_administrador,
                administrador.nome_completo
                    AS nome_administrador
            FROM alteracoes_situacao_usuarios alteracao
            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    alteracao.id_administrador
            WHERE alteracao.id_usuario = %s
            ORDER BY alteracao.data_alteracao DESC
            LIMIT %s
        """

        cursor.execute(
            comando_situacoes,
            (
                id_usuario,
                limite
            )
        )

        for alteracao in cursor.fetchall():
            eventos.append(
                {
                    "id_evento": (
                        alteracao[
                            "id_alteracao_situacao"
                        ]
                    ),
                    "tipo_evento": "ALTERACAO_SITUACAO",
                    "data_evento": (
                        alteracao["data_alteracao"]
                    ),
                    "administrador": {
                        "id_usuario": (
                            alteracao["id_administrador"]
                        ),
                        "nome_completo": (
                            alteracao["nome_administrador"]
                        )
                    },
                    "detalhes": {
                        "situacao_anterior": (
                            alteracao["situacao_anterior"]
                        ),
                        "situacao_nova": (
                            alteracao["situacao_nova"]
                        ),
                        "observacao": (
                            alteracao["observacao"]
                        )
                    }
                }
            )

        comando_senhas = """
            SELECT
                redefinicao.id_redefinicao,
                redefinicao.quantidade_sessoes_encerradas,
                redefinicao.data_redefinicao,
                administrador.id_usuario
                    AS id_administrador,
                administrador.nome_completo
                    AS nome_administrador
            FROM redefinicoes_senha_usuarios redefinicao
            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    redefinicao.id_administrador
            WHERE redefinicao.id_usuario = %s
            ORDER BY redefinicao.data_redefinicao DESC
            LIMIT %s
        """

        cursor.execute(
            comando_senhas,
            (
                id_usuario,
                limite
            )
        )

        for redefinicao in cursor.fetchall():
            eventos.append(
                {
                    "id_evento": (
                        redefinicao["id_redefinicao"]
                    ),
                    "tipo_evento": "REDEFINICAO_SENHA",
                    "data_evento": (
                        redefinicao["data_redefinicao"]
                    ),
                    "administrador": {
                        "id_usuario": (
                            redefinicao["id_administrador"]
                        ),
                        "nome_completo": (
                            redefinicao["nome_administrador"]
                        )
                    },
                    "detalhes": {
                        "quantidade_sessoes_encerradas": (
                            redefinicao[
                                "quantidade_sessoes_encerradas"
                            ]
                        )
                    }
                }
            )

        comando_dados = """
            SELECT
                alteracao.id_alteracao_dados,
                alteracao.nome_anterior,
                alteracao.nome_novo,
                alteracao.cpf_anterior,
                alteracao.cpf_novo,
                alteracao.telefone_anterior,
                alteracao.telefone_novo,
                alteracao.data_nascimento_anterior,
                alteracao.data_nascimento_nova,
                alteracao.data_alteracao,
                administrador.id_usuario
                    AS id_administrador,
                administrador.nome_completo
                    AS nome_administrador
            FROM alteracoes_dados_usuarios alteracao
            INNER JOIN usuarios administrador
                ON administrador.id_usuario =
                    alteracao.id_administrador
            WHERE alteracao.id_usuario = %s
            ORDER BY alteracao.data_alteracao DESC
            LIMIT %s
        """

        cursor.execute(
            comando_dados,
            (
                id_usuario,
                limite
            )
        )

        for alteracao in cursor.fetchall():
            campos_alterados = []

            comparacoes = (
                (
                    "nome_completo",
                    alteracao["nome_anterior"],
                    alteracao["nome_novo"]
                ),
                (
                    "cpf",
                    alteracao["cpf_anterior"],
                    alteracao["cpf_novo"]
                ),
                (
                    "telefone",
                    alteracao["telefone_anterior"],
                    alteracao["telefone_novo"]
                ),
                (
                    "data_nascimento",
                    alteracao[
                        "data_nascimento_anterior"
                    ],
                    alteracao["data_nascimento_nova"]
                )
            )

            for campo, valor_anterior, valor_novo in comparacoes:
                if valor_anterior != valor_novo:
                    campos_alterados.append(campo)

            eventos.append(
                {
                    "id_evento": (
                        alteracao["id_alteracao_dados"]
                    ),
                    "tipo_evento": "ALTERACAO_DADOS",
                    "data_evento": (
                        alteracao["data_alteracao"]
                    ),
                    "administrador": {
                        "id_usuario": (
                            alteracao["id_administrador"]
                        ),
                        "nome_completo": (
                            alteracao["nome_administrador"]
                        )
                    },
                    "detalhes": {
                        "campos_alterados": (
                            campos_alterados
                        )
                    }
                }
            )

        eventos.sort(
            key=lambda evento: evento["data_evento"],
            reverse=True
        )

        return eventos[:limite]

    finally:
        cursor.close()
        conexao.close()
