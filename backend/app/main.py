from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from banco.conexao import testar_conexao
from configuracao_seguranca import (
    HOSTS_PERMITIDOS,
    MODO_PRODUCAO,
    ORIGENS_DESENVOLVIMENTO,
    acesso_local_direto,
    requisicao_usa_https
)

from rotas.rotas_administracao import (
    roteador as roteador_administracao
)

from rotas.rotas_autenticacao import (
    roteador as roteador_autenticacao
)

from rotas.rotas_calendario import (
    roteador as roteador_calendario
)

from rotas.rotas_jornadas import (
    roteador as roteador_jornadas
)

from rotas.rotas_notificacoes import (
    roteador as roteador_notificacoes
)

from rotas.rotas_relatorios import (
    roteador as roteador_relatorios
)

from rotas.rotas_solicitacoes_cadastro import (
    roteador as roteador_solicitacoes_cadastro
)

from rotas.rotas_status_administrativo import (
    roteador as roteador_status_administrativo
)

from rotas.rotas_situacoes_especiais import (
    roteador as roteador_situacoes_especiais
)

from rotas.rotas_feriados import (
    roteador as roteador_feriados
)
from utilitarios.seguranca_csrf import validar_token_csrf


# Localiza o front-end a partir da pasta do projeto.
pasta_frontend = Path(__file__).resolve().parents[2] / "frontend"


# =========================================================
# APLICAÇÃO PRINCIPAL
# =========================================================

aplicacao = FastAPI(
    title="Gestor de Jornadas",
    description=(
        "API responsável pelo controle de jornadas "
        "da Empresa Demonstração."
    ),
    version="0.1.0",
    docs_url=None if MODO_PRODUCAO else "/docs",
    redoc_url=None if MODO_PRODUCAO else "/redoc",
    openapi_url=None if MODO_PRODUCAO else "/openapi.json"
)

aplicacao.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=HOSTS_PERMITIDOS
)


# =========================================================
# CONFIGURAÇÃO DO CORS
# =========================================================

# O sistema publicado usa a mesma origem. O CORS existe somente para os
# servidores auxiliares usados durante o desenvolvimento local.
if not MODO_PRODUCAO:
    aplicacao.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGENS_DESENVOLVIMENTO,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )


# =========================================================
# ROTAS DO SISTEMA
# =========================================================

# Solicitações de novos cadastros
aplicacao.include_router(
    roteador_solicitacoes_cadastro
)


# Administração de funcionários, cadastros e auditorias
aplicacao.include_router(
    roteador_administracao
)


@aplicacao.middleware("http")
async def revalidar_arquivos_do_frontend(
    requisicao: Request,
    chamar_proxima_etapa
):
    """
    Evita que celulares continuem usando HTML, CSS ou JavaScript antigos
    depois de uma atualização do sistema. O navegador ainda pode guardar
    os arquivos, mas precisa confirmar com o servidor antes de reutilizá-los.
    """

    if requisicao.method.upper() in {
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    }:
        try:
            validar_token_csrf(requisicao)
        except HTTPException as erro:
            resposta = JSONResponse(
                status_code=erro.status_code,
                content={"detail": erro.detail},
                headers=erro.headers
            )
        else:
            resposta = await chamar_proxima_etapa(
                requisicao
            )
    else:
        resposta = await chamar_proxima_etapa(
            requisicao
        )

    caminho = requisicao.url.path.lower()

    resposta.headers["X-Content-Type-Options"] = "nosniff"
    resposta.headers["X-Frame-Options"] = "DENY"
    resposta.headers["Referrer-Policy"] = "same-origin"
    resposta.headers["Permissions-Policy"] = (
        "camera=(), geolocation=(), microphone=()"
    )
    resposta.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    resposta.headers["Cross-Origin-Resource-Policy"] = "same-origin"

    if MODO_PRODUCAO:
        resposta.headers["Content-Security-Policy"] = "; ".join((
            "default-src 'self'",
            "base-uri 'self'",
            "connect-src 'self'",
            "font-src 'self' data:",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "img-src 'self' data: blob:",
            "manifest-src 'self'",
            "object-src 'none'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "worker-src 'self'"
        ))

    if requisicao_usa_https(requisicao):
        resposta.headers["Strict-Transport-Security"] = (
            "max-age=31536000"
        )

    if caminho == "/service-worker.js":
        resposta.headers["Cache-Control"] = (
            "no-cache, no-store, must-revalidate"
        )
        resposta.headers["Service-Worker-Allowed"] = "/"
    elif caminho.endswith(
        (".html", ".css", ".js", ".webmanifest")
    ) or caminho == "/":
        resposta.headers["Cache-Control"] = (
            "no-cache, must-revalidate"
        )
    elif not caminho.startswith(
        ("/imagens/", "/icones/")
    ):
        resposta.headers["Cache-Control"] = "no-store"

    return resposta


