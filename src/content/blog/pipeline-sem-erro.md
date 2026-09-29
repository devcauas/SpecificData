---
title: "Um pipeline que roda sem erro não é o mesmo que um pipeline correto"
description: "Diferenciar dados inválidos de dados incompletos evitará falhas silenciosas que mascaram relatórios no seu pipeline."
date: "2026-09-21"
category: bastidores
tags: ["engenharia-de-dados", "pyspark", "databricks", "qualidade-de-dados", "sap"]
cover: ../../assets/covers/duzentos-ok.jpg
draft: true
---

É arriscado, para uma empresa, analisar um relatório financeiro baseado em dados incompletos sem que ninguém perceba.

## O problema de negócio e o S4Lake

O S4Lake foi construído para enfrentar esse problema na prática. Para contextualizar o cenário, utilizo uma empresa fictícia: a Horizonte Embalagens S.A., uma indústria B2B que vende embalagens para clientes de diversos setores (alimentos, varejo, e-commerce, cosméticos, farmácia e autopeças) em dez estados do Brasil.

O cenário é direto: a empresa fatura bem, mas o caixa não acompanha o faturamento. Quase metade das faturas é paga com atraso, e a área de Crédito e Cobrança trabalha de forma reativa.

Para lidar com esse cenário, o projeto combina Databricks Free Edition, PySpark, GitHub e um script Python para geração de dados sintéticos com estrutura SAP. Na próxima etapa, pretendo integrar o SAP HANA Cloud no plano gratuito.

Durante o processo de construção, surgiram aprendizados que transformaram a arquitetura do projeto do início ao fim.

## A camada Bronze

Na camada Bronze, nenhuma correção de dado é feita. Ela preserva os dados brutos exatamente como chegaram do sistema de origem e funciona como a fonte da verdade para o pipeline.

Um detalhe prático de engenharia: nessa camada, todos os campos são lidos como texto (`string`). Se o PySpark inferisse os tipos automaticamente, um código de cliente como `0000012345` seria convertido para o inteiro `12345`, perdendo os zeros à esquerda e quebrando os *joins* com outras tabelas no futuro.

Além disso, foram adicionadas colunas de auditoria (`_ingestao_em` e `_arquivo_origem`). Se no futuro alguma regra errada for aplicada na Silver, a Bronze garante que o processo possa ser reexecutado e recuperado sem perdas.

## O tratamento das 8 duplicatas na KNA1

A estrutura do projeto gira em torno das tabelas do sistema SAP. A tabela **KNA1** (*Kundenstamm Allgemein*) é a base geral de clientes.

Na Bronze, ela chegou com 808 registros. Já na Silver, o resultado final foi de 800 registros. As 8 linhas a menos não "sumiram": eram registros duplicados.

Isso levanta uma dúvida essencial de engenharia de dados: qual é a diferença entre "sumir com 8 linhas" e remover 8 duplicatas de forma determinística?

Remover de forma determinística significa aplicar uma regra explícita e replicável. Utilizei uma *window function* agrupando pelo código do cliente (`KUNNR`) e ordenando por critérios claros: priorizar o registro sem espaços sobrando e, em caso de empate, manter o mais recente. O resultado é o mesmo a cada execução. Como os 808 registros originais continuam intactos na Bronze, é possível auditar e provar a qualquer momento quais linhas foram desconsideradas e o porquê.

## A quarentena: tratando dados inválidos

Se as duplicatas foram resolvidas por deduplicação determinística, o que acontece com dados incorretos ou quebrados? É aqui que entra a quarentena.

Em vez de simplesmente deletar registros inválidos da Silver, o pipeline os direciona para uma tabela separada de quarentena. No S4Lake, isso aconteceu, por exemplo, com 449 itens da tabela de vendas (`VBAP`) que estavam com quantidade zerada, e 259 itens de faturamento (`VBRP`) apontando para ordens de venda inexistentes.

### Por que isolar em vez de descartar?

Guardar o registro inválido em quarentena garante três benefícios:

1. **Rastreabilidade:** É possível provar que nenhum dado com falha de regra se perdeu. A soma dos válidos na Silver com os rejeitados na quarentena bate com o volume processado a partir da Bronze (descontadas as deduplicações).
2. **Correção na origem:** A equipe responsável pela entrada de dados no SAP recebe um relatório claro de quais registros falharam e por qual motivo, permitindo o ajuste no sistema de origem.
3. **Auditoria:** O registro do momento da execução indica exatamente quando a inconformidade foi capturada pelo pipeline.

### Flag vs. Quarentena

Um ponto fundamental é saber diferenciar dado inválido de dado incompleto com valor de negócio.

No projeto, 16 clientes da KNA1 não possuíam CNPJ cadastrado. Eles não foram para a quarentena. Em vez disso, receberam uma *flag* (`cnpj_ausente = True`) e continuaram na Silver. O motivo é simples: mesmo sem CNPJ, esse cliente pode possuir faturas em aberto e continuar devendo à empresa. Tirá-lo da Silver faria esse dinheiro desaparecer do relatório financeiro. A quarentena é reservada apenas para registros que realmente inviabilizam o processamento correto.

## As regras de negócio e validações entre tabelas

Garantir que cada tabela individual bata seu total de linhas não é suficiente. Um pipeline correto precisa garantir que as tabelas fazem sentido juntas.

No contas a receber, cada fatura precisa corresponder aos seus respectivos títulos em aberto ou pagos. No SAP, a soma dos títulos abertos (`BSID`) com os títulos baixados (`BSAD`) deve ser equivalente ao total esperado na conciliação de faturas (`VBRK`):

`3.352 (BSID) + 25.373 (BSAD) = 28.725 (VBRK)`

Se uma fatura não gerasse título, ou se gerasse títulos duplicados, as contagens isoladas de cada arquivo passariam sem erros, mas o relatório financeiro estaria errado. A validação cruzada entre tabelas é o que garante a integridade do processo. Na camada Silver de contas a receber do S4Lake, os 28.725 títulos passaram por todas as regras e a quarentena dessa etapa ficou zerada.

## O teste que revelou a falha silenciosa

Uma quarentena vazia não é, por si só, prova de sucesso. Durante o desenvolvimento do notebook de faturamento, executei a primeira versão da validação cruzada conferindo apenas se cada item pertencia a uma fatura válida na `VBRK`.

O resultado foi de 86.446 itens válidos e 0 na quarentena. Parecia perfeito.

No entanto, como eu havia injetado intencionalmente 259 itens com ordens de origem (`AUBEL`) inexistentes no gerador de dados sintéticos, eu sabia que a quarentena deveria ter 259 linhas. O zero na quarentena indicava uma falha silenciosa: a validação não estava checando a integridade do `AUBEL` contra a tabela de ordens de venda.

Após adicionar a segunda regra de integridade referencial no PySpark, o resultado se ajustou para:

`86.187 válidos + 259 em quarentena = 86.446 na Bronze`

Essa experiência mostrou que sem saber o valor esperado ou sem regras bem consolidadas, erros silenciosos passam despercebidos. Em um projeto real, os números esperados vêm das validações cruzadas e das regras de negócio estabelecidas entre as áreas. É esse nível de rigor que garante que um pipeline correto vai além de apenas rodar sem erros.