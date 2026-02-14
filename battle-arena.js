// ===== GAME STATE =====
const battleState = {
    currentRound: 1,
    totalRounds: 3,
    relationshipHp: 100,
    relationshipMaxHp: 100,
    
    // Boss data
    currentBoss: 0,
    bossHp: 0,
    bossMaxHp: 0,
    
    // Turn tracking
    currentTurn: 'player',
    protectorBuff: null,
    heroineBuff: null,
    
    // Combat log
    battleLog: []
};

// ===== BOSSES DATA =====
const bosses = [
    {
        id: 0,
        name: 'The Misunderstanding Monster',
        icon: '👹',
        description: 'A creature born from miscommunication and misunderstanding.',
        maxHp: 50,
        color: '#FF6B6B',
        narration: {
            appeared: 'The Misunderstanding Monster appears! It thrives on the lack of communication between lovers. Will you overcome this challenge together?',
            defeated: 'The monster dissolves as your words of love cut through the confusion. Communication is the key!'
        }
    },
    {
        id: 1,
        name: 'The Doubtful Dragon',
        icon: '🐉',
        description: 'A powerful dragon fueled by fears and insecurity. Doubt tries to tear you apart.',
        maxHp: 75,
        color: '#FF8C42',
        narration: {
            appeared: 'The Doubtful Dragon emerges! It whispers of fears and insecurities. Trust is your greatest weapon!',
            defeated: 'The dragon fades away. Your trust in each other is unbreakable!'
        }
    },
    {
        id: 2,
        name: 'The Routine Tyrant',
        icon: '👑',
        description: 'The final boss. Represents the monotony that can dull even the brightest love.',
        maxHp: 100,
        color: '#9C27B0',
        narration: {
            appeared: 'The Routine Tyrant rises! It tries to make love ordinary and boring. Surprise and creativity are your allies!',
            defeated: 'The Tyrant crumbles! Your love will never be routine—it\'s always magical!'
        }
    }
];

// ===== INITIALIZE GAME =====
function initBattle() {
    battleState.currentRound = 1;
    battleState.relationshipHp = 100;
    battleState.relationshipMaxHp = 100;
    battleState.currentBoss = 0;
    battleState.battleLog = [];
    
    loadBoss(0);
    updateUI();
    addLog('Battle Start! Face: ' + bosses[0].name, 'narration');
}

function loadBoss(bossIndex) {
    const boss = bosses[bossIndex];
    battleState.currentBoss = bossIndex;
    battleState.bossHp = boss.maxHp;
    battleState.bossMaxHp = boss.maxHp;
    battleState.currentTurn = 'player';
    battleState.protectorBuff = null;
    battleState.heroineBuff = null;
    
    document.getElementById('boss-icon').textContent = boss.icon;
    document.getElementById('boss-name').textContent = boss.name;
    document.getElementById('boss-description').textContent = boss.description;
    document.getElementById('boss-hp').textContent = boss.maxHp;
    document.getElementById('boss-max-hp').textContent = boss.maxHp;
    document.getElementById('battle-subtitle').textContent = 'Face: ' + boss.name;
    document.getElementById('current-round').textContent = bossIndex + 1;
    document.getElementById('narration-text').textContent = boss.narration.appeared;
    
    updateUI();
}

