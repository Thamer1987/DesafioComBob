#!/usr/bin/env node
/**
 * Comando: certificado
 * Uso: node commands/certificado.js <tecnologia> <nome_usuario> [nivel]
 * Exemplo: node commands/certificado.js javascript "Maria Silva" intermediario
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/trilhas.json");
const CERTS_DIR = path.join(__dirname, "../certificates");

function carregarTrilhas() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw).trilhas;
}

function gerarId() {
  return Date.now().toString(36).toUpperCase();
}

function dataFormatada() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function salvarCertificadoHTML(certificado) {
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }

  const nomeArquivo = `cert-${certificado.id}.html`;
  const caminhoArquivo = path.join(CERTS_DIR, nomeArquivo);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificado — ${certificado.trilha}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f0f4f8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .certificado {
      background: #fff;
      border: 12px double #2c5f8a;
      padding: 60px 70px;
      max-width: 820px;
      width: 100%;
      text-align: center;
      position: relative;
    }
    .certificado::before, .certificado::after {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px solid #2c5f8a;
      pointer-events: none;
    }
    .certificado::after { inset: 14px; }
    .logo {
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #2c5f8a;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 38px;
      color: #1a3a5c;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .subtitulo {
      font-size: 14px;
      color: #666;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 40px;
    }
    .texto {
      font-size: 17px;
      color: #444;
      line-height: 1.8;
      margin-bottom: 10px;
    }
    .nome {
      font-size: 36px;
      color: #1a3a5c;
      font-style: italic;
      margin: 20px 0;
      border-bottom: 2px solid #2c5f8a;
      display: inline-block;
      padding-bottom: 6px;
    }
    .trilha-nome {
      font-size: 26px;
      color: #2c5f8a;
      font-weight: bold;
      margin: 16px 0;
    }
    .nivel {
      display: inline-block;
      background: #2c5f8a;
      color: #fff;
      padding: 4px 20px;
      border-radius: 20px;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    .rodape {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 50px;
      font-size: 13px;
      color: #888;
    }
    .assinatura {
      text-align: center;
    }
    .assinatura .linha {
      border-top: 1px solid #aaa;
      width: 200px;
      margin: 0 auto 6px;
    }
    .id {
      font-size: 11px;
      color: #aaa;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="certificado">
    <div class="logo">🌍 Geo-Explorer · Plataforma de Aprendizagem</div>
    <h1>Certificado</h1>
    <p class="subtitulo">de conclusão de trilha</p>

    <p class="texto">Certificamos que</p>
    <p class="nome">${certificado.usuario}</p>

    <p class="texto">concluiu com êxito a trilha de aprendizagem</p>
    <p class="trilha-nome">${certificado.trilha}</p>
    <span class="nivel">${certificado.nivel}</span>

    <p class="texto">demonstrando dedicação, prática e comprometimento<br>com seu desenvolvimento profissional.</p>

    <div class="rodape">
      <div>
        <strong>Data de emissão</strong><br>
        ${certificado.data}
      </div>
      <div class="assinatura">
        <div class="linha"></div>
        Geo-Explorer Academy
      </div>
    </div>

    <p class="id">ID do Certificado: ${certificado.id}</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(caminhoArquivo, html, "utf-8");
  return caminhoArquivo;
}

function main() {
  const args = process.argv.slice(2);
  const trilhas = carregarTrilhas();

  if (args.length < 2) {
    console.log("\n🌍 Geo-Explorer — Comando Certificado\n");
    console.log(
      'Uso: node commands/certificado.js <tecnologia> "<nome>" [nivel]\n'
    );
    console.log('Exemplo: node commands/certificado.js react "Ana Lima" avancado\n');
    return;
  }

  const tecnologia = args[0].toLowerCase();
  const usuario = args[1];
  const nivel = args[2] ? args[2].toLowerCase() : "iniciante";

  const trilha = trilhas.find((t) => t.id === tecnologia);

  if (!trilha) {
    console.error(
      `\n❌ Trilha "${tecnologia}" não encontrada.\n` +
        `   Disponíveis: ${trilhas.map((t) => t.id).join(", ")}\n`
    );
    process.exit(1);
  }

  if (!trilha.niveis.includes(nivel)) {
    console.error(
      `\n❌ Nível "${nivel}" inválido para "${trilha.nome}".\n` +
        `   Níveis disponíveis: ${trilha.niveis.join(", ")}\n`
    );
    process.exit(1);
  }

  const certificado = {
    id: gerarId(),
    usuario,
    trilha: trilha.nome,
    nivel,
    data: dataFormatada(),
  };

  const caminho = salvarCertificadoHTML(certificado);

  console.log("\n" + "═".repeat(55));
  console.log("🎓  CERTIFICADO GERADO COM SUCESSO!");
  console.log("═".repeat(55));
  console.log(`\n  Aluno  : ${certificado.usuario}`);
  console.log(`  Trilha : ${certificado.trilha}`);
  console.log(`  Nível  : ${certificado.nivel}`);
  console.log(`  Data   : ${certificado.data}`);
  console.log(`  ID     : ${certificado.id}`);
  console.log(`\n  📄 Arquivo salvo em:\n     ${caminho}`);
  console.log("\n" + "─".repeat(55));
  console.log("  Abra o arquivo .html no navegador para visualizar!");
  console.log("─".repeat(55) + "\n");
}

main();
