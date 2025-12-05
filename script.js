let points = 0;
let streak = 0;

let baseChance = 0.25; // Grundchance für farbige Fläche
let sizeBonus = 0;     // Upgrade +5%
let talismanBonus = 0; // Upgrade +10%
let jokerCount = 0;
let doublePoints = false;
let chainShield = 0;

const streakGoal = 5;

const pointsEl = document.getElementById("points");
const streakEl = document.getElementById("streak");
const jokerEl = document.getElementById("joker");
const wheelEl = document.getElementById("wheel");

function updateWheel() {
  wheelEl.innerHTML = "";
  const totalChance = Math.min(baseChance + sizeBonus + talismanBonus, 0.8);
  const redAngle = totalChance * 360;

  const red = document.createElement("div");
  red.classList.add("segment", "red");
  red.style.transform = `rotate(0deg) skewY(-60deg)`;
  wheelEl.appendChild(red);

  const gray = document.createElement("div");
  gray.classList.add("segment", "gray");
  gray.style.transform = `rotate(${redAngle}deg) skewY(-60deg)`;
  wheelEl.appendChild(gray);
}

updateWheel();

function spinWheel() {
  if (streak >= streakGoal) {
    alert("Du hast die Kette bereits geschafft! Setze zurück für neue Runde.");
    return;
  }

  let totalChance = Math.min(baseChance + sizeBonus + talismanBonus, 0.8);
  let success = Math.random() < totalChance;

  // Joker verwenden
  if (!success && jokerCount > 0) {
    success = true;
    jokerCount--;
    alert("Joker benutzt! Dreh erfolgreich.");
  }

  if (success) {
    streak++;
    points += doublePoints ? 2 : 1;
    if (streak === streakGoal) {
      points += 5; // Bonus
      alert("Kette geschafft! Bonus +5 Punkte");
      streak = 0;
    }
  } else {
    if (chainShield > 0) {
      chainShield--;
      alert("Ketten-Schutz aktiviert! Kette bleibt erhalten.");
    } else {
      streak = 0;
    }
  }

  updateDisplay();
}

function updateDisplay() {
  pointsEl.textContent = points;
  streakEl.textContent = streak;
  jokerEl.textContent = jokerCount;
}

// Upgrade Buttons
document.getElementById("upgradeSize").addEventListener("click", () => {
  const cost = 3;
  if (points >= cost && sizeBonus < 0.25) {
    points -= cost;
    sizeBonus += 0.05;
    updateWheel();
    updateDisplay();
  }
});

document.getElementById("buyJoker").addEventListener("click", () => {
  const cost = 5;
  if (points >= cost) {
    points -= cost;
    jokerCount++;
    updateDisplay();
  }
});

document.getElementById("upgradeBonus").addEventListener("click", () => {
  const cost = 7;
  if (points >= cost) {
    points -= cost;
    doublePoints = true;
    updateDisplay();
  }
});

document.getElementById("upgradeChain").addEventListener("click", () => {
  const cost = 10;
  if (points >= cost) {
    points -= cost;
    chainShield++;
    updateDisplay();
  }
});

document.getElementById("upgradeTalisman").addEventListener("click", () => {
  const cost = 8;
  if (points >= cost && talismanBonus < 0.3) {
    points -= cost;
    talismanBonus += 0.1;
    updateWheel();
    updateDisplay();
  }
});

document.getElementById("spinBtn").addEventListener("click", spinWheel);
