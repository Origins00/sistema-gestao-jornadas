/*
 * Camada de demonstração do portfólio.
 *
 * Este arquivo existe somente na publicação estática de `docs/`. Ele mantém
 * o frontend original e substitui as respostas do servidor por dados
 * fictícios salvos no navegador do visitante.
 */

(function criarApiDemonstracao(escopo) {

    "use strict";

    const CHAVE_ESTADO =
        "gestor_jornadas_api_demonstracao_v1";

    const usuario = Object.freeze({
        id_usuario: 1,
        nome_completo: "Visitante Demonstração",
        telefone: "0".repeat(11),
        data_nascimento: "2000-01-01",
        foto_perfil: null,
        tipo_usuario: "ADMINISTRADOR",
        precisa_trocar_senha: false
    });

    const pessoas = [
        criarPessoa(1, "Visitante Demonstração", "ADMINISTRADOR", "ATIVO", "37" + "9".repeat(9)),
        criarPessoa(2, "Ana Martins", "FUNCIONARIO", "ATIVO", "31" + "9".repeat(9)),
        criarPessoa(3, "Bruno Lima", "FUNCIONARIO", "ATIVO", "32" + "9".repeat(9)),
        criarPessoa(4, "Camila Souza", "FUNCIONARIO", "ATIVO", "33" + "9".repeat(9)),
        criarPessoa(5, "Daniel Rocha", "FUNCIONARIO", "INATIVO", "34" + "9".repeat(9))
    ];

    function hojeIso() {
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, "0");
        const dia = String(agora.getDate()).padStart(2, "0");
        return `${ano}-${mes}-${dia}`;
    }

    function deslocarData(dias) {
        const data = new Date();
        data.setDate(data.getDate() + dias);
        return [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, "0"),
            String(data.getDate()).padStart(2, "0")
        ].join("-");
    }

    function criarPessoa(id, nome, tipo, situacao, telefone) {
        return {
            id_usuario: id,
            nome_completo: nome,
            cpf: String(id).repeat(11).slice(0, 11),
            telefone,
            data_nascimento: `199${id}-0${Math.min(id, 9)}-15`,
            foto_perfil: null,
            tipo_usuario: tipo,
            situacao_usuario: situacao,
            precisa_trocar_senha: false,
            data_cadastro: "2026-01-15T09:00:00",
            data_atualizacao: "2026-08-01T10:30:00"
        };
    }

    function criarJornadaAtual() {
        return {
            jornada: {
                id_jornada: 101,
                data_jornada: hojeIso(),
                tipo_trabalho_inicio: "ADMINISTRATIVO",
                tipo_trabalho_apos_almoco: null,
                atividade_do_dia: null,
                situacao_jornada: "EM_ANDAMENTO",
                pendente_sincronizacao: false
            },
            horarios: {
                entrada: "08:02",
                inicio_almoco: "12:01",
                fim_almoco: null,
                saida: null
            },
            resumo: {
                minutos_trabalhados: 239,
                tempo_trabalhado_formatado: "03h59",
                minutos_esperados: 480,
                tempo_esperado_formatado: "08h00",
                minutos_extras: 0,
                horas_extras_formatadas: "00h00",
                minutos_saldo: -241,
                saldo_formatado: "-04h01",
                minutos_tolerancia_aplicada: 0,
                minutos_abonados: 0,
                dia_especial: false,
                tipo_dia: "NORMAL",
                feriado: null
            }
        };
    }

    function estadoInicial() {
        return {
            jornadaAtual: criarJornadaAtual(),
            notificacoesRevisadas: [],
            solicitacoesResolvidas: [],
            feriadosExtras: []
        };
    }

    function lerEstado() {
        try {
            const salvo = JSON.parse(
                localStorage.getItem(CHAVE_ESTADO)
            );
            return {
                ...estadoInicial(),
                ...salvo
            };
        } catch {
            return estadoInicial();
        }
    }

    function salvarEstado(estado) {
        localStorage.setItem(
            CHAVE_ESTADO,
            JSON.stringify(estado)
        );
    }

    function clonar(valor) {
        return JSON.parse(JSON.stringify(valor));
    }

    function criarErro(mensagem, status) {
        const erro = typeof ErroApi === "function"
            ? new ErroApi(mensagem, status)
            : new Error(mensagem);
        erro.status = status;
        return erro;
    }

    function aplicarRegistro(jornada, operacao) {
        const mapa = {
            ENTRADA: "entrada",
            INICIO_ALMOCO: "inicio_almoco",
            FIM_ALMOCO: "fim_almoco",
            SAIDA: "saida"
        };
        const campo = mapa[operacao.tipo_registro];

        if (campo) {
            jornada.horarios[campo] =
                operacao.horario_informado;
        }

        if (operacao.tipo_registro === "FIM_ALMOCO") {
            jornada.jornada.tipo_trabalho_apos_almoco =
                operacao.tipo_trabalho_apos_almoco ||
                "ADMINISTRATIVO";
        }

        if (operacao.tipo_registro === "SAIDA") {
            jornada.jornada.situacao_jornada = "CONCLUIDA";
            jornada.jornada.atividade_do_dia =
                operacao.atividade_do_dia ||
                "Atividades demonstrativas do portfólio";
            jornada.resumo = {
                ...jornada.resumo,
                minutos_trabalhados: 478,
                tempo_trabalhado_formatado: "07h58",
                minutos_saldo: -2,
                saldo_formatado: "-00h02"
            };
        }
    }

    function jornadasHistorico() {
        return [
            criarJornadaHistorico(1, -1, "Organização de documentos", "07h58", "00h00", "-00h02"),
            criarJornadaHistorico(2, -2, "Reunião e planejamento", "08h12", "00h12", "+00h12"),
            criarJornadaHistorico(3, -3, "Atendimento e suporte interno", "08h03", "00h03", "+00h03"),
            criarJornadaHistorico(4, -4, "Atualização de cadastros", "07h55", "00h00", "-00h05"),
            criarJornadaHistorico(5, -5, "Conferência de relatórios", "08h07", "00h07", "+00h07")
        ];
    }

    function criarJornadaHistorico(id, dias, atividade, trabalhado, extras, saldo) {
        return {
            id_jornada: 200 + id,
            data_jornada: deslocarData(dias),
            funcionario: {
                id_usuario: 1,
                nome_completo: usuario.nome_completo,
                cpf: "0".repeat(11)
            },
            tipo_trabalho_inicio: "ADMINISTRATIVO",
            tipo_trabalho_apos_almoco: "ADMINISTRATIVO",
            atividade_do_dia: atividade,
            situacao_jornada: "CONCLUIDA",
            tempo_trabalhado_formatado: trabalhado,
            horas_extras_formatadas: extras,
            saldo_formatado: saldo,
            possui_alteracao: false,
            horarios: {
                entrada: "08:00",
                inicio_almoco: "12:00",
                fim_almoco: "13:00",
                saida: "17:00"
            },
            totais: {
                minutos_trabalhados: 480,
                trabalhado_formatado: trabalhado,
                tempo_trabalhado_formatado: trabalhado,
                minutos_esperados: 480,
                esperado_formatado: "08h00",
                tempo_esperado_formatado: "08h00",
                minutos_extras: 0,
                extras_formatadas: extras,
                horas_extras_formatadas: extras,
                minutos_saldo: 0,
                saldo_formatado: saldo,
                minutos_abonados: 0
            }
        };
    }

    function funcionariosStatus() {
        const configuracoes = [
            [pessoas[0], "ALMOCANDO", "08:02", "12:01", null, null],
            [pessoas[1], "TRABALHANDO", "07:58", "12:00", "13:01", null],
            [pessoas[2], "TRABALHANDO", "08:04", null, null, null],
            [pessoas[3], "EXPEDIENTE_ENCERRADO", "07:55", "12:02", "13:00", "16:58"],
            [pessoas[4], "AUSENTE", null, null, null, null]
        ];

        return configuracoes.map((item, indice) => {
            const [pessoa, status, entrada, inicio, fim, saida] = item;
            const ultimo = saida
                ? ["SAIDA", saida]
                : fim
                    ? ["FIM_ALMOCO", fim]
                    : inicio
                        ? ["INICIO_ALMOCO", inicio]
                        : entrada
                            ? ["ENTRADA", entrada]
                            : [null, null];

            return {
                id_usuario: pessoa.id_usuario,
                nome_completo: pessoa.nome_completo,
                cpf: pessoa.cpf,
                tipo_usuario: pessoa.tipo_usuario,
                status_atual: status,
                jornada: {
                    id_jornada: 300 + indice,
                    data_jornada: hojeIso(),
                    tipo_trabalho_inicio: indice % 2 ? "OPERACIONAL" : "ADMINISTRATIVO",
                    tipo_trabalho_apos_almoco: fim ? "ADMINISTRATIVO" : null,
                    tipo_trabalho_atual: entrada
                        ? (fim ? "ADMINISTRATIVO" : (indice % 2 ? "OPERACIONAL" : "ADMINISTRATIVO"))
                        : null,
                    atividade_do_dia: saida ? "Atividade fictícia concluída" : null,
                    situacao_jornada: saida
                        ? "CONCLUIDA"
                        : (entrada ? "EM_ANDAMENTO" : "NAO_INICIADA")
                },
                horarios: {
                    entrada,
                    inicio_almoco: inicio,
                    fim_almoco: fim,
                    saida
                },
                ultimo_registro: ultimo[0] ? {
                    tipo_registro: ultimo[0],
                    horario_informado: ultimo[1],
                    data_hora_lancamento: `${hojeIso()}T${ultimo[1]}:00`
                } : {
                    tipo_registro: null,
                    horario_informado: null,
                    data_hora_lancamento: null
                },
                situacao_especial: status === "AUSENTE" ? {
                    id_situacao: 1,
                    tipo_situacao: "FERIAS",
                    motivo: "Férias demonstrativas",
                    administrador: {
                        id_usuario: 1,
                        nome_completo: usuario.nome_completo
                    },
                    data_registro: `${hojeIso()}T08:00:00`,
                    data_atualizacao: `${hojeIso()}T08:00:00`
                } : null
            };
        });
    }

    function feriados() {
        const ano = new Date().getFullYear();
        return [
            {
                id_feriado: 1,
                nome_feriado: "Confraternização demonstrativa",
                descricao: "Data fictícia para apresentação do calendário",
                data_feriado: `${ano}-09-15`,
                ativo: true,
                data_criacao: `${ano}-01-10T09:00:00`,
                administrador_criacao: {
                    id_usuario: 1,
                    nome_completo: usuario.nome_completo
                }
            },
            {
                id_feriado: 2,
                nome_feriado: "Evento interno fictício",
                descricao: "Exemplo de feriado personalizado",
                data_feriado: `${ano}-11-20`,
                ativo: true,
                data_criacao: `${ano}-01-10T09:00:00`,
                administrador_criacao: {
                    id_usuario: 1,
                    nome_completo: usuario.nome_completo
                }
            }
        ];
    }

    function notificacoes() {
        const estado = lerEstado();
        return [
            {
                id_notificacao: 1,
                tipo_notificacao: "ALTERACAO_HORARIO",
                titulo: "Alteração de horário pendente",
                mensagem: "Ana Martins solicitou a revisão de um registro demonstrativo.",
                revisada: estado.notificacoesRevisadas.includes(1),
                data_criacao: `${hojeIso()}T10:30:00`,
                usuario_relacionado: pessoas[1],
                revisor: null
            },
            {
                id_notificacao: 2,
                tipo_notificacao: "SOLICITACAO_CADASTRO",
                titulo: "Nova solicitação fictícia",
                mensagem: "Existe um cadastro de demonstração aguardando análise.",
                revisada: estado.notificacoesRevisadas.includes(2),
                data_criacao: `${hojeIso()}T09:15:00`,
                usuario_relacionado: null,
                revisor: null
            }
        ];
    }

    function respostaNotificacoes() {
        const itens = notificacoes();
        const pendentes = itens.filter(item => !item.revisada).length;
        return {
            resumo: {
                quantidade_total: itens.length,
                quantidade_pendentes: pendentes,
                quantidade_revisadas: itens.length - pendentes
            },
            notificacoes: itens
        };
    }

    async function requisicaoApiDemonstracao(caminho, opcoes = {}) {
        await new Promise(resolve => setTimeout(resolve, 90));

        const metodo = (opcoes.method || "GET").toUpperCase();
        const rota = caminho.split("?")[0];
        const parametros = new URLSearchParams(caminho.split("?")[1] || "");
        const corpo = opcoes.body
            ? JSON.parse(opcoes.body)
            : {};
        const estado = lerEstado();

        if (rota === "/autenticacao/login") {
            return {
                sucesso: true,
                token_sessao: "sessao-local-demonstracao",
                usuario: clonar(usuario)
            };
        }

        if (rota === "/autenticacao/me") {
            return clonar(usuario);
        }

        if (rota === "/autenticacao/logout") {
            return { mensagem: "Sessão demonstrativa encerrada." };
        }

        if (rota === "/autenticacao/sessoes") {
            return {
                sessoes: [{
                    id_sessao: 1,
                    descricao_aparelho: "Navegador desta demonstração",
                    data_criacao: `${hojeIso()}T08:00:00`,
                    data_expiracao: deslocarData(7) + "T08:00:00",
                    sessao_atual: true
                }]
            };
        }

        if (rota === "/autenticacao/perfil") {
            return {
                perfil: clonar(pessoas[0])
            };
        }

        if (rota.startsWith("/autenticacao/")) {
            return {
                mensagem: "Ação realizada somente nesta demonstração."
            };
        }

        if (rota.startsWith("/jornadas/data/")) {
            if (!estado.jornadaAtual) {
                throw criarErro("Jornada não encontrada.", 404);
            }
            return clonar(estado.jornadaAtual);
        }

        if (rota === "/jornadas" && metodo === "POST") {
            estado.jornadaAtual = criarJornadaAtual();
            estado.jornadaAtual.horarios = {
                entrada: null,
                inicio_almoco: null,
                fim_almoco: null,
                saida: null
            };
            estado.jornadaAtual.jornada.tipo_trabalho_inicio =
                corpo.tipo_trabalho_inicio || "ADMINISTRATIVO";
            salvarEstado(estado);
            return clonar(estado.jornadaAtual);
        }

        if (rota === "/jornadas/sincronizar-offline") {
            if (!estado.jornadaAtual) {
                estado.jornadaAtual = criarJornadaAtual();
                estado.jornadaAtual.horarios = {
                    entrada: null,
                    inicio_almoco: null,
                    fim_almoco: null,
                    saida: null
                };
            }
            aplicarRegistro(estado.jornadaAtual, corpo);
            salvarEstado(estado);
            return {
                situacao: "SINCRONIZADA",
                jornada: clonar(estado.jornadaAtual)
            };
        }

        if (rota === "/jornadas/historico") {
            const jornadas = jornadasHistorico();
            return {
                periodo: {
                    data_inicio: parametros.get("data_inicio") || deslocarData(-30),
                    data_fim: parametros.get("data_fim") || hojeIso()
                },
                resumo: {
                    quantidade_jornadas: jornadas.length,
                    minutos_trabalhados: 2400,
                    total_trabalhado_formatado: "40h00",
                    tempo_trabalhado_formatado: "40h00",
                    minutos_extras: 22,
                    total_extras_formatado: "00h22",
                    horas_extras_formatadas: "00h22",
                    minutos_saldo: 15,
                    total_saldo_formatado: "+00h15",
                    saldo_formatado: "+00h15"
                },
                jornadas
            };
        }

        if (rota.startsWith("/calendario/mes")) {
            return {
                jornadas: jornadasHistorico().map(item => ({
                    data_jornada: item.data_jornada,
                    situacao_jornada: item.situacao_jornada,
                    possui_alteracao: false
                })),
                feriados: feriados(),
                aniversarios: [{
                    data_aniversario: deslocarData(3),
                    nome_completo: "Ana Martins"
                }]
            };
        }

        if (rota.startsWith("/calendario/dia/")) {
            const dataCalendario = rota.split("/").pop();
            const jornada = jornadasHistorico().find(
                item => item.data_jornada === dataCalendario
            );

            const montarHorario = (tipo, horario, indice) => horario
                ? {
                    id_registro: 900 + indice,
                    tipo_registro: tipo,
                    horario_informado: horario
                }
                : null;

            return {
                data_calendario: dataCalendario,
                data_futura: dataCalendario > hojeIso(),
                feriado: null,
                aniversarios: [],
                jornada: jornada
                    ? {
                        id_jornada: jornada.id_jornada,
                        data_jornada: jornada.data_jornada,
                        tipo_trabalho_inicio: jornada.tipo_trabalho_inicio,
                        tipo_trabalho_apos_almoco: jornada.tipo_trabalho_apos_almoco,
                        atividade_do_dia: jornada.atividade_do_dia,
                        situacao_jornada: jornada.situacao_jornada
                    }
                    : null,
                horarios: jornada
                    ? {
                        entrada: montarHorario("ENTRADA", jornada.horarios.entrada, 1),
                        inicio_almoco: montarHorario("INICIO_ALMOCO", jornada.horarios.inicio_almoco, 2),
                        fim_almoco: montarHorario("FIM_ALMOCO", jornada.horarios.fim_almoco, 3),
                        saida: montarHorario("SAIDA", jornada.horarios.saida, 4)
                    }
                    : null,
                resumo: jornada ? clonar(jornada.totais) : null,
                possui_alteracao: false,
                quantidade_alteracoes: 0,
                pode_editar_horarios: Boolean(jornada)
            };
        }

        if (rota === "/administracao/funcionarios") {
            const pesquisa = (parametros.get("pesquisa") || "").toLowerCase();
            const situacao = parametros.get("situacao_usuario");
            const filtradas = pessoas.filter(pessoa =>
                (!pesquisa || pessoa.nome_completo.toLowerCase().includes(pesquisa)) &&
                (!situacao || pessoa.situacao_usuario === situacao)
            );
            return {
                filtros: { pesquisa, situacao_usuario: situacao },
                resumo: {
                    quantidade_total: filtradas.length,
                    quantidade_ativos: filtradas.filter(item => item.situacao_usuario === "ATIVO").length,
                    quantidade_inativos: filtradas.filter(item => item.situacao_usuario === "INATIVO").length
                },
                funcionarios: clonar(filtradas)
            };
        }

        if (/^\/administracao\/funcionarios\/\d+$/.test(rota)) {
            const id = Number(rota.split("/").pop());
            return {
                funcionario: clonar(pessoas.find(item => item.id_usuario === id) || pessoas[0]),
                resumo_jornadas: {
                    quantidade_jornadas: 18,
                    total_trabalhado_formatado: "142h30",
                    total_esperado_formatado: "144h00",
                    total_extras_formatado: "03h10",
                    total_saldo_formatado: "+01h45",
                    total_tolerancia_formatado: "00h15"
                },
                jornadas_recentes: clonar(jornadasHistorico().slice(0, 3)),
                historico_conta: []
            };
        }

        if (rota === "/administracao/status-hoje") {
            return {
                data_referencia: hojeIso(),
                resumo: {
                    total_pessoas: 5,
                    trabalhando: 2,
                    almocando: 1,
                    expediente_encerrado: 1,
                    ponto_pendente: 0,
                    ausentes: 1,
                    atestados: 0,
                    ferias: 1,
                    folgas: 0,
                    dias_encerrados: 0
                },
                funcionarios: funcionariosStatus()
            };
        }

        if (rota === "/administracao/relatorios/jornadas") {
            const jornadas = jornadasHistorico().map(item => ({
                ...item,
                funcionario: item.funcionario,
                totais: item.totais
            }));
            return {
                periodo: {
                    data_inicio: parametros.get("data_inicio") || deslocarData(-30),
                    data_fim: parametros.get("data_fim") || hojeIso()
                },
                filtro: {
                    id_usuario: parametros.get("id_usuario")
                },
                resumo: {
                    quantidade_funcionarios: 4,
                    quantidade_jornadas: jornadas.length,
                    minutos_trabalhados: 2400,
                    minutos_esperados: 2400,
                    minutos_extras: 22,
                    minutos_saldo: 15,
                    tempo_trabalhado_formatado: "40h00",
                    tempo_esperado_formatado: "40h00",
                    horas_extras_formatadas: "00h22",
                    saldo_formatado: "+00h15"
                },
                funcionarios: clonar(pessoas.slice(0, 4)),
                jornadas
            };
        }

        if (rota === "/administracao/notificacoes") {
            return respostaNotificacoes();
        }

        if (/^\/administracao\/notificacoes\/\d+\/revisar$/.test(rota)) {
            const id = Number(rota.split("/")[3]);
            if (!estado.notificacoesRevisadas.includes(id)) {
                estado.notificacoesRevisadas.push(id);
                salvarEstado(estado);
            }
            return { mensagem: "Notificação demonstrativa revisada." };
        }

        if (rota === "/administracao/solicitacoes-pendentes") {
            return {
                solicitacoes: [{
                    id_solicitacao: 1,
                    nome_completo: "Marina Exemplo",
                    cpf: "6".repeat(11),
                    telefone: "35" + "9".repeat(9),
                    data_nascimento: "1998-06-12",
                    data_solicitacao: `${hojeIso()}T09:45:00`,
                    situacao_solicitacao: "PENDENTE"
                }]
            };
        }

        if (rota.startsWith("/administracao/solicitacoes/")) {
            return { mensagem: "Solicitação fictícia processada." };
        }

        if (rota === "/administracao/feriados") {
            return { feriados: [...feriados(), ...estado.feriadosExtras] };
        }

        if (rota === "/administracao/historico-alteracoes") {
            return {
                resumo: {
                    quantidade_total: 0,
                    quantidade_pendentes: 0,
                    quantidade_revisadas: 0
                },
                alteracoes: []
            };
        }

        if (rota.startsWith("/administracao/situacoes-especiais")) {
            return metodo === "GET" ? { historico: [] } : {
                mensagem: "Situação fictícia atualizada."
            };
        }

        if (rota === "/solicitacoes-cadastro") {
            return {
                mensagem: "Solicitação demonstrativa registrada."
            };
        }

        return {
            mensagem: "Ação simulada localmente no modo demonstração."
        };
    }

    function prepararInterfaceDemonstracao() {
        const estilo = document.createElement("style");
        estilo.textContent = `
            .aviso-modo-demonstracao {
                position: fixed;
                z-index: 10000;
                right: 16px;
                bottom: 16px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 9px 13px;
                color: #0f3554;
                border: 1px solid rgba(21, 94, 138, .2);
                border-radius: 999px;
                background: rgba(255, 255, 255, .94);
                box-shadow: 0 8px 30px rgba(15, 53, 84, .18);
                font: 700 12px/1.2 Arial, sans-serif;
                backdrop-filter: blur(10px);
                cursor: pointer;
                appearance: none;
            }
            .aviso-modo-demonstracao::before {
                width: 8px;
                height: 8px;
                content: "";
                border-radius: 50%;
                background: #2ca56c;
                box-shadow: 0 0 0 4px rgba(44, 165, 108, .14);
            }
            .aviso-login-demonstracao {
                margin: 0 0 18px;
                padding: 12px 14px;
                color: #155e8a;
                border: 1px solid #c9dfeb;
                border-radius: 10px;
                background: #eef7fb;
                font-size: 13px;
                line-height: 1.45;
            }
            @media (max-width: 600px) {
                .aviso-modo-demonstracao {
                    right: 10px;
                    bottom: 76px;
                    padding: 8px 11px;
                    font-size: 10px;
                }
            }
        `;
        document.head.appendChild(estilo);

        const selo = document.createElement("button");
        selo.type = "button";
        selo.className = "aviso-modo-demonstracao";
        selo.textContent = "Demonstração · reiniciar dados";
        selo.title = "Restaurar os dados fictícios iniciais";
        selo.addEventListener("click", () => {
            if (window.confirm("Deseja restaurar os dados iniciais da demonstração?")) {
                escopo.REINICIAR_DEMONSTRACAO();
            }
        });
        document.body.appendChild(selo);

        const formulario = document.getElementById("formulario-login");
        const campoCpf = document.getElementById("cpf");
        const campoSenha = document.getElementById("senha");

        if (formulario && campoCpf && campoSenha) {
            campoCpf.value = "000.000.000-00";
            campoSenha.value = "demonstracao";
            campoCpf.readOnly = true;
            campoSenha.readOnly = true;

            const aviso = document.createElement("p");
            aviso.className = "aviso-login-demonstracao";
            aviso.innerHTML = "<strong>Acesso demonstrativo</strong><br>Os campos já estão preenchidos. Basta clicar em Entrar.";
            formulario.insertBefore(aviso, formulario.firstChild);
        }
    }

    escopo.requisicaoApiDemonstracao =
        requisicaoApiDemonstracao;
    escopo.REINICIAR_DEMONSTRACAO = () => {
        localStorage.removeItem(CHAVE_ESTADO);
        localStorage.removeItem("gestor_jornadas_usuario");
        Object.keys(localStorage)
            .filter(chave => chave.startsWith("gestor_jornadas_sincronizacao_offline_v1_"))
            .forEach(chave => localStorage.removeItem(chave));
        window.location.href = `${CONFIGURACAO.URL_API}/`;
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            prepararInterfaceDemonstracao,
            { once: true }
        );
    } else {
        prepararInterfaceDemonstracao();
    }

}(window));
