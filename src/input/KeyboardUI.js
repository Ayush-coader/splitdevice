/**
 * KeyboardUI
 * Renders a realistic laptop-style virtual keyboard with Shift logic.
 */
export class KeyboardUI {
    /**
     * @param {HTMLElement} container - The element to render the keyboard into.
     * @param {Function} onKeyPress - Callback for key press events.
     */
    constructor(container, onKeyPress) {
        this.container = container;
        this.onKeyPress = onKeyPress;
        this.isShiftActive = false;

        this.layout = [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BACKSPACE"],
            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
            ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ENTER"],
            ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT"],
            ["SPACE"]
        ];

        this.shiftMap = {
            "1": "!", "2": "@", "3": "#", "4": "$", "5": "%",
            "6": "^", "7": "&", "8": "*", "9": "(", "0": ")",
            "-": "_", "=": "+", "[": "{", "]": "}", "\\": "|",
            ";": ":", "'": "\"", ",": "<", ".": ">", "/": "?"
        };
    }

    /**
     * Renders the keyboard.
     */
    render() {
        const keyboard = document.createElement('div');
        keyboard.className = 'keyboard';

        this.layout.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'key-row';

            row.forEach(key => {
                const keyBtn = document.createElement('button');
                keyBtn.className = 'key';

                // Set initial text
                keyBtn.textContent = this.getKeyOutput(key);

                // Handle special widths
                if (key === 'BACKSPACE' || key === 'ENTER' || key === 'SHIFT') {
                    keyBtn.classList.add('wide');
                } else if (key === 'SPACE') {
                    keyBtn.classList.add('space');
                    keyBtn.textContent = ''; // Space bar look
                }

                // Handle active Shift visual
                if (key === 'SHIFT' && this.isShiftActive) {
                    keyBtn.classList.add('active-shift');
                }

                keyBtn.addEventListener('click', () => {
                    this.handleKeyPress(key);
                });

                rowEl.appendChild(keyBtn);
            });

            keyboard.appendChild(rowEl);
        });

        this.container.innerHTML = '';
        this.container.appendChild(keyboard);
    }

    /**
     * @private
     * @param {string} key 
     * @returns {string}
     */
    getKeyOutput(key) {
        if (key === 'SHIFT' || key === 'BACKSPACE' || key === 'ENTER' || key === 'SPACE') {
            return key;
        }

        if (this.isShiftActive) {
            if (this.shiftMap[key]) {
                return this.shiftMap[key];
            }
            return key.toUpperCase();
        }
        return key.toLowerCase();
    }

    /**
     * @private
     * @param {string} rawKey 
     */
    handleKeyPress(rawKey) {
        if (rawKey === 'SHIFT') {
            this.isShiftActive = !this.isShiftActive;
            this.render(); // Redraw keys to show case/symbols
            return;
        }

        let output = rawKey;
        if (rawKey === 'SPACE') {
            output = ' ';
        } else if (rawKey === 'BACKSPACE' || rawKey === 'ENTER') {
            output = rawKey;
        } else {
            output = this.getKeyOutput(rawKey);
        }

        // Emit event
        this.onKeyPress({
            type: "KEY_PRESS",
            key: output
        });

        // Auto-disable shift after one key press
        if (this.isShiftActive) {
            this.isShiftActive = false;
            this.render();
        }
    }
}
