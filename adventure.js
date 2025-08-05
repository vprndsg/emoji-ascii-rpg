/*
 Adventure mode extension for Emoji ASCII RPG
 Creates a multi-path narrative exploring various areas, awarding XP, gold, weapons, and armor upgrades.
*/

// Global flags
let adventureActive = false;
let currentAdventureNode = null;

// Node definitions: each key is a node id with text, optional reward, and choices array { text, next, reward }
const adventureNodes = {
  start: {
    text: "You stand at the edge of a mysterious land. To your north is a tranquil pond, east a grassy hill, and south a village. What will you do?",
    choices: [
      { text: "Go to the pond", next: "pond" },
      { text: "Climb the hill", next: "hill" },
      { text: "Visit the village", next: "village" },
      { text: "Enter the dark forest", next: "forestEntrance" }
    ]
  },
  pond: {
    text: "At the pond you see fish shimmering beneath the surface. A frog croaks nearby.",
    reward: { gold: 15, xp: 10 },
    choices: [
      { text: "Try fishing", next: "fishing" },
      { text: "Rest by the water", next: "dream" },
      { text: "Return to crossroads", next: "start" }
    ]
  },
  fishing: {
    text: "You cast a line and wait patiently...",
    reward: { gold: 20, xp: 20 },
    choices: [
      { text: "Fish again", next: "fishing" },
      { text: "Follow a trail around the pond", next: "hermit" },
      { text: "Return to pond", next: "pond" }
    ]
  },
  hermit: {
    text: "A wise hermit sits under a willow tree. He offers to teach you the art of combat.",
    reward: { xp: 30, weapon: 1 },
    choices: [
      { text: "Thank him and return", next: "pond" },
      { text: "Ask about the hill", next: "hill" }
    ]
  },
  hill: {
    text: "Atop the grassy hill you gaze over the land. A cave entrance lies nearby and a tower rises in the distance.",
    reward: { xp: 10 },
    choices: [
      { text: "Enter the cave", next: "caveEntrance" },
      { text: "Climb the tower", next: "tower" },
      { text: "Return to crossroads", next: "start" }
    ]
  },
  caveEntrance: {
    text: "The cave is dark and echoes with unknown sounds. Do you dare enter?",
    choices: [
      { text: "Enter the cave", next: "cave" },
      { text: "Go back to the hill", next: "hill" }
    ]
  },
  cave: {
    text: "Inside the cave you find glittering crystals and tunnels leading deeper.",
    reward: { gold: 30 },
    choices: [
      { text: "Explore deeper", next: "labyrinthEntrance" },
      { text: "Mine crystals (+ gold)", next: "mineCrystals" },
      { text: "Leave the cave", next: "hill" }
    ]
  },
  mineCrystals: {
    text: "You chip off some crystals and gain wealth.",
    reward: { gold: 40 },
    choices: [
      { text: "Explore deeper", next: "labyrinthEntrance" },
      { text: "Return to cave entrance", next: "cave" }
    ]
  },
  labyrinthEntrance: {
    text: "You discover an ancient labyrinth. Legends speak of treasures and dangers within.",
    choices: [
      { text: "Enter the labyrinth", next: "labyrinth" },
      { text: "Return to cave", next: "cave" }
    ]
  },
  labyrinth: {
    text: "The labyrinth twists and turns. You solve riddles and avoid traps.",
    reward: { xp: 50, gold: 50, armor: 1 },
    choices: [
      { text: "Seek the center", next: "labyrinthCenter" },
      { text: "Exit the labyrinth", next: "cave" }
    ]
  },
  labyrinthCenter: {
    text: "At the heart of the labyrinth you find a chest of legendary gear.",
    reward: { weapon: 1, armor: 1, gold: 100, xp: 100 },
    choices: [
      { text: "Return to cave", next: "cave" },
      { text: "Rest (heal and dream)", next: "dream" }
    ]
  },
  tower: {
    text: "An ancient tower stands tall. A wizard greets you at the door.",
    reward: { xp: 20 },
    choices: [
      { text: "Accept the wizard's quest", next: "wizardQuest" },
      { text: "Decline and return", next: "hill" }
    ]
  },
  wizardQuest: {
    text: "The wizard asks you to fetch a rare herb from the pond.",
    choices: [
      { text: "Agree and go to the pond", next: "pondHerb" },
      { text: "Decline politely", next: "tower" }
    ]
  },
  pondHerb: {
    text: "You search the pond and find the rare herb.",
    reward: { xp: 40, gold: 25 },
    choices: [
      { text: "Bring herb to the wizard", next: "wizardReturn" },
      { text: "Keep it for yourself", next: "start" }
    ]
  },
  wizardReturn: {
    text: "The wizard rewards you handsomely for the herb.",
    reward: { xp: 60, gold: 60, armor: 1 },
    choices: [
      { text: "Return to hill", next: "hill" },
      { text: "Ask about the dark forest", next: "forestEntrance" }
    ]
  },
  village: {
    text: "The village is bustling. A merchant sells wares and an inn offers rest.",
    choices: [
      { text: "Visit the market", next: "market" },
      { text: "Stay at the inn", next: "inn" },
      { text: "Return to crossroads", next: "start" }
    ]
  },
  market: {
    text: "The merchant offers potions and equipment.",
    choices: [
      { text: "Buy potion (50 gold)", next: "buyPotion", reward: { costGold: 50, heal: true } },
      { text: "Upgrade weapon (100 gold)", next: "upgradeWeaponMarket", reward: { costGold: 100, weapon: 1 } },
      { text: "Back to village", next: "village" }
    ]
  },
  buyPotion: {
    text: "You drink the potion and feel refreshed.",
    reward: { xp: 10 },
    choices: [
      { text: "Back to market", next: "market" }
    ]
  },
  upgradeWeaponMarket: {
    text: "Your weapon gleams sharper.",
    reward: { weapon: 1 },
    choices: [
      { text: "Back to market", next: "market" }
    ]
  },
  inn: {
    text: "At the inn you rest and have vivid dreams.",
    reward: { xp: 20 },
    choices: [
      { text: "Sleep and dream", next: "dream" },
      { text: "Return to village", next: "village" }
    ]
  },
  dream: {
    text: "You dream of adventures past and future.",
    reward: { xp: 30 },
    choices: [
      { text: "Wake up", next: "start" }
    ]
  },
  forestEntrance: {
    text: "The dark forest looms ahead. Strange noises emanate from within.",
    choices: [
      { text: "Enter the forest", next: "forest" },
      { text: "Return to crossroads", next: "start" }
    ]
  },
  forest: {
    text: "Within the forest you encounter wolves and spirits. You fight bravely.",
    reward: { xp: 40, gold: 30 },
    choices: [
      { text: "Go deeper", next: "deepForest" },
      { text: "Retreat to crossroads", next: "start" }
    ]
  },
  deepForest: {
    text: "In the deep forest you find an ancient tree with magical sap.",
    reward: { xp: 60, armor: 1 },
    choices: [
      { text: "Collect sap", next: "sapCollected" },
      { text: "Return to forest entrance", next: "forestEntrance" }
    ]
  },
  sapCollected: {
    text: "The sap imbues you with resilience.",
    reward: { armor: 1, xp: 40 },
    choices: [
      { text: "Return to crossroads", next: "start" }
    ]
  }
};

