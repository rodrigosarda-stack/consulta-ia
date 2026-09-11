# Auditoria de código contra a especificação — 11/09/2026

Quatro agentes leram as 2.086 linhas de `src/` e `supabase/functions/` com uma pergunta só:
**o código faz o que a especificação diz que está pronto?** Regra: todo veredito vem com a
linha de código que prova.

> **Contexto que explica metade dos achados:** as edge functions carregam o comentário
> "RESGATADO do Supabase em 05/09/2026 (versão deployada em **abril/2026**). Este código NUNCA
> esteve no git." O código é de cinco meses antes da spec. Nenhuma emenda de 24 a 43 poderia
> estar nele.

## 🔴 Aberto em produção, resolver primeiro

### 1. O webhook do WhatsApp não verifica nada. Qualquer um manda mensagem pelo bot.
`supabase/functions/whatsapp-webhook/index.ts:187-230` — `Deno.serve` lê `req.json()` sem checar
header, token, segredo ou assinatura. Não há `Authorization`, não há HMAC, não há checagem de IP.

Quem descobrir a URL (padrão previsível `*.supabase.co/functions/v1/whatsapp-webhook`) pode, sem
credencial nenhuma, forjar `event: "messages.upsert"` e:
- fazer o bot **enviar WhatsApp real para qualquer número** (`sendMessage`, linhas 20-32, chamada
  em 84, 103, 112, 128, 141);
- **criar usuários** no banco com telefone arbitrário (`getOrCreateUser`, linhas 61-67).

É o único dos três endpoints sem autenticação: `auth-token` exige token de uso único e
`validar-conselho` exige `X-Session-Token`.

### 2. A chave da Evolution API segue ativa e exposta
`whatsapp-webhook/index.ts:14-16` — o próprio comentário do arquivo confessa: a `EVO_API_KEY`
estava fixada em código na versão que rodou desde abril, virou variável de ambiente só no resgate,
e **a chave original continua ativa em produção, sem rotação**. Ação do Rodrigo, não minha.

### 3. Cobrança sem webhook: ninguém é rebaixado ao deixar de pagar
`supabase/functions/api/index.ts:498-527` cria cliente e assinatura no Asaas e grava
`status: "pending"`. **Não existe nenhuma função que receba retorno do Asaas** — procurado no
diretório inteiro. Se a cobrança falha, expira ou é recusada, nada atualiza o plano nem o status.
Fica "pending" para sempre. Hoje não dá para saber quem pagou.

## 🟠 Errado, e silencioso

### 4. O CFM sai do ar e um médico real fica barrado por 30 dias
`validar-conselho/index.ts:56-57, 78-81, 93, 109-112` tratam indisponibilidade externa e "CRM não
existe" como o **mesmo** `{valido:false}`. E o resultado vai para o cache (linhas 170-182) **sem
checar se é falso negativo**, com validade de 30 dias (linha 156). O CFM cai dez minutos, o médico
tenta validar, recebe "não validado", e a mentira dura um mês.

### 5. A cegueira que causou o incidente de setembro continua
A cascata do Gemini está correta hoje (`process-consultation/index.ts:122`:
`["gemini-3.7-flash","gemini-3.8-flash","gemini-3.5-flash"]`, commit 150df98). Mas **em nenhum
ponto o código distingue 404 de modelo desativado de erro transitório.** Foi exatamente assim que
dois modelos mortos passaram meses despercebidos.

Dois modelos ainda estão fixados **sem fallback nenhum**:
- `process-consultation/index.ts:133` — `claude-haiku-4-5-20251001` (falha seca);
- `api/index.ts:49` — `MODELO_ETIQUETAS = "gemini-3.1-flash-lite"` (degrada em silêncio marcando
  tudo como clínico).

E `api/index.ts:56` declara `WHISPER_BARATO` que **não é usado em lugar nenhum** — o motor de
espera mais barato não está ligado a caminho de código algum.

### 6. Não há registro de qual modelo respondeu no vigia e nas etiquetas
Existe para o prontuário (`process-consultation/index.ts:162`) e por pedaço
(`api/index.ts:308`). Não existe para `monitorarConsulta` nem `etiquetarPedacos` — se o vigia
começar a errar, não dá para saber qual modelo respondeu.

### 7. Não existe teste automatizado da régua
Procurado `Deno.test`, `describe(`, `it(`, `assert` no repositório inteiro: nada. Os cinco termos
e a confissão do remédio foram medidos à mão, 167 vezes. Se alguém trocar o modelo amanhã, nada
roda a régua nem avisa.

## 🟡 O código contradiz decisão vigente

