USE gestor_jornadas;


-- Quantidade de minutos que o funcionário deveria trabalhar no dia
ALTER TABLE jornadas_diarias
ADD COLUMN minutos_esperados INT
NOT NULL DEFAULT 0
AFTER minutos_trabalhados;


-- Saldo final da jornada, podendo ser positivo ou negativo
ALTER TABLE jornadas_diarias
ADD COLUMN minutos_saldo INT
NOT NULL DEFAULT 0
AFTER minutos_extras;


-- Quantidade de tolerância aplicada ao saldo negativo
ALTER TABLE jornadas_diarias
ADD COLUMN minutos_tolerancia_aplicada INT
NOT NULL DEFAULT 0
AFTER minutos_saldo;