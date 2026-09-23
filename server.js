#!/usr/bin/env node
/**
 * Servidor MCP — Geo-Explorer
 * Expõe as ferramentas trilha, desafio e certificado via Model Context Protocol.
 *
 * Uso: node mcp/server.js
 *
 * Configuração no cliente MCP (ex.: Bob):
 * {
 *   "mcpServers": {
 *     "geo-explorer": {
 *       "command": "node",
 *       "args": ["<caminho-absoluto>/mcp/server.js"]
 *     }
 *   }
 * }
 */

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

// ── Helpers ─────────────────────────────────────────────────────────────────

const DATA_PATH = path.join(__dirname, "../data/trilhas.json");
const CERTS_DIR = path.join(__dirname, "../certificates");

function carregarTrilhas() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw).trilhas;
}

// ── Servidor MCP ─────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "geo-explorer",
  version: "1.0.0",
});

// ── Tool: trilha ─────────────────────────────────────────────────────────────

server.tool(
  "trilha",
  "Apresenta o plano de estudos de uma tecnologia no nível informado.",
  {
    tecnologia: z
      .string()
      .describe(
        "ID da tecnologia (ex.: javascript, python, react, nodejs)"
      ),
    nivel: z
      .enum(["iniciante", "intermediario", "avancado"])
      .optional()
      .default("iniciante")
      .describe("Nível da trilha"),
  },
  async ({ tecnologia, nivel }) => {
    const trilhas = carregarTrilhas();
    const trilha = trilhas.find((t) => t.id === tecnologia.toLowerCase());

    if (!trilha) {
      return {
        content: [
          {
            type: "text",
            text: `Trilha "${tecnologia}" não encontrada. Disponíveis: ${trilhas.map((t) => t.id).join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    const modulos = trilha.modulos[nivel];
    const linhas = [
      `🗺️  TRILHA: ${trilha.nome.toUpperCase()} — Nível: ${nivel}`,
      ``,
      trilha.descricao,
      ``,
      `📚 Módulos:`,
      ...modulos.map((m) => `  ${m.ordem}. ${m.titulo}\n     └─ ${m.descricao}`),
    ];

    return { content: [{ type: "text", text: linhas.join("\n") }] };
  }
);

// ── Tool: desafio ─────────────────────────────────────────────────────────────

server.tool(
  "desafio",
  "Gera um desafio de código para a tecnologia e nível informados.",
  {
    tecnologia: z
      .string()
      .describe("ID da tecnologia (ex.: javascript, python, react, nodejs)"),
    nivel: z
      .enum(["iniciante", "intermediario", "avancado"])
      .optional()
      .default("iniciante")
      .describe("Nível do desafio"),
  },
  async ({ tecnologia, nivel }) => {
    const trilhas = carregarTrilhas();
    const trilha = trilhas.find((t) => t.id === tecnologia.toLowerCase());

    if (!trilha) {
      return {
        content: [
          {
            type: "text",
            text: `Trilha "${tecnologia}" não encontrada. Disponíveis: ${trilhas.map((t) => t.id).join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    const desafiosNivel = trilha.desafios[nivel];

    if (!desafiosNivel || desafiosNivel.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Nenhum desafio disponível para "${trilha.nome}" no nível "${nivel}".`,
          },
        ],
        isError: true,
      };
    }

    const desafio =
      desafiosNivel[Math.floor(Math.random() * desafiosNivel.length)];

    const linhas = [
      `🏆  DESAFIO: ${trilha.nome.toUpperCase()} — Nível: ${nivel}`,
      ``,
      `📝 ${desafio.titulo}`,
      ``,
      `Descrição: ${desafio.descricao}`,
      `Exemplo:   ${desafio.exemplo}`,
      `💡 Dica:   ${desafio.dica}`,
    ];

    return { content: [{ type: "text", text: linhas.join("\n") }] };
  }
);

// ── Tool: certificado ────────────────────────────────────────────────────────

server.tool(
  "certificado",
  "Gera um certificado fictício em HTML para uma trilha concluída.",
  {
    tecnologia: z.string().describe("ID da tecnologia"),
    usuario: z.string().describe("Nome completo do usuário"),
    nivel: z
      .enum(["iniciante", "intermediario", "avancado"])
      .optional()
      .default("iniciante")
      .describe("Nível concluído"),
  },
  async ({ tecnologia, usuario, nivel }) => {
    const trilhas = carregarTrilhas();
    const trilha = trilhas.find((t) => t.id === tecnologia.toLowerCase());

    if (!trilha) {
      return {
        content: [
          {
            type: "text",
            text: `Trilha "${tecnologia}" não encontrada. Disponíveis: ${trilhas.map((t) => t.id).join(", ")}`,
          },
        ],
        isError: true,
      };
    }

    if (!fs.existsSync(CERTS_DIR)) {
      fs.mkdirSync(CERTS_DIR, { recursive: true });
    }

    const id = Date.now().toString(36).toUpperCase();
    const data = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const nomeArquivo = `cert-${id}.html`;
    const caminhoArquivo = path.join(CERTS_DIR, nomeArquivo);

    const html = buildCertHTML({ id, usuario, trilha: trilha.nome, nivel, data });
    fs.writeFileSync(caminhoArquivo, html, "utf-8");

    const resultado = [
      `🎓 Certificado gerado com sucesso!`,
      ``,
      `  Aluno  : ${usuario}`,
      `  Trilha : ${trilha.nome}`,
      `  Nível  : ${nivel}`,
      `  Data   : ${data}`,
      `  ID     : ${id}`,
      `  Arquivo: ${caminhoArquivo}`,
    ].join("\n");

    return { content: [{ type: "text", text: resultado }] };
  }
);

function buildCertHTML({ id, usuario, trilha, nivel, data }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Certificado — ${trilha}</title>
  <style>
    body { background:#f0f4f8; display:flex; justify-content:center; align-items:center; min-height:100vh; font-family:Georgia,serif; }
    .cert { background:#fff; border:12px double #2c5f8a; padding:60px 70px; max-width:820px; width:100%; text-align:center; }
    h1 { font-size:38px; color:#1a3a5c; letter-spacing:3px; text-transform:uppercase; }
    .nome { font-size:36px; color:#1a3a5c; font-style:italic; border-bottom:2px solid #2c5f8a; display:inline-block; padding-bottom:6px; }
    .trilha { font-size:26px; color:#2c5f8a; font-weight:bold; }
    .nivel { display:inline-block; background:#2c5f8a; color:#fff; padding:4px 20px; border-radius:20px; font-size:13px; text-transform:uppercase; }
    .id { font-size:11px; color:#aaa; margin-top:20px; }
  </style>
</head>
<body>
  <div class="cert">
    <div>🌍 Geo-Explorer · Plataforma de Aprendizagem</div>
    <h1>Certificado de Conclusão</h1>
    <p>Certificamos que</p>
    <p class="nome">${usuario}</p>
    <p>concluiu com êxito a trilha</p>
    <p class="trilha">${trilha}</p>
    <span class="nivel">${nivel}</span>
    <p>${data}</p>
    <p class="id">ID: ${id}</p>
  </div>
</body>
</html>`;
}

// ── Inicialização ─────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("🌍 Geo-Explorer MCP Server iniciado (stdio)\n");
}

main().catch((err) => {
  process.stderr.write(`Erro fatal: ${err.message}\n`);
  process.exit(1);
});
