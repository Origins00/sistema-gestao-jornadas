const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");


const codigo = fs.readFileSync(
    path.resolve(__dirname, "../js/horario-jornada.js"),
    "utf8"
);

const contexto = {};
vm.runInNewContext(codigo, contexto);

const horario = contexto.HORARIO_JORNADA;

assert.equal(horario.normalizarParteHorario("1a8"), "18");
assert.equal(horario.normalizarHorarioDigitado(""), "");
assert.equal(horario.normalizarHorarioDigitado("1"), "1:");
assert.equal(horario.normalizarHorarioDigitado("10"), "10:");
assert.equal(horario.normalizarHorarioDigitado("100"), "1:00");
assert.equal(horario.normalizarHorarioDigitado("0600"), "06:00");
assert.equal(horario.normalizarHorarioDigitado("1100"), "11:00");
assert.equal(horario.normalizarHorarioDigitado("18a30"), "18:30");
assert.equal(horario.normalizarHorarioDigitado("600"), "6:00");
assert.equal(horario.removerUltimoDigitoHorario("13:01"), "1:30");
assert.equal(horario.removerUltimoDigitoHorario("1:30"), "13:");
assert.equal(horario.removerUltimoDigitoHorario("13:"), "1:");
assert.equal(horario.removerUltimoDigitoHorario("1:"), "");
assert.equal(horario.montarHorario("6", "0"), "06:00");
assert.equal(horario.montarHorarioDigitado("600"), "06:00");
assert.equal(horario.montarHorarioDigitado("0600"), "06:00");
assert.equal(horario.montarHorarioDigitado("1100"), "11:00");
assert.equal(horario.montarHorarioDigitado("1830"), "18:30");
assert.equal(horario.montarHorarioDigitado("18:30"), "18:30");
assert.equal(horario.montarHorarioDigitado("2460"), null);
assert.equal(horario.montarHorario("23", "59"), "23:59");
assert.equal(horario.montarHorario("24", "00"), null);
assert.equal(horario.montarHorario("12", "60"), null);

const partesHorario = horario.separarHorario("06:05");
assert.equal(partesHorario.hora, "06");
assert.equal(partesHorario.minuto, "05");

assert.equal(
    horario.calcularMinutosTrabalhados({
        entrada: "06:00",
        inicio_almoco: "12:00",
        fim_almoco: null,
        saida: null
    }),
    360
);

assert.equal(
    horario.calcularMinutosTrabalhados({
        entrada: "06:00",
        inicio_almoco: "12:00",
        fim_almoco: "13:00",
        saida: "17:00"
    }),
    600
);

assert.equal(
    horario.calcularMinutosTrabalhados({
        entrada: "06:00",
        inicio_almoco: null,
        fim_almoco: null,
        saida: null
    }),
    null
);

assert.equal(horario.formatarTotalMinutos(360), "06h00");
assert.equal(horario.formatarTotalMinutos(605), "10h05");

console.log("Horário numérico e resumo parcial: testes aprovados.");
