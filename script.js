// ===== GAME STATE =====
let gameState = {
    playerHp: 200,
    playerMaxHp: 200,
    playerMana: 100,
    playerMaxMana: 100,
    playerLevel: 1,
    playerAttacking: false,
    
    enemyHp: 200,
    enemyMaxHp: 200,
    enemyMana: 100,
    enemyAttacking: false,
    
    playerTurret: { hp: 150, maxHp: 150 },
    enemyTurret: { hp: 150, maxHp: 150 },
    
    gameTime: 300,
    gameRunning: false,
    selectedHero: null,
    musicOn: true,
    score: 0,
    kills: 0,
    battleLog: [],
    
    floatingDamage: []
};

// ===== HERO DATA =====
const heroes = {
    mage: { 
        name: "Pyromancer", 
        icon: "🔥", 
        color: "#FF6B6B",
        damage: 35,
        attackSpeed: 0.8
    },
    warrior: { 
        name: "Berserker", 
        icon: "⚔️", 
        color: "#FFD700",
        damage: 45,
        attackSpeed: 0.6
    },
    assassin: { 
        name: "Shadow", 
        icon: "🗡️", 
        color: "#6B9EFF",
        damage: 50,
        attackSpeed: 1.2
    }
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
    
    dom.playerHp = document.getElementById('hp-current');
    dom.playerHpFill = document.getElementById('hp-fill');
    dom.playerMana = document.getElementById('mana');
    
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
    
    console.log(`Starting battle with ${gameState.selectedHero}`);
    
    gameState.gameRunning = true;
    gameState.gameTime = 300;
    gameState.score = 0;
    gameState.kills = 0;
    gameState.playerHp = gameState.playerMaxHp;
    gameState.playerMana = gameState.playerMaxMana;
    gameState.enemyHp = gameState.enemyMaxHp;
    gameState.playerTurret.hp = gameState.playerTurret.maxHp;
    gameState.enemyTurret.hp = gameState.enemyTurret.maxHp;
    
    renderBattle();
    updateUI();
    
    dom.startBtn.classList.add('hidden');
    dom.pauseBtn.classList.remove('hidden');
    
    // Enemy AI loop
    const aiLoop = setInterval(() => {
        if (gameState.gameRunning) {
            enemyAI();
        } else {
            clearInterval(aiLoop);
        }
    }, 2500);
    
    // Timer loop
    const timerLoop = setInterval(() => {
        if (gameState.gameRunning) {
            gameState.gameTime--;
            updateTimer();
            
            if (gameState.gameTime <= 0) {
                endGame();
            }
        } else {
            clearInterval(timerLoop);
        }
    }, 1000);
}

function pauseGame() {
    gameState.gameRunning = !gameState.gameRunning;
    dom.pauseBtn.textContent = gameState.gameRunning ? '⏸ PAUSE' : '▶ RESUME';
}

function endGame() {
    gameState.gameRunning = false;
    dom.startBtn.classList.remove('hidden');
    dom.pauseBtn.classList.add('hidden');
    showResults();
}

// ===== PIXELATED AVATAR RENDERER =====
function drawPixelAvatar(canvas, heroType) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const px = 8; // pixel size
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
    
    // Get colors
    const colorMap = {
        mage: { hair: '#FF3333', skin: '#FFB8A3', body: '#DD0000', accent: '#FF6666' },
        warrior: { hair: '#FFD700', skin: '#FFB8A3', body: '#CC8800', accent: '#FFED4E' },
        assassin: { hair: '#4488FF', skin: '#FFB8A3', body: '#0055AA', accent: '#66BBFF' }
    };
    
    const colors = colorMap[heroType];
    
    // Draw pixelated character (8x8 grid)
    const grid = [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,2,1,1,2,1,1],
        [1,1,1,3,3,1,1,1],
        [1,1,1,1,1,1,1,1],
        [1,4,1,1,1,1,4,1],
        [1,4,1,1,1,1,4,1],
        [0,5,0,0,0,0,5,0]
    ];
    
    const colorLookup = {
        0: '#1a1a2e',
        1: colors.body,
        2: colors.hair,
        3: '#fff',
        4: colors.accent,
        5: colors.accent
    };
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const colorIdx = grid[y][x];
            ctx.fillStyle = colorLookup[colorIdx];
            ctx.fillRect(x * px, y * px, px, px);
        }
    }
    
    // Add border
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    
    // Add glow
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = colors.accent;
    ctx.globalAlpha = 0.3;
    ctx.strokeRect(-5, -5, w + 10, h + 10);
    ctx.globalAlpha = 1;
}

