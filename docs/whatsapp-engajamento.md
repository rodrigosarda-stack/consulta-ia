# MarIA -- Scripts de Engajamento WhatsApp

> Mensagens automatizadas para onboarding, ativacao, retencao e crescimento viral.
> Canal: WhatsApp via Evolution API (instancia: MarIA-Bot)
> Todas as mensagens em portugues, prontas para uso.

---

## Variaveis disponiveis

| Variavel | Descricao |
|----------|-----------|
| `{{nome}}` | Primeiro nome do profissional |
| `{{consultas_semana}}` | Total de consultas na semana |
| `{{pacientes_semana}}` | Total de pacientes atendidos na semana |
| `{{codigo_convite}}` | Codigo de indicacao do usuario |
| `{{link_gravacao}}` | Link para iniciar gravacao |
| `{{dias_inativo}}` | Dias desde ultima consulta |

---

## Dia 0 -- Boas-vindas (apos onboarding)

**Gatilho:** Usuario completa cadastro
**Condicao:** Nenhuma (envia para todos)

### Mensagem 1 -- Boas-vindas

```
Ola, {{nome}}! Bem-vindo(a) a MarIA.

Sou sua assistente de documentacao clinica. A partir de agora, voce grava a consulta e eu gero o prontuario completo pra voce.

Gratis. Sem limite de consultas.

Vou te mostrar como funciona em 3 passos simples.
```

### Mensagem 2 -- Tutorial rapido (enviar 2min apos msg 1)

```
Como usar a MarIA:

1. Clique no link que eu enviar antes da consulta
2. Toque em "Gravar" e faca seu atendimento normalmente
3. Ao finalizar, receba o prontuario aqui mesmo no WhatsApp

Quer testar agora? Clique aqui e grave uma consulta simulada:
{{link_gravacao}}
```

### Mensagem 3 -- Codigo de convite (enviar 5min apos msg 2)

```
Ah, e voce tem um codigo de convite exclusivo:

*{{codigo_convite}}*

Compartilhe com colegas que tambem querem agilizar a documentacao. Quanto mais profissionais usarem, melhor a MarIA fica para todos.
```

---

## Dia 1 -- Primeiro check-in

**Gatilho:** 24h apos onboarding
**Condicao:** Verificar se usuario gravou ao menos 1 consulta

### Se gravou (ativo)

```
{{nome}}, vi que voce ja fez sua primeira consulta com a MarIA!

Como foi a experiencia? O prontuario ficou no padrao que voce precisa?

Se quiser ajustar algo, e so me dizer.
```

### Se nao gravou (inativo)

```
{{nome}}, tudo bem?

Ainda nao vi sua primeira gravacao. Sei que a rotina e corrida, mas leva menos de 1 minuto pra comecar.

Seus colegas que ja testaram dizem que economizam ate 40 min por dia em documentacao.

Quando quiser, e so clicar:
{{link_gravacao}}
```

---

## Dia 3 -- Push de ativacao

**Gatilho:** 72h apos onboarding
**Condicao:** Verificar estado de ativacao

### Se ativo (2+ consultas)

```
{{nome}}, dica rapida:

Voce sabia que pode acessar o historico completo dos seus pacientes? Todos os prontuarios ficam organizados automaticamente.

Assim voce consulta atendimentos anteriores em segundos, direto pelo celular.
```

### Se inativo (0-1 consultas)

```
{{nome}}, mais de 200 profissionais de saude ja usam a MarIA no dia a dia.

O que mais ouvimos: "Nao acredito que demorei tanto pra comecar."

Sem compromisso, sem custo. Teste na proxima consulta:
{{link_gravacao}}
```

---

## Dia 7 -- Retencao + viral

**Gatilho:** 7 dias apos onboarding
**Condicao:** Verificar estado de ativacao

### Se ativo (3+ consultas)

```
{{nome}}, uma semana de MarIA!

Voce ja documentou suas consultas de forma muito mais pratica. Imagina se seus colegas tambem tivessem esse apoio?

Convide alguem com seu codigo:
*{{codigo_convite}}*

E se voce quer ir alem, o plano MarIA (R$47/mes) inclui modelos personalizados de prontuario e suporte prioritario.

Quer saber mais? Responda "quero".
```

### Se inativo

```
{{nome}}, faz uma semana que voce se cadastrou e ainda nao conseguimos te ajudar na pratica.

Posso te perguntar: o que faltou?

1 - Nao tive tempo
2 - Nao entendi como funciona
3 - Tive algum problema tecnico
4 - Outro motivo

Responda o numero e eu te ajudo.
```

---

## Dia 14 -- Upsell

**Gatilho:** 14 dias apos onboarding
**Condicao:** Somente para usuarios ativos (5+ consultas)

```
{{nome}}, voce ja usa bem a MarIA gratuita.

Com o plano MarIA (R$47/mes), voce ganha:

- Modelos de prontuario personalizados para sua especialidade
- Exportacao em PDF com seu cabecalho
- Suporte prioritario

E com o Cerebro (R$97/mes):

- Sugestoes clinicas baseadas em evidencia
- Resumo automatico do historico do paciente
- Integracao com seu sistema

Quer experimentar 7 dias gratis? Responda "testar".
```

---

## Resumo semanal (usuarios ativos)

**Gatilho:** Toda segunda-feira, 8h
**Condicao:** Usuario com ao menos 1 consulta na semana anterior

```
Bom dia, {{nome}}!

Seu resumo da semana:
- {{consultas_semana}} consultas documentadas
- {{pacientes_semana}} pacientes atendidos

Dica: revise os prontuarios gerados para ajustar detalhes e melhorar as proximas transcricoes. A MarIA aprende com suas correcoes.

Boa semana!
```

---

## Reengajamento (30 dias inativo)

**Gatilho:** 30 dias sem nenhuma consulta gravada
**Condicao:** `{{dias_inativo}}` >= 30

### Mensagem 1

```
{{nome}}, faz {{dias_inativo}} dias que voce nao usa a MarIA.

Enquanto isso, lancamos algumas novidades:

- Transcricao mais rapida e precisa
- Novos modelos de prontuario
- Painel de historico do paciente

Sua conta continua ativa e gratuita. Que tal testar de novo?
{{link_gravacao}}
```

### Mensagem 2 (se nao responder em 48h)

```
{{nome}}, sem pressao.

Se a MarIA nao fez sentido pra sua rotina, tudo bem. Mas se quiser dar outra chance, estou aqui.

Qualquer duvida, e so responder essa mensagem.
```

---

## Notas de implementacao

1. **Horarios de envio:** Evitar antes das 8h e apos as 20h. Preferir 8h-10h ou 14h-16h.
2. **Rate limiting:** Maximo 3 mensagens por dia para o mesmo usuario.
3. **Opt-out:** Sempre respeitar se o usuario pedir para parar. Adicionar flag `whatsapp_optout` no banco.
4. **Tracking:** Registrar cada mensagem enviada com timestamp e tipo para medir taxas de resposta.
5. **Personalizacao futura:** Adaptar mensagens por especialidade (dentista vs psicologo vs medico).
6. **Testes A/B:** Variar textos do Dia 1 (inativo) e Dia 3 (inativo) para otimizar conversao.
