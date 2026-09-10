# Parecer 4 — Investidor / CFO

## Nota geral (0 a 10) e uma frase de veredito
**4/10.** Tese de produto acima da média; modelo financeiro abaixo de qualquer padrão de diligência: a rampa é uma lista de desejos multiplicada, e a própria página admite que "números de adoção por porta são premissas minhas".

## O que está certo (até 5 pontos, com o porquê)
1. **Custo variável atacado antes da receita.** R$ 44 → ~R$ 1/médico/mês é a única alavanca que sustenta freemium; medida em 167 modelos, com teste marcado.
2. **Rampa por patamar, não linha reta.** Admitir que pharma só liga em 10 mil+ e que em 1.000 médicos o negócio empata é honestidade rara.
3. **A parede de dados** (identificado dentro, anonimizado fora) é o que pharma e plano vão auditar. Advogado antes de pharma: correto.
4. **Diagnóstico do Noa** é preciso: 90 % de margem, zero incentivo a baixar preço, e o risco real é levar a consulta ao app do paciente que a Doctoralia já tem.
5. **Distribuição inicial real:** 400 clientes do 3A dão os 10 médicos do beta e os 120 ativos sem CAC.

## O que está errado ou perigoso (até 5 pontos, específicos)
1. **"Receita vira compra" (R$ 360, a maior porta) contradiz a tabela de planos.** Receita estruturada é recurso **só do Pro** (3 % dos médicos); a porta assume ~1.000 receitas/ano em 100 % da base. Ou a receita fica grátis (e o Pro perde argumento) ou a porta vale 3 % do escrito. E é o núcleo da Memed há 14 anos: R$ 475–670/médico/ano *com* farmácia dentro é o teto do mercado, não o piso.
2. **Comissão de 3 % líquida sobre R$ 5 mil/mês vendidos pelo app (R$ 270).** Por que 15 % dos médicos moveriam R$ 60 mil/ano de recebimento para um app novo pagando 5 %, se Pix custa zero e maquininha 1–3 %? Exige Theo pronto, adquirência, chargeback e risco ANS — nada disso custa nada no modelo.
3. **Pharma R$ 250/médico/ano** implica CPM ~R$ 400 na dica (600 impressões/ano de indústria). Doximity faz US$ 228 onde a indústria gasta por médico uma ordem de grandeza acima do Brasil (de memória). A Helena terá dentista, psicólogo, nutri — base que a indústria não compra. E entra "a partir de 10 mil", que pelo cenário-base do próprio spec (3.372 ativos em M36) fica **fora dos 36 meses**.
4. **A rampa 200 → 550 → 1.000 → 1.300 não tem churn, ativação nem coorte.** "Ativo é quem grava", sem frequência. As margens de 88–98 % vêm de 4 a 20 pessoas a R$ 5,5–8 mil/mês servindo até 100 mil médicos e milhões de pacientes, mais vendas B2B a farmácia, laboratório, indústria e plano. Cursor e Midjourney são comparáveis errados: não têm força de vendas nem suporte clínico.
5. **5–15× receita** é múltiplo de Doximity: pública, EBITDA ~50 %, receita recorrente de indústria auditada. Healthtech privada brasileira em 2024–26 negocia a baixo dígito (de memória). Comissão conta líquida, nunca GMV.

**Adoções com base:** Rápido, Pro, Espaço (freemium 2–5 % total é benchmark aceitável, de memória — mas o "conservador" já soma 13 % pagando algo, acima do próprio benchmark da página). **Chute puro:** réguas, leads a R$ 20, venda pelo app, receita, exame, pesquisa (30 % de resposta a R$ 150 de margem), dados.

## O que falta e ninguém pensou (até 5)
1. **Custos ausentes, admitidos no spec ("sem equipe/suporte/advogado/marketing"):** CAC (a página estima R$ 1.000 se o laço não girar), taxa de pagamento (~3–5 % sobre R$ 27 dói), impostos (Simples anexo V ou Presumido: 13–19 % da receita, de memória), inadimplência, DPO, ISO 27001 (Noa tem), capex dos minis, seguro de responsabilidade.
2. **Plataforma:** app nativo com assinatura → Apple/Google levam 15–30 % do Rápido/Pro; HealthKit/Health Connect têm revisão que pode barrar o "dado que mais prende". A Meta já mudou preço uma vez (01/10); mudará de novo e bane número por conteúdo de saúde.
3. **PWA instalável no paciente** é a premissa que zera os R$ 400/médico/ano de WhatsApp e ninguém mediu quantos instalam. Push em iOS só com "adicionar à tela".
4. **Regulatório do prontuário:** guarda por 20 anos (CFM, de memória), certificação SBIS/CFM, e "sem exportar dados" colide com LGPD art. 18 (portabilidade) e com o Código de Ética Médica (cópia do prontuário é direito do paciente).
5. **Concentração:** metade do potencial passa pelo Theo, que não existe como produto de cobrança; e "o aparelho transcreve" depende de Apple/Google (microfone em segundo plano).

## Recomendações concretas (até 5, acionáveis)
1. Refazer o modelo em **coorte mensal**: ativação, retenção W4/W8/W12, churn, mais CAC, taxa de pagamento e impostos. Sem isso é tabuada, não unit economics.
2. **Rotular cada porta como medida / benchmark / chute** e valorar só as duas primeiras nos próximos 24 meses. Receita, exame, venda pelo app e pharma entram como opção, valor zero.
3. **Resolver a contradição receita/Pro** antes do beta: receita estruturada é grátis (porta de transação) ou paga (porta de assinatura). Não pode ser as duas.
4. Trocar as sete condições por **três métricas com meta e data**: instalação do PWA pelo paciente, k-factor médico←paciente em 90 dias, retenção W8 do médico.
5. Parecer jurídico **antes do beta**, não do mês 12: portabilidade, guarda, ANS, ANVISA (SaMD), CFM sobre gravação de consulta.

## Perguntas que eu faria ao Rodrigo antes de continuar (até 3)
1. Dos 10 médicos do beta, quantos ainda gravam 5+ consultas/semana na semana 8, e quantos pacientes deles abriram a versão simples?
2. Se a transcrição no aparelho falhar em pt-BR com ruído, o freemium morre ou vira "3 por dia"? Qual o plano B e seu custo?
3. Quem vende para farmácia, laboratório e indústria, e em qual mês essa pessoa entra na folha de 2/4/8?

**O número que importa no beta:** consultas gravadas por médico por semana na semana 8. Sem hábito não há base; sem base, nenhuma das onze portas existe.
