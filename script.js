// ===== GAME STATE =====
let gameState = {
    score: 0,
    hp: 100,
    maxHp: 100,
    mana: 100,
    maxMana: 100,
    level: 1,
    rank: 'WARRIOR',
    gameTime: 120,
    gameRunning: false,
    selectedHero: null,
    musicOn: true,
    spawnInterval: null,
    timerInterval: null,
    enemies: [],
    wave: 1,
    kills: 0
};

// ===== HERO DATA =====
const heroes = {
    mage: { 
        name: "Pyromancer", 
        icon: "🔥", 
        damage: 30, 
        speed: 600,
        baseAttackSpeed: 1.2
    },
    warrior: { 
        name: "Berserker", 
        icon: "⚔️", 
        damage: 25, 
        speed: 700,
        baseAttackSpeed: 0.8
    },
    assassin: { 
        name: "Shadow", 
        icon: "🗡️", 
        damage: 40, 
        speed: 800,
        baseAttackSpeed: 1.5
    }
};

// ===== ENEMY DATA =====
class Enemy {
    constructor(wave) {
        this.id = Math.random();
        this.hp = 30 + (wave * 10);
        this.maxHp = this.hp;
        this.damage = 10 + (wave * 3);
        this.speed = 100 + (wave * 20);
        this.x = Math.random() * (dom.gameArea.offsetWidth - 60);
        this.y = Math.random() * (dom.gameArea.offsetHeight - 60);
        this.element = null;
    }
    
    takeDamage(amount) {
        this.hp -= amount;
        return this.hp <= 0;
    }
}

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
    
    console.log(`Starting game with hero: ${gameState.selectedHero}`);
    
    gameState.gameRunning = true;
    gameState.gameTime = 120;
    gameState.score = 0;
    gameState.hp = gameState.maxHp;
    gameState.mana = gameState.maxMana;
    gameState.level = 1;
    gameState.rank = 'WARRIOR';
    gameState.wave = 1;
    gameState.kills = 0;
    gameState.enemies = [];
    
    dom.gameArea.innerHTML = '';
    dom.startBtn.classList.add('hidden');
    dom.pauseBtn.classList.remove('hidden');
    
    updateUI();
    spawnWave();
    
    // Spawn new wave every 15 seconds
    gameState.spawnInterval = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.wave++;
            spawnWave();
        }
    }, 15000);
    
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
    
    // Enemy update loop
    const updateLoop = setInterval(() => {
        if (gameState.gameRunning) {
            updateEnemies();
        } else {
            clearInterval(updateLoop);
        }
    }, 100);
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

// ===== WAVE SPAWNING =====
function spawnWave() {
    const waveSize = 2 + gameState.wave;
    console.log(`Spawning wave ${gameState.wave} with ${waveSize} enemies`);
    
    for (let i = 0; i < waveSize; i++) {
        setTimeout(() => {
            if (gameState.gameRunning) {
                const enemy = new Enemy(gameState.wave);
                gameState.enemies.push(enemy);
                renderEnemy(enemy);
            }
        }, i * 300);
    }
}

function renderEnemy(enemy) {
    const element = document.createElement('div');
    element.className = 'enemy';
    element.textContent = '👹';
    element.style.left = enemy.x + 'px';
    element.style.top = enemy.y + 'px';
    
    // Health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'enemy-hp';
    healthBar.style.width = '100%';
    healthBar.style.height = '2px';
    healthBar.style.background = '#4CAF50';
    healthBar.style.position = 'absolute';
    healthBar.style.top = '-8px';
    healthBar.style.borderRadius = '1px';
    
    element.appendChild(healthBar);
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        attackEnemy(enemy);
    });
    
    dom.gameArea.appendChild(element);
    enemy.element = element;
}

function updateEnemies() {
    gameState.enemies = gameState.enemies.filter(enemy => {
        if (enemy.element && enemy.element.parentNode) {
            // Update position
            enemy.x += (Math.random() - 0.5) * 4;
            enemy.y += (Math.random() - 0.5) * 4;
            
            // Boundaries
            enemy.x = Math.max(0, Math.min(enemy.x, dom.gameArea.offsetWidth - 60));
            enemy.y = Math.max(0, Math.min(enemy.y, dom.gameArea.offsetHeight - 60));
            
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';
            
            // Update health bar
            const hpPercent = (enemy.hp / enemy.maxHp) * 100;
            enemy.element.querySelector('.enemy-hp').style.width = hpPercent + '%';
            
            return true;
        }
        return false;
    });
}

function attackEnemy(enemy) {
    const hero = heroes[gameState.selectedHero];
    let damage = hero.damage;
    
    // Mana cost: 20 per attack
    if (gameState.mana < 20) {
        showAlert('💫 Low Mana', 'Need 20 mana to attack!');
        return;
    }
    
    gameState.mana -= 20;
    
    if (enemy.takeDamage(damage)) {
        // Enemy died
        gameState.score += 50 * gameState.wave;
        gameState.kills++;
        gameState.mana = Math.min(gameState.mana + 10, gameState.maxMana);
        
        enemy.element.textContent = '💥';
        enemy.element.style.opacity = '0.5';
        
        playSound('hit');
        
        setTimeout(() => {
            if (enemy.element && enemy.element.parentNode) {
                enemy.element.remove();
            }
        }, 300);
    } else {
        // Enemy took damage
        playSound('click');
        
        // Enemy deals damage back
        gameState.hp -= Math.floor(enemy.damage / 2);
        
        if (gameState.hp <= 0) {
            gameState.hp = 0;
            endGame();
            return;
        }
    }
    
    updateUI();
}

