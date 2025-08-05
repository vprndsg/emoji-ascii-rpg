var Game = {
    // Game state and data structures
    playerParty: [],        // array of player character objects
    enemies: [],            // array of current enemies in combat
    inventory: [],          // array of item objects
    quests: [],             // quest objects {name, description, status}
    inCombat: false,
    currentNode: null,
    animationInterval: null,   // for ascii animations
    flickerInterval: null,
    mapQuestStarted: false,
    map: null,
    playerLocation: {x:0, y:0},
    // Data: Classes
    classes: {},
    // Data: Skills
    skills: {},
    // Data: ASCII art library
    asciiArts: {},
    // Data: Story nodes
    story: {},
    // Initialize game
    init: function() {
        // Define classes with base stats, starting gear, etc.
        Game.classes = {
            "Warrior": {
                baseStats: {maxHP: 100, maxMana: 0, maxStamina: 50, attack: 10, defense: 5, magic: 0},
                // initial skills and progression
                initialSkills: ["Slash"],
            },
            "Mage": {
                baseStats: {maxHP: 60, maxMana: 100, maxStamina: 0, attack: 5, defense: 2, magic: 10},
                initialSkills: ["Fireball", "Heal"],
            },
            "Rogue": {
                baseStats: {maxHP: 80, maxMana: 20, maxStamina: 80, attack: 8, defense: 3, magic: 0},
                initialSkills: ["Stab"],
            },
            "Ranger": {
                baseStats: {maxHP: 70, maxMana: 30, maxStamina: 70, attack: 9, defense: 3, magic: 2},
                initialSkills: ["Snipe"],
            },
            "Paladin": {
                baseStats: {maxHP: 90, maxMana: 50, maxStamina: 30, attack: 9, defense: 5, magic: 5},
                initialSkills: ["Slash", "Heal"],
            }
        };
        // Level up stat gains for classes
        Game.classes.Warrior.levelUp = {maxHP: 20, maxMana: 0, maxStamina: 10, attack: 3, defense: 2, magic: 0};
        Game.classes.Mage.levelUp    = {maxHP: 10, maxMana: 20, maxStamina: 0, attack: 1, defense: 1, magic: 3};
        Game.classes.Rogue.levelUp   = {maxHP: 15, maxMana: 5, maxStamina: 15, attack: 2, defense: 1, magic: 0};
        Game.classes.Ranger.levelUp  = {maxHP: 14, maxMana: 8, maxStamina: 14, attack: 2, defense: 1, magic: 1};
        Game.classes.Paladin.levelUp = {maxHP: 18, maxMana: 10, maxStamina: 5, attack: 2, defense: 2, magic: 1};
        // Define skills
        Game.skills = {
            // Physical attacks
            "Slash": { name: "Slash", target: "enemy", type: "physical", power: 1.0, cost: 0, costType: null, cooldown: 0, description: "Basic sword attack." },
            "Stab":  { name: "Stab", target: "enemy", type: "physical", power: 1.0, cost: 0, costType: null, cooldown: 0, description: "Quick dagger stab." },
            "Power Strike": { name: "Power Strike", target: "enemy", type: "physical", power: 1.5, cost: 10, costType: "stamina", cooldown: 2, description: "Heavy attack dealing 150% damage." },
            "Whirlwind": { name: "Whirlwind", target: "all-enemies", type: "physical", power: 1.0, cost: 20, costType: "stamina", cooldown: 3, description: "Attack all enemies at once." },
            // Defensive / buff
            "Shield Block": { name: "Shield Block", target: "self", type: "buff", effect: {stat:"defense", increase:5, duration:2}, cost: 5, costType: "stamina", cooldown: 2, description: "Raise defense for a short time." },
            "Invisibility": { name: "Invisibility", target: "self", type: "buff", effect: {stat:"evasion", increase:100, duration:2}, cost: 10, costType: "stamina", cooldown: 5, description: "Become hard to target for a short time." },
            // Magic attacks
            "Fireball": { name: "Fireball", target: "enemy", type: "magic", power: 1.2, cost: 15, costType: "mana", cooldown: 1, description: "Hurl a fireball for magic damage." },
            "Ice Shard": { name: "Ice Shard", target: "enemy", type: "magic", power: 1.0, cost: 10, costType: "mana", cooldown: 1, description: "Launch an ice shard at enemy." },
            "Lightning": { name: "Lightning", target: "enemy", type: "magic", power: 1.5, cost: 20, costType: "mana", cooldown: 2, description: "Strike enemy with lightning bolt." },
            "Meteor": { name: "Meteor", target: "all-enemies", type: "magic", power: 1.2, cost: 30, costType: "mana", cooldown: 5, description: "Call a meteor to hit all enemies." },
            // Healing
            "Heal": { name: "Heal", target: "ally", type: "heal", power: 0.5, cost: 10, costType: "mana", cooldown: 1, description: "Heal an ally moderately." },
            "Mass Heal": { name: "Mass Heal", target: "all-allies", type: "heal", power: 0.3, cost: 30, costType: "mana", cooldown: 3, description: "Heal the whole party." },
            // Special skills
            "Berserk": { name: "Berserk", target: "self", type: "buff", effect: {stat:"attack", increase:5, duration:3}, cost: 0, costType: null, cooldown: 5, description: "Increase attack for a short duration." },
            "Taunt": { name: "Taunt", target: "enemy", type: "debuff", effect: {stat:"attack", increase:-3, duration:2}, cost: 0, costType: null, cooldown: 3, description: "Provoke an enemy to lower its attack." },
            "Holy Light": { name: "Holy Light", target: "ally", type: "heal", power: 0.8, cost: 15, costType: "mana", cooldown: 2, description: "Heal an ally with holy power." },
            "Smite": { name: "Smite", target: "enemy", type: "magic", power: 1.0, cost: 10, costType: "mana", cooldown: 1, description: "Strike enemy with holy energy." },
            // Rogue skills
            "Poison Dart": { name: "Poison Dart", target: "enemy", type: "physical", power: 0.8, cost: 5, costType: "stamina", cooldown: 1, status: {type:"poison", damage:5, duration:3}, description: "Attack with a poisoned dart." },
            "Multi Shot": { name: "Multi Shot", target: "all-enemies", type: "physical", power: 0.8, cost: 15, costType: "stamina", cooldown: 3, description: "Shoot arrows at all enemies." },
            "Snipe": { name: "Snipe", target: "enemy", type: "physical", power: 1.3, cost: 10, costType: "stamina", cooldown: 2, description: "Precise long-range attack." },
            "Backstab": { name: "Backstab", target: "enemy", type: "physical", power: 2.0, cost: 5, costType: "stamina", cooldown: 2, description: "High damage attack from shadows (if first attack)." }
        };
        // Skill tree progression (branching choices at certain levels)
        Game.skillTrees = {
            "Warrior": [
                { level: 3, choices: ["Power Strike", "Shield Block"] },
                { level: 5, choices: ["Whirlwind", "Berserk"] }
            ],
            "Mage": [
                { level: 3, choices: ["Ice Shard", "Lightning"] },
                { level: 5, choices: ["Mass Heal", "Meteor"] }
            ],
            "Rogue": [
                { level: 3, choices: ["Poison Dart", "Backstab"] },
                { level: 5, choices: ["Multi Shot", "Invisibility"] }
            ],
            "Ranger": [
                { level: 3, choices: ["Snipe", "Poison Dart"] },
                { level: 5, choices: ["Multi Shot", "Invisibility"] }
            ],
            "Paladin": [
                { level: 3, choices: ["Holy Light", "Smite"] }
            ]
        };
        // ASCII art definitions
        Game.asciiArts = {
            "village": 
`+--------+       
|  __    |      ____
| |  |   |     /    \\ 
| |__|   |    |      |
|        |    | [__] |   A peaceful village.
+--------+    |      |
             |______|`,
            "forest": 
`   ^  ^^   ^^^    ^^^^
  ^^^^  ^^^  ^^   ^^^  ^ 
   ||  ||||   ||   ||   
   ||  ||||   ||   ||   `,
            "dungeon": 
`########### 
#         # 
#   *     #    A dark dungeon corridor.
#         # 
###########`,
            "dragon": 
`                   __====-_  _-====__
         _--^^^#####//      \\#####^^^--_
      _-^##########// (    ) \\##########^-_
     -############//  |\^^/|  \\############-
   _/############//   (@::@)   \\############\_
  /#############((     \\//     ))#############\
 -###############\\     )(      //###############-
 -#################\\   **     //#################-
 -###################\\       //###################-
 _#/|##########|\\#######\_/#######/|##########|\\#_
 |/ |#/#/#\/#\/  \#/##/\   /\##/\#/\/#/#/#| \|
  \|/  V  V    V  \|  \| | |/  \|/  V   V   V  \|
   \|         \|   | |  | |/   |/      \|      \|`,
            "tombstone": 
`   _____
  /     \\ 
 | R.I.P |
 |       |
 |_______|`
        };
        // Define story nodes
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
                    { text: "Listen to bard", next: "tavernBard" },
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
                loot: { item: { name: "Amulet of Quickness", type: "accessory", effect: {speed:5} } },
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
                // If Aria is present, her quest overlaps with main quest in ruins
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
                // start torch flicker animation here perhaps
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
                text: "You take the side corridor. You stumble into a group of skeletons!" ,
                combat: { enemies: ["Skeleton", "Skeleton"], next: "afterSkeletons" }
            },
            afterSkeletons: {
                text: "After defeating the skeletons, you find another way to the treasure room." ,
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
                // complete quest if present
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
                // The knowledge gained in future allows alternate ending
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
                // if knowledge gained from future, you can break curse, else it fails
                choices: [
                    { text: "Invoke the dragon's true name", next: "ending_curseLifted" },
                    { text: "(You don't know his name)", next: "dragonAnger" }
                ]
            },
            dragonAnger: {
                text: "Without the knowledge of the dragon's name, your attempt fails. The dragon roars in anger and attacks!",
                next: "finalBattle" // lead to combat anyway
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
            }
        };
        // Start game at the beginning node
        Game.chooseClass();
    },
    // Start or reset game
    startGame: function(className) {
        // Clear any existing state
        Game.playerParty = [];
        Game.inventory = [];
        Game.quests = [];
        // Create main character (player) with chosen class
        var player = Game.createCharacter(className || "Warrior", "Hero");
        Game.playerParty.push(player);
        // Give starting gear: a basic sword and armor
        var starterSword = { name: "Rusty Sword", type: "weapon", attack: 5 };
        var starterArmor = { name: "Cloth Armor", type: "armor", defense: 2 };
        Game.inventory.push(starterSword, starterArmor);
        Game.equipItem(player, starterSword);
        Game.equipItem(player, starterArmor);
        // Start at story beginning
        Game.goToNode("start");
    },
    // Present class selection to the player
    chooseClass: function() {
        Game.closePanels();
        updateRiskMeter(0);
        document.getElementById('combatView').style.display = 'none';
        document.getElementById('storyView').style.display = 'block';
        var asciiEl = document.getElementById('asciiArt');
        asciiEl.textContent = "";
        var textEl = document.getElementById('textDisplay');
        textEl.innerText = "Choose your class:";
        var choicesEl = document.getElementById('choiceButtons');
        choicesEl.innerHTML = "";
        Object.keys(Game.classes).forEach(function(cls) {
            var btn = document.createElement('button');
            btn.textContent = cls;
            btn.onclick = function() { Game.startGame(cls); };
            choicesEl.appendChild(btn);
        });
    },
    // Utility: create a character object given class template and name
    createCharacter: function(className, charName) {
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
            skills: [],    // learned skills
            weapon: null,
            armor: null,
            accessory: null,
            statusEffects: []  // e.g. poison, buffs, etc
        };
        // Assign initial skills
        cls.initialSkills.forEach(skillName => {
            if(Game.skills[skillName]) {
                char.skills.push(JSON.parse(JSON.stringify(Game.skills[skillName])));
            }
        });
        return char;
    },
    // Equip an item to a character
    equipItem: function(char, item) {
        var slot;
        if(item.type === "weapon") slot = "weapon";
        else if(item.type === "armor") slot = "armor";
        else if(item.type === "accessory") slot = "accessory";
        if(!slot) return false;
        // remove item from inventory
        var idx = Game.inventory.indexOf(item);
        if(idx >= 0) Game.inventory.splice(idx, 1);
        // if something already equipped in that slot, unequip it (put back to inventory)
        if(char[slot]) {
            Game.inventory.push(char[slot]);
        }
        // equip new item
        char[slot] = item;
        // Recalculate stats
        Game.updateStats(char);
        return true;
    },
    // Recalculate final stats for char based on base and equipment
    updateStats: function(char) {
        // Start from base
        var base = Game.classes[char.class].baseStats;
        char.attack = base.attack;
        char.defense = base.defense;
        char.magic = base.magic;
        // Add any stat boosts from level ups (if we had stored, but we didn't separate base vs current beyond equipment)
        // Simpler: we will update base stats on level up directly. So baseStats is just initial at level1.
        // So char.attack etc already includes any level up increments.
        // Now add equipment bonuses:
        ["weapon","armor","accessory"].forEach(slot => {
            if(char[slot]) {
                var it = char[slot];
                if(it.attack) char.attack += it.attack;
                if(it.defense) char.defense += it.defense;
                if(it.magic) char.magic += it.magic;
                if(it.hp) {
                    char.maxHP += it.hp;
                    char.HP += it.hp; // increase current HP by same amount to keep relative (assuming equipping mid-game)
                }
                if(it.mana) {
                    char.maxMana += it.mana;
                    char.mana += it.mana;
                }
                // add other stat types if present, e.g. dex, etc if we had them
            }
        });
        // Optionally check set bonuses:
        // If weapon and armor are part of same set, apply bonus
        if(char.weapon && char.armor && char.weapon.set && char.weapon.set === char.armor.set) {
            // example: Ancient set bonus
            if(char.weapon.set === "Ancient") {
                char.attack += 5;
                char.defense += 5;
            }
        }
    },
    // Add item to inventory
    addItem: function(item) {
        Game.inventory.push(item);
        // If item is part of quest objective, check quest completion
        // Check all quests waiting for this item
        Game.quests.forEach(q => {
            if(q.status === "ongoing" && q.targetItem && q.targetItem === item.name) {
                // complete the quest if target item acquired
                Game.completeQuest(q.name);
            }
        });
    },
    // Quest handling
    addQuest: function(name, description) {
        Game.quests.push({ name: name, description: description, status: "ongoing" });
        // Possibly update journal display if open
    },
    completeQuest: function(name) {
        var q = Game.quests.find(q => q.name === name);
        if(q) q.status = "completed";
    },
    // Generate a random item (loot drop)
    generateItem: function() {
        // Define some prefix, base, suffix for item generation
        var prefixes = [
            { name: "Iron", attack:1, defense:1, magic:0 },
            { name: "Steel", attack:2, defense:2, magic:0 },
            { name: "Flaming", attack:2, magic:2 },
            { name: "Shadow", attack:1, defense:1, magic:3 }
        ];
        var bases = [
            { name: "Sword", type: "weapon", attack: 5 },
            { name: "Axe", type: "weapon", attack: 6 },
            { name: "Staff", type: "weapon", attack: 3, magic:3 },
            { name: "Bow", type: "weapon", attack: 4 },
            { name: "Dagger", type: "weapon", attack: 3 },
            { name: "Armor", type: "armor", defense: 5 },
            { name: "Shield", type: "armor", defense: 4 },
            { name: "Ring", type: "accessory", attack:1, defense:1, magic:1 }
        ];
        var suffixes = [
            { name: "of Power", attack:3 },
            { name: "of Defense", defense:3 },
            { name: "of Magic", magic:3 },
            { name: "of Vitality", hp: 20 }
        ];
        var roll = Math.random();
        var tier;
        if(roll < 0.5) tier = 0;
        else if(roll < 0.8) tier = 1;
        else if(roll < 0.95) tier = 2;
        else if(roll < 0.99) tier = 3;
        else tier = 4;
        var baseItem = JSON.parse(JSON.stringify(bases[Math.floor(Math.random()*bases.length)]));
        var itemName = baseItem.name;
        // apply prefix/suffix based on tier
        if(tier >= 1) {
            var pre = prefixes[Math.floor(Math.random()*prefixes.length)];
            itemName = pre.name + " " + itemName;
            // add stats from prefix
            for(var stat in pre) {
                if(stat !== 'name') {
                    baseItem[stat] = (baseItem[stat] || 0) + pre[stat];
                }
            }
        }
        if(tier >= 2) {
            var suf = suffixes[Math.floor(Math.random()*suffixes.length)];
            itemName = itemName + " " + suf.name;
            for(var stat in suf) {
                if(stat !== 'name') {
                    baseItem[stat] = (baseItem[stat] || 0) + suf[stat];
                }
            }
        }
        baseItem.name = itemName;
        // If tier 3, boost stats further
        if(tier === 3) {
            if(baseItem.attack) baseItem.attack += 2;
            if(baseItem.defense) baseItem.defense += 2;
            if(baseItem.magic) baseItem.magic += 2;
            baseItem.name = "Epic " + baseItem.name;
        }
        // Tier 4: legendary - pick unique item
        if(tier === 4) {
            var legendaries = [
                { name: "Excalibur", type: "weapon", attack: 20, magic: 5 },
                { name: "Dragon Scale Armor", type: "armor", defense: 15, hp: 50 },
                { name: "Staff of Eternity", type: "weapon", attack: 5, magic: 15, mana: 30 }
            ];
            baseItem = legendaries[Math.floor(Math.random()*legendaries.length)];
        }
        return baseItem;
    },
    // Main function to navigate story nodes
    goToNode: function(nodeId) {
        // Clear any ongoing animations
        if(Game.animationInterval) {
            clearInterval(Game.animationInterval);
            Game.animationInterval = null;
        }
        if(Game.flickerInterval) {
            clearInterval(Game.flickerInterval);
            Game.flickerInterval = null;
        }
        // Hide combat view if it was open
        document.getElementById('combatView').style.display = 'none';
        document.getElementById('storyView').style.display = 'block';
        // Close any open panels
        Game.closePanels();
        var node = Game.story[nodeId];
        Game.currentNode = node;
        // Update risk meter and visuals for this node
        updateRiskMeter(node.risk || 0);
        // Display ascii art or trigger cutscenes
        var asciiEl = document.getElementById('asciiArt');
        if(node.cutscene) {
            asciiEl.textContent = "";
            if(node.cutscene === "villain") {
                playVillainCutscene();
            } else if(node.cutscene === "romantic") {
                playRomanticCutscene();
            }
        } else if(node.ascii && Game.asciiArts[node.ascii]) {
            asciiEl.textContent = Game.asciiArts[node.ascii];
        } else {
            asciiEl.textContent = "";
        }
        // Display text (with possible typewriter effect if cinematic)
        var textEl = document.getElementById('textDisplay');
        textEl.innerHTML = ""; // clear previous text
        // Check if node has a puzzle or combat immediate
        if(node.combat) {
            // Trigger combat mode
            Game.startCombat(node.combat.enemies, node.combat.next, node.combat.fail);
            return;
        }
        if(node.puzzle) {
            // Display puzzle text and input accordingly
            textEl.innerText = node.text;
            if(node.puzzle.type === "reaction") {
                // Reaction time puzzle
                var btn = document.createElement('button');
                btn.textContent = "Start";
                btn.onclick = function() {
                    // Remove start button
                    btn.style.display = 'none';
                    // Random delay then show Tap button
                    var delay = Math.random() * 2000 + 1000; // 1-3 seconds
                    setTimeout(function() {
                        textEl.innerText = "Tap NOW!!!";
                        var tapBtn = document.createElement('button');
                        tapBtn.textContent = "Tap!";
                        var startTime = Date.now();
                        tapBtn.onclick = function() {
                            var reactionTime = Date.now() - startTime;
                            textEl.innerText = "";
                            tapBtn.remove();
                            if(reactionTime <= node.puzzle.threshold) {
                                // success
                                Game.goToNode(node.success);
                            } else {
                                // fail
                                Game.goToNode(node.fail);
                            }
                        };
                        document.getElementById('choiceButtons').innerHTML = "";
                        document.getElementById('choiceButtons').appendChild(tapBtn);
                    }, delay);
                };
                document.getElementById('choiceButtons').innerHTML = "";
                document.getElementById('choiceButtons').appendChild(btn);
            }
            else if(node.puzzle.type === "lockpick") {
                // Lock picking puzzle
                var secret = Math.floor(Math.random() * node.puzzle.range) + 1;
                var attempts = node.puzzle.tries;
                var input = document.createElement('input');
                input.type = 'number';
                input.min = 1;
                input.max = node.puzzle.range;
                var submit = document.createElement('button');
                submit.textContent = "Guess";
                var feedback = document.createElement('div');
                feedback.id = 'puzzleFeedback';
                submit.onclick = function() {
                    var guess = parseInt(input.value);
                    if(isNaN(guess)) return;
                    if(guess === secret) {
                        feedback.textContent = "Unlocked!";
                        // proceed to success node
                        Game.goToNode(node.success);
                    } else {
                        attempts -= 1;
                        if(guess < secret) {
                            feedback.textContent = "Too low."; 
                        } else {
                            feedback.textContent = "Too high."; 
                        }
                        if(attempts <= 0) {
                            // fail
                            Game.goToNode(node.fail);
                        } else {
                            feedback.textContent += " Try again ("+attempts+" attempts left)."; 
                        }
                    }
                };
                document.getElementById('choiceButtons').innerHTML = "";
                document.getElementById('choiceButtons').appendChild(input);
                document.getElementById('choiceButtons').appendChild(submit);
                document.getElementById('choiceButtons').appendChild(feedback);
            }
            return;
        }
        // Normal story text (no combat/puzzle)
        textEl.innerText = node.text;
        // If node has recruit (ally joining)
        if(node.recruit) {
            var ally = Game.createCharacter(node.recruit.class, node.recruit.name);
            Game.playerParty.push(ally);
        }
        // If node adds quest
        if(node.quest) {
            Game.addQuest(node.quest.name, node.quest.description);
        }
        // If node has loot (specific item)
        if(node.loot) {
            var lootItem;
            if(node.loot.item) {
                lootItem = node.loot.item;
            } else if(node.loot.random) {
                lootItem = Game.generateItem();
            }
            if(lootItem) {
                Game.addItem(lootItem);
                // Show loot info
                textEl.innerText += "\nYou obtained " + lootItem.name + "!";
            }
        }
        // If node triggers quest completion
        if(node.completeQuest) {
            Game.completeQuest(node.completeQuest);
            textEl.innerText += "\n(Quest '"+node.completeQuest+"' completed!)";
        }
        // If node grants special knowledge (like dragon name)
        if(node.knowledge) {
            Game.knowledge = Game.knowledge || {};
            Game.knowledge[node.knowledge] = true;
        }
        // Trigger NPC dialogue if defined
        if(node.npc === 'blacksmith' && typeof blacksmith !== 'undefined') {
            blacksmith.talk();
        }
        // If node has ending, end game (could just display text and stop)
        if(node.ending) {
            // Display ending text (already set), and maybe provide option to restart
            document.getElementById('choiceButtons').innerHTML = "";
            var restartBtn = document.createElement('button');
            restartBtn.textContent = "Restart Game";
            restartBtn.onclick = function(){ Game.chooseClass(); };
            document.getElementById('choiceButtons').appendChild(restartBtn);
            return;
        }
        // Display choices if any
        var choicesEl = document.getElementById('choiceButtons');
        choicesEl.innerHTML = ""; // clear old
        if(node.choices) {
            node.choices.forEach(choice => {
                var btn = document.createElement('button');
                btn.textContent = choice.text;
                btn.onclick = function() {
                    Game.goToNode(choice.next);
                };
                choicesEl.appendChild(btn);
            });
        }
        // Start ASCII animations if needed based on node environment
        if(node.ascii === "forest") {
            Game.startForestAnimation();
        }
        if(node.ascii === "dungeon") {
            Game.startTorchFlicker();
        }
    },
    // Start a combat given enemy types array
    startCombat: function(enemyTypes, nextNode, failNode) {
        // Setup enemies
        Game.inCombat = true;
        updateRiskMeter(80);
        Game.enemies = [];
        enemyTypes.forEach(type => {
            Game.enemies.push(Game.createEnemy(type));
        });
        // Show combat view
        document.getElementById('storyView').style.display = 'none';
        document.getElementById('combatView').style.display = 'block';
        document.getElementById('combatLog').innerText = "Combat starts!"; 
        document.getElementById('combatActions').innerHTML = ""; 
        // Save where to go after win or lose
        Game.combatNextNode = nextNode;
        Game.combatFailNode = failNode;
        // Begin player turn sequence
        Game.currentTurnCharIndex = 0;
        Game.playerTurn(Game.currentTurnCharIndex);
    },
    // Create an enemy object by type
    createEnemy: function(type) {
        var enemyData;
        if(type === "Goblin") {
            enemyData = { name: "Goblin", maxHP: 30, attack: 5, defense: 1, magic: 0, behavior: "aggressive", xp: 20 };
        } else if(type === "Skeleton") {
            enemyData = { name: "Skeleton", maxHP: 40, attack: 6, defense: 3, magic: 0, behavior: "aggressive", xp: 25 };
        } else if(type === "Guard") {
            enemyData = { name: "Guard", maxHP: 50, attack: 8, defense: 4, magic: 0, behavior: "sniper", xp: 30 };
        } else if(type === "Dragon") {
            enemyData = { name: "Dragon", maxHP: 200, attack: 15, defense: 5, magic: 5, behavior: "boss", xp: 100 };
        } else {
            // default generic enemy
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
    },
    // Display and handle a player's turn (character at index)
    playerTurn: function(index) {
        // If index beyond party, go to enemy phase
        if(index >= Game.playerParty.length) {
            // All player turns done, proceed to enemies
            Game.enemyTurn(0);
            return;
        }
        // If this character is dead, skip to next
        var char = Game.playerParty[index];
        if(char.HP <= 0) {
            Game.playerTurn(index+1);
            return;
        }
        // Display available actions for char
        var actionsEl = document.getElementById('combatActions');
        actionsEl.innerHTML = ""; 
        // Show character name and prompt
        var prompt = document.createElement('div');
        prompt.textContent = char.name + "'s turn: Choose action:";
        actionsEl.appendChild(prompt);
        // List skills
        char.skills.forEach((skill, idx) => {
            // Check cooldown and resource
            var canUse = true;
            if(skill.costType === "mana" && char.mana < skill.cost) canUse = false;
            if(skill.costType === "stamina" && char.stamina < skill.cost) canUse = false;
            if(skill.currentCooldown && skill.currentCooldown > 0) canUse = false;
            var btn = document.createElement('button');
            btn.textContent = skill.name;
            btn.disabled = !canUse;
            btn.onclick = function() {
                // handle skill usage
                Game.useSkill(char, skill);
            };
            actionsEl.appendChild(btn);
        });
        // Item usage option
        if(Game.inventory.some(item => item.type !== 'weapon' && item.type !== 'armor')) {
            var itemBtn = document.createElement('button');
            itemBtn.textContent = "Use Item";
            itemBtn.onclick = function() {
                // Open inventory panel for item usage in combat
                Game.showInventory(true, index);
            };
            actionsEl.appendChild(itemBtn);
        }
    },
    // Handle using a skill by a character
    useSkill: function(char, skill) {
        // If skill requires target
        if(skill.target === 'enemy') {
            // list enemies to choose
            Game.displayTargetOptions(char, skill, 'enemy');
        } else if(skill.target === 'ally') {
            Game.displayTargetOptions(char, skill, 'ally');
        } else {
            // target self or all etc
            Game.executeSkill(char, skill, null);
        }
    },
    // Display target selection buttons
    displayTargetOptions: function(char, skill, targetType) {
        var actionsEl = document.getElementById('combatActions');
        actionsEl.innerHTML = "Select target:"; 
        if(targetType === 'enemy') {
            Game.enemies.forEach((enemy, idx) => {
                if(enemy.HP > 0) {
                    var btn = document.createElement('button');
                    btn.textContent = enemy.name + " (HP " + enemy.HP + ")";
                    btn.onclick = function() {
                        Game.executeSkill(char, skill, enemy);
                    };
                    actionsEl.appendChild(btn);
                }
            });
        } else if(targetType === 'ally') {
            Game.playerParty.forEach((ally, idx) => {
                if(ally.HP > 0) {
                    var btn = document.createElement('button');
                    btn.textContent = ally.name + " (HP " + ally.HP + ")";
                    btn.onclick = function() {
                        Game.executeSkill(char, skill, ally);
                    };
                    actionsEl.appendChild(btn);
                }
            });
        }
    },
    // Execute a skill on a target (or targets)
    executeSkill: function(char, skill, target) {
        var logEl = document.getElementById('combatLog');
        // Spend resources
        if(skill.costType === 'mana') {
            char.mana -= skill.cost;
        }
        if(skill.costType === 'stamina') {
            char.stamina -= skill.cost;
        }
        // Apply cooldown
        skill.currentCooldown = skill.cooldown;
        // Execute effect
        if(skill.type === 'physical' || skill.type === 'magic') {
            var damage = 0;
            if(skill.type === 'physical') {
                damage = Math.floor((char.attack) * skill.power - (target.defense));
            } else if(skill.type === 'magic') {
                damage = Math.floor((char.magic) * skill.power - (target.defense));
            }
            if(damage < 1) damage = 1;
            // If AoE
            if(skill.target === 'all-enemies') {
                logEl.innerText += "\n" + char.name + " uses " + skill.name + "!";
                Game.enemies.forEach(enemy => {
                    if(enemy.HP > 0) {
                        var dmg = Math.floor((skill.type==='physical'?char.attack:char.magic) * skill.power - enemy.defense);
                        if(dmg < 1) dmg = 1;
                        enemy.HP -= dmg;
                        logEl.innerText += "\n> " + enemy.name + " takes " + dmg + " damage.";
                        if(enemy.HP <= 0) {
                            logEl.innerText += " " + enemy.name + " is defeated.";
                        }
                    }
                });
            } else {
                // single target
                logEl.innerText += "\n" + char.name + " uses " + skill.name + " on " + target.name + " for " + damage + " damage.";
                target.HP -= damage;
                if(target.HP <= 0) {
                    logEl.innerText += " " + target.name + " is defeated.";
                }
            }
            // If skill has status effect (like poison)
            if(skill.status && target && target.HP > 0) {
                target.statusEffects.push({ type: skill.status.type, damage: skill.status.damage, duration: skill.status.duration });
                logEl.innerText += "\n" + target.name + " is " + skill.status.type + "ed!";
            }
        } else if(skill.type === 'heal') {
            if(skill.target === 'all-allies') {
                logEl.innerText += "\n" + char.name + " casts " + skill.name + "!";
                Game.playerParty.forEach(p => {
                    if(p.HP > 0) {
                        var heal = Math.floor(p.maxHP * skill.power);
                        p.HP = Math.min(p.HP + heal, p.maxHP);
                        logEl.innerText += "\n> " + p.name + " is healed for " + heal + ".";
                    }
                });
            } else if(target) {
                var heal = Math.floor(target.maxHP * skill.power);
                target.HP = Math.min(target.HP + heal, target.maxHP);
                logEl.innerText += "\n" + char.name + " casts " + skill.name + " on " + target.name + ", healing " + heal + ".";
            }
        } else if(skill.type === 'buff') {
            if(skill.effect && skill.target === 'self') {
                // apply buff to char
                char.statusEffects.push({ type: 'buff', stat: skill.effect.stat, increase: skill.effect.increase, duration: skill.effect.duration });
                logEl.innerText += "\n" + char.name + " uses " + skill.name + ", gaining +" + skill.effect.increase + " " + skill.effect.stat + ".";
                // Immediately apply stat increase for now
                if(skill.effect.stat === 'attack') char.attack += skill.effect.increase;
                if(skill.effect.stat === 'defense') char.defense += skill.effect.increase;
            }
        } else if(skill.type === 'debuff' && target) {
            if(skill.effect) {
                target.statusEffects.push({ type: 'debuff', stat: skill.effect.stat, increase: skill.effect.increase, duration: skill.effect.duration });
                logEl.innerText += "\n" + char.name + " uses " + skill.name + " on " + target.name + ", lowering their " + skill.effect.stat + ".";
                if(skill.effect.stat === 'attack') target.attack += skill.effect.increase; // increase is negative if lowering
                if(skill.effect.stat === 'defense') target.defense += skill.effect.increase;
            }
        }
        // End of this char's action. Check if all enemies defeated
        if(Game.enemies.every(e => e.HP <= 0)) {
            Game.winCombat();
            return;
        }
        // Move to next player's turn
        Game.playerTurn(++Game.currentTurnCharIndex);
    },
    // Process enemies' turns starting from index
    enemyTurn: function(index) {
        if(index >= Game.enemies.length) {
            // Enemy turn done, new round or victory check
            // Remove dead enemies from array for cleanliness
            Game.enemies = Game.enemies.filter(e => e.HP > 0);
            if(Game.enemies.length === 0) {
                Game.winCombat();
                return;
            }
            // End of round: also reduce any cooldowns and status durations for players
            Game.playerParty.forEach(char => {
                char.skills.forEach(skill => {
                    if(skill.currentCooldown && skill.currentCooldown > 0) {
                        skill.currentCooldown -= 1;
                    }
                });
                // decrement status effects durations
                char.statusEffects = char.statusEffects.filter(status => {
                    status.duration -= 1;
                    // if buff expired, remove stat increase
                    if(status.duration <= 0) {
                        if(status.type === 'buff') {
                            if(status.stat === 'attack') char.attack -= status.increase;
                            if(status.stat === 'defense') char.defense -= status.increase;
                        }
                        return false;
                    }
                    return true;
                });
            });
            // decrement enemy statuses too
            Game.enemies.forEach(enemy => {
                enemy.statusEffects = enemy.statusEffects.filter(status => {
                    if(status.type === 'poison') {
                        // apply poison damage
                        enemy.HP -= status.damage;
                        var logEl = document.getElementById('combatLog');
                        logEl.innerText += "\n" + enemy.name + " suffers " + status.damage + " poison damage.";
                    }
                    status.duration -= 1;
                    return status.duration > 0;
                });
            });
            // Check if any enemy died from poison
            Game.enemies.forEach(enemy => {
                if(enemy.HP <= 0) {
                    var logEl = document.getElementById('combatLog');
                    logEl.innerText += "\n" + enemy.name + " succumbs to poison.";
                }
            });
            Game.enemies = Game.enemies.filter(e => e.HP > 0);
            if(Game.enemies.length === 0) {
                Game.winCombat();
                return;
            }
            // Next round: back to players
            Game.currentTurnCharIndex = 0;
            Game.playerTurn(Game.currentTurnCharIndex);
            return;
        }
        var enemy = Game.enemies[index];
        if(enemy.HP > 0) {
            enemy.turnCount += 1;
            var logEl = document.getElementById('combatLog');
            if(enemy.behavior === 'boss' && enemy.turnCount % 3 === 0) {
                // Boss special attack (e.g. AOE fire breath)
                logEl.innerText += "\n" + enemy.name + " breathes fire on the entire party!";
                Game.playerParty.forEach(char => {
                    if(char.HP > 0) {
                        var dmg = Math.floor(enemy.attack * 1.2 - char.defense);
                        if(dmg < 1) dmg = 1;
                        char.HP -= dmg;
                        logEl.innerText += "\n> " + char.name + " takes " + dmg + " damage from flames.";
                        if(char.HP <= 0) {
                            logEl.innerText += " " + char.name + " falls!";
                        }
                    }
                });
            } else if(enemy.behavior === 'support') {
                // If any ally (including itself) under half HP, heal them, else attack
                var target = Game.enemies.filter(e=>e.HP>0).reduce((lowest, e) => e.HP < lowest.HP ? e : lowest, enemy);
                if(target.HP < target.maxHP/2 && Math.random() < 0.7) {
                    // heal target
                    var heal = 10;
                    target.HP = Math.min(target.HP + heal, target.maxHP);
                    logEl.innerText += "\n" + enemy.name + " chants a spell to heal " + target.name + " for " + heal + " HP.";
                } else {
                    // attack random player
                    var tgt = Game.playerParty.filter(c=>c.HP>0)[Math.floor(Math.random()*Game.playerParty.filter(c=>c.HP>0).length)];
                    if(tgt) {
                        var dmg = Math.floor(enemy.attack - tgt.defense);
                        if(dmg < 1) dmg = 1;
                        tgt.HP -= dmg;
                        logEl.innerText += "\n" + enemy.name + " attacks " + tgt.name + " for " + dmg + ".";
                        if(tgt.HP <= 0) {
                            logEl.innerText += " " + tgt.name + " has fallen.";
                        }
                    }
                }
            } else {
                // aggressive or sniper or random behaviors
                var targetPlayer;
                if(enemy.behavior === 'sniper') {
                    // target lowest defense (or HP) player
                    targetPlayer = Game.playerParty.filter(c=>c.HP>0).reduce((min, c) => c.defense < min.defense ? c : min, Game.playerParty[0]);
                } else if(enemy.behavior === 'aggressive') {
                    // target lowest HP player
                    targetPlayer = Game.playerParty.filter(c=>c.HP>0).reduce((min, c) => c.HP < min.HP ? c : min, Game.playerParty[0]);
                } else {
                    // random or default
                    var alivePlayers = Game.playerParty.filter(c=>c.HP>0);
                    targetPlayer = alivePlayers[Math.floor(Math.random()*alivePlayers.length)];
                }
                if(targetPlayer) {
                    var dmg = Math.floor(enemy.attack - targetPlayer.defense);
                    if(dmg < 1) dmg = 1;
                    targetPlayer.HP -= dmg;
                    logEl.innerText += "\n" + enemy.name + " attacks " + targetPlayer.name + " for " + dmg + " damage.";
                    if(targetPlayer.HP <= 0) {
                        logEl.innerText += " " + targetPlayer.name + " has fallen.";
                    }
                }
            }
        }
        // Check if all players dead
        if(Game.playerParty.every(c => c.HP <= 0)) {
            Game.loseCombat();
            return;
        }
        // Next enemy
        Game.enemyTurn(index+1);
    },
    // Win combat handling
    winCombat: function() {
        var logEl = document.getElementById('combatLog');
        logEl.innerText += "\nYou won the battle!";
        // Award XP and possibly loot
        var totalXP = Game.enemies.reduce((sum, e) => sum + (e.xp || 0), 0);
        if(totalXP > 0) {
            logEl.innerText += "\nParty gains " + totalXP + " XP.";
            Game.playerParty.forEach(char => {
                if(char.HP > 0) { // only survivors get xp? We'll give all for simplicity
                    Game.gainXP(char, totalXP);
                }
            });
        }
        // Random loot drop
        if(Game.enemies.some(e => e.name === 'Dragon')) {
            // Guarantee a legendary from final boss
            var legendary = Game.generateItem();
            legendary = Game.generateItem();
            legendary.name = "Legendary " + legendary.name;
            Game.addItem(legendary);
            logEl.innerText += "\nLoot found: " + legendary.name + "!";
        } else if(Math.random() < 0.7) {
            var loot = Game.generateItem();
            Game.addItem(loot);
            logEl.innerText += "\nLoot found: " + loot.name + ".";
        }
        // Resume story after short delay to let player read log
        setTimeout(function() {
            Game.inCombat = false;
            updateRiskMeter(0);
            Game.goToNode(Game.combatNextNode);
        }, 1000);
    },
    // Lose combat handling
    loseCombat: function() {
        var logEl = document.getElementById('combatLog');
        logEl.innerText += "\nYour party has been defeated...";
        // Go to fail node or end game
        Game.inCombat = false;
        updateRiskMeter(0);
        if(Game.combatFailNode) {
            Game.goToNode(Game.combatFailNode);
        } else {
            // If no fail specified, it's game over
            Game.goToNode("ending_bad");
        }
    },
    // Award xp and handle leveling
    gainXP: function(char, xp) {
        char.xp += xp;
        while(char.xp >= char.level * 100) {
            char.xp -= char.level * 100;
            char.level += 1;
            // Increase stats per class growth
            var gains = Game.classes[char.class].levelUp;
            for(var stat in gains) {
                if(stat === 'maxHP') { char.maxHP += gains[stat]; char.HP += gains[stat]; }
                else if(stat === 'maxMana') { char.maxMana += gains[stat]; char.mana += gains[stat]; }
                else if(stat === 'maxStamina') { char.maxStamina += gains[stat]; char.stamina += gains[stat]; }
                else if(stat === 'attack') { char.attack += gains[stat]; }
                else if(stat === 'defense') { char.defense += gains[stat]; }
                else if(stat === 'magic') { char.magic += gains[stat]; }
            }
            // Check skill tree for new skill choices
            var tree = Game.skillTrees[char.class];
            if(tree) {
                tree.forEach(branch => {
                    if(branch.level === char.level) {
                        // Offer choice of skills
                        // Pause progression until choice made
                        var choice1 = branch.choices[0];
                        var choice2 = branch.choices[1];
                        // For simplicity, auto-learn first choice
                        // (Alternatively, could prompt user for choice via UI)
                        char.skills.push(JSON.parse(JSON.stringify(Game.skills[choice1])));
                        // If we wanted to prompt:
                        // TODO: implement UI choice for new skill
                    }
                });
            }
        }
    },
    // Show inventory panel (if inCombat = true, use mode)
    showInventory: function(useMode, activeCharIndex) {
        var panel = document.getElementById('inventoryPanel');
        var content = document.getElementById('inventoryContent');
        content.innerHTML = ""; 
        Game.closePanels();
        // Build inventory list
        Game.inventory.forEach((item, idx) => {
            var entry = document.createElement('div');
            entry.className = 'itemEntry';
            var desc = item.name;
            // basic stats summary
            if(item.attack) desc += " (Atk+"+item.attack+")";
            if(item.defense) desc += " (Def+"+item.defense+")";
            if(item.magic) desc += " (Mag+"+item.magic+")";
            entry.textContent = desc + " ";
            // Equip button for gear if not in combat
            if(!useMode && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
                var eqBtn = document.createElement('button');
                eqBtn.textContent = "Equip";
                eqBtn.onclick = (function(it){
                    return function() {
                        // Equip to main character (first party member) or maybe prompt which character
                        // We'll equip to main hero for simplicity
                        Game.equipItem(Game.playerParty[0], it);
                        Game.showInventory(false);
                    };
                })(item);
                entry.appendChild(eqBtn);
            }
            // Use button for consumables
            if(item.type && item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') {
                var useBtn = document.createElement('button');
                useBtn.textContent = "Use";
                useBtn.onclick = (function(it, index){
                    return function() {
                        // If in combat, use on current active char or prompt target?
                        if(useMode) {
                            // In combat mode, apply usage as that character's action
                            // Assume consumable type has an effect: if it's a healing potion etc.
                            // For demonstration, assume any consumable with name containing 'Health' heals HP, 'Mana' restores mana.
                            var char = Game.playerParty[activeCharIndex];
                            if(it.name.toLowerCase().includes('potion')) {
                                if(it.name.toLowerCase().includes('health')) {
                                    var heal = 50;
                                    char.HP = Math.min(char.HP + heal, char.maxHP);
                                    document.getElementById('combatLog').innerText += "\n" + char.name + " uses " + it.name + " and recovers " + heal + " HP.";
                                }
                                if(it.name.toLowerCase().includes('mana')) {
                                    var mana = 50;
                                    char.mana = Math.min(char.mana + mana, char.maxMana);
                                    document.getElementById('combatLog').innerText += "\n" + char.name + " restores " + mana + " Mana using " + it.name + ".";
                                }
                            }
                            // remove item from inventory after use
                            Game.inventory.splice(index, 1);
                            // close inventory and continue combat turn
                            Game.closePanels();
                            // proceed to next character or enemy since action used
                            Game.playerTurn(++Game.currentTurnCharIndex);
                        } else {
                            // out of combat use - just apply effect to main char
                            var mainChar = Game.playerParty[0];
                            if(it.name.toLowerCase().includes('potion')) {
                                if(it.name.toLowerCase().includes('health')) {
                                    var heal = 50;
                                    mainChar.HP = Math.min(mainChar.HP + heal, mainChar.maxHP);
                                    alert(mainChar.name + " healed by " + heal);
                                }
                                if(it.name.toLowerCase().includes('mana')) {
                                    var mana = 50;
                                    mainChar.mana = Math.min(mainChar.mana + mana, mainChar.maxMana);
                                    alert(mainChar.name + " restored " + mana + " mana");
                                }
                            }
                            Game.inventory.splice(index, 1);
                            Game.showInventory(false);
                        }
                    };
                })(item, idx);
                entry.appendChild(useBtn);
            }
            // Drop button (not in combat)
            if(!useMode) {
                var dropBtn = document.createElement('button');
                dropBtn.textContent = "Drop";
                dropBtn.onclick = (function(index){
                    return function() {
                        Game.inventory.splice(index, 1);
                        Game.showInventory(false);
                    };
                })(idx);
                entry.appendChild(dropBtn);
            }
            content.appendChild(entry);
        });
        panel.style.display = 'block';
    },
    showParty: function() {
        Game.closePanels();
        var panel = document.getElementById('partyPanel');
        var content = document.getElementById('partyContent');
        content.innerHTML = "";
        Game.playerParty.forEach(char => {
            var info = char.name + " (Lv " + char.level + " " + char.class + ") - HP: " + char.HP + "/" + char.maxHP + 
                       ", Mana: " + char.mana + "/" + char.maxMana + ", Attack: " + char.attack + ", Defense: " + char.defense + ", Magic: " + char.magic;
            var div = document.createElement('div');
            div.textContent = info;
            content.appendChild(div);
        });
        panel.style.display = 'block';
    },
    showSkills: function() {
        Game.closePanels();
        var panel = document.getElementById('skillsPanel');
        var content = document.getElementById('skillsContent');
        content.innerHTML = "";
        Game.playerParty.forEach(char => {
            var charHeader = document.createElement('h3');
            charHeader.textContent = char.name + "'s Skills:";
            content.appendChild(charHeader);
            char.skills.forEach(skill => {
                var div = document.createElement('div');
                div.textContent = skill.name + ": " + skill.description;
                content.appendChild(div);
            });
        });
        panel.style.display = 'block';
    },
    showJournal: function() {
        Game.closePanels();
        var panel = document.getElementById('journalPanel');
        var content = document.getElementById('journalContent');
        content.innerHTML = "";
        if(Game.quests.length === 0) {
            content.textContent = "No quests."; 
        } else {
            Game.quests.forEach(q => {
                var div = document.createElement('div');
                div.textContent = q.name + " - " + (q.status === 'completed' ? 'Completed' : 'In Progress');
                content.appendChild(div);
            });
        }
        panel.style.display = 'block';
    },
    showMap: function() {
        Game.closePanels();
        if(!Game.map) {
            Game.map = [
                ['🌲','🏠','🌲'],
                ['🌲','⬜','🌲'],
                ['🌲','🐉','🌲']
            ];
            Game.playerLocation = {x:1, y:1};
        }
        var panel = document.getElementById('mapPanel');
        var content = document.getElementById('mapContent');
        var html = '';
        for(var y=0;y<Game.map.length;y++) {
            for(var x=0;x<Game.map[y].length;x++) {
                if(Game.playerLocation.x===x && Game.playerLocation.y===y) {
                    html += '🙂';
                } else {
                    html += Game.map[y][x];
                }
            }
            html += '<br>';
        }
        content.innerHTML = html;
        panel.style.display = 'block';
        if(!Game.mapQuestStarted) {
            Game.addQuest('Explore the Map','Use the map to visit all locations.');
            Game.mapQuestStarted = true;
        }
    },
    // Close all panels
    closePanels: function() {
        document.getElementById('inventoryPanel').style.display = 'none';
        document.getElementById('partyPanel').style.display = 'none';
        document.getElementById('skillsPanel').style.display = 'none';
        document.getElementById('journalPanel').style.display = 'none';
        var mp = document.getElementById('mapPanel');
        if(mp) mp.style.display = 'none';
    },
    // Animation: falling leaves in forest
    startForestAnimation: function() {
        var asciiStr = Game.asciiArts["forest"];
        var lines = asciiStr.split("\n");
        // convert to array of char arrays
        var grid = lines.map(line => line.split(''));
        var height = grid.length;
        var width = grid[0].length;
        var leaves = [];
        Game.animationInterval = setInterval(function() {
            // add new leaf occasionally
            if(Math.random() < 0.3) {
                var x = Math.floor(Math.random()*width);
                leaves.push({x: x, y: 0});
            }
            // update leaves
            var newGrid = lines.map(line => line.split(''));
            leaves.forEach(leaf => {
                if(leaf.y < height) {
                    newGrid[leaf.y][leaf.x] = '*';
                }
                leaf.y += 1;
            });
            // remove leaves that fell off
            leaves = leaves.filter(l => l.y < height);
            // write back ascii
            var asciiEl = document.getElementById('asciiArt');
            asciiEl.textContent = newGrid.map(row => row.join('')).join("\n");
        }, 400);
    },
    // Animation: torch flicker in dungeon
    startTorchFlicker: function() {
        var asciiEl = document.getElementById('asciiArt');
        Game.flickerInterval = setInterval(function() {
            asciiEl.classList.toggle('flicker');
        }, 200);
    }
};
// Branching dialogue tree system
const dialogues = {
    start: {
        text: "👴 Old Man: Hello, traveler. What brings you to these parts?",
        options: [
            { text: "I'm looking for adventure.", next: "adventure" },
            { text: "Just passing by.", next: "passing" }
        ]
    },
    adventure: {
        text: "Old Man: Adventure, you say? I might have a quest for you... 💡",
        options: [
            { text: "Tell me more.", next: "quest_offer" },
            { text: "No thanks.", next: "endDialogue" }
        ]
    },
    passing: {
        text: "Old Man: Safe travels then. Be on your guard out there. ⚠️",
        options: [
            { text: "(Continue on your way)", next: "endDialogue" }
        ]
    },
    quest_offer: {
        text: "Old Man: Rumor has it a dragon 🐉 dwells in the mountains. Interested?",
        options: [
            { text: "Yes, I'll hunt the dragon!", next: "acceptQuest" },
            { text: "Sounds dangerous... not now.", next: "declineQuest" }
        ]
    },
    acceptQuest: {
        text: "Old Man: Brave soul! The village will sing of your heroism. 🎉",
        options: [
            { text: "(Begin quest 'Dragon Hunt')", next: "endDialogue" }
        ]
    },
    declineQuest: {
        text: "Old Man: I understand. Such a journey isn’t for everyone. 😔",
        options: [
            { text: "(Leave)", next: "endDialogue" }
        ]
    }
};

