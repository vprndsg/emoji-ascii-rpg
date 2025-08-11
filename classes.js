window.Game = window.Game || {};

Game.classes = {
  Warrior: {
    baseStats: { maxHP: 100, maxMana: 0, maxStamina: 50, attack: 10, defense: 5, magic: 0 },
    initialSkills: ["Slash"]
  },
  Mage: {
    baseStats: { maxHP: 60, maxMana: 100, maxStamina: 0, attack: 5, defense: 2, magic: 10 },
    initialSkills: ["Fireball", "Heal"]
  },
  Rogue: {
    baseStats: { maxHP: 80, maxMana: 20, maxStamina: 80, attack: 8, defense: 3, magic: 0 },
    initialSkills: ["Stab"]
  },
  Ranger: {
    baseStats: { maxHP: 70, maxMana: 30, maxStamina: 70, attack: 9, defense: 3, magic: 2 },
    initialSkills: ["Shoot", "Snipe"]
  }
};

Game.classes.Warrior.levelUp = { maxHP: 20, maxMana: 0, maxStamina: 10, attack: 3, defense: 2, magic: 0 };
Game.classes.Mage.levelUp    = { maxHP: 10, maxMana: 20, maxStamina: 0, attack: 1, defense: 1, magic: 3 };
Game.classes.Rogue.levelUp   = { maxHP: 15, maxMana: 5, maxStamina: 15, attack: 2, defense: 1, magic: 0 };
Game.classes.Ranger.levelUp  = { maxHP: 14, maxMana: 8, maxStamina: 14, attack: 2, defense: 1, magic: 1 };

Game.skillTrees = {
  Warrior: [
    { level: 3, choices: ["Power Strike", "Shield Block"] },
    { level: 5, choices: ["Whirlwind", "Berserk"] }
  ],
  Mage: [
    { level: 3, choices: ["Ice Shard", "Lightning"] },
    { level: 5, choices: ["Mass Heal", "Meteor"] }
  ],
  Rogue: [
    { level: 3, choices: ["Poison Dart", "Backstab"] },
    { level: 5, choices: ["Invisibility", "Multi Shot"] }
  ],
  Ranger: [
    { level: 3, choices: ["Poison Dart", "Multi Shot"] },
    { level: 5, choices: ["Invisibility", "Power Strike"] }
  ]
};
