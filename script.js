// Emoji ASCII RPG - AAA-style expanded (HTML/JS/CSS for GitHub Pages)
"use strict";

// Game Data

// Player and game state
const player = {
    level: 1,
    xp: 0,
    xpNeeded: 100,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 0,
    gold: 0,
    skillPoints: 0,
    weapon: null,
    armor: null,
    critChance: 0,   // percentage (0.1 = 10%)
    buffActive: false,
    buffTimer: null
};

// Inventory of materials and items
const inventory = {};

// Pet data
const pets = {
    dog: { name: "Dog", emoji: "🐶", level: 1, xp: 0, xpNeeded: 100, unlocked: true },
    dragon: { name: "Dragon", emoji: "🐉", level: 1, xp: 0, xpNeeded: 100, unlocked: false },
    robot: { name: "Robot", emoji: "🤖", level: 1, xp: 0, xpNeeded: 100, unlocked: false }
};
let currentPet = pets.dog;  // start with dog

// Gear stats for crafted equipment
const gearStats = {
    "Wooden Shield": { attack: 0, defense: 5 },
    "Dino Armor":    { attack: 0, defense: 10 },
    "Laser Sword":   { attack: 8, defense: 0 },
    "Chrono Blade":  { attack: 20, defense: 0 }
};

// Item names for display
const itemNames = {
    wood: "Wood 🪵",
    scrap: "Scrap 🔩",
    dna: "DNA 🧬",
    shell: "Shell 🐚"
};

// Zones definition for time travel and monster spawns
// Each zone contains a name, description, whether it is unlocked,
// an array of monsters, and a boss. Monsters and bosses have
// statistics used in combat as well as loot drop chances.
const zones = [
    {
        name: "Medieval Forest",
        description: "A lush forest filled with mischievous goblins.",
        unlocked: true,
        monsters: [
            { name: "Goblin", emoji: "🧌", maxHp: 20, attack: 4, xp: 10, gold: 5, drops: { wood: 0.5 } },
            { name: "Goblin", emoji: "🧌", maxHp: 30, attack: 6, xp: 15, gold: 8, drops: { wood: 0.6 } }
        ],
        boss: { name: "Goblin King", emoji: "👹", maxHp: 80, attack: 8, xp: 50, gold: 50, drops: { wood: 1.0 } }
    },
    {
        name: "Prehistoric Jungle",
        description: "Dinosaurs roam this ancient land.",
        unlocked: false,
        monsters: [
            { name: "T-Rex", emoji: "🦖", maxHp: 50, attack: 10, xp: 20, gold: 10, drops: { dna: 0.5 } },
            { name: "Raptor", emoji: "🦖", maxHp: 35, attack: 8, xp: 18, gold: 8, drops: { dna: 0.4 } }
        ],
        boss: { name: "Ancient Dragon", emoji: "🐉", maxHp: 120, attack: 15, xp: 100, gold: 50, drops: { dna: 1.0 } }
    },
    {
        name: "Cyberpunk City",
        description: "A futuristic metropolis overrun by rogue robots.",
        unlocked: false,
        monsters: [
            { name: "Robot", emoji: "🤖", maxHp: 60, attack: 12, xp: 30, gold: 15, drops: { scrap: 0.5 } },
            { name: "Drone", emoji: "🤖", maxHp: 40, attack: 10, xp: 25, gold: 12, drops: { scrap: 0.4 } }
        ],
        boss: { name: "AI Overlord", emoji: "💻", maxHp: 150, attack: 20, xp: 150, gold: 50, drops: { scrap: 1.0 } }
    },
    {
        name: "Ocean Kingdom",
        description: "A watery realm inhabited by sharks and mythical beasts.",
        unlocked: false,
        monsters: [
            { name: "Shark", emoji: "🦈", maxHp: 70, attack: 14, xp: 40, gold: 20, drops: { shell: 0.5 } },
            { name: "Barracuda", emoji: "🐟", maxHp: 50, attack: 12, xp: 30, gold: 15, drops: { shell: 0.3 } }
        ],
        boss: { name: "Kraken", emoji: "🐙", maxHp: 200, attack: 25, xp: 200, gold: 100, drops: { shell: 1.0 } }
    }
];

// Current zone index, current monster and other runtime flags
// These variables are declared explicitly to avoid strict-mode errors.
let currentZoneIndex = 0;
let currentMonster = null;
let monsterAttackTimeout = null;
let gamePaused = false;