// Show an adventure node
function displayAdventureNode(id) {
  const node = adventureNodes[id];
  currentAdventureNode = id;

  const dialogue = document.getElementById('dialogue');
  const choicesDiv = document.getElementById('choices');
  dialogue.textContent = node.text;

  // apply reward (if any)
  if (node.reward) {
    if (node.reward.gold) {
      gold += node.reward.gold;
      addLog(`\uD83D\uDCB0 You gained ${node.reward.gold} gold.`, 'event');
    }
    if (node.reward.xp) {
      xp += node.reward.xp;
      addLog(`\u2728 You gained ${node.reward.xp} XP.`, 'event');
      if (typeof checkLevelUp === 'function') checkLevelUp();
    }
    if (node.reward.weapon) {
      weaponLevel += node.reward.weapon;
      addLog(`\uD83D\uDDE1\uFE0F Your weapon improved!`, 'event');
    }
    if (node.reward.armor) {
      armorLevel += node.reward.armor;
      addLog(`\uD83D\uDEE1\uFE0F Your armor improved!`, 'event');
    }
    // Additional reward types can be handled here
    if (typeof updateStatsUI === 'function') updateStatsUI();
    if (typeof updateXPUI === 'function') updateXPUI();
    if (typeof checkUpgradeAvailability === 'function') checkUpgradeAvailability();
  }

  // clear previous choices
  choicesDiv.innerHTML = '';
  node.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.onclick = () => {
      // costGold: handle purchases
      if (choice.reward && choice.reward.costGold) {
        if (gold >= choice.reward.costGold) {
          gold -= choice.reward.costGold;
          if (choice.reward.weapon) weaponLevel += choice.reward.weapon;
          if (choice.reward.heal) {
            // restore HP bar completely
            const hpText = document.getElementById('hp-text');
            if (hpText) hpText.textContent = '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️';
          }
          if (typeof updateStatsUI === 'function') updateStatsUI();
          if (typeof updateXPUI === 'function') updateXPUI();
          if (typeof checkUpgradeAvailability === 'function') checkUpgradeAvailability();
        } else {
          addLog('Not enough gold!', 'event');
          return;
        }
      }
      displayAdventureNode(choice.next);
    };
    choicesDiv.appendChild(btn);
  });
}

