export class RoleSelection {
    constructor(onSelect) {
        this.onSelect = onSelect;
        this.container = null;
        this.scanner = null;
    }

    /**
     * Renders the UI inside the provided container.
     * @param {HTMLElement} container 
     * @param {string} initialRoomId - Optional Room ID from URL
     */
    render(container, initialRoomId = null) {
        this.container = container;
        this.container.innerHTML = `
            <div class="card">
                <h1>SplitDevice</h1>
                <p class="subtitle">Turn two devices into one system</p>
                
                <div class="form-group">
                    <button id="display-mode" class="button button-primary">
                        Display Mode
                    </button>
                </div>
 
                <div class="divider">OR</div>
 
                <div class="form-group">
                    <label for="room-id">Enter Room ID</label>
                    <input type="text" id="room-id" placeholder="6-char code" maxlength="6">
                </div>

                <button id="scan-qr" class="button button-scan">
                    <span>📷 Scan QR Code</span>
                </button>
                
                <button id="input-mode" class="button button-outline">
                    Input Mode
                </button>
            </div>
        `;

        this.setupEventListeners();

        const roomIdInput = this.container.querySelector('#room-id');

        // Auto-fill Room ID if provided via URL
        if (initialRoomId && roomIdInput) {
            roomIdInput.value = initialRoomId.toUpperCase();
        }

        // Auto Focus Input Field for better UX
        if (roomIdInput) {
            roomIdInput.focus();
        }
    }

    setupEventListeners() {
        const displayBtn = this.container.querySelector('#display-mode');
        const inputBtn = this.container.querySelector('#input-mode');
        const scanBtn = this.container.querySelector('#scan-qr');
        const roomIdInput = this.container.querySelector('#room-id');

        displayBtn.addEventListener('click', () => {
            const roomId = this.generateRoomId();
            this.onSelect('DISPLAY', roomId);
        });

        scanBtn.addEventListener('click', () => {
            this.startQRScanner();
        });

        inputBtn.addEventListener('click', () => {
            const roomId = roomIdInput.value.trim().toUpperCase();
            if (!roomId) {
                alert('Please enter a Room ID');
                return;
            }
            if (roomId.length !== 6) {
                alert('Room ID must be 6 characters');
                return;
            }
            this.onSelect('INPUT', roomId);
        });

        roomIdInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    startQRScanner() {
        // Create scanner container
        const scannerContainer = document.createElement("div");
        scannerContainer.id = "qr-reader";
        scannerContainer.className = "scanner-container"; // Use existing styles
        scannerContainer.style.width = "300px";
        scannerContainer.style.margin = "20px auto";
        scannerContainer.style.display = "block"; // Ensure it's visible

        // Insert before the scan button
        const scanBtn = this.container.querySelector('#scan-qr');
        scanBtn.parentNode.insertBefore(scannerContainer, scanBtn);

        const html5QrCode = new Html5Qrcode("qr-reader");
        this.scanner = html5QrCode;

        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length) {
                html5QrCode.start(
                    devices[0].id,
                    { fps: 10, qrbox: 250 },
                    (decodedText) => {
                        try {
                            const url = new URL(decodedText);
                            const room = url.searchParams.get("room");

                            if (room) {
                                this.container.querySelector('#room-id').value = room.toUpperCase();
                            } else if (decodedText.length === 6) {
                                // Fallback for raw codes
                                this.container.querySelector('#room-id').value = decodedText.toUpperCase();
                            }

                            html5QrCode.stop().then(() => {
                                scannerContainer.remove();
                                this.scanner = null;
                            });

                        } catch (err) {
                            // If it's not a URL, check if it's a 6-char code
                            if (decodedText.length === 6) {
                                this.container.querySelector('#room-id').value = decodedText.toUpperCase();
                                html5QrCode.stop().then(() => {
                                    scannerContainer.remove();
                                    this.scanner = null;
                                });
                            } else {
                                console.log("Invalid QR Data:", decodedText);
                            }
                        }
                    }
                ).catch(err => {
                    console.log("Start error:", err);
                    scannerContainer.remove();
                    this.scanner = null;
                });
            } else {
                alert("No cameras found.");
                scannerContainer.remove();
                this.scanner = null;
            }
        }).catch(err => {
            console.log("Camera error:", err);
            scannerContainer.remove();
            this.scanner = null;
        });
    }

    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
