# MARIA - ESPECIFICAÇÃO COMPLETA DO PRODUTO

**Versão:** 2.0  
**Data:** Janeiro 2026  
**Documento unificado de todas as decisões estratégicas e técnicas**

---

## ÍNDICE

1. Visão Geral
2. Produto via WhatsApp
3. Estrutura de Custos (Modelo Academia)
4. Sistema de Trial e Créditos
5. O Usuário FREE como Ativo de Mídia
6. Sistema de Convites (Viral)
7. Onboarding
8. Scripts de Conversação da IA
9. Filtro de Uso Pessoal
10. Estrutura de Planos
11. Backup de Áudios
12. Os 5 Perfis de Usuário
13. Modelo Financeiro
14. Requisitos Técnicos
15. Compliance e LGPD
16. Investimento e Cronograma
17. Resumo de Decisões

---

## 1. VISÃO GERAL

### O que é

MarIA é uma IA via WhatsApp que transcreve consultas de profissionais de saúde e gera prontuários estruturados automaticamente.

### Proposta de valor

**"Grava a consulta, prontuário sai pronto."**

### Mercado-alvo

Profissionais de saúde: médicos, dentistas, psicólogos, fisioterapeutas, nutricionistas, fonoaudiólogos, terapeutas ocupacionais, enfermeiros e outros.

### Economia de tempo

| Situação | Tempo por paciente |
|----------|-------------------|
| Antes | 30 min (20 consulta + 10 escrevendo) |
| Com MarIA | 21 min (20 gravando + 1 revisando) |
| **Economia** | **9 min/paciente = 1h30/dia = 30h/mês** |

---

## 2. PRODUTO VIA WHATSAPP

### Por que WhatsApp (não app)

- Zero instalação
- Zero cadastro
- Zero email/senha — a "conta" é o número de telefone
- Médico já sabe gravar áudio
- Funciona offline (WhatsApp salva e envia depois)

### Como funciona

1. Médico clica no link e grava a consulta
2. IA transcreve (Whisper no servidor próprio)
3. IA estrutura em prontuário (LLM)
4. IA devolve prontuário no WhatsApp
5. IA manda por email também (se cadastrado)

---

## 3. ESTRUTURA DE CUSTOS (MODELO ACADEMIA)

### Filosofia: Academia, não Táxi

| Modelo | Como funciona | Implicação |
|--------|---------------|------------|
| **Táxi (API)** | Paga por corrida/consulta | Quanto mais usa, mais custa |
| **Academia (Servidor)** | Paga aluguel fixo | Use quanto quiser, custo fixo |

**MarIA usa modelo Academia.** Alugamos servidores GPU e rodamos quantas consultas quiser.

### Custos reais

| Item | Valor |
|------|-------|
| Servidor GPU (RTX 4090) | R$ 300/mês |
| Capacidade | ~55 médicos ativos |
| **Custo por médico ativo** | **~R$ 5,45/mês** |
| Custo com margem segurança | ~R$ 10/mês |

### Custo por período de uso

| Período | % do mês | Custo real |
|---------|----------|------------|
| 1 dia | 3,3% | R$ 0,33 |
| 3 dias | 10% | R$ 1,00 |
| 5 dias | 16,7% | R$ 1,67 |
| 7 dias | 23,3% | R$ 2,33 |
| 1 mês | 100% | R$ 10,00 |

### Implicação estratégica

**Qualquer trial até 7 dias custa menos de R$ 2,50.** A decisão de duração do trial é 100% estratégica, não financeira.

---

## 4. SISTEMA DE TRIAL E CRÉDITOS

### Estrutura em 3 camadas

| Camada | Quando | O que ganha | Custo |
|--------|--------|-------------|-------|
| **Trial inicial** | Primeira vez | 3 dias ilimitados | R$ 1,00 |
| **Modo diário** | Após trial | 3 transcrições/dia | R$ 1,50/mês |
| **Boost indicação** | Quando indica | +3 dias ilimitados | R$ 1,00 |

### Curva de engajamento

| Dia | Estado emocional | Comportamento |
|-----|------------------|---------------|
| 1 | Curiosidade | "Vou testar isso" |
| 2 | Surpresa positiva | "Caramba, funciona!" |
| **3** | **PICO DE EMPOLGAÇÃO** | **"Não consigo mais viver sem"** |
| 4 | Conforto | "Já faz parte da rotina" |
| 5 | Acomodação | "Tranquilo, tenho tempo" |
| 6-7 | Relaxamento | "Depois eu vejo isso" |