// Quest definitions
const quests = [
    // zone1
    { id: "kill_goblins", zone: 0, description: "Defeat 10 🧌 Goblins", targetMonster: "Goblin", targetCount: 10, currentCount: 0, completed: false, active: true, reward: { xp: 50, gold: 0 } },
    { id: "craft_shield", zone: 0, description: "Craft a Wooden Shield", targetItem: null, targetCount: 1, currentCount: 0, craftedItem: "Wooden Shield", completed: false, active: true, reward: { xp: 20, gold: 0 } },
    // boss and travel
    { id: "defeat_goblin_king", zone: 0, description: "Defeat the Goblin King", targetMonster: "Goblin King", targetCount: 1, currentCount: 0, completed: false, active: false, reward: { xp: 50, gold: 50, unlockZone: 1 } },
    // zone2
    { id: "kill_trex", zone: 1, description: "Defeat 10 🦖 T-Rex in Prehistoric Jungle", targetMonster: "T-Rex", targetCount: 10, currentCount: 0, completed: false, active: false, reward: { xp: 100, gold: 0 } },
    { id: "kill_raptors", zone: 1, description: "Defeat 5 🦖 Raptors in Prehistoric Jungle", targetMonster: "Raptor", targetCount: 5, currentCount: 0, completed: false, active: false, reward: { xp: 80, gold: 0 } },
    { id: "craft_armor", zone: 1, description: "Craft Dino Armor", targetItem: null, targetCount: 1, currentCount: 0, craftedItem: "Dino Armor", completed: false, active: false, reward: { xp: 30, gold: 0 } },
    { id: "defeat_dragon", zone: 1, description: "Defeat the Ancient Dragon", targetMonster: "Ancient Dragon", targetCount: 1, currentCount: 0, completed: false, active: false, reward: { xp: 100, gold: 50, unlockZone: 2, pet: "dragon" } },
    // zone3
    { id: "kill_robots", zone: 2, description: "Defeat 10 🤖 Robots in Cyberpunk City", targetMonster: "Robot", targetCount: 10, currentCount: 0, completed: false, active: false, reward: { xp: 150, gold: 0 } },
    { id: "build_robot_pet", zone: 2, description: "Build a Robot Pet (Collect 5 Scrap)", targetItem: "scrap", targetCount: 5, currentCount: 0, completed: false, active: false, reward: { xp: 50, gold: 0, pet: "robot" } },
    { id: "craft_laser_sword", zone: 2, description: "Craft a Laser Sword", targetItem: null, targetCount: 1, currentCount: 0, craftedItem: "Laser Sword", completed: false, active: false, reward: { xp: 40, gold: 20 } },
    { id: "defeat_ai", zone: 2, description: "Defeat the AI Overlord", targetMonster: "AI Overlord", targetCount: 1, currentCount: 0, completed: false, active: false, reward: { xp: 200, gold: 100, unlockZone: 3 } },
    // zone4
    { id: "kill_sharks", zone: 3, description: "Defeat 10 🦈 Sharks in Ocean Kingdom", targetMonster: "Shark", targetCount: 10, currentCount: 0, completed: false, active: false, reward: { xp: 200, gold: 0 } },
    { id: "kill_barracuda", zone: 3, description: "Defeat 5 🐟 Barracuda in Ocean Kingdom", targetMonster: "Barracuda", targetCount: 5, currentCount: 0, completed: false, active: false, reward: { xp: 180, gold: 0 } },
    { id: "forge_blade", zone: 3, description: "Forge the Chrono Blade", targetItem: null, targetCount: 1, currentCount: 0, completed: false, active: false, reward: { xp: 100, gold: 0 } },
    { id: "defeat_kraken", zone: 3, description: "Defeat the Kraken", targetMonster: "Kraken", targetCount: 1, currentCount: 0, completed: false, active: false, reward: { xp: 500, gold: 200 } }
];

// Skill tree definitions
const skills = [
    { id: "power_strike", name: "Power Strike", description: "+2 Attack", cost: 1, prereq: null, unlocked: false },
    { id: "crit", name: "Critical Training", description: "+5% Critical Hit Chance", cost: 1, prereq: "power_strike", unlocked: false },
    { id: "berserk", name: "Berserker Rage", description: "+10% attack when HP < 50%", cost: 1, prereq: "crit", unlocked: false },
    { id: "fortitude", name: "Fortitude", description: "+20 Max HP", cost: 1, prereq: null, unlocked: false },
    { id: "tough", name: "Tough Skin", description: "-1 damage taken", cost: 1, prereq: "fortitude", unlocked: false },
    { id: "gold", name: "Gold Finder", description: "+10% gold gain", cost: 1, prereq: "fortitude", unlocked: false }
];

// DOM element references
const statsEl = document.getElementById("stats");
const envDescEl = document.getElementById("envDesc");
const questTrackerEl = document.getElementById("questTracker");
const monsterEmojiEl = document.getElementById("monsterEmoji");
const monsterHPEl = document.getElementById("monsterHP");
const logEl = document.getElementById("log");
const attackBtn = document.getElementById("attackBtn");
const travelBtn = document.getElementById("travelBtn");
const craftBtn = document.getElementById("craftBtn");
const petBtn = document.getElementById("petBtn");
const skillsBtn = document.getElementById("skillsBtn");
const questsBtn = document.getElementById("questsBtn");
const continueBtn = document.getElementById("continueBtn");
const travelMenuEl = document.getElementById("travelMenu");
const craftMenuEl = document.getElementById("craftMenu");
const petMenuEl = document.getElementById("petMenu");
const skillMenuEl = document.getElementById("skillMenu");
const questMenuEl = document.getElementById("questMenu");

