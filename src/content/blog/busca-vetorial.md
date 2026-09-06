---
title: A busca Ctrl+F
description: 
date: 2026-09-05
category: apis-integracao
tags: ["busca vetorial"]
cover: api-
featured: true
draft: false
---

A busca feita com Ctrl+F retornou "0 de 0", isso provavelmente é coisa mais comum de se acontecer, na busca vetorial isso não ocorre, ela não é apenas uma correspondêcia de palavra-chave, ele é bem mais útil, completa e todos já usaram indiretamente.

Chatbot, isso está em quase todos os lugares, mas e a recomendação de produtos (filmes, vídeos, objetos, etc.) que você recebe? Exatamente, a busca vetorial está em muitas coisas, sem ela você ainda estaria usando mapas para se locomover. 

Quero que você pense comigo, como uma grande quantidade de informação (Big Data) pode ser usada a seu favor? E como é esse processo? Não é viável e nem estratégico um sistema analisar uma Big Data de uma vez só e sem etapas definidas, ou seja, dividir essas informações (embeddings), nomeá-las por um índice e fazer a correspondêcia dessas consultas é um jeito melhor de fazer as coisas, e isso existe desde de 1950 por Calvin Mooers que formulou a definição da expressão "The requirements of information retrieval, of finding information whose location or very existence is a priori unknown...", conceituando o que ele disse: Você não sabe onde a informação está? Um sistema saberá então.

Embeddings, índice, correpôndencia da consulta, vamos por partes, realizar um Embedding demanda um certo conhecimento em linguagem de programação, Python é a mais comum, mas usa-se C#, R, Javascript, entre outras. Aqui vai um exemplo simples sem código:

Vamos "Jogar quem sou eu?", uma brincadeira muito famosa, mas invés de respostas escritas responderemos com números entre 0 e 1 (linguagem binária)

Perguntas:
É um objeto? (0 = Não, 1 = Sim)
É grande? (0 = Não, 1 = Sim, e muito)

Cama: [1.0, 1.0]
Abajur: [1.0, 0.4]
Ameixa: [0.0, 0.1]

Depois desse exercício mental, a resposta provavelmente seria a cama, mas vamos ao conceito detalhado, isso ocorre por trás dos panos nos exemplos falado acima, o computador faz várias contas até chegar na resposta.

Essas contas são rodeadas de várias fórmulas matemáticas, como:

$$
\boxed{
e_{\text{texto}} =
\frac{1}{n}
\sum_{i=1}^{n}
\operatorname{LayerNorm}
\left(
    \operatorname{LayerNorm}
    \left(
        X_i +
        \operatorname{Concat}
        \left(
            \operatorname{Softmax}
            \left(
                \frac{XW_Q (XW_K)^T}{\sqrt{d_k}}
            \right)
            XW_V
        \right)
        W_O
    \right)
    +
    W_2
    \operatorname{GELU}
    \left(
        W_1(\cdot) + b_1
    \right)
    + b_2
\right),
\qquad
X = E_{\text{token}} + E_{\text{pos}} + E_{\text{segment}}
}
$$

Fontes:
https://www.databricks.com/br/blog/vector-search
https://www.datacamp.com/pt/tutorial/euclidean-distance