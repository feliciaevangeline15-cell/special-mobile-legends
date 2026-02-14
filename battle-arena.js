// ===== GAME STATE =====
const battleState = {
    currentRound: 1,
    totalRounds: 5,
    currentLevel: 1,
    relationshipHp: 100,
    relationshipMaxHp: 100,
    
    // Enemy wave system
    enemies: [],
    totalEnemyHp: 0,
    totalMaxEnemyHp: 0,
    
    // Turn tracking
    currentTurn: 'player',
    protectorBuff: null,
    heroineBuff: null,
    
    // Combat log
    battleLog: []
};

// ===== ENEMY TYPES =====
const enemyTypes = [
    { name: 'Confusion Sprite', icon: '👻', baseHp: 20, baseDmg: 8 },
    { name: 'Doubt Wraith', icon: '💀', baseHp: 25, baseDmg: 10 },
    { name: 'Misery Shade', icon: '👹', baseHp: 30, baseDmg: 12 },
    { name: 'Sadness Ghost', icon: '😢', baseHp: 22, baseDmg: 9 },
    { name: 'Despair Phantom', icon: '🌑', baseHp: 35, baseDmg: 14 }
];

// ===== LEVEL PROGRESSION DATA =====
const levelProgression = [
    { level: 1, enemyCount: 2, hpMultiplier: 1.0, dmgMultiplier: 1.0, name: 'Beginner' },
    { level: 2, enemyCount: 3, hpMultiplier: 1.2, dmgMultiplier: 1.1, name: 'Intermediate' },
    { level: 3, enemyCount: 3, hpMultiplier: 1.5, dmgMultiplier: 1.3, name: 'Advanced' },
    { level: 4, enemyCount: 4, hpMultiplier: 1.8, dmgMultiplier: 1.5, name: 'Expert' },
    { level: 5, enemyCount: 5, hpMultiplier: 2.2, dmgMultiplier: 1.8, name: 'Legendary' }
];

// ===== INITIALIZE GAME =====
function initBattle() {
    battleState.currentRound = 1;
    battleState.currentLevel = 1;
    battleState.relationshipHp = 100;
    battleState.relationshipMaxHp = 100;
    battleState.battleLog = [];
    
    // Check for startLevel in URL to resume at a specific level
    const urlParams = new URLSearchParams(window.location.search);
    const startLevel = parseInt(urlParams.get('startLevel')) || 0;
    if (startLevel && !isNaN(startLevel) && startLevel >= 1 && startLevel <= levelProgression.length) {
        loadLevel(startLevel);
    } else {
        loadLevel(1);
    }
    updateUI();
    enableAllSkills();
    addLog('🎮 Battle Start! Face Level ' + battleState.currentLevel, 'narration');
}

function loadLevel(levelNum) {
    const levelData = levelProgression[levelNum - 1];
    battleState.currentLevel = levelNum;
    battleState.currentTurn = 'player';
    battleState.protectorBuff = null;
    battleState.heroineBuff = null;
    
    // Generate enemies for this level
    battleState.enemies = [];
    let totalHp = 0;
    
    for (let i = 0; i < levelData.enemyCount; i++) {
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const hp = Math.ceil(enemyType.baseHp * levelData.hpMultiplier);
        const dmg = Math.ceil(enemyType.baseDmg * levelData.dmgMultiplier);
        
        battleState.enemies.push({
            id: i,
            name: enemyType.name,
            icon: enemyType.icon,
            maxHp: hp,
            hp: hp,
            damage: dmg,
            defeated: false
        });
        
        totalHp += hp;
    }
    
    battleState.totalEnemyHp = totalHp;
    battleState.totalMaxEnemyHp = totalHp;
    
    // Update UI
    document.getElementById('boss-name').textContent = `Level ${levelNum} - ${levelData.name}`;
    document.getElementById('boss-description').textContent = `${levelData.enemyCount} enemies ahead! Enemies grow stronger with each level.`;
    document.getElementById('boss-hp').textContent = Math.ceil(battleState.totalEnemyHp);
    document.getElementById('boss-max-hp').textContent = battleState.totalMaxEnemyHp;
    document.getElementById('current-round').textContent = levelNum;
    document.getElementById('battle-subtitle').textContent = `Level ${levelNum} - ${levelData.name} Mode`;
    document.getElementById('narration-text').textContent = `⚔️ Level ${levelNum} begins! ${levelData.enemyCount} enemies appear! Can you overcome this challenge?`;
    
    renderEnemies();
    updateUI();
}