**Decisão: Cortar no dia 3 (pico de empolgação).**

### Por que 3 transcrições/dia após trial?

- Médico típico: 15-20 consultas/dia
- Com 3/dia: resolve 15-20% do problema
- Suficiente para criar hábito forte
- Insuficiente para resolver a vida
- Mantém ele conectado para sempre
- **Custo baixíssimo: R$ 1,50/mês**

### Mecânica do boost por indicação

- **Quanto ganha:** +3 dias ilimitados
- **Quando credita:** Quando indicado FAZ PRIMEIRA TRANSCRIÇÃO
- **Por que assim:** Evita gaming (contas fake)

### Fluxo visual

```
ENTRA → 3 dias grátis → GOSTA → acaba → 
→ 3/dia (conectado) → indica → +3 dias → 
→ repete 3-6x → ou paga ou vira FREE perpétuo
```

---

## 5. O USUÁRIO FREE COMO ATIVO DE MÍDIA

### Mudança de mentalidade

| Visão antiga | Visão nova |
|--------------|------------|
| FREE = custo a minimizar | FREE = ativo a cultivar |
| Converter rápido ou abandonar | Manter conectado para sempre |
| Limite baixo pra forçar upgrade | Limite generoso pra viciar |

### O que o usuário FREE te dá

1. **Canal de comunicação direto**
   - WhatsApp com 99% de abertura
   - Não é email que vai pro spam

2. **Potencial de indicação perpétua**
   - Cada vez que precisa de mais, indica
   - Mesmo free indica outros free

3. **Data de comportamento**
   - Sabe o que ele atende, quando, quanto
   - Insumo para produtos futuros

4. **Conversão futura**
   - Vida muda, clínica cresce
   - Um dia precisa de mais
   - Você já está instalado na rotina dele

5. **Prova social**
   - "50.000 médicos usam MarIA"
   - Não importa se pagam ou não

### Comparação com mídia tradicional

| Canal | Custo/contato/mês | Qualidade |
|-------|-------------------|-----------|
| Email marketing | R$ 0,01-0,05 | Frio, 20% abre |
| WhatsApp broadcast | R$ 0,10-0,50 | Morno, 60% abre |
| Remarketing Meta | R$ 0,50-2,00 | Interrupção |
| **Usuário FREE MarIA** | **R$ 1,50** | **Engajado, usa todo dia** |

### Cálculo do valor do usuário FREE

| Métrica | Valor |
|---------|-------|
| Custo do FREE | R$ 1,50/mês |
| Indicações/mês (média) | 0,5 |
| Taxa de teste | 30% |
| Taxa de conversão | 7% |
| Pagantes gerados/mês | 0,0105 |
| LTV do pagante | R$ 2.000 |
| **Valor gerado/mês** | **R$ 21** |
| **LUCRO por FREE** | **R$ 19,50/mês** |
| **ROI** | **1.300%** |

### Conclusão

**O usuário FREE não é custo. É investimento com ROI de 1.300%.**

Estratégia: **Maximizar a base FREE, não minimizar.**

---

## 6. SISTEMA DE CONVITES (VIRAL)

### Mecânica

O convite é uma mensagem de WhatsApp com link que contém o número do indicador como "código".

### Fluxo

```
Dr. João (5548999144325) quer indicar
        ↓
IA gera mensagem para ele encaminhar:

"🩺 Cansou de perder tempo escrevendo prontuário?

Testa o MarIA - grava a consulta e o 
prontuário sai pronto em 2 minutos.

3 dias grátis pra testar:
👉 [wa.me/5511999999999?text=Quero testar 
   o MarIA - Indicado por 5548999144325]"
        ↓
Dr. João encaminha para Dra. Maria
        ↓
Dra. Maria clica → WhatsApp abre com mensagem pronta
        ↓
Dra. Maria envia a mensagem
        ↓
IA recebe, extrai "5548999144325" do texto (regex)
        ↓
Registra vínculo: Dra. Maria indicada por Dr. João
        ↓
Quando Dra. Maria transcrever 1 consulta:
→ Dr. João ganha +3 DIAS ILIMITADOS
```

### Vantagens

- Zero desenvolvimento de sistema de convites
- O "código" é o telefone que já existe
- Funciona com infraestrutura do WhatsApp
- Médico só encaminha, não precisa explicar nada
- Custo por indicação que testa: R$ 1,00

---

## 7. ONBOARDING

### Princípio

**Zero fricção.** Usuário tem que gravar primeira consulta em menos de 5 minutos.

