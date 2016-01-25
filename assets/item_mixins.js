Game.ItemMixin = {};

Game.ItemMixin.Usable = {
  META: {
    mixinName: "Usable",
    mixinGroup: "Usage",
    stateNamespace: "_Usable_attr",
    stateModel: {}
  }
};

Game.ItemMixin.Equippable = {
  META: {
    mixinName: "Equippable",
    mixinGroup: "Usage",
    stateNamespace: "_Equippable_attr",
    stateModel: {
      _slot: '',
    },
    init: function(template){
      this.attr._Equippable_attr._slot = template.slot || 'NA';
    }
  },
  getSlot: function(){
    return this.attr._Equippable_attr._slot;
  }
};

Game.ItemMixin.MeleeWeapon = {
  META: {
    mixinName: "Melee Weapon",
    mixinGroup: "Weapon",
    stateNamespace: "_MeleeWeapon_attr",
    stateModel: {
      _level: 1,
      _actionPhrase: '',
      "damage": 1,
      "intelligence": 0,
      "strength": 0
    },
    init: function(template){
      this.attr._MeleeWeapon_attr._level = Game.util.getRandomLevel();
      this._determineSkill("damage", template.meleeDamage);
      this._determineSkill("intelligence", template.intelligence);
      this._determineSkill("strength", template.strength);
      this.attr._MeleeWeapon_attr._actionPhrase = template.meleePhrase || 'hit';
    }
  },
  _determineSkill: function(reqname, reqLevel){
    this.attr._MeleeWeapon_attr[reqname] = (reqLevel !== undefined)?reqLevel + reqLevel * Math.floor(this.getLevel() / 5): 1 + Math.round(this.getLevel() / 10);
  },
  getLevel: function(){
    return this.attr._MeleeWeapon_attr._level;
  },
  getAttackDamage: function(attacker){
    if (attacker.getSkillLevel("intelligence") >= this.attr._MeleeWeapon_attr._intelReq){
      if (attacker.getSkillLevel("strength") >= this.attr._MeleeWeapon_attr._strengthReq){
        return Math.round(ROT.RNG.getUniform() * this.attr._MeleeWeapon_attr._damage);
      }else{
        return Math.round((ROT.RNG.getUniform() * this.attr._MeleeWeapon_attr._damage) * (attacker.getSkillLevel("strength") / this.attr._MeleeWeapon_attr._strengthReq));
      }
    }else{
      return 1;
    }
  },
  getActionPhrase: function(){
    return this.attr._MeleeWeapon_attr._actionPhrase;
  }
}
