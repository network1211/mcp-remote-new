#!/usr/bin/env node

import { MCPClient } from "./client.js";
import { createStdioTransport } from "./transport-stdio.js";
import fetch from "node-fetch";
import open from "open"; // <== Add this

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: new-mcp-remote <remote_sse_url>");
  process.exit(1);
}

const remoteSseUrl = args[0];
const localTransport = createStdioTransport();

try {
  const remoteTransport = await MCPClient.connect(remoteSseUrl, {
    fetch: async (url, options) => {
      const response = await fetch(url, {
        ...options,
        redirect: "manual", // <== Detect redirect manually
      });

      if (response.status === 302 || response.status === 303 || response.status === 307) {
        const redirectUrl = response.headers.get("location");
        if (redirectUrl) {
          console.log(`Detected OAuth redirect to: ${redirectUrl}`);
          await open(redirectUrl); // <== This opens the browser
        } else {
          console.error("Redirect detected but no location header found.");
        }
        throw new Error("OAuth redirect triggered");
      }

      return response;
    },
    headers: {}, // No Authorization header needed (proxy handles it)
  });

  localTransport.pipe(remoteTransport);
  remoteTransport.pipe(localTransport);
} catch (err) {
  console.error("Connection failed:", err.message);
}

