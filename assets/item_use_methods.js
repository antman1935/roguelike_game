Game.ItemUseMethods = {};

Game.ItemUseMethods["small health potion"] =  function(ent){
    ent.setCurHp(Math.min(ent.getCurHp() + 4, ent.getMaxHp()));
  };

Game.ItemUseMethods["medium health potion"] =  function(ent){
  ent.setCurHp(Math.min(ent.getCurHp() + 7, ent.getMaxHp()));
};

Game.ItemUseMethods["large health potion"] =  function(ent){
  ent.setCurHp(Math.min(ent.getCurHp() + 10, ent.getMaxHp()));
};
