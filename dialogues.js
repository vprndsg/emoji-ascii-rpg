// Define dialogue trees for interactive conversations with NPCs or story characters.
window.Game = window.Game || {};
const dialogues = {
    // Old man introductory dialogue (example)
    start: {
        text: "👴 Old Man: Hello, traveler. What brings you to these parts?",
        options: [
            { text: "I'm looking for adventure.", next: "adventure" },
            { text: "Just passing by.", next: "passing" }
        ]
    },
    adventure: {
        text: "Old Man: Adventure, you say? I might have a quest for you... 💡",
        options: [
            { text: "Tell me more.", next: "quest_offer" },
            { text: "No thanks.", next: "endDialogue" }
        ]
    },
    passing: {
        text: "Old Man: Safe travels then. Be on your guard out there. ⚠️",
        options: [
            { text: "(Continue on your way)", next: "endDialogue" }
        ]
    },
    quest_offer: {
        text: "Old Man: Rumor has it a dragon 🐉 dwells in the mountains. Interested?",
        options: [
            { text: "Yes, I'll hunt the dragon!", next: "acceptQuest" },
            { text: "Sounds dangerous... not now.", next: "declineQuest" }
        ]
    },
    acceptQuest: {
        text: "Old Man: Brave soul! The village will sing of your heroism. 🎉",
        options: [
            { text: "(Begin quest 'Dragon Hunt')", next: "endDialogue" }
        ]
    },
    declineQuest: {
        text: "Old Man: I understand. Such a journey isn’t for everyone. 😔",
        options: [
            { text: "(Leave)", next: "endDialogue" }
        ]
    },
    // Blacksmith (Hilda) dialogue tree
    blacksmithIntro: {
        text: "🔨 Hilda: Need a weapon sharpened or some strong iron?",
        options: [
            { text: "Ask about the dragon", next: "node:blacksmithDragon" },
            { text: "Chat about the village", next: "blacksmithVillage" },
            { text: "Return to the square", next: "node:villageExplore" }
        ]
    },
    blacksmithVillage: {
        text: "Hilda: The village may seem quiet, but every blade I make tells a story.",
        options: [
            { text: "Back", next: "blacksmithIntro" },
            { text: "Leave", next: "node:villageExplore" }
        ]
    }
};
// Function to start or continue a dialogue by key
function startDialogue(nodeKey) {
    const dialogBox = document.getElementById('dialogue-box');
    const node = dialogues[nodeKey];
    if (!dialogBox || !node) return;
    // Populate dialogue text
    dialogBox.innerHTML = `<p>${node.text}</p>`;
    // Create option buttons
    node.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.text;
        btn.style.margin = "0.5em";
        btn.onclick = () => {
            if (opt.next && opt.next.startsWith('node:')) {
                // Special case: navigate to a story node
                dialogBox.style.display = 'none';
                const targetNode = opt.next.substring(5);
                if (window.Game && Game.goToNode) {
                    Game.goToNode(targetNode);
                }
            } else if (opt.next === 'endDialogue') {
                // Close the dialogue overlay
                dialogBox.style.display = 'none';
            } else {
                // Continue to next dialogue node
                startDialogue(opt.next);
            }
        };
        dialogBox.appendChild(btn);
    });
    // Show the dialogue overlay box
    dialogBox.style.display = 'block';
}