// ===== BATTLE RENDERING =====
function renderBattle() {
    dom.gameArea.innerHTML = '';
    
    const playerHpPercent = Math.max(0, (gameState.playerHp / gameState.playerMaxHp) * 100);
    const enemyHpPercent = Math.max(0, (gameState.enemyHp / gameState.enemyMaxHp) * 100);
    const playerTurretPercent = Math.max(0, (gameState.playerTurret.hp / gameState.playerTurret.maxHp) * 100);
    const enemyTurretPercent = Math.max(0, (gameState.enemyTurret.hp / gameState.enemyTurret.maxHp) * 100);
    
    const battleHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; height: 100%; gap: 15px; padding: 15px; position: relative; overflow: hidden;">
            <!-- PLAYER SIDE -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-around;">
                <!-- TURRET -->
                <div style="text-align: center; animation: float 3s ease-in-out infinite;">
                    <div style="font-size: 48px; margin-bottom: 5px;">🏰</div>
                    <div style="font-size: 11px; color: #aaa; font-weight: bold;">TURRET</div>
                    <div style="width: 100px; height: 14px; background: #1a1a2e; border: 2px solid #ffd700; border-radius: 6px; margin-top: 3px; overflow: hidden;">
                        <div style="width: ${playerTurretPercent}%; height: 100%; background: linear-gradient(90deg, #ff6b6b, #ff8e8e); transition: width 0.2s;"></div>
                    </div>
                    <div style="font-size: 9px; color: #666; margin-top: 2px;">${Math.max(0, gameState.playerTurret.hp)}/${gameState.playerTurret.maxHp}</div>
                </div>
                
                <!-- HERO WITH ANIMATION -->
                <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <canvas id="player-avatar" width="100" height="100" style="border: 3px solid #ffd700; border-radius: 3px; background: #1a1a2e; image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; ${gameState.playerAttacking ? 'animation: attackLeft 0.35s;' : ''}" ></canvas>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; font-weight: bold; color: #ffd700;">${heroes[gameState.selectedHero].name}</div>
                        <div style="font-size: 10px; color: #999; margin-top: 2px;">HP</div>
                        <div style="width: 100px; height: 12px; background: #1a1a2e; border: 2px solid #ff6b6b; border-radius: 3px; margin: 2px auto; overflow: hidden;">
                            <div style="width: ${playerHpPercent}%; height: 100%; background: linear-gradient(90deg, #ff6b6b, #ff8e8e); transition: width 0.2s;"></div>
                        </div>
                        <div style="font-size: 8px; color: #666;">${Math.max(0, gameState.playerHp)}/${gameState.playerMaxHp}</div>
                    </div>
                </div>
                
                <!-- BUTTON -->
                <button id="attack-btn" style="padding: 10px 20px; background: linear-gradient(45deg, #ff6b6b, #ff8e8e); color: white; border: 2px solid #ff3333; border-radius: 3px; font-weight: bold; cursor: pointer; font-size: 12px; transition: all 0.15s; ${!gameState.gameRunning ? 'opacity: 0.5; cursor: not-allowed;' : ''}" >⚔️ ATTACK</button>
            </div>
            
            <!-- ENEMY SIDE -->
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-around;">
                <!-- TURRET -->
                <div style="text-align: center; animation: float 3s ease-in-out infinite 1.5s;">
                    <div style="font-size: 48px; margin-bottom: 5px; filter: hue-rotate(180deg);">🏰</div>
                    <div style="font-size: 11px; color: #aaa; font-weight: bold;">TURRET</div>
                    <div style="width: 100px; height: 14px; background: #1a1a2e; border: 2px solid #6B9EFF; border-radius: 6px; margin-top: 3px; overflow: hidden;">
                        <div style="width: ${enemyTurretPercent}%; height: 100%; background: linear-gradient(90deg, #6B9EFF, #9EBFFF); transition: width 0.2s;"></div>
                    </div>
                    <div style="font-size: 9px; color: #666; margin-top: 2px;">${Math.max(0, gameState.enemyTurret.hp)}/${gameState.enemyTurret.maxHp}</div>
                </div>
                
                <!-- HERO WITH ANIMATION -->
                <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <canvas id="enemy-avatar" width="100" height="100" style="border: 3px solid #6B9EFF; border-radius: 3px; background: #1a1a2e; image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; ${gameState.enemyAttacking ? 'animation: attackRight 0.35s;' : ''}" ></canvas>
                    <div style="text-align: center;">
                        <div style="font-size: 14px; font-weight: bold; color: #6B9EFF;">Enemy Hero</div>
                        <div style="font-size: 10px; color: #999; margin-top: 2px;">HP</div>
                        <div style="width: 100px; height: 12px; background: #1a1a2e; border: 2px solid #6B9EFF; border-radius: 3px; margin: 2px auto; overflow: hidden;">
                            <div style="width: ${enemyHpPercent}%; height: 100%; background: linear-gradient(90deg, #6B9EFF, #9EBFFF); transition: width 0.2s;"></div>
                        </div>
                        <div style="font-size: 8px; color: #666;">${Math.max(0, gameState.enemyHp)}/${gameState.enemyMaxHp}</div>
                    </div>
                </div>
                
                <!-- SPACER -->
                <div style="height: 40px;"></div>
            </div>
            
            <!-- BATTLE LOG -->
            <div id="battle-log" style="position: absolute; bottom: 8px; left: 8px; right: 8px; max-height: 60px; background: rgba(0,0,0,0.8); border: 1px solid #ffd700; border-radius: 3px; padding: 6px; overflow-y: auto; font-size: 10px; color: #bbb; line-height: 1.3;">
            </div>
        </div>
    `;
    
    dom.gameArea.innerHTML = battleHTML;
    
    // Draw avatars with pixelated style
    const playerCanvas = document.getElementById('player-avatar');
    const enemyCanvas = document.getElementById('enemy-avatar');
    if (playerCanvas) drawPixelAvatar(playerCanvas, gameState.selectedHero);
    if (enemyCanvas) drawPixelAvatar(enemyCanvas, gameState.selectedHero);
    
    // Update battle log
    updateBattleLogDisplay();
    
    // Attack button
    const attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.addEventListener('click', playerAttack);
        attackBtn.addEventListener('mouseover', (e) => {
            if (gameState.gameRunning) e.target.style.transform = 'scale(1.08)';
        });
        attackBtn.addEventListener('mouseout', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    }
}

function updateBattleLogDisplay() {
    const logEl = document.getElementById('battle-log');
    if (!logEl) return;
    
    const logHtml = gameState.battleLog.slice(-6).map((log, idx, arr) => 
        `<div style="color: ${idx === arr.length - 1 ? '#fff' : '#999'};">${log}</div>`
    ).join('');
    
    logEl.innerHTML = logHtml || '<div style="color: #666;">Battle started...</div>';
    logEl.scrollTop = logEl.scrollHeight;
}

function screenShake(intensity, duration) {
    const gameArea = dom.gameArea;
    if (!gameArea) return;
    
    const shakes = Math.ceil(duration / 30);
    for (let i = 0; i < shakes; i++) {
        setTimeout(() => {
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            gameArea.style.transform = `translate(${x}px, ${y}px)`;
        }, i * 30);
    }
    
    setTimeout(() => {
        gameArea.style.transform = 'translate(0, 0)';
    }, duration);
}

// ===== COMBAT SYSTEM =====
function playerAttack() {
    if (!gameState.gameRunning || gameState.playerAttacking) return;
    
    const hero = heroes[gameState.selectedHero];
    let damage = hero.damage;
    
    if (gameState.playerMana < 25) {
        showAlert('💫 Low Mana', 'Need 25 mana to attack!');
        return;
    }
    
    gameState.playerMana -= 25;
    gameState.playerMana = Math.min(gameState.playerMana + 10, gameState.playerMaxMana);
    
    // Play animation
    gameState.playerAttacking = true;
    setTimeout(() => { gameState.playerAttacking = false; }, 350);
    
    let isCrit = Math.random() < 0.3;
    if (isCrit) {
        damage *= 1.5;
        addLog('⚡ CRIT! ' + Math.floor(damage) + ' DMG');
        screenShake(6, 150);
    } else {
        addLog('HIT! ' + Math.floor(damage) + ' DMG');
        screenShake(3, 100);
    }
    
    gameState.enemyHp -= damage;
    gameState.score += 10;
    
    playSound('hit');
    
    // Turret damage
    if (gameState.enemyHp < gameState.enemyMaxHp * 0.3) {
        gameState.enemyTurret.hp -= Math.floor(damage * 0.5);
        if (gameState.enemyTurret.hp < 0) gameState.enemyTurret.hp = 0;
        addLog('🏰 TURRET HIT!');
    }
    
    if (gameState.enemyHp <= 0) {
        gameState.kills++;
        gameState.score += 200;
        gameState.playerHp = gameState.playerMaxHp;
        gameState.playerMana = gameState.playerMaxMana;
        gameState.enemyHp = gameState.enemyMaxHp;
        addLog('🏆 KILL!');
        
        if (gameState.enemyTurret.hp <= 0) {
            gameState.score += 500;
            addLog('🏰 TURRET DESTROYED!');
        }
    }
    
    updateUI();
    renderBattle();
}

function enemyAI() {
    if (!gameState.gameRunning || gameState.enemyHp <= 0 || gameState.enemyAttacking) return;
    
    if (gameState.enemyHp > gameState.enemyMaxHp * 0.4) {
        gameState.enemyAttacking = true;
        setTimeout(() => { gameState.enemyAttacking = false; }, 350);
        
        let damage = 30;
        let isCrit = Math.random() < 0.3;
        
        if (isCrit) {
            damage *= 1.5;
            addLog('Enemy CRIT! ' + Math.floor(damage) + ' DMG');
            screenShake(6, 150);
        } else {
            addLog('Enemy ATK! ' + Math.floor(damage) + ' DMG');
            screenShake(3, 100);
        }
        
        gameState.playerHp -= damage;
        playSound('hit');
        
        // Turret damage
        if (gameState.playerHp < gameState.playerMaxHp * 0.3) {
            gameState.playerTurret.hp -= Math.floor(damage * 0.5);
            if (gameState.playerTurret.hp < 0) gameState.playerTurret.hp = 0;
            addLog('⚠️ YOUR TURRET HIT!');
        }
        
        if (gameState.playerHp <= 0) {
            endGame();
            return;
        }
    } else {
        addLog('Enemy defending...');
    }
    
    updateUI();
    renderBattle();
}

function addLog(msg) {
    gameState.battleLog.push(msg);
    if (gameState.battleLog.length > 5) {
        gameState.battleLog.shift();
    }
    console.log(msg);
}

// ===== UI UPDATES =====
function updateUI() {
    dom.playerHp.textContent = Math.max(0, gameState.playerHp);
    dom.playerMana.textContent = gameState.playerMana;
    dom.score.textContent = gameState.score;
    dom.heroLevelMini.textContent = `Kills: ${gameState.kills}`;
    
    const hpPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
    dom.playerHpFill.style.width = hpPercent + '%';
    
    // Level up on kills
    if (gameState.kills >= 3 && gameState.playerLevel === 1) {
        gameState.playerLevel = 2;
        showAlert('⬆️ LEVEL UP!', 'You are now Level 2!');
    }
    if (gameState.kills >= 7 && gameState.playerLevel === 2) {
        gameState.playerLevel = 3;
        showAlert('⬆️ MYTHIC!', 'You reached Mythic level!');
    }
}

function updateTimer() {
    dom.timer.textContent = Math.floor(gameState.gameTime / 60) + ':' + String(gameState.gameTime % 60).padStart(2, '0');
    
    if (gameState.gameTime <= 60) {
        dom.timer.style.color = '#ff6b6b';
    }
}

// ===== RESULTS =====
function showResults() {
    const hero = heroes[gameState.selectedHero];
    const isVictory = gameState.kills >= 3 || gameState.enemyTurret.hp <= 0;
    const isTurretDestroyed = gameState.enemyTurret.hp <= 0;
    
    document.getElementById('result-title').textContent = isVictory ? '🏆 VICTORY! 🏆' : '⚔️ BATTLE END ⚔️';
    document.getElementById('result-title').style.color = isVictory ? '#ffd700' : '#bbb';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-rank').textContent = isTurretDestroyed ? 'TURRET DESTROYED' : `${gameState.kills} Kills`;
    document.getElementById('final-hero').textContent = hero.name;
    
    let message = '';
    if (isVictory) {
        if (isTurretDestroyed) {
            message = `Legendary victory as ${hero.name}!\nYou destroyed the enemy turret!\nYour strategic power is unstoppable! 💕`;
        } else {
            message = `Legendary victory as ${hero.name}!\nYou defeated enemies with ${gameState.kills} kills!\nYour power is unstoppable! 💕`;
        }
    } else {
        message = `Battle ended with ${gameState.kills} kills.\nKeep training to become a legend!`;
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
        
        if (type === 'hit') {
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) {
        // Ignore
    }
}

function toggleMusic() {
    gameState.musicOn = !gameState.musicOn;
    const btn = document.getElementById('musicToggle');
    btn.textContent = gameState.musicOn ? '🔊 MUSIC ON' : '🔇 MUSIC OFF';
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
    switchScreen('home');
}

function selectHeroScreen() {
    switchScreen('heroSelect');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');
    cacheDOM();
    
    document.getElementById('playBtn').addEventListener('click', () => {
        switchScreen('heroSelect');
    });
    
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    dom.startBtn.addEventListener('click', startGame);
    dom.pauseBtn.addEventListener('click', pauseGame);
    
    switchScreen('home');
    console.log('Game ready!');
});
