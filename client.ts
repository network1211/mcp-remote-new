import { JSONRPCRequest, JSONRPCResponse } from "./types";
import { Readable, Writable } from "stream";

export class MCPClient {
  static async connect(url: string, options: { fetch: any, headers?: any }) {
    const { fetch, headers = {} } = options;
    const res = await fetch(url, { headers });
    const readable = Readable.from(res.body);
    const writable = new Writable({
      write(chunk: any, encoding: any, callback: () => void) {
        process.stdout.write(chunk);
        callback();
      }
    });
    return { pipe: (dest: any) => readable.pipe(dest) };
  }
}

