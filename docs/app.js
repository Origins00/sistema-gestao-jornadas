"use strict";

const CHAVE_ESTADO = "gestor_jornadas_demonstracao_v1";

const ACOES_JORNADA = [
    { tipo: "ENTRADA", rotulo: "Entrada", proximo: "Registrar entrada" },
    { tipo: "INICIO_ALMOCO", rotulo: "Início do almoço", proximo: "Iniciar almoço" },
    { tipo: "FIM_ALMOCO", rotulo: "Fim do almoço", proximo: "Finalizar almoço" },
    { tipo: "SAIDA", rotulo: "Saída", proximo: "Registrar saída" }
];

const EQUIPE_INICIAL = [
    { iniciais: "AM", nome: "Ana Martins", identificador: "Colaboradora 001", perfil: "Administrativo", jornada: "07:58 — em andamento", situacao: "ativo", cor: "verde" },
    { iniciais: "BL", nome: "Bruno Lima", identificador: "Colaborador 002", perfil: "Operacional", jornada: "08:01 — em almoço", situacao: "ativo", cor: "azul" },
    { iniciais: "CS", nome: "Camila Souza", identificador: "Colaboradora 003", perfil: "Administrativo", jornada: "08:07 — em andamento", situacao: "ativo", cor: "roxo" },
    { iniciais: "DR", nome: "Daniel Rocha", identificador: "Colaborador 004", perfil: "Operacional", jornada: "Sem registros hoje", situacao: "ferias", cor: "laranja" },
    { iniciais: "EF", nome: "Elisa Ferreira", identificador: "Colaboradora 005", perfil: "Administrativo", jornada: "07:55 — em andamento", situacao: "ativo", cor: "verde" },
    { iniciais: "GM", nome: "Gabriel Melo", identificador: "Colaborador 006", perfil: "Operacional", jornada: "08:04 — em andamento", situacao: "ativo", cor: "azul" }
];

const EVENTOS_INICIAIS = [
    { dia: 18, titulo: "Reunião geral", detalhe: "Sala de reuniões · 09:00", tipo: "Reunião" },
    { dia: 21, titulo: "Início das férias", detalhe: "Camila Souza · 10 dias", tipo: "Férias" },
    { dia: 25, titulo: "Fechamento mensal", detalhe: "Revisão das jornadas", tipo: "Prazo" }
];

const elementos = {
    entrada: document.getElementById("tela-entrada"),
    aplicacao: document.getElementById("aplicacao"),
    botaoEntrar: document.getElementById("botao-entrar"),
    botaoSair: document.getElementById("botao-sair"),
    botaoReiniciar: document.getElementById("botao-reiniciar"),
    botaoMenu: document.getElementById("botao-menu"),
    barraLateral: document.getElementById("barra-lateral"),
    sobreposicao: document.getElementById("sobreposicao"),
    painelNotificacoes: document.getElementById("painel-notificacoes"),
    botaoNotificacoes: document.getElementById("botao-notificacoes"),
    fecharNotificacoes: document.getElementById("fechar-notificacoes"),
    relogio: document.getElementById("relogio"),
    relogioGrande: document.getElementById("relogio-grande"),
    dataAtual: document.getElementById("data-atual"),
    dataJornada: document.getElementById("data-jornada"),
    saudacao: document.getElementById("saudacao"),
    progressoResumo: document.getElementById("progresso-resumo"),
    linhaTempo: document.getElementById("linha-tempo"),
    botaoRegistrar: document.getElementById("botao-registrar"),
    mensagemJornada: document.getElementById("mensagem-jornada"),
    corpoEquipe: document.getElementById("corpo-equipe"),
    buscaEquipe: document.getElementById("busca-equipe"),
    filtroEquipe: document.getElementById("filtro-equipe"),
    botaoAdicionarFicticio: document.getElementById("botao-adicionar-ficticio"),
    totalEquipe: document.getElementById("total-equipe"),
    calendario: document.getElementById("calendario"),
    tituloMes: document.getElementById("titulo-mes"),
    listaEventos: document.getElementById("lista-eventos"),
    botaoNovoEvento: document.getElementById("botao-novo-evento"),
    botaoExportar: document.getElementById("botao-exportar"),
    toast: document.getElementById("toast")
};

let temporizadorToast;
let estado = carregarEstado();

function estadoInicial() {
    return {
        autenticado: false,
        registros: [],
        equipeExtra: [],
        eventosExtra: []
    };
}

