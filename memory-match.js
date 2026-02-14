// ===== GAME STATE =====
const gameState = {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    time: 0,
    isChecking: false,
    gameActive: true,
    totalPairs: 6
};

// Memory card images (using your photos)
const cardImages = [
    'WhatsApp Image 2026-02-14 at 19.24.41.jpeg',
    'WhatsApp Image 2026-02-14 at 19.24.41 (1).jpeg',
    'WhatsApp Image 2026-02-14 at 19.24.41 (2).jpeg',
    'WhatsApp Image 2026-02-14 at 19.24.42.jpeg',
    'WhatsApp Image 2026-02-14 at 19.24.42 (1).jpeg',
    'WhatsApp Image 2026-02-14 at 19.24.43.jpeg'
];

// ===== INITIALIZE GAME =====
function initGame() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    // Create card pairs
    const cards = [];
    cardImages.forEach((img, index) => {
        cards.push({ id: index, image: img, pair: index });
        cards.push({ id: index + cardImages.length, image: img, pair: index });
    });
    
    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);
    gameState.cards = cards;
    
    // Render cards
    cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.index = index;
        cardEl.dataset.pair = card.pair;
        cardEl.innerHTML = '<div class="card-back">♡</div>';
        cardEl.addEventListener('click', () => flipCard(index, cardEl));
        gameBoard.appendChild(cardEl);
    });
    
    // Start timer
    startTimer();
}

// ===== FLIP CARD =====
function flipCard(index, cardEl) {
    if (!gameState.gameActive || gameState.isChecking) return;
    if (gameState.flipped.length >= 2) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    
    // Flip card
    cardEl.classList.add('flipped');
    const card = gameState.cards[index];
    cardEl.innerHTML = `<div class="card-inner" style="background-image: url('${card.image}');"></div>`;
    
    gameState.flipped.push({ index, cardEl, pair: card.pair });
    
    // Check if two cards are flipped
    if (gameState.flipped.length === 2) {
        gameState.moves++;
        updateMoves();
        checkMatch();
    }
}

// ===== CHECK MATCH =====
function checkMatch() {
    gameState.isChecking = true;
    const [first, second] = gameState.flipped;
    
    // Check if cards match
    if (first.pair === second.pair) {
        // Match found!
        setTimeout(() => {
            first.cardEl.classList.add('matched');
            second.cardEl.classList.add('matched');
            gameState.matched++;
            updateMatches();
            gameState.flipped = [];
            gameState.isChecking = false;
            
            // Check if game is won
            if (gameState.matched === gameState.totalPairs) {
                endGame();
            }
        }, 600);
    } else {
        // No match, flip back
        setTimeout(() => {
            first.cardEl.classList.remove('flipped');
            second.cardEl.classList.remove('flipped');
            first.cardEl.innerHTML = '<div class="card-back">♡</div>';
            second.cardEl.innerHTML = '<div class="card-back">♡</div>';
            gameState.flipped = [];
            gameState.isChecking = false;
        }, 1000);
    }
}

// ===== UPDATE UI =====
function updateMoves() {
    document.getElementById('moves-count').textContent = gameState.moves;
}

function updateMatches() {
    document.getElementById('matches-count').textContent = gameState.matched;
}

function updateTime() {
    gameState.time++;
    document.getElementById('time-count').textContent = gameState.time + 's';
}

// ===== TIMER =====
let timerInterval = null;

function startTimer() {
    gameState.time = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTime, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

// ===== END GAME =====
function endGame() {
    gameState.gameActive = false;
    stopTimer();
    
    const message = document.getElementById('message');
    message.innerHTML = `
        <div style="font-size:20px;margin-bottom:10px;">🎉 YOU WON! 🎉</div>
        <div style="font-size:14px;">Matched all pairs in ${gameState.moves} moves and ${gameState.time} seconds!</div>
        <div style="font-size:12px;margin-top:10px;color:#FF6B9D;">Every moment with you is a precious memory ❤️</div>
    `;
    message.classList.add('show');
}

// ===== RESET GAME =====
function resetGame() {
    gameState.matched = 0;
    gameState.moves = 0;
    gameState.time = 0;
    gameState.flipped = [];
    gameState.isChecking = false;
    gameState.gameActive = true;
    
    document.getElementById('message').classList.remove('show');
    updateMoves();
    updateMatches();
    
    initGame();
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Love Memory Match loading...');
    initGame();
});
