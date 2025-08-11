window.Game = window.Game || {};

Game.playerParty = [];
Game.enemies = [];
Game.inventory = [];
Game.quests = [];
Game.inCombat = false;
Game.currentNode = null;
Game.combatNextNode = null;
Game.combatFailNode = null;
Game.animationInterval = null;
Game.flickerInterval = null;

Game.story = {
  start: {
    ascii: "village",
    text: "You arrive in a quiet village, an old man hurries toward you",
    choices: [{ text: "Talk to him", next: "oldMan" }]
  },
  oldMan: {
    text: "The dragon ravages the land, we need a hero",
    choices: [
      { text: "Accept the quest", next: "questAccepted" },
      { text: "Refuse", next: "ending_bad" }
    ]
  },
  questAccepted: {
    text: "Seek the seer in the forest, prepare in town if you wish",
    choices: [
      { text: "Go to forest", next: "forestEntrance" },
      { text: "Look around village", next: "villageExplore" }
    ]
  },
  villageExplore: {
    text: "Shops line the dusty road and neighbors greet you",
    choices: [
      { text: "Visit blacksmith", next: "blacksmith" },
      { text: "Go to forest", next: "forestEntrance" }
    ]
  },
  blacksmith: {
    text: "Hilda wipes sweat from her brow, what do you need",
    npc: "blacksmith",
    choices: [
      { text: "Ask about dragon", next: "blacksmithDragon" },
      { text: "Back", next: "villageExplore" }
    ]
  },
  blacksmithDragon: {
    text: "Hilda, that beast scorched half my forge once, take this whetstone",
    loot: { item: { name: "Fine Whetstone", type: "quest" } },
    choices: [{ text: "Thanks", next: "blacksmith" }]
  },
  forestEntrance: {
    ascii: "forest",
    text: "Shadows gather under tall trees, a path leads deeper",
    choices: [{ text: "Enter", next: "deepForest" }]
  },
  deepForest: {
    ascii: "forest",
    text: "You hear a cry, goblins surround a traveler",
    choices: [
      { text: "Help", next: "goblinFight" },
      { text: "Ignore", next: "forestSeer" }
    ]
  },
  goblinFight: {
    text: "You rush in to help",
    combat: { enemies: ["Goblin","Goblin"], next: "afterGoblinFight" }
  },
  afterGoblinFight: {
    text: "The traveler thanks you and hurries off, the forest quiets",
    choices: [{ text: "Find the seer", next: "forestSeer" }]
  },
  forestSeer: {
    text: "The seer speaks, the Ancient Sword lies in old ruins, then face the dragon",
    choices: [{ text: "To the ruins", next: "ruinsEntrance" }]
  },
  ruinsEntrance: {
    ascii: "dungeon",
    text: "Cold stone and flickering torchlight",
    risk: 60,
    choices: [
      { text: "Enter hall", next: "ruinsHall" }
    ]
  },
  ruinsHall: {
    text: "A door is locked, a side corridor is open",
    choices: [
      { text: "Pick the lock", next: "lockPickPuzzle" },
      { text: "Take corridor", next: "sideCorridor" }
    ]
  },
  lockPickPuzzle: {
    text: "Guess the code from 1 to 5",
    puzzle: { type: "lockpick", range: 5, tries: 3 },
    success: "treasureRoom",
    fail: "alarmTriggered"
  },
  sideCorridor: {
    text: "Skeletons rise from dust",
    combat: { enemies: ["Skeleton","Skeleton"], next: "afterSkeletons" }
  },
  afterSkeletons: {
    text: "They fall into piles, you find a shortcut",
    choices: [{ text: "Continue", next: "treasureRoom" }]
  },
  treasureRoom: {
    text: "On a pedestal, the Ancient Sword glows faintly",
    loot: { item: { name: "Ancient Sword", type: "weapon", attack: 15, magic: 5, set: "Ancient" } },
    choices: [{ text: "Take it", next: "dragonLair" }]
  },
  alarmTriggered: {
    text: "The alarm echoes, guards arrive",
    combat: { enemies: ["Guard","Guard"], next: "treasureRoom" }
  },
  dragonLair: {
    ascii: "dragon",
    text: "The dragon looms, heat rolls off its scales",
    choices: [
      { text: "Attack", next: "finalBattle" },
      { text: "Try to talk", next: "parleyDragon" }
    ]
  },
  parleyDragon: {
    text: "Your words hang in the air, the dragon snarls",
    choices: [{ text: "Prepare to fight", next: "finalBattle" }]
  },
  finalBattle: {
    text: "The fire rises",
    risk: 90,
    combat: { enemies: ["Dragon"], next: "ending_good" }
  },
  ending_good: { text: "You stand victorious, peace returns", ending: true },
  ending_bad: { text: "You turn away, the land suffers", ending: true }
};

