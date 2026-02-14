// victory.js - handles victory page actions
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function showLoveMessage() {
    const messages = [
        '"In the darkest moments of doubt and misunderstanding, what matters most is that we face it together. You are my strength, my reason to believe in forever. Thank you for fighting for us. I love you more each day. ♡"',
        '"No matter what challenges come our way, I will always choose you. Every single day. You make my life infinitely better just by being in it. Forever yours. 💕"',
        '"They say love is a journey, not a destination. With you, every step is an adventure. Thank you for being my greatest treasure and my forever home. ♡"',
        '"In a world of temporary things, my love for you is eternal. You are my today and all of my tomorrows. I promise to love you unconditionally, always. 💕"'
    ];
    const idx = Math.floor(Math.random() * messages.length);
    document.getElementById('love-message-text').textContent = messages[idx];
    document.getElementById('love-message-modal').classList.remove('hidden');
}

function closeLoveMessage() {
    document.getElementById('love-message-modal').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const levelStr = getQueryParam('level');
    const level = parseInt(levelStr) || 1;

    document.getElementById('read-letter').addEventListener('click', showLoveMessage);
    document.getElementById('next-challenge').addEventListener('click', () => {
        const nextLevel = Math.min(level + 1, 5);
        // Redirect back to the battle arena and tell it which level to start
        window.location.href = `battle-arena.html?startLevel=${nextLevel}`;
    });
    document.getElementById('extra-game').addEventListener('click', () => {
        // Launch Love Memory Match game
        window.location.href = 'memory-match.html';
    });
    document.getElementById('return-home').addEventListener('click', () => {
        window.location.href = 'home.html';
    });
});
