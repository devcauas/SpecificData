---
title: A busca do Ctrl+F e a ilusão do resultado exato
description: O que você vai encontrar aqui, como eu pretendo escrever e o compromisso de transparência sobre o uso de IA no conteúdo.
date: 2026-09-04
category: apis-integracao
tags: ["API"]
cover: ../../assets/covers/bem-vindo.jpg
featured: true
draft: false
---

Você pesquisa por "temperatura da água" no Ctrl+F. Aparece o resultado "0 de 0". Mas a resposta "92 graus" está ali na sua tela o tempo todo, escrita de outro jeito.

A busca vetorial existe justamente porque o Ctrl+F casa caracteres, não sentido.

Para entender como o computador traduz palavras em conceitos, pense em um jogo de "Quem Sou Eu?", trocando as respostas por números entre 0 e 1. Imagine duas perguntas ilustrativas — "É um móvel?" e "É grande?":

Cama: [1.0, 1.0]
Abajur: [1.0, 0.4]
Ameixa: [0.0, 0.1]

Como cama e abajur compartilham características, os números deles ficam próximos. A ameixa fica distante de ambos. É a medição dessa distância matemática que substitui a busca por caracteres exatos e permite encontrar o que você quer.

(Essas perguntas são só uma demonstração visual. Modelos reais usam centenas de dimensões matemáticas abstratas, e nenhuma delas é uma pergunta legível em português).

Para testar o conceito na prática, montei um experimento com oito documentos sobre café e fiz duas perguntas ao modelo — uma totalmente fora do assunto e outra diretamente relacionada:

```
# pip install sentence-transformers
from sentence_transformers import SentenceTransformer
import numpy as np

modelo = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

DOCUMENTOS = [
    "Moa os grãos na hora, logo antes de extrair o café.",
    "A água para o café coado deve ficar entre 92 e 96 graus.",
    "A prensa francesa precisa de moagem grossa e quatro minutos de infusão.",
    "Café expresso usa moagem fina e cerca de nove bars de pressão.",
    "Grãos torrados há mais de três semanas perdem aroma.",
    "O filtro de papel retira parte dos óleos e deixa a bebida mais limpa.",
    "A proporção inicial recomendada é de 60 gramas de pó por litro de água.",
    "Guarde os grãos inteiros em pote fechado, longe da luz.",
]

indice = modelo.encode(DOCUMENTOS, normalize_embeddings=True)

def buscar(pergunta, top_k=3):
    consulta = modelo.encode([pergunta], normalize_embeddings=True)
    scores = (indice @ consulta.T).ravel()
    for posicao in np.argsort(-scores)[:top_k]:
        print(f"score {scores[posicao]:.3f}  |  {DOCUMENTOS[posicao]}")

print("Pergunta fora do índice:")
buscar("Como faço para renovar meu passaporte brasileiro?", top_k=3)

print("\nPergunta dentro do índice:")
buscar("Qual a temperatura da água para o café?", top_k=3)
```

Pergunta fora do índice:
score 0.068  |  O filtro de papel retira parte dos óleos e deixa a bebida mais limpa.
score 0.064  |  A prensa francesa precisa de moagem grossa e quatro minutos de infusão.
score 0.020  |  Grãos torrados há mais de três semanas perdem aroma.

Pergunta dentro do índice:
score 0.796  |  A água para o café coado deve ficar entre 92 e 96 graus.
score 0.555  |  Moa os grãos na hora, logo antes de extrair o café.
score 0.467  |  A proporção inicial recomendada é de 60 gramas de pó por litro de água.

O modelo registrou a diferença: a pergunta sobre a água teve score 0.796 contra no máximo 0.068 da pergunta sobre o passaporte. Ainda assim, a busca fora do assunto retornou três resultados sobre café porque a instrução [:top_k] dentro da função buscar obriga o código a fatiar e entregar os top_k primeiros itens ordenados, sem o poder de dizer "não encontrei". Diferente do Ctrl+F, que possui o estado "0 de 0", a busca vetorial por padrão sempre trará os resultados mais próximos da base, mesmo que essa proximidade seja irrelevante.

Para evitar que o seu sistema envie "lixo confiável" para o modelo de linguagem no RAG, a solução é definir uma nota mínima antes de retornar a lista — algo simples como if score < limiar: return []. Esse limiar deve ser calibrado de acordo com o seu próprio corpus, pois uma pontuação de 0.3 em uma base pode ser ruído e, em outra, um bom resultado. Sem esse filtro, o sistema empurra trechos irrelevantes para dentro do prompt, e é exatamente aí que nascem as respostas educadas, porém erradas.

Fontes:
https://www.databricks.com/br/blog/vector-search
https://www.datacamp.com/pt/tutorial/euclidean-distance