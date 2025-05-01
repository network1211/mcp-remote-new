#!/usr/bin/env node

import { MCPClient } from "./client.js";
import { createStdioTransport } from "./transport-stdio.js";
import fetch from "node-fetch";
import open from "open";

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: new-mcp-remote <remote_sse_url>");
  process.exit(1);
}

const remoteSseUrl = args[0];
const localTransport = createStdioTransport();

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 3000;

let didOpenBrowser = false;

async function tryConnectWithRetry() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const remoteTransport = await MCPClient.connect(remoteSseUrl, {
        fetch: async (url, options) => {
          const response = await fetch(url, {
            ...options,
            redirect: "manual",
          });

          if (
            response.status === 302 ||
            response.status === 303 ||
            response.status === 307
          ) {
            const redirectUrl = response.headers.get("location");
            if (redirectUrl) {
              console.error(`Detected OAuth redirect to: ${redirectUrl}`);
              if (!didOpenBrowser) {
                await open(redirectUrl);
                didOpenBrowser = true;
              }
            } else {
              console.error("Redirect detected but no location header found.");
            }
            throw new Error("OAuth redirect triggered");
          }

          return response;
        },
        headers: {},
      });

      // Pipe STDIO <-> Remote MCP server
      localTransport.pipe(remoteTransport);
      remoteTransport.pipe(localTransport);
      return; // success
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        const waitTime = RETRY_INTERVAL_MS * attempt;
        console.error(
          `Waiting ${waitTime / 1000}s before retry (${attempt}/${MAX_RETRIES})...`
        );
        await new Promise((r) => setTimeout(r, waitTime));
      } else {
        console.error("Failed to connect after 5 attempts. Please complete login in the browser and try again.");
      }
    }
  }
}

tryConnectWithRetry();

