window.Game = window.Game || {};

Game.closePanels = function(){
  ['inventoryPanel','partyPanel','skillsPanel','journalPanel','mapPanel']
    .forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display='none'; });
};

Game.showInventory = function(useMode, activeIndex){
  Game.closePanels();
  const panel = document.getElementById('inventoryPanel');
  const content = document.getElementById('inventoryContent');
  content.innerHTML = "";
  Game.inventory.forEach((item,i)=>{
    const row = document.createElement('div');
    row.className = 'itemEntry';
    row.textContent = item.name + " ";
    if(!useMode && (item.type==='weapon'||item.type==='armor'||item.type==='accessory')){
      const eq = document.createElement('button'); eq.textContent = "Equip";
      eq.onclick = ()=>{ Game.equipItem(Game.playerParty[0], item); Game.showInventory(false); };
      row.appendChild(eq);
    }
    if(item.type && item.type!=='weapon' && item.type!=='armor' && item.type!=='accessory'){
      const use = document.createElement('button'); use.textContent="Use";
      use.onclick = ()=>{
        const c = Game.playerParty[activeIndex||0];
        if(item.name.toLowerCase().includes('health')) c.HP = Math.min(c.maxHP, c.HP+50);
        if(item.name.toLowerCase().includes('mana')) c.mana = Math.min(c.maxMana, c.mana+50);
        Game.inventory.splice(i,1);
        Game.closePanels();
        if(Game.inCombat){ Game.updatePartyStats(); Game.playerTurn(++Game.currentTurnCharIndex); }
      };
      row.appendChild(use);
    }
    if(!useMode){
      const drop = document.createElement('button'); drop.textContent="Drop";
      drop.onclick = ()=>{ Game.inventory.splice(i,1); Game.showInventory(false); };
      row.appendChild(drop);
    }
    content.appendChild(row);
  });
  panel.style.display = 'block';
};

Game.showParty = function(){
  Game.closePanels();
  const p = document.getElementById('partyPanel');
  const c = document.getElementById('partyContent');
  c.innerHTML = "";
  Game.playerParty.forEach(ch=>{
    const d = document.createElement('div');
    d.textContent = `${ch.name} Lv ${ch.level} ${ch.class}  HP ${ch.HP}/${ch.maxHP}` + (ch.maxMana>0?`  MP ${ch.mana}/${ch.maxMana}`:'');
    c.appendChild(d);
  });
  p.style.display='block';
};

Game.showSkills = function(){
  Game.closePanels();
  const p = document.getElementById('skillsPanel');
  const c = document.getElementById('skillsContent');
  c.innerHTML = "";
  Game.playerParty.forEach(ch=>{
    const h = document.createElement('h3'); h.textContent = `${ch.name}`;
    c.appendChild(h);
    ch.skills.forEach(s=>{
      const d = document.createElement('div');
      d.textContent = `${s.name}  ${s.description}`;
      c.appendChild(d);
    });
  });
  p.style.display='block';
};

Game.showJournal = function(){
  Game.closePanels();
  const p = document.getElementById('journalPanel');
  const c = document.getElementById('journalContent');
  c.innerHTML = "";
  if(Game.quests.length===0) c.textContent = "No quests yet";
  else Game.quests.forEach(q=>{ const d=document.createElement('div'); d.textContent = `${q.name}  ${q.status}`; c.appendChild(d); });
  p.style.display='block';
};

Game.showMap = function(){
  Game.closePanels();
  if(!Game.map){
    Game.map = [['🌲','🏠','🌲'],['🌲','⬜','🌲'],['🌲','🐉','🌲']];
    Game.playerLocation = {x:1,y:1};
  }
  const p = document.getElementById('mapPanel');
  const c = document.getElementById('mapContent');
  let html = '';
  for(let y=0;y<Game.map.length;y++){
    for(let x=0;x<Game.map[y].length;x++){
      html += (Game.playerLocation.x===x && Game.playerLocation.y===y) ? '🙂' : Game.map[y][x];
    }
    html+='<br>';
  }
  c.innerHTML = html;
  p.style.display='block';
};

Game.updatePartyStats = function(){
  const wrap = document.getElementById('partyStatus');
  if(!wrap) return;
  wrap.innerHTML = "";
  Game.playerParty.forEach(ch=>{
    const box = document.createElement('div'); box.className='charStatus';
    const name = document.createElement('span'); name.className='charName';
    name.textContent = `${ch.name}  HP ${ch.HP}/${ch.maxHP}` + (ch.maxMana>0?`  MP ${ch.mana}/${ch.maxMana}`:'');
    box.appendChild(name);
    const hpBar = document.createElement('div'); hpBar.className='hpBar';
    const hpFill = document.createElement('div'); hpFill.className='hpFill';
    hpFill.style.width = Math.max(0, Math.floor(100*ch.HP/ch.maxHP))+'%';
    hpBar.appendChild(hpFill); box.appendChild(hpBar);
    if(ch.maxMana>0){
      const mpBar = document.createElement('div'); mpBar.className='manaBar';
      const mpFill = document.createElement('div'); mpFill.className='manaFill';
      mpFill.style.width = Math.max(0, Math.floor(100*ch.mana/ch.maxMana))+'%';
      mpBar.appendChild(mpFill); box.appendChild(mpBar);
    }
    wrap.appendChild(box);
  });
};

Game.updateRiskMeter = function(pct){
  const f = document.getElementById('riskFill'); if(!f) return;
  const v = Math.max(0, Math.min(100, pct|0));
  f.style.width = v + '%';
  f.style.backgroundColor = v<40?'limegreen':(v<75?'gold':'red');
};
