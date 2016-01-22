Game.SymbolActive = function(template){
  template = template || {};
  Game.Symbol.call(this, template);
  this.attr._name = template.name || '';
  this.attr._id = template.presetId || Game.util.uniqueId();
  this.attr._mapId = null;
  this.attr._x = template.x || 0;
  this.attr._y = template.y || 0;

  this._mixinNames = template.mixins || [];
  this._mixins = [];
  for (var i = 0; i < this._mixinNames.length; i++) {
    this._mixins.push(this._mixinSet[this._mixinNames[i]]);
  }

  this._mixinTracker = {};
  if (template.hasOwnProperty('mixins')){
    for (var mi = 0; mi < this._mixins.length; mi++) {
      var mixin = this._mixins[mi];
      this._mixinTracker[mixin.META.mixinName] = true;
      this._mixinTracker[mixin.META.mixinGroup] = true;
      for (var mixinProp in mixin){
        if (mixinProp != 'META' && mixin.hasOwnProperty(mixinProp)){
          this[mixinProp] = mixin[mixinProp];
        }
      }
      if (mixin.META.hasOwnProperty('stateNamespace')){
        this.attr[mixin.META.stateNamespace] = {};
        for (var mixinStateProp in mixin.META.stateModel) {
          if (mixin.META.stateModel.hasOwnProperty(mixinStateProp)) {
            if (typeof mixin.META.stateModel[mixinStateProp] == 'object'){
              this.attr[mixin.META.stateNamespace][mixinStateProp] = JSON.parse(JSON.stringify(mixin.META.stateModel[mixinStateProp]));
            }else {
              this.attr[mixin.META.stateNamespace][mixinStateProp] = mixin.META.stateModel[mixinStateProp];
            }
          }
        }
      }
      if (mixin.META.hasOwnProperty('init')){
        mixin.META.init.call(this, template);
      }
    }
  }
};
Game.SymbolActive.extend(Game.Symbol);

Game.SymbolActive.prototype.hasMixin = function(mixin){
  if (typeof mixin == 'object'){
    return this._mixinTracker.hasOwnProperty(mixin.META.mixinName);
  }else{
    return this._mixinTracker.hasOwnProperty(mixin);
  }
};
Game.SymbolActive.prototype.raiseSymbolActiveEvent = function(evtLabel, evtData){
  var response = {};
  for (var i = 0; i < this._mixins.length; i++) {
    var mixin = this._mixins[i];
    if (mixin.META.listeners && mixin.META.listeners[evtLabel]){
      var resp = mixin.META.listeners[evtLabel].call(this, evtData);
      for (var respKey in resp) {
        if (resp.hasOwnProperty(respKey)) {
          if (! response[respKey]) {response[respKey] = [];}
          response[respKey].push(resp[respKey]);
        }
      }
    }
  }
  return response;
};

Game.SymbolActive.prototype.getName = function() {
    return this.attr._name;
};
Game.SymbolActive.prototype.setName = function(name) {
    this.attr._name = name;
};

Game.SymbolActive.prototype.toJSON = function () {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};
Game.SymbolActive.prototype.fromJSON = function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};

Game.SymbolActive.prototype.getId = function(){
  return this.attr._id;
};

Game.SymbolActive.prototype.getMap = function(){
  return Game.DATASTORE.MAP[this.attr._mapId];
};
Game.SymbolActive.prototype.getMapId = function(){
  return this.attr._mapId;
};
Game.SymbolActive.prototype.setMap = function(map){
  this.attr._mapId = map.getId();
};

Game.SymbolActive.prototype.getPos = function(){
  return {x:this.attr._x, y:this.attr._y};
};
Game.SymbolActive.prototype.setPos = function(x_or_xy,y) {
  if (typeof x_or_xy == 'object') {
    this.attr._x = x_or_xy.x;
    this.attr._y = x_or_xy.y;
  } else {
    this.attr._x = x_or_xy;
    this.attr._y = y;
  }
};
Game.SymbolActive.prototype.getX = function() {
    return this.attr._x;
};
Game.SymbolActive.prototype.setX = function(x) {
    this.attr._x = x;
};
Game.SymbolActive.prototype.setY = function(y) {
    this.attr._y = y;
};
Game.SymbolActive.prototype.getY   = function() {
    return this.attr._y;
};
