"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStdioTransport = createStdioTransport;
const readline_1 = __importDefault(require("readline"));
const stream_1 = require("stream");
function createStdioTransport() {
    const input = process.stdin;
    const output = process.stdout;
    const incoming = new stream_1.PassThrough();
    const outgoing = new stream_1.PassThrough();
    // Pipe output from the outgoing stream to stdout
    outgoing.pipe(output);
    // Read lines from stdin and write them into incoming stream
    const rl = readline_1.default.createInterface({ input });
    rl.on('line', (line) => {
        incoming.write(line + '\n');
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