### Fluxo completo

**Passo 1 - Boas-vindas e salvar contato:**
```
IA: "Oi! 👋 Eu sou a MarIA.
     Transcrevo suas consultas e entrego o 
     prontuário pronto em minutos.
     
     🚨 SEM ISSO NÃO FUNCIONA:
     Salva meu contato agora na sua agenda.
     
     Me avisa quando salvar."
```

**Passo 2 - Email (opcional):**
```
IA: "Se quiser, me passa seu email 
     que mando os prontuários lá também.
     
     (Ou responde PULAR)"
```

**Passo 3 - Aceite dos termos (discreto):**
```
IA: "Para começar, basta concordar com os 
     termos (link) e dizer INICIAR"
```

**Passo 4 - Pronto:**
```
IA: "Pronto! 🎉
     
     Você tem 3 DIAS ILIMITADOS pra testar.
     
     Clica aqui pra gravar sua primeira consulta:
     👉 [LINK DE GRAVAÇÃO]
     
     É só gravar e eu devolvo o prontuário em 2 minutos."
```

### Regras críticas

- NÃO avança até confirmar que salvou o contato
- Aceite dos termos é discreto (uma linha só)
- Email é opcional
- Primeira gravação deve acontecer na primeira sessão

---

## 8. SCRIPTS DE CONVERSAÇÃO DA IA

### Após primeira transcrição (explicando o modelo)

```
IA: "Aqui está seu prontuário! ✅

     [prontuário formatado]
     
     📊 Como funciona o MarIA:
     
     Você tem 3 DIAS ILIMITADOS pra testar.
     Depois: 3 transcrições grátis por dia.
     
     Quer mais? Indica colegas e ganha 
     +3 DIAS por cada um que testar.
     
     Ou assina o MarIA por R$ 147/mês 
     e esquece limite pra sempre."
```

### Último dia do trial

```
IA: "⏰ Seu trial acaba hoje!
     
     Você fez 32 transcrições nesses 3 dias.
     Economizou 5h20 de digitação.
     
     A partir de amanhã: 3 transcrições/dia.
     
     O que quer fazer?
     
     1️⃣ Indicar colega → +3 dias grátis
     2️⃣ Assinar → R$ 147/mês ilimitado
     
     [INDICAR] [ASSINAR]"
```

### Primeira vez que acaba no modo diário

```
IA: "Suas 3 transcrições de hoje acabaram.
     
     Amanhã você ganha mais 3.
     
     Quer resolver isso agora?
     
     → Indica 1 colega = +3 dias grátis
     → Assina = nunca mais se preocupa
     
     [INDICAR] [ASSINAR R$ 147]"
```

### Quando indicado testa (bônus recebido)

```
IA: "🎉 Dr. Carlos testou o MarIA!
     
     Você ganhou +3 DIAS ILIMITADOS.
     Válido até: 15/01/2026
     
     Continue indicando - cada teste = +3 dias!"
```

### Mensagem para encaminhar (indicação)

```
🩺 Cansou de perder tempo escrevendo 
prontuário na mão?

Testa o MarIA - grava a consulta e o 
prontuário sai pronto em 2 minutos.

3 dias grátis pra testar:
👉 [LINK COM NÚMERO DO INDICADOR]
```

### Boost prestes a vencer

```
IA: "⚡ Seus dias extras acabam amanhã!
     
     Depois volta pra 3 transcrições/dia.
     
     Quer mais +3 dias? Indica outro colega.
     Quer resolver de vez? Assina por R$ 147.
     
     [INDICAR] [ASSINAR]"
```

### Oferta de upgrade (após 30 dias de uso)

```
IA: "Você já fez 247 transcrições esse mês! 📊
     
     Tá indicando bastante! Mas e se você 
     não precisasse mais se preocupar com isso?
     
     MarIA Ilimitado: R$ 147/mês
     ✓ Transcrições ilimitadas
     ✓ Histórico completo
     ✓ Sem pedir indicação nunca mais
     
     [QUERO ILIMITADO]"
```

---

## 9. FILTRO DE USO PESSOAL

### Problema

Se abrir para qualquer pessoa, curiosos usam sem pagar e métricas ficam ruins.

### Solução

IA analisa o conteúdo do áudio e classifica: **PROFISSIONAL** ou **PESSOAL**.

### Fluxo se detectar uso pessoal

```
IA analisa → É pessoal
        ↓
IA: "Aqui está sua transcrição! ✅

     [transcrição]
     
     Essa foi por nossa conta 🎁
     
     O MarIA é gratuito para profissionais de saúde.
     Para uso pessoal, as próximas custam R$ X."
```

