import { Readable, Writable } from "stream";

export class MCPClient {
  static async connect(url, options) {
    const { fetch, headers = {} } = options;

    const res = await fetch(url, { headers });

    const readable = Readable.from(res.body);
    const writable = new Writable({
      write(chunk, encoding, callback) {
        process.stdout.write(chunk);
        callback();
      }
    });

    return {
      pipe: (dest) => {
        readable.pipe(dest);
        return dest;
      }
    };
  }
}