function renderEnemies() {
    const container = document.getElementById('enemies-container');
    container.innerHTML = '';
    
    battleState.enemies.forEach(enemy => {
        const card = document.createElement('div');
        card.className = `enemy-card ${enemy.defeated ? 'defeated' : ''}`;
        card.innerHTML = `
            <div class="enemy-icon">${enemy.icon}</div>
            <div class="enemy-name">${enemy.name}</div>
            <div class="enemy-hp-small">${enemy.hp}/${enemy.maxHp}</div>
        `;
        container.appendChild(card);
    });
}

// ===== SKILL USAGE =====
function useSkill(skillType, character) {
    if (battleState.currentTurn !== 'player') return;
    
    disableAllSkills();
    
    let damage = 0;
    let healAmount = 0;
    let narration = '';
    
    if (character === 'protector') {
        if (skillType === 'embrace') {
            damage = 15;
            healAmount = 5;
            narration = '🛡️ The Protector gives a Comforting Embrace, hitting enemies and healing!';
            playAttackAnimation('protector');
            playAttackSound();
        } else if (skillType === 'reassurance') {
            damage = 25;
            healAmount = 2;
            narration = '💬 Words of Reassurance! A strong attack on all enemies!';
            playAttackAnimation('protector');
            playAttackSound();
        } else if (skillType === 'surprise') {
            damage = 10;
            healAmount = 3;
            battleState.protectorBuff = 'skip';
            narration = '🎁 Surprise Gift! All enemies lose their next turn!';
            playAttackAnimation('protector');
            playAttackSound();
        }
    } else if (character === 'heroine') {
        if (skillType === 'smile') {
            damage = 18;
            healAmount = 3;
            narration = '✨ The Heroine\'s Beaming Smile charms all enemies!';
            playAttackAnimation('heroine');
            playAttackSound();
        } else if (skillType === 'communication') {
            damage = 28;
            healAmount = 1;
            narration = '🗣️ Open Communication! A powerful blast hits all enemies!';
            playAttackAnimation('heroine');
            playAttackSound();
        } else if (skillType === 'gesture') {
            damage = 8;
            healAmount = 5;
            battleState.heroineBuff = 'shield';
            narration = '💝 A Thoughtful Gesture! Reduces incoming damage next turn!';
            playAttackAnimation('heroine');
            playAttackSound();
        }
    }
    
    // Apply damage to first alive enemy
    let enemyHit = false;
    for (let i = 0; i < battleState.enemies.length; i++) {
        if (!battleState.enemies[i].defeated) {
            battleState.enemies[i].hp -= damage;
            if (battleState.enemies[i].hp < 0) battleState.enemies[i].hp = 0;
            enemyHit = true;
            
            if (battleState.enemies[i].hp <= 0) {
                battleState.enemies[i].defeated = true;
                narration += ` ☠️ ${battleState.enemies[i].name} defeated!`;
            }
            break;
        }
    }
    
    // Calculate total remaining hp
    let totalHp = 0;
    battleState.enemies.forEach(e => totalHp += e.hp);
    battleState.totalEnemyHp = totalHp;
    
    // Apply healing
    if (healAmount > 0) {
        battleState.relationshipHp = Math.min(battleState.relationshipHp + healAmount, battleState.relationshipMaxHp);
    }
    
    // Show damage popup
    showDamageNumber(damage);
    
    // Screen shake on hit
    screenShakeEffect();
    
    addLog(narration, character);
    renderEnemies();
    updateUI();
    
    // Check victory
    if (battleState.totalEnemyHp <= 0) {
        setTimeout(() => {
            showVictory();
        }, 1500);
        return;
    }
    
    // Enemy turn
    battleState.currentTurn = 'enemy';
    setTimeout(() => {
        enemyTurn();
    }, 1500);
}

