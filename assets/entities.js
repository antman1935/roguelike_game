Game.ALL_ENTITIES = {};
Game.EntityGenerator = new Game.Generator('entities', Game.Entity);
Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  maxSp: 10,
  mixins: [Game.EntityMixin.WalkerCorporeal, Game.EntityMixin.HitPoints, Game.EntityMixin.Chronicle, Game.EntityMixin.MeleeAttacker, Game.EntityMixin.StaminaPoints, Game.EntityMixin.PlayerMessager, Game.EntityMixin.PlayerExperience, Game.EntityMixin.PlayerSkills]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#6b6',
  exp: 1,
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr: '~',
  fg: '#aaa',
  exp: 2,
  maxHp: 2,
  mixins: [Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn({
  name: 'goblin',
  chr: 'G',
  fg: '#f22',
  exp: 3,
  maxHp: 4,
  mixins: [Game.EntityMixin.HitPoints]
});