### 8. Os preços não batem com nada
`api/index.ts:20` — `PLANO_PRECOS = { maria: 4700, cerebro: 9700 }`. A escada vigente é Rápido
R$ 27, Pro R$ 77 e Cérebro em aberto (~297). **Não existe plano "Rápido" no código.** O R$ 47 é
resquício de janeiro. As cotas também divergem: `Planos.jsx:23,44,62` falam em GB de áudio, a spec
fala em consultas.

### 9. O médico grátis é barrado por completo no painel
`api/index.ts:493-495` — três rotas devolvem `paywall:true` para qualquer `plano==="free"`. A
emenda 37 promete painel aberto pelo saldo de entrada. É mais restritivo até que a regra das 25
consultas, que foi derrubada. Um médico que acabou de gravar a primeira consulta não vê nada.

### 10. Exportação só para quem paga
`Painel.jsx:98-127` exporta **um** prontuário por vez, em PDF, e só depois do paywall. A decisão 24
manda exportação em todo plano, em lote e em JSON, e também do lado do paciente. Nada disso existe.

### 11. Decisão 28 não tem uma linha de código
Procurado `dependente`, `secretaria`, `passkey`, `chip`, `72`: zero ocorrências. A tabela `usuarios`
só tem telefone, nome, plano e conselho.

### 12. A validação de CRP não existe
`validar-conselho/index.ts:140-142` rejeita qualquer conselho fora de CRM e CRO. A §10 da spec diz
"validação CRM-CRO-CRP" entre as coisas prontas. Falta o CRP inteiro.

### 13. O produto ainda se chama MarIA na tela do médico e do paciente
A decisão 1 permite MarIA em código e URL, não em texto visível.
`Planos.jsx:33,58` (nome do plano), `Painel.jsx:89` (botão), `App.jsx:42,103` (erro e login),
`process-consultation/index.ts:176,189` e `whatsapp-webhook/index.ts:86,113,116,129,132,176`
(mensagens que o médico e o paciente leem).

## 🔵 Arquitetura que não bate com o plano

### 14. O bot usa Evolution API, não a API oficial da Meta
`whatsapp-webhook/index.ts:14` — `EVO_URL = "https://evo.metodo3amedico.com.br"`, instância
`MarIA-Bot`. É protocolo do WhatsApp Web, não a Cloud API.

**Isso derruba uma conta inteira da spec.** A decisão 22 e o §8b calculam R$ 0,037 por mensagem e
o fim da janela grátis de 24 h em 01/10/2026 — números da Meta, que **não se aplicam** à Evolution.
Ou o custo do canal está errado no plano, ou a arquitetura vai mudar. Os dois não podem estar certos.

### 15. O fingerprint sobrevive à limpeza de dados, sem consentimento
`src/lib/fingerprint.js:10-21, 47, 56-61, 68` — persiste em localStorage, sessionStorage e cookie,
e **recompõe o mesmo identificador** a partir de sinais de hardware quando o usuário limpa. O
comentário do próprio arquivo assume: "mesmo dispositivo com localStorage limpo gera o mesmo hash".
Não há gate de consentimento antes de `getDeviceId()`.

### 16. Não existe registro de aceite dos Termos
Nenhuma coluna de data ou versão de texto aceito em `usuarios`. A §10 já lista os links como
pendentes; o registro auditável do aceite não é nem mencionado.

## ✅ O que passou limpo

O **gravador** passou nos seis itens, com prova de código: pedaços cortados na pausa
(`gravador.js:306-307`, critério escalonado em 209-210), pré-roll de 0,5 s (`gravador.js:339-361`),
silêncio nem gravado nem cobrado (`gravador.js:247, 271-277, 293-297`), fila no IndexedDB gravando
**antes** de tentar enviar (`gravador.js:114-115`), retomada após fechar o navegador
(`Recorder.jsx:82, 290-309`) e vigia por evento, sem polling.

Também existem, com prova: motor de transcrição trocável por config (`api/index.ts:66-70`, linha
real no `schema.sql:577`), Whisper de reserva, etiquetas clínico/conversa com fallback seguro
(`api/index.ts:156-185`), e o campo "O QUE EU INTERPRETEI" no prompt e no JSON
(`process-consultation/index.ts:61-69, 79`).

**Duas ressalvas do gravador:** o `BITRATE = 24_000` (`Recorder.jsx:12`) é ignorado pelo Safari no
iPhone, que grava a ~50 kbps, e nada detecta isso em tempo de execução; e `PEDACO_MIN_MS = 20_000`
embute a política de cobrança mínima do Groq como constante de negócio.

## Prioridade decidida (Rodrigo, 11/09)

Atacar primeiro o item 1 (webhook do WhatsApp sem autenticação) — é o único dos 16 achados
explorável por qualquer pessoa agora, sem credencial nenhuma. Os itens 2 e 3 (chave da Evolution
exposta e Asaas sem webhook) seguem na fila logo depois.
