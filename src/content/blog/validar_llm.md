---
title: "Por que um 200 OK não significa que um LLM está certo"
description: "A resposta de um LLM é uma entrada não confiável e precisa de um verificador independente antes de ser usada."
date: "2026-09-11"
category: apis-integracao
tags: ["llm", "ia-generativa", "api", "validacao", "alucinacao"]
cover: ../../assets/covers/duzentos-ok.jpg
draft: true
---

Um `200 OK` não significa que o dado está certo.

Você já escreveu código que valida respostas de APIs antes de usá-las, porque sabe que uma integração externa pode retornar dados incompletos, inconsistentes ou simplesmente errados. O erro começa quando você trata a resposta de um LLM como se fosse o retorno confiável de uma função da sua aplicação, em vez de tratá-la como mais uma entrada externa que precisa ser verificada.

Este texto não fala sobre prompts melhores. Ele fala sobre um problema de arquitetura: como verificar uma resposta de IA antes de confiar nela.

## O escopo deste artigo

Este artigo trata apenas de respostas que possuem uma **fonte externa de verdade**. Consultas em bancos de dados, APIs, documentos de um sistema RAG ou qualquer informação que possa ser confirmada por outra fonte entram nesse cenário.

Escrita criativa, brainstorming, opiniões ou resumos subjetivos ficam fora do escopo, porque não existe uma única resposta correta para validar.

## Quando uma resposta parece perfeita, mas está errada

Considere uma tabela simples de clientes.

| nome_cliente | quantidade_estoque |
|---------------|--------------------|
| GAZIN | 1200 |
| MAGAZINE LUIZA | 4800 |

Você pergunta ao agente:

```text
Qual é o estoque total da Gazin?
```

O modelo gera a seguinte consulta SQL:

```sql
SELECT
  SUM(quantidade_estoque) AS total_estoque
FROM treinamento.specific_gold_ai.cliente_produto_estoque
WHERE nome_cliente ILIKE '%GAZIN%';
```

À primeira vista, tudo parece correto.

- A consulta executa sem erro.
- O SQL é válido.
- A tabela existe.
- O banco retorna um resultado.

Em outras palavras: a consulta recebe o equivalente a um **200 OK**.

O problema está escondido em um único detalhe.

`MAGAZINE LUIZA` contém a substring **GAZIN**. Como `ILIKE '%GAZIN%'` procura qualquer ocorrência dessa sequência de caracteres, a consulta soma os registros de **GAZIN** e **MAGAZINE LUIZA** sem perceber.

O resultado continua plausível. Não existe erro de sintaxe, nem erro de schema. Existe um erro de interpretação da regra de negócio.

Este é exatamente o tipo de problema que uma validação estrutural não encontra.

## Validar estrutura não é validar verdade

A consulta gerada pelo modelo passa por todas as verificações estruturais.

| Validação de estrutura | Validação de verdade |
|-------------------------|----------------------|
| O SQL executa sem erro. | Apenas a Gazin foi considerada. |
| As colunas existem. | Nenhum outro cliente entrou no resultado. |
| Os tipos estão corretos. | A regra de negócio foi respeitada. |

A primeira camada garante que a consulta pode ser executada.

A segunda garante que ela responde à pergunta correta.

A consulta com `ILIKE '%GAZIN%'` passa pela primeira camada e falha na segunda. Este é o limite da validação estrutural e o motivo pelo qual aplicações com LLM precisam de verificadores independentes.

## Onde a analogia com APIs quebra

Até aqui, a comparação com uma API funciona.

Agora ela quebra.

A solução imediata costuma ser pedir para outro LLM revisar essa consulta. O problema é que isso não cria um verificador independente, apenas adiciona outro modelo ao fluxo.

O primeiro modelo gerou `ILIKE '%GAZIN%'` porque esse filtro parece compatível com a pergunta. O segundo modelo analisa exatamente a mesma consulta e chega à mesma conclusão pelo mesmo motivo: a consulta é sintaticamente válida e semanticamente plausível.

O ponto não é que o segundo modelo não conhece a tabela. Mesmo conhecendo a tabela, ele continua sendo um modelo de linguagem avaliando uma hipótese produzida por outro modelo de linguagem.

Os dois pertencem à mesma categoria de sistema e compartilham a mesma classe de erro quando avaliam a mesma hipótese produzida por um modelo de linguagem.

É por isso que concordância entre modelos não é evidência de verdade.

## O que verifica essa resposta de forma independente?

A resposta não é outro LLM.

A aplicação executa uma verificação independente antes de confiar na consulta gerada pelo modelo. Em vez de perguntar se o SQL parece correto, ela valida uma propriedade objetiva da resposta usando a própria base de dados.

Se o modelo gerar um filtro por substring (`%GAZIN%`), o sistema executa uma checagem simples:

```sql
SELECT COUNT(DISTINCT nome_cliente) AS clientes_encontrados
FROM treinamento.specific_gold_ai.cliente_produto_estoque
WHERE nome_cliente ILIKE '%GAZIN%';
```

O resultado dessa consulta não depende da interpretação de um modelo.

- `1` cliente encontrado → o filtro identifica um único cliente.
- Mais de `1` cliente encontrado → existe ambiguidade e a resposta não deve seguir automaticamente.

O verificador não decide se o SQL está bem escrito. Ele mede uma condição objetiva da base de dados e interrompe o fluxo quando ela não é satisfeita.

Essa é a diferença entre **revisar uma resposta** e **verificar uma resposta**.

Esse verificador resolve apenas uma classe de erro: filtros ambíguos por substring.

Uma aplicação real possui outros verificadores independentes para outras classes de erro, como validar intervalos de datas, conferir chaves de junção (`JOIN`), verificar agregações (`SUM`, `AVG`, `COUNT`) ou confirmar que a consulta respeita regras de negócio. A ideia não é encontrar todas as alucinações com um único mecanismo, mas usar verificadores diferentes para tipos diferentes de erro.

## Onde essa verificação acontece?

O fluxo deixa de ser **LLM → Banco** e passa a separar geração e verificação.

1. O LLM recebe a pergunta do usuário.
2. O LLM devolve uma saída estruturada com a intenção da consulta.

```json
{
  "cliente": "Gazin"
}
```

3. A aplicação valida esse valor contra a base de dados.
4. Apenas depois da validação a aplicação monta e executa o SQL.

Essa separação evita que a aplicação precise interpretar SQL gerado por um modelo. O LLM identifica a intenção; a aplicação continua responsável por construir a consulta e verificar se os parâmetros representam um único cliente válido.

## Conclusão

A saída de um LLM deve receber o mesmo tratamento que qualquer resposta de uma integração externa.

SQL válido, texto coerente e respostas convincentes não provam que uma informação corresponde aos dados reais. O que reduz esse risco não é um segundo modelo concordando com o primeiro, mas um mecanismo de outra categoria verificando a resposta contra uma fonte externa, como um banco de dados, uma API, um documento ou a execução do próprio código.

A pergunta deixa de ser **"como faço o modelo errar menos?"** e passa a ser **"qual parte da minha arquitetura consegue provar que essa resposta está correta antes de usá-la?"**.