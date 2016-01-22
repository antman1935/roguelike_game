Game.ItemGenerator = new Game.Generator('items',Game.Item);

Game.ItemGenerator.learn({
  name: 'rock',
  chr:String.fromCharCode(174),
  fg:'#bbc'
});

Game.ItemGenerator.learn({
  name: 'small health potion',
  chr:"⚱",
  fg:'#faa',
  use: function(ent){
    ent.setCurHp(Math.min(ent.getCurHp() + 2, ent.getMaxHp()));
    console.log("adding health...");
    console.dir(ent);
  },
  mixins: ["Usable"]
});
