Game.Generator = function(genName, constructorFunction, defaultTemplate){
  this._name = genName;
  this._templates = {};
  this._constructorToUse = constructorFunction;
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function (nameOfTemplate, template){
  console.log("I'm learning " + nameOfTemplate);
  this._templates[nameOfTemplate] = template;
  console.dir(this._templates);
};

Game.Generator.prototype.create = function(nameOfTemplate){
  var templateToUse = this._templates[nameOfTemplate];
  if (!templateToUse) { templateToUse = '_DEFAULT'; }
  return new this._constructorToUse(templateToUse);
};
