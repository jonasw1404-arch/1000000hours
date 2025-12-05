// --- JAVASCRIPT LOGIC ---

const CHAIN_GOAL = 5;
const BASE_SUCCESS_CHANCE = 0.25; // 25%

// Spielstatus-Objekt
let game = {
    points: 0,
    chain: 0,
    isSpinning: false,
    // Joker und Ketten-Schutz Vorrat (gekauft)
    jokerStock: 0,
    chainGuardStock: 0, 
    
    // Ketten-Schutz-Nutzungen in aktueller Kette
    chainGuardUses: 0,

    // Upgrades: Level und Kosten
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


// --- BERECHNUNGSFUNKTIONEN ---

/** Berechnet die aktuelle Erfolgswahrscheinlichkeit in Dezimal (0.0 - 1.0) */
function calculateTotalChance() {
    let totalChance = BASE_SUCCESS_CHANCE;
    
    // 1. Flächen-Vergrößerung (+5% pro Level)
    let areaBonus = game.upgrades.Area.level * 0.05;
    
    // 2. Glücks-Talisman (+10% pro Level)
    let talismanBonus = game.upgrades.Talisman.level * 0.10;

    totalChance += areaBonus + talismanBonus;

    // Maximalwert auf 0.80 (80%) begrenzen
    return Math.min(totalChance, 0.80);
}

/** Berechnet die aktuellen Punkte pro erfolgreichem Dreh */
function calculatePointsPerSuccess() {
    // Zusatzzahlung: Basis 1 Punkt. Level 1: 2x (2P), Level 2: 4x (4P), Level 3: 8x (8P)
    return Math.pow(2, game.upgrades.Points.level);
}

// --- UPDATE UI FUNKTIONEN ---

/** Aktualisiert alle Statusanzeigen und UI-Elemente */
function updateUI() {
    const totalChance = calculateTotalChance();
    const totalChancePercent = Math.round(totalChance * 100);
    const areaBonusPercent = game.upgrades.Area.level * 5;
    const talismanBonusPercent = game.upgrades.Talisman.level * 10;
    
    // Statusfelder
    pointsStatus.textContent = `Punkte: ${game.points}`;
    chainStatus.textContent = `Erfolgskette: ${game.chain}/${CHAIN_GOAL}`;
    
    // Joker-Button
    jokerButton.textContent = `Joker einsetzen (${game.jokerStock})`;
    jokerButton.disabled = game.jokerStock <= 0 || game.isSpinning;
    
    // Chance-Anzeige
    baseChanceEl.textContent = `${(BASE_SUCCESS_CHANCE * 100).toFixed(0)}%`;
    areaBonusEl.textContent = `${areaBonusPercent}%`;
    talismanBonusEl.textContent = `${talismanBonusPercent}%`;
    totalChanceEl.textContent = `${totalChancePercent}%`;
    
    // Rad-Visualisierung
    wheelEl.style.setProperty('--hit-percent', `${totalChancePercent}%`);
    
    // Upgrade-Sektion
    updateUpgradeUI();
}

/** Aktualisiert die Upgrade-Anzeigen und Buttons */
function updateUpgradeUI() {
    upgradeButtons.forEach(button => {
        const type = button.dataset.upgrade;
        const upgrade = game.upgrades[type];
        const nextCost = upgrade.costs[upgrade.level];
        const maxLevel = upgrade.maxLevel;

        const parent = document.getElementById(`upgrade-${type}`);
        const levelTextEl = parent.querySelector('.level-text');
        const progressFillEl = parent.querySelector('.progress-fill');
        
        // Progress Bar
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
    game.isSpinning = true;
    spinButton.disabled = true;
    jokerButton.disabled = true;

    messageEl.textContent = 'Das Rad dreht sich...';

    const totalChance = calculateTotalChance();
    const isSuccess = useJoker || Math.random() < totalChance;
    
    // Zufällige Rotationsmenge für visuelle Animation
    const fullRotations = 5; // 5 volle Drehungen
    
    let finalAngle;
    if (isSuccess) {
        // Landet im Trefferbereich (0 bis totalChance * 360 Grad)
        finalAngle = Math.random() * (totalChance * 360);
    } else {
        // Landet außerhalb des Trefferbereichs
        // Startet nach dem Trefferbereich (totalChance * 360) und endet im Rest
        finalAngle = Math.random() * (1 - totalChance) * 360 + (totalChance * 360);
    }

    // Die finale CSS-Rotation (plus 90 Grad Versatz, damit der Zeiger richtig ausgerichtet ist)
    const cssFinalAngle = (360 - finalAngle + 90) % 360;
    
    // Setze die End-Rotation (5 volle Drehungen + Endwinkel)
    wheelEl.style.transform = `rotate(${360 * fullRotations + cssFinalAngle}deg)`;
    
    // Verarbeite Ergebnis nach Animationszeit (3 Sekunden)
    setTimeout(() => {
        processResult(isSuccess);
    }, 3000); 
}

/** Verarbeitet das Ergebnis der Rad-Drehung */
function processResult(isSuccess) {
    game.isSpinning = false;
    spinButton.disabled = false;
    
    // Setze das Rad zurück, um die nächste Drehung zu ermöglichen
    wheelEl.style.transform = `rotate(0deg)`;

    if (isSuccess) {
        // Erfolg
        const pointsGained = calculatePointsPerSuccess();
        game.points += pointsGained;
        game.chain++;
        messageEl.textContent = `✅ Erfolg! +${pointsGained} Punkte.`;

        if (game.chain >= CHAIN_GOAL) {
            // Kette abgeschlossen!
            game.points += 5; // Bonus
            messageEl.textContent += ` 🏆 Kette abgeschlossen! Bonus +5 Punkte!`;
            game.chain = 0; // Reset für neue Runde
            game.chainGuardUses = 0; // Reset Schutz-Nutzungen
        }

    } else {
        // Fehlschlag
        
        // Ketten-Schutz prüfen und nutzen (Max-Level ist Max-Uses pro Runde)
        const maxGuardUses = game.upgrades.ChainGuard.level;
        const hasChainGuard = maxGuardUses > 0 && game.chainGuardUses < maxGuardUses;
        
        if (hasChainGuard) {
            // Schutz greift
            game.chainGuardUses++;
            messageEl.textContent = `❌ Fehlschlag, ABER... Ketten-Schutz (${game.chainGuardUses}/${maxGuardUses}) aktiv! Kette bleibt bei ${game.chain}/5.`;
        } else {
            // Kette bricht
            messageEl.textContent = `❌ Fehlschlag! Kette bricht und wird auf 0/5 zurückgesetzt.`;
            game.chain = 0;
            game.chainGuardUses = 0; // Reset Schutz
        }
    }
    
    updateUI();
}

/** Kauft ein Upgrade */
function buyUpgrade(type) {
    const upgrade = game.upgrades[type];
    if (upgrade.level >= upgrade.maxLevel) return; // Max Level erreicht

    const cost = upgrade.costs[upgrade.level];
    if (game.points < cost) return; // Nicht genug Punkte

    game.points -= cost;
    upgrade.level++;

    // Spezial-Logik für Joker: Erhöht den Vorrat bei Kauf
    if (type === 'Joker') {
        game.jokerStock = game.upgrades.Joker.level; 
    }
    
    messageEl.textContent = `Upgrade '${type}' auf Level ${upgrade.level} gekauft!`;
    updateUI();
}


// --- EVENT LISTENER ---

document.addEventListener('DOMContentLoaded', () => {
    // Stellt sicher, dass die UI beim Laden des Spiels aktualisiert wird
    updateUI(); 
});

spinButton.addEventListener('click', () => spinWheel(false));

jokerButton.addEventListener('click', () => {
    if (game.jokerStock > 0 && !game.isSpinning) {
        game.jokerStock--;
        spinWheel(true); // Joker erzwingt Erfolg
        messageEl.textContent = `🃏 Joker eingesetzt! Nächste Drehung ist ein Erfolg!`;
    }
});

upgradeButtons.forEach(button => {
    button.addEventListener('click', () => {
        buyUpgrade(button.dataset.upgrade);
    });
});
