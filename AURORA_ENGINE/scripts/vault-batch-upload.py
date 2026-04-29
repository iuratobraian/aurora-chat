import os
import subprocess

EXP_DIR = "vault/05-agentes/experiencias/"
NOTEBOOK_ID = "da5f1afd-62f9-4117-b99b-ffe6e27fd21b" # Reusing or should create new? Proposing new.
AURORA_RESEARCH_SH = "./scripts/aurora-research.sh"

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.stderr.strip()

# Create new notebook for Vault Analytics
out, err = run_cmd(f"{AURORA_RESEARCH_SH} query create 'Aurora Neural Vault Analytics'")
print(out)

# Get ID
nb_id = ""
for line in out.split('\n'):
    if "Created notebook:" in line:
        nb_id = line.split(':')[1].split('-')[0].strip()
        # Wait, the ID format might be different in the output. 
        # Example: Created notebook: ID - Title
        nb_id = line.split('Created notebook:')[1].split('-')[0].strip()
        # Actually, let's just grep the 36-char ID
        import re
        match = re.search(r'[a-f0-9-]{36}', line)
        if match:
            nb_id = match.group(0)

if not nb_id:
    print("Failed to get Notebook ID")
    exit(1)

print(f"Using Notebook ID: {nb_id}")
run_cmd(f"{AURORA_RESEARCH_SH} query use {nb_id}")

# Get 40 most recent files
files = sorted([f for f in os.listdir(EXP_DIR) if f.endswith('.md')], 
               key=lambda x: os.path.getmtime(os.path.join(EXP_DIR, x)), 
               reverse=True)[:40]

for f in files:
    full_path = os.path.join(EXP_DIR, f)
    print(f"Adding source: {f}")
    out, err = run_cmd(f"{AURORA_RESEARCH_SH} query source add {full_path} --title '{f}' --type text")
    if err:
        print(f"Error adding {f}: {err}")
