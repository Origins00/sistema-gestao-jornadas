USE gestor_jornadas;


/* =========================================================
   FERIADOS GLOBAIS
   ========================================================= */

/*
 * Guarda os feriados que se aplicam a todas as pessoas
 * cadastradas no Gestor de Jornadas.
 *
 * Um feriado pode ser desativado para preservar o histórico.
 * Quando lançado por engano, também pode ser excluído
 * definitivamente pela área administrativa.
 */
CREATE TABLE IF NOT EXISTS feriados (

    id_feriado INT
        AUTO_INCREMENT
        PRIMARY KEY,

    data_feriado DATE NOT NULL,

    nome_feriado VARCHAR(120) NOT NULL,

    descricao VARCHAR(500),

    ativo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    id_administrador_criacao INT NOT NULL,

    id_administrador_atualizacao INT,

    data_criacao DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    data_atualizacao DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,


    /*
     * Não permite dois feriados globais diferentes
     * cadastrados na mesma data.
     */
    CONSTRAINT uq_feriado_data

        UNIQUE (
            data_feriado
        ),


    /*
     * Administrador que criou o feriado.
     */
    CONSTRAINT fk_feriado_administrador_criacao

        FOREIGN KEY (
            id_administrador_criacao
        )

        REFERENCES usuarios (
            id_usuario
        ),


    /*
     * Administrador responsável pela última alteração.
     */
    CONSTRAINT fk_feriado_administrador_atualizacao

        FOREIGN KEY (
            id_administrador_atualizacao
        )

        REFERENCES usuarios (
            id_usuario
        ),


    /*
     * Facilita a consulta de feriados por período.
     */
    INDEX idx_feriado_data_ativo (
        data_feriado,
        ativo
    )

);


/* =========================================================
   HISTÓRICO DOS FERIADOS
   ========================================================= */

/*
 * Preserva as ações enquanto o feriado existir.
 * Em uma exclusão definitiva, este histórico também é apagado.
 *
 * A tabela registra:
 *
 * - criação;
 * - alteração;
 * - desativação;
 * - reativação.
 */
CREATE TABLE IF NOT EXISTS historico_feriados (

    id_historico INT
        AUTO_INCREMENT
        PRIMARY KEY,

    id_feriado INT NOT NULL,

    data_feriado DATE NOT NULL,

    acao_realizada ENUM(

        'CRIADO',
        'ALTERADO',
        'DESATIVADO',
        'REATIVADO'

    ) NOT NULL,

    nome_anterior VARCHAR(120),

    nome_novo VARCHAR(120),

    descricao_anterior VARCHAR(500),

    descricao_nova VARCHAR(500),

    ativo_anterior BOOLEAN,

    ativo_novo BOOLEAN,

    motivo_alteracao VARCHAR(500),

    id_administrador INT NOT NULL,

    data_alteracao DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,


    /*
     * Feriado relacionado ao registro de histórico.
     */
    CONSTRAINT fk_historico_feriado

        FOREIGN KEY (
            id_feriado
        )

        REFERENCES feriados (
            id_feriado
        ),


    /*
     * Administrador que realizou a ação.
     */
    CONSTRAINT fk_historico_feriado_administrador

        FOREIGN KEY (
            id_administrador
        )

        REFERENCES usuarios (
            id_usuario
        ),


    /*
     * Facilita a consulta do histórico de um feriado.
     */
    INDEX idx_historico_feriado_data (

        id_feriado,
        data_alteracao

    ),

    /*
     * Facilita a consulta das alterações mais recentes.
     */
    INDEX idx_historico_feriado_alteracao (

        data_alteracao

    )

);
