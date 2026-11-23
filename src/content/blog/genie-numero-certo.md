---
title: "A LLM acertou todas as consultas e errou oito vezes"
description: "Testar uma LLM com perguntas de resposta conhecida. O SQL acertou tudo. A interpretação precisou de sete regras, e parte dos erros ficou."
date: "2026-11-23"
category: mcp-agentes
tags: ["llm", "text-to-sql", "databricks", "genie", "avaliacao", "alucinacao"]
cover: ../../assets/covers/text-to-sql-llm.png
draft: true
---

Seis perguntas. Seis consultas certas, inclusive na pergunta feita para derrubar o modelo.

E, nas explicações dessas mesmas respostas, oito erros de interpretação: uma tendência que os dados não sustentavam, uma causa tirada de uma correlação e um cliente chamado de "inadimplente crônico" sem ninguém olhar se ele ainda pagava.

Foi isso que encontrei ao avaliar o Genie, o assistente de perguntas em linguagem natural do Databricks. Ele recebe uma pergunta em português, escreve o SQL, executa e explica o resultado.

O número você consegue testar. A explicação, não do mesmo jeito.

## O que você já sabe: teste com resposta conhecida

Você não testa uma função perguntando se o resultado "parece certo". Você escolhe entradas cujo resultado já sabe e compara.

```python
def test_soma():
    assert soma(2, 3) == 5
```

Com um Text-to-SQL, o raciocínio é o mesmo. Antes de fazer a pergunta à LLM, calculo a resposta por SQL. Depois pergunto em linguagem natural e comparo.

Fiz duas rodadas de teste, ambas com a data de corte de 22/09/2026. A primeira teve três perguntas sobre as tabelas de indicadores. A segunda, três perguntas sobre a tabela de risco de atraso. Cada pergunta foi feita numa conversa nova no Genie, para que uma resposta não contaminasse a seguinte.

| Rodada | Pergunta | Resposta certa (SQL) | Genie |
|---|---|---|---|
| 1 | Qual é o DSO da empresa? | 79,67 dias | Certo |
| 1 | Qual condição de pagamento tem o pior atraso? | D030, 26,47 dias além do prazo | Certo |
| 1 | Qual cliente tem mais valor vencido? | 0000100178, R$ 2.946.302,56 | Certo |
| 2 | Qual é o valor em risco total? | R$ 9.140.483,95 | Certo |
| 2 | Quantos títulos têm probabilidade de atraso acima de 50%? | 200 títulos, R$ 6.292.977,27 | Certo |
| 2 | Quais são os cinco clientes com maior valor em risco? | Os cinco, com os valores | Valores idênticos |

Seis de seis. Se a avaliação parasse aqui, o Genie estaria aprovado.

## A pergunta-armadilha

*Obs.: as condições de pagamento têm códigos como D030 e D090. O número é o prazo, em dias, que o cliente tem para pagar: a D090 dá 90 dias de prazo.*

A segunda pergunta foi escolhida para induzir ao erro.

O DSO mede quantos dias de venda estão parados na carteira. Quem vende com 90 dias de prazo tem DSO alto mesmo quando o cliente paga em dia. Comparar o DSO bruto entre condições de pagamento diferentes é comparar prazos, não atrasos.

Pelo DSO bruto, a pior condição seria a D090, com 98,01 dias. Mas o atraso real é o DSO menos o prazo concedido. Esta é a consulta que gerou o gabarito:

```sql
SELECT cond_pagamento, prazo_dias, dso, dias_alem_prazo
FROM workspace.camada_gold.kpis_por_prazo
ORDER BY dias_alem_prazo DESC;
```

A D030 fica em primeiro, com 26,47 dias além do prazo. A D090, que parecia a pior, é a melhor: 8,01 dias.

O Genie acertou.

E não foi por sorte. Cada tabela e coluna da camada Gold tem uma descrição no Unity Catalog com o grão, a unidade, a fórmula e como interpretar. A descrição do `dso` diz, com todas as letras, que ele não serve para comparar grupos com prazos diferentes e que, para isso, se usa o `dias_alem_prazo`.

Essas descrições não foram escritas à mão no catálogo. Os próprios notebooks as aplicam a cada execução, então elas ficam versionadas no Git junto com o código que gera as tabelas.

## A resposta não é só o valor de retorno

Uma função devolve um valor e acabou. O Genie devolve o número e um texto explicando o que ele significa.

O número estava certo. O texto, nem sempre. Na primeira rodada, as respostas e as perguntas de acompanhamento trouxeram seis erros de interpretação:

