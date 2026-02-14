// ===== SOUND EFFECTS ENGINE =====
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio context not supported');
            return null;
        }
    }
    return audioContext;
}

// Sound effect: Button Click (UI click)
function playClickSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        
        // High beep for click
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain1.gain.setValueAtTime(0.15, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc1.start(now);
        osc1.stop(now + 0.05);
    } catch (e) {
        // Ignore error
    }
}

// Sound effect: Attack Sound (like a gunshot/hit)
function playAttackSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        
        // Low bass "thump" for attack impact
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc1.start(now);
        osc1.stop(now + 0.1);
        
        // High "crack" sound for impact
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.frequency.setValueAtTime(2000, now + 0.02);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain2.gain.setValueAtTime(0.2, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc2.start(now + 0.02);
        osc2.stop(now + 0.08);
    } catch (e) {
        // Ignore error
    }
}

// Sound effect: Success/Victory
function playSuccessSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
        const now = ctx.currentTime;
        
        // Ascending tone sequence
        const frequencies = [523, 659, 784]; // C5, E5, G5
        let delay = 0;
        
        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
            
            osc.start(now + delay);
            osc.stop(now + delay + 0.15);
            
            delay += 0.1;
        });
    } catch (e) {
        // Ignore error
    }
}

// Add click sound to all buttons automatically
document.addEventListener('click', function(event) {
    const target = event.target;
    // Trigger click sound for ANY button element or common button classes
    if (target.tagName === 'BUTTON' || 
        target.classList.contains('btn') || 
        target.classList.contains('back-btn') || 
        target.classList.contains('navigate-btn') || 
        target.classList.contains('enter-button') || 
        target.classList.contains('pull-button') ||
        target.classList.contains('victory-btn') ||
        target.classList.contains('skill-btn') ||
        target.classList.contains('modal-close') ||
        target.classList.contains('big-attack-btn') ||
        target.classList.contains('retry-btn') ||
        target.classList.contains('btn-shoot') ||
        target.id === 'pull-btn' ||
        target.id === 'read-letter' ||
        target.id === 'next-challenge' ||
        target.id === 'extra-game' ||
        target.id === 'return-home' ||
        target.id === 'archery-shoot' ||
        target.id === 'archery-restart') {
        playClickSound();
    }
}, true);
