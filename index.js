#!/usr/bin/env node

import { MCPClient } from "@mcp/client";
import { createStdioTransport } from "@mcp/client/transport-stdio";
import fetch from "node-fetch";

// CLI args: [node, script, remote_url]
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error("Usage: new-mcp-remote <remote_sse_url>");
  process.exit(1);
}

const remoteSseUrl = args[0];

// Setup client transport from stdio
const localTransport = createStdioTransport();

// Connect to the remote MCP SSE server via reverse proxy (OAuth handled upstream)
const remoteTransport = await MCPClient.connect(remoteSseUrl, {
  fetch,
  headers: {}, // No Authorization header needed here; proxy handles it
});

// Pipe local <-> remote
localTransport.pipe(remoteTransport);
remoteTransport.pipe(localTransport);

