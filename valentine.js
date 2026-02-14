// ===== GAME STATE =====
const valentineState = {
    pullsRemaining: 3,
    pullsHistory: [],
    skillsUnlocked: {}
};

// ===== REWARDS DATA =====
const gachaRewards = [
    {
        icon: '🍽️',
        title: 'Romantic Dinner Voucher',
        description: 'A voucher for a romantic dinner at your favorite restaurant. Let\'s create more memories together! 🤤',
        rarity: 'rare'
    },
    {
        icon: '🎬',
        title: 'Movie Ticket Surprise',
        description: 'Two tickets to watch your favorite movie. Let\'s cuddle and enjoy! 🍿',
        rarity: 'rare'
    },
    {
        icon: '🤗',
        title: 'Unlimited Hugs Pass',
        description: 'One hug without time limit. I\'ll hold you as long as you want... forever if possible. 💕',
        rarity: 'legendary'
    },
    {
        icon: '🌹',
        title: 'Flower Delivery',
        description: 'Fresh flowers delivered to your door. Because you deserve to be reminded how beautiful you are everyday! 🌸',
        rarity: 'rare'
    },
    {
        icon: '☕',
        title: 'Coffee Date Special',
        description: 'Cozy coffee date with me. Let\'s talk about our dreams and future together! ☕💭',
        rarity: 'common'
    },
    {
        icon: '💍',
        title: 'Promise Ring',
        description: 'A special ring symbolizing my promise to always be there for you, today and forever. 💎',
        rarity: 'legendary'
    },
    {
        icon: '🎵',
        title: 'Live Serenade',
        description: 'I\'ll sing your favorite song just for you (even if I\'m not good at it, haha). This one\'s from my heart! 🎤💖',
        rarity: 'epic'
    },
    {
        icon: '🌅',
        title: 'Sunrise Hike Adventure',
        description: 'Let\'s watch the sunrise together from our favorite spot. I can\'t wait to see the light reflect in your eyes! 🥾✨',
        rarity: 'rare'
    },
    {
        icon: '💌',
        title: 'Love Letter Collection',
        description: 'A collection of handwritten letters telling you everything you mean to me. 26 days of love! 💝',
        rarity: 'epic'
    },
    {
        icon: '🎂',
        title: 'Custom Cake Surprise',
        description: 'Your favorite cake flavor, decorated with our favorite memories. Let\'s celebrate us! 🍰',
        rarity: 'rare'
    }
];

// ===== SKILL CONTENT =====
const skillsContent = {
    1: {
        title: 'First Encounter ❄️',
        html: `
            <h3>First Encounter</h3>
            <p style="margin: 20px 0; font-size: 16px; line-height: 1.8;">
                I still remember the day we met like it was yesterday. The way you smiled, the way you looked at me... 
                time seemed to stop in that moment. Little did I know that meeting you would change my entire life forever.
            </p>
            <p style="color: var(--accent); font-style: italic;">
                "Every love story has a beginning. Ours started with a look that said a thousand words." 💫
            </p>
            <img src="https://via.placeholder.com/500x300?text=OUR+FIRST+MEETING" alt="First Meeting" style="width: 100%; border-radius: 10px; margin-top: 20px;">
        `
    },
    2: {
        title: 'Ultimate Bond 💕',
        html: `
            <h3>Ultimate Bond</h3>
            <p style="margin: 20px 0; color: var(--accent);">
                These are the moments that define us. Every laugh, every tear, every quiet moment together...
            </p>
            <div class="modal-gallery">
                <img src="WhatsApp Image 2026-02-14 at 14.57.11.jpeg" alt="Memory 2">
                <img src="WhatsApp Image 2026-02-14 at 14.57.11 (1).jpeg" alt="Memory 1">
                <img src="WhatsApp Image 2026-02-14 at 14.57.11 (2).jpeg" alt="Memory 3">
                <img src="WhatsApp Image 2026-02-14 at 14.57.11 (3).jpeg" alt="Memory 4">
            </div>
            <p style="margin-top: 20px; text-align: center; color: #ffd700; font-weight: bold;">
                Our greatest adventures are just beginning... 🌟
            </p>
        `
    },
    3: {
        title: 'Unconditional Buff ✨',
        html: `
            <h3>My Promises to You</h3>
            <div style="background: rgba(255, 23, 68, 0.1); padding: 30px; border-radius: 15px; border-left: 4px solid var(--primary);">
                <p style="margin: 15px 0; line-height: 1.8; font-size: 16px;">
                    ✨ <strong>I promise to love you</strong> on your best days and your worst days, through every season of life.
                </p>
                <p style="margin: 15px 0; line-height: 1.8; font-size: 16px;">
                    💪 <strong>I promise to be your strength</strong> when you feel weak, and to celebrate you when you're strong.
                </p>
                <p style="margin: 15px 0; line-height: 1.8; font-size: 16px;">
                    💭 <strong>I promise to listen</strong> without judgment, and to understand your heart, even when words fail.
                </p>
                <p style="margin: 15px 0; line-height: 1.8; font-size: 16px;">
                    🌟 <strong>I promise to build a beautiful future</strong> where we grow old together, still laughing at our inside jokes.
                </p>
                <p style="margin: 15px 0; line-height: 1.8; font-size: 16px;">
                    ❤️ <strong>I promise to love you unconditionally</strong> - not because you're perfect, but because you're mine.
                </p>
                <p style="margin-top: 25px; text-align: center; color: var(--accent); font-size: 18px; font-weight: bold;">
                    Forever yours... 💕
                </p>
            </div>
        `
    }
};

