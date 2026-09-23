#!/usr/bin/env node
/**
 * Comando: trilha
 * Uso: node commands/trilha.js <tecnologia> [nivel]
 * Exemplo: node commands/trilha.js javascript iniciante
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/trilhas.json");

function carregarTrilhas() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw).trilhas;
}

function listarTrilhas(trilhas) {
  console.log("\n🌍 Geo-Explorer — Trilhas disponíveis:\n");
  trilhas.forEach((t) => {
    console.log(`  • ${t.nome.padEnd(15)} — ${t.descricao}`);
  });
  console.log(
    "\nUso: node commands/trilha.js <tecnologia> [nivel]\n" +
      "Níveis: iniciante | intermediario | avancado\n"
  );
}

function exibirTrilha(trilha, nivel) {
  const nivelSelecionado = nivel || "iniciante";

  if (!trilha.niveis.includes(nivelSelecionado)) {
    console.error(
      `\n❌ Nível "${nivelSelecionado}" não encontrado para a trilha "${trilha.nome}".\n` +
        `   Níveis disponíveis: ${trilha.niveis.join(", ")}\n`
    );
    process.exit(1);
  }

  const modulos = trilha.modulos[nivelSelecionado];

  console.log("\n" + "═".repeat(55));
  console.log(`🗺️  TRILHA: ${trilha.nome.toUpperCase()}`);
  console.log(`📊  Nível: ${nivelSelecionado}`);
  console.log("═".repeat(55));
  console.log(`\n${trilha.descricao}\n`);
  console.log("📚 Módulos:\n");

  modulos.forEach((m) => {
    console.log(`  ${m.ordem}. ${m.titulo}`);
    console.log(`     └─ ${m.descricao}`);
  });

  console.log("\n" + "─".repeat(55));
  console.log(
    `💡 Dica: use "node commands/desafio.js ${trilha.id} ${nivelSelecionado}" para receber um desafio!`
  );
  console.log("─".repeat(55) + "\n");
}

function main() {
  const args = process.argv.slice(2);
  const trilhas = carregarTrilhas();

  if (args.length === 0) {
    listarTrilhas(trilhas);
    return;
  }

  const tecnologia = args[0].toLowerCase();
  const nivel = args[1] ? args[1].toLowerCase() : "iniciante";

  const trilha = trilhas.find((t) => t.id === tecnologia);

  if (!trilha) {
    console.error(
      `\n❌ Trilha "${tecnologia}" não encontrada.\n` +
        `   Disponíveis: ${trilhas.map((t) => t.id).join(", ")}\n`
    );
    process.exit(1);
  }

  exibirTrilha(trilha, nivel);
}

main();
