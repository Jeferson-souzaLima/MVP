-- Execute uma única vez no banco de dados petcare antes de usar este fluxo.
-- Usuários existentes são mantidos como confirmados para não perderem acesso.
ALTER TABLE usuarios
    ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0 AFTER senha_hash,
    ADD COLUMN email_verificacao_token_hash CHAR(64) NULL AFTER email_verificado,
    ADD COLUMN email_verificacao_expira_em DATETIME NULL AFTER email_verificacao_token_hash;

UPDATE usuarios
SET email_verificado = 1;