// Utility: logging messages to log panel
function logMessage(msg, type = "") {
    let formatted = msg;
    if (type === "npc") {
        formatted = '<span class="npc">' + msg + '</span>';
    } else if (type === "villain") {
        formatted = '<span class="villain">' + msg + '</span>';
    } else if (type === "event") {
        formatted = '<span class="event">' + msg + '</span>';
    }
    logEl.insertAdjacentHTML('beforeend', formatted + '<br>');
    logEl.scrollTop = logEl.scrollHeight;
}

// Update stats display
function updateStats() {
    statsEl.textContent = 'HP: ' + player.hp + '/' + player.maxHp
        + ' | ATK: ' + player.attack
        + ' | DEF: ' + player.defense
        + ' | Pet: ' + (currentPet ? (currentPet.emoji + ' Lv' + currentPet.level) : 'None')
        + '\nLevel: ' + player.level
        + ' | XP: ' + player.xp + '/' + player.xpNeeded
        + ' | Gold: ' + player.gold;
}

// Update environment description
function updateEnvDesc() {
    const zone = zones[currentZoneIndex];
    envDescEl.textContent = zone.name + ' - ' + zone.description;
}

// Update quest tracker (active quests)
function updateQuestTracker() {
    let html = '';
    for (let q of quests) {
        if (!q.completed && q.active) {
            // If gather quest, update currentCount from inventory
            if (q.targetItem) {
                let have = inventory[q.targetItem] || 0;
                q.currentCount = Math.min(have, q.targetCount);
            }
            html += q.description;
            if (q.targetCount > 1) {
                // show progress for kill or gather
                html += ' (' + q.currentCount + '/' + q.targetCount + ')';
            } else if (q.craftedItem) {
                // craft quest progress (0/1)
                html += ' (' + q.currentCount + '/' + q.targetCount + ')';
            }
            html += '<br>';
        }
    }
    questTrackerEl.innerHTML = html;
}

// Spawn a monster (if boss flag true, spawn zone boss, else random normal)
function spawnMonster(boss = false) {
    if (boss) {
        currentMonster = JSON.parse(JSON.stringify(zones[currentZoneIndex].boss));
        currentMonster.isBoss = true;
    } else {
        const monsterList = zones[currentZoneIndex].monsters;
        currentMonster = JSON.parse(JSON.stringify(monsterList[Math.floor(Math.random() * monsterList.length)]));
        currentMonster.isBoss = false;
    }
    // set current HP for monster
    currentMonster.hp = currentMonster.maxHp;
    // Display monster
    monsterEmojiEl.textContent = currentMonster.emoji;
    updateMonsterHP();
    logMessage('A ' + currentMonster.name + ' ' + currentMonster.emoji + ' appears!', 'event');
    // schedule monster's first attack
    if (!gamePaused) {
        monsterAttackTimeout = setTimeout(monsterAttack, 1500);
    }
}

// Update monster HP display
function updateMonsterHP() {
    if (!currentMonster) {
        monsterHPEl.textContent = '';
        return;
    }
    // draw ASCII HP bar
    const barWidth = 20;
    let fill = Math.floor((currentMonster.hp / currentMonster.maxHp) * barWidth);
    if (fill < 0) fill = 0;
    let empty = barWidth - fill;
    let bar = '[' + '#'.repeat(fill) + ' '.repeat(empty) + '] ' + currentMonster.hp + '/' + currentMonster.maxHp;
    monsterHPEl.textContent = bar;
}

// Monster attacks player
function monsterAttack() {
    if (!currentMonster || gamePaused) return;
    // monster deals damage
    let damage = currentMonster.attack - player.defense;
    if (damage < 1) damage = 1;
    player.hp -= damage;
    if (player.hp < 0) player.hp = 0;
    updateStats();
    logMessage('The ' + currentMonster.name + ' hits you for ' + damage + ' damage.', '');
    // check player death
    if (player.hp <= 0) {
        handlePlayerDeath();
        return;
    }
    // schedule next attack if monster still alive
    monsterAttackTimeout = setTimeout(monsterAttack, 1500);
}

// Handle player death
function handlePlayerDeath() {
    logMessage('You have been defeated... You lose some gold and respawn.', 'event');
    // penalty: lose 20% gold
    player.gold = Math.floor(player.gold * 0.8);
    // restore HP to max
    player.hp = player.maxHp;
    updateStats();
    // clear current monster
    currentMonster = null;
    monsterEmojiEl.textContent = '';
    monsterHPEl.textContent = '';
    // spawn a new monster after a short delay
    setTimeout(function() {
        if (!gamePaused) spawnMonster();
    }, 2000);
}

