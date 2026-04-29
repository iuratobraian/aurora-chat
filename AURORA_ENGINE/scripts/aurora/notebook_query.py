import sys
import asyncio
from notebooklm import NotebookLMClient

NOTEBOOK_NAME = "TradeShare Mastermind Vault"

async def query_vault(question):
    """Realiza una consulta inteligente al cuaderno de NotebookLM."""
    try:
        async with await NotebookLMClient.from_storage() as client:
            # 1. Buscar el cuaderno
            notebooks = await client.notebooks.list()
            nb = next((n for n in notebooks if n.title == NOTEBOOK_NAME), None)
            
            if not nb:
                print(f"[ERROR] Cuaderno '{NOTEBOOK_NAME}' no encontrado.")
                print("[INFO] Por favor, ejecuta la sincronización primero: npm run vault:intel:sync")
                return

            # 2. Realizar la consulta (Chat)
            # Usamos el modo de investigación para obtener respuestas fundamentadas en las fuentes
            response = await client.chat.ask(nb.id, question)
            
            # 3. Imprimir respuesta
            print(response.answer)
            
            # Opcional: Si hay citas, podrías procesarlas aquí
            # if response.citations:
            #     print("\nFuentes consultadas:")
            #     for c in response.citations:
            #         print(f"- {c.source_title}")

    except Exception as e:
        print(f"[ERROR] Error al consultar el Vault: {e}")
        if "auth" in str(e).lower() or "login" in str(e).lower():
            print("\n[!] Error de autenticación. Por favor ejecuta: npm run vault:intel:login")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python notebook_query.py 'tu pregunta aquí'")
        sys.exit(1)
    
    question = " ".join(sys.argv[1:])
    asyncio.run(query_vault(question))