function carregarEstado() {
    try {
        const salvo = JSON.parse(localStorage.getItem(CHAVE_ESTADO));
        return { ...estadoInicial(), ...salvo };
    } catch {
        return estadoInicial();
    }
}

function salvarEstado() {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
}

function formatarData(data, opcoes) {
    return new Intl.DateTimeFormat("pt-BR", opcoes).format(data);
}

function atualizarRelogios() {
    const agora = new Date();
    const horaCurta = formatarData(agora, { hour: "2-digit", minute: "2-digit" });
    const horaCompleta = formatarData(agora, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    elementos.relogio.textContent = horaCurta;
    elementos.relogioGrande.textContent = horaCompleta;
}

function atualizarDatas() {
    const hoje = new Date();
    const dataLonga = formatarData(hoje, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    const periodo = hoje.getHours() < 12 ? "Bom dia" : hoje.getHours() < 18 ? "Boa tarde" : "Boa noite";

    elementos.dataAtual.textContent = `${dataLonga.charAt(0).toUpperCase()}${dataLonga.slice(1)} · Acompanhe a operação da equipe.`;
    elementos.dataJornada.textContent = formatarData(hoje, { day: "2-digit", month: "long" });
    elementos.saudacao.textContent = `${periodo}, visitante`;
}

function entrarDemonstracao() {
    estado.autenticado = true;
    salvarEstado();
    exibirAplicacao();
    mostrarToast("Bem-vindo! Você entrou em uma demonstração com dados fictícios.");
}

function sairDemonstracao() {
    estado.autenticado = false;
    salvarEstado();
    elementos.aplicacao.hidden = true;
    elementos.entrada.hidden = false;
    fecharPaineis();
    window.location.hash = "";
    elementos.botaoEntrar.focus();
}

function exibirAplicacao() {
    elementos.entrada.hidden = true;
    elementos.aplicacao.hidden = false;
    atualizarTudo();

    const paginaInicial = window.location.hash.replace("#", "") || "visao-geral";
    navegarPara(document.querySelector(`[data-pagina-conteudo="${paginaInicial}"]`) ? paginaInicial : "visao-geral");
}

function navegarPara(pagina) {
    document.querySelectorAll("[data-pagina-conteudo]").forEach((secao) => {
        secao.classList.toggle("ativa", secao.dataset.paginaConteudo === pagina);
    });

    document.querySelectorAll("[data-pagina]").forEach((botao) => {
        const ativo = botao.dataset.pagina === pagina;
        botao.classList.toggle("ativo", ativo);
        botao.setAttribute("aria-current", ativo ? "page" : "false");
    });

    window.location.hash = pagina;
    fecharPaineis();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function proximaAcao() {
    return ACOES_JORNADA[estado.registros.length] || null;
}

function registrarJornada() {
    const acao = proximaAcao();

    if (!acao) {
        mostrarToast("A jornada demonstrativa de hoje já está completa.");
        return;
    }

    const hora = formatarData(new Date(), { hour: "2-digit", minute: "2-digit" });
    estado.registros.push({ tipo: acao.tipo, hora });
    salvarEstado();
    renderizarJornada();
    mostrarToast(`${acao.rotulo} registrada às ${hora}.`);
}

function renderizarJornada() {
    const proxima = proximaAcao();
    const estaEmAlmoco = estado.registros.length === 2;
    const finalizada = !proxima;

    elementos.progressoResumo.innerHTML = ACOES_JORNADA.map((acao, indice) => {
        const registro = estado.registros[indice];
        return `<div class="${registro ? "concluido" : ""}"><i>${registro ? "✓" : indice + 1}</i><span>${acao.rotulo}</span><b>${registro?.hora || "--:--"}</b></div>`;
    }).join("");

    elementos.linhaTempo.innerHTML = ACOES_JORNADA.map((acao, indice) => {
        const registro = estado.registros[indice];
        return `<li class="${registro ? "concluido" : ""}"><i>${registro ? "✓" : indice + 1}</i><strong>${acao.rotulo}</strong><time>${registro?.hora || "Pendente"}</time></li>`;
    }).join("");

    elementos.botaoRegistrar.textContent = finalizada ? "Jornada concluída" : proxima.proximo;
    elementos.botaoRegistrar.disabled = finalizada;
    elementos.botaoRegistrar.style.opacity = finalizada ? "0.58" : "1";
    elementos.botaoRegistrar.style.cursor = finalizada ? "default" : "pointer";

    if (finalizada) {
        elementos.mensagemJornada.textContent = "Todos os registros demonstrativos foram concluídos.";
    } else if (estaEmAlmoco) {
        elementos.mensagemJornada.textContent = "Você está no intervalo de almoço.";
    } else if (estado.registros.length > 0) {
        elementos.mensagemJornada.textContent = "Jornada em andamento no modo demonstração.";
    } else {
        elementos.mensagemJornada.textContent = "Sua jornada ainda não foi iniciada.";
    }
}

function equipeCompleta() {
    return [...EQUIPE_INICIAL, ...estado.equipeExtra];
}

function renderizarEquipe() {
    const busca = elementos.buscaEquipe.value.trim().toLocaleLowerCase("pt-BR");
    const filtro = elementos.filtroEquipe.value;
    const pessoas = equipeCompleta().filter((pessoa) => {
        const correspondeBusca = !busca || `${pessoa.nome} ${pessoa.identificador} ${pessoa.perfil}`.toLocaleLowerCase("pt-BR").includes(busca);
        const correspondeFiltro = filtro === "todos" || pessoa.situacao === filtro;
        return correspondeBusca && correspondeFiltro;
    });

    elementos.totalEquipe.textContent = String(15 + estado.equipeExtra.length);

    elementos.corpoEquipe.innerHTML = pessoas.length ? pessoas.map((pessoa) => `
        <tr>
            <td><div><span class="avatar avatar--${pessoa.cor}">${pessoa.iniciais}</span><span><strong>${pessoa.nome}</strong><small>${pessoa.identificador}</small></span></div></td>
            <td>${pessoa.perfil}</td>
            <td>${pessoa.jornada}</td>
            <td><span class="status ${pessoa.situacao === "ferias" ? "status--ferias" : "status--ativo"}">${pessoa.situacao === "ferias" ? "Em férias" : "Ativo"}</span></td>
        </tr>
    `).join("") : `<tr><td colspan="4">Nenhuma pessoa fictícia encontrada.</td></tr>`;
}

function adicionarPessoaFicticia() {
    if (estado.equipeExtra.length) {
        mostrarToast("O cadastro fictício já foi incluído nesta demonstração.");
        return;
    }

    estado.equipeExtra.push({
        iniciais: "LM",
        nome: "Lucas Monteiro",
        identificador: "Colaborador demonstrativo",
        perfil: "Administrativo",
        jornada: "Aguardando primeiro acesso",
        situacao: "ativo",
        cor: "roxo"
    });
    salvarEstado();
    renderizarEquipe();
    mostrarToast("Cadastro fictício adicionado à tabela.");
}

function renderizarCalendario() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const diasMesAnterior = new Date(ano, mes, 0).getDate();
    const eventos = [...EVENTOS_INICIAIS, ...estado.eventosExtra];
    const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const celulas = nomesSemana.map((nome) => `<span>${nome}</span>`);

    for (let indice = primeiroDia - 1; indice >= 0; indice -= 1) {
        celulas.push(`<button class="fora" type="button">${diasMesAnterior - indice}</button>`);
    }

    for (let dia = 1; dia <= diasNoMes; dia += 1) {
        const classes = [];
        if (dia === hoje.getDate()) classes.push("hoje");
        if (eventos.some((evento) => evento.dia === dia)) classes.push("evento");
        celulas.push(`<button class="${classes.join(" ")}" type="button" data-dia="${dia}">${dia}</button>`);
    }

    while ((celulas.length - 7) % 7 !== 0) {
        celulas.push(`<button class="fora" type="button">${(celulas.length - 7 - primeiroDia - diasNoMes) + 1}</button>`);
    }

    elementos.tituloMes.textContent = formatarData(hoje, { month: "long", year: "numeric" }).replace(/^./, (letra) => letra.toUpperCase());
    elementos.calendario.innerHTML = celulas.join("");
    elementos.listaEventos.innerHTML = eventos.map((evento) => `
        <div class="evento-item">
            <time><strong>${String(evento.dia).padStart(2, "0")}</strong>${formatarData(hoje, { month: "short" }).replace(".", "")}</time>
            <div><strong>${evento.titulo}</strong><small>${evento.detalhe}</small></div>
        </div>
    `).join("");
}

function adicionarEventoFicticio() {
    if (estado.eventosExtra.length) {
        mostrarToast("O evento fictício já está no calendário.");
        return;
    }

    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    estado.eventosExtra.push({
        dia: Math.min(ultimoDia, hoje.getDate() + 2),
        titulo: "Apresentação do projeto",
        detalhe: "Evento criado no modo demonstração",
        tipo: "Demonstração"
    });
    salvarEstado();
    renderizarCalendario();
    mostrarToast("Evento fictício incluído no calendário.");
}

function exportarRelatorio() {
    const linhas = [
        ["Funcionário", "Perfil", "Horas no mês", "Situação"],
        ["Ana Martins", "Administrativo", "168:20", "Completo"],
        ["Bruno Lima", "Operacional", "171:05", "Completo"],
        ["Camila Souza", "Administrativo", "164:40", "Completo"],
        ["Daniel Rocha", "Operacional", "128:15", "Férias"]
    ];
    const csv = linhas.map((linha) => linha.map((valor) => `"${valor}"`).join(";")).join("\n");
    const arquivo = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-demonstrativo.csv";
    link.click();
    URL.revokeObjectURL(url);
    mostrarToast("Relatório fictício gerado somente no seu navegador.");
}

function abrirNotificacoes() {
    elementos.painelNotificacoes.classList.add("aberto");
    elementos.painelNotificacoes.setAttribute("aria-hidden", "false");
    elementos.sobreposicao.hidden = false;
    elementos.fecharNotificacoes.focus();
}

function abrirMenu() {
    const aberto = elementos.barraLateral.classList.toggle("aberta");
    elementos.botaoMenu.setAttribute("aria-expanded", String(aberto));
    elementos.sobreposicao.hidden = !aberto;
}

function fecharPaineis() {
    elementos.barraLateral.classList.remove("aberta");
    elementos.botaoMenu.setAttribute("aria-expanded", "false");
    elementos.painelNotificacoes.classList.remove("aberto");
    elementos.painelNotificacoes.setAttribute("aria-hidden", "true");
    elementos.sobreposicao.hidden = true;
}

function reiniciarDemonstracao() {
    const confirmou = window.confirm("Deseja apagar os registros locais e reiniciar a demonstração?");
    if (!confirmou) return;

    estado = { ...estadoInicial(), autenticado: true };
    salvarEstado();
    elementos.buscaEquipe.value = "";
    elementos.filtroEquipe.value = "todos";
    atualizarTudo();
    navegarPara("visao-geral");
    mostrarToast("Demonstração restaurada com os dados iniciais.");
}

function mostrarToast(mensagem) {
    window.clearTimeout(temporizadorToast);
    elementos.toast.textContent = mensagem;
    elementos.toast.classList.add("visivel");
    temporizadorToast = window.setTimeout(() => elementos.toast.classList.remove("visivel"), 3300);
}

function atualizarTudo() {
    atualizarDatas();
    atualizarRelogios();
    renderizarJornada();
    renderizarEquipe();
    renderizarCalendario();
}

elementos.botaoEntrar.addEventListener("click", entrarDemonstracao);
elementos.botaoSair.addEventListener("click", sairDemonstracao);
elementos.botaoReiniciar.addEventListener("click", reiniciarDemonstracao);
elementos.botaoRegistrar.addEventListener("click", registrarJornada);
elementos.botaoAdicionarFicticio.addEventListener("click", adicionarPessoaFicticia);
elementos.botaoNovoEvento.addEventListener("click", adicionarEventoFicticio);
elementos.botaoExportar.addEventListener("click", exportarRelatorio);
elementos.botaoNotificacoes.addEventListener("click", abrirNotificacoes);
elementos.fecharNotificacoes.addEventListener("click", fecharPaineis);
elementos.botaoMenu.addEventListener("click", abrirMenu);
elementos.sobreposicao.addEventListener("click", fecharPaineis);
elementos.buscaEquipe.addEventListener("input", renderizarEquipe);
elementos.filtroEquipe.addEventListener("change", renderizarEquipe);

document.querySelectorAll("[data-pagina], [data-navegar], [data-ir-para]").forEach((controle) => {
    controle.addEventListener("click", (evento) => {
        evento.preventDefault();
        navegarPara(controle.dataset.pagina || controle.dataset.navegar || controle.dataset.irPara);
    });
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharPaineis();
});

window.addEventListener("hashchange", () => {
    if (!estado.autenticado) return;
    const pagina = window.location.hash.replace("#", "");
    if (document.querySelector(`[data-pagina-conteudo="${pagina}"]`)) navegarPara(pagina);
});

setInterval(atualizarRelogios, 1000);

if (estado.autenticado) {
    exibirAplicacao();
} else {
    elementos.entrada.hidden = false;
    elementos.aplicacao.hidden = true;
}
