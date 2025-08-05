// Define all skills and abilities available in the game, with their effects, costs, and descriptions.
window.Game = window.Game || {};
Game.skills = {
    // Physical attacks
    "Slash":       { name: "Slash", target: "enemy", type: "physical", power: 1.0, cost: 0,  costType: null,     cooldown: 0, description: "Basic sword attack." },
    "Stab":        { name: "Stab", target: "enemy", type: "physical", power: 1.0, cost: 0,  costType: null,     cooldown: 0, description: "Quick dagger stab." },
    "Power Strike":{ name: "Power Strike", target: "enemy", type: "physical", power: 1.5, cost: 10, costType: "stamina", cooldown: 2, description: "Heavy attack dealing 150% damage." },
    "Whirlwind":   { name: "Whirlwind", target: "all-enemies", type: "physical", power: 1.0, cost: 20, costType: "stamina", cooldown: 3, description: "Attack all enemies at once." },
    // Defensive / Buff skills
    "Shield Block":{ name: "Shield Block", target: "self", type: "buff", effect: {stat: "defense", increase: 5, duration: 2}, cost: 5,  costType: "stamina", cooldown: 2, description: "Raise defense for a short time." },
    "Invisibility":{ name: "Invisibility", target: "self", type: "buff", effect: {stat: "evasion", increase: 100, duration: 2}, cost: 10, costType: "stamina", cooldown: 5, description: "Become hard to target for a short time." },
    // Magic attacks
    "Fireball":    { name: "Fireball", target: "enemy", type: "magic", power: 1.2, cost: 15, costType: "mana", cooldown: 1, description: "Hurl a fireball for magic damage." },
    "Ice Shard":   { name: "Ice Shard", target: "enemy", type: "magic", power: 1.0, cost: 10, costType: "mana", cooldown: 1, description: "Launch an ice shard at an enemy." },
    "Lightning":   { name: "Lightning", target: "enemy", type: "magic", power: 1.5, cost: 20, costType: "mana", cooldown: 2, description: "Strike enemy with a lightning bolt." },
    "Meteor":      { name: "Meteor", target: "all-enemies", type: "magic", power: 1.2, cost: 30, costType: "mana", cooldown: 5, description: "Call a meteor to hit all enemies." },
    // Healing skills
    "Heal":        { name: "Heal", target: "ally", type: "heal", power: 0.5, cost: 10, costType: "mana", cooldown: 1, description: "Heal an ally for a moderate amount." },
    "Mass Heal":   { name: "Mass Heal", target: "all-allies", type: "heal", power: 0.3, cost: 30, costType: "mana", cooldown: 3, description: "Heal the whole party." },
    // Special skills
    "Berserk":     { name: "Berserk", target: "self", type: "buff", effect: {stat: "attack", increase: 5, duration: 3}, cost: 0,  costType: null,    cooldown: 5, description: "Increase attack for a short duration." },
    "Taunt":       { name: "Taunt", target: "enemy", type: "debuff", effect: {stat: "attack", increase: -3, duration: 2}, cost: 0,  costType: null,    cooldown: 3, description: "Provoke an enemy to lower its attack." },
    "Holy Light":  { name: "Holy Light", target: "ally", type: "heal", power: 0.8, cost: 15, costType: "mana", cooldown: 2, description: "Heal an ally with holy power." },
    "Smite":       { name: "Smite", target: "enemy", type: "magic", power: 1.0, cost: 10, costType: "mana", cooldown: 1, description: "Strike an enemy with holy energy." },
    // Rogue/Ranger skills
    "Poison Dart": { name: "Poison Dart", target: "enemy", type: "physical", power: 0.8, cost: 5,  costType: "stamina", cooldown: 1, status: {type: "poison", damage: 5, duration: 3}, description: "Attack with a poisoned dart that can inflict poison." },
    "Multi Shot":  { name: "Multi Shot", target: "all-enemies", type: "physical", power: 0.8, cost: 15, costType: "stamina", cooldown: 3, description: "Shoot arrows at all enemies." },
    "Snipe":       { name: "Snipe", target: "enemy", type: "physical", power: 1.3, cost: 10, costType: "stamina", cooldown: 2, description: "Precise long-range attack." },
    "Backstab":    { name: "Backstab", target: "enemy", type: "physical", power: 2.0, cost: 5,  costType: "stamina", cooldown: 2, description: "High damage attack from the shadows (more effective if used as an opener)." }
};
