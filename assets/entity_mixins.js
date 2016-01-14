Game.EntityMixin = {};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },
  tryWalk: function(map, dx, dy){
    var targetX = Math.min(Math.max(0, this.getX() + dx), map.getWidth());
    var targetY = Math.min(Math.max(0, this.getY() + dy), map.getHeight());
    if (map.getEntity(targetX, targetY)){
      this.raiseEntityEvent('bumpEntity', {actor:this, recipient:map.getEntity(targetX, targetY)});
      this.raiseEntityEvent('tookTurn');
      return true;
    }
    if (map.getTile(targetX, targetY).isWalkable()){
      this.setPos(targetX, targetY);
      var myMap = this.getMap();
      if (myMap){
        myMap.updateEntityLocation(this);
      }
      this.raiseEntityEvent('tookTurn');
      return true;
    }
    return false;
  }
};
Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel: {
       turnCounter: 0,
       killLog: {},
       deathMessage: ''
    },
    listeners: {
      'tookTurn': function(evtData){
        this.trackTurn();
      },
      'madeKill': function(evtData){
        this.addKill(evtData.entKilled)
      },
      'killed': function(evtData){
        this.attr._Chronicle_attr.deathMessage = 'killed by ' +evtData.killedBy.getName();
      }
    }
  },
  trackTurn: function(){
    this.attr._Chronicle_attr.turnCounter++;
  },
  getTurns: function(){
    return this.attr._Chronicle_attr.turnCounter;
  },
  setTurns: function(n){
    this.attr._Chronicle_attr.turnCounter = n;
  },
  getKills: function(){
    return this.attr._Chronicle_attr.killLog;
  },
  clearKills: function(){
    this.attr._Chronicle_attr.killLoh = {};
  },
  addKill: function(entKilled){
    var entName = entKilled.getName();
    if (this.attr._Chronicle_attr.killLog[entName]){
      this.attr._Chronicle_attr.killLog[entName]++;
    }else{
      this.attr._Chronicle_attr.killLog[entName] = 1;
    }
  }
};
Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',
    stateModel: {
      maxHp: 1,
      curHp: 1
    },
    init: function (template){
      this.attr._HitPoints_attr.maxHp = template.maxHp || 1;
      this.attr._HitPoints_attr.curHp = template.curHP || this.attr._HitPoints_attr.maxHp;
    },
    listeners: {
      'attacked': function(evtData){

        this.takeHits(evtData.attackPower);
        this.raiseEntityEvent('damagedBy', {damager:evtData.attacker, damageAmount:evtData.attackPower});
        if (this.getCurHp() <= 0){
          this.raiseEntityEvent('killed', {entKilled: this, killedBy:evtData.attacker});
          evtData.attacker.raiseEntityEvent('madeKill', {entKilled:this, killedBy:evtData.attacker});
        }
      },
      'killed': function(evtData){
        this.destroy();
      }
    }
  },
  getMaxHp: function(){
    return this.attr._HitPoints_attr.maxHp;
  },
  setMaxHp: function(n){
    this.attr._HitPoints_attr.maxHp = n;
  },
  getCurHp: function() {
    return this.attr._HitPoints_attr.curHp;
  },
  setCurHp: function(n){
    this.attr._HitPoints_attr.curHp = n;
  },
  takeHits: function(dmg){
    this.attr._HitPoints_attr.curHp -= dmg;
  },
  recoverHits: function(amt){
    this.attr._HitPoints_attr.curHp = Math.min(this.attr._HitPoints_attr.curHp + amt, this.attr._HitPoints_attr.maxHp);
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',
    stateModel: {
      attackPower: 1
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
    },
    listeners: {
      'bumpEntity': function(evtData){
        evtData.recipient.raiseEntityEvent('attacked', {attacker: evtData.actor, attackPower: this.getAttackPower()});
      }
    }
  },
  getAttackPower: function(){
      return this.attr._MeleeAttacker_attr.attackPower;
  }
};

Game.EntityMixin.StaminaPoints = {
  META: {
    mixinName: 'StaminaPoints',
    mixinGroup: 'StaminaPoints',
    stateNamespace: '_StaminaPoints_attr',
    stateModel: {
      maxSp: 1,
      curSp: 1
    },
    init: function (template){
      this.attr._StaminaPoints_attr.maxSp = template.maxSp || 1;
      this.attr._StaminaPoints_attr.curSp = template.curSP || this.attr._StaminaPoints_attr.maxSp;
    },
    listeners: {
      'wait': function(evtData){
        this.restoreStamina();
        this.raiseEntityEvent('tookTurn');
      },
      'removeWall': function(evtData){
        if (this.attr._StaminaPoints_attr.curSp){
          this.decreaseStamina();
          this.getMap().attr._removedWalls[evtData.wallPos.x+","+evtData.wallPos.y] = true;
          this.raiseEntityEvent('tookTurn');
        }else{
          Game.Message.sendMessage("You're too tired to dig!")
        }
      }
    }
  },
  getMaxSp: function(){
    return this.attr._StaminaPoints_attr.maxSp;
  },
  setMaxSp: function(n){
    this.attr._StaminaPoints_attr.maxSp = n;
  },
  getCurSp: function() {
    return this.attr._StaminaPoints_attr.curSp;
  },
  setCurSp: function(n){
    this.attr._StaminaPoints_attr.curSp = n;
  },
  decreaseStamina: function(){
    this.attr._StaminaPoints_attr.curSp--;
  },
  restoreStamina: function(amt){
    //eventually stamina regeneration will be based on entity attributes
    this.attr._StaminaPoints_attr.curSp++;
    this.attr._StaminaPoints_attr.curSp = Math.min(this.attr._StaminaPoints_attr.curSp, this.attr._StaminaPoints_attr.maxSp);
  }
};