// Start adventure
function startAdventure() {
  if (adventureActive) return;
  adventureActive = true;
  const bf = document.getElementById('battlefield');
  const actions = document.getElementById('actions');
  const logDiv = document.getElementById('log');
  const adv = document.getElementById('adventure-section');
  if (bf) bf.style.display = 'none';
  if (actions) actions.style.display = 'none';
  if (logDiv) logDiv.style.display = 'none';
  if (adv) adv.style.display = 'block';
  displayAdventureNode('start');
}

// Exit adventure
function exitAdventure() {
  adventureActive = false;
  const adv = document.getElementById('adventure-section');
  const bf = document.getElementById('battlefield');
  const actions = document.getElementById('actions');
  const logDiv = document.getElementById('log');
  if (adv) adv.style.display = 'none';
  if (bf) bf.style.display = 'block';
  if (actions) actions.style.display = 'block';
  if (logDiv) logDiv.style.display = 'block';
  addLog('\u272F You return from your adventure.', 'event');
}

// Setup adventure UI on page load
window.addEventListener('load', () => {
  // create adventure section if missing
  if (!document.getElementById('adventure-section')) {
    const adv = document.createElement('div');
    adv.id = 'adventure-section';
    adv.style.display = 'none';
    adv.innerHTML = `
      <div id="dialogue" style="margin-bottom:10px;"></div>
      <div id="choices" style="display:flex; flex-direction:column;"></div>
      <button id="exit-adventure" style="margin-top:10px;">\uD83C\uDFC1 End Adventure</button>
    `;
    document.body.appendChild(adv);
  }
  // ensure start button exists in actions
  const actions = document.getElementById('actions');
  if (actions && !document.getElementById('start-adventure')) {
    const btn = document.createElement('button');
    btn.id = 'start-adventure';
    btn.textContent = '\u2728 Explore Adventure';
    actions.appendChild(btn);
  }
  // hook up buttons
  const startBtn = document.getElementById('start-adventure');
  if (startBtn) startBtn.addEventListener('click', startAdventure);
  const exitBtn = document.getElementById('exit-adventure');
  if (exitBtn) exitBtn.addEventListener('click', exitAdventure);
});
