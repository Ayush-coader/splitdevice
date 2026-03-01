import { KeyboardUI } from './KeyboardUI.js';
import { TrackpadUI } from './TrackpadUI.js';

/**
 * InputController
 * Manages the Input Mode UI, coordinating Keyboard and Trackpad surfaces.
 */
export default class InputController {
    /**
     * @param {HTMLElement} container - Root element for the controller UI.
     * @param {string} roomId - Current session Room ID.
     * @param {Function} onEvent - Callback for handling input events.
     */
    constructor(container, roomId, onEvent) {
        this.container = container;
        this.roomId = roomId;
        this.onEvent = onEvent;
    }

    /**
     * Initializes the controller, renders the UI, and starts event listening.
     */
    init() {
        console.log(`Input Controller initialized for Room: ${this.roomId}`);

        // Clear container
        this.container.innerHTML = '';

        // Status Indicator
        this.statusEl = document.createElement("div");
        this.statusEl.className = "connection-status";
        this.statusEl.innerText = "🔴 Connecting...";
        this.container.prepend(this.statusEl);

        // Create the main wrapper with "input-wrapper" class
        const wrapper = document.createElement('div');
        wrapper.className = 'input-wrapper';
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '800px';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.gap = '24px';
        wrapper.style.margin = '0 auto';

        // Header Section
        const header = document.createElement('div');
        header.className = 'card';
        header.style.padding = '16px';
        header.style.textAlign = 'center';
        header.innerHTML = `
            <h1 style="font-size: 20px; margin-bottom: 4px;">Input Mode</h1>
            <p class="subtitle" style="margin-bottom: 0;">Room ID: <span style="color: var(--accent-color); font-weight: 700;">${this.roomId}</span></p>
        `;
        wrapper.appendChild(header);

        // TASK 1: Render Keyboard section FIRST
        const keyboardSection = document.createElement('div');
        keyboardSection.className = 'keyboard-section';
        wrapper.appendChild(keyboardSection);

        // TASK 1: Render Trackpad section BELOW it
        const trackpadSection = document.createElement('div');
        trackpadSection.className = 'trackpad-section';
        wrapper.appendChild(trackpadSection);

        this.container.appendChild(wrapper);

        // Initialize UIs
        const keyboard = new KeyboardUI(keyboardSection, (event) => {
            this.onEvent(event);
        });

        const trackpad = new TrackpadUI(trackpadSection, (event) => {
            this.onEvent(event);
        });

        // Render UIs
        keyboard.render();
        trackpad.render();

        // Disconnect button
        const footer = document.createElement('div');
        footer.style.textAlign = 'center';
        footer.innerHTML = `
            <button class="button button-outline" style="width: auto; padding: 10px 24px;" onclick="window.location.reload()">
                Disconnect / Reset
            </button>
        `;
        wrapper.appendChild(footer);
    }

    /**
     * Updates the connection status text.
     * @param {string} text 
     */
    updateStatus(text) {
        if (this.statusEl) {
            this.statusEl.innerText = text;
        }
    }
}
