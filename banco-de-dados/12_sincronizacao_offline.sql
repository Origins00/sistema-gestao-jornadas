USE gestor_jornadas;


-- Identifica uma operacao criada no aparelho para que uma nova tentativa
-- depois de uma resposta perdida nao duplique o mesmo horario.
ALTER TABLE registros_horarios
ADD COLUMN chave_operacao_offline CHAR(36) NULL
AFTER id_registro,
ADD COLUMN data_hora_dispositivo_utc DATETIME NULL
AFTER data_hora_lancamento;


CREATE UNIQUE INDEX uq_registro_operacao_offline
ON registros_horarios (chave_operacao_offline);


-- Preserva as duas versoes quando um horario salvo no servidor difere do
-- horario que permaneceu na fila do aparelho.
CREATE TABLE IF NOT EXISTS conflitos_sincronizacao (

    id_conflito INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_jornada INT NOT NULL,

    chave_operacao_offline CHAR(36) NOT NULL,

    tipo_registro ENUM(
        'ENTRADA',
        'INICIO_ALMOCO',
        'FIM_ALMOCO',
        'SAIDA'
    ) NOT NULL,

    horario_servidor TIME NOT NULL,

    horario_dispositivo TIME NOT NULL,

    origem_dispositivo ENUM(
        'HORARIO_ATUAL',
        'DIGITADO_MANUALMENTE'
    ) NOT NULL,

    data_hora_dispositivo_utc DATETIME NULL,

    tipo_trabalho_apos_almoco_dispositivo ENUM(
        'ADMINISTRATIVO',
        'OPERACIONAL'
    ),

    atividade_do_dia_dispositivo TEXT,

    situacao ENUM(
        'PENDENTE',
        'RESOLVIDO_SERVIDOR',
        'RESOLVIDO_DISPOSITIVO'
    ) NOT NULL DEFAULT 'PENDENTE',

    data_criacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_resolucao DATETIME,

    id_administrador_resolucao INT,

    CONSTRAINT uq_conflito_operacao_offline
        UNIQUE (chave_operacao_offline),

    CONSTRAINT fk_conflito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_conflito_jornada
        FOREIGN KEY (id_jornada)
        REFERENCES jornadas_diarias(id_jornada)
        ON DELETE CASCADE,

    CONSTRAINT fk_conflito_administrador
        FOREIGN KEY (id_administrador_resolucao)
        REFERENCES usuarios(id_usuario)

);