// ===== ENEMY AI TURN =====
function enemyTurn() {
    // Check if enemy should skip (protector's surprise gift)
    if (battleState.protectorBuff === 'skip') {
        battleState.protectorBuff = null;
        addLog('🎁 All enemies are distracted and skip their turn!', 'boss');
        battleState.currentTurn = 'player';
        enableAllSkills();
        updateUI();
        return;
    }
    
    // Calculate total damage from all alive enemies
    let totalDamage = 0;
    let narration = '🔥 ';
    let enemyCount = 0;
    
    battleState.enemies.forEach(enemy => {
        if (!enemy.defeated) {
            totalDamage += enemy.damage;
            narration += `${enemy.icon} `;
            enemyCount++;
        }
    });
    
    if (enemyCount === 0) {
        battleState.currentTurn = 'player';
        setTimeout(() => {
            enableAllSkills();
        }, 500);
        return;
    }
    
    narration += 'All enemies attack together!';
    
    // Apply shield if Heroine used Thoughtful Gesture
    if (battleState.heroineBuff === 'shield') {
        totalDamage = Math.floor(totalDamage / 2);
        narration += ' (Thoughtful Gesture reduces the damage!)';
        battleState.heroineBuff = null;
    }
    
    battleState.relationshipHp -= totalDamage;
    
    // Show damage popup
    showDamageNumber(totalDamage, true);
    
    // Screen shake on hit
    screenShakeEffect();
    
    // Boss attack animation
    playBossAttackAnimation();
    
    addLog(narration, 'boss');
    
    if (battleState.relationshipHp <= 0) {
        battleState.relationshipHp = 0;
        setTimeout(() => {
            showGameOver();
        }, 1500);
        return;
    }
    
    updateUI();
    battleState.currentTurn = 'player';
    setTimeout(() => {
        enableAllSkills();
    }, 500);
}

// ===== UI UPDATES =====
function updateUI() {
    // Update relationship health
    document.getElementById('relationship-hp').textContent = Math.max(0, battleState.relationshipHp);
    document.getElementById('relationship-health').style.width = (battleState.relationshipHp / battleState.relationshipMaxHp * 100) + '%';
    
    // Update enemy health (total)
    document.getElementById('boss-hp').textContent = Math.max(0, battleState.totalEnemyHp);
    document.getElementById('boss-health').style.width = (battleState.totalEnemyHp / battleState.totalMaxEnemyHp * 100) + '%';
    
    // Update battle log
    const logDiv = document.getElementById('battle-log');
    logDiv.innerHTML = battleState.battleLog.map(entry => 
        `<div class="log-entry log-${entry.type}">${entry.text}</div>`
    ).join('');
    logDiv.scrollTop = logDiv.scrollHeight;
}

function addLog(text, type = 'info') {
    battleState.battleLog.push({ text, type });
    if (battleState.battleLog.length > 10) {
        battleState.battleLog.shift();
    }
}

