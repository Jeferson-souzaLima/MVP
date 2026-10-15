-- Keep the existing multi-image product feature compatible with fresh and existing schemas.
SET @produtoimagens_principal_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'produtoimagens'
    AND COLUMN_NAME = 'principal'
);

SET @produtoimagens_principal_ddl = IF(
  @produtoimagens_principal_exists = 0,
  'ALTER TABLE produtoimagens ADD COLUMN principal TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1'
);

PREPARE produtoimagens_principal_stmt FROM @produtoimagens_principal_ddl;
EXECUTE produtoimagens_principal_stmt;
DEALLOCATE PREPARE produtoimagens_principal_stmt;

-- Select a main image for products that have images but none selected.
UPDATE produtoimagens AS pi
JOIN (
  SELECT produto_id, MIN(id) AS imagem_id
  FROM produtoimagens
  GROUP BY produto_id
  HAVING MAX(principal) = 0
) AS primeira_imagem ON primeira_imagem.imagem_id = pi.id
SET pi.principal = 1;
