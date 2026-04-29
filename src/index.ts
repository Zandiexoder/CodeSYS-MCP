import { loadConfig } from "./config.js";
import { createApp } from "./server.js";

const config = loadConfig();
const app = createApp(config);

const server = app.listen(config.port, config.host, () => {
  console.log(`CODESYS MCP server listening on http://${config.host}:${config.port}/mcp`);
});

function shutdown(signal: string) {
  console.log(`\nReceived ${signal}, shutting down...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.log("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
