// Game State Variables
let level = 1;
let xp = 0;
let xpToNextLevel = 100;          // XP required for next level (will increase)
let gold = 0;
let goldToNextChest = 50;         // Gold threshold for next loot chest drop
let totalGoldEarned = 0;
let weaponLevel = 1;
let armorLevel = 1;
let currentMonster = null;
let monstersDefeated = 0;
let comboCount = 0;
let comboTimer = null;
let currentEra = 0;
const eras = [
  { name: "Medieval Forest", emoji: "🐍",   // snake as base monster emoji
    monsters: ["🐍","🐗","🐀","🕷️","🐺"],   // variety of monsters in this era
    boss: "🐉", bossName: "Dragon", bossHP: 50 },
  { name: "Dystopian Future", emoji: "🤖", 
    monsters: ["🤖","👾","🦾","👻","💀"],    // mix of robots and monsters
    boss: "👾", bossName: "Alien Overlord", bossHP: 100 },
  // Additional eras can be added here
];
let monsterHP = 0;
let monsterMaxHP = 0;

// DOM Elements
const levelDisplay = document.getElementById('level-display');
const levelStars = document.getElementById('level-stars');
const xpProgressText = document.getElementById('xp-progress');
const xpBarFill = document.getElementById('xp-bar-fill');
const hpText = document.getElementById('hp-text');
const manaText = document.getElementById('mana-text');
const goldCount = document.getElementById('gold-count');
const lootProgressText = document.getElementById('loot-progress');
const lootBarFill = document.getElementById('loot-bar-fill');
const environmentText = document.getElementById('environment');
const monsterEmojiSpan = document.getElementById('monster-emoji');
const monsterTargetSpan = document.getElementById('monster-target');
const logDiv = document.getElementById('log');
const upgradeWeaponBtn = document.getElementById('upgrade-weapon');
const upgradeArmorBtn = document.getElementById('upgrade-armor');
const timeTravelBtn = document.getElementById('time-travel');

// Initialize first monster and UI
function initGame() {
  currentEra = 0;
  environmentText.textContent = "🌲 Era: " + eras[currentEra].name;
  spawnMonster();  // spawn initial monster
  updateStatsUI();
}
window.onload = initGame;

// Function to spawn a new monster (normal or boss based on progress)
function spawnMonster() {
  const eraData = eras[currentEra];
  // Every 10th monster could be a boss for variety (or at end of era)
  if (monstersDefeated > 0 && monstersDefeated % 10 === 0) {
    // Boss encounter
    currentMonster = { emoji: eraData.boss, name: eraData.bossName, maxHP: eraData.bossHP };
  } else {
    // Regular monster - pick a random from era list
    const mEmoji = eraData.monsters[Math.floor(Math.random()*eraData.monsters.length)];
    currentMonster = { emoji: mEmoji, name: "Monster", maxHP: 10 + level*2 };  // scale HP with level
  }
  monsterHP = currentMonster.maxHP;
  monsterMaxHP = currentMonster.maxHP;
  // Update ASCII scene with new monster emoji
  monsterEmojiSpan.textContent = currentMonster.emoji;
  monsterTargetSpan.textContent = currentMonster.emoji;
}

// Handle player attack (called on each tap on monster)
function playerAttack() {
  if (!currentMonster) return;
  // Calculate damage (weapon level influences damage, random small variation)
  let damage = 1 + weaponLevel; 
  damage += Math.floor(Math.random()*2); // a bit of randomness (0-1)
  monsterHP -= damage;
  // Show quick feedback in log
  addLog(`ATTACK ⚔️ -${damage} HP`, 'attack');
  // Increase combo count and reset combo timer
  comboCount += 1;
  resetComboTimer();
  if (monsterHP > 0) {
    // Monster still alive, could retaliate or just await next hit
    // (We could implement monster attack on a timer, but keeping it simple and player-driven)
  } else {
    // Monster defeated
    monstersDefeated += 1;
    addLog(`${currentMonster.emoji} ${currentMonster.name} defeated!`, 'event');
    // Reward player
    let goldEarned = 5 + Math.floor(Math.random()*5) + currentEra*5;
    gold += goldEarned;
    totalGoldEarned += goldEarned;
    addLog(`💰 +${goldEarned} Gold`, 'event');
    // Grant XP for kill
    let xpEarned = 20;
    gainXP(xpEarned);
    // Combo reward: if comboCount >=3, give bonus gold or XP
    if (comboCount >= 3) {
      addLog(`COMBO x${comboCount}! 🔥🔥🔥`, 'combo');
      // small bonus for combo streak
      let bonusGold = comboCount;
      gold += bonusGold;
      totalGoldEarned += bonusGold;
      addLog(`Bonus +${bonusGold} Gold for combo streak!`, 'combo');
    }
    comboCount = 0; // reset combo after enemy dies
    // Check for loot chest drop
    if (totalGoldEarned >= goldToNextChest) {
      // Drop a chest
      totalGoldEarned -= goldToNextChest;
      dropLootChest();
      // Increase next chest threshold (could scale up for difficulty)
      goldToNextChest *= 1.5;
    }
    // Check if it's time for time-travel (e.g., after X monsters or a boss)
    if (monstersDefeated === 10 && currentEra < eras.length-1) {
      // Offer time travel after 10 monsters (end of era)
      timeTravelBtn.style.display = 'inline-block';
      addLog(`⏳ A Time Portal opens! (Time Travel available)`, 'event');
    }
    // Spawn the next monster
    spawnMonster();
    updateStatsUI();
  }
}