Game.init = function(){
  Game.load() || Game.chooseClass();
  Game.updateRiskMeter(0);
};

Game.chooseClass = function(){
  Game.closePanels();
  document.getElementById('combatView').style.display='none';
  document.getElementById('storyView').style.display='block';
  const ascii = document.getElementById('asciiArt'); ascii.textContent = "";
  const text = document.getElementById('textDisplay'); text.innerText = "Choose your class";
  const choices = document.getElementById('choiceButtons'); choices.innerHTML = "";
  Object.keys(Game.classes).forEach(cls=>{
    const b = document.createElement('button'); b.textContent = cls;
    b.onclick = ()=> Game.startGame(cls);
    choices.appendChild(b);
  });
};

Game.startGame = function(className){
  Game.playerParty = [];
  Game.inventory = [];
  Game.quests = [];
  const p = Game.createCharacter(className||"Warrior", "Hero");
  Game.playerParty.push(p);
  Game.addItem({ name:"Rusty Sword", type:"weapon", attack:5 });
  Game.addItem({ name:"Cloth Armor", type:"armor", defense:2 });
  Game.equipItem(p, Game.inventory.find(i=>i.name==="Rusty Sword"));
  Game.equipItem(p, Game.inventory.find(i=>i.name==="Cloth Armor"));
  Game.goToNode("start");
};

Game.createCharacter = function(className, name){
  const base = Game.classes[className].baseStats;
  const ch = {
    name, class: className, level:1, xp:0,
    maxHP: base.maxHP, HP: base.maxHP,
    maxMana: base.maxMana, mana: base.maxMana,
    maxStamina: base.maxStamina, stamina: base.maxStamina,
    attack: base.attack, defense: base.defense, magic: base.magic,
    skills: [], weapon:null, armor:null, accessory:null, statusEffects:[]
  };
  Game.classes[className].initialSkills.forEach(s=>{
    if(Game.skills[s]) ch.skills.push(JSON.parse(JSON.stringify(Game.skills[s])));
  });
  return ch;
};

Game.updateStats = function(ch){
  const base = Game.classes[ch.class].baseStats;
  ch.attack = base.attack; ch.defense=base.defense; ch.magic=base.magic;
  ["weapon","armor","accessory"].forEach(slot=>{
    const it = ch[slot]; if(!it) return;
    if(it.attack) ch.attack += it.attack;
    if(it.defense) ch.defense += it.defense;
    if(it.magic) ch.magic += it.magic;
    if(it.hp){ ch.maxHP += it.hp; ch.HP += it.hp; }
    if(it.mana){ ch.maxMana += it.mana; ch.mana += it.mana; }
  });
  if(ch.weapon && ch.armor && ch.weapon.set && ch.weapon.set===ch.armor.set){
    if(ch.weapon.set==="Ancient"){ ch.attack+=5; ch.defense+=5; }
  }
};

Game.addItem = function(item){ Game.inventory.push(item); };
Game.equipItem = function(ch,item){
  let slot = item.type==="weapon"?"weapon":item.type==="armor"?"armor":item.type==="accessory"?"accessory":null;
  if(!slot) return false;
  const idx = Game.inventory.indexOf(item); if(idx>=0) Game.inventory.splice(idx,1);
  if(ch[slot]) Game.inventory.push(ch[slot]);
  ch[slot]=item; Game.updateStats(ch); return true;
};

