import readline from "node:readline";
import { getRepos, setActiveRepo } from "./aurora-repo-manager.mjs";

const repos = getRepos();
console.log("Repositorios configurados:");
repos.repositorios.forEach((repo, index) => {
  console.log(` ${index + 1}. ${repo.nombre} (${repo.estado}) - ${repo.ruta}`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Elegí el nombre del repo activo (ENTER para mantenerlo): ", (answer) => {
  const trimmed = answer.trim();
  if (!trimmed) {
    console.log(`Mantengo activo: ${repos.activo}`);
    rl.close();
    return;
  }
  const candidate = repos.repositorios.find((repo) => repo.nombre.toLowerCase() === trimmed.toLowerCase());
  if (!candidate) {
    console.log("No encontré ese repo; finalizo sin cambios.");
    rl.close();
    return;
  }
  const result = setActiveRepo(candidate.nombre);
  console.log(`Repo activo: ${result.nombre}`);
  rl.close();
});
