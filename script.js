// Spielwerte
let hours = 0;
const goal = 1000000;

// Timer-Basis: 1 Sekunde = 1 Stunde
let baseSpeed = 1;

// Multiplikator durch Upgrades
let multiplier = 1;

// Upgrade-Definitionen
const upgrades = [
    { name: "Kaffee", cost: 10, multiplier: 1.5, level: 0 },
    { name: "Energy Drink", cost: 100, multiplier: 2, level: 0 },
    { name: "Schlafentzug", cost: 500, multiplier: 3, level: 0 },
    { name: "KI-Assistent", cost: 5000, multiplier: 5, level: 0 },
    { name: "Zeitmaschine", cost: 20000, multiplier: 10, level: 0 },
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
            <button id="buy-${index}">Kaufen</button>
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
        up.cost = Math.floor(up.cost * 1.2);
        renderUpgrades();
        updateTimer();
    }
}

// Timer hochzählen
function updateTimer() {
    timerEl.textContent = `${Math.floor(hours)} Stunden`;
    const progressPercent = Math.min((hours / goal) * 100, 100);
    progressEl.style.width = progressPercent + "%";

    // Upgrade-Buttons aktivieren/deaktivieren
    upgrades.forEach((up, index) => {
        const btn = document.getElementById(`buy-${index}`);
        if (btn) btn.disabled = hours < up.cost;
    });
}

// Spiel-Loop jede Sekunde
setInterval(() => {
    hours += baseSpeed * multiplier;
    updateTimer();
}, 1000);

// Upgrade initial rendern
renderUpgrades();
updateTimer();
