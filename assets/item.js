Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
    template = template || {};
    this._mixinSet = Game.ItemMixin;
    Game.SymbolActive.call(this, template);
    this.attr._generator_template_key = template.generator_template_key || '';

    Game.DATASTORE.ITEM[this.attr._id] = this;
};
Game.Item.extend(Game.SymbolActive);

Game.Item.prototype.pickUp = function(){
  if (this.getMap() !== undefined){//added this check so  that I can add items directly to inventory for dev testing. in reality, items should always have a map
    var coord = this.getPos().x + ',' + this.getPos().y;
    var index = this.getMap().attr._itemsByLocation[coord].indexOf(this.getId());
    this.getMap().attr._itemsByLocation[coord].splice(index, 1);
    if (this.getMap().attr._itemsByLocation[coord].length == 0){
      this.getMap().attr._itemsByLocation[coord] = undefined;
    }
  }
  return this;
};

Game.Item.prototype.use = function(ent){
  if (this.hasMixin("Usable")){
    Game.ItemUseMethods[this.getName()](ent);
    Game.DATASTORE.ITEM[this.getId()] = undefined;
  }
}
