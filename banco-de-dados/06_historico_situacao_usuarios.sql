USE gestor_jornadas;


-- Guarda o histórico de ativação e desativação das contas
CREATE TABLE IF NOT EXISTS alteracoes_situacao_usuarios (

    id_alteracao_situacao INT
        AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    situacao_anterior ENUM(
        'ATIVO',
        'INATIVO'
    ) NOT NULL,

    situacao_nova ENUM(
        'ATIVO',
        'INATIVO'
    ) NOT NULL,

    id_administrador INT NOT NULL,

    observacao VARCHAR(500),

    data_alteracao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alteracao_situacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_alteracao_situacao_administrador
        FOREIGN KEY (id_administrador)
        REFERENCES usuarios(id_usuario)

);