// Handle monster defeat
function handleMonsterDefeat() {
    logMessage('You defeated the ' + currentMonster.name + '!', 'event');
    // Award XP and gold
    player.xp += currentMonster.xp;
    player.gold += Math.floor(currentMonster.gold * (1 + (player.goldBonus || 0)));
    logMessage('You gained ' + currentMonster.xp + ' XP and ' + currentMonster.gold + ' gold.', '');
    // Check level up
    if (player.xp >= player.xpNeeded) {
        player.xp -= player.xpNeeded;
        player.level += 1;
        player.skillPoints += 1;
        // increase stats on level up
        player.maxHp += 10;
        player.attack += 1;
        player.hp = player.maxHp;
        player.xpNeeded = player.level * 100;
        logMessage('⭐ You leveled up! You are now Level ' + player.level + '.', 'event');
        updateStats();
    }
    updateStats();
    // Loot drops
    for (let item in currentMonster.drops) {
        if (Math.random() < currentMonster.drops[item]) {
            // add to inventory
            inventory[item] = (inventory[item] || 0) + 1;
            const itemName = itemNames[item] || item;
            logMessage('🔶 Loot found: ' + itemName, '');
        }
    }
    // Pet XP gain
    if (currentPet) {
        currentPet.xp += currentMonster.xp;
        if (currentPet.xp >= currentPet.xpNeeded) {
            currentPet.xp -= currentPet.xpNeeded;
            currentPet.level += 1;
            currentPet.xpNeeded = currentPet.level * 100;
            logMessage('✨ Your ' + currentPet.name + ' pet leveled up to ' + currentPet.level + '!', 'event');
            // apply pet stat bonus if any
            if (currentPet === pets.dragon) {
                player.attack += 2;
            } else if (currentPet === pets.robot) {
                player.defense += 1;
            }
            updateStats();
        }
    }
    // Quest progress and completion check
    for (let q of quests) {
        if (!q.completed && q.active) {
            if (q.targetMonster && currentMonster.name === q.targetMonster) {
                q.currentCount += 1;
                if (q.currentCount >= q.targetCount) {
                    completeQuest(q);
                }
            }
        }
    }
    // Dog pet bonus: chance to find extra resource
    if (currentPet === pets.dog) {
        let bonusChance = 0.3 + 0.05 * (currentPet.level - 1);
        if (Math.random() < bonusChance) {
            let res;
            if (currentZoneIndex === 0) res = "wood";
            else if (currentZoneIndex === 1) res = "dna";
            else if (currentZoneIndex === 2) res = "scrap";
            else if (currentZoneIndex === 3) res = "shell";
            if (res) {
                inventory[res] = (inventory[res] || 0) + 1;
                logMessage('🐶 Your dog found an extra ' + (itemNames[res] || res) + '!', '');
            }
        }
    }
    // Remove current monster
    currentMonster = null;
    // Spawn next monster after delay if game not paused
    if (!gamePaused) {
        setTimeout(function() {
            if (!gamePaused) spawnMonster();
        }, 1500);
    }
}

