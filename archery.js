// Archery Game Logic
let archeryState = {
  score: 0,
  shots: 0,
  targetX: 200,
  targetDir: 1,
  targetSpeed: 2.5,
  arrowY: 180,
  arrowX: null,
  isShooting: false,
  gameOver: false,
  maxShots: 10,
  arrowsStuck: [], // [{x, y, pts}]
  scorePopups: [] // [{x, y, pts, frame}]
};

const canvas = document.getElementById('archery-canvas');
const ctx = canvas.getContext('2d');
const shootBtn = document.getElementById('archery-shoot');
const restartBtn = document.getElementById('archery-restart');
const scoreEl = document.getElementById('archery-score');
const shotsEl = document.getElementById('archery-shots');
const resultEl = document.getElementById('archery-result');

function drawArchery() {
  ctx.clearRect(0,0,400,220);
  // Draw target
  ctx.save();
  ctx.translate(archeryState.targetX, 60);
  for (let r = 3; r >= 1; r--) {
    ctx.beginPath();
    ctx.arc(0,0, r*22, 0, 2*Math.PI);
    ctx.fillStyle = r === 1 ? '#ffd700' : (r === 2 ? '#ff6b6b' : '#fff');
    ctx.fill();
  }
  ctx.restore();

  // Draw stuck arrows
  archeryState.arrowsStuck.forEach(a => {
    ctx.save();
    // Shaft
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x, a.y - 40);
    ctx.stroke();
    // Arrow head
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 40);
    ctx.lineTo(a.x - 7, a.y - 50);
    ctx.lineTo(a.x + 7, a.y - 50);
    ctx.closePath();
    ctx.fill();
    // Fletching
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x - 6, a.y + 10);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x + 6, a.y + 10);
    ctx.stroke();
    ctx.restore();
  });
    // Draw score popups
    archeryState.scorePopups.forEach(p => {
      ctx.save();
      ctx.globalAlpha = 1 - p.frame/30;
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.fillText('+'+p.pts, p.x, p.y - p.frame*1.5);
      ctx.restore();
    });
  // Draw arrow
  if (archeryState.arrowX !== null) {
    ctx.save();
    // Shaft
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(archeryState.arrowX, archeryState.arrowY);
    ctx.lineTo(archeryState.arrowX, archeryState.arrowY - 40);
    ctx.stroke();
    // Arrow head (triangle)
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(archeryState.arrowX, archeryState.arrowY - 40);
    ctx.lineTo(archeryState.arrowX - 7, archeryState.arrowY - 50);
    ctx.lineTo(archeryState.arrowX + 7, archeryState.arrowY - 50);
    ctx.closePath();
    ctx.fill();
    // Fletching (tail)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(archeryState.arrowX, archeryState.arrowY);
    ctx.lineTo(archeryState.arrowX - 6, archeryState.arrowY + 10);
    ctx.moveTo(archeryState.arrowX, archeryState.arrowY);
    ctx.lineTo(archeryState.arrowX + 6, archeryState.arrowY + 10);
    ctx.stroke();
    ctx.restore();
  }
}

function updateArchery() {
  if (archeryState.gameOver) return;
  // Move target
  archeryState.targetX += archeryState.targetDir * archeryState.targetSpeed;
  if (archeryState.targetX > 370) archeryState.targetDir = -1;
  if (archeryState.targetX < 30) archeryState.targetDir = 1;
  // Move arrow if shooting
  if (archeryState.isShooting && archeryState.arrowX !== null) {
    archeryState.arrowY -= 10;
    if (archeryState.arrowY < 60) {
      // Check hit
      const dx = archeryState.arrowX - archeryState.targetX;
      const dist = Math.abs(dx);
      let pts = 0;
      let msg = '';
      // Skor tiap layer target:
      if (dist < 12) { pts = 100; msg = '🎯 BULLSEYE!'; } // tengah (emas)
      else if (dist < 22) { pts = 60; msg = 'Merah!'; } // lingkaran merah
      else if (dist < 44) { pts = 30; msg = 'Putih!'; } // lingkaran putih
      else { pts = 0; msg = 'Miss!'; }
      archeryState.score += pts;
      archeryState.shots++;
      scoreEl.textContent = archeryState.score;
      shotsEl.textContent = archeryState.shots;
      resultEl.textContent = msg + (pts > 0 ? ` (+${pts})` : '');
      // Arrow sticks if hit
      if (pts > 0) {
        archeryState.arrowsStuck.push({x: archeryState.arrowX, y: 60, pts});
        archeryState.scorePopups.push({x: archeryState.arrowX, y: 60, pts, frame: 0});
      }
      archeryState.isShooting = false;
      archeryState.arrowX = null;
      archeryState.arrowY = 180;
      if (archeryState.shots >= archeryState.maxShots) {
        archeryState.gameOver = true;
        shootBtn.disabled = true;
        restartBtn.style.display = '';
        resultEl.textContent = `Game Over! Total Score: ${archeryState.score}`;
      }
    }
  }
  // Update score popups
  archeryState.scorePopups.forEach(p => p.frame++);
  archeryState.scorePopups = archeryState.scorePopups.filter(p => p.frame < 30);
  drawArchery();
  requestAnimationFrame(updateArchery);
}

shootBtn.onclick = function() {
  if (archeryState.isShooting || archeryState.gameOver) return;
  archeryState.arrowX = archeryState.targetX;
  archeryState.arrowY = 180;
  archeryState.isShooting = true;
};

restartBtn.onclick = function() {
  archeryState.score = 0;
  archeryState.shots = 0;
  archeryState.targetX = 200;
  archeryState.targetDir = 1;
  archeryState.arrowY = 180;
  archeryState.arrowX = null;
  archeryState.isShooting = false;
  archeryState.gameOver = false;
  archeryState.arrowsStuck = [];
  archeryState.scorePopups = [];
  shootBtn.disabled = false;
  restartBtn.style.display = 'none';
  resultEl.textContent = '';
  scoreEl.textContent = '0';
  shotsEl.textContent = '0';
};

drawArchery();
requestAnimationFrame(updateArchery);
