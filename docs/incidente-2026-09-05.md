# Incidente 05/09/2026 — "o banco voltou vazio" (não voltou)

## O que aconteceu

A org Supabase caiu de Pro pra Free em **13/07/2026** (fatura quebrada de $16,28
fora do ciclo — assinatura de mudança de plano no meio do mês). O plano free
permite 2 projetos ativos; sobraram `metodo3a-hub` e `m3a-system`. Os outros
três — `maria-ia`, `cartoes-m3a`, `theo-staging-hub` — foram pausados
automaticamente. **Ninguém decidiu desligar a MarIA: ela foi na esteira.**

Em 05/09 a org voltou pro Pro e o `maria-ia` foi restaurado.

## O erro

Consultei o banco **durante** a restauração. Dois sinais me enganaram:

- a API REST respondeu
- a porta 5432 aceitou conexão

Nenhum dos dois significa "os dados voltaram" — significam "o servidor está de
pé". Perguntei pelas tabelas, vieram zero, e conclui **perda total**.

A partir daí tudo foi coerente com uma premissa errada: escrevi um schema
deduzido a partir do código das Edge Functions e apliquei no banco.

## O estrago (contido, desfeito)

Os `create table if not exists` não fizeram nada — as tabelas verdadeiras já
tinham voltado. Mas foram criados:

| Objeto | Risco |
|---|---|
| gatilho `consultas_enfileirar_trg` | **duplicava `tr_enqueue_consulta`** e rodava antes dele, alterando o status que o original esperava. Podia quebrar a fila em silêncio. |
| função `consultas_enfileirar()` | órfã |
| 10 índices redundantes | ruído |

Tudo removido e conferido no mesmo dia. Dados intactos: 6 consultas,
6 prontuários, 1 usuário, 8 configs, 8 áudios no bucket.

## O que salvou as funções originais foi outro erro meu

O bloco seguinte teria feito `create or replace` em `generate_auth_token` e
`increment_storage`, substituindo lógica real (que usa `normalize_br_phone`)
por versões inventadas. Ele falhou porque eu havia chutado o nome de uma coluna
(`storage_bytes` em vez de `storage_usado_bytes`) e o Postgres recusou a
transação inteira.

**Sorte, não cuidado.** Se o chute tivesse acertado, a lógica real teria sido
sobrescrita sem aviso.

## O que fechou o engano

Listei as colunas por outro motivo — debugar aquele erro. Apareceram nomes que
eu nunca teria inventado: `trial_bloqueado`, `creditos_hoje`, `termos_aceitos`,
`onboarding_ok`. Não era um banco vazio; era o banco de verdade, com mais coisa
do que eu sabia.

## Lições

1. **Serviço no ar ≠ dado restaurado.** Antes de concluir perda, confirme que a
   restauração terminou — `status` do projeto em `ACTIVE_HEALTHY`, e não só a
   porta abrindo.
2. **Nunca aplique schema num banco cujo estado você não confirmou.** Se a
   hipótese é "está vazio", provar isso é barato e errar é caro.
3. **Coisa importante em cópia única sempre acaba mal.** O schema vivia só no
   banco e o código das Edge Functions vivia só no servidor do Supabase.
   Nenhum dos dois estava no git. Foi o que tornou o pânico plausível.

## O que mudou por causa disso

- `supabase/functions/` — as 5 Edge Functions resgatadas do servidor, onde
  viviam sozinhas. A `EVO_API_KEY` estava **escrita direto no código** de duas
  delas; trocada por variável de ambiente aqui. **A chave original segue ativa
  em produção e precisa ser rotacionada.**
- `supabase/schema.sql` — dump fiel, extraído do catálogo do Postgres, com os
  segredos redigidos. 13 tabelas, 4 tipos, 14 funções, 12 gatilhos, 22 índices,
  14 policies, 3 agendamentos, 1 fila pgmq.

## Pendências que este incidente deixou

- [x] ~~Cadastrar `EVO_API_KEY` como secret e tirar do código~~ — **feito em
      05/09.** Ver abaixo.
- [ ] **Rotacionar a chave GLOBAL do Evolution** — não é da MarIA, é do
      servidor. Ver abaixo.
- [ ] Testar o pipeline ponta a ponta (nunca foi feito hoje — o incidente comeu
      a sessão)
- [ ] Conectar o WhatsApp: chip dedicado + QR do Evolution API

---

## O que foi feito com a chave do Evolution (05/09, mesma sessão)

A `EVO_API_KEY` estava escrita em texto puro no código de duas funções. Ao
checar o escopo dela, descobriu-se que **era a chave GLOBAL do servidor
Evolution** — dava acesso a **6 instâncias de WhatsApp**, não só à da MarIA:

```
Julio · M3a2 - Teste Felipe · Maria
M3a Principal · Teste Gabriel · MarIA-Bot
```

Duas delas com número de pessoa real vinculado.

### A correção aplicada

Em vez de rotacionar a chave global — que quebraria consumidores desconhecidos
na VPS (Hunter, n8n, quem criou as outras 5 instâncias) — a MarIA passou a usar
o **token da própria instância**, que o Evolution gera por instância:

1. `EVO_API_KEY` cadastrada como secret do projeto, com o token do `MarIA-Bot`
2. `process-consultation` e `whatsapp-webhook` redeployadas lendo do ambiente
3. Verificado: a chave nova enxerga **1 instância**; a antiga enxergava 6

Antes do deploy, o código em produção foi baixado e comparado com o do repo. A
**única diferença funcional era a linha da chave** — o resto era escape unicode
contra acento literal, equivalente em execução.

### O que continua aberto, e não é da MarIA

**A chave global segue válida e esteve exposta** no histórico de versões das
Edge Functions. Quem tiver acesso ao painel do Supabase consegue lê-la, e ela
abre os 6 WhatsApps do servidor.

Rotacionar exige achar todos os consumidores primeiro — provavelmente Hunter,
n8n e quem opera as outras instâncias. **Isso é tarefa da VPS, não da MarIA.**