// ===== SKILL USAGE =====
function useSkill(skillType, character) {
    if (battleState.currentTurn !== 'player') return;
    
    disableAllSkills();
    
    let damage = 0;
    let healAmount = 0;
    let narration = '';
    const boss = bosses[battleState.currentBoss];
    
    if (character === 'protector') {
        if (skillType === 'embrace') {
            damage = 15;
            healAmount = 5;
            narration = '🛡️ The Protector gives a Comforting Embrace, damaging the enemy and healing the relationship!';
        } else if (skillType === 'reassurance') {
            if (boss.id === 1) {
                damage = 35; // Extra damage vs Doubtful Dragon
                narration = '💬 Words of Reassurance pierce through the doubt! Strong attack!';
            } else {
                damage = 20;
                narration = '💬 The Protector speaks words of reassurance, weakening the enemy!';
            }
        } else if (skillType === 'surprise') {
            damage = 10;
            healAmount = 3;
            battleState.protectorBuff = 'skip';
            narration = '🎁 Surprise Gift! The enemy loses their next turn!';
        }
    } else if (character === 'heroine') {
        if (skillType === 'smile') {
            damage = 18;
            healAmount = 3;
            narration = '✨ The Heroine\'s Beaming Smile charms the enemy and strengthens the bond!';
        } else if (skillType === 'communication') {
            if (boss.id === 0) {
                damage = 40; // Extra damage vs Misunderstanding Monster
                narration = '🗣️ Open Communication destroys misunderstanding! Massive damage!';
            } else {
                damage = 22;
                narration = '🗣️ The Heroine opens the channels of communication!';
            }
        } else if (skillType === 'gesture') {
            damage = 8;
            healAmount = 5;
            battleState.heroineBuff = 'shield';
            narration = '💝 A Thoughtful Gesture reduces the next incoming damage!';
        }
    }
    
    // Apply damage
    battleState.bossHp -= damage;
    if (battleState.bossHp < 0) battleState.bossHp = 0;
    
    // Apply healing
    if (healAmount > 0) {
        battleState.relationshipHp = Math.min(battleState.relationshipHp + healAmount, battleState.relationshipMaxHp);
    }
    
    addLog(narration, character);
    updateUI();
    
    // Check victory
    if (battleState.bossHp <= 0) {
        setTimeout(() => {
            showVictory();
        }, 1000);
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
        addLog('🎁 The enemy is distracted by the surprise and loses this turn!', 'boss');
        battleState.currentTurn = 'player';
        enableAllSkills();
        updateUI();
        return;
    }
    
    const boss = bosses[battleState.currentBoss];
    let damage = 0;
    let narration = '';
    
    // Boss attack logic based on type
    if (boss.id === 0) {
        // Misunderstanding Monster
        narration = '👹 The Misunderstanding Monster spreads confusion!';
        damage = Math.floor(Math.random() * 10) + 15;
    } else if (boss.id === 1) {
        // Doubtful Dragon
        narration = '🐉 The Doubtful Dragon roars with uncertainty!';
        damage = Math.floor(Math.random() * 15) + 18;
    } else if (boss.id === 2) {
        // Routine Tyrant
        narration = '👑 The Routine Tyrant attacks with mundane monotony!';
        damage = Math.floor(Math.random() * 18) + 20;
    }
    
    // Apply shield if Heroine used Thoughtful Gesture
    if (battleState.heroineBuff === 'shield') {
        damage = Math.floor(damage / 2);
        narration += ' (But the thoughtful gesture reduces the damage!)';
        battleState.heroineBuff = null;
    }
    
    battleState.relationshipHp -= damage;
    
    addLog(narration, 'boss');
    
    if (battleState.relationshipHp <= 0) {
        battleState.relationshipHp = 0;
        setTimeout(() => {
            showGameOver();
        }, 1000);
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
    
    // Update boss health
    document.getElementById('boss-hp').textContent = Math.max(0, battleState.bossHp);
    document.getElementById('boss-health').style.width = (battleState.bossHp / battleState.bossMaxHp * 100) + '%';
    
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
    const boss = bosses[battleState.currentBoss];
    addLog('🎉 ' + boss.narration.defeated, 'narration');
    
    // Show victory screen
    document.getElementById('battle-screen').classList.remove('active');
    document.getElementById('victory-screen').classList.add('active');
}

function showGameOver() {
    addLog('⚠️ The relationship was overwhelmed by the challenge...', 'narration');
    
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
    if (battleState.currentBoss < 2) {
        // Load next boss
        battleState.relationshipHp = battleState.relationshipMaxHp;
        loadBoss(battleState.currentBoss + 1);
        
        document.getElementById('victory-screen').classList.remove('active');
        document.getElementById('battle-screen').classList.add('active');
        
        enableAllSkills();
        updateUI();
    } else {
        // All battles won!
        goToHome();
    }
}

function retryBattle() {
    loadBoss(battleState.currentBoss);
    
    document.getElementById('gameover-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');
    
    enableAllSkills();
    updateUI();
}

// ===== NAVIGATION =====
function goToHome() {
    // This will redirect back to valentine.html
    window.location.href = 'valentine.html';
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Battle Arena loaded! 💕');
    initBattle();
});