# Central de notificações dos administradores
aplicacao.include_router(
    roteador_notificacoes
)


# Relatórios de jornadas para a administração
aplicacao.include_router(
    roteador_relatorios
)


# Login, perfil, troca de senha e logout
aplicacao.include_router(
    roteador_autenticacao
)


# Registro e consulta das jornadas
aplicacao.include_router(
    roteador_jornadas
)


# Calendário de jornadas, feriados e aniversários
aplicacao.include_router(
    roteador_calendario
)


# Acompanhamento administrativo das jornadas do dia
aplicacao.include_router(
    roteador_status_administrativo
)


# Situações especiais das jornadas
aplicacao.include_router(
    roteador_situacoes_especiais
)


# Administração dos feriados
aplicacao.include_router(
    roteador_feriados
)


# =========================================================
# ROTAS DE VERIFICAÇÃO
# =========================================================

@aplicacao.get("/", include_in_schema=False)
def verificar_servidor():
    """
    Abre a tela de login do Gestor de Jornadas.
    """

    return FileResponse(pasta_frontend / "index.html")


@aplicacao.get("/index.html", include_in_schema=False)
def abrir_tela_login():
    """Abre a tela de login usando o endereço completo do arquivo."""

    return FileResponse(pasta_frontend / "index.html")


@aplicacao.get("/cadastro.html", include_in_schema=False)
def abrir_tela_cadastro():
    """Abre a tela pública de solicitação de cadastro."""

    return FileResponse(pasta_frontend / "cadastro.html")


@aplicacao.get("/offline.html", include_in_schema=False)
def abrir_tela_offline():
    """Entrega a tela neutra usada quando o servidor fica indisponível."""

    return FileResponse(pasta_frontend / "offline.html")


@aplicacao.get("/manifest.webmanifest", include_in_schema=False)
def abrir_manifesto_pwa():
    """Entrega o manifesto instalável com o tipo de mídia correto."""

    return FileResponse(
        pasta_frontend / "manifest.webmanifest",
        media_type="application/manifest+json"
    )


@aplicacao.get("/service-worker.js", include_in_schema=False)
def abrir_service_worker():
    """Entrega o service worker na raiz para controlar toda a aplicação."""

    return FileResponse(
        pasta_frontend / "service-worker.js",
        media_type="application/javascript"
    )


@aplicacao.get("/api/saude")
def verificar_saude_servidor():
    """Confirma que o servidor automático está respondendo."""

    return {"funcionando": True}


@aplicacao.get("/teste-banco")
def verificar_banco(requisicao: Request):
    """
    Confere se o FastAPI consegue acessar o MySQL.
    """

    if not acesso_local_direto(requisicao):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurso não encontrado."
        )

    conexao_funcionando = testar_conexao()

    if conexao_funcionando:

        return {
            "conectado": True,
            "mensagem": (
                "Conexão com o MySQL "
                "realizada com sucesso!"
            )
        }

    return {
        "conectado": False,
        "mensagem": (
            "Não foi possível conectar ao MySQL."
        )
    }


# O FastAPI também entrega os arquivos visuais do sistema. Os caminhos
# são montados por último para não interferirem com as rotas da API.
for nome_pasta in (
    "css",
    "js",
    "imagens",
    "icones",
    "paginas"
):
    aplicacao.mount(
        f"/{nome_pasta}",
        StaticFiles(
            directory=pasta_frontend / nome_pasta
        ),
        name=f"frontend_{nome_pasta}"
    )
