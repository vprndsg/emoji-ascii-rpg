// Define ASCII art scenes and special cutscene art, and provide functions to play cutscenes.
window.Game = window.Game || {};
Game.asciiArts = {
    "village": 
`+--------+       
|  __    |      ____
| |  |   |     /    \
| |__|   |    |      |
|        |    | [__] |   A peaceful village.
+--------+    |      |
             |______|`,
    "forest": 
`   ^  ^^   ^^^    ^^^^
   ^^^^  ^^^  ^^   ^^^  ^ 
    ||  ||||   ||   ||   
    ||  ||||   ||   ||   `,
    "dungeon": 
`########### 
#         # 
#   *     #    A dark dungeon corridor.
#         # 
###########`,
    "dragon": 
`                   __====-_  _-====__
         _--^^^#####//      \\#####^^^--_
      _-^##########// (    ) \\##########^-_
     -############//  |\\^^/|  \\############-
   _/############//   (@::@)   \\############\\_
  /#############((     \//     ))#############\\
 -###############\\     )(      //###############-
 -#################\\   **     //#################-
 -###################\\       //###################-
 _#/|##########|\\#######\\_/#######/|##########|\\#_
 |/ |#/#/#\\/#\\/  \\#/##/\\   /\\##/\\#/\\/#/#/#| \\
  \\|/  V  V    V  \\|  \\| | |/  \\|/  V   V   V  \\|`,
    "tombstone":
`   _____
   /     \
  | R.I.P |
  |       |
  |_______|`
};
// ASCII art for special cutscenes
Game.villainArt = String.raw`(\-"""-/)
 //^\   /^\\      ** The Dark Lord Emerges! **
 ;/ ^_ _^ \;     A chilling laugh echoes...
 |  \ Y /  |     "So, hero, you've finally arrived," 
 (,  >@<  ,)     snarls the Dark Lord 😈.
  |   \_/   |    
  | (\___/)_|     * The air crackles with dark energy * 
   \ \/- -\/ /   
    \`===´/    
     '---'`;
Game.romanticArt = String.raw`
   O      O         .-\"\"\"-.
   |\____/|        /       \     * Night sky full of stars *
   |      |       :         :    You share a quiet moment ❤️ 
   |  ♥   |        \       /     with your companion by the fire.
  / \\    / \\        \`-...-' 
 `;
// Play villain encounter cutscene (e.g., Dark Lord appears)
Game.playVillainCutscene = function() {
    const screen = document.getElementById('asciiArt');
    if (screen) {
        screen.textContent = Game.villainArt;
        // Remove cutscene after a short duration
        setTimeout(() => {
            screen.textContent = '';
        }, 5000);
    }
};
// Play romantic campfire cutscene
Game.playRomanticCutscene = function() {
    const screen = document.getElementById('asciiArt');
    if (screen) {
        screen.textContent = Game.romanticArt;
        // Allow player to click to dismiss the scene
        screen.onclick = () => {
            screen.onclick = null;
            screen.textContent = '';
        };
    }
};
