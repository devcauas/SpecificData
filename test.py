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