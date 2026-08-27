# AGENTS.md

# PetCare Connect — Guia Oficial para Agentes de IA

> Este documento define como agentes de IA devem atuar durante o desenvolvimento do PetCare Connect.
>
> Ele deve ser considerado a principal referência para qualquer implementação realizada por IA.

# Prioridade das instruções

Em caso de conflito:

1. Solicitação do usuário.
2. Este arquivo (AGENTS.md).
3. Convenções existentes no código.
4. Preferências gerais da ferramenta de IA.

Sempre respeitar esta ordem.

---

# 1. Sobre o Projeto

## Nome

PetCare Connect

## Objetivo

Desenvolver uma plataforma capaz de conectar clientes, pet shops, clínicas veterinárias e demais estabelecimentos do mercado pet.

O foco atual é entregar um **MVP comercialmente funcional**, preparado para evoluir futuramente sem necessidade de grandes refatorações.

Todo código produzido deve priorizar:

- simplicidade;
- segurança;
- estabilidade;
- reutilização;
- manutenção.

---

# 2. Filosofia do Projeto

Este projeto segue alguns princípios fundamentais.

## Simplicidade

Sempre prefira a solução mais simples que resolva corretamente o problema.

Não implemente complexidade desnecessária.

---

## Evolução Incremental

O projeto cresce por pequenas entregas.

Nunca reestruture grandes partes do sistema sem autorização explícita.

---

## Baixa Dívida Técnica

Toda implementação deve reduzir ou manter a dívida técnica.

Nunca criar soluções temporárias apenas para "fazer funcionar".

---

## Consistência

O comportamento do sistema deve permanecer consistente.

Novas implementações devem seguir o padrão já existente.

---

## Segurança

Segurança possui prioridade maior do que velocidade de desenvolvimento.

---

# 3. Fluxo Oficial de Desenvolvimento

Toda tarefa deve seguir obrigatoriamente esta sequência.

1. Auditoria
2. Planejamento
3. Implementação
4. Testes
5. Revisão

Nunca pular etapas.

Antes de modificar qualquer módulo:

- entender sua implementação atual;
- identificar impactos;
- reutilizar código existente sempre que possível.

---

# 4. Arquitetura

## Backend

- Node.js
- Express
- MySQL

## Frontend

- React

A arquitetura existente deve ser preservada.

Não criar novas camadas arquiteturais sem autorização.

---

# 5. Estrutura Geral

Sempre respeitar a separação entre:

Backend

- Controllers
- Models
- Routes
- Middlewares
- Config
- Services (caso existam futuramente)

Frontend

- Pages
- Components
- Services
- Hooks
- Context

Não mover arquivos entre módulos sem necessidade.

---

# 6. Escopo

Este projeto está focado exclusivamente no MVP.

Evite implementar funcionalidades futuras sem autorização.

Sempre desenvolver apenas o que foi solicitado.

---

# 7. Reutilização

Antes de criar qualquer código novo:

- procurar implementações semelhantes;
- verificar controllers;
- verificar models;
- verificar middlewares;
- verificar componentes React.

Nunca duplicar lógica.

Sempre reutilizar.

---

# 8. Banco de Dados

Evitar alterações estruturais desnecessárias.

Nunca:

- duplicar informações;
- criar tabelas redundantes;
- criar colunas que representem informações já existentes.

Toda alteração estrutural deve possuir justificativa técnica.

---

# 9. API

Seguir REST.

Utilizar corretamente:

GET

POST

PUT

PATCH

DELETE

Retornar códigos HTTP corretos.

Responder JSON quando aplicável.

---

# 10. Segurança

Toda entrada deve ser validada.

Sempre validar:

- req.body
- req.params
- req.query

Nunca confiar apenas nas validações do frontend.

Sempre validar:

- autenticação;
- autorização;
- ownership dos registros.

Evitar vulnerabilidades como:

- IDOR
- SQL Injection
- exposição de dados sensíveis
- alteração indevida de registros

Sempre utilizar transações quando houver múltiplas alterações relacionadas.

---

# 11. Frontend

Priorizar reutilização de componentes.

Evitar lógica de negócio complexa no frontend.

Sempre considerar que validações críticas pertencem ao backend.

---

# 12. Tratamento de Erros

Nunca ignorar erros.

Nunca utilizar blocos vazios.

Retornar mensagens claras.

Preservar estabilidade da aplicação.

Registrar erros quando necessário.

---

# 13. Qualidade do Código

Priorizar:

- legibilidade;
- clareza;
- baixo acoplamento;
- responsabilidade única;
- reutilização.

Evitar:

- funções muito grandes;
- duplicação;
- comentários desnecessários;
- código morto.

---

# 14. Comunicação

Antes de alterações relevantes:

Explicar:

- problema encontrado;
- solução proposta;
- impacto esperado.

Depois implementar.

Nunca modificar silenciosamente grandes partes do projeto.

---

# 15. O que Nunca Fazer

Nunca:

- alterar arquitetura sem autorização;
- remover validações de segurança;
- alterar autenticação sem necessidade;
- modificar banco de dados sem justificativa;
- criar funcionalidades duplicadas;
- quebrar compatibilidade;
- criar código apenas para "funcionar".

---

# 16. Contexto do Produto

O PetCare Connect possui atualmente três perfis.

## Cliente

Pode:

- cadastrar conta;
- cadastrar pets;
- comprar produtos;
- contratar serviços;
- realizar agendamentos;
- acompanhar pedidos.

---

## Lojista

Pode:

- cadastrar sua loja;
- cadastrar produtos;
- cadastrar serviços;
- administrar pedidos;
- administrar agendamentos.

---

## Administrador

Pode:

- aprovar lojas;
- administrar usuários;
- administrar pedidos;
- administrar pagamentos;
- administrar agendamentos;
- administrar suporte.

---

# 17. Decisões Arquiteturais Oficiais

As decisões abaixo são permanentes até que sejam alteradas oficialmente.

## Usuários

O sistema utiliza apenas:

tipo

para definir:

- cliente
- lojista
- administrador

Não utilizar "papel".

---

## Produtos

Produtos suportam múltiplas imagens.

Uma imagem pode ser definida como principal.

Uploads são protegidos por autenticação.

---

## Segurança

Toda alteração de dados deve validar ownership.

Nunca confiar apenas em IDs enviados pelo frontend.

---

## Desenvolvimento

Este projeto é desenvolvido de forma incremental.

Auditorias fazem parte do processo.

Evite grandes refatorações.

---

# 18. Objetivo Final

O objetivo da IA não é apenas escrever código.

O objetivo é preservar a qualidade do projeto.

Toda implementação deve deixar o sistema:

- mais organizado;
- mais seguro;
- mais consistente;
- mais reutilizável;
- preparado para crescimento futuro.

Sempre priorizar qualidade ao invés de velocidade.