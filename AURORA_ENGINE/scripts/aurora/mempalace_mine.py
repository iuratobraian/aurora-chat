import os
import subprocess
import sys

def run_mempalace(args):
    """Ejecuta un comando de MemPalace."""
    venv_bin = os.path.join(os.getcwd(), ".aurora-venv", "bin", "mempalace")
    result = subprocess.run([venv_bin] + args, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[ERROR] {result.stderr}")
        return False
    if result.stdout:
        print(result.stdout.strip())
    return True

def mine_knowledge():
    """Minado de código y vault en las alas de MemPalace."""
    print("\n🧠 [MEMPALACE] Minando conocimiento del proyecto...")
    
    # 1. Minar el Vault completo en el ala 'vault'
    print("[*] Minando Neural Vault...")
    run_mempalace(["mine", "vault", "--wing", "vault"])
    
    # 2. Minar el Backend (Convex)
    print("[*] Minando Lógica de Backend (Convex)...")
    run_mempalace(["mine", "convex", "--wing", "backend"])
    
    # 3. Minar Componentes de UI (Marketing y Common)
    print("[*] Minando Interfaz (Marketing y UI)...")
    run_mempalace(["mine", "src/components", "--wing", "frontend"])

    print("\n[+] Minado de conocimiento completado.")
    print("[INFO] El Mastermind ahora tiene memoria semántica sobre el código y el historial.")

if __name__ == "__main__":
    mine_knowledge()
