let score = 0;
let lives = 3;
let rank = 1;
let gameInterval;

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const rankText = document.getElementById("rank");
const gameArea = document.getElementById("game-area");

document.getElementById("startBtn").addEventListener("click", startGame);

function startGame() {
    score = 0;
    lives = 3;
    rank = 1;
    updateUI();
    gameInterval = setInterval(spawnItem, 800);
}

function spawnItem() {
    const item = document.createElement("div");

    const isToxic = Math.random() < 0.3;

    if (isToxic) {
        item.innerHTML = "💀";
        item.classList.add("toxic");
        item.onclick = function () {
            lives--;
            updateUI();
            gameArea.removeChild(item);
            checkGame();
        };
    } else {
        item.innerHTML = "⭐";
        item.classList.add("enemy");
        item.onclick = function () {
            score += 10;
            updateUI();
            gameArea.removeChild(item);
            checkGame();
        };
    }

    item.style.left = Math.random() * 360 + "px";
    item.style.top = Math.random() * 360 + "px";

    gameArea.appendChild(item);

    setTimeout(() => {
        if (gameArea.contains(item)) {
            gameArea.removeChild(item);
        }
    }, 1500);
}

function updateUI() {
    scoreText.innerText = score;
    livesText.innerText = lives;

    if (score >= 30 && rank === 1) {
        rank = 2;
        rankText.innerText = "Rank: Epic";
    }

    if (score >= 60 && rank === 2) {
        rank = 3;
        rankText.innerText = "Rank: Mythic";
    }
}

function checkGame() {
    if (lives <= 0) {
        clearInterval(gameInterval);
        alert("Defeat! Try again 💔");
    }

    if (score >= 80) {
        clearInterval(gameInterval);
        showVictory();
    }
}

function showVictory() {
    document.body.innerHTML = `
        <h1>🏆 MYTHIC ACHIEVED!</h1>
        <h2>You unlocked my heart ❤️</h2>
        <button onclick="alert('Happy Valentine 💕')">Accept Proposal</button>
    `;
}
