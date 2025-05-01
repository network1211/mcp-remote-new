import readline from "readline";
import { PassThrough } from "stream";

export function createStdioTransport() {
  const input = process.stdin;
  const output = process.stdout;
  const incoming = new PassThrough();
  const outgoing = new PassThrough();

  // Pipe outgoing stream to stdout
  outgoing.pipe(output);

  // Read from stdin and push into incoming
  const rl = readline.createInterface({ input });
  rl.on("line", (line) => {
    incoming.write(line + "\n");
  });

  return {
    readable: incoming,
    writable: outgoing,
    pipe(destination) {
      this.readable.pipe(destination.writable);
      destination.readable.pipe(this.writable);
    },
  };
}

