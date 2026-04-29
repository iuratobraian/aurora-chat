import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VENV_PYTHON = path.join(__dirname, '..', '.aurora-venv', 'bin', 'python');
const SCRIPTS_DIR = path.join(__dirname, 'aurora');

/**
 * Ejecuta un script de Python dentro del entorno virtual de Aurora.
 */
async function runPython(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    const pyScript = path.join(SCRIPTS_DIR, scriptName);
    const child = spawn(VENV_PYTHON, [pyScript, ...args]);
    
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      process.stdout.write(data); // Stream output to user
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `Proceso falló con código ${code}`));
    });
  });
}

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    if (command === 'sync') {
      console.log('\n🧠 [AURORA INTEL] Iniciando sincronización del Vault con NotebookLM...');
      await runPython('notebook_sync.py');
    } else if (command === 'query') {
      const question = args.join(' ');
      if (!question) {
        console.error('❌ Error: Debes proporcionar una pregunta.');
        process.exit(1);
      }
      console.log(`\n🧠 [AURORA INTEL] Consultando Mastermind: "${question}"...`);
      await runPython('notebook_query.py', [question]);
    } else if (command === 'mempalace:init') {
      await runPython('mempalace_init.py');
    } else if (command === 'mempalace:mine') {
      await runPython('mempalace_mine.py');
    } else if (command === 'mempalace:search') {
      const q = args.join(' ');
      await runPython('mempalace_search.py', [q]);
    } else {
      console.log('\n📘 Manual de Aurora Intel:');
      console.log('  npm run vault:intel:sync             - Sincroniza con NotebookLM');
      console.log('  npm run vault:intel:query "q"        - Consulta inteligente');
      console.log('  npm run vault:intel:mempalace:init   - Inicializa el Palacio');
      console.log('  npm run vault:intel:mempalace:mine   - Mina el código y el Vault');
      console.log('  npm run vault:intel:mempalace:search - Búsqueda semántica local');
    }
  } catch (error) {
    console.error('\n❌ [AURORA INTEL] Error:', error.message);
  }
}

main();
