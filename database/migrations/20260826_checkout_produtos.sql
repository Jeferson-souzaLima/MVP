-- Checkout de produtos: execute uma vez, antes de publicar a funcionalidade.
USE petcare;

CREATE TABLE IF NOT EXISTS pagamentos (
  id INT NOT NULL AUTO_INCREMENT,
  tipo_referencia ENUM('pedido', 'agendamento') NOT NULL,
  referencia_id INT NOT NULL,
  gateway VARCHAR(40) NOT NULL,
  gateway_preference_id VARCHAR(120) NULL,
  gateway_payment_id VARCHAR(120) NULL,
  status ENUM('pendente', 'aprovado', 'recusado', 'cancelado', 'expirado') NOT NULL DEFAULT 'pendente',
  valor DECIMAL(10,2) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_pagamentos_gateway_payment_id (gateway_payment_id),
  KEY idx_pagamentos_referencia (tipo_referencia, referencia_id)
);

ALTER TABLE lojas
  ADD COLUMN IF NOT EXISTS entrega_ativa TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxa_entrega_fixa DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxa_entrega_por_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS raio_entrega_km DECIMAL(7,2) NOT NULL DEFAULT 10;

UPDATE pedidos
SET status = 'aguardando_pagamento'
WHERE status = 'pendente';

ALTER TABLE pedidos
  MODIFY COLUMN status ENUM('aguardando_pagamento', 'pago', 'em_preparo', 'pronto_para_retirada', 'em_entrega', 'entregue', 'cancelado') NOT NULL DEFAULT 'aguardando_pagamento',
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_entrega DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS modalidade_entrega ENUM('retirada', 'entrega') NOT NULL DEFAULT 'retirada',
  ADD COLUMN IF NOT EXISTS nome_contato VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS telefone_contato VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS cep_entrega VARCHAR(9) NULL,
  ADD COLUMN IF NOT EXISTS endereco_entrega VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS numero_entrega VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS complemento_entrega VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS bairro_entrega VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS cidade_entrega VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS uf_entrega CHAR(2) NULL,
  ADD COLUMN IF NOT EXISTS observacao VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS reserva_expira_em DATETIME NULL,
  ADD COLUMN IF NOT EXISTS cancelado_em DATETIME NULL;