function startDialogue(nodeKey) {
    const dialogBox = document.getElementById('dialogue-box');
    const node = dialogues[nodeKey];
    if (!dialogBox || !node) return;
    dialogBox.innerHTML = `<p>${node.text}</p>`;
    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.style.margin = "0.5em";
        btn.onclick = () => {
            if (opt.next === 'endDialogue') {
                dialogBox.style.display = 'none';
            } else {
                startDialogue(opt.next);
            }
        };
        dialogBox.appendChild(btn);
    });
    dialogBox.style.display = 'block';
}

// ASCII cutscenes
const villainArt = String.raw`(\-"""-/)
//^\   /^\\      ** The Dark Lord Emerges! **
;/ ^_ _^ \;     A chilling laugh echoes...
|  \ Y /  |     "So, hero, you've finally arrived," 
(,  >@<  ,)     snarls the Dark Lord 😈.
 |   \_/   |    
 | (\___/)_|     * The air crackles with dark energy * 
  \ \/- -\/ /   
   \`===´/    
    '---'`;

function playVillainCutscene() {
    const screen = document.getElementById('asciiArt');
    if (screen) {
        screen.textContent = villainArt;
        setTimeout(() => {
            screen.textContent = '';
        }, 5000);
    }
}

const romanticArt = String.raw`
   O      O         .-\"\"\"-.
   |\\____/|        /       \     * Night sky full of stars *
   |      |       :         :    You share a quiet moment ❤️ 
   |  ♥   |        \       /     with your companion by the fire.
  / \\    / \\        \`-...-' 
`;