// ===== ABILITIES =====
function useAbility(abilityNum) {
    if (!gameState.gameRunning) return;
    
    if (gameState.mana < 50) {
        showAlert('💫 Low Mana', 'Need 50 mana for ability!');
        return;
    }
    
    const hero = heroes[gameState.selectedHero];
    gameState.mana -= 50;
    
    if (abilityNum === 1) {
        // AOE ability - damage all enemies
        const damage = hero.damage * 2;
        gameState.enemies = gameState.enemies.filter(enemy => {
            if (!enemy.takeDamage(damage)) return true;
            
            // Enemy died
            gameState.score += 100 * gameState.wave;
            gameState.kills++;
            enemy.element.textContent = '💥';
            setTimeout(() => {
                if (enemy.element && enemy.element.parentNode) {
                    enemy.element.remove();
                }
            }, 300);
            return false;
        });
    } else {
        // Single target ability - damage strongest enemy
        if (gameState.enemies.length > 0) {
            const strongest = gameState.enemies.reduce((a, b) => a.hp > b.hp ? a : b);
            if (strongest.takeDamage(hero.damage * 3)) {
                gameState.score += 150 * gameState.wave;
                gameState.kills++;
                strongest.element.textContent = '💥';
                setTimeout(() => {
                    if (strongest.element && strongest.element.parentNode) {
                        strongest.element.remove();
                    }
                }, 300);
                gameState.enemies = gameState.enemies.filter(e => e !== strongest);
            }
        }
    }
    
    playSound('levelup');
    
    const btn = abilityNum === 1 ? dom.ability1Btn : dom.ability2Btn;
    const cdDisplay = abilityNum === 1 ? dom.ability1Cd : dom.ability2Cd;
    
    btn.disabled = true;
    let cooldown = 6;
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
    if (!dom.score) return;
    
    dom.score.textContent = gameState.score;
    dom.hp.textContent = Math.max(0, gameState.hp);
    dom.mana.textContent = gameState.mana;
    dom.heroLevelMini.textContent = `Wave ${gameState.wave} | Kills: ${gameState.kills}`;
    dom.rankDisplay.textContent = `${gameState.rank} Lv${gameState.level}`;
    
    const hpPercent = (gameState.hp / gameState.maxHp) * 100;
    dom.hpFill.style.width = hpPercent + '%';
    
    // Rank progression
    if (gameState.score >= 500 && gameState.level === 1) {
        gameState.level = 2;
        gameState.rank = 'EPIC';
        showAlert('⬆️ RANKED UP!', 'Now EPIC Lv2!');
    }
    if (gameState.score >= 1500 && gameState.level === 2) {
        gameState.level = 3;
        gameState.rank = 'MYTHIC';
        showAlert('⬆️ RANKED UP!', 'Now MYTHIC Lv3!');
    }
    if (gameState.score >= 3000 && gameState.level === 3) {
        gameState.level = 4;
        gameState.rank = 'LEGEND';
        showAlert('⬆️ RANKED UP!', 'Now LEGEND Lv4!');
    }
}

function updateTimer() {
    if (!dom.timer) return;
    dom.timer.textContent = gameState.gameTime;
    
    if (gameState.gameTime <= 20) {
        dom.timer.style.color = '#ff6b6b';
        dom.timer.style.textShadow = '0 0 10px #ff6b6b';
    }
}

// ===== RESULTS =====
function showResults() {
    const hero = heroes[gameState.selectedHero];
    const isVictory = gameState.score >= 500;
    
    document.getElementById('result-title').textContent = isVictory ? '🏆 VICTORY! 🏆' : '💔 DEFEAT 💔';
    document.getElementById('result-title').style.color = isVictory ? '#ffd700' : '#ff6b6b';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-rank').textContent = gameState.rank;
    document.getElementById('final-hero').textContent = `${hero.name} (Wave: ${gameState.wave}, Kills: ${gameState.kills})`;
    
    let message = '';
    if (isVictory) {
        message = `Excellent performance as ${hero.name}!\nYou defeated ${gameState.kills} enemies across ${gameState.wave} waves!\nYour legendary power is unstoppable! 💕`;
    } else {
        message = `You were defeated at Wave ${gameState.wave} with ${gameState.kills} kills.\nEvery warrior falls, but legends rise again!`;
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
    console.log('Game initializing...');
    cacheDOM();
    console.log('DOM cached');
    
    // Setup event listeners
    document.getElementById('playBtn').addEventListener('click', () => {
        console.log('Play button clicked');
        switchScreen('heroSelect');
        playSound('click');
    });
    
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    dom.startBtn.addEventListener('click', () => {
        console.log('Start game clicked');
        startGame();
    });
    dom.pauseBtn.addEventListener('click', pauseGame);
    dom.ability1Btn.addEventListener('click', () => useAbility(1));
    dom.ability2Btn.addEventListener('click', () => useAbility(2));
    
    switchScreen('home');
    console.log('Game ready!');
});
