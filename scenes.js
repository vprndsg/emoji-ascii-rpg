window.Game = window.Game || {};

Game.asciiArts = {
  village:
`+--------+
|  __    |      ____
| |  |   |     /    \
| |__|   |    |      |
|        |    | [__] |   A peaceful village.
+--------+    |      |
             |______|`,
  forest:
`   ^  ^^   ^^^    ^^^^
   ^^^^  ^^^  ^^   ^^^  ^
    ||  ||||   ||   ||
    ||  ||||   ||   ||  `,
  dungeon:
`###########
#         #
#   *     #    A dark corridor.
#         #
###########`,
  dragon:
`                 __====-_  _-====__
      _--^^^#####//      \\#####^^^--_
   _-^##########// (    ) \\##########^_- 
  -############//  |\\^^/|  \\############-
 _/############//   (@::@)   \\############\\_
/#############((     \\//     ))#############\\`
};

Game.villainArt = String.raw`(\-"""-/)
 //^\   /^\     The Dark Lord Emerges
 ;/ ^_ _^ \;    "So, hero, you finally came" 😈`;
Game.romanticArt = String.raw`O   O     * Stars shimmer *
|\_/|     A quiet night by the fire ❤️`;

Game.playVillainCutscene = function(){
  const el = document.getElementById('asciiArt');
  if(!el) return;
  el.textContent = Game.villainArt;
  setTimeout(()=>{ el.textContent = ""; }, 4000);
};
Game.playRomanticCutscene = function(){
  const el = document.getElementById('asciiArt');
  if(!el) return;
  el.textContent = Game.romanticArt;
  el.onclick = ()=>{ el.onclick = null; el.textContent = ""; };
};
