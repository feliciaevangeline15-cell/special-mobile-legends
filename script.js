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
    musicOn: false
};

// ===== HERO DATA =====
const heroes = {
    mage: { 
        name: "Pyromancer", 
        icon: "🔥", 
        damage: 30, 
        speed: 600,
        color: "#ff6b6b"
    },
    warrior: { 
        name: "Berserker", 
        icon: "⚔️", 
        damage: 20, 
        speed: 700,
        color: "#ffd700"
    },
    assassin: { 
        name: "Shadow", 
        icon: "🗡️", 
        damage: 40, 
        speed: 800,
        color: "#6b9eff"
    }
};

// ===== ITEM TYPES =====
const itemTypes = {
    heal: { icon: "💚", points: -10, type: "heal", color: "#4CAF50" },
    love: { icon: "💖", points: 15, type: "love", color: "#ff6b6b" },
    star: { icon: "⭐", points: 25, type: "star", color: "#ffd700" },
    gem: { icon: "💎", points: 40, type: "gem", color: "#6b9eff" },
    bomb: { icon: "💣", points: -30, type: "bomb", color: "#FF4444" }
};

// ===== DOM ELEMENTS =====
const screens = {
    home: null,
    heroSelect: null,
    game: null,
    result: null
};

const gameElements = {
    gameArea: null,
    score: null,
    hp: null,
    hpFill: null,
    mana: null,
    timer: null,
    rankDisplay: null,
    heroNameMini: null,
    heroLevelMini: null,
    heroAvatarMini: null,
    ability1Btn: null,
    ability2Btn: null,
    ability1Cd: null,
    ability2Cd: null,
    startBtn: null,
    pauseGameBtn: null
};

// Initialize DOM references
function initDOMElements() {
    screens.home = document.getElementById('home-screen');
    screens.heroSelect = document.getElementById('hero-select-screen');
    screens.game = document.getElementById('game-screen');
    screens.result = document.getElementById('result-screen');
    
    gameElements.gameArea = document.getElementById('game-area');
    gameElements.score = document.getElementById('score');
    gameElements.hp = document.getElementById('hp-current');
    gameElements.hpFill = document.getElementById('hp-fill');
    gameElements.mana = document.getElementById('mana');
    gameElements.timer = document.getElementById('timer');
    gameElements.rankDisplay = document.getElementById('rank-display');
    gameElements.heroNameMini = document.getElementById('hero-name-mini');
    gameElements.heroLevelMini = document.getElementById('hero-level-mini');
    gameElements.heroAvatarMini = document.getElementById('hero-avatar-mini');
    gameElements.ability1Btn = document.getElementById('ability1-btn');
    gameElements.ability2Btn = document.getElementById('ability2-btn');
    gameElements.ability1Cd = document.getElementById('ability1-cd');
    gameElements.ability2Cd = document.getElementById('ability2-cd');
    gameElements.startBtn = document.getElementById('startGameBtn');
    gameElements.pauseGameBtn = document.getElementById('pauseGameBtn');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    document.getElementById('playBtn').addEventListener('click', () => {
        switchScreen('heroSelect');
        playSound('click');
    });

    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    gameElements.startBtn.addEventListener('click', startGame);
    gameElements.pauseGameBtn.addEventListener('click', pauseGame);
    gameElements.ability1Btn.addEventListener('click', () => useAbility(1));
    gameElements.ability2Btn.addEventListener('click', () => useAbility(2));
}

// ===== SCREEN MANAGEMENT =====
function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function selectHero(heroType) {
    gameState.selectedHero = heroType;
    const hero = heroes[heroType];
    
    gameElements.heroNameMini.textContent = hero.name;
    gameElements.heroAvatarMini.textContent = hero.icon;
    
    switchScreen('game');
    playSound('click');
}

function goHome() {
    switchScreen('home');
    resetGame();
}

