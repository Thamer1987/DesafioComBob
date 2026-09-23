# Servidor MCP — Geo-Explorer

O servidor MCP expõe as ferramentas do Geo-Explorer via **Model Context Protocol (stdio)**, permitindo que agentes de IA as utilizem diretamente.

## Ferramentas

### `trilha`

**Descrição:** Retorna o plano de estudos de uma tecnologia no nível informado.

**Parâmetros:**

| Parâmetro   | Tipo   | Obrigatório | Padrão      | Descrição                                   |
|-------------|--------|-------------|-------------|---------------------------------------------|
| tecnologia  | string | ✅           | —           | ID da trilha: `javascript`, `python`, `react`, `nodejs` |
| nivel       | enum   | ❌           | `iniciante` | `iniciante` \| `intermediario` \| `avancado` |

---

### `desafio`

**Descrição:** Sorteia e retorna um desafio de código para a tecnologia e nível informados.

**Parâmetros:**

| Parâmetro   | Tipo   | Obrigatório | Padrão      | Descrição               |
|-------------|--------|-------------|-------------|-------------------------|
| tecnologia  | string | ✅           | —           | ID da trilha            |
| nivel       | enum   | ❌           | `iniciante` | Nível do desafio        |

---

### `certificado`

**Descrição:** Gera um certificado fictício em HTML e salva em `certificates/`.

**Parâmetros:**

| Parâmetro   | Tipo   | Obrigatório | Padrão      | Descrição                    |
|-------------|--------|-------------|-------------|------------------------------|
| tecnologia  | string | ✅           | —           | ID da trilha                 |
| usuario     | string | ✅           | —           | Nome completo do usuário     |
| nivel       | enum   | ❌           | `iniciante` | Nível concluído              |

---

## Configuração no IBM Bob

```json
{
  "mcpServers": {
    "geo-explorer": {
      "command": "node",
      "args": ["/caminho/absoluto/para/geo-explorer/mcp/server.js"]
    }
  }
}
```

Após configurar, reinicie o Bob. As ferramentas `trilha`, `desafio` e `certificado` estarão disponíveis automaticamente.
