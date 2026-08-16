/*
 * Regras puras para a digitação de horários e o resumo parcial da jornada.
 */

(function configurarHorarioJornada(escopo) {

    function normalizarParteHorario(valor) {
        return String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 2);
    }

    function montarHorario(hora, minuto) {
        const horaNormalizada = normalizarParteHorario(hora);
        const minutoNormalizado = normalizarParteHorario(minuto);

        if (!horaNormalizada || !minutoNormalizado) {
            return null;
        }

        const numeroHora = Number(horaNormalizada);
        const numeroMinuto = Number(minutoNormalizado);

        if (
            numeroHora > 23 ||
            numeroMinuto > 59
        ) {
            return null;
        }

        return [
            String(numeroHora).padStart(2, "0"),
            String(numeroMinuto).padStart(2, "0")
        ].join(":");
    }

    function normalizarHorarioDigitado(valor) {
        const digitos = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 4);

        if (!digitos) {
            return "";
        }

        if (digitos.length <= 2) {
            return `${digitos}:`;
        }

        return `${digitos.slice(0, -2)}:${digitos.slice(-2)}`;
    }

    function removerUltimoDigitoHorario(valor) {
        const digitos = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 4)
            .slice(0, -1);

        return normalizarHorarioDigitado(digitos);
    }

    function montarHorarioDigitado(valor) {
        const texto = String(valor || "").trim();

        if (texto.includes(":")) {
            const partes = texto.split(":");

            if (partes.length !== 2) {
                return null;
            }

            return montarHorario(partes[0], partes[1]);
        }

        const digitos = texto
            .replace(/\D/g, "")
            .slice(0, 4);

        if (digitos.length === 3) {
            return montarHorario(
                digitos.slice(0, 1),
                digitos.slice(1)
            );
        }

        if (digitos.length === 4) {
            return montarHorario(
                digitos.slice(0, 2),
                digitos.slice(2)
            );
        }

        return null;
    }

    function separarHorario(horario) {
        const correspondencia = String(horario || "")
            .match(/^(\d{2}):(\d{2})$/);

        if (!correspondencia) {
            return null;
        }

        const horarioNormalizado = montarHorario(
            correspondencia[1],
            correspondencia[2]
        );

        if (!horarioNormalizado) {
            return null;
        }

        return {
            hora: horarioNormalizado.slice(0, 2),
            minuto: horarioNormalizado.slice(3, 5)
        };
    }

    function converterHorarioParaMinutos(horario) {
        const partes = separarHorario(horario);

        if (!partes) {
            return null;
        }

        return Number(partes.hora) * 60 + Number(partes.minuto);
    }

    function calcularDuracao(inicio, fim) {
        const inicioMinutos = converterHorarioParaMinutos(inicio);
        const fimMinutos = converterHorarioParaMinutos(fim);

        if (
            inicioMinutos === null ||
            fimMinutos === null ||
            fimMinutos < inicioMinutos
        ) {
            return null;
        }

        return fimMinutos - inicioMinutos;
    }

    function calcularMinutosTrabalhados(horarios) {
        if (!horarios) {
            return null;
        }

        const periodos = [
            [horarios.entrada, horarios.inicio_almoco],
            [horarios.fim_almoco, horarios.saida]
        ];

        let total = 0;
        let quantidadePeriodos = 0;

        periodos.forEach(([inicio, fim]) => {
            const duracao = calcularDuracao(inicio, fim);

            if (duracao !== null) {
                total += duracao;
                quantidadePeriodos += 1;
            }
        });

        return quantidadePeriodos > 0
            ? total
            : null;
    }

    function formatarTotalMinutos(totalMinutos) {
        const totalSeguro = Math.max(
            0,
            Number(totalMinutos) || 0
        );

        const horas = Math.floor(totalSeguro / 60);
        const minutos = totalSeguro % 60;

        return `${String(horas).padStart(2, "0")}h${String(minutos).padStart(2, "0")}`;
    }

    escopo.HORARIO_JORNADA = Object.freeze({
        normalizarParteHorario,
        normalizarHorarioDigitado,
        removerUltimoDigitoHorario,
        montarHorario,
        montarHorarioDigitado,
        separarHorario,
        calcularMinutosTrabalhados,
        formatarTotalMinutos
    });

}(typeof window !== "undefined" ? window : globalThis));