Game.addQuest = function(name,description){ Game.quests.push({name,description,status:"ongoing"}); };
Game.completeQuest = function(name){ const q=Game.quests.find(q=>q.name===name); if(q) q.status="completed"; };

Game.goToNode = function(id){
  if(Game.animationInterval){ clearInterval(Game.animationInterval); Game.animationInterval=null; }
  if(Game.flickerInterval){ clearInterval(Game.flickerInterval); Game.flickerInterval=null; }

  document.getElementById('combatView').style.display='none';
  document.getElementById('storyView').style.display='block';
  Game.closePanels();

  const node = Game.story[id]; if(!node) return;
  Game.currentNode = node;

  Game.updateRiskMeter(node.risk||0);

  const ascii = document.getElementById('asciiArt');
  if(node.cutscene==="villain") Game.playVillainCutscene();
  else if(node.cutscene==="romantic") Game.playRomanticCutscene();
  else if(node.ascii && Game.asciiArts[node.ascii]) ascii.textContent = Game.asciiArts[node.ascii];
  else ascii.textContent = "";

  const text = document.getElementById('textDisplay'); text.innerText = node.text||"";

  if(node.combat){ Game.startCombat(node.combat.enemies, node.combat.next, node.combat.fail); return; }

  if(node.puzzle){
    if(node.puzzle.type==="lockpick"){
      const secret = Math.floor(Math.random()*node.puzzle.range)+1;
      let tries = node.puzzle.tries;
      const wrap = document.getElementById('choiceButtons'); wrap.innerHTML="";
      const input = document.createElement('input'); input.type='number'; input.min=1; input.max=node.puzzle.range;
      const btn = document.createElement('button'); btn.textContent="Guess";
      const fb = document.createElement('div');
      btn.onclick=()=>{
        const g = parseInt(input.value,10); if(!Number.isFinite(g)) return;
        if(g===secret){ Game.goToNode(node.success); return; }
        tries--;
        fb.textContent = (g<secret?"Too low":"Too high")+ (tries>0?`, ${tries} tries left`:"");
        if(tries<=0) Game.goToNode(node.fail);
      };
      wrap.appendChild(input); wrap.appendChild(btn); wrap.appendChild(fb);
      return;
    }
  }

  if(node.loot){
    const it = node.loot.item ? node.loot.item : null;
    if(it){ Game.addItem(it); text.innerText += `\nYou obtained ${it.name}`; }
  }

  if(node.npc){
    if(node.npc==='blacksmith') blacksmith.talk();
    return;
  }

  if(node.ending){
    const wrap = document.getElementById('choiceButtons'); wrap.innerHTML="";
    const r = document.createElement('button'); r.textContent="Restart";
    r.onclick = ()=> Game.chooseClass();
    wrap.appendChild(r);
    return;
  }

  const wrap = document.getElementById('choiceButtons'); wrap.innerHTML="";
  if(node.choices) node.choices.forEach(c=>{
    const b = document.createElement('button'); b.textContent = c.text;
    b.onclick = ()=> Game.goToNode(c.next);
    wrap.appendChild(b);
  });

  if(id==="forestEntrance") Game.startForestAnimation();
  if(id==="ruinsEntrance") Game.startTorchFlicker();
};

Game.createEnemy = function(type){
  const e = {
    name:type, maxHP:30, attack:5, defense:1, magic:0, behavior:"random", xp:10, HP:30, statusEffects:[], turnCount:0
  };
  if(type==="Goblin"){ e.maxHP=30; e.attack=5; e.defense=1; e.behavior="aggressive"; e.xp=20; }
  if(type==="Skeleton"){ e.maxHP=40; e.attack=6; e.defense=3; e.behavior="aggressive"; e.xp=25; }
  if(type==="Guard"){ e.maxHP=50; e.attack=8; e.defense=4; e.behavior="sniper"; e.xp=30; }
  if(type==="Dragon"){ e.maxHP=200; e.attack=15; e.defense=5; e.magic=5; e.behavior="boss"; e.xp=100; }
  e.HP = e.maxHP; return e;
};

