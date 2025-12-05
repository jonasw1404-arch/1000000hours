// --- JAVASCRIPT LOGIC ---

const CHAIN_GOAL = 5;
const BASE_SUCCESS_CHANCE = 0.25; // 25%
const ANIMATION_DURATION_MS = 5000; // 5 Sekunden Animationsdauer

// Spielstatus-Objekt (unverändert)
let game = {
    points: 0,
    chain: 0,
    isSpinning: false,
    jokerStock: 0,
    chainGuardUses: 0,
    upgrades: {
        Area: { level: 0, maxLevel: 5, costs: [3, 6, 10, 15, 21] },
        Joker: { level: 0, maxLevel: 3, costs: [5, 12, 20] },
        Points: { level: 0, maxLevel: 3, costs: [7, 15, 25] },
        ChainGuard: { level: 0, maxLevel: 2, costs: [10, 25] },
        Talisman: { level: 0, maxLevel: 3, costs: [8, 18, 30] }
    }
};

// DOM-Elemente
const wheelEl = document.getElementById('wheel');
const spinButton = document.getElementById('spin-button');
const jokerButton = document.getElementById('joker-button');
const pointsStatus = document.getElementById('points-status');
const chainStatus = document.getElementById('chain-status');
const messageEl = document.getElementById('message');
const upgradeButtons = document.querySelectorAll('.upgrade-button');
const baseChanceEl = document.getElementById('base-chance');
const areaBonusEl = document.getElementById('area-bonus');
const talismanBonusEl = document.getElementById('talisman-bonus');
const totalChanceEl = document.getElementById('total-chance');


// --- HILFSFUNKTIONEN ---

