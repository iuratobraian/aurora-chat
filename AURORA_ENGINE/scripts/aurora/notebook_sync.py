import os
import asyncio
import glob
import sys
from notebooklm import NotebookLMClient

# Configuración de categorías del Vault
CATEGORIES = {
    "01_Tasks_Active": "vault/01-tareas/activas/**/*.md",
    "03_Knowledge_Base": "vault/03-conocimiento/**/*.md",
    "04_Error_Log": "vault/04-errores/**/*.md",
    "05_Agent_Experiences": "vault/05-agentes/experiencias/**/*.md"
}

NOTEBOOK_NAME = "TradeShare Mastermind Vault"

async def consolidate_category(name, pattern):
    """Consolida múltiples archivos MD en uno solo para optimizar el límite de fuentes de NotebookLM."""
    files = glob.glob(pattern, recursive=True)
    if not files:
        return None
    
    content = f"# CONSOLIDATED: {name}\n\n"
    content += f"Generado el: {os.popen('date').read().strip()}\n\n"
    
    for f in files:
        if os.path.isfile(f):
            try:
                with open(f, 'r', encoding='utf-8') as file:
                    content += f"## SOURCE_FILE: {f}\n\n"
                    content += file.read() + "\n\n---\n\n"
            except Exception as e:
                print(f"Warning: Could not read {f}: {e}")
    
    return content

async def sync_vault():
    """Sincroniza el Vault con NotebookLM."""
    try:
        async with await NotebookLMClient.from_storage() as client:
            # 1. Buscar o crear el cuaderno
            notebooks = await client.notebooks.list()
            nb = next((n for n in notebooks if n.title == NOTEBOOK_NAME), None)
            
            if not nb:
                print(f"[*] Creando nuevo cuaderno: {NOTEBOOK_NAME}")
                nb = await client.notebooks.create(NOTEBOOK_NAME)
            else:
                print(f"[*] Usando cuaderno existente: {nb.id}")

            # 2. Obtener fuentes actuales para evitar duplicados/actualizar
            sources = await client.sources.list(nb.id)
            
            # 3. Procesar categorías
            for cat_name, pattern in CATEGORIES.items():
                print(f"[*] Procesando categoría: {cat_name}...")
                content = await consolidate_category(cat_name, pattern)
                
                if not content:
                    print(f"[!] No se encontraron archivos para {cat_name}. Saltando.")
                    continue
                
                # Buscar si ya existe la fuente
                existing = next((s for s in sources if s.title == cat_name), None)
                if existing:
                    print(f"[*] Actualizando fuente existente: {cat_name} ({existing.id})")
                    await client.sources.delete(nb.id, existing.id)
                
                # Subir contenido consolidado
                print(f"[*] Subiendo contenido para {cat_name}...")
                await client.sources.add_text(nb.id, cat_name, content)

            print("[+] Sincronización completada con éxito.")
            
    except Exception as e:
        print(f"[ERROR] Fallo en la sincronización: {e}")
        if "auth" in str(e).lower() or "login" in str(e).lower():
            print("\n[!] Error de autenticación. Por favor ejecuta: npm run vault:intel:login")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(sync_vault())
