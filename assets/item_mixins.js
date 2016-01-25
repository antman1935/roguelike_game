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
      _damage: 1,
      _actionPhrase: '',
      _intelReq: 0,
      _strengthReq: 0
    },
    init: function(template){
      this.attr._MeleeWeapon_attr._damage = template.meleeDamage || 1;
      this.attr._MeleeWeapon_attr._actionPhrase = template.meleePhrase || 'hit';
      this.attr._MeleeWeapon_attr._intelReq = template.intelligenceReq || 0;
      this.attr._MeleeWeapon_attr._strengthReq = template.strengthReq || 0;
    }
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
