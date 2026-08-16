from fastapi import APIRouter, Depends, HTTPException, Query, status
from mysql.connector import Error

from servicos.servico_notificacao import (
    listar_notificacoes,
    revisar_notificacao,
    revisar_todas_notificacoes
)
from utilitarios.dependencias_autenticacao import (
    obter_administrador_conectado
)


roteador = APIRouter(
    prefix="/administracao/notificacoes",
    tags=["Notificações administrativas"]
)


def formatar_notificacao(notificacao: dict) -> dict:
    data_criacao = notificacao["data_criacao"]
    data_revisao = notificacao["data_revisao"]

    return {
        "id_notificacao": notificacao["id_notificacao"],
        "tipo_notificacao": notificacao["tipo_notificacao"],
        "titulo": notificacao["titulo"],
        "mensagem": notificacao["mensagem"],
        "revisada": bool(notificacao["revisada"]),
        "data_criacao": (
            data_criacao.isoformat()
            if data_criacao is not None
            else None
        ),
        "data_revisao": (
            data_revisao.isoformat()
            if data_revisao is not None
            else None
        ),
        "usuario_relacionado": {
            "id_usuario": (
                notificacao["id_usuario_relacionado"]
            ),
            "nome_completo": (
                notificacao["nome_usuario_relacionado"]
            )
        },
        "revisor": {
            "id_usuario": (
                notificacao["id_administrador_revisor"]
            ),
            "nome_completo": (
                notificacao["nome_administrador_revisor"]
            )
        }
    }


@roteador.get("")
def consultar_notificacoes(
    filtro: str = Query(
        default="PENDENTES",
        pattern="^(PENDENTES|REVISADAS|TODAS)$"
    ),
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Consulta os avisos administrativos.
    """

    try:
        revisada = {
            "PENDENTES": False,
            "REVISADAS": True,
            "TODAS": None
        }[filtro]

        resultado = listar_notificacoes(
            revisada=revisada
        )

        resumo = resultado["resumo"]

        return {
            "notificacoes": [
                formatar_notificacao(notificacao)
                for notificacao
                in resultado["notificacoes"]
            ],
            "resumo": {
                "quantidade_total": int(
                    resumo["quantidade_total"]
                ),
                "quantidade_pendentes": int(
                    resumo["quantidade_pendentes"]
                ),
                "quantidade_revisadas": int(
                    resumo["quantidade_revisadas"]
                )
            }
        }

    except Error as erro:
        print(f"Erro ao listar notificações: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível consultar as notificações."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao listar notificações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.put("/revisar-todas")
def revisar_todas(
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Marca todos os avisos pendentes como revisados.
    """

    try:
        quantidade = revisar_todas_notificacoes(
            id_administrador=administrador["id_usuario"]
        )

        return {
            "mensagem": (
                "Todas as notificações foram revisadas."
                if quantidade > 0
                else "Não havia notificações pendentes."
            ),
            "quantidade_revisada": quantidade
        }

    except Error as erro:
        print(f"Erro ao revisar notificações: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível revisar as notificações."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao revisar notificações: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )


@roteador.put("/{id_notificacao}/revisar")
def revisar_uma_notificacao(
    id_notificacao: int,
    administrador=Depends(
        obter_administrador_conectado
    )
):
    """
    Marca um aviso específico como revisado.
    """

    try:
        resultado = revisar_notificacao(
            id_notificacao=id_notificacao,
            id_administrador=administrador["id_usuario"]
        )

        if not resultado["sucesso"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificação não encontrada."
            )

        return {
            "mensagem": (
                "Esta notificação já estava revisada."
                if resultado["ja_revisada"]
                else "Notificação revisada com sucesso."
            )
        }

    except HTTPException:
        raise

    except Error as erro:
        print(f"Erro ao revisar notificação: {erro}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Não foi possível revisar a notificação."
        )

    except RuntimeError as erro:
        print(
            "Erro de conexão ao revisar notificação: "
            f"{erro}"
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="O banco de dados está indisponível."
        )
