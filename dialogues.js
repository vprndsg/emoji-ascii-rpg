window.Game = window.Game || {};

const dialogues = {
  start: {
    text: "👴 Old Man, traveler, the dragon burns our fields, will you help",
    options: [
      { text: "Yes, I will help", next: "quest_offer" },
      { text: "No, not now", next: "endDialogue" }
    ]
  },
  quest_offer: {
    text: "Seek the seer in the forest, there you will learn how to find the Ancient Sword",
    options: [
      { text: "I will go", next: "node:forestEntrance" },
      { text: "I need to prepare", next: "node:villageExplore" }
    ]
  },
  blacksmithIntro: {
    text: "🔨 Hilda, need a blade sharpened or a tip on the dragon",
    options: [
      { text: "Ask about dragon", next: "node:blacksmithDragon" },
      { text: "Chat about village", next: "blacksmithVillage" },
      { text: "Back to square", next: "node:villageExplore" }
    ]
  },
  blacksmithVillage: {
    text: "Every blade tells a story, keep yours sharp and your heart steady",
    options: [
      { text: "Back", next: "blacksmithIntro" },
      { text: "Leave", next: "node:villageExplore" }
    ]
  }
};

function startDialogue(nodeKey){
  const box = document.getElementById('dialogue-box');
  const node = dialogues[nodeKey];
  if(!box || !node) return;
  box.innerHTML = `<p>${node.text}</p>`;
  node.options.forEach(opt=>{
    const b = document.createElement('button');
    b.textContent = opt.text;
    b.onclick = ()=>{
      if(opt.next && opt.next.startsWith('node:')){
        box.style.display = 'none';
        const id = opt.next.slice(5);
        Game.goToNode(id);
      }else if(opt.next === 'endDialogue'){
        box.style.display = 'none';
      }else{
        startDialogue(opt.next);
      }
    };
    box.appendChild(b);
  });
  box.style.display = 'block';
}