**Regra: Entrega a primeira grátis, cobra as próximas.**

---

## 10. ESTRUTURA DE PLANOS

### Planos de Assinatura

| Plano | Preço | Recursos |
|-------|-------|----------|
| **FREE** | R$ 0 | 3 dias trial + 3/dia depois |
| **MarIA** | R$ 147/mês | Transcrição ilimitada + Histórico |
| **Cérebro** | R$ 247/mês | Tudo MarIA + 5k créditos IA avançada + RAG |
| **Cérebro Pro** | R$ 397/mês | Tudo Cérebro + IA mais avançada (Opus) |

### Regra dos Pools Separados

- **Transcrição:** Sempre no limite do plano (3/dia FREE ou ilimitado pago)
- **Créditos IA:** Só consome ao conversar com Cérebro

### Upgrade do MarIA para Cérebro

- 11% dos pagantes MarIA fazem upgrade
- Timing: 8% no mês 2, 2% no mês 3, 1% no mês 4

---

## 11. BACKUP DE ÁUDIOS

### Conceito

Opção paga para guardar os áudios originais como proteção jurídica.
**Sem backup: áudio é apagado em 24h.**

### Mensagem de venda

```
"Por menos de 1 centavo por consulta, você 
guarda o áudio original de tudo que gravou.

Se algum dia um paciente questionar algo, 
você tem a prova.

Não precisa ser sua palavra contra a dele.

Quer ativar?"
```

### Planos de Backup

| Plano | Preço | Limite |
|-------|-------|--------|
| Backup | R$ 9,90/mês | 1.000 consultas |
| Backup Pro | R$ 29,90/mês | 5.000 consultas |
| Backup Clínica | R$ 79,90/mês | 50.000 consultas |

### Regras

- Margem mínima: 50%
- Comunicar em "consultas guardadas", não em GB
- Aviso em 90% do limite
- Tempo médio até upgrade: ~24 meses
- Reajuste anual pelo IPCA

---

## 12. OS 5 PERFIS DE USUÁRIO

| Perfil | % Base | Conversão | Indicações | Quando converte |
|--------|--------|-----------|------------|-----------------|
| **Maximizador** | 40% | 7% | 8 | Meses 3-5 |
| **Comprador rápido** | 2% | 90% | 2 | Mês 1 (2 semanas) |
| **Rejeitou** | 50% | 0% | 1 | Nunca |
| **Passivo** | 5% | 2% | 0,5 | Mês 5+ |
| **Quer Cérebro** | 3% | 80% | 4 | Meses 1-2 |

### Métricas ponderadas

- **Conversão média:** 7,1%
- **Indicações por usuário:** 3,9

### Simulação do Maximizador (40% da base)

```
Dia 1-3:   Trial ilimitado (usa 10-15/dia) ✓
Dia 4-6:   Modo diário (3/dia, mas quer mais)
Dia 7:     Indica colega #1 → ganha +3 dias
Dia 8-10:  Ilimitado de novo
Dia 11-13: Volta pro diário
Dia 14:    Indica colega #2 → +3 dias
...
Mês 3:     Cansou de indicar → assina ou vira FREE perpétuo
```

**Resultado:** 6-8 indicações antes de decidir

---

## 13. MODELO FINANCEIRO

### Premissas base

| Item | Valor |
|------|-------|
| Base inicial | 300 médicos (seed do 3A) |
| Taxa aceitação trial | 30% |
| Custo do trial | R$ 1,00 |
| Custo do FREE | R$ 1,50/mês |
| Custo do pagante | R$ 10/mês |
| Churn mensal | 3% |
| Teto de mercado | 50.000 médicos |

### 5 Cenários - Resultados 36 meses

| Cenário | Conversão | Pagantes M36 | Receita/mês | Lucro 3 anos |
|---------|-----------|--------------|-------------|--------------|
| Catastrófico | 3-4% | 3 | R$ 407 | R$ 3k |
| Pessimista | 5-6% | 14 | R$ 2.114 | R$ 53k |
| **Base** | **7%** | **811** | **R$ 127k** | **R$ 609k** |
| Otimista | 10% | 3.706 | R$ 600k | R$ 11.7M |
| Explosivo | 12% | 5.551 | R$ 916k | R$ 25.5M |

### Unit Economics

