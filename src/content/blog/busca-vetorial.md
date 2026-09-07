---
title: A busca do Ctrl+F e a ilusão do resultado exato
description: A busca vetorial não substitui o Ctrl+F por mágica, mas pelo contexto. Mesmo quando não tem uma resposta, ela sempre devolve algo.
date: 2026-09-06
category: apis-integracao
tags: ["busca vetorial", "embeddings", "rag"]
cover: ../../assets/covers/ctrl-f.jpg
draft: true
---

Você pesquisa por "temperatura da água" no Ctrl+F. Aparece o resultado "0 de 0". Mas a resposta "92 graus" está ali na sua tela o tempo todo, escrita de outro jeito.

A busca vetorial existe justamente porque o Ctrl+F casa os caracteres, não o sentido.

Para entender como o computador traduz palavras em conceitos, pense em um jogo de "Quem Sou Eu?", trocando as respostas por números entre 0 e 1. Imagine duas perguntas ilustrativas — "É um móvel?" e "É grande?":

* Cama: [1.0, 1.0]
* Abajur: [1.0, 0.4]
* Ameixa: [0.0, 0.1]

Como cama e abajur compartilham características, os números deles ficam próximos. A ameixa fica distante de ambos. É a medição dessa distância matemática que substitui a busca por caracteres exatos e permite encontrar o que você quer.

(Essas perguntas são só uma demonstração visual. Modelos reais usam centenas de dimensões matemáticas abstratas, e nenhuma delas é uma pergunta legível em português).

Para testar o conceito na prática, montei um experimento com oito documentos sobre café e fiz duas perguntas ao modelo — uma totalmente fora do assunto e outra diretamente relacionada:

```python
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
```text
Pergunta fora do índice:
score 0.068  |  O filtro de papel retira parte dos óleos e deixa a bebida mais limpa.
score 0.064  |  A prensa francesa precisa de moagem grossa e quatro minutos de infusão.
score 0.020  |  Grãos torrados há mais de três semanas perdem aroma.

Pergunta dentro do índice:
score 0.796  |  A água para o café coado deve ficar entre 92 e 96 graus.
score 0.555  |  Moa os grãos na hora, logo antes de extrair o café.
score 0.467  |  A proporção inicial recomendada é de 60 gramas de pó por litro de água.
```

A escala entre esses vetores se dá pela similaridade de cosseno, medindo o ângulo entre os dois vetores em um espaço multidimensional, mais precisamente as 384 dimensões usadas no exemplo. O resultado dessa escala então fica entre -1 e 1, onde:
* 1: Vetores idênticos ou que estão apontados na mesma direção
* 0: Vetores ortogonais ou que não possuem relação alguma
* -1: Vetores com direções opostas

Mas por que 0.068 e não 0.0? Embora "passaporte" e "café" não tenham relação semântica, o valor não é exatamente zero porque ambas as frases compartilham a mesma língua (português), a mesma estrutura de pergunta e palavras funcionais semelhantes. O modelo captura esses elementos como um sinal muito fraco, e um resultado próximo de zero indica, na prática, a ausência de relação entre os conceitos.

O modelo registrou a diferença: a pergunta sobre a água teve score 0.796 contra no máximo 0.068 da pergunta sobre o passaporte. 

Ainda assim, a busca fora do assunto retornou três resultados sobre café porque a instrução `[:top_k]`, dentro da função `buscar`, fatia o topo da lista sem consultar a pontuação de nenhum item, sem o poder do Ctrl+F de dizer "não encontrei". Diferente dele, que possui o estado "0 de 0", a busca vetorial por padrão sempre traz os resultados mais próximos da base, mesmo que essa proximidade seja irrelevante.

Para evitar que o seu sistema envie uma "sujeira confiável", ou seja, qualquer informação sem tratamento, para o modelo de linguagem que utiliza RAG, por exemplo, a solução é definir uma nota mínima antes de retornar a lista, algo simples como `if score < limiar: return []`, impede a sujeira de passar. Esse limiar deve ser calibrado de acordo com o próprio conjunto de documentos que for indexado, pois uma pontuação de 0.3 em uma base pode ser ruído e, em outra, um bom resultado, dependendo do contexto. Sem esse filtro aplicado no código, o sistema empurra trechos irrelevantes para dentro do prompt, e é exatamente aí que nascem as respostas educadas, porém erradas.