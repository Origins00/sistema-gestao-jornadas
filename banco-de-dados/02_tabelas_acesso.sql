USE gestor_jornadas;

-- Guarda os pedidos de cadastro que ainda precisam ser analisados
CREATE TABLE IF NOT EXISTS solicitacoes_cadastro (

    id_solicitacao INT AUTO_INCREMENT PRIMARY KEY,

    nome_completo VARCHAR(150) NOT NULL,

    cpf CHAR(11) NOT NULL UNIQUE,

    telefone VARCHAR(20) NOT NULL,

    data_nascimento DATE NOT NULL,

    senha_hash VARCHAR(255) NOT NULL,

    foto_perfil VARCHAR(255),

    situacao_solicitacao ENUM(
        'PENDENTE',
        'APROVADA',
        'RECUSADA'
    ) NOT NULL DEFAULT 'PENDENTE',

    observacao_administrador VARCHAR(500),

    data_solicitacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_resposta DATETIME,

    id_administrador_responsavel INT,

    CONSTRAINT fk_solicitacao_administrador
        FOREIGN KEY (id_administrador_responsavel)
        REFERENCES usuarios(id_usuario)

);

-- Guarda as sessões para que o usuário não precise entrar novamente todos os dias
CREATE TABLE IF NOT EXISTS sessoes_acesso (

    id_sessao INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT NOT NULL,

    token_sessao VARCHAR(255) NOT NULL UNIQUE,

    descricao_aparelho VARCHAR(255),

    data_criacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    ultimo_acesso DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_expiracao DATETIME,

    sessao_ativa BOOLEAN
        NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_sessao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)

);

-- Guarda os avisos que serão exibidos no painel dos administradores
CREATE TABLE IF NOT EXISTS notificacoes (

    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario_relacionado INT,

    tipo_notificacao ENUM(
        'SOLICITACAO_CADASTRO',
        'REGISTRO_ALTERADO',
        'JORNADA_INCOMPLETA',
        'FUNCIONARIO_SEM_REGISTRO',
        'CONFLITO_SINCRONIZACAO'
    ) NOT NULL,

    titulo VARCHAR(150) NOT NULL,

    mensagem VARCHAR(500) NOT NULL,

    revisada BOOLEAN
        NOT NULL DEFAULT FALSE,

    data_criacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_revisao DATETIME,

    id_administrador_revisor INT,

    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario_relacionado)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_notificacao_administrador
        FOREIGN KEY (id_administrador_revisor)
        REFERENCES usuarios(id_usuario)

);