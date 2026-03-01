export class DesktopUI {
    constructor() {
        this.container = null;
        this.desktopElement = null;
        this.cursor = null;
        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
        this.contentArea = null;
        this.pairingUI = null;
    }

    /**
     * Renders the fake desktop layout inside the provided container.
     * @param {HTMLElement} container 
     * @param {string} roomId
     */
    render(container, roomId) {
        this.container = container;

        // Create full screen desktop wrapper
        const desktop = document.createElement('div');
        desktop.className = 'desktop-wrapper';

        // Top Taskbar
        const taskbar = document.createElement('div');
        taskbar.className = 'desktop-taskbar';
        taskbar.innerHTML = `
            <div class="taskbar-left">
                <span class="taskbar-logo">SplitDevice OS</span>
            </div>
            <div class="taskbar-right">
                <span class="taskbar-time">12:00 PM</span>
            </div>
        `;

        // Main Window
        const windowEl = document.createElement('div');
        windowEl.className = 'desktop-window';
        windowEl.id = 'system-window';

        // Title Bar
        const titleBar = document.createElement('div');
        titleBar.className = 'window-titlebar';
        titleBar.innerHTML = `
            <span class="window-title">System Console</span>
            <button class="window-close" id="close-btn" title="Close">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Content Area
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'window-content';
        this.contentArea.style.flex = "1";
        this.contentArea.style.display = "flex";
        this.contentArea.style.flexDirection = "column";

        // Initial State: Pairing UI
        this.pairingUI = this.createPairingUI(roomId);
        this.contentArea.appendChild(this.pairingUI);

        windowEl.appendChild(titleBar);
        windowEl.appendChild(this.contentArea);

        desktop.appendChild(taskbar);
        desktop.appendChild(windowEl);

        this.desktopElement = desktop;

        // Clear and Append
        this.container.innerHTML = '';
        this.container.appendChild(desktop);

        // TASK: Create Cursor
        this.createCursor();

        // TASK: Create Status Indicator
        this.createStatusIndicator();

        this.setupEventListeners();
    }

    /**
     * Transitions from Pairing Screen to Workspace with a smooth fade-out
     */
    hidePairingUI() {
        if (this.pairingUI) {
            this.pairingUI.style.opacity = "0";
            this.pairingUI.style.transform = "translateY(-10px)";

            setTimeout(() => {
                if (this.pairingUI) {
                    this.pairingUI.remove();
                    this.pairingUI = null;
                    this.contentArea.appendChild(this.createNotepad());
                }
            }, 300);
        }
    }

    /**
     * Set up event listeners for desktop interactions.
     */
    setupEventListeners() {
        const closeBtn = this.desktopElement.querySelector('#close-btn');
        const windowEl = this.desktopElement.querySelector('#system-window');

        if (closeBtn && windowEl) {
            closeBtn.addEventListener('click', () => {
                windowEl.classList.add('window-hidden');
                console.log('Window closed');
            });
        }
    }

    createCursor() {
        this.cursor = document.createElement("div");
        this.cursor.className = "virtual-cursor";
        this.cursor.style.position = "absolute";
        this.cursor.style.width = "12px";
        this.cursor.style.height = "12px";
        this.cursor.style.background = "#38bdf8";
        this.cursor.style.borderRadius = "50%";
        this.cursor.style.left = "50%";
        this.cursor.style.top = "50%";
        this.container.appendChild(this.cursor);

        this.cursorX = window.innerWidth / 2;
        this.cursorY = window.innerHeight / 2;
    }

    moveCursor(dx, dy) {
        this.cursorX += dx;
        this.cursorY += dy;

        this.cursor.style.left = this.cursorX + "px";
        this.cursor.style.top = this.cursorY + "px";
    }

    createStatusIndicator() {
        this.statusEl = document.createElement("div");
        this.statusEl.className = "connection-status";
        this.statusEl.innerText = "🔴 Waiting for connection...";
        this.container.appendChild(this.statusEl);
    }

    updateStatus(text) {
        if (this.statusEl) {
            this.statusEl.innerText = text;
        }
    }

    createPairingUI(roomId) {
        const container = document.createElement("div");
        container.className = "pairing-ui";

        const title = document.createElement("h2");
        title.innerText = "Scan to Connect";

        const qrContainer = document.createElement("div");
        qrContainer.className = "qr-container";

        // Generate QR Code
        // Use a small delay to ensure qrContainer is in the DOM if needed, 
        // though here we pass the element itself.
        setTimeout(() => {
            new QRCode(qrContainer, {
                text: `${window.location.origin}/?room=${roomId}`,
                width: 150,
                height: 150,
                colorDark: "#38bdf8",
                colorLight: "transparent",
                correctLevel: QRCode.CorrectLevel.H
            });
        }, 0);

        const code = document.createElement("div");
        code.className = "room-code";
        code.innerText = roomId;

        const copyBtn = document.createElement("button");
        copyBtn.innerText = "Copy Code";
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(roomId);
            copyBtn.innerText = "Copied!";
            setTimeout(() => copyBtn.innerText = "Copy Code", 1500);
        };

        container.appendChild(title);
        container.appendChild(qrContainer);
        container.appendChild(code);
        container.appendChild(copyBtn);

        return container;
    }

    createNotepad() {
        this.notepad = document.createElement("div");
        this.notepad.className = "notepad";
        this.notepad.contentEditable = false;
        this.notepad.style.whiteSpace = "pre-wrap";
        this.notepad.style.outline = "none";
        this.notepad.style.padding = "10px";
        this.notepad.style.height = "100%";
        this.notepad.style.overflowY = "auto";
        this.notepad.innerText = "";

        return this.notepad;
    }

    appendText(char) {
        if (this.notepad) {
            this.notepad.innerText += char;
        }
    }

    removeLastChar() {
        if (this.notepad) {
            this.notepad.innerText = this.notepad.innerText.slice(0, -1);
        }
    }

    addNewLine() {
        if (this.notepad) {
            this.notepad.innerText += "\n";
        }
    }
}
