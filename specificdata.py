import sqlite3

con = sqlite3.connect(":memory:")
con.execute("ATTACH DATABASE ':memory:' AS gold")
con.execute("""
    CREATE TABLE gold.cliente_produto_estoque (
        nome_cliente    TEXT,
        quantidade_estoque INTEGER
    )
""")
con.executemany(
    "INSERT INTO gold.cliente_produto_estoque VALUES (?, ?)",
    [("GAZIN", 1200), ("MAGAZINE LUIZA", 4800)],
)

consulta_do_modelo = """
SELECT SUM(quantidade_estoque) AS total_estoque
FROM gold.cliente_produto_estoque
WHERE nome_cliente LIKE '%GAZIN%'
"""

verificador = """
SELECT COUNT(DISTINCT nome_cliente) AS clientes_encontrados
FROM gold.cliente_produto_estoque
WHERE nome_cliente LIKE '%GAZIN%'
"""

print("Pergunta: qual o estoque total da Gazin?")
print()

total = con.execute(consulta_do_modelo).fetchone()[0]
print("SQL do modelo ......... 200 OK")
print(f"total_estoque ......... {total}      (resposta certa: 1200)")
print()

clientes = con.execute(verificador).fetchone()[0]
print("Verificador independente")
print(f"clientes_encontrados .. {clientes}")
print("-> filtro ambiguo: fluxo interrompido antes de responder")