// ===== SCREEN NAVIGATION =====
function goToProfile() {
    switchScreen('profile-screen');
}

function goToSkillTree() {
    switchScreen('skill-tree-screen');
}

function goToGacha() {
    switchScreen('gacha-screen');
    updatePullCount();
}

function goToLoading() {
    switchScreen('loading-screen');
}

function goToMemoryMatch() {
    window.location.href = 'memory-match.html';
}

function goToBattle() {
    window.location.href = 'battle-hero-select.html';
}

function goToHome() {
    window.location.href = 'home.html';
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
    window.scrollTo(0, 0);
}

// ===== LOADING SCREEN LOGIC =====
function setupLoadingScreen() {
    const enterBtn = document.getElementById('enter-btn');
    
    // Show button after loading completes
    setTimeout(() => {
        enterBtn.style.opacity = '1';
    }, 4000);
    
    enterBtn.addEventListener('click', () => {
        playWelcomeSound();
        goToProfile();
    });
}

// ===== SKILL MODAL =====
function openSkillModal(skillNumber) {
    const modal = document.getElementById('skill-modal');
    const modalBody = document.getElementById('modal-body');
    const skillContent = skillsContent[skillNumber];
    
    modalBody.innerHTML = skillContent.html;
    modal.classList.remove('hidden');
}

function closeSkillModal() {
    document.getElementById('skill-modal').classList.add('hidden');
}

// ===== GACHA SYSTEM =====
function getRandomReward() {
    return gachaRewards[Math.floor(Math.random() * gachaRewards.length)];
}

function openChest() {
    const pullBtn = document.getElementById('pull-btn');
    const chestImage = document.getElementById('chest-image');
    const rewardDisplay = document.getElementById('reward-display');
    
    if (valentineState.pullsRemaining <= 0) {
        showAlert('No pulls left! Come back tomorrow for more rewards!');
        return;
    }
    
    // Disable button during animation
    pullBtn.disabled = true;
    
    // Chest opening animation
    chestImage.classList.add('opening');
    
    setTimeout(() => {
        const reward = getRandomReward();
        valentineState.pullsRemaining--;
        valentineState.pullsHistory.push(reward);
        
        // Display reward
        document.getElementById('reward-icon').textContent = reward.icon;
        document.getElementById('reward-title').textContent = reward.title;
        document.getElementById('reward-description').textContent = reward.description;
        
        rewardDisplay.classList.remove('hidden');
        
        // Show reward modal
        setTimeout(() => {
            showRewardModal(reward);
            chestImage.classList.remove('opening');
            pullBtn.disabled = false;
            updatePullCount();
            updateRewardsHistory();
        }, 500);
    }, 500);
}

function showRewardModal(reward) {
    const modal = document.getElementById('reward-modal');
    const modalBody = document.getElementById('reward-modal-body');
    
    modalBody.innerHTML = `
        <div class="reward-icon">${reward.icon}</div>
        <div class="reward-title">${reward.title}</div>
        <div class="reward-description">${reward.description}</div>
        <button class="claim-button" onclick="closeRewardModal()">Claim Reward ✨</button>
    `;
    
    modal.classList.remove('hidden');
}

function closeRewardModal() {
    document.getElementById('reward-modal').classList.add('hidden');
}

function updatePullCount() {
    document.getElementById('pull-count').textContent = valentineState.pullsRemaining;
}

function updateRewardsHistory() {
    const historyDiv = document.getElementById('rewards-history');
    
    if (valentineState.pullsHistory.length === 0) {
        historyDiv.innerHTML = '<p style="color: #aaa; text-align: center;">No pulls yet. Time to get lucky!</p>';
        return;
    }
    
    historyDiv.innerHTML = valentineState.pullsHistory.map(reward => 
        `<div class="reward-item" title="${reward.title}">${reward.icon}</div>`
    ).join('');
}

// ===== AUDIO =====
function playWelcomeSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Simulate ML announcer sound (heroic tone)
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        // Start with a deep heroic tone
        const now = audioContext.currentTime;
        
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.3);
        osc.frequency.linearRampToValueAtTime(150, now + 0.6);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
        
    } catch (e) {
        console.log('Audio context not supported');
    }
}

function playChestSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        
        // Treasure sound
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.4);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.log('Audio context not supported');
    }
}

// ===== UTILITY FUNCTIONS =====
function showAlert(message) {
    alert(message);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Valentine Edition loaded! 💕');
    setupLoadingScreen();
    updateRewardsHistory();
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});

// Auto-update pull count every day (for demo, we'll make it every 5 minutes)
setInterval(() => {
    // In real app, this would check actual date
    // For now, we'll just reset pulls every 5 minutes for testing
    if (valentineState.pullsRemaining === 0) {
        valentineState.pullsRemaining = 3;
        updatePullCount();
    }
}, 5 * 60 * 1000);