| Métrica | Valor |
|---------|-------|
| CAC viral | R$ 117 |
| CAC tráfego pago | R$ 1.000 |
| **Economia** | **8,5x mais barato** |
| LTV/CAC | 64x (benchmark: 3-5x) |
| Breakeven mensal | Mês 8 |
| Breakeven acumulado | Mês 14 |

---

## 14. REQUISITOS TÉCNICOS

### Stack

| Componente | Tecnologia |
|------------|------------|
| Backend | Vercel/Railway |
| Banco de dados | Supabase |
| Fila | AWS SQS ou BullMQ |
| Transcrição | Whisper (servidor próprio) |
| LLM básico | Llama/Qwen (servidor próprio) |
| LLM avançado | GPT-4o/Claude (API) |
| Storage áudio | S3 |

### Tabelas principais

- USUARIOS
- SALDOS (dias_ilimitados, transcrições_hoje)
- TRANSCRICOES
- INDICACOES
- PAGAMENTOS
- BACKUPS

### Custos de infraestrutura

| Fase | Custo mensal |
|------|--------------|
| MVP (0-100 users) | R$ 300-500 |
| Crescimento (100-500) | R$ 500-2.000 |
| Escala (500-2.000) | R$ 2.000-8.000 |

---

## 15. COMPLIANCE E LGPD

### Documentos necessários

- Termos de uso (advogado)
- Política de privacidade (advogado)
- Aceite registrado com timestamp + versão

### Regras de dados

| Dado | Retenção |
|------|----------|
| Áudio sem backup | Apaga em 24h |
| Áudio com backup | Conforme plano contratado |
| Transcrição | Mantém no histórico |
| Dados de conta | Enquanto ativo + 5 anos |

### Reajuste de preços

- Cláusula nos termos: reajuste anual pelo IPCA
- Aviso 30 dias antes

---

## 16. INVESTIMENTO E CRONOGRAMA

### Investimento total

| Item | Valor |
|------|-------|
| Desenvolvimento (freelancer 3m) | R$ 30-50k |
| Desenvolvimento (software house) | R$ 80-150k |
| Jurídico (termos + privacidade) | R$ 3-6k |
| Infra primeiros 6 meses | R$ 3-12k |
| Caixa para breakeven | R$ 16k |
| **TOTAL** | **R$ 50-180k** |

### Cronograma

| Semana | Entrega |
|--------|---------|
| 1-2 | Gravação + Upload funcionando |
| 3-4 | Transcrição + Parser prontuário |
| 5-6 | Dashboard médico + histórico |
| 7-8 | Sistema de créditos + trial + convites |
| 9-10 | Pagamento + cobrança |
| 11-12 | LGPD + termos + testes |
| 13-14 | Beta fechado (30 médicos) |
| 15-16 | Ajustes + lançamento viral |

**MVP funcional: 3 meses | Lançamento viral: 4 meses**

---

## 17. RESUMO DE DECISÕES

| Decisão | Valor Definido |
|---------|----------------|
| Plataforma | WhatsApp (não app) |
| Modelo de custo | Academia (servidor GPU, não API) |
| Trial inicial | 3 dias ilimitados |
| Custo do trial | R$ 1,00 |
| Limite diário após trial | 3 transcrições/dia |
| Custo do FREE | R$ 1,50/mês |
| Valor do FREE | R$ 21/mês (ROI 1.300%) |
| Boost por indicação | +3 dias ilimitados |
| Trigger do boost | Indicado fez 1ª transcrição |
| Ticket MarIA | R$ 147/mês |
| Ticket Cérebro | R$ 247/mês |
| Ticket Cérebro Pro | R$ 397/mês |
| Backup base | R$ 9,90/mês (1.000 consultas) |
| Áudio sem backup | Apaga em 24h |
| Reajuste de preços | IPCA anual |
| Aceite termos | Discreto (1 linha) |
| Uso pessoal detectado | 1ª grátis, cobra próximas |
| FREE como ativo | Sim - maximizar base |
| Caixa necessário | R$ 16k |
| Breakeven acumulado | Mês 14 |
| Meta conversão | 7-10% |
| Meta indicações/user | 3-4 |
| Meta K-factor | >1.0 |

---

## PRÓXIMOS PASSOS

- [ ] Validar premissas com 10 médicos do 3A
- [ ] Contratar jurídico para termos/privacidade
- [ ] Definir templates prontuário por especialidade
- [ ] Montar RFP desenvolvimento
- [ ] Escolher stack técnico
- [ ] Iniciar desenvolvimento MVP

---

*Documento unificado - Janeiro/2026*
*Versão 2.0*
