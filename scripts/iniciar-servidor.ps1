$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$pastaProjeto = Split-Path -Parent $PSScriptRoot
$pastaBackend = Join-Path $pastaProjeto "backend"
$python = Join-Path $pastaBackend ".venv\Scripts\python.exe"
$executorUvicorn = Join-Path $PSScriptRoot "executar-uvicorn.cmd"
$pastaLogs = Join-Path $pastaProjeto "logs"
$arquivoLog = Join-Path $pastaLogs "servidor.log"
$arquivoLogAnterior = Join-Path $pastaLogs "servidor-anterior.log"
$urlSaude = "http://127.0.0.1:8000/api/saude"

New-Item -ItemType Directory -Path $pastaLogs -Force | Out-Null

function Escrever-LogServidor {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Mensagem
    )

    $linha = "{0} [INICIALIZADOR] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Mensagem
    Add-Content -LiteralPath $arquivoLog -Value $linha -Encoding UTF8
}

if (-not (Test-Path -LiteralPath $python -PathType Leaf)) {
    Escrever-LogServidor "Python do ambiente virtual nao encontrado: $python"
    exit 1
}

if (-not (Test-Path -LiteralPath $executorUvicorn -PathType Leaf)) {
    Escrever-LogServidor "Executor interno do Uvicorn nao encontrado: $executorUvicorn"
    exit 1
}

try {
    $respostaAtual = Invoke-RestMethod -Uri $urlSaude -TimeoutSec 3
    if ($respostaAtual.funcionando -eq $true) {
        Escrever-LogServidor "O servidor ja estava funcionando; nenhuma segunda instancia foi aberta."
        exit 0
    }
}
catch {
}

if (
    (Test-Path -LiteralPath $arquivoLog -PathType Leaf) -and
    (Get-Item -LiteralPath $arquivoLog).Length -gt 10MB
) {
    if (Test-Path -LiteralPath $arquivoLogAnterior -PathType Leaf) {
        Remove-Item -LiteralPath $arquivoLogAnterior -Force
    }
    Move-Item -LiteralPath $arquivoLog -Destination $arquivoLogAnterior
}

$env:PYTHONUNBUFFERED = "1"

$falhasConsecutivas = 0

while ($true) {
    $inicioExecucao = Get-Date
    Escrever-LogServidor "Iniciando o Gestor de Jornadas em http://127.0.0.1:8000."

    try {
        & $executorUvicorn
        $codigoSaida = $LASTEXITCODE
        $duracao = (Get-Date) - $inicioExecucao

        if ($duracao.TotalMinutes -ge 5) {
            $falhasConsecutivas = 0
        }

        $falhasConsecutivas++
        $segundosEspera = [Math]::Min(60, 5 * [Math]::Pow(2, [Math]::Min($falhasConsecutivas - 1, 3)))

        Escrever-LogServidor "O servidor foi encerrado com o codigo $codigoSaida apos $([Math]::Round($duracao.TotalSeconds)) segundos."
        Escrever-LogServidor "Reiniciando automaticamente em $segundosEspera segundos."
        Start-Sleep -Seconds $segundosEspera
    }
    catch {
        $falhasConsecutivas++
        $segundosEspera = [Math]::Min(60, 5 * [Math]::Pow(2, [Math]::Min($falhasConsecutivas - 1, 3)))

        Escrever-LogServidor "Falha ao iniciar o servidor: $($_.Exception.Message)"
        Escrever-LogServidor "Tentando novamente em $segundosEspera segundos."
        Start-Sleep -Seconds $segundosEspera
    }
}