/** Setzt die CSS-Transition zurück, damit das Rad ohne Animation neu starten kann. */
function resetWheelStyle() {
    // Entfernt die Transition, setzt den Winkel zurück und fügt die Transition sofort wieder hinzu
    wheelEl.style.transition = 'none';
    wheelEl.style.transform = 'rotate(0deg)';
    
    // Nach kurzem Timeout die Transition wieder aktivieren
    setTimeout(() => {
        wheelEl.style.transition = `transform ${ANIMATION_DURATION_MS / 1000}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
    }, 50); 
}

/** Berechnet die aktuelle Erfolgswahrscheinlichkeit (unverändert) */
function calculateTotalChance() {
    let totalChance = BASE_SUCCESS_CHANCE;
    let areaBonus = game.upgrades.Area.level * 0.05;
    let talismanBonus = game.upgrades.Talisman.level * 0.10;
    totalChance += areaBonus + talismanBonus;
    return Math.min(totalChance, 0.80);
}

/** Berechnet die aktuellen Punkte pro erfolgreichem Dreh (unverändert) */
function calculatePointsPerSuccess() {
    return Math.pow(2, game.upgrades.Points.level);
}


// --- UPDATE UI FUNKTIONEN (unverändert) ---

function updateUI() {
    const totalChance = calculateTotalChance();
    const totalChancePercent = Math.round(totalChance * 100);
    const areaBonusPercent = game.upgrades.Area.level * 5;
    const talismanBonusPercent = game.upgrades.Talisman.level * 10;
    
    pointsStatus.textContent = `Punkte: ${game.points}`;
    chainStatus.textContent = `Erfolgskette: ${game.chain}/${CHAIN_GOAL}`;
    
    jokerButton.textContent = `Joker einsetzen (${game.jokerStock})`;
    jokerButton.disabled = game.jokerStock <= 0 || game.isSpinning;
    
    baseChanceEl.textContent = `${(BASE_SUCCESS_CHANCE * 100).toFixed(0)}%`;
    areaBonusEl.textContent = `${areaBonusPercent}%`;
    talismanBonusEl.textContent = `${talismanBonusPercent}%`;
    totalChanceEl.textContent = `${totalChancePercent}%`;
    
    wheelEl.style.setProperty('--hit-percent', `${totalChancePercent}%`);
    
    updateUpgradeUI();
}

function updateUpgradeUI() {
    upgradeButtons.forEach(button => {
        const type = button.dataset.upgrade;
        const upgrade = game.upgrades[type];
        const nextCost = upgrade.costs[upgrade.level];
        const maxLevel = upgrade.maxLevel;

        const parent = document.getElementById(`upgrade-${type}`);
        const levelTextEl = parent.querySelector('.level-text');
        const progressFillEl = parent.querySelector('.progress-fill');
        
        progressFillEl.style.width = `${(upgrade.level / maxLevel) * 100}%`;

        if (upgrade.level < maxLevel) {
            levelTextEl.textContent = `Lvl ${upgrade.level}/${maxLevel} (Kosten: ${nextCost} P.)`;
            button.disabled = game.points < nextCost;
            button.textContent = 'Kaufen';
        } else {
            levelTextEl.textContent = `Lvl ${maxLevel}/${maxLevel} (Max Level)`;
            button.disabled = true;
            button.textContent = 'Max Level';
        }
    });
}


// --- GAME LOGIC FUNKTIONEN ---

/** Führt eine Rad-Drehung durch */
function spinWheel(useJoker = false) {
    if (game.isSpinning) return;
    
    // Setze den Stil des Rades zurück, bevor die neue Rotation gesetzt wird
    resetWheelStyle();

    game.isSpinning = true;
    spinButton.disabled = true;
    jokerButton.disabled = true;

    messageEl.textContent = 'Das Rad dreht sich...';

    const totalChance = calculateTotalChance();
    const isSuccess = useJoker || Math.random() < totalChance;
    
    const fullRotations = 8; // 8 volle, sichtbare Drehungen für mehr Dramatik

    let randomStopAngle; // 0 bis 360 Grad
    const hitAreaDegrees = totalChance * 360;

    if (isSuccess) {
        // Erfolg: Stoppt zufällig innerhalb des Trefferbereichs (0° bis hitAreaDegrees)
        randomStopAngle = Math.random() * hitAreaDegrees;
    } else {
        // Fehlschlag: Stoppt zufällig außerhalb des Trefferbereichs
        // Startet nach dem Trefferbereich (hitAreaDegrees) und endet im Rest
        randomStopAngle = Math.random() * (360 - hitAreaDegrees) + hitAreaDegrees;
    }

    // Die finale CSS-Rotation:
    // 1. (360 - randomStopAngle): Passt den Winkel so an, dass er unter dem festen Zeiger landet.
    // 2. (+ 90): Korrigiert den Startwinkel des "farbigen" Segments (da CSS-conic-gradient bei 0° startet, wir aber oben messen wollen)
    // 3. (% 360): Stellt sicher, dass der Winkel innerhalb von 0-360 bleibt
    const finalDegree = (360 - randomStopAngle + 90) % 360;

    // Setze die End-Rotation (volle Drehungen + Endwinkel)
    wheelEl.style.transform = `rotate(${360 * fullRotations + finalDegree}deg)`;
    
    // Verarbeite Ergebnis nach Animationszeit
    setTimeout(() => {
        processResult(isSuccess);
        
        // Nach einer kurzen Pause (500ms), um das Rad angehalten zu sehen, den Stil zurücksetzen
        setTimeout(() => {
            resetWheelStyle();
        }, 500);

    }, ANIMATION_DURATION_MS); 
}

/** Verarbeitet das Ergebnis der Rad-Drehung */
function processResult(isSuccess) {
    game.isSpinning = false;
    spinButton.disabled = false;
    
    if (isSuccess) {
        // Erfolg (Logik unverändert)
        const pointsGained = calculatePointsPerSuccess();
        game.points += pointsGained;
        game.chain++;
        messageEl.textContent = `✅ Erfolg! +${pointsGained} Punkte.`;

        if (game.chain >= CHAIN_GOAL) {
            game.points += 5; 
            messageEl.textContent += ` 🏆 Kette abgeschlossen! Bonus +5 Punkte!`;
            game.chain = 0; 
            game.chainGuardUses = 0;
        }

    } else {
        // Fehlschlag (Logik unverändert)
        const maxGuardUses = game.upgrades.ChainGuard.level;
        const hasChainGuard = maxGuardUses > 0 && game.chainGuardUses < maxGuardUses;
        
        if (hasChainGuard) {
            game.chainGuardUses++;
            messageEl.textContent = `❌ Fehlschlag, ABER... Ketten-Schutz (${game.chainGuardUses}/${maxGuardUses}) aktiv! Kette bleibt bei ${game.chain}/5.`;
        } else {
            messageEl.textContent = `❌ Fehlschlag! Kette bricht und wird auf 0/5 zurückgesetzt.`;
            game.chain = 0;
            game.chainGuardUses = 0;
        }
    }
    
    updateUI();
}

/** Kauft ein Upgrade (unverändert) */
function buyUpgrade(type) {
    const upgrade = game.upgrades[type];
    if (upgrade.level >= upgrade.maxLevel) return; 

    const cost = upgrade.costs[upgrade.level];
    if (game.points < cost) return; 

    game.points -= cost;
    upgrade.level++;

    if (type === 'Joker') {
        game.jokerStock = game.upgrades.Joker.level; 
    }
    
    messageEl.textContent = `Upgrade '${type}' auf Level ${upgrade.level} gekauft!`;
    updateUI();
}


// --- EVENT LISTENER ---

document.addEventListener('DOMContentLoaded', () => {
    updateUI(); 
    resetWheelStyle(); // Initialer Reset, um Transition zu setzen
});

spinButton.addEventListener('click', () => spinWheel(false));

jokerButton.addEventListener('click', () => {
    if (game.jokerStock > 0 && !game.isSpinning) {
        game.jokerStock--;
        spinWheel(true); 
        messageEl.textContent = `🃏 Joker eingesetzt! Nächste Drehung ist ein Erfolg!`;
    }
});

upgradeButtons.forEach(button => {
    button.addEventListener('click', () => {
        buyUpgrade(button.dataset.upgrade);
    });
});
