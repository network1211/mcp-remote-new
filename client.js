"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const stream_1 = require("stream");
class MCPClient {
    static connect(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fetch, headers = {} } = options;
            const res = yield fetch(url, { headers });
            const readable = stream_1.Readable.from(res.body);
            const writable = new stream_1.Writable({
                write(chunk, encoding, callback) {
                    process.stdout.write(chunk);
                    callback();
                }
            });
            return { pipe: (dest) => readable.pipe(dest) };
        });
    }
}
exports.MCPClient = MCPClient;
