/**
 * TrackpadUI
 * Renders a touch/mouse sensitive area for cursor control.
 */
export class TrackpadUI {
    /**
     * @param {HTMLElement} container - Element to render the trackpad into.
     * @param {Function} onMove - Callback triggered on movement { type, dx, dy }.
     */
    constructor(container, onMove) {
        this.container = container;
        this.onMove = onMove;
        this.isMouseDown = false;
        this.lastX = 0;
        this.lastY = 0;
    }

    /**
     * Renders the trackpad into the container.
     */
    render() {
        const trackpad = document.createElement('div');
        trackpad.className = 'trackpad-area';
        trackpad.innerHTML = `
            <div class="trackpad-hint">Drag to move cursor</div>
            <div class="trackpad-visual"></div>
        `;

        this.setupEventListeners(trackpad);

        this.container.innerHTML = '';
        this.container.appendChild(trackpad);
    }

    /**
     * @private
     * @param {HTMLElement} element 
     */
    setupEventListeners(element) {
        element.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            element.classList.add('trackpad-active');
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;

            const dx = e.clientX - this.lastX;
            const dy = e.clientY - this.lastY;

            this.lastX = e.clientX;
            this.lastY = e.clientY;

            if (dx !== 0 || dy !== 0) {
                this.onMove({
                    type: "CURSOR_MOVE",
                    dx: dx,
                    dy: dy
                });
            }
        });

        window.addEventListener('mouseup', () => {
            if (this.isMouseDown) {
                this.isMouseDown = false;
                element.classList.remove('trackpad-active');
            }
        });

        // Touch support
        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.isMouseDown = true;
            this.lastX = touch.clientX;
            this.lastY = touch.clientY;
            element.classList.add('trackpad-active');
            e.preventDefault();
        }, { passive: false });

        element.addEventListener('touchmove', (e) => {
            if (!this.isMouseDown) return;
            const touch = e.touches[0];

            const dx = touch.clientX - this.lastX;
            const dy = touch.clientY - this.lastY;

            this.lastX = touch.clientX;
            this.lastY = touch.clientY;

            this.onMove({
                type: "CURSOR_MOVE",
                dx: dx,
                dy: dy
            });
            e.preventDefault();
        }, { passive: false });

        element.addEventListener('touchend', () => {
            this.isMouseDown = false;
            element.classList.remove('trackpad-active');
        });
    }
}
