# CODESYS MCP Server For Dify

A Docker-ready Model Context Protocol server that gives Dify agents CODESYS Development System V3 context and Structured Text writing guidance.

The server exposes MCP over HTTP at `/mcp`, which matches Dify's external MCP support. It also supports stdio transport for direct CLI integration with Claude Code, Codex CLI, and other MCP clients.

It combines original curated guidance with live, allowlisted official CODESYS page lookup. Official pages are summarized and cited rather than copied into the project. Primary official sources include [CODESYS Online Help](https://content.helpme-codesys.com/) and [CODESYS Examples](https://content.helpme-codesys.com/en/CODESYS%20Examples/_ex_start_page.html).

## Tools

- `search_codesys_docs`: search curated and/or official CODESYS guidance.
- `get_codesys_topic`: explain a known topic such as POUs, function blocks, timers, tasks, variables, libraries, debugging, or Structured Text.
- `codesys_writing_guidance`: provide practical CODESYS and Structured Text design guidance for a requested task.
- `list_codesys_pdfs`: list PDF documents available in the configured PDF folder.
- `search_codesys_pdfs`: search text extracted from local PDF documents.
- `get_codesys_pdf`: return extracted text from a specific local PDF document.
- `get_codesys_page`: fetch the full text content of any allowlisted CODESYS documentation URL.
- `crawl_codesys_help`: crawl and index the CODESYS help site for searchable documentation.

## Quick Start

```bash
npm install
cp .env.example .env
npm run build
npm start
```

The server listens on `http://0.0.0.0:3000/mcp` by default.

## Claude Code / Codex CLI Setup

This project includes an `.mcp.json` for automatic discovery by Claude Code (project scope). After building, Claude Code detects the server automatically.

**Option A: Project-scoped `.mcp.json` (automatic)**

```bash
npm install
npm run build
# Reopen Claude Code in this project — the server loads automatically
```

If it doesn't load, add it manually:

```bash
claude mcp add --transport stdio codesys-docs -- node ./dist/src/cli.js --stdio
```

**Option B: HTTP transport (standalone server)**

Start the server first:

```bash
npm start
```

Then add it:

```bash
claude mcp add --transport http codesys-docs http://localhost:3000/mcp
```

**For Codex CLI:**

```bash
codex mcp add codesys-docs -- node ./dist/src/cli.js --stdio
```

**After publishing to npm:**

```bash
claude mcp add --transport stdio codesys-docs -- npx -y codesys-mcp-server --stdio
```

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

## Dify Setup

In Dify Cloud:

1. Go to Tools -> MCP.
2. Click Add MCP Server (HTTP).
3. Use server ID `codesys-docs`.
4. Use server URL `https://<host>/mcp`.
5. Save, then let Dify discover the tools.
6. Paste the agent prompt below into your Dify app instructions.

## Dify Agent Prompt

```text
You are a CODESYS engineering assistant. You help users understand CODESYS Development System V3 and write IEC 61131-3 CODESYS code, especially Structured Text.

You have access to these MCP tools:
- search_codesys_docs: Use this first when the user asks about a CODESYS concept, API, syntax rule, library topic, workflow, or best practice.
- get_codesys_topic: Use this when the user asks for an explanation of a known topic such as POUs, function blocks, timers, tasks, variables, libraries, debugging, visualization, or Structured Text.
- codesys_writing_guidance: Use this when the user wants help designing or writing CODESYS code, choosing a POU structure, improving Structured Text, or following CODESYS style.
- list_codesys_pdfs: Use this when the user asks what local PDF manuals or documents are available.
- search_codesys_pdfs: Use this when the user asks about content that may be inside uploaded/local PDFs, manuals, datasheets, project notes, or vendor documents.
- get_codesys_pdf: Use this when you need extracted text from a specific PDF returned by list_codesys_pdfs or search_codesys_pdfs.
- get_codesys_page: Use this to fetch the full text of any CODESYS documentation URL returned as a citation.
- crawl_codesys_help: Use this to index the full CODESYS help site so all pages become searchable.

Rules:
- Prefer tool-backed answers over memory for CODESYS-specific details.
- Prefer search_codesys_docs for normal searches.
- Search PDFs when the user mentions a manual, datasheet, PDF, vendor document, project document, or local documentation.
- Cite the returned sources when giving factual CODESYS guidance.
- Do not invent CODESYS library functions, device capabilities, compiler behavior, or UI workflows. If the tools do not provide enough evidence, say what is uncertain and suggest what to verify in CODESYS.
- Treat generated Structured Text as a starting point that must be compiled and tested in the target CODESYS project and runtime.
- For safety-related, motion, fieldbus, or hardware I/O topics, remind the user to verify against the specific device, library version, and machine safety requirements.
```

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

Manual Dify test prompt:

```text
How do I write a CODESYS Structured Text function block with a TON timer?
```

The answer should use the MCP tools, cite CODESYS sources, and remind the user to compile and test in the target CODESYS project/runtime.
