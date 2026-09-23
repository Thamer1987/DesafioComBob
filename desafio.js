#!/usr/bin/env node
/**
 * Comando: desafio
 * Uso: node commands/desafio.js <tecnologia> [nivel]
 * Exemplo: node commands/desafio.js javascript intermediario
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/trilhas.json");

function carregarTrilhas() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw).trilhas;
}

function sortearDesafio(desafios) {
  const idx = Math.floor(Math.random() * desafios.length);
  return desafios[idx];
}

function exibirDesafio(trilha, nivel) {
  const nivelSelecionado = nivel || "iniciante";

  if (!trilha.niveis.includes(nivelSelecionado)) {
    console.error(
      `\n❌ Nível "${nivelSelecionado}" não encontrado para a trilha "${trilha.nome}".\n` +
        `   Níveis disponíveis: ${trilha.niveis.join(", ")}\n`
    );
    process.exit(1);
  }

  const desafiosNivel = trilha.desafios[nivelSelecionado];

  if (!desafiosNivel || desafiosNivel.length === 0) {
    console.error(
      `\n⚠️  Nenhum desafio disponível para "${trilha.nome}" no nível "${nivelSelecionado}" ainda.\n`
    );
    process.exit(1);
  }

  const desafio = sortearDesafio(desafiosNivel);

  console.log("\n" + "═".repeat(55));
  console.log(`🏆  DESAFIO: ${trilha.nome.toUpperCase()}`);
  console.log(`📊  Nível: ${nivelSelecionado}`);
  console.log("═".repeat(55));
  console.log(`\n📝 ${desafio.titulo}\n`);
  console.log("Descrição:");
  console.log(`   ${desafio.descricao}\n`);
  console.log("Exemplo de uso:");
  console.log(`   ${desafio.exemplo}\n`);
  console.log("💡 Dica:");
  console.log(`   ${desafio.dica}`);
  console.log("\n" + "─".repeat(55));
  console.log(
    `🎓 Ao concluir, gere seu certificado:\n` +
      `   node commands/certificado.js "${trilha.id}" "${desafio.titulo}"`
  );
  console.log("─".repeat(55) + "\n");
}

function main() {
  const args = process.argv.slice(2);
  const trilhas = carregarTrilhas();

  if (args.length === 0) {
    console.log("\n🌍 Geo-Explorer — Comando Desafio\n");
    console.log("Uso: node commands/desafio.js <tecnologia> [nivel]\n");
    console.log("Tecnologias disponíveis:");
    trilhas.forEach((t) => console.log(`  • ${t.id}`));
    console.log("\nNíveis: iniciante | intermediario | avancado\n");
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

  exibirDesafio(trilha, nivel);
}

main();
