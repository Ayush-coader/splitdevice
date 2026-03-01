import { DesktopUI } from './DesktopUI.js';

/**
 * DisplayController
 * Manages the initialization and lifecycle of the Display Mode UI.
 */
export class DisplayController {
    /**
     * @param {HTMLElement} container - The root element where the UI will be rendered.
     */
    constructor(container) {
        this.container = container;
        this.desktop = new DesktopUI();
    }

    /**
     * Initializes the display mode by clearing the container and rendering the Desktop UI.
     * @param {string} roomId
     */
    init(roomId) {
        console.log('Display Controller initialized');

        // Clear existing content
        this.container.innerHTML = '';

        // Render the desktop interface with Pairing UI
        this.desktop.render(this.container, roomId);
    }

    /**
     * Called when both devices are connected.
     * Transitions from Pairing UI to Workspace.
     */
    hidePairingUI() {
        if (this.desktop) {
            this.desktop.hidePairingUI();
        }
    }

    /**
     * Handles incoming events from the Input device.
     * @param {Object} event 
     */
    handleEvent(event) {
        if (event.type === "KEY_PRESS") {
            if (event.key === "BACKSPACE") {
                this.desktop.removeLastChar();
                return;
            }

            if (event.key === "ENTER") {
                this.desktop.addNewLine();
                return;
            }

            if (event.key === "SPACE") {
                this.desktop.appendText(" ");
                return;
            }

            this.desktop.appendText(event.key);
        }

        if (event.type === "CURSOR_MOVE") {
            if (this.desktop) {
                this.desktop.moveCursor(event.dx, event.dy);
            }
        }
    }

    /**
     * Updates the connection status text.
     * @param {string} text 
     */
    updateStatus(text) {
        if (this.desktop) {
            this.desktop.updateStatus(text);
        }
    }
}
