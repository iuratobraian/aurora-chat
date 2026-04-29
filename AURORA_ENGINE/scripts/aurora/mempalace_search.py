import sys
import os
import subprocess

def search_palace(query):
    """Realiza una búsqueda semántica en el palacio de memoria."""
    print(f"\n🔍 [MEMPALACE] Buscando: '{query}'...")
    
    # Binario de mempalace en el venv
    venv_bin = os.path.join(os.getcwd(), ".aurora-venv", "bin", "mempalace")
    
    # Ejecutar búsqueda
    result = subprocess.run([venv_bin, "search", query], capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"[ERROR] {result.stderr}")
        return
    
    if result.stdout:
        print("\n--- RESULTADOS DEL PALACIO ---")
        print(result.stdout.strip())
        print("-------------------------------")
    else:
        print("[!] No se encontraron coincidencias en la memoria asociativa.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python mempalace_search.py 'consulta'")
        sys.exit(1)
    
    query = " ".join(sys.argv[1:])
    search_palace(query)
