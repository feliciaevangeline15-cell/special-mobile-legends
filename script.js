// ===== GAME STATE =====
let gameState = {
    playerHp: 200,
    playerMaxHp: 200,
    playerMana: 100,
    playerMaxMana: 100,
    
    enemyHp: 200,
    enemyMaxHp: 200,
    
    gameTime: 300,
    gameRunning: false,
    selectedHero: null,
    musicOn: true,
    score: 0,
    kills: 0,
    
    battleLog: [],
    playerAttacking: false,
    enemyAttacking: false
};

// ===== HERO DATA =====
const heroes = {
    mage: { 
        name: "Luna", 
        icon: "🧙‍♀️",
        type: "Fire Mage",
        damage: 35
    },
    warrior: { 
        name: "Kael", 
        icon: "🧔‍♂️",
        type: "Sword Master",
        damage: 45
    },
    assassin: { 
        name: "Sera", 
        icon: "🧝‍♀️",
        type: "Shadow Rogue",
        damage: 50
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
    dom.heroNameMini = document.getElementById('hero-name-mini');
    dom.heroLevelMini = document.getElementById('hero-level-mini');
    dom.heroAvatarMini = document.getElementById('hero-avatar-mini');
    
    dom.startBtn = document.getElementById('startGameBtn');
    dom.pauseBtn = document.getElementById('pauseGameBtn');
    
    dom.modal = document.getElementById('custom-modal');
    dom.modalHeader = document.getElementById('modal-header');
    dom.modalMessage = document.getElementById('modal-message');
}

function switchScreen(screenName) {
    Object.values(dom.screens).forEach(s => s.classList.remove('active'));
    dom.screens[screenName].classList.add('active');
}

function selectHero(heroType) {
    gameState.selectedHero = heroType;
    const hero = heroes[heroType];
    
    dom.heroAvatarMini.textContent = hero.icon;
    dom.heroNameMini.textContent = hero.name;
    dom.heroLevelMini.textContent = 'Lv 1';
    
    switchScreen('game');
}

function startGame() {
    if (!gameState.selectedHero) {
        showAlert('No Hero', 'Please choose a hero first!');
        return;
    }
    
    gameState.gameRunning = true;
    gameState.gameTime = 300;
    gameState.score = 0;
    gameState.kills = 0;
    gameState.playerHp = gameState.playerMaxHp;
    gameState.playerMana = gameState.playerMaxMana;
    gameState.enemyHp = gameState.enemyMaxHp;
    gameState.battleLog = [];
    
    renderBattle();
    updateUI();
    
    dom.startBtn.classList.add('hidden');
    dom.pauseBtn.classList.remove('hidden');
    
    // Enemy AI loop
    const aiLoop = setInterval(() => {
        if (gameState.gameRunning && !gameState.enemyAttacking) {
            enemyAI();
        } else if (!gameState.gameRunning) {
            clearInterval(aiLoop);
        }
    }, 3000);
    
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
    dom.pauseBtn.textContent = gameState.gameRunning ? 'PAUSE' : 'RESUME';
}

function endGame() {
    gameState.gameRunning = false;
    dom.startBtn.classList.remove('hidden');
    dom.pauseBtn.classList.add('hidden');
    showResults();
}

function renderBattle() {
    dom.gameArea.innerHTML = '';
    
    const hero = heroes[gameState.selectedHero];
    const playerHpPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
    const enemyHpPercent = (gameState.enemyHp / gameState.enemyMaxHp) * 100;
    
    const battleHTML = `
        <style>
            @keyframes attackLeft { 0% { transform: translateX(0); } 50% { transform: translateX(30px); } 100% { transform: translateX(0); } }
            @keyframes attackRight { 0% { transform: translateX(0); } 50% { transform: translateX(-30px); } 100% { transform: translateX(0); } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            
            .player-avatar { animation: ${gameState.playerAttacking ? 'attackLeft 0.4s' : 'none'}; }
            .enemy-avatar { animation: ${gameState.enemyAttacking ? 'attackRight 0.4s' : 'none'}; }
        </style>
        
        <div style="display: flex; flex-direction: column; height: 100%; padding: 20px; gap: 15px; justify-content: space-between;">
            
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">
                ARENA BATTLE
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex: 1; align-items: center;">
                
                <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05)); border: 2px solid #ffd700; border-radius: 15px; padding: 25px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <div class="player-avatar" style="font-size: 120px; line-height: 1; filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); transition: transform 0.4s;">
                        ${hero.icon}
                    </div>
                    <div>
                        <div style="font-size: 22px; font-weight: bold; color: #ffd700;">
                            ${hero.name}
                        </div>
                        <div style="font-size: 12px; color: #aaa; margin-top: 3px;">
                            ${hero.type}
                        </div>
                    </div>
                    
                    <div style="width: 100%; background: #0a0a0a; border: 2px solid #ff6b6b; border-radius: 10px; padding: 3px; overflow: hidden;">
                        <div style="width: ${playerHpPercent}%; height: 20px; background: linear-gradient(90deg, #ff6b6b, #ff8e8e); border-radius: 6px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #ff6b6b;">
                        ${Math.max(0, gameState.playerHp)} / ${gameState.playerMaxHp}
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 107, 107, 0.05)); border: 2px solid #ff6b6b; border-radius: 15px; padding: 25px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <div class="enemy-avatar" style="font-size: 120px; line-height: 1; filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.5)); transform: scaleX(-1); transition: transform 0.4s;">
                        🧟
                    </div>
                    <div>
                        <div style="font-size: 22px; font-weight: bold; color: #ff6b6b;">
                            Enemy
                        </div>
                        <div style="font-size: 12px; color: #aaa; margin-top: 3px;">
                            Opponent
                        </div>
                    </div>
                    
                    <div style="width: 100%; background: #0a0a0a; border: 2px solid #6B9EFF; border-radius: 10px; padding: 3px; overflow: hidden;">
                        <div style="width: ${enemyHpPercent}%; height: 20px; background: linear-gradient(90deg, #6B9EFF, #9EBFFF); border-radius: 6px; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="font-size: 14px; font-weight: bold; color: #6B9EFF;">
                        ${Math.max(0, gameState.enemyHp)} / ${gameState.enemyMaxHp}
                    </div>
                </div>
            </div>
            
            <div id="battle-log" style="background: rgba(0, 0, 0, 0.7); border: 1px solid #444; border-radius: 10px; padding: 12px; max-height: 70px; overflow-y: auto; font-size: 12px; color: #aaa; line-height: 1.4;">
                ${gameState.battleLog.slice(-3).map(log => `<div style="color: #ffd700;">* ${log}</div>`).join('')}
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button id="attack-btn" style="padding: 18px 70px; background: linear-gradient(135deg, #ff3333, #ff6b6b); color: white; border: 3px solid #ff0000; border-radius: 12px; font-weight: bold; font-size: 18px; cursor: pointer; box-shadow: 0 5px 20px rgba(255, 51, 51, 0.4); transition: all 0.2s; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);">
                    ATTACK
                </button>
                <button id="defend-btn" style="padding: 18px 55px; background: linear-gradient(135deg, #4a90e2, #357abd); color: white; border: 3px solid #2563be; border-radius: 12px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 5px 20px rgba(74, 144, 226, 0.4); transition: all 0.2s; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);">
                    DEFEND
                </button>
            </div>
        </div>
    `;
    
    dom.gameArea.innerHTML = battleHTML;
    
    const attackBtn = document.getElementById('attack-btn');
    const defendBtn = document.getElementById('defend-btn');
    
    if (attackBtn) {
        attackBtn.addEventListener('click', playerAttack);
        attackBtn.addEventListener('mouseover', (e) => {
            if (gameState.gameRunning) {
                e.target.style.transform = 'scale(1.08)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5)';
            }
        });
        attackBtn.addEventListener('mouseout', (e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 5px 20px rgba(255, 51, 51, 0.4)';
        });
    }
    
    if (defendBtn) {
        defendBtn.addEventListener('click', playerDefend);
        defendBtn.addEventListener('mouseover', (e) => {
            if (gameState.gameRunning) {
                e.target.style.transform = 'scale(1.08)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5)';
            }
        });
        defendBtn.addEventListener('mouseout', (e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 5px 20px rgba(74, 144, 226, 0.4)';
        });
    }
}

function playerAttack() {
    if (!gameState.gameRunning || gameState.playerAttacking) return;
    
    const hero = heroes[gameState.selectedHero];
    let damage = hero.damage;
    
    if (gameState.playerMana < 25) {
        showAlert('Low Mana!', 'Need 25 mana to attack. Regen by defending!');
        return;
    }
    
    gameState.playerMana -= 25;
    gameState.playerAttacking = true;
    
    let isCrit = Math.random() < 0.3;
    if (isCrit) {
        damage *= 1.5;
        addLog('CRITICAL HIT! ' + Math.floor(damage) + ' damage!');
    } else {
        addLog('Hit for ' + Math.floor(damage) + ' damage!');
    }
    
    gameState.enemyHp -= damage;
    gameState.score += 10;
    
    playSound('attack');
    screenShake();
    
    setTimeout(() => {
        gameState.playerAttacking = false;
        
        if (gameState.enemyHp <= 0) {
            gameState.kills++;
            gameState.score += 200;
            addLog('ENEMY DEFEATED!');
            
            setTimeout(() => {
                gameState.playerHp = gameState.playerMaxHp;
                gameState.playerMana = gameState.playerMaxMana;
                gameState.enemyHp = gameState.enemyMaxHp;
                renderBattle();
            }, 1500);
        } else {
            updateUI();
            renderBattle();
        }
    }, 400);
}

function playerDefend() {
    if (!gameState.gameRunning || gameState.playerAttacking) return;
    
    gameState.playerAttacking = true;
    gameState.playerMana = Math.min(gameState.playerMana + 30, gameState.playerMaxMana);
    addLog('Defending... Mana +30!');
    
    playSound('defend');
    
    setTimeout(() => {
        gameState.playerAttacking = false;
        updateUI();
        renderBattle();
    }, 400);
}

function enemyAI() {
    if (!gameState.gameRunning || gameState.enemyHp <= 0) return;
    
    gameState.enemyAttacking = true;
    
    if (gameState.enemyHp > gameState.enemyMaxHp * 0.4) {
        let damage = 30;
        
        if (Math.random() < 0.3) {
            damage *= 1.5;
            addLog('Enemy CRITICAL! ' + Math.floor(damage) + ' damage!');
        } else {
            addLog('Enemy attacks! ' + Math.floor(damage) + ' damage!');
        }
        
        gameState.playerHp -= damage;
        playSound('attack');
        screenShake();
        
        if (gameState.playerHp <= 0) {
            addLog('YOU WERE DEFEATED!');
            setTimeout(() => endGame(), 500);
        }
    } else {
        addLog('Enemy defending...');
    }
    
    setTimeout(() => {
        gameState.enemyAttacking = false;
        updateUI();
        renderBattle();
    }, 400);
}

function addLog(msg) {
    gameState.battleLog.push(msg);
    if (gameState.battleLog.length > 5) {
        gameState.battleLog.shift();
    }
}

function screenShake() {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    gameArea.style.animation = 'none';
    setTimeout(() => {
        gameArea.style.animation = 'shake 0.3s';
    }, 10);
}

function updateUI() {
    if (!dom.playerHp) return;
    dom.playerHp.textContent = Math.max(0, gameState.playerHp);
    dom.playerMana.textContent = gameState.playerMana;
    dom.score.textContent = gameState.score;
    dom.heroLevelMini.textContent = 'Kills: ' + gameState.kills;
    
    const hpPercent = (gameState.playerHp / gameState.playerMaxHp) * 100;
    if (dom.playerHpFill) dom.playerHpFill.style.width = hpPercent + '%';
}

function updateTimer() {
    if (!dom.timer) return;
    const mins = Math.floor(gameState.gameTime / 60);
    const secs = gameState.gameTime % 60;
    dom.timer.textContent = mins + ':' + String(secs).padStart(2, '0');
    
    if (gameState.gameTime <= 60) {
        dom.timer.style.color = '#ff6b6b';
    } else {
        dom.timer.style.color = '#ffd700';
    }
}

function showResults() {
    const hero = heroes[gameState.selectedHero];
    const isVictory = gameState.kills >= 5;
    
    document.getElementById('result-title').textContent = isVictory ? 'VICTORY!' : 'BATTLE END';
    document.getElementById('result-title').style.color = isVictory ? '#ffd700' : '#bbb';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-rank').textContent = gameState.kills + ' Kills';
    document.getElementById('final-hero').textContent = hero.name;
    
    let message = '';
    if (isVictory) {
        message = 'Legendary victory!\n' + gameState.kills + ' enemies defeated!\n' + hero.name + ' power is unstoppable!';
    } else {
        message = 'Battle ended with ' + gameState.kills + ' kills.\nKeep training and come back stronger!';
    }
    document.getElementById('result-message').textContent = message;
    
    switchScreen('result');
}

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
        
        if (type === 'attack') {
            osc.frequency.value = 700;
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'defend') {
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        }
    } catch (e) {
        // Audio error
    }
}

function toggleMusic() {
    gameState.musicOn = !gameState.musicOn;
    const btn = document.getElementById('musicToggle');
    btn.textContent = gameState.musicOn ? 'MUSIC ON' : 'MUSIC OFF';
}

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

function goHome() {
    gameState.gameRunning = false;
    switchScreen('home');
}

function selectHeroScreen() {
    switchScreen('heroSelect');
}

document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    
    document.getElementById('playBtn').addEventListener('click', () => {
        switchScreen('heroSelect');
    });
    
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    dom.startBtn.addEventListener('click', startGame);
    dom.pauseBtn.addEventListener('click', pauseGame);
    
    switchScreen('home');
});
