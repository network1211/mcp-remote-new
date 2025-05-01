#!/usr/bin/env node

import { MCPClient } from "./client.js";
import { createStdioTransport } from "./transport-stdio.js";
import fetch from "node-fetch";
import open from "open";
import { URL } from "url"; // Needed to resolve relative URLs

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
        redirect: "manual", // Detect redirect manually
      });

      if ([302, 303, 307].includes(response.status)) {
        const locationHeader = response.headers.get("location");
        if (locationHeader) {
          const absoluteUrl = new URL(locationHeader, url).toString();
          console.log(`Detected OAuth redirect to: ${absoluteUrl}`);
          await open(absoluteUrl);
        } else {
          console.error("Redirect detected but no location header found.");
        }
        throw new Error("OAuth redirect triggered");
      }

      return response;
    },
    headers: {}, // Leave empty; proxy handles Authorization
  });

  localTransport.pipe(remoteTransport);
  remoteTransport.pipe(localTransport);
} catch (err) {
  console.error("Connection failed:", err.message);
}

