Game.Generator = function(genName, constructorFunction, defaultTemplate){
  this._name = genName;
  this._templates = {};
  this._constructorToUse = constructorFunction;
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function (template, createKeyName){
  // console.log("I'm learning " + createKeyName);
  if (!template.name && !createKeyName){
    // console.log("Generator " + this._name + " can't learn a template that has nonname attribute.");
    // console.dir(template);
    return false;
  }
  createKeyName = createKeyName || template.name;
  this._templates[createKeyName] = template;
  // console.dir(this._templates);
};

Game.Generator.prototype.create = function(createKeyName){
  var templateToUse = this._templates[createKeyName];
  if (!templateToUse) { templateToUse = '_DEFAULT'; }
  templateToUse.generator_template_key = createKeyName;
  return new this._constructorToUse(templateToUse);
};
