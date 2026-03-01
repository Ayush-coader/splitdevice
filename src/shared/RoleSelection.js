export class RoleSelection {
    constructor(onSelect) {
        this.onSelect = onSelect;
        this.container = null;
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
        const roomIdInput = this.container.querySelector('#room-id');

        displayBtn.addEventListener('click', () => {
            const roomId = this.generateRoomId();
            this.onSelect('DISPLAY', roomId);
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

    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
