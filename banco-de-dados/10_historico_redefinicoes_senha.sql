USE gestor_jornadas;

-- Registra redefinições administrativas sem guardar a senha provisória
CREATE TABLE IF NOT EXISTS redefinicoes_senha_usuarios (

    id_redefinicao INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_administrador INT NOT NULL,

    quantidade_sessoes_encerradas INT
        NOT NULL DEFAULT 0,

    data_redefinicao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_redefinicao_senha_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_redefinicao_senha_administrador
        FOREIGN KEY (id_administrador)
        REFERENCES usuarios(id_usuario)

);
