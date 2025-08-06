import { WheelManager } from './wheel.js';
import { DiceManager } from './dice.js';
import { ApiManager } from './api.js';

class FollowingRoulette {
    constructor() {
        this.apiManager = new ApiManager();
        this.wheelManager = new WheelManager();
        this.diceManager = new DiceManager();
        
        this.followingUsers = [];
        this.selectedUser = null;
        this.suggestedTip = 0;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initialize();
    }
    
    initializeElements() {
        this.spinBtn = document.getElementById('spinBtn');
        this.rollBtn = document.getElementById('rollBtn');
        this.closeBtn = document.getElementById('closeBtn');
        this.iframeContainer = document.getElementById('iframeContainer');
        this.projectIframe = document.getElementById('projectIframe');
        this.tipNotice = document.getElementById('tipNotice');
        this.loading = document.getElementById('loading');
        this.gameArea = document.getElementById('gameArea');
    }
    
    attachEventListeners() {
        this.spinBtn.addEventListener('click', () => this.spinWheel());
        this.rollBtn.addEventListener('click', () => this.rollDice());
        this.closeBtn.addEventListener('click', () => this.closeIframe());
        
        // Close iframe when clicking outside
        this.iframeContainer.addEventListener('click', (e) => {
            if (e.target === this.iframeContainer) {
                this.closeIframe();
            }
        });
    }
    
    async initialize() {
        try {
            console.log('Loading following list...');
            this.followingUsers = await this.apiManager.getFollowingUsers();
            
            if (this.followingUsers.length === 0) {
                this.showError('You are not following anyone yet. Follow some users to play!');
                return;
            }
            
            console.log(`Loaded ${this.followingUsers.length} users`);
            this.wheelManager.createWheel(this.followingUsers);
            
            this.spinBtn.disabled = false;
            this.spinBtn.innerHTML = '<span>🎰 Spin the Wheel!</span>';
            
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing:', error);
            this.showError('Failed to load your following list. Please refresh and try again.');
        }
    }
    
    async spinWheel() {
        if (this.followingUsers.length === 0) return;
        
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<span>Spinning...</span>';
        
        try {
            this.selectedUser = await this.wheelManager.spin(this.followingUsers);
            console.log('Selected user:', this.selectedUser);
            
            // Get the user's most recent project
            const project = await this.apiManager.getUserMostRecentProject(this.selectedUser.username);
            
            if (!project) {
                this.showError(`${this.selectedUser.username} doesn't have any public projects yet.`);
                this.resetSpinButton();
                return;
            }
            
            // Load project in iframe
            this.loadProject(project);
            
        } catch (error) {
            console.error('Error spinning wheel:', error);
            this.showError('Something went wrong. Please try again.');
        }
        
        this.resetSpinButton();
    }
    
    rollDice() {
        this.suggestedTip = this.diceManager.roll();
        this.updateTipNotice();
    }
    
    loadProject(project) {
        const projectUrl = `https://websim.com/p/${project.id}`;
        this.projectIframe.src = projectUrl;
        this.updateTipNotice();
        this.iframeContainer.style.display = 'block';
    }
    
    updateTipNotice() {
        if (this.selectedUser) {
            const tipText = this.suggestedTip > 0 
                ? `Suggested tip: ${this.suggestedTip} credits to @${this.selectedUser.username}` 
                : `Roll the dice to get a suggested tip amount for @${this.selectedUser.username}`;
            
            this.tipNotice.textContent = tipText;
        }
    }
    
    closeIframe() {
        this.iframeContainer.style.display = 'none';
        this.projectIframe.src = '';
        this.selectedUser = null;
        this.suggestedTip = 0;
    }
    
    resetSpinButton() {
        this.spinBtn.disabled = false;
        this.spinBtn.innerHTML = '<span>🎰 Spin Again!</span>';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.gameArea.style.display = 'flex';
    }
    
    showError(message) {
        this.loading.innerHTML = `
            <div style="text-align: center;">
                <h2>⚠️ Oops!</h2>
                <p style="margin: 20px 0;">${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 1rem; background: #ff4757; color: white; border: none; border-radius: 25px; cursor: pointer;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FollowingRoulette();
});