// Complete quest
function completeQuest(q) {
    q.completed = true;
    logMessage('🏅 Quest completed: ' + q.description, 'event');
    // Reward XP and gold if any
    if (q.reward) {
        if (q.reward.xp) {
            player.xp += q.reward.xp;
            logMessage('(+ ' + q.reward.xp + ' XP)', '');
        }
        if (q.reward.gold) {
            player.gold += q.reward.gold;
            logMessage('(+ ' + q.reward.gold + ' gold)', '');
        }
        if (q.reward.pet) {
            const petKey = q.reward.pet;
            if (pets[petKey] && !pets[petKey].unlocked) {
                pets[petKey].unlocked = true;
                logMessage('🎉 New pet unlocked: ' + pets[petKey].name + ' ' + pets[petKey].emoji + '!', 'event');
            }
        }
        if (q.reward.unlockZone !== undefined) {
            const newZone = q.reward.unlockZone;
            zones[newZone].unlocked = true;
            travelBtn.style.display = 'inline-block';
        }
    }
    updateStats();
    updateQuestTracker();
    // Special quest triggers for storyline progression
    if (q.id === "kill_goblins") {
        let bossQuest = quests.find(x => x.id === "defeat_goblin_king");
        if (bossQuest) bossQuest.active = true;
        startDialogue([
            "Goblin King 👹: Who dares slaughter my minions?!",
            "Goblin King: I will crush you, puny human!"
        ], function() {
            spawnMonster(true);
        }, true);
    } else if (q.id === "defeat_goblin_king") {
        startDialogue([
            "Mentor 🧙: Well done, hero! The Goblin King is defeated.", 
            "Mentor 🧙: A time portal opens to a new era - the Prehistoric Jungle!",
            "Mentor 🧙: Step into the portal to continue your quest."
        ], null, true);
    } else if (q.id === "kill_trex") {
        let bossQuest = quests.find(x => x.id === "defeat_dragon");
        if (bossQuest) bossQuest.active = true;
        startDialogue([
            "🐉 ROOOAAARRR!!! (An Ancient Dragon appears!)"
        ], function() {
            spawnMonster(true);
        }, true);
    } else if (q.id === "defeat_dragon") {
        startDialogue([
            "Mentor 🧙: Incredible! You tamed the Prehistoric Jungle.",
            "Mentor 🧙: Another portal opens... to a Cyberpunk City in the future!",
            "Mentor 🧙: Advance forth. Gather 🔩 scrap there to build a robot ally."
        ], null, true);
    } else if (q.id === "kill_robots") {
        let bossQuest = quests.find(x => x.id === "defeat_ai");
        if (bossQuest) bossQuest.active = true;
        startDialogue([
            "AI Overlord 🤖: Foolish human, you have destroyed my army.",
            "AI Overlord: Now face me, if you dare!"
        ], function() {
            spawnMonster(true);
        }, true);
    } else if (q.id === "defeat_ai") {
        let chronoQuest = quests.find(x => x.id === "forge_blade");
        if (chronoQuest) chronoQuest.active = true;
        startDialogue([
            "Mentor 🧙: You saved the future city! One last portal appears...",
            "Mentor 🧙: It leads to the Ocean Kingdom, home of the Kraken.",
            "Mentor 🧙: Forge the ⚔️ Chrono Blade from all eras to defeat the beast."
        ], null, true);
    } else if (q.id === "kill_sharks") {
        let bossQuest = quests.find(x => x.id === "defeat_kraken");
        if (bossQuest) bossQuest.active = true;
        startDialogue([
            "*The mighty Kraken 🐙 emerges from the depths!*"
        ], function() {
            spawnMonster(true);
        }, true);
    } else if (q.id === "defeat_kraken") {
        startDialogue([
            "Mentor 🧙: The Kraken is defeated and time is restored!",
            "Mentor 🧙: Thank you, hero. Peace returns to all eras.",
            "🏆 Congratulations! You have completed the game."
        ], null, true);
    } else if (q.id === "build_robot_pet") {
        // consume scrap for building robot
        inventory["scrap"] -= 5;
        if (inventory["scrap"] < 0) inventory["scrap"] = 0;
        // Pet unlocked handled above
    }
    updateQuestTracker();
}

// Dialogue system
let dialogueQueue = [];
let dialogueIndex = 0;
let dialogueCallback = null;

function startDialogue(lines, onComplete = null, hideControls = false) {
    gamePaused = true;
    dialogueQueue = lines;
    dialogueIndex = 0;
    dialogueCallback = onComplete;
    if (hideControls) {
        attackBtn.style.display = 'none';
        travelBtn.style.display = 'none';
        craftBtn.style.display = 'none';
        petBtn.style.display = 'none';
        skillsBtn.style.display = 'none';
        questsBtn.style.display = 'none';
    }
    continueBtn.style.display = 'inline-block';
    document.getElementById('controls').style.textAlign = 'center';
    // Display first line
    logMessage(lines[0], lines[0].startsWith('Mentor') ? 'npc' : (lines[0].startsWith('Goblin King') || lines[0].includes('Overlord') || lines[0].includes('ROOO') || lines[0].includes('Kraken') ? 'villain' : 'event'));
    dialogueIndex = 1;
}

// Continue dialogue
function continueDialogue() {
    if (dialogueIndex < dialogueQueue.length) {
        let line = dialogueQueue[dialogueIndex];
        logMessage(line, line.startsWith('Mentor') ? 'npc' : (line.startsWith('Goblin King') || line.includes('Overlord') || line.includes('ROOO') || line.includes('Kraken') ? 'villain' : 'event'));
        dialogueIndex++;
    } else {
        // Dialogue ended
        continueBtn.style.display = 'none';
        attackBtn.style.display = 'inline-block';
        travelBtn.style.display = zones.some((z,i) => z.unlocked && i !== currentZoneIndex) ? 'inline-block' : 'none';
        craftBtn.style.display = 'inline-block';
        petBtn.style.display = 'inline-block';
        skillsBtn.style.display = 'inline-block';
        questsBtn.style.display = 'inline-block';
        document.getElementById('controls').style.textAlign = 'left';
        gamePaused = false;
        // Resume monster attack if fight was ongoing
        if (currentMonster && currentMonster.hp > 0) {
            monsterAttackTimeout = setTimeout(monsterAttack, 500);
        }
        // Trigger callback if provided
        if (dialogueCallback) {
            const cb = dialogueCallback;
            dialogueCallback = null;
            cb();
        }
    }
}

