from mcp.server import MCPServer

mcp = MCPServer("servidor-soma-valores")

@mcp.tool()
def somar_valores(a: int, b: int) -> str:
    """Soma dois números inteiros."""
    return f"O resultado da soma é: {a + b}"

if __name__ == "__main__":
    mcp.run(transport="stdio")