// Game Variables
let score = 0;
let lives = 100;
let maxLives = 100;
let mana = 50;
let maxMana = 100;
let level = 1;
let rank = 1;
let gameInterval;
let countdownInterval;
let gameTime = 60;
let gameRunning = false;
let selectedHero = null;
let abilityOnCooldown = false;
let abilityDamage = 0;

// Hero configurations
const heroes = {
    mage: { name: "Pyromancer", icon: "🔥", baseDamage: 30, speed: 800 },
    warrior: { name: "Berserker", icon: "⚔️", baseDamage: 20, speed: 700 },
    assassin: { name: "Shadow", icon: "🗡️", baseDamage: 40, speed: 600 }
};

// DOM Elements
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const manaText = document.getElementById("mana");
const rankText = document.getElementById("rank");
const gameArea = document.getElementById("game-area");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const timerDisplay = document.getElementById("timer");
const abilityBtn = document.getElementById("abilityBtn");
const cooldownDisplay = document.getElementById("cooldown");
const heroNameDisplay = document.getElementById("hero-name");
const heroLevelDisplay = document.getElementById("hero-level");
const heroSelectScreen = document.getElementById("hero-select");
const gameContainer = document.getElementById("game-container");

// Event Listeners
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
abilityBtn.addEventListener("click", activateAbility);

function selectHero(heroType) {
    selectedHero = heroType;
    heroSelectScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    updateHeroDisplay();
}

function updateHeroDisplay() {
    if (selectedHero) {
        const hero = heroes[selectedHero];
        heroNameDisplay.innerText = hero.name;
        abilityDamage = hero.baseDamage;
    }
}

function startGame() {
    if (!selectedHero) {
        showCustomAlert("Error", "Please select a hero first!");
        return;
    }
    
    score = 0;
    lives = maxLives;
    mana = 50;
    level = 1;
    rank = 1;
    gameTime = 60;
    gameRunning = true;
    abilityOnCooldown = false;
    gameArea.innerHTML = "";
    
    startBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    abilityBtn.disabled = false;
    
    updateUI();
    
    const spawnSpeed = heroes[selectedHero].speed;
    gameInterval = setInterval(spawnItem, spawnSpeed);
    countdownInterval = setInterval(updateTimer, 1000);
}

function pauseGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    pauseBtn.classList.add("hidden");
    startBtn.classList.remove("hidden");
    startBtn.innerText = "RESUME MATCH";
}

function spawnItem() {
    if (!gameRunning) return;
    
    const item = document.createElement("div");
    item.classList.add("item");

    const itemType = Math.random();
    let itemData = {};

    if (itemType < 0.25) {
        itemData = { icon: "💀", type: "toxic", points: -20 };
    } else if (itemType < 0.5) {
        itemData = { icon: "💖", type: "love", points: 15 };
    } else if (itemType < 0.75) {
        itemData = { icon: "⭐", type: "star", points: 25 };
    } else {
        itemData = { icon: "💎", type: "gem", points: 40 };
    }

    item.innerHTML = itemData.icon;
    item.onclick = () => {
        handleItemClick(item, itemData);
    };

    item.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
    item.style.top = Math.random() * (gameArea.offsetHeight - 40) + "px";

    gameArea.appendChild(item);

    setTimeout(() => {
        if (item.parentNode) item.remove();
    }, 2000);
}

function handleItemClick(item, itemData) {
    item.remove();
    
    if (itemData.type === "toxic") {
        lives -= 15;
    } else {
        score += itemData.points;
        mana = Math.min(mana + 10, maxMana);
    }
    
    updateUI();
    checkGame();
}

function activateAbility() {
    if (abilityOnCooldown || mana < 30) {
        showCustomAlert("⏱️ Cooldown", "Ability is on cooldown or not enough mana!");
        return;
    }
    
    abilityOnCooldown = true;
    mana -= 30;
    score += abilityDamage * 2;
    
    abilityBtn.disabled = true;
    let cooldownTime = 10;
    
    const cooldownInterval = setInterval(() => {
        cooldownTime--;
        cooldownDisplay.innerText = cooldownTime + "s";
        
        if (cooldownTime <= 0) {
            clearInterval(cooldownInterval);
            abilityOnCooldown = false;
            abilityBtn.disabled = false;
            cooldownDisplay.innerText = "Ready";
        }
    }, 1000);
    
    updateUI();
}

function updateTimer() {
    gameTime--;
    timerDisplay.innerText = gameTime + "s";
    
    if (gameTime <= 10) {
        timerDisplay.style.color = "#ff6b6b";
    }
    
    if (gameTime <= 0) {
        clearInterval(countdownInterval);
        endGame();
    }
}

function updateUI() {
    scoreText.innerText = score;
    livesText.innerText = Math.max(0, lives);
    manaText.innerText = Math.min(mana, maxMana);
    heroLevelDisplay.innerText = "Level " + level;

    if (score >= 100 && level === 1) {
        level = 2;
        showCustomAlert("⬆️ Level Up!", "You reached Level 2!");
    }
    if (score >= 250 && level === 2) {
        level = 3;
        showCustomAlert("⬆️ Level Up!", "You reached Level 3!");
    }
    if (score >= 500 && level === 3) {
        level = 4;
        showCustomAlert("⬆️ Level Up!", "You reached MYTHIC!");
    }

    if (score >= 50 && rank === 1) {
        rank = 2;
        rankText.innerText = "Rank: Epic";
    }
    if (score >= 150 && rank === 2) {
        rank = 3;
        rankText.innerText = "Rank: Mythic";
    }
    if (score >= 300 && rank === 3) {
        rank = 4;
        rankText.innerText = "Rank: Legendary";
    }
}

function checkGame() {
    if (lives <= 0) {
        gameRunning = false;
        clearInterval(gameInterval);
        clearInterval(countdownInterval);
        showDefeat();
    }
}

function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    if (score >= 300) {
        showVictory();
    } else {
        showDefeat();
    }
}

function showCustomAlert(title, message) {
    const modal = document.getElementById("custom-modal");
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-message").innerText = message;
    modal.classList.remove("hidden");
}

function closeModal() {
    document.getElementById("custom-modal").classList.add("hidden");
}

function showVictory() {
    const heroName = heroes[selectedHero].name;
    showCustomAlert(
        "🏆 VICTORY! 🏆",
        `Congratulations!\n\nYou achieved LEGENDARY rank with ${heroName}!\n\nFinal Score: ${score}\n\nYou have officially captured my heart! 💕`
    );
    
    startBtn.innerText = "PLAY AGAIN";
    startBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
}

function showDefeat() {
    const heroName = heroes[selectedHero] ? heroes[selectedHero].name : "Unknown";
    showCustomAlert(
        "💔 DEFEAT 💔",
        `Game Over!\n\nHero: ${heroName}\nFinal Score: ${score}\n\nTry again to claim victory!`
    );
    
    startBtn.innerText = "TRY AGAIN";
    startBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
}
