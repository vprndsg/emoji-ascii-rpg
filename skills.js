window.Game = window.Game || {};

Game.skills = {
  Slash: { name: "Slash", target: "enemy", type: "physical", power: 1.0, cost: 0, costType: null, cooldown: 0, description: "Basic sword attack." },
  Stab:  { name: "Stab",  target: "enemy", type: "physical", power: 1.0, cost: 0, costType: null, cooldown: 0, description: "Quick dagger stab." },
  Shoot: { name: "Shoot", target: "enemy", type: "physical", power: 1.0, cost: 0, costType: null, cooldown: 0, description: "Simple arrow shot." },

  Power Strike: { name:"Power Strike", target:"enemy", type:"physical", power:1.5, cost:10, costType:"stamina", cooldown:2, description:"Heavy hit." },
  Whirlwind:    { name:"Whirlwind", target:"all-enemies", type:"physical", power:1.0, cost:20, costType:"stamina", cooldown:3, description:"Hit all enemies." },
  Shield Block: { name:"Shield Block", target:"self", type:"buff", effect:{stat:"defense",increase:5,duration:2}, cost:5, costType:"stamina", cooldown:2, description:"Raise defense." },
  Berserk:      { name:"Berserk", target:"self", type:"buff", effect:{stat:"attack",increase:5,duration:3}, cost:0, costType:null, cooldown:5, description:"Boost attack." },
  Taunt:        { name:"Taunt", target:"enemy", type:"debuff", effect:{stat:"attack",increase:-3,duration:2}, cost:0, costType:null, cooldown:3, description:"Provoke enemy." },

  Fireball:  { name:"Fireball", target:"enemy", type:"magic", power:1.2, cost:15, costType:"mana", cooldown:1, description:"Magic fire." },
  Ice Shard: { name:"Ice Shard", target:"enemy", type:"magic", power:1.0, cost:10, costType:"mana", cooldown:1, description:"Cold spike." },
  Lightning: { name:"Lightning", target:"enemy", type:"magic", power:1.5, cost:20, costType:"mana", cooldown:2, description:"Bolt strike." },
  Meteor:    { name:"Meteor", target:"all-enemies", type:"magic", power:1.2, cost:30, costType:"mana", cooldown:5, description:"AoE magic." },

  Heal:      { name:"Heal", target:"ally", type:"heal", power:0.5, cost:10, costType:"mana", cooldown:1, description:"Restore HP." },
  Mass Heal: { name:"Mass Heal", target:"all-allies", type:"heal", power:0.3, cost:30, costType:"mana", cooldown:3, description:"Group heal." },

  Poison Dart: { name:"Poison Dart", target:"enemy", type:"physical", power:0.8, cost:5, costType:"stamina", cooldown:1, status:{type:"poison",damage:5,duration:3}, description:"Apply poison." },
  Multi Shot:  { name:"Multi Shot", target:"all-enemies", type:"physical", power:0.8, cost:15, costType:"stamina", cooldown:3, description:"Volley of arrows." },
  Snipe:       { name:"Snipe", target:"enemy", type:"physical", power:1.3, cost:10, costType:"stamina", cooldown:2, description:"Precise shot." },
  Backstab:    { name:"Backstab", target:"enemy", type:"physical", power:2.0, cost:5, costType:"stamina", cooldown:2, description:"Big single hit." },
  Invisibility:{ name:"Invisibility", target:"self", type:"buff", effect:{stat:"evasion",increase:100,duration:2}, cost:10, costType:"stamina", cooldown:5, description:"Hard to hit." },

  Holy Light:  { name:"Holy Light", target:"ally", type:"heal", power:0.8, cost:15, costType:"mana", cooldown:2, description:"Strong heal." },
  Smite:       { name:"Smite", target:"enemy", type:"magic", power:1.0, cost:10, costType:"mana", cooldown:1, description:"Holy strike." }
};
