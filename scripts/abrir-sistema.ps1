param(
    [switch]$NaoAbrirNavegador
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$pastaProjeto = Split-Path -Parent $PSScriptRoot
$python = Join-Path $pastaProjeto "backend\.venv\Scripts\python.exe"
$iniciador = Join-Path $PSScriptRoot "iniciar-servidor.cmd"
$urlAplicacao = "http://127.0.0.1:8000"
$urlSaude = "$urlAplicacao/api/saude"
$arquivoLog = Join-Path $pastaProjeto "logs\servidor.log"

function Servidor-EstaFuncionando {
    try {
        $resposta = Invoke-RestMethod -Uri $urlSaude -TimeoutSec 2
        return $resposta.funcionando -eq $true
    }
    catch {
        return $false
    }
}

if (-not (Test-Path -LiteralPath $python -PathType Leaf)) {
    Write-Host "O ambiente do Python ainda nao foi preparado." -ForegroundColor Yellow
    Write-Host "Siga a secao 'Preparacao do ambiente' do README e tente novamente."
    exit 1
}

if (-not (Servidor-EstaFuncionando)) {
    Write-Host "Iniciando o servidor local..."

    $argumentosProcesso = @(
        "/k",
        "`"$iniciador`""
    )

    Start-Process -FilePath "cmd.exe" -ArgumentList $argumentosProcesso -WorkingDirectory $PSScriptRoot

    $limite = (Get-Date).AddSeconds(30)

    while ((Get-Date) -lt $limite) {
        Start-Sleep -Milliseconds 500

        if (Servidor-EstaFuncionando) {
            break
        }
    }
}

if (-not (Servidor-EstaFuncionando)) {
    Write-Host "O servidor nao conseguiu iniciar." -ForegroundColor Red
    Write-Host "Consulte o registro em: $arquivoLog"
    exit 1
}

if (-not $NaoAbrirNavegador) {
    Start-Process $urlAplicacao
}
