import readline from 'readline';
import { PassThrough, Readable, Writable } from 'stream';

export function createStdioTransport() {
  const input = process.stdin;
  const output = process.stdout;

  const incoming = new PassThrough();
  const outgoing = new PassThrough();

  // Pipe output from the outgoing stream to stdout
  outgoing.pipe(output);

  // Read lines from stdin and write them into incoming stream
  const rl = readline.createInterface({ input });
  rl.on('line', (line) => {
    incoming.write(line + '\n');
  });

  return {
    readable: incoming as Readable,
    writable: outgoing as Writable,
    pipe(destination: { writable: Writable; readable: Readable }) {
      this.readable.pipe(destination.writable);
      destination.readable.pipe(this.writable);
    },
  };
}

