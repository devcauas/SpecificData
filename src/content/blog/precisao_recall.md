---
title: "Precisão e recall: o que os seus modelos de classificação não mostram"
description: "Entenda precisão e recall a partir do monitoramento de sistemas, onde essa analogia falha e por que scores de classificação exigem validação."
date: "2026-10-26"
category: "machine-learning"
tags: ["machine-learning"]
cover: "../../assets/covers/precisao_recall.png"
draft: true
---

Você já passou uma semana de plantão recebendo alertas de CPU acima de 90%?

Na segunda-feira, foram 40 alertas. Você investigou cada um e descobriu que apenas 10 correspondiam a problemas reais.

Na sexta, o serviço caiu sem emitir nenhum alerta. Você descobriu a falha pelas reclamações dos usuários e confirmou o incidente nos logs.

O primeiro problema consumiu seu tempo com falsos alarmes. O segundo mostrou uma falha na cobertura do monitoramento, mas você conseguiu identificá-la por outra fonte.

Esses dois erros também existem em modelos de classificação. A diferença aparece quando você tenta descobrir o que o modelo deixou passar.

## Precisão e recall são perguntas diferentes

Considere os resultados de uma semana de monitoramento: 40 alertas emitidos, 10 correspondentes a incidentes reais e 20 incidentes identificados por uma fonte independente.

A **precisão** responde: dos alertas emitidos, quantos eram reais?

Precisão = 10 / 40 = 25%

O **recall** responde: dos incidentes reais, quantos geraram alertas?

Recall = 10 / 20 = 50%

Você investigou 40 alertas, mas 30 eram falsos alarmes. E apenas metade dos incidentes conhecidos gerou um alerta.

Precisão mede a confiabilidade dos alertas. Recall mede a proporção dos casos reais que o sistema conseguiu detectar.

Essas métricas também ajudam a avaliar classificadores de Machine Learning. Mas, antes de chegar ao modelo, pense no limiar que você já conhece.

## Você já escolhe limiares. O problema é outro.

Talvez você tenha alterado o limite de CPU de 80% para 90% para reduzir o ruído do monitoramento.

Você entende o que esse número representa: uma medida operacional conhecida. Também consegue consultar os logs, verificar incidentes e comparar o comportamento do serviço com os alertas emitidos.

Em um classificador, você também escolhe um limiar. A diferença é que o score produzido pelo modelo não tem necessariamente uma interpretação direta.

Imagine um modelo que atribui o score `0.8` a uma transação. Esse valor, isoladamente, não significa que há 80% de probabilidade de fraude. Ele só admite essa interpretação probabilística se o score tiver as propriedades necessárias, como uma calibração adequada.

Veja um exemplo em Python:

```python
# Scores atribuídos por um classificador
scores = [0.8] * 10

# Resultados reais: apenas 5 das 10 transações eram fraudes
y_true = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]

score_medio = sum(scores) / len(scores)
frequencia_real = sum(y_true) / len(y_true)

print(f"Score médio: {score_medio:.0%}")
print(f"Frequência real de fraude: {frequencia_real:.0%}")
```

Saída:

```text
Score médio: 80%
Frequência real de fraude: 50%
```

Nesse exemplo ilustrativo, todas as transações receberam score `0.8`, mas apenas metade era fraudulenta. O score não representa uma probabilidade calibrada de 80% nesse conjunto.

Isso não prova que todo modelo é mal calibrado. Demonstra que não é possível interpretar um score como probabilidade apenas porque ele está entre zero e um.

No monitoramento, você sabe o que significa CPU a 90%. Em um classificador, precisa avaliar o que os scores significam na prática e como as previsões se comportam diante dos resultados reais.

## O falso negativo que ninguém registra

Agora considere a diferença mais importante entre as duas situações.

No monitoramento, o serviço caiu. Mesmo sem um alerta, as reclamações e os logs permitiram identificar o incidente. Você encontrou uma falha de cobertura porque existia outra fonte de evidência.

No modelo de fraude, uma transação fraudulenta recebe score abaixo do limiar e é classificada como legítima.

Se não houver contestação, investigação independente ou auditoria dos dados, essa fraude pode nunca ser identificada. O modelo não gera alerta, e a equipe não tem motivo para investigar aquela transação específica.

**O falso negativo não é apenas um alerta que deixou de disparar: é um caso real que pode permanecer fora da avaliação do próprio sistema.**

Para medir o recall, você precisa conhecer o total de casos positivos reais, inclusive aqueles que o modelo não identificou. Isso exige dados rotulados ou algum processo independente de verificação.

Sem essa referência, você pode medir os alertas que o modelo emite, mas não sabe quantos casos relevantes continuam passando despercebidos.

## O limiar define quais erros você aceita

Considere um classificador de fraudes que sinaliza uma transação quando seu score é igual ou superior a determinado limiar.

Ao elevar esse limiar, o número de previsões positivas só pode diminuir. O recall, portanto, também só pode diminuir ou permanecer igual: os verdadeiros positivos não aumentam, enquanto o total de fraudes reais permanece fixo.

Ao reduzir o limiar, mais transações podem ser sinalizadas. Isso pode aumentar o recall, mas também pode gerar mais falsos positivos.

A decisão depende do custo de cada erro.

Se uma fraude não detectada gera prejuízo elevado, pode fazer sentido priorizar recall e aceitar mais investigações. Se bloqueios indevidos prejudicam clientes e sobrecarregam a equipe, a precisão também precisa ter um peso importante.

O mesmo raciocínio vale para alertas de infraestrutura. Um serviço crítico pode justificar mais alertas para reduzir o risco de falhas não detectadas. Em outro contexto, o excesso de alarmes pode fazer a equipe ignorar sinais importantes.

A diferença não está na existência de um limiar: os dois sistemas têm um. Está no significado do score e na capacidade de verificar, por fontes independentes, aquilo que o sistema não detectou.

## Antes de confiar nas métricas

Ao avaliar um classificador, verifique três pontos:

- **Precisão:** quantas previsões positivas correspondem a casos reais?
- **Recall:** quantos casos positivos reais foram identificados?
- **Verificação independente:** como você descobre os casos que o modelo classificou incorretamente e não sinalizou?

O terceiro ponto impede que a avaliação dependa exclusivamente das previsões do próprio modelo. Sem ele, os falsos negativos podem ficar fora da análise, produzindo uma visão incompleta do desempenho.

Precisão e recall não determinam sozinhos se um classificador está pronto para produção. Eles ajudam a quantificar o compromisso entre diferentes tipos de erro, desde que exista uma referência confiável para avaliar os resultados.

A pergunta, portanto, não é apenas quanto o modelo acerta. É se você consegue medir aquilo que ele erra — inclusive quando ele não avisa que errou.