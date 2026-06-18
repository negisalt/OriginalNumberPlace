/**
 * ARG System & Story Engine
 * This file handles the narrative elements and special events of the game.
 */

const ArgSystem = {
    // UI elements
    overlay: null,
    dialogContent: null,
    ad: null,
    nextIndicator: null,
    resolveStep: null,

    /**
     * Initializes the ARG UI elements if they don't exist
     */
    init() {
        if (this.overlay) return;

        // Create the overlay and dialog box
        this.overlay = document.createElement('div');
        this.overlay.id = 'arg-overlay';
        this.overlay.className = 'arg-overlay';
        this.overlay.innerHTML = `
            <div class="arg-dialog-box" onclick="ArgSystem.handleDialogClick()">
                <div class="arg-dialog-body">
                    <div class="arg-assistant-avatar"></div>
                    <div class="arg-dialog-main">
                        <div class="arg-dialog-header">アシスタント：リリィ</div>
                        <div id="arg-dialog-content" class="arg-dialog-content"></div>
                        <div id="arg-dialog-choices" class="arg-dialog-choices"></div>
                    </div>
                </div>
                <div id="arg-next-indicator" class="arg-next-indicator">▼</div>
            </div>
        `;
        document.body.appendChild(this.overlay);
        this.dialogContent = document.getElementById('arg-dialog-content');
        this.nextIndicator = document.getElementById('arg-next-indicator');
        this.choicesContainer = document.getElementById('arg-dialog-choices');

        // Create the mysterious ad
        this.ad = document.createElement('div');
        this.ad.className = 'mysterious-ad';
        document.body.appendChild(this.ad);
    },

    /**
     * Handles clicks on the dialog to proceed
     */
    handleDialogClick() {
        if (this.resolveStep) {
            const resolve = this.resolveStep;
            this.resolveStep = null;
            this.nextIndicator.classList.remove('visible');
            resolve();
        }
    },

    /**
     * Shows a message in the ARG dialog and waits for a click
     */
    async showDialog(text, showNext = true) {
        this.init();
        this.dialogContent.innerHTML = text;
        this.choicesContainer.innerHTML = '';
        this.overlay.classList.add('visible');
        
        if (showNext) {
            this.nextIndicator.classList.add('visible');
            return new Promise(resolve => {
                this.resolveStep = resolve;
            });
        }
    },

    /**
     * Shows a redirect choice
     */
    async showRedirectChoice(text, url) {
        this.init();
        this.dialogContent.innerHTML = text;
        this.nextIndicator.classList.remove('visible');
        this.choicesContainer.innerHTML = `
            <button class="arg-choice-button" onclick="window.location.href='${url}'">行く</button>
        `;
        this.overlay.classList.add('visible');
        // This doesn't resolve until the page changes
        return new Promise(() => {}); 
    },

    /**
     * Closes the ARG dialog
     */
    closeDialog() {
        if (this.overlay) {
            this.overlay.classList.remove('visible');
        }
    },

    /**
     * Shows the mysterious ad
     */
    showAd() {
        this.init();
        this.ad.classList.add('visible');
    },

    /**
     * Hides the mysterious ad
     */
    hideAd() {
        if (this.ad) {
            this.ad.classList.remove('visible');
        }
    },

    /**
     * Utility to wait for a specified time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Disables game interactions (for cinematic moments)
     */
    disableGame() {
        document.getElementById('page-content').classList.add('game-disabled');
    },

    /**
     * Enables game interactions
     */
    enableGame() {
        document.getElementById('page-content').classList.remove('game-disabled');
    },

    /**
     * Story Engine: Plays a sequence of narrative steps
     * @param {Array} steps Array of step objects
     */
    async playStory(steps) {
        for (const step of steps) {
            switch (step.type) {
                case 'text':
                    await this.showDialog(step.content);
                    break;
                case 'redirectChoice':
                    await this.showRedirectChoice(step.content, step.url);
                    break;
                case 'wait':
                    await this.wait(step.ms);
                    break;
                case 'showAd':
                    this.showAd();
                    break;
                case 'hideAd':
                    this.hideAd();
                    break;
                case 'close':
                    this.closeDialog();
                    break;
                case 'action':
                    if (typeof step.fn === 'function') {
                        await step.fn();
                    }
                    break;
                case 'disableGame':
                    this.disableGame();
                    break;
                case 'enableGame':
                    this.enableGame();
                    break;
                case 'redirect':
                    window.location.href = step.url;
                    break;
            }
        }
    }
};

/**
 * Define your story sequences here
 */
const Stories = {
    // The initial event that triggers in special difficulty
    mysteriousAdEvent: [
        { type: 'wait', ms: 100 },
        { type: 'showAd' },
        { type: 'wait', ms: 1500 },
        { type: 'hideAd' },
        { type: 'wait', ms: 600 },
        { type: 'text', content: "おかしいですね...。このサイトには広告はないはずなのですが...。" },
        { type: 'text', content: "すみません、ちょっとこのサイトの様子が変みたいです。<br>良ければ一緒に調査を手伝っていただけませんか？" },
        { type: 'redirectChoice', content: "こちらのページに来ていただけますか？", url: 'resource/house/house.html' }
    ],

    // Example of a future story event
    clearGameEvent: [
        { type: 'text', content: "素晴らしい！これで全ての謎が解けましたね。" },
        { type: 'wait', ms: 3000 },
        { type: 'text', content: "あなたの協力に感謝します。" }
    ]
};