function selectHeroScreen() {
    switchScreen('heroSelect');
    resetGame();
}

// ===== GAME MECHANICS =====
function startGame() {
    if (!gameState.selectedHero) return;
    
    gameState.gameRunning = true;
    gameState.gameTime = 60;
    gameState.score = 0;
    gameState.hp = gameState.maxHp;
    gameState.mana = 50;
    gameState.level = 1;
    gameState.rank = 'WARRIOR';
    
    gameElements.gameArea.innerHTML = '';
    gameElements.startBtn.classList.add('hidden');
    gameElements.pauseGameBtn.classList.remove('hidden');
    
    updateUI();
    
    const hero = heroes[gameState.selectedHero];
    
    // Spawn first item immediately
    spawnEnemy();
    
    const spawnInterval = setInterval(() => {
        if (gameState.gameRunning) spawnEnemy();
    }, hero.speed);
    
    const timerInterval = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.gameTime--;
            updateTimer();
            if (gameState.gameTime <= 0) {
                clearInterval(spawnInterval);
                clearInterval(timerInterval);
                endGame();
            }
        }
    }, 1000);
    
    gameState.spawnInterval = spawnInterval;
    gameState.timerInterval = timerInterval;
}

function pauseGame() {
    gameState.gameRunning = !gameState.gameRunning;
    gameElements.pauseGameBtn.textContent = gameState.gameRunning ? '⏸ PAUSE' : '▶ RESUME';
}

function spawnEnemy() {
    // Limit max items on screen
    if (gameElements.gameArea.children.length > 15) return;
    
    const itemTypeKeys = Object.keys(itemTypes);
    const randomType = itemTypeKeys[Math.floor(Math.random() * itemTypeKeys.length)];
    const itemData = itemTypes[randomType];
    
    const item = document.createElement('div');
    item.classList.add('item');
    item.textContent = itemData.icon;
    item.style.left = Math.random() * (gameElements.gameArea.offsetWidth - 50) + 'px';
    item.style.top = Math.random() * (gameElements.gameArea.offsetHeight - 50) + 'px';
    
    item.onclick = (e) => {
        e.stopPropagation();
        handleItemClick(item, itemData);
    };
    
    gameElements.gameArea.appendChild(item);
    
    setTimeout(() => {
        if (item.parentNode) item.remove();
    }, 2500);
}

function handleItemClick(item, itemData) {
    playSound('hit');
    
    if (itemData.type === 'heal') {
        gameState.hp = Math.min(gameState.hp - itemData.points, gameState.maxHp);
    } else if (itemData.type === 'bomb') {
        gameState.hp -= Math.abs(itemData.points);
    } else {
        gameState.score += itemData.points;
        gameState.mana = Math.min(gameState.mana + 5, gameState.maxMana);
    }
    
    item.classList.add('damage');
    setTimeout(() => item.remove(), 500);
    
    updateUI();
    checkGameState();
}

function useAbility(abilityNum) {
    if (gameState.mana < 30) {
        showAlert('💫 Insufficient Mana', 'You need 30 mana to use ability!');
        return;
    }
    
    playSound('levelup');
    gameState.mana -= 30;
    gameState.score += heroes[gameState.selectedHero].damage * 2;
    
    const btn = abilityNum === 1 ? gameElements.ability1Btn : gameElements.ability2Btn;
    const cdDisplay = abilityNum === 1 ? gameElements.ability1Cd : gameElements.ability2Cd;
    
    btn.disabled = true;
    let cooldown = 8;
    cdDisplay.textContent = cooldown;
    
    const cdInterval = setInterval(() => {
        cooldown--;
        cdDisplay.textContent = cooldown > 0 ? cooldown : '';
        if (cooldown <= 0) {
            clearInterval(cdInterval);
            btn.disabled = false;
        }
    }, 1000);
    
    updateUI();
}