- Inventou a escada "quanto menor o prazo, maior o atraso". Ela não vale para todos os grupos: a D028 atrasa menos que a D030.
- Afirmou que prazos longos causam menos atraso. Os recortes mostram associação, não causa. Prazo e porte do cliente andam juntos, então o efeito atribuído ao prazo pode ser do porte.
- Tratou o DSO como o prazo médio que os clientes levam para pagar. Não é: ele mede a carteira em dias de venda.
- Chamou o cliente 0000100178 de inadimplente crônico, sem verificar se ele ainda tinha títulos pagos.
- Chamou 39,68% de "segunda maior taxa" de vencido. Era a maior.
- Somou o valor vencido dos cinco maiores devedores como R$ 6,85 milhões. O certo é R$ 6,84 milhões.

Nenhum desses erros aparece se você testar só o resultado da consulta. É como um teste que confere o valor de retorno e ignora a mensagem de log que vai parar no relatório da diretoria.

### O conserto não é um patch

Quando um teste falha, você corrige o código daquele caso.

Aqui, a tentação é escrever na instrução do Genie: "o DSO é 79,67 dias". Funciona hoje e quebra na próxima data de corte, quando o número mudar.

Por isso, antes da segunda rodada, escrevi sete regras gerais, sem nenhum número fixo. A maioria veio direto desses erros; duas anteciparam a tabela de risco, que entraria na segunda rodada. Algumas delas:

- Só afirme uma tendência entre grupos ordenados se ela valer para todos os grupos, na ordem.
- Não afirme que um fator causa atraso. Use "está associado a" ou "concentra".
- DSO não é tempo de pagamento. Para o atraso dos clientes, use as colunas de atraso médio, que só consideram títulos pagos.
- Ao falar de concentração, informe o percentual sobre o total, em vez de palavras como "significativa".
- Antes de rotular um cliente, verifique na `fato_titulos` se ele tem títulos pagos e quando foi o último pagamento.

Os números mudam a cada data de corte. As regras de interpretação, não.

### O teste verde não garante o próximo verde

Um bug corrigido continua corrigido. O teste passa hoje e amanhã.

Com o Genie, não. A leitura dos 39,68% e a soma dos R$ 6,85 milhões não são erros de interpretação, e nenhuma das regras os cobria: eles persistiram.

E, na segunda rodada, com as sete regras já aplicadas, surgiram dois erros novos:

- Descreveu a exposição de um cliente como "significativa", descumprindo a regra que pede o percentual.
- Apresentou uma probabilidade média de 99,9% com a ressalva de que é uma estimativa na primeira resposta, e sem ela na seguinte.

### O reteste

Repeti o teste com quatro perguntas, cada uma numa conversa nova:

- A soma do valor vencido dos cinco maiores devedores: R$ 6.843.137,80. Certa.
- A soma dos cinco clientes com maior valor em risco: R$ 3.585.677,87. Certa, e com a ressalva de que valor em risco não é perda.
- A taxa de vencido por condição de pagamento: leu os 39,68% da D030 como a maior e disse que não havia tendência clara entre prazo e atraso.
- "O cliente 0000100178 é inadimplente?": antes de responder, conferiu os 279 títulos pagos e o último pagamento, em 10/09/2026, e recomendou revisar os títulos vencidos um a um em vez de chamá-lo de inadimplente crônico.

Quatro de quatro, na explicação também. A regra do rótulo, em especial, foi seguida ao pé da letra.

Isso não prova que os erros acabaram. Prova que, desta vez, não apareceram. A instrução reduz o erro, mas você não tem como saber, só lendo a instrução, se ela será seguida na próxima resposta. Para saber, alguém precisa ler.

## O que mudou no projeto

A avaliação mudou o papel do Genie no projeto.

O Power BI foi escolhido como a fonte oficial dos números. O Genie serve para explorar a Gold em português, e toda resposta nova é conferida por SQL antes de virar conclusão.

O processo de avaliação também ficou documentado, porque o espaço Genie não é versionado pelo Git:

1. Ao mudar a data de corte, recalcular por SQL as respostas das perguntas de teste.
2. Fazer as perguntas em conversas novas, sem instruções extras.
3. Conferir o número e a narrativa de cada resposta contra as sete regras.
4. Registrar os erros novos e só então ajustar as instruções.

É uma suíte de regressão. A diferença é que metade dela não cabe num `assert`: alguém precisa ler a explicação.

Vale dizer o tamanho disto: foram seis perguntas em duas rodadas, mais quatro no reteste, uma data de corte e dados sintéticos. É um caso, não um benchmark. Ele não prova que o Genie é bom ou ruim. Mostra onde olhar.

## Conclusão

Testar o número é a parte fácil, e as descrições das colunas resolveram quase tudo. O erro que sobra mora na explicação: numa tendência que soa plausível, numa causa que ninguém provou, num rótulo que pesa numa decisão de cobrança.

Então a pergunta deixa de ser "o Text-to-SQL acertou o número?" e passa a ser "quem confere o que ele disse sobre o número?".
