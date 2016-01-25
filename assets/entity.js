Game.DATASTORE.ENTITY = {};

Game.Entity = function(template){
  template = template || {};
  this._mixinSet = Game.EntityMixin;
  Game.SymbolActive.call(this, template);
  this.attr._exp = template.exp || 0;
  this.attr._generator_template_key = template.generator_template_key || '';

  Game.DATASTORE.ENTITY[this.attr._id] = this;
};
Game.Entity.extend(Game.SymbolActive);

Game.Entity.prototype.destroy = function(){
  //remove from map (turn into red X)
  this.getMap().extractEntity(this);
  Game.DATASTORE.ENTITY[this.getId()] = undefined;
  Game.Scheduler.remove(this);
};

Game.Entity.prototype.getExp = function(){
  return this.attr._EnemySkills_attr["exp"];
};