Game.startCombat = function(list, nextNode, failNode){
  Game.inCombat = true;
  Game.updateRiskMeter(80);
  Game.enemies = list.map(t=>Game.createEnemy(t));
  Game.combatNextNode = nextNode; Game.combatFailNode = failNode;
  document.getElementById('storyView').style.display='none';
  document.getElementById('combatView').style.display='block';
  document.getElementById('combatLog').innerText = "Combat starts";
  document.getElementById('combatActions').innerHTML = "";
  Game.currentTurnCharIndex = 0;
  Game.updatePartyStats();
  Game.playerTurn(Game.currentTurnCharIndex);
};

Game.playerTurn = function(i){
  if(i>=Game.playerParty.length){ Game.enemyTurn(0); return; }
  const ch = Game.playerParty[i];
  if(ch.HP<=0){ Game.playerTurn(i+1); return; }
  const actions = document.getElementById('combatActions');
  actions.innerHTML = "";
  const prompt = document.createElement('div'); prompt.textContent = `${ch.name}, choose action`;
  actions.appendChild(prompt);
  ch.skills.forEach(s=>{
    let can=true;
    if(s.costType==="mana" && ch.mana<s.cost) can=false;
    if(s.costType==="stamina" && ch.stamina<s.cost) can=false;
    if(s.currentCooldown && s.currentCooldown>0) can=false;
    const b = document.createElement('button'); b.textContent = s.name; b.disabled=!can;
    b.onclick = ()=> Game.useSkill(ch, s);
    actions.appendChild(b);
  });
  if(Game.inventory.some(it=>it.type!=='weapon' && it.type!=='armor' && it.type!=='accessory')){
    const b = document.createElement('button'); b.textContent="Use Item";
    b.onclick = ()=> Game.showInventory(true, i);
    actions.appendChild(b);
  }
  const pass = document.createElement('button'); pass.textContent="Defend";
  pass.onclick = ()=> { document.getElementById('combatLog').innerText += `\n${ch.name} defends`; Game.playerTurn(++Game.currentTurnCharIndex); };
  actions.appendChild(pass);
};

Game.useSkill = function(ch, s){
  if(s.target==="enemy") return Game.selectTarget(ch, s, 'enemy');
  if(s.target==="ally")  return Game.selectTarget(ch, s, 'ally');
  Game.executeSkill(ch, s, null);
};

Game.selectTarget = function(ch, s, type){
  const actions = document.getElementById('combatActions');
  actions.innerHTML = "Select target:";
  const list = type==='enemy' ? Game.enemies : Game.playerParty;
  list.forEach(t=>{
    if(t.HP>0){
      const b = document.createElement('button');
      b.textContent = `${t.name}  HP ${t.HP}`;
      b.onclick = ()=> Game.executeSkill(ch, s, t);
      actions.appendChild(b);
    }
  });
};