// Switch pet
function switchPet(petKey) {
    if (!pets[petKey].unlocked) return;
    // Remove current pet stat bonus if any
    if (currentPet === pets.dragon) {
        player.attack -= (currentPet.level * 2);
    } else if (currentPet === pets.robot) {
        player.defense -= (currentPet.level * 1);
    }
    currentPet = pets[petKey];
    // Apply new pet bonus
    if (currentPet === pets.dragon) {
        player.attack += (currentPet.level * 2);
    } else if (currentPet === pets.robot) {
        player.defense += (currentPet.level * 1);
    }
    logMessage('Pet companion set to ' + currentPet.name + ' ' + currentPet.emoji + '.', '');
    updateStats();
}

// Learn/unlock a skill
function unlockSkill(skillId) {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    if (player.skillPoints < skill.cost || skill.unlocked) return;
    // Check prereq
    if (skill.prereq) {
        const prereqSkill = skills.find(s => s.id === skill.prereq);
        if (!prereqSkill || !prereqSkill.unlocked) return;
    }
    // Unlock skill
    skill.unlocked = true;
    player.skillPoints -= skill.cost;
    logMessage('Skill unlocked: ' + skill.name + '!', 'event');
    // Apply skill effect
    if (skill.id === "power_strike") {
        player.attack += 2;
    } else if (skill.id === "crit") {
        player.critChance += 0.05;
    } else if (skill.id === "berserk") {
        // handled dynamically in attack logic
    } else if (skill.id === "fortitude") {
        player.maxHp += 20;
        player.hp += 20;
    } else if (skill.id === "tough") {
        player.defense += 1;
    } else if (skill.id === "gold") {
        player.goldBonus = (player.goldBonus || 0) + 0.1;
    }
    updateStats();
    // Refresh skill menu if open
    if (skillMenuEl.style.display === 'block') {
        openSkillsMenu();
    }
}

// Handle player attack action
function playerAttack() {
    if (!currentMonster || gamePaused) return;
    // Player attack damage
    let damage = player.attack;
    // Berserker skill bonus
    const berserkSkill = skills.find(s => s.id === "berserk" && s.unlocked);
    if (berserkSkill && player.hp < player.maxHp / 2) {
        damage = Math.floor(damage * 1.1);
    }
    // Critical hit
    if (Math.random() < (player.critChance || 0)) {
        damage *= 2;
        logMessage('❗Critical hit!', 'event');
    }
    currentMonster.hp -= damage;
    logMessage('You hit the ' + currentMonster.name + ' for ' + damage + ' damage.', '');
    if (currentMonster.hp <= 0) {
        // monster dies
        clearTimeout(monsterAttackTimeout);
        monsterAttackTimeout = null;
        handleMonsterDefeat();
    } else {
        // monster still alive
        updateMonsterHP();
    }
    // Combo tracking
    const now = Date.now();
    if (!player.lastAttackTime || now - player.lastAttackTime > 1000) {
        player.comboCount = 1;
    } else {
        player.comboCount += 1;
    }
    player.lastAttackTime = now;
    if (player.comboCount && player.comboCount % 5 === 0) {
        if (!player.buffActive) {
            player.buffActive = true;
            logMessage('🔥 COMBO x' + player.comboCount + '! Attack power boosted!', 'event');
            const originalAttack = player.attack;
            player.attack = Math.floor(player.attack * 2);
            updateStats();
            setTimeout(function() {
                // remove buff after 10s
                player.attack = originalAttack;
                player.buffActive = false;
                logMessage('The combo power-up has worn off.', '');
                updateStats();
            }, 10000);
        }
    }
}

// Travel to a different zone
function travelTo(zoneIndex) {
    if (zoneIndex === currentZoneIndex || !zones[zoneIndex].unlocked) return;
    if (monsterAttackTimeout) {
        clearTimeout(monsterAttackTimeout);
        monsterAttackTimeout = null;
    }
    currentMonster = null;
    monsterEmojiEl.textContent = '';
    monsterHPEl.textContent = '';
    currentZoneIndex = zoneIndex;
    for (let q of quests) {
        if (!q.completed && q.zone === zoneIndex) {
            q.active = true;
        }
    }
    envDescEl.style.transition = 'opacity 0.5s';
    envDescEl.style.opacity = 0;
    setTimeout(function() {
        updateEnvDesc();
        envDescEl.style.opacity = 1;
    }, 500);
    logEl.innerHTML = '';
    updateQuestTracker();
    logMessage('You travel to ' + zones[zoneIndex].name + '.', 'event');
    setTimeout(function() {
        if (!gamePaused) spawnMonster();
    }, 1000);
    travelMenuEl.style.display = 'none';
}

// Open travel menu
function openTravelMenu() {
    let html = '<h2>Travel to:</h2>';
    for (let i = 0; i < zones.length; i++) {
        if (i !== currentZoneIndex && zones[i].unlocked) {
            html += '<button onclick="travelTo(' + i + ')">' + zones[i].name + '</button><br>';
        }
    }
    html += '<br><button onclick="closeMenu()">Close</button>';
    travelMenuEl.innerHTML = html;
    travelMenuEl.style.display = 'block';
    gamePaused = true;
}

