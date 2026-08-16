CREATE DATABASE IF NOT EXISTS gestor_jornadas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestor_jornadas;

-- Guarda os funcionários e administradores que possuem acesso ao sistema
CREATE TABLE IF NOT EXISTS usuarios (

    id_usuario INT AUTO_INCREMENT PRIMARY KEY,

    nome_completo VARCHAR(150) NOT NULL,

    cpf CHAR(11) NOT NULL UNIQUE,

    telefone VARCHAR(20) NOT NULL,

    data_nascimento DATE NOT NULL,

    senha_hash VARCHAR(255) NOT NULL,

    foto_perfil VARCHAR(255),

    tipo_usuario ENUM(
        'FUNCIONARIO',
        'ADMINISTRADOR'
    ) NOT NULL DEFAULT 'FUNCIONARIO',

    situacao_usuario ENUM(
        'ATIVO',
        'INATIVO'
    ) NOT NULL DEFAULT 'ATIVO',

    precisa_trocar_senha BOOLEAN NOT NULL DEFAULT FALSE,

    data_cadastro DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    data_atualizacao DATETIME
        NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);
