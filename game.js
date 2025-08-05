// Main game logic: state management, story progression, combat system, etc.
window.Game = window.Game || {};
// Initialize core game state
Game.playerParty = [];
Game.enemies = [];
Game.inventory = [];
Game.quests = [];
Game.inCombat = false;
Game.currentNode = null;
Game.animationInterval = null;
Game.flickerInterval = null;
Game.mapQuestStarted = false;
Game.map = null;
Game.playerLocation = { x: 0, y: 0 };
// Define the story nodes and branching narrative structure
Game.story = {
    start: {
        ascii: "village",
        text: "You are in a quiet village. The sky is clear. An old man approaches you with urgency.",
        choices: [
            { text: "Continue", next: "oldMan" }
        ]
    },
    oldMan: {
        text: "Old Man: 'The kingdom is in peril. A dragon terrorizes the land. Will you help us?'\nHe offers you a sword and begs for aid.",
        choices: [
            { text: "Accept Quest", next: "questAccepted" },
            { text: "Refuse and stay home", next: "ending_refusal" }
        ]
    },
    questAccepted: {
        text: "You accept the quest. The old man tells you to seek the seer in the enchanted forest for guidance.",
        choices: [
            { text: "Travel to the forest", next: "forestEntrance" },
            { text: "Explore around village first", next: "villageExplore" },
            { text: "Ask about the map", next: "mapTutorial" }
        ]
    },
    mapTutorial: {
        text: "The old man sketches a simple map of the surrounding lands for you.",
        choices: [
            { text: "Thank him", next: "villageExplore" }
        ]
    },
    ending_refusal: {
        text: "You live a quiet life, but the dragon eventually burns the village. You regret not taking action.\nThe end.",
        ending: true
    },
    villageExplore: {
        text: "You wander the village square. Shops line the dusty road and neighbors greet each other warmly.",
        choices: [
            { text: "Attempt the Shrine Trial", next: "shrineTrial" },
            { text: "Visit the blacksmith", next: "blacksmith" },
            { text: "Visit the library", next: "library" },
            { text: "Relax at the tavern", next: "tavern" },
            { text: "Leave for forest", next: "forestEntrance" }
        ]
    },
    blacksmith: {
        text: "The blacksmith, a burly woman named Hilda, wipes sweat from her brow. 'Need a weapon sharpened?' she asks.",
        npc: 'blacksmith',
        choices: [
            { text: "Ask about the dragon", next: "blacksmithDragon" },
            { text: "Chat about the village", next: "blacksmithVillage" },
            { text: "Return to the square", next: "villageExplore" }
        ]
    },
    blacksmithDragon: {
        text: "Hilda: 'That beast scorched half my forge once. Take this whetstone; it served me well.'",
        loot: { item: { name: "Fine Whetstone", type: "quest", description: "Improves weapon for a time." } },
        choices: [
            { text: "Thank her", next: "blacksmith" }
        ]
    },
    blacksmithVillage: {
        text: "Hilda: 'The village may seem quiet, but every blade I make tells a story.'",
        choices: [
            { text: "Back", next: "blacksmith" }
        ]
    },
    library: {
        text: "You step into a dusty library. The elder scholar Leto peers over ancient tomes.",
        choices: [
            { text: "Study local history", next: "libraryHistory" },
            { text: "Ask for spell books", next: "librarySpells" },
            { text: "Return to the square", next: "villageExplore" }
        ]
    },
    libraryHistory: {
        text: "Leto shares tales of a forgotten king whose name was erased. 'Remember, names hold power,' he says.",
        choices: [
            { text: "Reflect on his words", next: "library" }
        ]
    },
    librarySpells: {
        text: "Leto hands you a scroll. 'Only those with patience can master its contents.'",
        loot: { item: { name: "Scroll of Sparks", type: "scroll", effect: { magic: 2 } } },
        choices: [
            { text: "Return the scroll", next: "library" }
        ]
    },
    tavern: {
        text: "The tavern bustles with laughter. A bard strums a lute while villagers trade stories.",
        choices: [
            { text: "Listen to the bard", next: "tavernBard" },
            { text: "Chat with patrons", next: "tavernPatrons" },
            { text: "Return to square", next: "villageExplore" }
        ]
    },
    tavernBard: {
        text: "The bard sings of heroes who learned from every soul they met. You feel inspired.",
        choices: [
            { text: "Applaud", next: "tavern" }
        ]
    },
    tavernPatrons: {
        text: "A weary traveler warns you: 'The forest seer favors those who show kindness.'",
        choices: [
            { text: "Buy him a drink", next: "tavernReward" },
            { text: "Leave", next: "tavern" }
        ]
    },
    tavernReward: {
        text: "The traveler smiles and hands you a charm. 'May it guide you.'",
        loot: { item: { name: "Traveler's Charm", type: "accessory", effect: { defense: 1 } } },
        choices: [
            { text: "Return to the tavern", next: "tavern" }
        ]
    },
    shrineTrial: {
        text: "A mystical voice: 'Prove your reflexes. Press the button when the signal appears.'",
        puzzle: { type: "reaction", threshold: 800 },
        success: "shrineSuccess",
        fail: "shrineFail"
    },
    shrineSuccess: {
        text: "You react with lightning speed! The shrine grants you a boon.",
        loot: { item: { name: "Amulet of Quickness", type: "accessory", effect: { speed: 5 } } },
        choices: [
            { text: "Continue", next: "villageExplore2" }
        ]
    },
    shrineFail: {
        text: "Your reaction was too slow. The trial resets. You feel you could try again or leave.",
        choices: [
            { text: "Try again", next: "shrineTrial" },
            { text: "Leave", next: "villageExplore2" }
        ]
    },
    villageExplore2: {
        text: "You finish your business in the village.",
        choices: [
            { text: "Head to the forest", next: "forestEntrance" }
        ]
    },
    forestEntrance: {
        ascii: "forest",
        text: "You arrive at the edge of an enchanted forest. The path ahead is shadowy and foreboding.",
        choices: [
            { text: "Enter the forest", next: "deepForest" }
        ]
    },
    deepForest: {
        text: "Deeper in the forest, you hear a cry for help. A woman is battling goblins.",
        ascii: "forest",
        choices: [
            { text: "Help her fight", next: "goblinFight" },
            { text: "Ignore and move on", next: "ignoreFight" }
        ]
    },
    goblinFight: {
        text: "You rush to help the woman fight off the goblins!",
        combat: { enemies: ["Goblin", "Goblin"], next: "afterGoblinFight" }
    },
    ignoreFight: {
        text: "You decide not to intervene. You quietly slip past, leaving the fate of the stranger unknown.",
        choices: [
            { text: "Continue on path", next: "forestSeer" }
        ]
    },
    afterGoblinFight: {
        text: "The goblins are defeated. The woman thanks you. 'My name is Aria. I owe you my life.'\nShe is a traveling paladin on a personal quest.",
        recruit: { name: "Aria", class: "Paladin" },
        quest: { name: "Aria's Request", description: "Help Aria retrieve her family sword from the old ruins." },
        choices: [
            { text: "Invite Aria to join your party", next: "forestSeerWithAria" },
            { text: "Wish her well and continue alone", next: "forestSeer" }
        ]
    },
    forestSeer: {
        text: "You find a wise Seer deep in the forest. Seer: 'To defeat the dragon, you must obtain the Ancient Sword from the old ruins to the east.'",
        choices: [
            { text: "Travel to the ruins", next: "ruinsEntrance" }
        ]
    },
    forestSeerWithAria: {
        text: "The Seer sees Aria with you. Seer: 'A Paladin! Perhaps destiny weaves your fates together. The Ancient Sword you seek, Aria, lies in the ruins ahead.'",
        choices: [
            { text: "Go to the ruins with Aria", next: "ruinsEntrance" },
            { text: "Rest by the campfire", next: "campfireScene" }
        ]
    },
    campfireScene: {
        text: "That night, you and Aria rest beside a warm campfire.",
        cutscene: "romantic",
        choices: [
            { text: "Continue to the ruins", next: "ruinsEntrance" }
        ]
    },
    ruinsEntrance: {
        ascii: "dungeon",
        text: "You arrive at the entrance of ancient ruins. The atmosphere is eerie and torchlight flickers on the walls.",
        risk: 30,
        choices: [
            { text: "Enter the ruins", next: "ruinsHall" }
        ]
    },
    ruinsHall: {
        text: "Inside the ruins, it's dark. You see a locked door ahead and a corridor leading another way.",
        risk: 60,
        choices: [
            { text: "Pick the lock", next: "lockPickPuzzle" },
            { text: "Take the side corridor", next: "sideCorridor" }
        ]
    },
    lockPickPuzzle: {
        text: "You attempt to pick the lock on the door... Guess the correct code (1-5): ",
        puzzle: { type: "lockpick", range: 5, tries: 3 },
        success: "treasureRoom",
        fail: "alarmTriggered"
    },
    sideCorridor: {
        text: "You take the side corridor. You stumble into a group of skeletons!",
        combat: { enemies: ["Skeleton", "Skeleton"], next: "afterSkeletons" }
    },
    afterSkeletons: {
        text: "After defeating the skeletons, you find another way to the treasure room.",
        choices: [
            { text: "Continue", next: "treasureRoom" }
        ]
    },
    treasureRoom: {
        text: "You enter a chamber filled with treasure. On a pedestal lies the Ancient Sword, glowing faintly.",
        loot: { item: { name: "Ancient Sword", type: "weapon", attack: 15, magic: 5, set: "Ancient" } },
        choices: [
            { text: "Take the Ancient Sword", next: "exitRuins" }
        ]
    },
    alarmTriggered: {
        text: "The lockpick fails and triggers an alarm! Guards arrive.",
        combat: { enemies: ["Guard", "Guard"], next: "treasureRoom" }
    },
    exitRuins: {
        text: "With the Ancient Sword in hand, you exit the ruins. Aria is overjoyed to see her family blade recovered (if present).",
        completeQuest: "Aria's Request",
        choices: [
            { text: "Continue to journey", next: "beforeFinal" }
        ]
    },
    beforeFinal: {
        text: "Armed with the Ancient Sword, you feel prepared to face the dragon. On your way, a mysterious portal appears...\nA voice: 'Enter to see your future, or ignore to stay in the present.'",
        choices: [
            { text: "Enter the portal", next: "futureLand" },
            { text: "Ignore the portal", next: "dragonLair" }
        ]
    },
    futureLand: {
        text: "You step into the portal and emerge in a strange future. The world is in ruins. You meet an old sage who reveals a truth: The dragon was once a cursed king. Knowing his name can break the curse.",
        knowledge: "dragonName",
        choices: [
            { text: "Return through the portal", next: "dragonLair" }
        ]
    },
    dragonLair: {
        ascii: "dragon",
        text: "You arrive at the dragon's lair. The massive dragon looms before you, flames flickering in its eyes. The final battle begins!\nDragon: 'You have done well to come this far.'",
        choices: [
            { text: "Attack the dragon!", next: "finalBattle" },
            { text: "Try to reason with the dragon", next: "parleyDragon" }
        ]
    },
    parleyDragon: {
        text: "You attempt to speak: 'I know who you truly are...'",
        choices: [
            { text: "Invoke the dragon's true name", next: "ending_curseLifted" },
            { text: "(You don't know his name)", next: "dragonAnger" }
        ]
    },
    dragonAnger: {
        text: "Without the knowledge of the dragon's name, your attempt fails. The dragon roars in anger and attacks!",
        next: "finalBattle"
    },
    finalBattle: {
        text: "The dragon attacks! The final fight is on.",
        risk: 90,
        combat: { enemies: ["Dragon"], next: "postFinalBattle" }
    },
    postFinalBattle: {
        text: "The dragon collapses, defeated. As it draws its last breath, the silhouette of a man briefly appears and then fades.",
        choices: [
            { text: "Finish the dragon and confront the Dark Lord behind it", next: "finalConfrontation" }
        ]
    },
    finalConfrontation: {
        text: "The Dark Lord, who controlled the dragon, appears from the shadows, weakened. 'Impressive... Perhaps we could rule together.'\nHe offers you his hand.",
        cutscene: "villain",
        choices: [
            { text: "Spare him and accept power", next: "ending_evil" },
            { text: "Strike him down", next: "ending_good" }
        ]
    },
    ending_curseLifted: {
        text: "You call out the dragon's true name. The dragon shudders and transforms into a weary King, freed from the curse. He thanks you for releasing him.\nThe kingdom is saved without bloodshed.",
        ending: true
    },
    ending_good: {
        text: "You refuse the Dark Lord and deliver the final blow. Peace returns to the land. You are hailed as a hero across the kingdom.",
        ending: true
    },
    ending_evil: {
        text: "You take the Dark Lord's hand. Together, you rule the lands with an iron fist, the people suffering under your tyranny. Your name is cursed forever.",
        ending: true
    },
    ending_bad: {
        text: "Defeated, you fade into legend as a cautionary tale. Your quest ends in failure.\nThe end.",
        ending: true
    }
};
// Initialize the game (called on page load)
Game.init = function() {
    // Start game at the class selection screen
    Game.chooseClass();
};
// Start or reset the game with a chosen class
Game.startGame = function(className) {
    // Reset game state
    Game.playerParty = [];
    Game.inventory = [];
    Game.quests = [];
    // Create the main character using the chosen class
    var player = Game.createCharacter(className || "Warrior", "Hero");
    Game.playerParty.push(player);
    // Give starting gear to the player
    var starterSword = { name: "Rusty Sword", type: "weapon", attack: 5 };
    var starterArmor = { name: "Cloth Armor", type: "armor", defense: 2 };
    Game.inventory.push(starterSword, starterArmor);
    Game.equipItem(player, starterSword);
    Game.equipItem(player, starterArmor);
    // Begin the story at the starting node
    Game.goToNode("start");
};
// Show class selection options to the player
Game.chooseClass = function() {
    Game.closePanels();
    Game.updateRiskMeter(0);
    document.getElementById('combatView').style.display = 'none';
    document.getElementById('storyView').style.display = 'block';
    var asciiEl = document.getElementById('asciiArt');
    asciiEl.textContent = "";
    var textEl = document.getElementById('textDisplay');
    textEl.innerText = "Choose your class:";
    var choicesEl = document.getElementById('choiceButtons');
    choicesEl.innerHTML = "";
    // Create a button for each available class
    Object.keys(Game.classes).forEach(function(cls) {
        var btn = document.createElement('button');
        btn.textContent = cls;
        btn.onclick = function() { Game.startGame(cls); };
        choicesEl.appendChild(btn);
    });
};
// Create a new character object given a class and name
Game.createCharacter = function(className, charName) {
    var cls = Game.classes[className];
    var base = cls.baseStats;
    var char = {
        name: charName,
        class: className,
        level: 1,
        xp: 0,
        maxHP: base.maxHP, HP: base.maxHP,
        maxMana: base.maxMana, mana: base.maxMana,
        maxStamina: base.maxStamina, stamina: base.maxStamina,
        attack: base.attack,
        defense: base.defense,
        magic: base.magic,
        skills: [],
        weapon: null,
        armor: null,
        accessory: null,
        statusEffects: []
    };
    // Assign initial skills for this class
    cls.initialSkills.forEach(skillName => {
        if (Game.skills[skillName]) {
            // Deep copy skill definition to character's skill list
            char.skills.push(JSON.parse(JSON.stringify(Game.skills[skillName])));
        }
    });
    return char;
};
// Equip an item to a character (and unequip any current item in that slot)
Game.equipItem = function(char, item) {
    var slot;
    if (item.type === "weapon") slot = "weapon";
    else if (item.type === "armor") slot = "armor";
    else if (item.type === "accessory") slot = "accessory";
    if (!slot) return false;
    // Remove item from inventory
    var idx = Game.inventory.indexOf(item);
    if (idx >= 0) Game.inventory.splice(idx, 1);
    // If something is already equipped in that slot, unequip it (return to inventory)
    if (char[slot]) {
        Game.inventory.push(char[slot]);
    }
    // Equip the new item
    char[slot] = item;
    // Update character stats to include item bonuses
    Game.updateStats(char);
    return true;
};
// Recalculate a character's stats based on base stats and current equipment
Game.updateStats = function(char) {
    // Reset to base class stats
    var base = Game.classes[char.class].baseStats;
    char.attack = base.attack;
    char.defense = base.defense;
    char.magic = base.magic;
    // Reapply any stat gains from level-ups (already included in current stats as we level up in place)
    // Now add equipment bonuses
    ["weapon", "armor", "accessory"].forEach(slot => {
        if (char[slot]) {
            var it = char[slot];
            if (it.attack) char.attack += it.attack;
            if (it.defense) char.defense += it.defense;
            if (it.magic) char.magic += it.magic;
            if (it.hp) {
                char.maxHP += it.hp;
                char.HP += it.hp;
            }
            if (it.mana) {
                char.maxMana += it.mana;
                char.mana += it.mana;
            }
        }
    });
    // Check for equipment set bonuses
    if (char.weapon && char.armor && char.weapon.set && char.weapon.set === char.armor.set) {
        if (char.weapon.set === "Ancient") {
            char.attack += 5;
            char.defense += 5;
        }
    }
};
// Add an item to the player's inventory (and check for quest completion triggers)
Game.addItem = function(item) {
    Game.inventory.push(item);
    // If this item fulfills a quest objective, mark quest as completed
    Game.quests.forEach(q => {
        if (q.status === "ongoing" && q.targetItem && q.targetItem === item.name) {
            Game.completeQuest(q.name);
        }
    });
};
// Add a new quest to the journal
Game.addQuest = function(name, description) {
    Game.quests.push({ name: name, description: description, status: "ongoing" });
};
// Mark a quest as completed
Game.completeQuest = function(name) {
    var q = Game.quests.find(q => q.name === name);
    if (q) q.status = "completed";
};
// Generate a random item (for loot drops)
Game.generateItem = function() {
    // Item name components
    var prefixes = [
        { name: "Iron", attack: 1, defense: 1, magic: 0 },
        { name: "Steel", attack: 2, defense: 2, magic: 0 },
        { name: "Flaming", attack: 2, magic: 2 },
        { name: "Shadow", attack: 1, defense: 1, magic: 3 }
    ];
    var bases = [
        { name: "Sword", type: "weapon", attack: 5 },
        { name: "Axe", type: "weapon", attack: 6 },
        { name: "Staff", type: "weapon", attack: 3, magic: 3 },
        { name: "Bow", type: "weapon", attack: 4 },
        { name: "Dagger", type: "weapon", attack: 3 },
        { name: "Armor", type: "armor", defense: 5 },
        { name: "Shield", type: "armor", defense: 4 },
        { name: "Ring", type: "accessory", attack: 1, defense: 1, magic: 1 }
    ];
    var suffixes = [
        { name: "of Power", attack: 3 },
        { name: "of Defense", defense: 3 },
        { name: "of Magic", magic: 3 },
        { name: "of Vitality", hp: 20 }
    ];
    // Determine item quality tier
    var roll = Math.random();
    var tier;
    if (roll < 0.5) tier = 0;
    else if (roll < 0.8) tier = 1;
    else if (roll < 0.95) tier = 2;
    else if (roll < 0.99) tier = 3;
    else tier = 4;
    // Pick a base item template and clone it
    var baseItem = JSON.parse(JSON.stringify(bases[Math.floor(Math.random() * bases.length)]));
    var itemName = baseItem.name;
    // Apply prefix for tier 1+
    if (tier >= 1) {
        var pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        itemName = pre.name + " " + itemName;
        // Merge prefix stats into baseItem
        for (var stat in pre) {
            if (stat !== 'name') {
                baseItem[stat] = (baseItem[stat] || 0) + pre[stat];
            }
        }
    }
    // Apply suffix for tier 2+
    if (tier >= 2) {
        var suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        itemName = itemName + " " + suf.name;
        for (var stat in suf) {
            if (stat !== 'name') {
                baseItem[stat] = (baseItem[stat] || 0) + suf[stat];
            }
        }
    }
    baseItem.name = itemName;
    // Tier 3 (Epic) adds extra stat boosts
    if (tier === 3) {
        if (baseItem.attack) baseItem.attack += 2;
        if (baseItem.defense) baseItem.defense += 2;
        if (baseItem.magic) baseItem.magic += 2;
        baseItem.name = "Epic " + baseItem.name;
    }
    // Tier 4 (Legendary) picks a unique legendary item
    if (tier === 4) {
        var legendaries = [
            { name: "Excalibur", type: "weapon", attack: 20, magic: 5 },
            { name: "Dragon Scale Armor", type: "armor", defense: 15, hp: 50 },
            { name: "Staff of Eternity", type: "weapon", attack: 5, magic: 15, mana: 30 }
        ];
        baseItem = legendaries[Math.floor(Math.random() * legendaries.length)];
    }
    return baseItem;
};
// Navigate to a given story node by its ID
Game.goToNode = function(nodeId) {
    // Stop any running ASCII animations
    if (Game.animationInterval) {
        clearInterval(Game.animationInterval);
        Game.animationInterval = null;
    }
    if (Game.flickerInterval) {
        clearInterval(Game.flickerInterval);
        Game.flickerInterval = null;
    }
    // Switch to story view
    document.getElementById('combatView').style.display = 'none';
    document.getElementById('storyView').style.display = 'block';
    // Close any open UI panels
    Game.closePanels();
    var node = Game.story[nodeId];
    if (!node) return;
    Game.currentNode = node;
    // Update the risk meter based on node's danger level
    Game.updateRiskMeter(node.risk || 0);
    // Display ASCII art or play cutscene for this node
    var asciiEl = document.getElementById('asciiArt');
    if (node.cutscene) {
        asciiEl.textContent = "";
        if (node.cutscene === "villain") {
            Game.playVillainCutscene();
        } else if (node.cutscene === "romantic") {
            Game.playRomanticCutscene();
        }
    } else if (node.ascii && Game.asciiArts[node.ascii]) {
        asciiEl.textContent = Game.asciiArts[node.ascii];
    } else {
        asciiEl.textContent = "";
    }
    // Display narrative text for this node
    var textEl = document.getElementById('textDisplay');
    textEl.innerText = node.text || "";
    // Handle immediate combat or puzzle events
    if (node.combat) {
        Game.startCombat(node.combat.enemies, node.combat.next, node.combat.fail);
        return;
    }
    if (node.puzzle) {
        // If a reaction puzzle
        if (node.puzzle.type === "reaction") {
            textEl.innerText = node.text;
            var startBtn = document.createElement('button');
            startBtn.textContent = "Start";
            startBtn.onclick = function() {
                startBtn.style.display = 'none';
                var delay = Math.random() * 2000 + 1000;
                setTimeout(function() {
                    textEl.innerText = "Tap NOW!!!";
                    var tapBtn = document.createElement('button');
                    tapBtn.textContent = "Tap!";
                    var startTime = Date.now();
                    tapBtn.onclick = function() {
                        var reactionTime = Date.now() - startTime;
                        textEl.innerText = "";
                        tapBtn.remove();
                        if (reactionTime <= node.puzzle.threshold) {
                            Game.goToNode(node.success);
                        } else {
                            Game.goToNode(node.fail);
                        }
                    };
                    document.getElementById('choiceButtons').innerHTML = "";
                    document.getElementById('choiceButtons').appendChild(tapBtn);
                }, delay);
            };
            document.getElementById('choiceButtons').innerHTML = "";
            document.getElementById('choiceButtons').appendChild(startBtn);
        } else if (node.puzzle.type === "lockpick") {
            // Number guessing puzzle (lock picking)
            textEl.innerText = node.text;
            var secret = Math.floor(Math.random() * node.puzzle.range) + 1;
            var attempts = node.puzzle.tries;
            var input = document.createElement('input');
            input.type = 'number';
            input.min = 1;
            input.max = node.puzzle.range;
            var submitBtn = document.createElement('button');
            submitBtn.textContent = "Guess";
            var feedback = document.createElement('div');
            feedback.id = 'puzzleFeedback';
            submitBtn.onclick = function() {
                var guess = parseInt(input.value);
                if (isNaN(guess)) return;
                if (guess === secret) {
                    feedback.textContent = "Unlocked!";
                    Game.goToNode(node.success);
                } else {
                    attempts -= 1;
                    if (guess < secret) {
                        feedback.textContent = "Too low.";
                    } else {
                        feedback.textContent = "Too high.";
                    }
                    if (attempts <= 0) {
                        Game.goToNode(node.fail);
                    } else {
                        feedback.textContent += " Try again (" + attempts + " attempts left).";
                    }
                }
            };
            var choiceButtonsEl = document.getElementById('choiceButtons');
            choiceButtonsEl.innerHTML = "";
            choiceButtonsEl.appendChild(input);
            choiceButtonsEl.appendChild(submitBtn);
            choiceButtonsEl.appendChild(feedback);
        }
        return;
    }
    // If reaching here, no immediate combat/puzzle, continue with story progression
    // If this node recruits a new party member
    if (node.recruit) {
        var ally = Game.createCharacter(node.recruit.class, node.recruit.name);
        Game.playerParty.push(ally);
    }
    // If this node introduces a new quest
    if (node.quest) {
        Game.addQuest(node.quest.name, node.quest.description);
    }
    // If this node grants loot (specific item or random)
    if (node.loot) {
        var lootItem;
        if (node.loot.item) {
            lootItem = node.loot.item;
        } else if (node.loot.random) {
            lootItem = Game.generateItem();
        }
        if (lootItem) {
            Game.addItem(lootItem);
            textEl.innerText += "\nYou obtained " + lootItem.name + "!";
        }
    }
    // If this node completes a quest
    if (node.completeQuest) {
        Game.completeQuest(node.completeQuest);
        textEl.innerText += "\n(Quest '" + node.completeQuest + "' completed!)";
    }
    // If this node grants special knowledge (used for later story logic)
    if (node.knowledge) {
        Game.knowledge = Game.knowledge || {};
        Game.knowledge[node.knowledge] = true;
    }
    // If this node involves an NPC interaction, trigger the NPC's dialogue
    if (node.npc) {
        if (node.npc === 'blacksmith' && typeof blacksmith !== 'undefined') {
            blacksmith.talk();
        } else if (node.npc === 'ranger' && typeof ranger !== 'undefined') {
            ranger.talk();
        }
        // Do not display story choices while dialogue overlay is active
        return;
    }
    // If this node is an ending, offer a restart option
    if (node.ending) {
        document.getElementById('choiceButtons').innerHTML = "";
        var restartBtn = document.createElement('button');
        restartBtn.textContent = "Restart Game";
        restartBtn.onclick = function() { Game.chooseClass(); };
        document.getElementById('choiceButtons').appendChild(restartBtn);
        return;
    }
    // Otherwise, display any available choices for the player to proceed
    var choicesEl = document.getElementById('choiceButtons');
    choicesEl.innerHTML = "";
    if (node.choices) {
        node.choices.forEach(choice => {
            var btn = document.createElement('button');
            btn.textContent = choice.text;
            btn.onclick = function() {
                Game.goToNode(choice.next);
            };
            choicesEl.appendChild(btn);
        });
    }
    // Trigger environmental animations if applicable
    if (node.ascii === "forest") {
        Game.startForestAnimation();
    }
    if (node.ascii === "dungeon") {
        Game.startTorchFlicker();
    }
};
// Start a combat encounter with given enemies
Game.startCombat = function(enemyTypes, nextNode, failNode) {
    Game.inCombat = true;
    // Set a high risk level during combat
    Game.updateRiskMeter(80);
    Game.enemies = [];
    enemyTypes.forEach(type => {
        Game.enemies.push(Game.createEnemy(type));
    });
    // Switch view to combat UI
    document.getElementById('storyView').style.display = 'none';
    document.getElementById('combatView').style.display = 'block';
    document.getElementById('combatLog').innerText = "Combat starts!";
    document.getElementById('combatActions').innerHTML = "";
    // Store where to go after combat wins or fails
    Game.combatNextNode = nextNode;
    Game.combatFailNode = failNode;
    // Begin turn-based combat starting with the first party member
    Game.currentTurnCharIndex = 0;
    Game.updatePartyStats();
    Game.playerTurn(Game.currentTurnCharIndex);
};
// Create an enemy object by type name with appropriate stats
Game.createEnemy = function(type) {
    var enemyData;
    if (type === "Goblin") {
        enemyData = { name: "Goblin", maxHP: 30, attack: 5, defense: 1, magic: 0, behavior: "aggressive", xp: 20 };
    } else if (type === "Skeleton") {
        enemyData = { name: "Skeleton", maxHP: 40, attack: 6, defense: 3, magic: 0, behavior: "aggressive", xp: 25 };
    } else if (type === "Guard") {
        enemyData = { name: "Guard", maxHP: 50, attack: 8, defense: 4, magic: 0, behavior: "sniper", xp: 30 };
    } else if (type === "Dragon") {
        enemyData = { name: "Dragon", maxHP: 200, attack: 15, defense: 5, magic: 5, behavior: "boss", xp: 100 };
    } else {
        enemyData = { name: type, maxHP: 30, attack: 5, defense: 1, magic: 0, behavior: "random", xp: 10 };
    }
    return {
        name: enemyData.name,
        HP: enemyData.maxHP,
        maxHP: enemyData.maxHP,
        attack: enemyData.attack,
        defense: enemyData.defense,
        magic: enemyData.magic,
        behavior: enemyData.behavior,
        xp: enemyData.xp,
        turnCount: 0,
        statusEffects: []
    };
};
// Handle a player's turn for the character at the given index
Game.playerTurn = function(index) {
    // If all players have had a turn, proceed to enemies' turn
    if (index >= Game.playerParty.length) {
        Game.enemyTurn(0);
        return;
    }
    // Skip dead characters
    var char = Game.playerParty[index];
    if (char.HP <= 0) {
        Game.playerTurn(index + 1);
        return;
    }
    // Display available actions for this character
    var actionsEl = document.getElementById('combatActions');
    actionsEl.innerHTML = "";
    var promptDiv = document.createElement('div');
    promptDiv.textContent = char.name + "'s turn: Choose action:";
    actionsEl.appendChild(promptDiv);
    // Create a button for each skill the character has
    char.skills.forEach(skill => {
        var canUse = true;
        if (skill.costType === "mana" && char.mana < skill.cost) canUse = false;
        if (skill.costType === "stamina" && char.stamina < skill.cost) canUse = false;
        if (skill.currentCooldown && skill.currentCooldown > 0) canUse = false;
        var btn = document.createElement('button');
        btn.textContent = skill.name;
        btn.disabled = !canUse;
        btn.onclick = function() {
            Game.useSkill(char, skill);
        };
        actionsEl.appendChild(btn);
    });
    // Option to use an item (if any consumable items in inventory)
    if (Game.inventory.some(item => item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory')) {
        var itemBtn = document.createElement('button');
        itemBtn.textContent = "Use Item";
        itemBtn.onclick = function() {
            Game.showInventory(true, index);
        };
        actionsEl.appendChild(itemBtn);
    }
};
// Handle using a skill by a character
Game.useSkill = function(char, skill) {
    if (skill.target === 'enemy') {
        // Choose an enemy target
        Game.displayTargetOptions(char, skill, 'enemy');
    } else if (skill.target === 'ally') {
        Game.displayTargetOptions(char, skill, 'ally');
    } else {
        // Skills that target self or all
        Game.executeSkill(char, skill, null);
    }
};
// Display target selection buttons for a skill
Game.displayTargetOptions = function(char, skill, targetType) {
    var actionsEl = document.getElementById('combatActions');
    actionsEl.innerHTML = "Select target:";
    if (targetType === 'enemy') {
        Game.enemies.forEach((enemy, idx) => {
            if (enemy.HP > 0) {
                var btn = document.createElement('button');
                btn.textContent = enemy.name + " (HP " + enemy.HP + ")";
                btn.onclick = function() {
                    Game.executeSkill(char, skill, enemy);
                };
                actionsEl.appendChild(btn);
            }
        });
    } else if (targetType === 'ally') {
        Game.playerParty.forEach((ally, idx) => {
            if (ally.HP > 0) {
                var btn = document.createElement('button');
                btn.textContent = ally.name + " (HP " + ally.HP + ")";
                btn.onclick = function() {
                    Game.executeSkill(char, skill, ally);
                };
                actionsEl.appendChild(btn);
            }
        });
    }
};
// Execute the effect of a skill on the chosen target (or all targets)
Game.executeSkill = function(char, skill, target) {
    var logEl = document.getElementById('combatLog');
    // Deduct resource cost
    if (skill.costType === 'mana') {
        char.mana = Math.max(0, char.mana - skill.cost);
    }
    if (skill.costType === 'stamina') {
        char.stamina = Math.max(0, char.stamina - skill.cost);
    }
    // Set skill cooldown
    skill.currentCooldown = skill.cooldown;
    // Apply skill effect
    if (skill.type === 'physical' || skill.type === 'magic') {
        // Damage skills
        if (skill.target === 'all-enemies') {
            logEl.innerText += "\n" + char.name + " uses " + skill.name + "!";
            Game.enemies.forEach(enemy => {
                if (enemy.HP > 0) {
                    var dmg = Math.floor((skill.type === 'physical' ? char.attack : char.magic) * skill.power - enemy.defense);
                    if (dmg < 1) dmg = 1;
                    enemy.HP -= dmg;
                    logEl.innerText += "\n> " + enemy.name + " takes " + dmg + " damage.";
                    if (enemy.HP <= 0) {
                        logEl.innerText += " " + enemy.name + " is defeated.";
                    }
                }
            });
        } else {
            // Single target damage
            if (target) {
                var damage = Math.floor((skill.type === 'physical' ? char.attack : char.magic) * skill.power - target.defense);
                if (damage < 1) damage = 1;
                target.HP -= damage;
                logEl.innerText += "\n" + char.name + " uses " + skill.name + " on " + target.name + " for " + damage + " damage.";
                if (target.HP <= 0) {
                    logEl.innerText += " " + target.name + " is defeated.";
                }
            }
        }
        // Apply status effect if any (e.g., poison)
        if (skill.status && target && target.HP > 0) {
            target.statusEffects.push({ type: skill.status.type, damage: skill.status.damage, duration: skill.status.duration });
            logEl.innerText += "\n" + target.name + " is " + skill.status.type + "ed!";
        }
    } else if (skill.type === 'heal') {
        // Healing skills
        if (skill.target === 'all-allies') {
            logEl.innerText += "\n" + char.name + " casts " + skill.name + "!";
            Game.playerParty.forEach(p => {
                if (p.HP > 0) {
                    var healAll = Math.floor(p.maxHP * skill.power);
                    p.HP = Math.min(p.HP + healAll, p.maxHP);
                    logEl.innerText += "\n> " + p.name + " is healed for " + healAll + " HP.";
                }
            });
        } else if (target) {
            var healAmt = Math.floor(target.maxHP * skill.power);
            target.HP = Math.min(target.HP + healAmt, target.maxHP);
            logEl.innerText += "\n" + char.name + " casts " + skill.name + " on " + target.name + ", healing " + healAmt + " HP.";
        }
    } else if (skill.type === 'buff') {
        // Self-buff skills
        if (skill.effect && skill.target === 'self') {
            char.statusEffects.push({ type: 'buff', stat: skill.effect.stat, increase: skill.effect.increase, duration: skill.effect.duration });
            logEl.innerText += "\n" + char.name + " uses " + skill.name + ", gaining +" + skill.effect.increase + " " + skill.effect.stat + ".";
            if (skill.effect.stat === 'attack') char.attack += skill.effect.increase;
            if (skill.effect.stat === 'defense') char.defense += skill.effect.increase;
        }
    } else if (skill.type === 'debuff' && target) {
        // Debuff skill on target
        if (skill.effect) {
            target.statusEffects.push({ type: 'debuff', stat: skill.effect.stat, increase: skill.effect.increase, duration: skill.effect.duration });
            logEl.innerText += "\n" + char.name + " uses " + skill.name + " on " + target.name + ", lowering their " + skill.effect.stat + ".";
            if (skill.effect.stat === 'attack') target.attack += skill.effect.increase; // increase is negative
            if (skill.effect.stat === 'defense') target.defense += skill.effect.increase;
        }
    }
    // Check if all enemies are defeated
    if (Game.enemies.every(e => e.HP <= 0)) {
        Game.winCombat();
        return;
    }
    // Move to the next player's turn
    Game.updatePartyStats();
    Game.playerTurn(++Game.currentTurnCharIndex);
};
// Process the enemies' turn starting from a given enemy index
Game.enemyTurn = function(index) {
    if (index >= Game.enemies.length) {
        // All enemies have taken a turn, end of round processing
        Game.enemies = Game.enemies.filter(e => e.HP > 0);
        if (Game.enemies.length === 0) {
            Game.winCombat();
            return;
        }
        // End of round: reduce skill cooldowns and status durations for players
        Game.playerParty.forEach(char => {
            char.skills.forEach(skill => {
                if (skill.currentCooldown && skill.currentCooldown > 0) {
                    skill.currentCooldown -= 1;
                }
            });
            // Decrement buff durations and remove expired buffs
            char.statusEffects = char.statusEffects.filter(status => {
                status.duration -= 1;
                if (status.duration <= 0) {
                    if (status.type === 'buff') {
                        if (status.stat === 'attack') char.attack -= status.increase;
                        if (status.stat === 'defense') char.defense -= status.increase;
                    }
                    return false;
                }
                return true;
            });
        });
        // Decrement enemy status durations and apply effects (like poison damage)
        Game.enemies.forEach(enemy => {
            enemy.statusEffects = enemy.statusEffects.filter(status => {
                if (status.type === 'poison') {
                    enemy.HP -= status.damage;
                    var logEl = document.getElementById('combatLog');
                    logEl.innerText += "\n" + enemy.name + " suffers " + status.damage + " poison damage.";
                }
                status.duration -= 1;
                return status.duration > 0;
            });
        });
        // Log enemies that died from status effects
        Game.enemies.forEach(enemy => {
            if (enemy.HP <= 0) {
                var logEl = document.getElementById('combatLog');
                logEl.innerText += "\n" + enemy.name + " succumbs to poison.";
            }
        });
        // Remove any dead enemies after status effects
        Game.enemies = Game.enemies.filter(e => e.HP > 0);
        if (Game.enemies.length === 0) {
            Game.winCombat();
            return;
        }
        // New round: back to first player's turn
        Game.currentTurnCharIndex = 0;
        Game.updatePartyStats();
        Game.playerTurn(Game.currentTurnCharIndex);
        return;
    }
    var enemy = Game.enemies[index];
    if (enemy.HP > 0) {
        enemy.turnCount += 1;
        var logEl = document.getElementById('combatLog');
        if (enemy.behavior === 'boss' && enemy.turnCount % 3 === 0) {
            // Boss uses special attack every 3rd turn (area attack)
            logEl.innerText += "\n" + enemy.name + " breathes fire on the entire party!";
            Game.playerParty.forEach(char => {
                if (char.HP > 0) {
                    var dmgAll = Math.floor(enemy.attack * 1.2 - char.defense);
                    if (dmgAll < 1) dmgAll = 1;
                    char.HP -= dmgAll;
                    logEl.innerText += "\n> " + char.name + " takes " + dmgAll + " damage from flames.";
                    if (char.HP <= 0) {
                        logEl.innerText += " " + char.name + " falls!";
                    }
                }
            });
            Game.updatePartyStats();
        } else if (enemy.behavior === 'support') {
            // Support enemy may heal allies or attack
            var weakest = Game.enemies.filter(e => e.HP > 0).reduce((lowest, e) => e.HP < lowest.HP ? e : lowest, enemy);
            if (weakest.HP < weakest.maxHP / 2 && Math.random() < 0.7) {
                var heal = 10;
                weakest.HP = Math.min(weakest.HP + heal, weakest.maxHP);
                logEl.innerText += "\n" + enemy.name + " casts a spell to heal " + weakest.name + " for " + heal + " HP.";
            } else {
                var targetChar = Game.playerParty.filter(c => c.HP > 0)[Math.floor(Math.random() * Game.playerParty.filter(c => c.HP > 0).length)];
                if (targetChar) {
                    var dmg = Math.floor(enemy.attack - targetChar.defense);
                    if (dmg < 1) dmg = 1;
                    targetChar.HP -= dmg;
                    logEl.innerText += "\n" + enemy.name + " attacks " + targetChar.name + " for " + dmg + " damage.";
                    if (targetChar.HP <= 0) {
                        logEl.innerText += " " + targetChar.name + " has fallen.";
                    }
                    Game.updatePartyStats();
                }
            }
        } else {
            // Default enemy behaviors
            var targetPlayer;
            if (enemy.behavior === 'sniper') {
                // Target the player with the lowest defense
                targetPlayer = Game.playerParty.filter(c => c.HP > 0).reduce((min, c) => c.defense < min.defense ? c : min, Game.playerParty[0]);
            } else if (enemy.behavior === 'aggressive') {
                // Target the player with the lowest current HP
                targetPlayer = Game.playerParty.filter(c => c.HP > 0).reduce((min, c) => c.HP < min.HP ? c : min, Game.playerParty[0]);
            } else {
                // Random target
                var alivePlayers = Game.playerParty.filter(c => c.HP > 0);
                targetPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            }
            if (targetPlayer) {
                var dmg = Math.floor(enemy.attack - targetPlayer.defense);
                if (dmg < 1) dmg = 1;
                targetPlayer.HP -= dmg;
                logEl.innerText += "\n" + enemy.name + " attacks " + targetPlayer.name + " for " + dmg + " damage.";
                if (targetPlayer.HP <= 0) {
                    logEl.innerText += " " + targetPlayer.name + " has fallen.";
                }
                Game.updatePartyStats();
            }
        }
    }
    // If all players are dead, combat is lost
    if (Game.playerParty.every(c => c.HP <= 0)) {
        Game.loseCombat();
        return;
    }
    // Continue with next enemy's turn
    Game.enemyTurn(index + 1);
};
// Handle winning a combat encounter
Game.winCombat = function() {
    var logEl = document.getElementById('combatLog');
    logEl.innerText += "\nYou won the battle!";
    // Grant XP to the party
    var totalXP = Game.enemies.reduce((sum, e) => sum + (e.xp || 0), 0);
    if (totalXP > 0) {
        logEl.innerText += "\nParty gains " + totalXP + " XP.";
        Game.playerParty.forEach(char => {
            if (char.HP > 0) {
                Game.gainXP(char, totalXP);
            }
        });
    }
    // Possibly drop loot
    if (Game.enemies.some(e => e.name === 'Dragon')) {
        // Final boss gives a legendary
        var legendaryItem = Game.generateItem();
        legendaryItem = Game.generateItem();
        legendaryItem.name = "Legendary " + legendaryItem.name;
        Game.addItem(legendaryItem);
        logEl.innerText += "\nLoot found: " + legendaryItem.name + "!";
    } else if (Math.random() < 0.7) {
        var loot = Game.generateItem();
        Game.addItem(loot);
        logEl.innerText += "\nLoot found: " + loot.name + ".";
    }
    // After a short pause, return to story
    setTimeout(function() {
        Game.inCombat = false;
        Game.updateRiskMeter(0);
        Game.goToNode(Game.combatNextNode);
    }, 1000);
};
// Handle losing a combat encounter
Game.loseCombat = function() {
    var logEl = document.getElementById('combatLog');
    logEl.innerText += "\nYour party has been defeated...";
    Game.inCombat = false;
    Game.updateRiskMeter(0);
    if (Game.combatFailNode) {
        Game.goToNode(Game.combatFailNode);
    } else {
        Game.goToNode("ending_bad");
    }
};
// Grant experience to a character and manage level-ups
Game.gainXP = function(char, xp) {
    char.xp += xp;
    while (char.xp >= char.level * 100) {
        char.xp -= char.level * 100;
        char.level += 1;
        // Increase stats on level up based on class growth
        var gains = Game.classes[char.class].levelUp;
        for (var stat in gains) {
            if (stat === 'maxHP') { char.maxHP += gains[stat]; char.HP += gains[stat]; }
            else if (stat === 'maxMana') { char.maxMana += gains[stat]; char.mana += gains[stat]; }
            else if (stat === 'maxStamina') { char.maxStamina += gains[stat]; char.stamina += gains[stat]; }
            else if (stat === 'attack') { char.attack += gains[stat]; }
            else if (stat === 'defense') { char.defense += gains[stat]; }
            else if (stat === 'magic') { char.magic += gains[stat]; }
        }
        // Check the class skill tree for new skills at this level
        var tree = Game.skillTrees[char.class];
        if (tree) {
            tree.forEach(branch => {
                if (branch.level === char.level) {
                    // Automatically learn the first available skill choice for simplicity
                    var newSkillName = branch.choices[0];
                    if (Game.skills[newSkillName]) {
                        char.skills.push(JSON.parse(JSON.stringify(Game.skills[newSkillName])));
                    }
                    // (A more complex implementation could prompt the player to choose between branch.choices)
                }
            });
        }
    }
};
// Animate falling leaves in the forest scene
Game.startForestAnimation = function() {
    var asciiStr = Game.asciiArts["forest"];
    var lines = asciiStr.split("\n");
    var grid = lines.map(line => line.split(''));
    var height = grid.length;
    var width = grid[0].length;
    var leaves = [];
    Game.animationInterval = setInterval(function() {
        // Occasionally add a new falling leaf
        if (Math.random() < 0.3) {
            var x = Math.floor(Math.random() * width);
            leaves.push({ x: x, y: 0 });
        }
        // Update leaf positions
        var newGrid = lines.map(line => line.split(''));
        leaves.forEach(leaf => {
            if (leaf.y < height) {
                newGrid[leaf.y][leaf.x] = '*';
            }
            leaf.y += 1;
        });
        // Remove leaves that have fallen off the bottom
        leaves = leaves.filter(l => l.y < height);
        // Update ASCII art display
        var asciiEl = document.getElementById('asciiArt');
        asciiEl.textContent = newGrid.map(row => row.join('')).join("\n");
    }, 400);
};
// Animate torchlight flicker in the dungeon scene
Game.startTorchFlicker = function() {
    var asciiEl = document.getElementById('asciiArt');
    Game.flickerInterval = setInterval(function() {
        asciiEl.classList.toggle('flicker');
    }, 200);
};
// Begin game when page is loaded
window.onload = function() {
    Game.init();
    Game.updateRiskMeter(0);
};
