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
    gameInterval = setInterval(spawnItem, 700);
}

function spawnItem() {
    const item = document.createElement("div");
    item.classList.add("item");

    const isToxic = Math.random() < 0.3;

    if (isToxic) {
        item.innerHTML = "💀"; // toxic player
        item.onclick = () => {
            lives--;
            updateUI();
            item.remove();
            checkGame();
        };
    } else {
        item.innerHTML = "💖"; // love star
        item.onclick = () => {
            score += 10;
            updateUI();
            item.remove();
            checkGame();
        };
    }

    item.style.left = Math.random() * 360 + "px";
    item.style.top = Math.random() * 360 + "px";

    gameArea.appendChild(item);

    setTimeout(() => {
        if (item.parentNode) item.remove();
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
        showDefeat();
    }

    if (score >= 80) {
        clearInterval(gameInterval);
        showVictory();
    }
}

function showVictory() {
    document.body.innerHTML = `
        <div style="
            height:100vh;
            display:flex;
            justify-content:center;
            align-items:center;
            flex-direction:column;
            background:radial-gradient(circle,#1a1a2e,#000);
            color:gold;
            font-family:Segoe UI;
            text-align:center;
        ">
            <h1 style="font-size:40px; text-shadow:0 0 15px gold;">
                🏆 MYTHIC ACHIEVED 🏆
            </h1>
            <h2 style="color:pink;">Happy Valentine 💕</h2>
            <p>You have officially ranked up to my heart.</p>
            <button onclick="this.innerText='Locked In 💖';">
                Accept Proposal
            </button>
        </div>
    `;
}

function showDefeat() {
    document.body.innerHTML = `
        <div style="text-align:center; padding-top:200px; background:#111; height:100vh; color:red;">
            <h1>Defeat 💔</h1>
            <p>You got defeated by Toxic Players.</p>
        </div>
    `;
}
