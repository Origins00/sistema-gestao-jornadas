/*
 * Fila local de horarios do PWA.
 *
 * Nenhuma senha, cookie ou token e armazenado aqui. Os dados ficam separados
 * pelo id do usuario e sao enviados em ordem quando a sessao voltar a ter
 * conexao com o servidor.
 */

(function criarSincronizacaoOffline(escopo) {

    const PREFIXO_CHAVE =
        "gestor_jornadas_sincronizacao_offline_v1_";

    const MAPA_CAMPO_HORARIO = Object.freeze({
        ENTRADA: "entrada",
        INICIO_ALMOCO: "inicio_almoco",
        FIM_ALMOCO: "fim_almoco",
        SAIDA: "saida"
    });

    function clonar(valor) {

        if (valor === null || valor === undefined) {
            return valor;
        }

        return JSON.parse(JSON.stringify(valor));

    }

    function obterChave(idUsuario) {
        return `${PREFIXO_CHAVE}${idUsuario}`;
    }

    function criarEstadoVazio() {
        return {
            versao: 1,
            jornadas: {},
            pendencias: [],
            conflitos: []
        };
    }

    function lerEstado(idUsuario) {

        const texto = localStorage.getItem(
            obterChave(idUsuario)
        );

        if (!texto) {
            return criarEstadoVazio();
        }

        try {

            const estado = JSON.parse(texto);

            return {
                ...criarEstadoVazio(),
                ...estado,
                jornadas: estado.jornadas || {},
                pendencias: estado.pendencias || [],
                conflitos: estado.conflitos || []
            };

        } catch (erro) {

            console.error(
                "Nao foi possivel ler a fila offline:",
                erro
            );

            return criarEstadoVazio();

        }

    }

    function salvarEstado(idUsuario, estado) {

        localStorage.setItem(
            obterChave(idUsuario),
            JSON.stringify(estado)
        );

    }

    function gerarChaveOperacao() {

        if (
            escopo.crypto &&
            typeof escopo.crypto.randomUUID === "function"
        ) {
            return escopo.crypto.randomUUID();
        }

        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            .replace(/[xy]/g, caractere => {

                const aleatorio = Math.floor(
                    Math.random() * 16
                );

                const valor = caractere === "x"
                    ? aleatorio
                    : (aleatorio & 0x3) | 0x8;

                return valor.toString(16);

            });

    }

    function criarJornadaLocal(operacao) {

        return {
            jornada: {
                id_jornada: `offline-${operacao.data_jornada}`,
                data_jornada: operacao.data_jornada,
                tipo_trabalho_inicio:
                    operacao.tipo_trabalho_inicio,
                tipo_trabalho_apos_almoco: null,
                atividade_do_dia: null,
                situacao_jornada: "EM_ANDAMENTO",
                pendente_sincronizacao: true
            },
            horarios: {
                entrada: null,
                inicio_almoco: null,
                fim_almoco: null,
                saida: null
            },
            resumo: {
                minutos_trabalhados: 0,
                tempo_trabalhado_formatado: "00h00",
                minutos_esperados: 0,
                tempo_esperado_formatado: "00h00",
                minutos_extras: 0,
                horas_extras_formatadas: "00h00",
                minutos_saldo: 0,
                saldo_formatado: "00h00",
                minutos_tolerancia_aplicada: 0,
                minutos_abonados: 0,
                dia_especial: false,
                tipo_dia: "NORMAL",
                feriado: null
            }
        };

    }

    function aplicarOperacao(jornadaOriginal, operacao) {

        const jornada = clonar(jornadaOriginal) ||
            criarJornadaLocal(operacao);

        const campo = MAPA_CAMPO_HORARIO[
            operacao.tipo_registro
        ];

        if (!campo) {
            throw new Error("Tipo de horario offline invalido.");
        }

        jornada.horarios[campo] =
            operacao.horario_informado;

        jornada.jornada.pendente_sincronizacao = true;

        if (operacao.tipo_trabalho_inicio) {
            jornada.jornada.tipo_trabalho_inicio =
                operacao.tipo_trabalho_inicio;
        }

        if (operacao.tipo_registro === "FIM_ALMOCO") {
            jornada.jornada.tipo_trabalho_apos_almoco =
                operacao.tipo_trabalho_apos_almoco;
        }

        if (operacao.tipo_registro === "SAIDA") {
            jornada.jornada.atividade_do_dia =
                operacao.atividade_do_dia || null;
            jornada.jornada.situacao_jornada =
                "CONCLUIDA";
        }

        return jornada;

    }

    function aplicarPendencias(estado, dataJornada, base) {

        return estado.pendencias
            .filter(item => item.data_jornada === dataJornada)
            .sort((a, b) =>
                a.data_hora_dispositivo.localeCompare(
                    b.data_hora_dispositivo
                )
            )
            .reduce(
                (jornada, operacao) =>
                    aplicarOperacao(jornada, operacao),
                clonar(base)
            );

    }

    function obterJornada(idUsuario, dataJornada) {

        const estado = lerEstado(idUsuario);
        const base = estado.jornadas[dataJornada] || null;

        return aplicarPendencias(
            estado,
            dataJornada,
            base
        );

    }

    function salvarJornadaServidor(
        idUsuario,
        dataJornada,
        dadosJornada
    ) {

        const estado = lerEstado(idUsuario);

        if (dadosJornada) {
            estado.jornadas[dataJornada] =
                clonar(dadosJornada);
        } else {
            delete estado.jornadas[dataJornada];
        }

        salvarEstado(idUsuario, estado);

        return aplicarPendencias(
            estado,
            dataJornada,
            dadosJornada
        );

    }

    function registrarHorario(idUsuario, dados) {

        const estado = lerEstado(idUsuario);
        const jornadaAtual = aplicarPendencias(
            estado,
            dados.data_jornada,
            estado.jornadas[dados.data_jornada] || null
        );

        const campo = MAPA_CAMPO_HORARIO[
            dados.tipo_registro
        ];

        if (jornadaAtual?.horarios?.[campo]) {
            throw new Error(
                "Este horario ja foi registrado neste aparelho."
            );
        }

        if (estado.pendencias.length >= 100) {
            throw new Error(
                "A fila offline atingiu o limite de seguranca. Conecte o aparelho para sincronizar."
            );
        }

        const operacao = {
            chave_operacao_offline: gerarChaveOperacao(),
            data_hora_dispositivo: new Date().toISOString(),
            data_jornada: dados.data_jornada,
            tipo_registro: dados.tipo_registro,
            horario_informado: dados.horario_informado,
            origem_registro: dados.origem_registro,
            tipo_trabalho_inicio:
                dados.tipo_trabalho_inicio || null,
            tipo_trabalho_apos_almoco:
                dados.tipo_trabalho_apos_almoco || null,
            atividade_do_dia:
                dados.atividade_do_dia || null
        };

        estado.pendencias.push(operacao);
        salvarEstado(idUsuario, estado);

        return {
            operacao: clonar(operacao),
            jornada: aplicarOperacao(
                jornadaAtual,
                operacao
            ),
            quantidade_pendente: estado.pendencias.length
        };

    }

    function quantidadePendencias(idUsuario) {
        return lerEstado(idUsuario).pendencias.length;
    }

    async function sincronizarPendencias(
        idUsuario,
        enviarOperacao
    ) {

        const estado = lerEstado(idUsuario);
        const resultado = {
            sincronizadas: 0,
            conflitos: 0,
            restantes: estado.pendencias.length,
            interrompida: false
        };

        for (const operacao of [...estado.pendencias]) {

            try {

                const resposta = await enviarOperacao(
                    clonar(operacao)
                );

                estado.pendencias = estado.pendencias.filter(
                    item => item.chave_operacao_offline !==
                        operacao.chave_operacao_offline
                );

                if (resposta?.situacao === "CONFLITO") {
                    estado.conflitos.push({
                        ...clonar(operacao),
                        id_conflito: resposta.id_conflito,
                        registrado_em: new Date().toISOString()
                    });
                    resultado.conflitos += 1;
                } else {
                    resultado.sincronizadas += 1;
                }

                salvarEstado(idUsuario, estado);

            } catch (erro) {

                resultado.interrompida = true;
                resultado.erro = erro;
                break;

            }

        }

        resultado.restantes = estado.pendencias.length;
        return resultado;

    }

    escopo.SINCRONIZACAO_OFFLINE = Object.freeze({
        obterJornada,
        salvarJornadaServidor,
        registrarHorario,
        quantidadePendencias,
        sincronizarPendencias
    });

}(window));
