// ===== GAME STATE =====
let gameState = {
    score: 0,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 100,
    level: 1,
    rank: 'WARRIOR',
    gameTime: 60,
    gameRunning: false,
    selectedHero: null,
    musicOn: true,
    spawnInterval: null,
    timerInterval: null
};

// ===== HERO DATA =====
const heroes = {
    mage: { 
        name: "Pyromancer", 
        icon: "🔥", 
        damage: 30, 
        speed: 600
    },
    warrior: { 
        name: "Berserker", 
        icon: "⚔️", 
        damage: 20, 
        speed: 700
    },
    assassin: { 
        name: "Shadow", 
        icon: "🗡️", 
        damage: 40, 
        speed: 800
    }
};

// ===== ITEM TYPES =====
const itemTypes = {
    heal: { icon: "💚", points: -10, type: "heal" },
    love: { icon: "💖", points: 15, type: "love" },
    star: { icon: "⭐", points: 25, type: "star" },
    gem: { icon: "💎", points: 40, type: "gem" },
    bomb: { icon: "💣", points: -30, type: "bomb" }
};

// ===== DOM CACHE =====
let dom = {};

function cacheDOM() {
    dom.screens = {
        home: document.getElementById('home-screen'),
        heroSelect: document.getElementById('hero-select-screen'),
        game: document.getElementById('game-screen'),
        result: document.getElementById('result-screen')
    };
    
    dom.gameArea = document.getElementById('game-area');
    dom.score = document.getElementById('score');
    dom.hp = document.getElementById('hp-current');
    dom.hpMax = document.getElementById('hp-max');
    dom.hpFill = document.getElementById('hp-fill');
    dom.mana = document.getElementById('mana');
    dom.timer = document.getElementById('timer');
    dom.rankDisplay = document.getElementById('rank-display');
    dom.heroNameMini = document.getElementById('hero-name-mini');
    dom.heroLevelMini = document.getElementById('hero-level-mini');
    dom.heroAvatarMini = document.getElementById('hero-avatar-mini');
    dom.ability1Btn = document.getElementById('ability1-btn');
    dom.ability2Btn = document.getElementById('ability2-btn');
    dom.ability1Cd = document.getElementById('ability1-cd');
    dom.ability2Cd = document.getElementById('ability2-cd');
    dom.startBtn = document.getElementById('startGameBtn');
    dom.pauseBtn = document.getElementById('pauseGameBtn');
    dom.modal = document.getElementById('custom-modal');
    dom.modalHeader = document.getElementById('modal-header');
    dom.modalMessage = document.getElementById('modal-message');
}

// ===== SCREEN SWITCHING =====
function switchScreen(screenName) {
    Object.values(dom.screens).forEach(s => s.classList.remove('active'));
    dom.screens[screenName].classList.add('active');
}

// ===== HERO SELECTION =====
function selectHero(heroType) {
    gameState.selectedHero = heroType;
    const hero = heroes[heroType];
    
    dom.heroAvatarMini.textContent = hero.icon;
    dom.heroNameMini.textContent = hero.name;
    dom.heroLevelMini.textContent = 'Lv 1';
    
    switchScreen('game');
}

// ===== GAME START =====
function startGame() {
    if (!gameState.selectedHero) {
        showAlert('⚠️ No Hero', 'Please select a hero first!');
        return;
    }
    
    gameState.gameRunning = true;
    gameState.gameTime = 60;
    gameState.score = 0;
    gameState.hp = gameState.maxHp;
    gameState.mana = 50;
    gameState.level = 1;
    gameState.rank = 'WARRIOR';
    
    dom.gameArea.innerHTML = '';
    dom.startBtn.classList.add('hidden');
    dom.pauseBtn.classList.remove('hidden');
    
    updateUI();
    
    // Spawn first item immediately
    spawnItem();
    
    const hero = heroes[gameState.selectedHero];
    
    // Spawn items at interval
    gameState.spawnInterval = setInterval(() => {
        if (gameState.gameRunning) {
            spawnItem();
        }
    }, hero.speed);
    
    // Timer countdown
    gameState.timerInterval = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.gameTime--;
            updateTimer();
            
            if (gameState.gameTime <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function pauseGame() {
    gameState.gameRunning = !gameState.gameRunning;
    dom.pauseBtn.textContent = gameState.gameRunning ? '⏸ PAUSE' : '▶ RESUME';
}

function endGame() {
    gameState.gameRunning = false;
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
    dom.startBtn.classList.remove('hidden');
    dom.pauseBtn.classList.add('hidden');
    showResults();
}

// ===== ITEM SPAWNING =====
function spawnItem() {
    if (!dom.gameArea) return;
    
    // Limit max items on screen
    if (dom.gameArea.children.length > 20) return;
    
    const itemKeys = Object.keys(itemTypes);
    const randomType = itemKeys[Math.floor(Math.random() * itemKeys.length)];
    const itemData = itemTypes[randomType];
    
    const item = document.createElement('div');
    item.classList.add('item');
    item.textContent = itemData.icon;
    item.style.left = Math.random() * (dom.gameArea.offsetWidth - 50) + 'px';
    item.style.top = Math.random() * (dom.gameArea.offsetHeight - 50) + 'px';
    
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        handleItemClick(item, itemData);
    });
    
    dom.gameArea.appendChild(item);
    
    // Remove item after 3 seconds
    setTimeout(() => {
        if (item.parentNode) item.remove();
    }, 3000);
}

