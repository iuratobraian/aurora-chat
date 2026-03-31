import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPOS_PATH = path.join(ROOT, ".agent/aurora/repos.json");

function readRepos() {
  return JSON.parse(fs.readFileSync(REPOS_PATH, "utf8"));
}

function writeRepos(data) {
  fs.writeFileSync(REPOS_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function getRepos() {
  return readRepos();
}

export function addRepo(nombre, ruta, tipo = "general") {
  const data = readRepos();
  const index = data.repositorios.findIndex((repo) => repo.nombre.toLowerCase() === nombre.toLowerCase());
  const next = { nombre, ruta, tipo, estado: data.activo === nombre ? "activo" : "disponible" };
  if (index >= 0) {
    data.repositorios[index] = next;
  } else {
    data.repositorios.push(next);
  }
  writeRepos(data);
  return next;
}

export function setActiveRepo(nombre) {
  const data = readRepos();
  data.activo = nombre;
  data.repositorios = data.repositorios.map((repo) => ({
    ...repo,
    estado: repo.nombre === nombre ? "activo" : "disponible"
  }));
  writeRepos(data);
  return data.repositorios.find((repo) => repo.nombre === nombre);
}

const command = process.argv[2] || "listar";

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  if (command === "listar") {
    console.log(JSON.stringify(readRepos(), null, 2));
  } else if (command === "agregar") {
    const nombre = process.argv[3];
    const ruta = process.argv[4];
    const tipo = process.argv[5] || "general";
    console.log(JSON.stringify(addRepo(nombre, ruta, tipo), null, 2));
  } else if (command === "activar") {
    const nombre = process.argv[3];
    console.log(JSON.stringify(setActiveRepo(nombre), null, 2));
  } else {
    console.error(`Comando no soportado: ${command}`);
    process.exitCode = 1;
  }
}
