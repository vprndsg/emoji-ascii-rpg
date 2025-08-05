// Define an NPC class and initialize NPC instances (shopkeepers, companions, etc.)
window.Game = window.Game || {};
class NPC {
    constructor(name, role, options = {}) {
        this.name = name;
        this.role = role;
        this.inventory = options.inventory || [];
        this.dialogues = options.dialogues || {};
        this.isCompanion = false;
        this.allegiance = options.allegiance || null;
    }
    // Trigger dialogue with this NPC (opens the dialogue overlay)
    talk() {
        if (this.dialogues.intro) {
            startDialogue(this.dialogues.intro);
        }
    }
    // If NPC is a shopkeeper, open trade (currently just logs inventory in console)
    trade() {
        if (this.role !== 'shopkeeper') return;
        console.log('Shop inventory:', this.inventory);
        // (Trade UI could be implemented here)
    }
    // If NPC is a potential companion, recruit them to the party
    recruitToParty() {
        if (this.role === 'companion' && !this.isCompanion) {
            this.isCompanion = true;
            // Add companion as a new character in the party
            const newMember = Game.createCharacter("Ranger", this.name);
            Game.playerParty.push(newMember);
            console.log(`${this.name} has joined your party!`);
        }
    }
}
// Instantiate specific NPCs
const blacksmith = new NPC('Hilda', 'shopkeeper', {
    inventory: [
        { name: 'Iron Sword', price: 100, emoji: '🗡️' },
        { name: 'Shield', price: 80, emoji: '🛡️' }
    ],
    dialogues: { intro: 'blacksmithIntro' }
});
const ranger = new NPC('Elena', 'companion', {
    dialogues: { intro: 'start' }
});
