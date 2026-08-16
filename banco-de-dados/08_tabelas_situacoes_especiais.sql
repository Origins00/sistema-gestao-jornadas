USE gestor_jornadas;


/* =========================================================
   SITUAÇÃO ESPECIAL ATUAL DE CADA PESSOA
   ========================================================= */

/*
 * Guarda a situação especial atualmente aplicada
 * a uma pessoa em uma determinada data.
 *
 * Existe no máximo uma situação especial ativa
 * por pessoa e por dia.
 */
CREATE TABLE IF NOT EXISTS situacoes_especiais_dias (

    id_situacao INT
        AUTO_INCREMENT
        PRIMARY KEY,

    id_usuario INT NOT NULL,

    data_situacao DATE NOT NULL,

    tipo_situacao ENUM(

        'ATESTADO',
        'FERIAS',
        'FOLGA',
        'AUSENCIA',
        'DIA_ENCERRADO'

    ) NOT NULL,

    motivo VARCHAR(500),

    id_administrador_registro INT NOT NULL,

    data_registro DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    data_atualizacao DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,


    /* Uma pessoa só pode ter uma situação por data */

    CONSTRAINT uq_situacao_usuario_data

        UNIQUE (
            id_usuario,
            data_situacao
        ),


    /* Pessoa que recebeu a situação */

    CONSTRAINT fk_situacao_usuario

        FOREIGN KEY (
            id_usuario
        )

        REFERENCES usuarios (
            id_usuario
        ),


    /* Administrador que realizou o registro */

    CONSTRAINT fk_situacao_administrador

        FOREIGN KEY (
            id_administrador_registro
        )

        REFERENCES usuarios (
            id_usuario
        )

);


/* Facilita consultas pelo dia */

CREATE INDEX idx_situacao_data

    ON situacoes_especiais_dias (
        data_situacao
    );


/* Facilita filtros por tipo de situação */

CREATE INDEX idx_situacao_tipo

    ON situacoes_especiais_dias (
        tipo_situacao
    );


/* =========================================================
   HISTÓRICO DAS SITUAÇÕES ESPECIAIS
   ========================================================= */

/*
 * Preserva todas as inclusões, alterações e remoções.
 *
 * Mesmo que a situação atual seja removida,
 * este histórico continua armazenado.
 */
CREATE TABLE IF NOT EXISTS historico_situacoes_especiais (

    id_historico INT
        AUTO_INCREMENT
        PRIMARY KEY,

    id_usuario INT NOT NULL,

    data_situacao DATE NOT NULL,

    id_situacao_origem INT,

    acao_realizada ENUM(

        'CRIADA',
        'ALTERADA',
        'REMOVIDA'

    ) NOT NULL,

    tipo_anterior ENUM(

        'ATESTADO',
        'FERIAS',
        'FOLGA',
        'AUSENCIA',
        'DIA_ENCERRADO'

    ),

    tipo_novo ENUM(

        'ATESTADO',
        'FERIAS',
        'FOLGA',
        'AUSENCIA',
        'DIA_ENCERRADO'

    ),

    motivo_anterior VARCHAR(500),

    motivo_novo VARCHAR(500),

    motivo_alteracao VARCHAR(500),

    id_administrador INT NOT NULL,

    data_alteracao DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,


    /* Pessoa afetada pela alteração */

    CONSTRAINT fk_historico_situacao_usuario

        FOREIGN KEY (
            id_usuario
        )

        REFERENCES usuarios (
            id_usuario
        ),


    /* Administrador responsável */

    CONSTRAINT fk_historico_situacao_administrador

        FOREIGN KEY (
            id_administrador
        )

        REFERENCES usuarios (
            id_usuario
        )

);


/* Facilita a consulta do histórico de uma pessoa */

CREATE INDEX idx_historico_situacao_usuario_data

    ON historico_situacoes_especiais (
        id_usuario,
        data_situacao
    );


/* Facilita a consulta das alterações mais recentes */

CREATE INDEX idx_historico_situacao_data_alteracao

    ON historico_situacoes_especiais (
        data_alteracao
    );