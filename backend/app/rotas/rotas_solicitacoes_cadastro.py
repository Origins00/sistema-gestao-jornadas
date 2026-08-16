from fastapi import APIRouter, HTTPException, Request, status
from mysql.connector import Error

from modelos.solicitacao_cadastro import SolicitacaoCadastroEntrada
from servicos.servico_solicitacao_cadastro import (
    buscar_solicitacao_por_cpf,
    cpf_ja_cadastrado,
    criar_solicitacao_cadastro
)
from utilitarios.limitador_requisicoes import (
    LimitadorJanela,
    identificar_cliente
)
from utilitarios.seguranca_senha import gerar_hash_senha


roteador = APIRouter(
    prefix="/solicitacoes-cadastro",
    tags=["Solicitações de cadastro"]
)

limitador_solicitacoes_cliente = LimitadorJanela(
    limite=10,
    janela_segundos=60 * 60
)


def resposta_generica_solicitacao():
    return {
        "mensagem": (
            "Solicitação recebida. Se ainda não houver um pedido "
            "para este CPF, ele será encaminhado para análise."
        )
    }


@roteador.post(
    "",
    status_code=status.HTTP_202_ACCEPTED
)
def solicitar_cadastro(
    dados: SolicitacaoCadastroEntrada,
    requisicao: Request
):
    """
    Recebe um novo pedido de acesso ao Gestor de Jornadas.
    """

    try:
        chave_cliente = identificar_cliente(
            requisicao
        )
        tempo_bloqueio = (
            limitador_solicitacoes_cliente.tempo_bloqueio(
                chave_cliente
            )
        )

        if tempo_bloqueio:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Muitas solicitações foram enviadas. "
                    "Aguarde e tente novamente mais tarde."
                ),
                headers={
                    "Retry-After": str(tempo_bloqueio)
                }
            )

        limitador_solicitacoes_cliente.registrar(
            chave_cliente
        )

        # O custo de hash é aplicado em todos os resultados para reduzir
        # diferenças de tempo que poderiam revelar se um CPF já existe.
        senha_hash = gerar_hash_senha(
            dados.senha
        )

        if cpf_ja_cadastrado(dados.cpf):
            return resposta_generica_solicitacao()

        solicitacao_existente = buscar_solicitacao_por_cpf(dados.cpf)

        if solicitacao_existente is not None:
            return resposta_generica_solicitacao()

        criar_solicitacao_cadastro(
            dados,
            senha_hash=senha_hash
        )

        return resposta_generica_solicitacao()

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao criar solicitação de cadastro: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível salvar a solicitação."
        )

    except RuntimeError as erro:
        print(f"Erro de conexão: {erro}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
