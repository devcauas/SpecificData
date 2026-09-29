import sqlite3

con = sqlite3.connect(":memory:")
con.execute("ATTACH DATABASE ':memory:' AS gold")
con.execute("""
    CREATE TABLE gold.cliente_produto_estoque (
        cliente TEXT,
        estoque INTEGER
    )
""")
con.executemany(
    "INSERT INTO gold.cliente_produto_estoque VALUES (?, ?)",
    [("VALE", 1500), ("INTERVALE", 6000)],
)

consulta_do_modelo = """
SELECT SUM(estoque) AS total_estoque
FROM gold.cliente_produto_estoque
WHERE cliente LIKE '%VALE%'
"""

verificador = """
SELECT COUNT(DISTINCT cliente) AS clientes_encontrados
FROM gold.cliente_produto_estoque
WHERE cliente LIKE '%VALE%'
"""

print("Pergunta: qual o estoque total do VALE?")
print()

total = con.execute(consulta_do_modelo).fetchone()[0]
print("SQL do modelo ......... 200 OK")
print(f"total_estoque ......... {total}      (resposta certa: 1500)")
print()

clientes = con.execute(verificador).fetchone()[0]
print("Verificador independente")
print(f"clientes_encontrados .. {clientes}")
print("-> filtro ambiguo: fluxo interrompido antes de responder")