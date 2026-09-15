from mcp.server import MCPServer
from pathlib import Path

mcp = MCPServer("arquivos")

ROOT = (Path(__file__).parent / "workspace").resolve()
ROOT.mkdir(exist_ok=True)
(ROOT / "anotacoes.txt").write_text("Rascunho do artigo sobre MCP.", encoding="utf-8")


@mcp.tool()
def read_file(path: str) -> str:
    file_path = (ROOT / path).resolve()

    if not file_path.is_relative_to(ROOT):
        raise PermissionError("Arquivo fora do diretório permitido.")

    return file_path.read_text(encoding="utf-8")


for caminho in ["anotacoes.txt", "../../.ssh/id_ed25519"]:
    print(f"> read_file({caminho!r})")
    try:
        print(f"  {read_file(caminho)}")
    except PermissionError as erro:
        print(f"  PermissionError: {erro}")