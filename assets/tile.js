Game.Tile = function (properties) {
  properties = properties || {};
  Game.Symbol.call(this, properties);
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._name = properties.name || 'unknown';
  this.attr._walkable = properties.walkable||false;
  this.attr._diggable = properties.diggable||false;
  this.attr._transparent = properties.transparent || false;
  this.attr._opaque = (properties.opaque !== undefined) ? properties.opaque : (! this.attr._transparent);
  this.attr._transparent = ! this.attr._opaque;
};
Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
  return this.attr._name;
};

Game.Tile.prototype.isWalkable = function(){
  return this.attr._walkable;
};

Game.Tile.prototype.isDiggable = function(){
  return this.attr._diggable;
};

Game.Tile.prototype.isOpaque = function(){
  return this.attr._opaque;
};

Game.Tile.prototype.isTransparent = function(){
  return this.attr._transparent;
};

Game.Tile.nullTile = new Game.Tile({name: 'nullTile'});
Game.Tile.floorTile = new Game.Tile({name:'floorTile', chr: '.', walkable: true, transparent: true});
Game.Tile.wallTile = new Game.Tile({name:'wallTile', chr: '#', diggable: true});