function handleItemClick(item, itemData) {
    playSound('hit');
    
    // Handle different item types
    if (itemData.type === 'heal') {
        gameState.hp = Math.min(gameState.hp - itemData.points, gameState.maxHp);
    } else if (itemData.type === 'bomb') {
        gameState.hp = Math.max(0, gameState.hp + itemData.points);
    } else {
        gameState.score += itemData.points;
        gameState.mana = Math.min(gameState.mana + 5, gameState.maxMana);
    }
    
    item.classList.add('damage');
    setTimeout(() => item.remove(), 500);
    
    updateUI();
    
    if (gameState.hp <= 0) {
        endGame();
    }
}

// ===== ABILITIES =====
function useAbility(abilityNum) {
    if (!gameState.gameRunning) return;
    
    if (gameState.mana < 30) {
        showAlert('💫 Low Mana', 'Need 30 mana to use ability!');
        return;
    }
    
    playSound('levelup');
    gameState.mana -= 30;
    gameState.score += heroes[gameState.selectedHero].damage * 2;
    
    const btn = abilityNum === 1 ? dom.ability1Btn : dom.ability2Btn;
    const cdDisplay = abilityNum === 1 ? dom.ability1Cd : dom.ability2Cd;
    
    btn.disabled = true;
    let cooldown = 8;
    cdDisplay.textContent = cooldown;
    
    const cdInterval = setInterval(() => {
        cooldown--;
        if (cooldown > 0) {
            cdDisplay.textContent = cooldown;
        } else {
            cdDisplay.textContent = '';
            btn.disabled = false;
            clearInterval(cdInterval);
        }
    }, 1000);
    
    updateUI();
}

// ===== UI UPDATES =====
function updateUI() {
    if (!dom.score) return; // Safety check
    
    dom.score.textContent = gameState.score;
    dom.hp.textContent = Math.max(0, gameState.hp);
    dom.mana.textContent = gameState.mana;
    dom.heroLevelMini.textContent = `Lv ${gameState.level}`;
    dom.rankDisplay.textContent = gameState.rank;
    
    // Update HP bar
    const hpPercent = (gameState.hp / gameState.maxHp) * 100;
    dom.hpFill.style.width = hpPercent + '%';
    
    // Check level up
    if (gameState.score >= 150 && gameState.level === 1) {
        gameState.level = 2;
        showAlert('⬆️ LEVEL UP!', 'You reached Level 2!');
    }
    if (gameState.score >= 350 && gameState.level === 2) {
        gameState.level = 3;
        showAlert('⬆️ LEVEL UP!', 'You reached Level 3!');
    }
    if (gameState.score >= 600 && gameState.level === 3) {
        gameState.level = 4;
        showAlert('⬆️ MYTHIC RANK!', 'You are now MYTHIC!');
    }
    
    // Check rank up
    if (gameState.score >= 100 && gameState.rank === 'WARRIOR') {
        gameState.rank = 'EPIC';
    }
    if (gameState.score >= 300 && gameState.rank === 'EPIC') {
        gameState.rank = 'MYTHIC';
    }
    if (gameState.score >= 600 && gameState.rank === 'MYTHIC') {
        gameState.rank = 'LEGEND';
    }
}

function updateTimer() {
    if (!dom.timer) return;
    dom.timer.textContent = gameState.gameTime;
    
    if (gameState.gameTime <= 10) {
        dom.timer.style.color = '#ff6b6b';
        dom.timer.style.textShadow = '0 0 10px #ff6b6b';
    }
}

// ===== RESULTS =====
function showResults() {
    const hero = heroes[gameState.selectedHero];
    const isVictory = gameState.score >= 300;
    
    document.getElementById('result-title').textContent = isVictory ? '🏆 VICTORY! 🏆' : '💔 DEFEAT 💔';
    document.getElementById('result-title').style.color = isVictory ? '#ffd700' : '#ff6b6b';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-rank').textContent = gameState.rank;
    document.getElementById('final-hero').textContent = hero.name;
    
    let message = '';
    if (isVictory) {
        message = `You conquered the battlefield as ${hero.name}!\nYour love for the game is unstoppable! 💕`;
    } else {
        message = `Better luck next time!\nEvery warrior has their battles.`;
    }
    document.getElementById('result-message').textContent = message;
    
    switchScreen('result');
}

// ===== AUDIO =====
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    return audioContext;
}

function playSound(type) {
    if (!gameState.musicOn) return;
    
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        switch(type) {
            case 'click':
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hit':
                osc.frequency.value = 600;
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'levelup':
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.setValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
        }
    } catch (e) {
        // Audio error, continue anyway
    }
}

function toggleMusic() {
    gameState.musicOn = !gameState.musicOn;
    const btn = document.getElementById('musicToggle');
    btn.textContent = gameState.musicOn ? '🔊 MUSIC ON' : '🔇 MUSIC OFF';
    playSound('click');
}

// ===== MODAL ALERTS =====
function showAlert(title, message) {
    if (!dom.modal) return;
    dom.modalHeader.textContent = title;
    dom.modalMessage.textContent = message;
    dom.modal.classList.remove('hidden');
}

function closeModal() {
    if (dom.modal) {
        dom.modal.classList.add('hidden');
    }
}

// ===== NAVIGATION =====
function goHome() {
    gameState.gameRunning = false;
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
    switchScreen('home');
}

function selectHeroScreen() {
    switchScreen('heroSelect');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    
    // Setup event listeners
    document.getElementById('playBtn').addEventListener('click', () => {
        switchScreen('heroSelect');
        playSound('click');
    });
    
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    dom.startBtn.addEventListener('click', startGame);
    dom.pauseBtn.addEventListener('click', pauseGame);
    dom.ability1Btn.addEventListener('click', () => useAbility(1));
    dom.ability2Btn.addEventListener('click', () => useAbility(2));
    
    switchScreen('home');
});