// Reset combo after a short window of no attacks
function resetComboTimer() {
  if (comboTimer) {
    clearTimeout(comboTimer);
  }
  comboTimer = setTimeout(() => {
    comboCount = 0;
  }, 1500); // if 1.5 seconds pass without another attack, combo resets
}

// Handle gaining XP and leveling up
function gainXP(amount) {
  xp += amount;
  if (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    // Increase next level threshold (e.g. 20% more each level)
    xpToNextLevel = Math.floor(xpToNextLevel * 1.2);
    // Refill health/mana (or increase max, etc.)
    hpText.textContent = "❤️".repeat(5);   // reset to full hearts
    manaText.textContent = "🔵".repeat(5);
    addLog(`⭐️ Level Up! You are now Level ${level}`, 'level-up');
    // After leveling, enable upgrades if gold sufficient
    checkUpgradeAvailability();
    updateLevelUI();
  }
  updateXPUI();
}

// Drop a loot chest reward
function dropLootChest() {
  // For simplicity, chest gives a random upgrade or bonus
  addLog(`🎁 Chest opened!`, 'loot');
  // Random reward: either weapon upgrade, armor upgrade, or gold
  const outcome = Math.random();
  if (outcome < 0.4) {
    // Gold windfall
    let goldBonus = 50 + Math.floor(Math.random()*50);
    gold += goldBonus;
    addLog(`[💰 +${goldBonus} Gold]`, 'loot');
  } else if (outcome < 0.7) {
    // Weapon upgrade drop
    weaponLevel += 1;
    addLog(`[⚔️ +1 Weapon Level (now ${weaponLevel})]`, 'loot');
  } else if (outcome < 1.0) {
    // Armor upgrade drop
    armorLevel += 1;
    addLog(`[🛡️ +1 Armor Level (now ${armorLevel})]`, 'loot');
  }
  checkUpgradeAvailability();
}

// Check if upgrade buttons should be enabled (if player has enough gold)
function checkUpgradeAvailability() {
  upgradeWeaponBtn.disabled = gold < 100;
  upgradeArmorBtn.disabled = gold < 100;
}

// Upgrade weapon or armor via button (cost gold)
upgradeWeaponBtn.onclick = () => {
  if (gold >= 100) {
    gold -= 100;
    weaponLevel += 1;
    addLog(`🔨 Upgraded Weapon to +${weaponLevel}!`, 'event');
    updateStatsUI();
    checkUpgradeAvailability();
  }
};
upgradeArmorBtn.onclick = () => {
  if (gold >= 100) {
    gold -= 100;
    armorLevel += 1;
    addLog(`🔨 Upgraded Armor to +${armorLevel}!`, 'event');
    updateStatsUI();
    checkUpgradeAvailability();
  }
};

// Time Travel to next era
timeTravelBtn.onclick = () => {
  if (currentEra < eras.length - 1) {
    currentEra += 1;
    // Reset some state for new era (keep level, gear, etc., but new environment)
    monstersDefeated = 0;
    comboCount = 0;
    currentMonster = null;
    environmentText.textContent = "⏳ Era: " + eras[currentEra].name;
    addLog(`✨ You travel through time to the ${eras[currentEra].name}!`, 'event');
    timeTravelBtn.style.display = 'none';
    // Potentially adjust difficulty: e.g., increase monster HP scaling or reset goldToNextChest
    goldToNextChest = 100; 
    // Spawn first monster of new era
    spawnMonster();
    updateStatsUI();
  }
};

// Utility: Update all stat displays (level, hp, gold, etc.)
function updateStatsUI() {
  goldCount.textContent = gold;
  lootProgressText.textContent = Math.min(Math.floor((totalGoldEarned / goldToNextChest) * 100), 100) + "%";
  // Update loot bar fill (10 characters total)
  const lootFillCount = Math.min(Math.floor((totalGoldEarned / goldToNextChest) * 10), 10);
  lootBarFill.textContent = "█".repeat(lootFillCount) + "░".repeat(10 - lootFillCount);
}

// Update only XP/Level UI parts
function updateXPUI() {
  const xpPercent = Math.floor((xp / xpToNextLevel) * 100);
  xpProgressText.textContent = xpPercent + "%";
  // Update XP bar fill blocks
  const fillCount = Math.min(Math.floor((xpPercent / 10)), 10);
  xpBarFill.textContent = "█".repeat(fillCount) + "░".repeat(10 - fillCount);
}
function updateLevelUI() {
  levelDisplay.textContent = `LVL: ${level} `;
  // Display stars to represent level (just for flair, e.g., 5 stars per 5 levels cycle)
  const stars = level % 5;
  const emptyStars = 5 - stars;
  levelStars.textContent = "⭐️".repeat(stars) + "☆".repeat(emptyStars);
}

// Add a message to the log
function addLog(message, type) {
  const entry = document.createElement('div');
  entry.classList.add('log-entry');
  if (type) entry.classList.add(type);
  entry.textContent = message;
  // Prepend to log (newest on top)
  if (logDiv.firstChild) {
    logDiv.insertBefore(entry, logDiv.firstChild);
  } else {
    logDiv.appendChild(entry);
  }
}
 
// Attach attack handler to the monster (tappable emoji)
monsterTargetSpan.onclick = playerAttack;