// Open crafting menu
function openCraftMenu() {
    let html = '<h2>Crafting</h2>';
    html += '<p><b>Inventory:</b> ';
    const invItems = [];
    for (let item in inventory) {
        if (gearStats[item]) continue;
        invItems.push((itemNames[item] || item) + ' x' + inventory[item]);
    }
    html += invItems.join(', ') + '</p>';
    const recipes = [
        { name: "Wooden Shield", requires: { wood: 2 } },
        { name: "Dino Armor", requires: { dna: 2 } },
        { name: "Laser Sword", requires: { scrap: 2 } },
        { name: "Chrono Blade", requires: { wood: 1, dna: 1, scrap: 1, shell: 1 } }
    ];
    for (let recipe of recipes) {
        if (recipe.name === "Chrono Blade" && !zones[3].unlocked) continue;
        let canCraft = true;
        let reqText = [];
        for (let res in recipe.requires) {
            const need = recipe.requires[res];
            const have = inventory[res] || 0;
            reqText.push((itemNames[res] || res) + ' x' + need);
            if (have < need) {
                canCraft = false;
            }
        }
        html += '<p>' + recipe.name + ' (Requires: ' + reqText.join(', ') + ') ';
        if (canCraft) {
            // Use single backslash to escape single quotes inside single-quoted string
            html += '<button onclick="craftItem(\'' + recipe.name + '\')">Craft</button>';
        } else {
            html += '<button disabled>Craft</button>';
        }
        html += '</p>';
    }
    html += '<br><button onclick="closeMenu()">Close</button>';
    craftMenuEl.innerHTML = html;
    craftMenuEl.style.display = 'block';
    gamePaused = true;
}

// Craft an item
function craftItem(itemName) {
    let recipe;
    if (itemName === "Wooden Shield") {
        recipe = { wood: 2 };
    } else if (itemName === "Dino Armor") {
        recipe = { dna: 2 };
    } else if (itemName === "Laser Sword") {
        recipe = { scrap: 2 };
    } else if (itemName === "Chrono Blade") {
        recipe = { wood: 1, dna: 1, scrap: 1, shell: 1 };
    }
    if (!recipe) return;
    for (let res in recipe) {
        if ((inventory[res] || 0) < recipe[res]) {
            return;
        }
    }
    for (let res in recipe) {
        inventory[res] -= recipe[res];
        if (inventory[res] < 0) inventory[res] = 0;
    }
    inventory[itemName] = (inventory[itemName] || 0) + 1;
    logMessage('🔨 You crafted a ' + itemName + '!', 'event');
    if (gearStats[itemName]) {
        if (gearStats[itemName].attack || gearStats[itemName].defense) {
            const isWeapon = gearStats[itemName].attack > 0;
            if (isWeapon) {
                if (player.weapon) {
                    player.attack -= gearStats[player.weapon].attack;
                }
                player.weapon = itemName;
                player.attack += gearStats[itemName].attack;
            } else {
                if (player.armor) {
                    player.defense -= gearStats[player.armor].defense;
                }
                player.armor = itemName;
                player.defense += gearStats[itemName].defense;
            }
            logMessage(itemName + ' equipped.', '');
        }
    }
    updateStats();
    for (let q of quests) {
        if (!q.completed && q.craftedItem === itemName) {
            q.currentCount = 1;
            completeQuest(q);
        }
    }
    openCraftMenu();
}

// Open pet menu
function openPetMenu() {
    let html = '<h2>Your Pets</h2>';
    for (let key in pets) {
        const pet = pets[key];
        html += '<p>' + pet.emoji + ' ' + pet.name + ' - Lv' + pet.level;
        if (!pet.unlocked) {
            html += ' (Locked)';
        } else if (pet === currentPet) {
            html += ' (Active)';
        } else {
            // Escape single quotes correctly when building onclick attribute
            html += ' <button onclick="switchPet(\'' + key + '\')">Switch</button>';
        }
        html += '</p>';
    }
    html += '<br><button onclick="closeMenu()">Close</button>';
    petMenuEl.innerHTML = html;
    petMenuEl.style.display = 'block';
    gamePaused = true;
}

