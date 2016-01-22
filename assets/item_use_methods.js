Game.ItemUseMethods = {};

Game.ItemUseMethods["small health potion"] =  function(ent){
    ent.setCurHp(Math.min(ent.getCurHp() + 2, ent.getMaxHp()));
  };
