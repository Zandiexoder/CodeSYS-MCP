# CODESYS MCP Server

A Model Context Protocol server for CODESYS Development System V3. It gives MCP clients curated CODESYS guidance, Structured Text writing help, searchable local PDF documentation, and optional live lookup of allowlisted official CODESYS pages.

The server can run over HTTP at `/mcp` or over stdio for direct CLI and agent integration. Official pages are summarized and cited rather than copied into the project. Primary official sources include [CODESYS Online Help](https://content.helpme-codesys.com/) and [CODESYS Examples](https://content.helpme-codesys.com/en/CODESYS%20Examples/_ex_start_page.html).

## Tools

- `search_codesys_docs`: search curated and/or official CODESYS guidance.
- `get_codesys_topic`: explain a known topic such as POUs, function blocks, timers, tasks, variables, libraries, debugging, or Structured Text.
- `codesys_writing_guidance`: provide practical CODESYS and Structured Text design guidance for a requested task.
- `list_codesys_pdfs`: list PDF documents available in the configured PDF folder.
- `search_codesys_pdfs`: search text extracted from local PDF documents.
- `get_codesys_pdf`: return extracted text from a specific local PDF document.
- `get_codesys_page`: fetch the full text content of any allowlisted CODESYS documentation URL.
- `crawl_codesys_help`: crawl and index the CODESYS help site for searchable documentation.

## What It Does

- Searches curated CODESYS guidance for concepts, syntax, and workflow help.
- Explains common CODESYS topics such as POUs, function blocks, timers, tasks, variables, libraries, debugging, and Structured Text.
- Provides practical Structured Text and project-structure guidance.
- Searches local PDF manuals and notes placed in `docs/pdfs/`.
- Fetches and summarizes allowlisted official CODESYS documentation pages.
- Crawls the official help site to build a searchable index.

## Install For A Human

Use this when you want to run the server yourself on your machine.

Prerequisites:

- Node.js 20 or newer
- `npm`

From a fresh clone:

```bash
npm install
cp .env.example .env
npm run build
```

Start the HTTP server:

```bash
npm start
```

Or start the stdio server:

```bash
npm run start:stdio
```

By default, the HTTP server listens on `http://0.0.0.0:3000/mcp`.

## Install For An LLM Or Agent

> **AI agent?** Read [`agent.md`](agent.md) — it contains the complete, step-by-step self-installation guide written specifically for you. Start there.

Use this section when an LLM is being instructed to connect itself to the server as an MCP client.

Suggested instruction to give the LLM:

```text
Read agent.md in the repository root. It contains the exact steps to install this MCP server into yourself.
```

1. Build the project first:

```bash
npm install
npm run build
```

2. Prefer stdio transport for local agent integration.
3. Add the server to the client using the local build output:

```bash
claude mcp add --transport stdio codesys-docs -- node ./dist/src/cli.js --stdio
```

4. If the client needs HTTP instead, start the server and register the endpoint:

```bash
npm start
```

```bash
claude mcp add --transport http codesys-docs http://localhost:3000/mcp
```

5. If the agent can only work from a published package, use:

```bash
claude mcp add --transport stdio codesys-docs -- npx -y codesys-mcp-server --stdio
```

For Codex CLI:

```bash
codex mcp add codesys-docs -- node ./dist/src/cli.js --stdio
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run build
npm start
```

The server listens on `http://0.0.0.0:3000/mcp` by default.

## Docker

```bash
docker compose up --build
```

The compose file mounts `./docs/pdfs` into the container as read-only, so you can add PDFs locally without rebuilding the image.

## PDF Folder

Put CODESYS manuals, vendor PDFs, project notes, datasheets, or exported documentation in:

```text
docs/pdfs/
```

The MCP server extracts text from `.pdf` files in that folder and makes them available through:

- `search_codesys_docs` with `sourceMode: "pdf"` or `sourceMode: "all"`
- `list_codesys_pdfs`
- `search_codesys_pdfs`
- `get_codesys_pdf`

PDF text extraction is best for searchable text PDFs. Scanned image-only PDFs may return little or no content unless OCR has already been applied. Extracted text may omit diagrams, screenshots, formatting, and some tables, so important engineering details should be verified against the original PDF.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port. |
| `HOST` | `0.0.0.0` | Bind host. |
| `OFFICIAL_LOOKUP_ENABLED` | `true` | Enables live official CODESYS page lookup. |
| `OFFICIAL_LOOKUP_TIMEOUT_MS` | `3500` | Fetch timeout per official page. |
| `OFFICIAL_LOOKUP_CACHE_TTL_SECONDS` | `3600` | In-memory cache TTL for official pages. |
| `PDF_SEARCH_ENABLED` | `true` | Enables text extraction/search for local PDFs. |
| `PDF_DOCS_DIR` | `docs/pdfs` | Folder scanned for `.pdf` files. |
| `PDF_MAX_TEXT_CHARS` | `200000` | Maximum extracted text stored per PDF. |

## CLI Usage

```bash
# HTTP server (default)
node dist/src/cli.js
npm start

# Stdio server (for Claude Code / Codex CLI MCP integration)
node dist/src/cli.js --stdio
npm run start:stdio
```

## Acceptance Checks

```bash
npm test
npm run build
curl http://localhost:3000/healthz
```
