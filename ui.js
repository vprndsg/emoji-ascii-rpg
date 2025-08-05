// UI management for updating DOM elements, showing panels, and updating visual effects.
window.Game = window.Game || {};
// Close all open panels (inventory, party, skills, journal, map)
Game.closePanels = function() {
    document.getElementById('inventoryPanel').style.display = 'none';
    document.getElementById('partyPanel').style.display = 'none';
    document.getElementById('skillsPanel').style.display = 'none';
    document.getElementById('journalPanel').style.display = 'none';
    var mp = document.getElementById('mapPanel');
    if (mp) mp.style.display = 'none';
};
// Show Inventory panel (useMode=true if using an item during combat, activeCharIndex indicates which character is acting)
Game.showInventory = function(useMode, activeCharIndex) {
    Game.closePanels();
    var panel = document.getElementById('inventoryPanel');
    var content = document.getElementById('inventoryContent');
    content.innerHTML = "";
    // Build inventory list dynamically
    Game.inventory.forEach((item, idx) => {
        var entry = document.createElement('div');
        entry.className = 'itemEntry';
        var desc = item.name;
        // Append basic stat info to item description
        if (item.attack) desc += " (Atk+" + item.attack + ")";
        if (item.defense) desc += " (Def+" + item.defense + ")";
        if (item.magic) desc += " (Mag+" + item.magic + ")";
        entry.textContent = desc + " ";
        // Equip button for equippable items (only out of combat)
        if (!useMode && (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
            var eqBtn = document.createElement('button');
            eqBtn.textContent = "Equip";
            eqBtn.onclick = (function(it) {
                return function() {
                    // Equip to the first party member (main hero) for simplicity
                    Game.equipItem(Game.playerParty[0], it);
                    Game.showInventory(false);
                };
            })(item);
            entry.appendChild(eqBtn);
        }
        // Use button for consumables (e.g., potions)
        if (item.type && item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory') {
            var useBtn = document.createElement('button');
            useBtn.textContent = "Use";
            useBtn.onclick = (function(it, index) {
                return function() {
                    // If in combat, use item as an action by the active character
                    if (useMode) {
                        var char = Game.playerParty[activeCharIndex];
                        // Simple logic: health potions heal, mana potions restore mana
                        if (it.name.toLowerCase().includes('potion')) {
                            if (it.name.toLowerCase().includes('health')) {
                                var healAmt = 50;
                                char.HP = Math.min(char.HP + healAmt, char.maxHP);
                                document.getElementById('combatLog').innerText += "\n" + char.name + " uses " + it.name + " and recovers " + healAmt + " HP.";
                            }
                            if (it.name.toLowerCase().includes('mana')) {
                                var manaAmt = 50;
                                char.mana = Math.min(char.mana + manaAmt, char.maxMana);
                                document.getElementById('combatLog').innerText += "\n" + char.name + " uses " + it.name + " and recovers " + manaAmt + " Mana.";
                            }
                        }
                        // Remove item from inventory after use
                        Game.inventory.splice(index, 1);
                        // Close inventory and continue combat turn
                        Game.closePanels();
                        // Update party status display and proceed to next turn
                        Game.updatePartyStats();
                        Game.playerTurn(++Game.currentTurnCharIndex);
                    } else {
                        // Using an item outside combat (e.g., healing outside battle)
                        var mainChar = Game.playerParty[0];
                        if (it.name.toLowerCase().includes('potion')) {
                            if (it.name.toLowerCase().includes('health')) {
                                var healAmt = 50;
                                mainChar.HP = Math.min(mainChar.HP + healAmt, mainChar.maxHP);
                                alert(mainChar.name + " healed by " + healAmt + " HP.");
                            }
                            if (it.name.toLowerCase().includes('mana')) {
                                var manaAmt = 50;
                                mainChar.mana = Math.min(mainChar.mana + manaAmt, mainChar.maxMana);
                                alert(mainChar.name + " restored " + manaAmt + " Mana.");
                            }
                        }
                        Game.inventory.splice(index, 1);
                        Game.showInventory(false);
                    }
                };
            })(item, idx);
            entry.appendChild(useBtn);
        }
        // Drop button (remove item, only outside combat)
        if (!useMode) {
            var dropBtn = document.createElement('button');
            dropBtn.textContent = "Drop";
            dropBtn.onclick = (function(index) {
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
};
// Show Party panel with list of current party members and their stats
Game.showParty = function() {
    Game.closePanels();
    var panel = document.getElementById('partyPanel');
    var content = document.getElementById('partyContent');
    content.innerHTML = "";
    Game.playerParty.forEach(char => {
        var info = `${char.name} (Lv ${char.level} ${char.class}) - HP: ${char.HP}/${char.maxHP}, Mana: ${char.mana}/${char.maxMana}, Attack: ${char.attack}, Defense: ${char.defense}, Magic: ${char.magic}`;
        var div = document.createElement('div');
        div.textContent = info;
        content.appendChild(div);
    });
    panel.style.display = 'block';
};
// Show Skills panel with skills each party member knows and their descriptions
Game.showSkills = function() {
    Game.closePanels();
    var panel = document.getElementById('skillsPanel');
    var content = document.getElementById('skillsContent');
    content.innerHTML = "";
    Game.playerParty.forEach(char => {
        var charHeader = document.createElement('h3');
        charHeader.textContent = `${char.name}'s Skills:`;
        content.appendChild(charHeader);
        char.skills.forEach(skill => {
            var div = document.createElement('div');
            div.textContent = `${skill.name}: ${skill.description}`;
            content.appendChild(div);
        });
    });
    panel.style.display = 'block';
};
// Show Journal panel with list of quests and their status
Game.showJournal = function() {
    Game.closePanels();
    var panel = document.getElementById('journalPanel');
    var content = document.getElementById('journalContent');
    content.innerHTML = "";
    if (Game.quests.length === 0) {
        content.textContent = "No quests.";
    } else {
        Game.quests.forEach(q => {
            var div = document.createElement('div');
            div.textContent = `${q.name} - ${q.status === 'completed' ? 'Completed' : 'In Progress'}`;
            content.appendChild(div);
        });
    }
    panel.style.display = 'block';
};
// Show Map panel with a simple ASCII map and mark the player's current location
Game.showMap = function() {
    Game.closePanels();
    // Initialize map on first use
    if (!Game.map) {
        Game.map = [
            ['🌲','🏠','🌲'],
            ['🌲','⬜','🌲'],
            ['🌲','🐉','🌲']
        ];
        Game.playerLocation = {x: 1, y: 1};
    }
    var panel = document.getElementById('mapPanel');
    var content = document.getElementById('mapContent');
    var html = '';
    for (var y = 0; y < Game.map.length; y++) {
        for (var x = 0; x < Game.map[y].length; x++) {
            if (Game.playerLocation.x === x && Game.playerLocation.y === y) {
                html += '🙂';
            } else {
                html += Game.map[y][x];
            }
        }
        html += '<br>';
    }
    content.innerHTML = html;
    panel.style.display = 'block';
    // Start "Explore the Map" quest if not already started
    if (!Game.mapQuestStarted) {
        Game.addQuest('Explore the Map', 'Use the map to visit all locations.');
        Game.mapQuestStarted = true;
    }
};
// Update the party status display (health/mana bars for each party member in combat)
Game.updatePartyStats = function() {
    var statusEl = document.getElementById('partyStatus');
    if (!statusEl) return;
    statusEl.innerHTML = "";
    Game.playerParty.forEach(char => {
        var charDiv = document.createElement('div');
        charDiv.className = 'charStatus';
        // Character name and current HP/MP text
        var nameSpan = document.createElement('span');
        nameSpan.className = 'charName';
        nameSpan.textContent = `${char.name} - HP ${char.HP}/${char.maxHP}` + (char.maxMana > 0 ? `, MP ${char.mana}/${char.maxMana}` : "");
        charDiv.appendChild(nameSpan);
        // HP bar
        var hpBar = document.createElement('div');
        hpBar.className = 'hpBar';
        var hpFill = document.createElement('div');
        hpFill.className = 'hpFill';
        var hpPercent = char.maxHP > 0 ? Math.floor((char.HP / char.maxHP) * 100) : 0;
        hpFill.style.width = hpPercent + '%';
        hpBar.appendChild(hpFill);
        charDiv.appendChild(hpBar);
        // Mana bar (if character has mana)
        if (char.maxMana && char.maxMana > 0) {
            var manaBar = document.createElement('div');
            manaBar.className = 'manaBar';
            var manaFill = document.createElement('div');
            manaFill.className = 'manaFill';
            var manaPercent = char.maxMana > 0 ? Math.floor((char.mana / char.maxMana) * 100) : 0;
            manaFill.style.width = manaPercent + '%';
            manaBar.appendChild(manaFill);
            charDiv.appendChild(manaBar);
        }
        statusEl.appendChild(charDiv);
    });
};
// Update the Risk/Alert meter UI based on current danger level (0-100)
Game.updateRiskMeter = function(percent) {
    var fill = document.getElementById('riskFill');
    if (!fill) return;
    var level = Math.max(0, Math.min(100, percent));
    fill.style.width = level + '%';
    if (level < 40) {
        fill.style.backgroundColor = 'limegreen';
    } else if (level < 75) {
        fill.style.backgroundColor = 'gold';
    } else {
        fill.style.backgroundColor = 'red';
    }
};
