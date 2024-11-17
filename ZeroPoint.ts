/*
since Vite is not compatible(and honestly, kinda shit) with Quark, we need to use esbuild and WebSockets
to make a simple dev server, with just the basics(watch for file changes, compile and return tsx/jsx/ts)

make sure to add

    <script type="text/javascript">
        // if we are in a localhost dev server, setup a websocket
        if(
            location.href.startsWith("http://localhost") ||
            location.href.startsWith("https://localhost")
        )
        {
            const socket = new WebSocket(
                location.href.replace("http://","ws://").replace("https://","wss://")
            );

            socket.onmessage = function(event) {
                if (event.data === "reload") {
                    location.reload();
                }
            };
        }
    </script>

to your html, if you want live reload,

it doesn't have the ability to expose your ip to the internet, so if you want to test it with multiple users, learn port-forwarding
examples:
- [zerotier one](https://www.zerotier.com/download/)
- [Port Forwarding: A Step-by-Step Guide for Beginners](https://www.youtube.com/watch?v=srM4gdNCaKs)

- Cross
*/
/********************\
*    ZeroPoint.ts    *
*       v0.3       *
\********************/

import { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import esbuild from "esbuild";
import crypto from "crypto";

// Directory to serve files from
const webDirectory = process.argv[2] || path.resolve(__dirname, "src");
console.log(`ZeroPoint will use ${webDirectory}`)

const mimeType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.wasm': 'application/wasm',
};

// Cache object for compiled files
const cache: { [key: string]: { content: string, mtime: number } } = {};

// Helper function to generate a file hash for cache invalidation
function generateFileHash(filePath: string): string {
    const fileContent = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileContent).digest('hex');
}

// Create HTTP server to serve static files
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = `${webDirectory}${parsedUrl.pathname}`;

    // Prevent directory traversal
    pathname = pathname.replace(/^(\.\.[\/\\])+/, '');

    fs.promises.stat(pathname)
        .then((stat) => {
            // If it's a directory, look for index.html
            if (stat.isDirectory()) {
                pathname += '/index.html';
            }

            return fs.promises.readFile(pathname);
        })
        .then((data) => {
            const ext = path.parse(pathname).ext;
            if (ext === ".tsx" || ext === ".ts" || ext === ".jsx") {
                // Check cache first
                const fileHash = generateFileHash(pathname);
                const cacheEntry = cache[fileHash];

                if (cacheEntry && cacheEntry.mtime === fs.statSync(pathname).mtimeMs) {
                    // Serve from cache if the file hasn't changed
                    res.setHeader('Content-type', 'application/javascript');
                    res.end(cacheEntry.content);
                    console.log(`${pathname} found in cache, serving from cache`);
                    return;
                }
                console.log(`rebuilding ${pathname}`)

                // Compile the .tsx file using esbuild with Quark as JSX factory
                const result = esbuild.buildSync({
                    entryPoints: [pathname],
                    bundle: true,
                    write: false,
                    jsx: 'transform',
                    jsxImportSource: "quark",  // This makes sure it uses Quark's JSX factory
                    loader: {
                        ".tsx": "tsx",  // Load .tsx files
                        ".ts": "ts",  // Load .ts files
                        ".jsx": "jsx",  // Load .jsx files
                    },
                    jsxFactory: "Quark.createElement",  // The JSX factory function for Quark
                });

                // Cache the compiled file
                cache[fileHash] = {
                    content: result.outputFiles[0].text,
                    mtime: fs.statSync(pathname).mtimeMs
                };

                res.setHeader('Content-type', 'application/javascript');
                res.end(result.outputFiles[0].text);
                return;
            }

            res.setHeader('Content-type', mimeType[ext] || 'text/plain');
            res.end(data);
        })
        .catch((err) => {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
        });
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

const connections: WebSocket[] = [];

wss.on("connection", (client) => {
    connections.push(client);

    client.on("close", () => {
        connections.splice(connections.indexOf(client), 1);
    });

    client.on("error", (err) => {
        console.error("WebSocket error: ", err);
    });
});
// avoid rebuilding the server's file, if it is in the same directory as the project
const serverFile = path.basename(__filename)
// Watch the $DIR directory for changes and trigger reloads
fs.watch(webDirectory, { recursive: true }, (eventType, filename) => {
    if (filename) {
        if(filename == serverFile) return
        // Invalidate the cache when a file changes
        const filePath = path.resolve(webDirectory, filename);
        const fileHash = generateFileHash(filePath);
        delete cache[fileHash];  // Remove the cached version to force a recompile
        console.log(`${filePath} changed, recompiling...`);

        // Send reload message to all connected clients
        connections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send("reload");
            }
        });
    }
});

// Start the server
const PORT = 5173;
server.listen(PORT, () => {
    console.log("\t\x1b[32mZeroPoint v0.3\x1b[0m");  // Green text for version
    console.log("\t\x1b[34m->\x1b[32m Server is listening on port \x1b[34m" + PORT + "\x1b[0m");  // Blue and green coloring for the message
    console.log("\thttp://localhost:" + PORT);
});