// Open skills menu
function openSkillsMenu() {
    let html = '<h2>Skill Tree</h2>';
    html += '<p>Skill Points: ' + player.skillPoints + '</p>';
    html += '<h3>Offensive Skills</h3>';
    const ps = skills.find(s => s.id === "power_strike");
    const crit = skills.find(s => s.id === "crit");
    const berserk = skills.find(s => s.id === "berserk");
    html += '<div>' + ps.name + ' - ' + ps.description + ' ';
    html += (ps.unlocked ? '(Unlocked)' : (player.skillPoints>=ps.cost && (!ps.prereq || skills.find(s=>s.id===ps.prereq).unlocked) ? '<button onclick="unlockSkill(\'power_strike\')">Unlock</button>' : '(Locked)')) + '</div>';
    html += '<div class="indent1">' + crit.name + ' - ' + crit.description + ' ';
    html += (crit.unlocked ? '(Unlocked)' : (player.skillPoints>=crit.cost && ps.unlocked ? '<button onclick="unlockSkill(\'crit\')">Unlock</button>' : '(Locked)')) + '</div>';
    html += '<div class="indent2">' + berserk.name + ' - ' + berserk.description + ' ';
    html += (berserk.unlocked ? '(Unlocked)' : (player.skillPoints>=berserk.cost && crit.unlocked ? '<button onclick="unlockSkill(\'berserk\')">Unlock</button>' : '(Locked)')) + '</div>';
    const fort = skills.find(s => s.id === "fortitude");
    const tough = skills.find(s => s.id === "tough");
    const gold = skills.find(s => s.id === "gold");
    html += '<h3>Defensive/Utility Skills</h3>';
    html += '<div>' + fort.name + ' - ' + fort.description + ' ';
    html += (fort.unlocked ? '(Unlocked)' : (player.skillPoints>=fort.cost ? '<button onclick="unlockSkill(\'fortitude\')">Unlock</button>' : '(Locked)')) + '</div>';
    html += '<div class="indent1">' + tough.name + ' - ' + tough.description + ' ';
    html += (tough.unlocked ? '(Unlocked)' : (player.skillPoints>=tough.cost && fort.unlocked ? '<button onclick="unlockSkill(\'tough\')">Unlock</button>' : '(Locked)')) + '</div>';
    html += '<div class="indent1">' + gold.name + ' - ' + gold.description + ' ';
    html += (gold.unlocked ? '(Unlocked)' : (player.skillPoints>=gold.cost && fort.unlocked ? '<button onclick="unlockSkill(\'gold\')">Unlock</button>' : '(Locked)')) + '</div>';
    html += '<br><button onclick="closeMenu()">Close</button>';
    skillMenuEl.innerHTML = html;
    skillMenuEl.style.display = 'block';
    gamePaused = true;
}

// Open quests menu
function openQuestMenu() {
    let html = '<h2>Quests</h2>';
    html += '<h3>Active Quests</h3>';
    for (let q of quests) {
        if (q.active && !q.completed) {
            html += '<p>- ' + q.description;
            if (q.targetCount > 1 || q.craftedItem) {
                html += ' (' + q.currentCount + '/' + q.targetCount + ')';
            }
            html += '</p>';
        }
    }
    html += '<h3>Completed Quests</h3>';
    for (let q of quests) {
        if (q.completed) {
            html += '<p>🏅 ' + q.description + '</p>';
        }
    }
    html += '<br><button onclick="closeMenu()">Close</button>';
    questMenuEl.innerHTML = html;
    questMenuEl.style.display = 'block';
    gamePaused = true;
}

// Close any open menu
function closeMenu() {
    travelMenuEl.style.display = 'none';
    craftMenuEl.style.display = 'none';
    petMenuEl.style.display = 'none';
    skillMenuEl.style.display = 'none';
    questMenuEl.style.display = 'none';
    gamePaused = false;
    if (currentMonster && currentMonster.hp > 0) {
        monsterAttackTimeout = setTimeout(monsterAttack, 500);
    }
    updateStats();
    updateQuestTracker();
}

// Event listeners for main buttons
attackBtn.addEventListener('click', function() {
    playerAttack();
});
travelBtn.addEventListener('click', function() {
    openTravelMenu();
});
craftBtn.addEventListener('click', function() {
    openCraftMenu();
});
petBtn.addEventListener('click', function() {
    openPetMenu();
});
skillsBtn.addEventListener('click', function() {
    openSkillsMenu();
});
questsBtn.addEventListener('click', function() {
    openQuestMenu();
});
continueBtn.addEventListener('click', function() {
    continueDialogue();
});

// Initialization
function startGame() {
    // Hide travel button initially
    travelBtn.style.display = 'none';
    // Hide continue until needed
    continueBtn.style.display = 'none';
    // Setup initial environment and quests
    updateEnvDesc();
    updateStats();
    updateQuestTracker();
    // Intro dialogue
    startDialogue([
        "Mentor 🧙: Welcome, hero! Monsters have invaded our kingdom.",
        "Mentor 🧙: You must journey across time to save us all.",
        "Mentor 🧙: Your loyal dog 🐶 accompanies you, aiding you in battle.",
        "Mentor 🧙: First, defeat 10 Goblins 🧌 to draw out their leader.",
        "Mentor 🧙: Collect 🪵 wood from enemies and craft a Wooden Shield for protection."
    ], null, true);
}

// Start the game
startGame();

