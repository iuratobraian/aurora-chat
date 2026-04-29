import os
import subprocess
import sys

# Ruta del palacio de memoria (local)
PALACE_PATH = os.path.abspath("aurora/memory_palace")

def run_command(cmd):
    """Ejecuta un comando de MemPalace y captura el resultado."""
    print(f"[*] Ejecutando: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        # Algunos comandos pueden fallar si el ala ya existe, lo cual es aceptable
        if "already exists" in result.stderr.lower():
            print(f"[*] El recurso ya existe: {cmd[-1]}")
            return True
        print(f"[ERROR] {result.stderr}")
        return False
    if result.stdout:
        print(result.stdout.strip())
    return True

def init_palace():
    """Inicializa la estructura del Palacio de Memoria."""
    print("\n🧠 [MEMPALACE] Configurando el Palacio de Memoria de TradeShare...")
    
    # 1. Asegurar que el directorio de aurora existe
    os.makedirs("aurora", exist_ok=True)

    # 2. Binario de mempalace en el venv
    venv_bin = os.path.join(os.getcwd(), ".aurora-venv", "bin", "mempalace")
    
    # 3. Inicializar el palacio con --yes sobre el proyecto actual
    if not run_command([venv_bin, "init", "--yes", "."]):
        print("[!] Fallo al inicializar el palacio.")
        sys.exit(1)

    print(f"\n[+] Palacio de Memoria listo para el proyecto en: {os.getcwd()}")
    print("[INFO] El Mastermind ha mapeado automáticamente las habitaciones del palacio.")

if __name__ == "__main__":
    init_palace()
