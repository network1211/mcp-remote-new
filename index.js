#!/usr/bin/env node

import { MCPClient } from "./client.js";
import { createStdioTransport } from "./transport-stdio.js";
import fetch from "node-fetch";
import open from "open";
import { URL } from "url";

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: new-mcp-remote <remote_sse_url>");
  process.exit(1);
}

const remoteSseUrl = args[0];
const localTransport = createStdioTransport();

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithOAuthRetry() {
  const maxRetries = 5;
  let redirectedUrl = null;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const remoteTransport = await MCPClient.connect(remoteSseUrl, {
        fetch: async (url, options) => {
          const response = await fetch(url, {
            ...options,
            redirect: "manual",
          });

          if ([302, 303, 307].includes(response.status)) {
            const locationHeader = response.headers.get("location");
            if (locationHeader) {
              redirectedUrl = new URL(locationHeader, url).toString();
              console.log(`Detected OAuth redirect to: ${redirectedUrl}`);
              if (attempt === 0) await open(redirectedUrl);
              throw new Error("OAuth redirect triggered");
            }
          }

          return response;
        },
        headers: {},
      });

      localTransport.pipe(remoteTransport);
      remoteTransport.pipe(localTransport);
      return; // successful, exit loop
    } catch (err) {
      if (err.message.includes("OAuth redirect triggered")) {
        attempt++;
        const waitMs = 3000 + attempt * 2000; // 3s, 5s, 7s...
        console.log(`Waiting ${waitMs / 1000}s for user to complete login... [Attempt ${attempt}/${maxRetries}]`);
        await delay(waitMs);
        continue;
      } else {
        console.error("Connection failed:", err.message);
        return;
      }
    }
  }

  console.error(`Failed to connect after ${maxRetries} attempts. Please complete login in the browser and try again.`);
}

try {
  await connectWithOAuthRetry();
} catch (err) {
  console.error("Fatal error:", err.message);
}

