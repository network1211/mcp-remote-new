#!/usr/bin/env node

import { MCPClient } from "./client.js"; // use actual file path if local
import { createStdioTransport } from "./transport-stdio.js"; // or wherever the file is
import fetch from "node-fetch";

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: new-mcp-remote <remote_sse_url>");
  process.exit(1);
}

const remoteSseUrl = args[0];

const localTransport = createStdioTransport();

const remoteTransport = await MCPClient.connect(remoteSseUrl, {
  fetch,
  headers: {}, // optional: add token or headers if needed
});

localTransport.pipe(remoteTransport);
remoteTransport.pipe(localTransport);

