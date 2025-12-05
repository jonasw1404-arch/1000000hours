// Spielwerte
let hours = 0;
const goal = 1000000;

// Timer-Basis (1 Sekunde = 278 Stunden im Spiel, ca. 1 Stunde in Echtzeit)
let baseSpeed = 278;

// Multiplikator durch Upgrades
let multiplier = 1;

// Upgrade-Definitionen
const upgrades = [
    { name: "Kaffee", cost: 100, multiplier: 1.01, level: 0 },
    { name: "Energy Drink", cost: 1000, multiplier: 1.05, level: 0 },
    { name: "Schlafentzug", cost: 5000, multiplier: 1.10, level: 0 },
    { name: "KI-Assistent", cost: 50000, multiplier: 1.50, level: 0 },
    { name: "Zeitmaschine", cost: 250000, multiplier: 2.00, level: 0 },
];

// Timer-Elemente
const timerEl = document.getElementById("timer");
const progressEl = document.getElementById("progress");
const upgradeList = document.getElementById("upgrade-list");

// Upgrade Buttons erstellen
function renderUpgrades() {
    upgradeList.innerHTML = "";
    upgrades.forEach((up, index) => {
        const div = document.createElement("div");
        div.className = "upgrade";
        div.innerHTML = `
            <span>${up.name} (Level: ${up.level}) - Kosten: ${up.cost}h</span>
            <button ${hours >= up.cost ? "" : "disabled"} id="buy-${index}">Kaufen</button>
        `;
        upgradeList.appendChild(div);

        document.getElementById(`buy-${index}`).addEventListener("click", () => buyUpgrade(index));
    });
}

// Upgrade kaufen
function buyUpgrade(index) {
    const up = upgrades[index];
    if (hours >= up.cost) {
        hours -= up.cost;
        multiplier *= up.multiplier;
        up.level += 1;
        // Kosten exponentiell steigern
        up.cost = Math.floor(up.cost * 1.15);
        renderUpgrades();
        updateTimer();
    }
}

// Timer hochzählen
function updateTimer() {
    timerEl.textContent = `${Math.floor(hours)} Stunden`;
    const progressPercent = Math.min((hours / goal) * 100, 100);
    progressEl.style.width = progressPercent + "%";
}

// Spiel-Loop
function gameLoop() {
    hours += baseSpeed * multiplier * 0.1; // 0.1 Sekunden Schritt
    updateTimer();
}

// Upgrade initial rendern
renderUpgrades();
updateTimer();

// Loop alle 100ms
setInterval(gameLoop, 100);
