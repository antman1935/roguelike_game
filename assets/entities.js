Game.ALL_ENTITIES = {};
Game.EntityGenerator = new Game.Generator('entities', Game.Entity);
Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  maxSp: 10,
  mixins: ["WalkerCorporeal", "HitPoints", "Chronicle", "MeleeAttacker", "StaminaPoints", "PlayerMessager", "PlayerExperience", "PlayerSkills", "PlayerActor"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#6b6',
  exp: 1,
  maxHp: 1,
  mixins: ["HitPoints"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr: '~',
  fg: '#f98',
  exp: 2,
  maxHp: 2,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal"]
});

Game.EntityGenerator.learn({
  name: 'goblin',
  chr: 'G',
  fg: '#f22',
  exp: 3,
  maxHp: 4,
  mixins: ["HitPoints"]
});
