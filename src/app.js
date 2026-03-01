import { RoleSelection } from './shared/RoleSelection.js';
import { DisplayController } from './display/DisplayController.js';
import InputController from "./input/InputController.js";

// Selecting root element
const root = document.getElementById('app');

// Application state
const state = {
    role: null,
    roomId: null,
    socket: null
};

// Global variables for reconnection
let socket;
let reconnectAttempts = 0;

/**
 * Handle role selection event.
 * @param {string} role - "DISPLAY" or "INPUT"
 * @param {string} roomId - 6-character room ID
 */
const handleSelection = (role, roomId) => {
    state.role = role;
    state.roomId = roomId;

    console.log(`Selected Role: ${role} | Room: ${roomId}`);

    // Determine Controller
    let controller;
    if (role === 'DISPLAY') {
        controller = new DisplayController(root);
        controller.init(roomId);
    } else {
        root.innerHTML = "";
        controller = new InputController(
            root,
            roomId,
            (event) => {
                // Remote device sync via WebSocket
                if (socket && socket.readyState === WebSocket.OPEN) {
                    event.roomId = roomId;
                    socket.send(JSON.stringify(event));
                }
            }
        );
        controller.init();
    }

    /**
     * Initializes and manages the WebSocket connection
     */
    function connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        socket = new WebSocket(`${protocol}//${window.location.host}`);

        socket.onopen = () => {
            console.log("WebSocket connected. Sending JOIN...");
            reconnectAttempts = 0;
            controller.updateStatus("🟡 Connected to server...");

            socket.send(JSON.stringify({
                type: "JOIN",
                roomId,
                role
            }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "READY") {
                    if (role === "DISPLAY") {
                        controller.updateStatus("🟢 Connected to Input Device");
                        controller.hidePairingUI();
                    } else {
                        controller.updateStatus("🟢 Connected to Display");
                    }
                    return;
                }

                if (data.type === "ERROR") {
                    alert(data.message);
                    controller.updateStatus(`🔴 Error: ${data.message}`);
                    return;
                }

                if (data.type === "JOINED") {
                    console.log("Joined room:", roomId);
                    return;
                }

                // Route interaction events to Display
                if (role === "DISPLAY" && (data.type === "KEY_PRESS" || data.type === "CURSOR_MOVE")) {
                    controller.handleEvent(data);
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };

        socket.onclose = () => {
            console.warn("WebSocket disconnected. Reconnecting...");
            controller.updateStatus("🔴 Disconnected. Reconnecting...");
            attemptReconnect();
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            socket.close();
        };
    }

    /**
     * Attempts to reconnect with a basic delay
     */
    function attemptReconnect() {
        const delay = Math.min(5000, 1000 * (reconnectAttempts + 1));

        setTimeout(() => {
            reconnectAttempts++;
            connect();
        }, delay);
    }

    // Initial connection
    connect();
    state.socket = socket;
};

// Application Start
const params = new URLSearchParams(window.location.search);
const roomFromURL = params.get("room");

const roleSelection = new RoleSelection(handleSelection);
roleSelection.render(root, roomFromURL);