// ===== SKILL BUTTON CONTROLS =====
function disableAllSkills() {
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function enableAllSkills() {
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

// ===== VICTORY & GAMEOVER =====
function showVictory() {
    const levelData = levelProgression[battleState.currentLevel - 1];
    addLog(`🎉 Level ${battleState.currentLevel} (${levelData.name}) Defeated! Victory!`, 'narration');
    // Redirect to separate victory page and pass current level as param
    window.location.href = `victory.html?level=${battleState.currentLevel}`;
}

function leaveVictoryScreen() {
    // Remove any global blur/darken class; victory screen now lives on a separate page
    document.body.classList.remove('blurred-bg');
}


function showGameOver() {
    addLog('⚠️ The relationship was overwhelmed by the enemies...', 'narration');
    
    // Blur & darken wallpaper
    document.body.classList.add('blurred-bg');
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('gameover-screen').classList.add('active');
}

function showLoveMessage() {
    const messages = [
        '"In the darkest moments of doubt and misunderstanding, what matters most is that we face it together. You are my strength, my reason to believe in forever. Thank you for fighting for us. I love you more each day. ♡"',
        '"No matter what challenges come our way, I will always choose you. Every single day. You make my life infinitely better just by being in it. Forever yours. 💕"',
        '"They say love is a journey, not a destination. With you, every step is an adventure. Thank you for being my greatest treasure and my forever home. ♡"',
        '"In a world of temporary things, my love for you is eternal. You are my today and all of my tomorrows. I promise to love you unconditionally, always. 💕"'
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('love-message-text').textContent = randomMessage;
    document.getElementById('love-message-modal').classList.remove('hidden');
}

function closeLoveMessage() {
    document.getElementById('love-message-modal').classList.add('hidden');
}

function nextBattle() {
    leaveVictoryScreen();
    if (battleState.currentLevel < 5) {
        // Load next level
        battleState.relationshipHp = battleState.relationshipMaxHp;
        loadLevel(battleState.currentLevel + 1);
        document.getElementById('battle-screen').classList.add('active');
        enableAllSkills();
        updateUI();
    } else {
        // All levels won!
        goToHome();
    }
}

function retryBattle() {
    // Reset relationship HP
    battleState.relationshipHp = battleState.relationshipMaxHp;
    loadLevel(battleState.currentLevel);
    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');
    // Remove wallpaper blur/darken if any
    document.body.classList.remove('blurred-bg');
    enableAllSkills();
    updateUI();
}

// ===== ANIMATION EFFECTS =====
function playAttackAnimation(character) {
    const iconId = character === 'protector' ? 'protector-icon' : 'heroine-icon';
    const icon = document.getElementById(iconId);
    icon.classList.remove('icon-attack-left', 'icon-attack-right');
    void icon.offsetWidth;
    if (character === 'protector') {
        icon.classList.add('icon-attack-left');
        addLog('Ayen menyerang demi Felis!', 'protector');
    } else {
        icon.classList.add('icon-attack-right');
        addLog('Felis menyerang bersama Ayen!', 'heroine');
    }
}

function playBossAttackAnimation() {
    const bossIcon = document.getElementById('boss-icon');
    if (!bossIcon) return; // Prevent error if boss-icon not found
    bossIcon.classList.remove('icon-hit');
    // Force reflow
    void bossIcon.offsetWidth;
    bossIcon.classList.add('icon-hit');
}

function screenShakeEffect() {
    const battleArena = document.querySelector('.battle-arena-display');
    battleArena.classList.remove('screen-shake');
    
    // Force reflow
    void battleArena.offsetWidth;
    
    battleArena.classList.add('screen-shake');
}

function showDamageNumber(damage, isBossDamage = false) {
    const effectLayer = document.getElementById('effect-layer');
    const damageText = document.createElement('div');
    
    damageText.className = 'damage-text';
    damageText.textContent = isBossDamage ? `💔 -${damage}` : `💢 ${damage}!`;
    damageText.style.color = isBossDamage ? '#FF1744' : '#FFD700';
    
    // Position randomly in the effect layer
    damageText.style.left = (Math.random() * 80 + 10) + '%';
    damageText.style.top = (Math.random() * 60 + 20) + '%';
    
    effectLayer.appendChild(damageText);
    
    // Remove after animation
    setTimeout(() => {
        damageText.remove();
    }, 1000);
}

// ===== NAVIGATION =====
function goToHome() {
    // This will redirect back to home.html
    leaveVictoryScreen();
    window.location.href = 'home.html';
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Battle Arena loaded! 💕');
    initBattle();
});
