import { WebSocketServer } from "ws";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple HTTP server to serve frontend
const server = http.createServer((req, res) => {
    // Normalizing requested URL
    let url = req.url === "/" ? "index.html" : req.url;
    let filePath = path.join(__dirname, "../src", url);

    // Basic MIME type handling for static files
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg': 'image/svg+xml'
    };
    contentType = mimeTypes[ext] || 'text/html';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("404: File Not Found");
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// WebSocket Server attached to the HTTP server
const wss = new WebSocketServer({ server });

// Map to store rooms (roomId -> { clients: Set, roles: Map })
const rooms = new Map();

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { type, roomId, role } = data;

            if (type === "JOIN") {
                if (!rooms.has(roomId)) {
                    console.log(`Creating room: ${roomId}`);
                    rooms.set(roomId, {
                        clients: new Set(),
                        roles: new Map()
                    });
                }

                const room = rooms.get(roomId);

                // Check total limit
                if (room.clients.size >= 2) {
                    console.warn(`Room ${roomId} is full`);
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: "Room full"
                    }));
                    return;
                }

                // Check role uniqueness
                const existingRoles = Array.from(room.roles.values());
                if (existingRoles.includes(role)) {
                    ws.send(JSON.stringify({
                        type: "ERROR",
                        message: `${role} already connected`
                    }));
                    return;
                }

                console.log("JOIN:", roomId, role);
                console.log(`Client joined room ${roomId} as ${role}`);
                room.clients.add(ws);
                room.roles.set(ws, role);

                ws.send(JSON.stringify({
                    type: "JOINED",
                    message: "Joined successfully"
                }));

                // If both roles present → notify both
                if (room.roles.size === 2) {
                    room.clients.forEach(client => {
                        client.send(JSON.stringify({
                            type: "READY",
                            message: "Both devices connected"
                        }));
                    });
                }

                return;
            }

            // Relay non-JOIN events if room exists
            if (rooms.has(roomId)) {
                console.log("Relaying event in room:", roomId);
                const room = rooms.get(roomId);
                room.clients.forEach(client => {
                    if (client !== ws && client.readyState === 1) { // 1 = OPEN
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (e) {
            console.error("Failed to process message:", e.message);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        // Remove client from all rooms and roles
        rooms.forEach((room, roomId) => {
            if (room.clients.has(ws)) {
                room.clients.delete(ws);
                room.roles.delete(ws);
                console.log(`Removed client from room: ${roomId}`);

                // Cleanup empty room
                if (room.clients.size === 0) {
                    rooms.delete(roomId);
                    console.log(`Deleted empty room: ${roomId}`);
                }
            }
        });
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