Game.executeSkill = function(ch, s, target){
  const log = document.getElementById('combatLog');

  if(s.costType==='mana') ch.mana = Math.max(0, ch.mana - s.cost);
  if(s.costType==='stamina') ch.stamina = Math.max(0, ch.stamina - s.cost);
  s.currentCooldown = s.cooldown;

  if(s.type==='physical' || s.type==='magic'){
    if(s.target==='all-enemies'){
      log.innerText += `\n${ch.name} uses ${s.name}`;
      Game.enemies.forEach(e=>{
        if(e.HP>0){
          let dmg = Math.floor(((s.type==='physical'?ch.attack:ch.magic) * s.power) - e.defense);
          if(dmg<1) dmg=1; e.HP -= dmg;
          log.innerText += `\n> ${e.name} takes ${dmg}`;
          if(e.HP<=0) log.innerText += ` and falls`;
        }
      });
    }else if(target){
      let dmg = Math.floor(((s.type==='physical'?ch.attack:ch.magic) * s.power) - target.defense);
      if(dmg<1) dmg=1; target.HP -= dmg;
      log.innerText += `\n${ch.name} uses ${s.name} on ${target.name} for ${dmg}`;
      if(target.HP<=0) log.innerText += `, ${target.name} falls`;
    }
    if(s.status && target && target.HP>0){
      target.statusEffects.push({ type:s.status.type, damage:s.status.damage, duration:s.status.duration });
      log.innerText += `\n${target.name} is ${s.status.type}ed`;
    }
  }else if(s.type==='heal'){
    if(s.target==='all-allies'){
      log.innerText += `\n${ch.name} casts ${s.name}`;
      Game.playerParty.forEach(p=>{
        if(p.HP>0){
          const amt = Math.floor(p.maxHP * s.power);
          p.HP = Math.min(p.maxHP, p.HP + amt);
          log.innerText += `\n> ${p.name} +${amt} HP`;
        }
      });
    }else if(target){
      const amt = Math.floor(target.maxHP * s.power);
      target.HP = Math.min(target.maxHP, target.HP + amt);
      log.innerText += `\n${ch.name} heals ${target.name} for ${amt}`;
    }
  }else if(s.type==='buff'){
    if(s.target==='self'){
      ch.statusEffects.push({ type:'buff', stat:s.effect.stat, increase:s.effect.increase, duration:s.effect.duration });
      if(s.effect.stat==='attack') ch.attack += s.effect.increase;
      if(s.effect.stat==='defense') ch.defense += s.effect.increase;
      log.innerText += `\n${ch.name} uses ${s.name}`;
    }
  }else if(s.type==='debuff' && target){
    target.statusEffects.push({ type:'debuff', stat:s.effect.stat, increase:s.effect.increase, duration:s.effect.duration });
    if(s.effect.stat==='attack') target.attack += s.effect.increase;
    if(s.effect.stat==='defense') target.defense += s.effect.increase;
    log.innerText += `\n${ch.name} uses ${s.name} on ${target.name}`;
  }

  if(Game.enemies.every(e=>e.HP<=0)) return Game.winCombat();

  Game.updatePartyStats();
  Game.playerTurn(++Game.currentTurnCharIndex);
};

Game.enemyTurn = function(i){
  if(i>=Game.enemies.length){
    if(Game.enemies.every(e=>e.HP<=0)) return Game.winCombat();

    Game.playerParty.forEach(ch=>{
      ch.skills.forEach(s=>{ if(s.currentCooldown && s.currentCooldown>0) s.currentCooldown--; });
      ch.statusEffects = ch.statusEffects.filter(st=>{
        st.duration--; if(st.duration<=0){
          if(st.type==='buff'){
            if(st.stat==='attack') ch.attack -= st.increase;
            if(st.stat==='defense') ch.defense -= st.increase;
          }
          return false;
        }
        return true;
      });
    });

    Game.enemies.forEach(e=>{
      e.statusEffects = e.statusEffects.filter(st=>{
        if(st.type==='poison'){ e.HP -= st.damage; document.getElementById('combatLog').innerText += `\n${e.name} takes ${st.damage} poison`; }
        st.duration--; return st.duration>0;
      });
    });

    Game.enemies = Game.enemies.filter(e=>e.HP>0);
    if(Game.enemies.length===0) return Game.winCombat();

    Game.currentTurnCharIndex = 0;
    Game.updatePartyStats();
    return Game.playerTurn(Game.currentTurnCharIndex);
  }

  const e = Game.enemies[i];
  if(e.HP>0){
    e.turnCount++;
    const log = document.getElementById('combatLog');
    if(e.behavior==='boss' && e.turnCount%3===0){
      log.innerText += `\n${e.name} breathes fire on all`;
      Game.playerParty.forEach(ch=>{
        if(ch.HP>0){
          let dmg = Math.floor(e.attack*1.2 - ch.defense); if(dmg<1) dmg=1;
          ch.HP -= dmg; log.innerText += `\n> ${ch.name} ${dmg}`;
          if(ch.HP<=0) log.innerText += `, ${ch.name} falls`;
        }
      });
      Game.updatePartyStats();
    }else{
      const alive = Game.playerParty.filter(c=>c.HP>0);
      const target = alive[Math.floor(Math.random()*alive.length)];
      let dmg = Math.floor(e.attack - target.defense); if(dmg<1) dmg=1;
      target.HP -= dmg;
      log.innerText += `\n${e.name} hits ${target.name} for ${dmg}`;
      if(target.HP<=0) log.innerText += `, ${target.name} falls`;
      Game.updatePartyStats();
    }
  }

  if(Game.playerParty.every(c=>c.HP<=0)) return Game.loseCombat();
  Game.enemyTurn(i+1);
};

