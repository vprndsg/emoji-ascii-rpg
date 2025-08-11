window.Game = window.Game || {};

class NPC {
  constructor(name, role, opts={}){
    this.name = name;
    this.role = role;
    this.inventory = opts.inventory || [];
    this.dialogues = opts.dialogues || {};
  }
  talk(){
    if(this.dialogues.intro) startDialogue(this.dialogues.intro);
  }
}

const blacksmith = new NPC('Hilda','shopkeeper',{
  inventory: [{name:'Iron Sword',price:100,emoji:'🗡️'},{name:'Shield',price:80,emoji:'🛡️'}],
  dialogues: { intro: 'blacksmithIntro' }
});
