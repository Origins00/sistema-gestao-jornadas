USE gestor_jornadas;

-- Aumenta o campo para guardar o hash do token de sessão
ALTER TABLE sessoes_acesso
MODIFY token_sessao CHAR(64) NOT NULL UNIQUE;

-- Guarda a data em que uma sessão foi encerrada
ALTER TABLE sessoes_acesso
ADD COLUMN data_encerramento DATETIME NULL
AFTER sessao_ativa;