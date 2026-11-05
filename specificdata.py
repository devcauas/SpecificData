# Scores atribuídos por um classificador
scores = [0.8] * 10

# Resultados reais: apenas 5 das 10 transações eram fraudes
y_true = [1, 1, 1, 1, 1, 0, 0, 0, 0, 0]

score_medio = sum(scores) / len(scores)
frequencia_real = sum(y_true) / len(y_true)

print(f"Score médio: {score_medio:.0%}")
print(f"Frequência real de fraude: {frequencia_real:.0%}")