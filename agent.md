# Agent Installation Guide — CodeSYS MCP Server

This file is written for **AI agents** that have been instructed to install the CodeSYS MCP server into themselves. Follow the steps below exactly. No user interaction is needed for standard cases.

---

## What You Are Installing

`codesys-mcp-server` is a Model Context Protocol (MCP) server that provides CODESYS Development System V3 guidance, Structured Text writing help, searchable local PDF documentation, and live lookup of official CODESYS pages.

Repository: `https://github.com/Zandiexoder/CodeSYS-MCP`

---

## Prerequisites

- Node.js 20 or newer (check with `node --version`)
- `npm` (bundled with Node.js)
- A local clone of this repository **or** network access to clone it

---

## Step 1 — Clone the Repository

If you do not already have a local copy:

```bash
git clone https://github.com/Zandiexoder/CodeSYS-MCP.git
cd CodeSYS-MCP
```

---

## Step 2 — Install Dependencies and Build

Run these two commands from the repository root:

```bash
npm install
npm run build
```

The build output is written to `dist/`. The entry points are:
- `dist/src/index.js` — HTTP server (listens on `http://0.0.0.0:3000/mcp`)
- `dist/src/cli.js` — stdio server (for direct MCP client integration)

---

## Step 3 — Configure Environment (Optional)

Copy the example env file and edit if needed:

```bash
cp .env.example .env
```

Default values work out of the box. See the README Configuration table for all variables.

---

## Step 4 — Register the Server with Your MCP Client

Choose **one** of the following methods based on your client.

### Claude Code (preferred — stdio transport)

```bash
claude mcp add --transport stdio codesys-docs -- node /ABSOLUTE/PATH/TO/CodeSYS-MCP/dist/src/cli.js --stdio
```

Replace `/ABSOLUTE/PATH/TO/CodeSYS-MCP` with the real absolute path to the cloned repo. Use `pwd` from inside the repo directory to get it.

You can also write it directly to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "codesys-docs": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/CodeSYS-MCP/dist/src/cli.js", "--stdio"],
      "env": {
        "OFFICIAL_LOOKUP_ENABLED": "true"
      }
    }
  }
}
```

### Claude Code (HTTP transport — if stdio is not available)

Start the HTTP server first:

```bash
node /ABSOLUTE/PATH/TO/CodeSYS-MCP/dist/src/index.js &
```

Then register:

```bash
claude mcp add --transport http codesys-docs http://localhost:3000/mcp
```

### Codex CLI

```bash
codex mcp add codesys-docs -- node /ABSOLUTE/PATH/TO/CodeSYS-MCP/dist/src/cli.js --stdio
```

### From npm (no local clone needed)

If cloning is not possible, use the published package directly:

```bash
claude mcp add --transport stdio codesys-docs -- npx -y codesys-mcp-server --stdio
```

---

## Step 5 — Verify

After registering, confirm the server is visible to your client:

```bash
claude mcp list
```

You should see `codesys-docs` in the list. To confirm the tools are reachable, call:

```bash
claude mcp call codesys-docs list_codesys_pdfs
```

Or, if running HTTP, hit the health endpoint:

```bash
curl http://localhost:3000/healthz
```

---

## Available Tools (for reference)

| Tool | Purpose |
|------|---------|
| `search_codesys_docs` | Search curated and/or official CODESYS guidance |
| `get_codesys_topic` | Explain a CODESYS topic (POUs, timers, tasks, etc.) |
| `codesys_writing_guidance` | Practical ST and project-structure design guidance |
| `list_codesys_pdfs` | List PDF documents in the configured PDF folder |
| `search_codesys_pdfs` | Search text extracted from local PDF documents |
| `get_codesys_pdf` | Return extracted text from a specific local PDF |
| `get_codesys_page` | Fetch full text from an allowlisted CODESYS docs URL |
| `crawl_codesys_help` | Crawl and index the CODESYS help site |

---

## Troubleshooting

- **`dist/` not found** — you skipped `npm run build`. Run it.
- **Node version error** — upgrade to Node 20+.
- **Port 3000 already in use** — set `PORT=3001` in `.env` before starting the HTTP server and update the `claude mcp add` URL accordingly.
- **`OFFICIAL_LOOKUP_ENABLED` warnings** — the server fetches official CODESYS pages; this requires internet access. Set `OFFICIAL_LOOKUP_ENABLED=false` in `.env` to disable.
