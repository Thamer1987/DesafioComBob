/**
 * Testes automatizados — Geo-Explorer
 * Execução: node tests/index.test.js
 *
 * Utiliza apenas a biblioteca padrão do Node.js (assert).
 * Sem dependências externas.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// ── Contadores ────────────────────────────────────────────────────────────────

let passou = 0;
let falhou = 0;
const falhas = [];

function teste(descricao, fn) {
  try {
    fn();
    console.log(`  ✅ ${descricao}`);
    passou++;
  } catch (err) {
    console.log(`  ❌ ${descricao}`);
    console.log(`     ${err.message}`);
    falhou++;
    falhas.push({ descricao, erro: err.message });
  }
}

function secao(titulo) {
  console.log(`\n📋 ${titulo}`);
  console.log("─".repeat(50));
}

// ── Carregar dados ────────────────────────────────────────────────────────────

const DATA_PATH = path.join(__dirname, "../data/trilhas.json");

let dadosBrutos;
let trilhas;

// ── Suite 1: Arquivo de dados ─────────────────────────────────────────────────

secao("Arquivo de dados (trilhas.json)");

teste("O arquivo trilhas.json existe", () => {
  assert.ok(fs.existsSync(DATA_PATH), "Arquivo não encontrado: " + DATA_PATH);
});

teste("O arquivo é um JSON válido", () => {
  dadosBrutos = fs.readFileSync(DATA_PATH, "utf-8");
  assert.doesNotThrow(() => {
    trilhas = JSON.parse(dadosBrutos).trilhas;
  }, "JSON inválido");
});

teste("Existe pelo menos uma trilha", () => {
  assert.ok(Array.isArray(trilhas) && trilhas.length > 0, "Array de trilhas vazio");
});

teste("Cada trilha possui os campos obrigatórios", () => {
  const campos = ["id", "nome", "descricao", "niveis", "modulos", "desafios"];
  trilhas.forEach((t) => {
    campos.forEach((c) => {
      assert.ok(c in t, `Trilha "${t.id || "?"}" não possui o campo "${c}"`);
    });
  });
});

teste("Cada trilha possui os três níveis", () => {
  const niveisEsperados = ["iniciante", "intermediario", "avancado"];
  trilhas.forEach((t) => {
    niveisEsperados.forEach((n) => {
      assert.ok(
        Array.isArray(t.modulos[n]) && t.modulos[n].length > 0,
        `Trilha "${t.id}" não possui módulos para nível "${n}"`
      );
    });
  });
});

teste("Cada módulo possui ordem, titulo e descricao", () => {
  trilhas.forEach((t) => {
    Object.values(t.modulos).forEach((modulosNivel) => {
      modulosNivel.forEach((m) => {
        assert.ok("ordem" in m, "Módulo sem campo 'ordem'");
        assert.ok("titulo" in m, "Módulo sem campo 'titulo'");
        assert.ok("descricao" in m, "Módulo sem campo 'descricao'");
      });
    });
  });
});

// ── Suite 2: Lógica de busca de trilhas ───────────────────────────────────────

secao("Lógica de busca de trilhas");

teste("Encontra trilha por ID existente", () => {
  const encontrada = trilhas.find((t) => t.id === "javascript");
  assert.ok(encontrada, "Trilha 'javascript' não encontrada");
  assert.strictEqual(encontrada.nome, "JavaScript");
});

teste("Retorna undefined para ID inexistente", () => {
  const resultado = trilhas.find((t) => t.id === "cobol");
  assert.strictEqual(resultado, undefined);
});

teste("Busca é case-insensitive quando normalizada", () => {
  const encontrada = trilhas.find((t) => t.id === "PYTHON".toLowerCase());
  assert.ok(encontrada, "Trilha 'python' não encontrada após toLowerCase");
});

// ── Suite 3: Desafios ─────────────────────────────────────────────────────────

secao("Desafios");

teste("Cada desafio possui titulo, descricao, exemplo e dica", () => {
  trilhas.forEach((t) => {
    Object.entries(t.desafios).forEach(([nivel, lista]) => {
      lista.forEach((d) => {
        ["titulo", "descricao", "exemplo", "dica"].forEach((campo) => {
          assert.ok(
            campo in d,
            `Desafio em "${t.id}/${nivel}" sem campo "${campo}"`
          );
        });
      });
    });
  });
});

teste("Sorteio de desafio retorna um item válido", () => {
  const desafios = trilhas[0].desafios["iniciante"];
  const idx = Math.floor(Math.random() * desafios.length);
  const sorteado = desafios[idx];
  assert.ok(sorteado && sorteado.titulo, "Desafio sorteado inválido");
});

// ── Suite 4: Geração de certificado ──────────────────────────────────────────

secao("Geração de certificado");

const CERTS_DIR = path.join(__dirname, "../certificates");

function gerarIdTeste() {
  return "TEST" + Date.now().toString(36).toUpperCase();
}

function buildCertHTML({ id, usuario, trilha, nivel, data }) {
  return `<!DOCTYPE html><html><body><p>Certificado de ${usuario} — ${trilha} — ${nivel} — ${data} — ID:${id}</p></body></html>`;
}

teste("Cria o diretório certificates se não existir", () => {
  if (fs.existsSync(CERTS_DIR)) {
    // já existe — ok
  } else {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }
  assert.ok(fs.existsSync(CERTS_DIR), "Diretório não foi criado");
});

teste("Gera um arquivo HTML de certificado", () => {
  const id = gerarIdTeste();
  const certPath = path.join(CERTS_DIR, `cert-${id}.html`);
  const html = buildCertHTML({
    id,
    usuario: "João Teste",
    trilha: "JavaScript",
    nivel: "iniciante",
    data: "01 de janeiro de 2025",
  });
  fs.writeFileSync(certPath, html, "utf-8");
  assert.ok(fs.existsSync(certPath), "Arquivo de certificado não foi criado");

  // Limpeza
  fs.unlinkSync(certPath);
});

teste("Conteúdo do HTML contém nome do usuário", () => {
  const html = buildCertHTML({
    id: "TESTID",
    usuario: "Maria Oliveira",
    trilha: "React",
    nivel: "avancado",
    data: "15 de março de 2025",
  });
  assert.ok(html.includes("Maria Oliveira"), "Nome do usuário não encontrado no HTML");
  assert.ok(html.includes("React"), "Nome da trilha não encontrado no HTML");
  assert.ok(html.includes("avancado"), "Nível não encontrado no HTML");
});

// ── Resultado final ───────────────────────────────────────────────────────────

console.log("\n" + "═".repeat(50));
console.log(`📊 Resultado: ${passou} passou(aram) | ${falhou} falhou(aram)`);
console.log("═".repeat(50));

if (falhas.length > 0) {
  console.log("\n⚠️  Falhas detalhadas:");
  falhas.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.descricao}`);
    console.log(`     ${f.erro}`);
  });
  process.exit(1);
} else {
  console.log("\n🎉 Todos os testes passaram!\n");
}