Game.winCombat = function(){
  const log = document.getElementById('combatLog');
  log.innerText += `\nVictory`;
  const xp = Game.enemies.reduce((a,e)=>a+(e.xp||0),0);
  if(xp>0){
    log.innerText += `\nParty gains ${xp} XP`;
    Game.playerParty.forEach(ch=>{ if(ch.HP>0) Game.gainXP(ch, xp); });
  }
  setTimeout(()=>{ Game.inCombat=false; Game.updateRiskMeter(0); Game.goToNode(Game.combatNextNode); }, 800);
};

Game.loseCombat = function(){
  const log = document.getElementById('combatLog');
  log.innerText += `\nDefeat`;
  Game.inCombat=false; Game.updateRiskMeter(0);
  Game.goToNode(Game.combatFailNode || "ending_bad");
};

Game.gainXP = function(ch, xp){
  ch.xp += xp;
  while(ch.xp >= ch.level*100){
    ch.xp -= ch.level*100; ch.level++;
    const g = Game.classes[ch.class].levelUp;
    ch.maxHP += g.maxHP; ch.HP += g.maxHP;
    ch.maxMana += g.maxMana; ch.mana += g.maxMana;
    ch.maxStamina += g.maxStamina; ch.stamina += g.maxStamina;
    ch.attack += g.attack; ch.defense += g.defense; ch.magic += g.magic;

    const tree = Game.skillTrees[ch.class] || [];
    tree.forEach(br=>{
      if(br.level===ch.level){
        const learn = br.choices[0];
        if(Game.skills[learn]) ch.skills.push(JSON.parse(JSON.stringify(Game.skills[learn])));
      }
    });
  }
};

Game.startForestAnimation = function(){
  const src = Game.asciiArts.forest.split("\n");
  const h = src.length, w = src[0].length;
  let leaves = [];
  Game.animationInterval = setInterval(()=>{
    if(Math.random()<0.3) leaves.push({x:Math.floor(Math.random()*w),y:0});
    const grid = src.map(l=>l.split(''));
    leaves.forEach(L=>{ if(L.y<h) grid[L.y][L.x]='*'; L.y++; });
    leaves = leaves.filter(L=>L.y<h);
    document.getElementById('asciiArt').textContent = grid.map(r=>r.join('')).join("\n");
  }, 350);
};

Game.startTorchFlicker = function(){
  const el = document.getElementById('asciiArt');
  Game.flickerInterval = setInterval(()=> el.classList.toggle('flicker'), 200);
};

Game.save = function(){
  const data = JSON.stringify({
    party: Game.playerParty, inv: Game.inventory, quests: Game.quests, node: Game.currentNode ? Object.keys(Game.story).find(k=>Game.story[k]===Game.currentNode) : "start"
  });
  localStorage.setItem("emoji_rpg_save", data);
  alert("Saved");
};

Game.load = function(){
  const raw = localStorage.getItem("emoji_rpg_save"); if(!raw) return false;
  try{
    const d = JSON.parse(raw);
    Game.playerParty = d.party || [];
    Game.inventory = d.inv || [];
    Game.quests = d.quests || [];
    Game.goToNode(d.node || "start");
    return true;
  }catch(e){ return false; }
};

window.onload = function(){ Game.init(); };
