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
    this.getMap().attr._itemsByLocation[this.getPos().x + ',' + this.getPos().y] = undefined;
  }
  return this;
};
