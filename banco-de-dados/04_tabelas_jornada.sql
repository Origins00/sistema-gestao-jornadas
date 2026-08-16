USE gestor_jornadas;


-- Guarda o resumo da jornada de cada usuário em uma determinada data
CREATE TABLE IF NOT EXISTS jornadas_diarias (

    id_jornada INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    data_jornada DATE NOT NULL,

    tipo_trabalho_inicio ENUM(
        'ADMINISTRATIVO',
        'OPERACIONAL'
    ) NOT NULL,

    tipo_trabalho_apos_almoco ENUM(
        'ADMINISTRATIVO',
        'OPERACIONAL'
    ),

    atividade_do_dia TEXT,

    situacao_jornada ENUM(
        'EM_ANDAMENTO',
        'CONCLUIDA',
        'INCOMPLETA',
        'DIA_ENCERRADO',
        'ATESTADO',
        'FOLGA',
        'AUSENCIA'
    ) NOT NULL DEFAULT 'EM_ANDAMENTO',

    minutos_trabalhados INT NOT NULL DEFAULT 0,

    minutos_extras INT NOT NULL DEFAULT 0,

    minutos_abonados INT NOT NULL DEFAULT 0,

    data_criacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_atualizacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_jornada_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT uq_usuario_data_jornada
        UNIQUE (id_usuario, data_jornada)

);

-- Guarda cada horário informado durante a jornada
CREATE TABLE IF NOT EXISTS registros_horarios (

    id_registro INT AUTO_INCREMENT PRIMARY KEY,

    id_jornada INT NOT NULL,

    tipo_registro ENUM(
        'ENTRADA',
        'INICIO_ALMOCO',
        'FIM_ALMOCO',
        'SAIDA'
    ) NOT NULL,

    horario_informado TIME NOT NULL,

    data_hora_lancamento DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    origem_registro ENUM(
        'HORARIO_ATUAL',
        'DIGITADO_MANUALMENTE'
    ) NOT NULL,

    sincronizado BOOLEAN
        NOT NULL DEFAULT TRUE,

    data_sincronizacao DATETIME,

    data_criacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_atualizacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_registro_jornada
        FOREIGN KEY (id_jornada)
        REFERENCES jornadas_diarias(id_jornada)
        ON DELETE CASCADE,

    CONSTRAINT uq_jornada_tipo_registro
        UNIQUE (id_jornada, tipo_registro)

);

-- Guarda o histórico das alterações feitas nos horários da jornada
CREATE TABLE IF NOT EXISTS alteracoes_registros (

    id_alteracao INT AUTO_INCREMENT PRIMARY KEY,

    id_registro INT NOT NULL,

    id_usuario_alteracao INT NOT NULL,

    horario_anterior TIME,

    horario_novo TIME,

    motivo_administrador VARCHAR(500),

    data_alteracao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    revisada BOOLEAN
        NOT NULL DEFAULT FALSE,

    data_revisao DATETIME,

    id_administrador_revisor INT,

    CONSTRAINT fk_alteracao_registro
        FOREIGN KEY (id_registro)
        REFERENCES registros_horarios(id_registro),

    CONSTRAINT fk_alteracao_usuario
        FOREIGN KEY (id_usuario_alteracao)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_alteracao_revisor
        FOREIGN KEY (id_administrador_revisor)
        REFERENCES usuarios(id_usuario)

);