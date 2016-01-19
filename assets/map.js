Game.DATASTORE.MAP = {};

Game.Map = function (mapTileSetName, presetId) {
  // console.log("setting up new map using " +mapTileSetName+ " tile set");

  this._tiles = Game.MapTileSets[mapTileSetName].getMapTiles();

  this.attr = {
    _id: presetId || Game.util.uniqueId(),
    _mapTileSetName: mapTileSetName,
    _width: this._tiles.length,
    _height: this._tiles[0].length,
    _entitiesByLocation: {},
    _locationsByEntity: {},
    _removedWalls: {}
  };

  Game.DATASTORE.MAP[this.attr._id] = this;
};

Game.Map.prototype.getId = function(){
  return this.attr._id;
};

Game.Map.prototype.getWidth = function () {
  return this.attr._width;
};

Game.Map.prototype.getHeight = function () {
  return this.attr._height;
};

Game.Map.prototype.getTile = function (x_or_xy,y) {
  var useX = x_or_xy, useY = y;
  if (typeof x_or_xy == 'object'){
    useY = useX.y;
    useX = useX.x;
  }
  if ((useX<0) || (useX >= this.attr._width) || (useY<0) || (useY>= this.attr._height)) {
    return Game.Tile.nullTile;
  }
  if (this.attr._removedWalls[useX+","+useY]){
    return Game.Tile.floorTile;
  }
  return this._tiles[useX][useY] || Game.Tile.nullTile;
};

Game.Map.prototype.renderOn = function (display,camX,camY) {
  // console.log("display is ");
  // console.dir(display);
  var dims = Game.util.getDisplayDim(display);
  var xStart = camX-Math.round(dims.w/2);
  var yStart = camY-Math.round(dims.h/2);
  for (var x = 0; x < dims.w; x++) {
    for (var y = 0; y < dims.h; y++) {
      // Fetch the glyph for the tile and render it to the screen - sub in wall tiles for nullTiles / out-of-bounds
      var mapPos = {x:x + xStart, y:y + yStart};
      var tile = this.getTile(mapPos);
      if (tile.getName() == 'nullTile') {
        tile = Game.Tile.wallTile;
      }
      if (this.attr._removedWalls[mapPos.x+","+mapPos.y]){
        tile = Game.Tile.floorTile;
      }
      tile.draw(display,x,y);
      var ent = this.getEntity(mapPos);
      if (ent) {
        ent.draw(display, x, y);
      }
    }
  }
};

Game.Map.prototype.getRandomLocation = function(filter_func){
  if (filter_func === undefined){
    filter_func = function(tile) { return true; };
  }
  var tX, tY, t;
  do{
    tX = Game.util.randomInt(0, this.attr._width - 1);
    tY = Game.util.randomInt(0, this.attr._height - 1);
    t = this.getTile(tX, tY);
  }while (!filter_func(t));
  return {x:tX, y:tY};
};

Game.Map.prototype.getRandomWalkableLocation = function(){
  return this.getRandomLocation(function(t){ return t.isWalkable(); });
};

Game.Map.prototype.addEntity = function (ent, pos) {
  this.attr._entitiesByLocation[pos.x+","+pos.y] = ent.getId();
  this.attr._locationsByEntity[ent.getId()] = pos.x+","+pos.y;
  ent.setMap(this);
  ent.setPos(pos)
};

Game.Map.prototype.updateEntityLocation = function(ent){
  var origLoc = this.attr._locationsByEntity[ent.getId()];
  if (origLoc){
    this.attr._entitiesByLocation[origLoc] = undefined;
  }
  var pos = ent.getPos();
  this.attr._entitiesByLocation[pos.x+","+pos.y] = ent.getId();
  this.attr._locationsByEntity[ent.getId()] = pos.x+","+pos.y;
};

Game.Map.prototype.getEntity = function (x_or_xy, y){
  var useX = x_or_xy, useY = y;
  if (typeof useX == 'object'){
    useY = useX.y;
    useX = useX.x;
  }
  var entId = this.attr._entitiesByLocation[useX+","+useY];
  return entId ? Game.DATASTORE.ENTITY[entId] : false;
  // return this.attr._entitiesByLocation[useX+','+useY] || false;
};

Game.Map.prototype.extractEntity = function(ent){
  this.attr._entitiesByLocation[ent.getX()+","+ent.getY()] = undefined;
  this.attr._locationsByEntity[ent.getId()] = undefined;
  return ent;
};

Game.Map.prototype.extractEntityAt = function(x_or_xy, y){
  var ent = this.getEntity(x_or_xy, y);
  if (ent){
    this.attr._entitiesByLocation[ent.getX()+","+ent.getY()] = undefined;
    this.attr._locationsByEntity[ent.getId()] = undefined;
  }
  return ent;
}

Game.Map.prototype.toJSON = function(){
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};

Game.Map.prototype.fromJSON = function(json){
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};
