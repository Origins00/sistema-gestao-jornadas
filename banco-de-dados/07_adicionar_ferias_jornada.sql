USE gestor_jornadas;


-- Adiciona a situação de férias às jornadas especiais
ALTER TABLE jornadas_diarias

MODIFY COLUMN situacao_jornada ENUM(

    'EM_ANDAMENTO',
    'CONCLUIDA',
    'INCOMPLETA',
    'DIA_ENCERRADO',
    'ATESTADO',
    'FERIAS',
    'FOLGA',
    'AUSENCIA'

) NOT NULL DEFAULT 'EM_ANDAMENTO';