function updateUI() {
    // Only update if values changed
    if (gameElements.score.textContent !== gameState.score.toString()) {
        gameElements.score.textContent = gameState.score;
    }
    if (gameElements.hp.textContent !== Math.max(0, gameState.hp).toString()) {
        gameElements.hp.textContent = Math.max(0, gameState.hp);
    }
    if (gameElements.mana.textContent !== gameState.mana.toString()) {
        gameElements.mana.textContent = gameState.mana;
    }
    if (gameElements.heroLevelMini.textContent !== `Lv ${gameState.level}`) {
        gameElements.heroLevelMini.textContent = `Lv ${gameState.level}`;
    }
    if (gameElements.rankDisplay.textContent !== gameState.rank) {
        gameElements.rankDisplay.textContent = gameState.rank;
    }
    
    const hpPercent = (gameState.hp / gameState.maxHp) * 100;
    gameElements.hpFill.style.width = hpPercent + '%';
    
    // Level up
    if (gameState.score >= 150 && gameState.level === 1) {
        gameState.level = 2;
        showAlert('⬆️ Level Up!', 'You reached Level 2!');
    }
    if (gameState.score >= 350 && gameState.level === 2) {
        gameState.level = 3;
        showAlert('⬆️ Level Up!', 'You reached Level 3!');
    }
    if (gameState.score >= 600 && gameState.level === 3) {
        gameState.level = 4;
        showAlert('⬆️ MYTHIC!', 'You reached MYTHIC rank!');
    }
    
    // Rank update
    if (gameState.score >= 100 && gameState.rank === 'WARRIOR') {
        gameState.rank = 'EPIC';
    }
    if (gameState.score >= 300 && gameState.rank === 'EPIC') {
        gameState.rank = 'MYTHIC';
    }
    if (gameState.score >= 600 && gameState.rank === 'MYTHIC') {
        gameState.rank = 'LEGENDARY';
    }
}

function updateTimer() {
    gameElements.timer.textContent = gameState.gameTime;
    if (gameState.gameTime <= 10) {
        gameElements.timer.style.color = '#ff6b6b';
        gameElements.timer.style.textShadow = '0 0 10px #ff6b6b';
    }
}

function checkGameState() {
    if (gameState.hp <= 0) {
        gameState.gameRunning = false;
        endGame();
    }
}

function endGame() {
    clearInterval(gameState.spawnInterval);
    clearInterval(gameState.timerInterval);
    gameState.gameRunning = false;
    
    showResults();
}

function resetGame() {
    gameState = {
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
        musicOn: gameState.musicOn
    };
}

// ===== RESULTS =====
function showResults() {
    const hero = heroes[gameState.selectedHero];
    const isvictory = gameState.score >= 300;
    
    document.getElementById('result-title').textContent = isvictory ? '🏆 VICTORY! 🏆' : '💔 DEFEAT 💔';
    document.getElementById('result-title').style.color = isvictory ? '#ffd700' : '#ff6b6b';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-rank').textContent = gameState.rank;
    document.getElementById('final-hero').textContent = hero.name;
    
    let message = '';
    if (isvictory) {
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
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function toggleMusic() {
    gameState.musicOn = !gameState.musicOn;
    const btn = document.getElementById('musicToggle');
    btn.textContent = gameState.musicOn ? '🔊 MUSIC ON' : '🔇 MUSIC OFF';
}

function playSound(type) {
    if (!gameState.musicOn) return;
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;
            case 'hit':
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.15);
                break;
            case 'levelup':
                oscillator.frequency.setValueAtTime(800, ctx.currentTime);
                oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.2);
                break;
        }
    } catch (e) {
        console.log('Audio disabled');
    }
}

// ===== MODAL ALERTS =====
function showAlert(title, message) {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-header').textContent = title;
    document.getElementById('modal-message').textContent = message;
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
}

// Initialize
window.addEventListener('load', () => {
    initDOMElements();
    initEventListeners();
    switchScreen('home');
});
