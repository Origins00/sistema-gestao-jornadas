USE gestor_jornadas;

-- Preserva os dados anteriores e novos de cada correção administrativa
CREATE TABLE IF NOT EXISTS alteracoes_dados_usuarios (

    id_alteracao_dados INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    nome_anterior VARCHAR(150) NOT NULL,

    nome_novo VARCHAR(150) NOT NULL,

    cpf_anterior CHAR(11) NOT NULL,

    cpf_novo CHAR(11) NOT NULL,

    telefone_anterior VARCHAR(20) NOT NULL,

    telefone_novo VARCHAR(20) NOT NULL,

    data_nascimento_anterior DATE NOT NULL,

    data_nascimento_nova DATE NOT NULL,

    id_administrador INT NOT NULL,

    data_alteracao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alteracao_dados_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_alteracao_dados_administrador
        FOREIGN KEY (id_administrador)
        REFERENCES usuarios(id_usuario)

);
