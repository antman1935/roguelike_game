Game.ItemGenerator = new Game.Generator('items',Game.Item);
Game.ITEMS = ["rock", "small health potion", "medium health potion", "large health potion", "stick", "bronze sword"];

Game.ItemGenerator.learn({
  name: 'rock',
  chr:String.fromCharCode(174),
  fg:'#bbc'
});

Game.ItemGenerator.learn({
  name: 'small health potion',
  chr:"⚱",
  fg:'#faa',
  mixins: ["Usable"]
});

Game.ItemGenerator.learn({
  name: 'medium health potion',
  chr:"⚱",
  fg:'#f77',
  mixins: ["Usable"]
});

Game.ItemGenerator.learn({
  name: 'large health potion',
  chr:"⚱",
  fg:'#f44',
  mixins: ["Usable"]
});

Game.ItemGenerator.learn({
  name: 'stick',
  chr:"⚔",
  fg:'#310C0C',
  slot: 'weapon',
  meleeDamage: 2,
  intelligence: 1,
  strength: 1,
  meleePhrase: 'struck',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'bronze sword',
  chr:"⚔",
  fg:'#bd5326',
  slot: 'weapon',
  meleeDamage: 4,
  intelligence: 1,
  strength: 2,
  meleePhrase: 'slashed',
  mixins: ["Equippable", "MeleeWeapon"]
});
