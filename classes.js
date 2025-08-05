// Define the available player classes, their base stats, initial skills, and level-up gains.
// Also define skill tree progression choices for each class.
window.Game = window.Game || {};
Game.classes = {
    "Warrior": {
        baseStats: { maxHP: 100, maxMana: 0, maxStamina: 50, attack: 10, defense: 5, magic: 0 },
        initialSkills: ["Slash"]
    },
    "Mage": {
        baseStats: { maxHP: 60, maxMana: 100, maxStamina: 0, attack: 5, defense: 2, magic: 10 },
        initialSkills: ["Fireball", "Heal"]
    },
    "Rogue": {
        baseStats: { maxHP: 80, maxMana: 20, maxStamina: 80, attack: 8, defense: 3, magic: 0 },
        initialSkills: ["Stab"]
    },
    "Ranger": {
        baseStats: { maxHP: 70, maxMana: 30, maxStamina: 70, attack: 9, defense: 3, magic: 2 },
        initialSkills: ["Snipe"]
    },
    "Paladin": {
        baseStats: { maxHP: 90, maxMana: 50, maxStamina: 30, attack: 9, defense: 5, magic: 5 },
        initialSkills: ["Slash", "Heal"]
    }
// Stat gains per level for each class (applied on level-up)
Game.classes.Warrior.levelUp = { maxHP: 20, maxMana: 0, maxStamina: 10, attack: 3, defense: 2, magic: 0 };
Game.classes.Mage.levelUp    = { maxHP: 10, maxMana: 20, maxStamina: 0, attack: 1, defense: 1, magic: 3 };
Game.classes.Rogue.levelUp   = { maxHP: 15, maxMana: 5, maxStamina: 15, attack: 2, defense: 1, magic: 0 };
Game.classes.Ranger.levelUp  = { maxHP: 14, maxMana: 8, maxStamina: 14, attack: 2, defense: 1, magic: 1 };
Game.classes.Paladin.levelUp = { maxHP: 18, maxMana: 10, maxStamina: 5, attack: 2, defense: 2, magic: 1 };

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
};;