function playRomanticCutscene() {
    const screen = document.getElementById('asciiArt');
    if (screen) {
        screen.textContent = romanticArt;
        screen.onclick = () => {
            screen.onclick = null;
            screen.textContent = '';
        };
    }
}

// Risk meter update
function updateRiskMeter(percent) {
    const fill = document.getElementById('riskFill');
    if (!fill) return;
    const level = Math.max(0, Math.min(100, percent));
    fill.style.width = level + '%';
    if (level < 40) {
        fill.style.backgroundColor = 'limegreen';
    } else if (level < 75) {
        fill.style.backgroundColor = 'gold';
    } else {
        fill.style.backgroundColor = 'red';
    }
}

// Simple NPC class
class NPC {
    constructor(name, role, options = {}) {
        this.name = name;
        this.role = role;
        this.inventory = options.inventory || [];
        this.dialogues = options.dialogues || {};
        this.isCompanion = false;
        this.allegiance = options.allegiance || null;
    }
    talk() {
        if (this.dialogues.intro) {
            startDialogue(this.dialogues.intro);
        }
    }
    trade() {
        if (this.role !== 'shopkeeper') return;
        console.log('Shop inventory:', this.inventory);
    }
    recruitToParty() {
        if (this.role === 'companion' && !this.isCompanion) {
            this.isCompanion = true;
            console.log(`${this.name} has joined your party!`);
        }
    }
}

// Example NPC instances
const blacksmith = new NPC('Baldric', 'shopkeeper', {
    inventory: [
        { name: 'Iron Sword', price: 100, emoji: '🗡️' },
        { name: 'Shield', price: 80, emoji: '🛡️' }
    ],
    dialogues: { intro: 'start' }
});

const ranger = new NPC('Elena', 'companion', {
    dialogues: { intro: 'start' }
});

// Start the game when page is loaded
window.onload = function() {
    Game.init();
    updateRiskMeter(0);
};