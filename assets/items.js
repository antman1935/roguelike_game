Game.ItemGenerator = new Game.Generator('items',Game.Item);
Game.ITEMS = ["rock", "small health potion", "medium health potion", "large health potion", "stick", "bronze sword", "bronze hammer", "bronze staff", "iron sword", "iron hammer", "iron staff", "tempered steel sword", "tempered steel hammer", "tempered steel staff",
              "leather helmet", "leather grieves", "leather gauntlets", "leather chest plate", "chicken kicker's cape",
              "chainmail helmet", "chainmail grieves", "chainmail gauntlets", "chainmail chest plate", "midlevel manager's cape",
              "iron helmet", "iron grieves", "iron gauntlets", "iron chest plate", "knight's cape"];
Game.WEAPONS = ["stick", "bronze sword", "bronze hammer", "bronze staff", "iron sword", "iron hammer", "iron staff", "tempered steel sword", "tempered steel hammer", "tempered steel staff"]; //hammer: ⚒, staff: ⚚,
Game.ARMOR = ["leather helmet", "leather grieves", "leather gauntlets", "leather chest plate", "chicken kicker's cape",
              "chainmail helmet", "chainmail grieves", "chainmail gauntlets", "chainmail chest plate", "midlevel manager's cape",
              "iron helmet", "iron grieves", "iron gauntlets", "iron chest plate", "knight's cape"];

Game.ItemGenerator.learn({
  name: 'chainmail helmet',
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "helmet",
  damageResist: 2,
  intelligence: 2,
  strength: 2,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'chainmail chest plate',
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "chest plate",
  damageResist: 4,
  intelligence: 2,
  strength: 4,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'chainmail gauntlets',
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "gauntlets",
  damageResist: 2,
  intelligence: 2,
  strength: 2,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'chainmail grieves',
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "grieves",
  damageResist: 2,
  intelligence: 2,
  strength: 2,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: "midlevel manager's cape",
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "cape",
  damageResist: 2,
  intelligence: 2,
  strength: 2,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'leather helmet',
  chr:"⛨",
  fg:'#927B51',
  slot: "helmet",
  damageResist: 1,
  intelligence: 1,
  strength: 1,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'leather chest plate',
  chr:"⛨",
  fg:'#927B51',
  slot: "chest plate",
  damageResist: 2,
  intelligence: 1,
  strength: 2,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'leather gauntlets',
  chr:"⛨",
  fg:'#927B51',
  slot: "gauntlets",
  damageResist: 1,
  intelligence: 1,
  strength: 1,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'leather grieves',
  chr:"⛨",
  fg:'#927B51',
  slot: "grieves",
  damageResist: 1,
  intelligence: 1,
  strength: 1,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: "chicken kicker's cape",
  chr:"⛨",
  fg:'#fff',
  slot: "cape",
  damageResist: 1,
  intelligence: 1,
  strength: 1,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
  name: 'iron helmet',
  chr:"⛨",
  fg:'#E6E7E8',
  slot: "helmet",
  damageResist: 4,
  intelligence: 4,
  strength: 4,
  mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
name: 'iron chest plate',
chr:"⛨",
fg:'#E6E7E8',
slot: "chest plate",
damageResist: 8,
intelligence: 4,
strength: 8,
mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
name: 'iron gauntlets',
chr:"⛨",
fg:'#E6E7E8',
slot: "gauntlets",
damageResist: 4,
intelligence: 4,
strength: 4,
mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
name: 'iron grieves',
chr:"⛨",
fg:'#E6E7E8',
slot: "grieves",
damageResist: 4,
intelligence: 4,
strength: 4,
mixins: ["Equippable", "Armor"]
});

Game.ItemGenerator.learn({
name: "knight's cape",
chr:"⛨",
fg:'#E6E7E8',
slot: "cape",
damageResist: 4,
intelligence: 4,
strength: 4,
mixins: ["Equippable", "Armor"]
});



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
  chr:"⛌",
  fg:'#310C0C',
  slot: 'weapon',
  meleeDamage: 1,
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
  meleeDamage: 2,
  intelligence: 1,
  strength: 2,
  meleePhrase: 'slashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'bronze hammer',
  chr:"⚒",
  fg:'#bd5326',
  slot: 'weapon',
  meleeDamage: 4,
  intelligence: 1,
  strength: 4,
  meleePhrase: 'smashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'bronze staff',
  chr:"⚚",
  fg:'#bd5326',
  slot: 'weapon',
  meleeDamage: 3,
  intelligence: 3,
  strength: 1,
  meleePhrase: 'impaled',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'iron sword',
  chr:"⚔",
  fg:'#E6E7E8',
  slot: 'weapon',
  meleeDamage: 5,
  intelligence: 3,
  strength: 3,
  meleePhrase: 'slashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'iron hammer',
  chr:"⚒",
  fg:'#E6E7E8',
  slot: 'weapon',
  meleeDamage: 7,
  intelligence: 2,
  strength: 7,
  meleePhrase: 'smashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'iron staff',
  chr:"⚚",
  fg:'#E6E7E8',
  slot: 'weapon',
  meleeDamage: 5,
  intelligence: 3,
  strength: 2,
  meleePhrase: 'impaled',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'tempered steel sword',
  chr:"⚔",
  fg:'#7b9095',
  slot: 'weapon',
  meleeDamage: 8,
  intelligence: 3,
  strength: 4,
  meleePhrase: 'slashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'tempered steel hammer',
  chr:"⚒",
  fg:'#7b9095',
  slot: 'weapon',
  meleeDamage: 10,
  intelligence: 3,
  strength: 5,
  meleePhrase: 'smashed',
  mixins: ["Equippable", "MeleeWeapon"]
});

Game.ItemGenerator.learn({
  name: 'tempered steel staff',
  chr:"⚚",
  fg:'#7b9095',
  slot: 'weapon',
  meleeDamage: 7,
  intelligence: 5,
  strength: 3,
  meleePhrase: 'impaled',
  mixins: ["Equippable", "MeleeWeapon"]
});
