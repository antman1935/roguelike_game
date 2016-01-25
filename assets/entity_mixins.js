Game.EntityMixin = {};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker',
    mixinGroup: 'Walker',
    listeners: {
      'adjacentMove': function(evtData) {
          var map = this.getMap();
          var dx=evtData.dx,dy=evtData.dy;
          var targetX = this.getX() + dx;
          var targetY = this.getY() + dy;

          if ((targetX < 0) || (targetX >= map.getWidth()) || (targetY < 0) || (targetY >= map.getHeight())) {
            this.raiseSymbolActiveEvent('walkForbidden',{target:Game.Tile.nullTile});
            return {madeAdjacentMove:false};
          }

          if (map.getEntity(targetX,targetY)) { // can't walk into spaces occupied by other entities
            this.raiseSymbolActiveEvent('bumpEntity',{actor:this,recipient:map.getEntity(targetX,targetY)});
            // NOTE: should bumping an entity always take a turn? might have to get some return data from the event (once event return data is implemented)
            return {madeAdjacentMove:true};
          }

          var targetTile = map.getTile(targetX,targetY);
          if (targetTile.isWalkable()) {
            this.setPos(targetX,targetY);
            var myMap = this.getMap();
            if (myMap) {
              myMap.updateEntityLocation(this);
            }
            return {madeAdjacentMove:true};
          } else {
            this.raiseSymbolActiveEvent('walkForbidden',{target:targetTile});
          }
          return {madeAdjacentMove:false};
      }
    }
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
      'actionDone': function(evtData){
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

        this.takeHits(evtData.attackDamage);
        this.raiseSymbolActiveEvent('damagedBy', {damager:evtData.attacker, damageAmount:evtData.attackDamage});
        evtData.attacker.raiseSymbolActiveEvent('dealtDamage',{damagee:this,damageAmount:evtData.attackDamage});
        if (this.getCurHp() <= 0){
          this.raiseSymbolActiveEvent('killed', {entKilled: this, killedBy:evtData.attacker});
          evtData.attacker.raiseSymbolActiveEvent('madeKill', {entKilled:this, killedBy:evtData.attacker});
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
      attackHit: 1,
      attackDamage: 1,
      attackActionDuration: 1000
    },
    init: function (template) {
      this.attr._MeleeAttacker_attr.attackDamage = template.attackDamage || 1;
      this.attr._MeleeAttacker_attr.attackActionDuration = template.attackActionDuration || 1000;
    },
    listeners: {
      'bumpEntity': function(evtData){
        var hitValResp = this.raiseSymbolActiveEvent('calcAttackHit');
        var avoidValResp = evtData.recipient.raiseSymbolActiveEvent('calcAttackAvoid');
        var hitVal = Game.util.compactNumberArray_add(hitValResp.attackHit);
        var avoidVal = Game.util.compactNumberArray_add(avoidValResp.attackAvoid);
        if (ROT.RNG.getUniform()*(hitVal+avoidVal) > avoidVal || (hitVal == 0 && avoidVal == 0)) {
          var hitDamageResp = this.raiseSymbolActiveEvent('calcAttackDamage');
          var damageMitigateResp = evtData.recipient.raiseSymbolActiveEvent('calcDamageMitigation');

          evtData.recipient.raiseSymbolActiveEvent('attacked',{attacker:evtData.actor,attackDamage:Game.util.compactNumberArray_add(hitDamageResp.attackDamage) - Game.util.compactNumberArray_add(damageMitigateResp.damageMitigation)});
        } else {
          evtData.recipient.raiseSymbolActiveEvent('attackAvoided',{attacker:evtData.actor,recipient:evtData.recipient});
          evtData.actor.raiseSymbolActiveEvent('attackMissed',{attacker:evtData.actor,recipient:evtData.recipient});
        }
        this.setCurrentActionDuration(this.attr._MeleeAttacker_attr.attackActionDuration);
      },
      'calcAttackHit': function(evtData) {
        return {attackHit:this.getAttackHit()};
      },
      'calcAttackDamage': function(evtData) {
        return {attackDamage:this.getAttackDamage()};
      }
    }
  },
  getAttackHit: function () {
    return this.getSkillLevel("agility");
  },
  getAttackDamage: function () {
    if (this.hasEquipmentType('weapon')){
      return Math.max(this.getEquipment('weapon').getAttackDamage(this), this.getSkillLevel('strength'));
    }else{
      return this.getSkillLevel('strength');
    }
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
        var num = this.getCurSp();
        this.restoreStamina();
        if (num < this.getCurSp()){
          Game.Message.sendMessage("You recover some energy.");
        }else{
          Game.Message.sendMessage("You lie in wait.")
        }
        Game.renderMessage();
      },
      'removeWall': function(evtData){
        if (this.attr._StaminaPoints_attr.curSp){
          this.decreaseStamina();
          this.getMap().attr._removedWalls[evtData.wallPos.x+","+evtData.wallPos.y] = true;
          Game.Message.sendMessage("You broke down a wall!");
        }else{
          Game.Message.sendMessage("You're too tired to dig!")
        }
        Game.renderMessage();
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

Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
    listeners: {
      'walkForbidden': function(evtData){
        Game.Message.sendMessage("You cannot walk into the " + evtData.target.getName());
        Game.renderMessage();
      },
      'dealtDamage': function(evtData){
        Game.Message.sendMessage("You " +(this.hasEquipmentType('weapon')?this.getEquipment('weapon').getActionPhrase(): "hit")+ " the " +evtData.damagee.getName()+ " for " +evtData.damageAmount);
        Game.renderMessage();
      },
      'madeKill': function(evtData){
        Game.Message.sendMessage("You killed the " + evtData.entKilled.getName());
        Game.renderMessage();
      },
      'damagedBy': function(evtData){
        Game.Message.sendMessage("The " +evtData.damager.getName()+ " " +(evtData.damager.hasEquipmentType('weapon')?evtData.damager.getEquipment('weapon').getActionPhrase(): "hit")+ " you for " + evtData.damageAmount);
        Game.renderMessage();
        Game.Message.ageMessages();
      },
      'killed': function(evtData){
        Game.Message.sendMessage("You were killed by the " +evtData.killedBy.getName());
        Game.renderMessage();
        Game.Message.ageMessages();
      },
      'attackAvoided': function(evtData) {
        Game.Message.sendMessage('you avoided the '+evtData.attacker.getName());
        Game.renderMessage();
        Game.Message.ageMessages(); // NOTE: maybe not do this? If surrounded by multiple attackers messages could be aged out before being seen...
      },
      'attackMissed': function(evtData) {
        Game.Message.sendMessage('you missed the '+evtData.recipient.getName());
        Game.renderMessage();
      },
    }
  }
};

Game.EntityMixin.PlayerActor = {
  META: {
    mixinName: 'PlayerActor',
    mixinGroup: "Actor",
    stateNamespace: '_PlayerActor_attr',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    init: function(template){
      Game.Scheduler.add(this, true, 1);
    },
    listeners: {
      'actionDone': function(evtData){
        Game.Scheduler.setDuration(this.getCurrentActionDuration());
        this.setCurrentActionDuration(this.getBaseActionDuration(), Game.util.randomInt(-5, 5));
        setTimeout(function() {Game.TimeEngine.unlock();}, 1);
        Game.renderMessage();
      }
    }
  },
  getBaseActionDuration: function(){
    return this.attr._PlayerActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function(n){
    this.attr._PlayerActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function(){
    return this.attr._PlayerActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function(n){
    this.attr._PlayerActor_attr.currentActionDuration = n;
  },
  isActing: function(state){
    if (state !== undefined){
      this.attr._PlayerActor_attr.actingState = state;
    }
    return this.attr._PlayerActor_attr.actingState;
  },
  act: function(){
    if (this.isActing()) {return;}
    this.isActing(true);
    Game.renderMain();
    Game.renderAvatar();
    Game.TimeEngine.lock();
    this.isActing(false);
  }
};

Game.EntityMixin.WanderActor = {
  META: {
    mixinName: 'WanderActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      Game.Scheduler.add(this,true, Game.util.randomInt(2, this.getBaseActionDuration()));
      this.attr._WanderActor_attr.baseActionDuration = template.wanderActionDuration || 1000;
      this.attr._WanderActor_attr.currentActionDuration = this.attr._WanderActor_attr.baseActionDuration;
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    return Game.util.positionsAdjacentTo({x:0, y:0}).random();
  },
  act: function () {
    Game.TimeEngine.lock();
    var moveDeltas = this.getMoveDeltas();
    this.raiseSymbolActiveEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseSymbolActiveEvent('actionDone');
    Game.TimeEngine.unlock();
  }
};

Game.EntityMixin.PlayerExperience = {
  META: {
    mixinName: "PlayerExperience",
    mixinGroup: "Skills",
    stateNamespace: "_PlayerExperience_attr",
    stateModel: {
      skillpoints: 0,
      curExp: 0,
      curLevel: 0,
      nextLevel: 1
    },
    listeners: {
      'madeKill': function(evtData){
        this.attr._PlayerExperience_attr.curExp += evtData.entKilled.getExp();
        while (this.attr._PlayerExperience_attr.nextLevel <= this.attr._PlayerExperience_attr.curExp){
          this.levelUp();
          this.attr._PlayerExperience_attr.nextLevel += Math.floor(Math.pow(this.attr._PlayerExperience_attr.nextLevel, 1.1));
        }
      }
    }
  },
  levelUp: function(){
    this.attr._PlayerExperience_attr.curLevel++;
    if (this.attr._PlayerExperience_attr.curLevel >= 10){
      Game.switchUIMode("gameWin");
    }
    this.attr._PlayerExperience_attr.skillpoints += 1 + Math.floor(this.attr._PlayerExperience_attr.curLevel / 5);
    Game.Message.sendMessage("You're now level " +this.attr._PlayerExperience_attr.curLevel);
  },
  getCurLevel: function(){
    return this.attr._PlayerExperience_attr.curLevel;
  },
  getCurExp: function(){
    return this.attr._PlayerExperience_attr.curExp;
  },
  getNextLevelExp: function(){
    return this.attr._PlayerExperience_attr.nextLevel;
  },
  getSkillPoints: function(){
    return this.attr._PlayerExperience_attr.skillpoints;
  },
  spendSkillPoints: function(n){
    this.attr._PlayerExperience_attr.skillpoints -= n;
  }
};

Game.EntityMixin.PlayerSkills = {
  META: {
    mixinName: "PlayerSkills",
    mixinGroup: "Skills",
    stateNamespace: "_PlayerSkills_attr",
    stateModel: {
      "vitality": 1, //health
      "endurance": 1, //stamina
      "strength": 1, //will determine melee damage and carry weight
      "agility": 1, //will determine ability to dodge and successfully hit
      "accuracy": 1, //will determine the effectiveness of all projectiles
      "magicka": 1, //determine magic reserves
      "luck": 1, //determines the value of random drops
      "intelligence": 1, //determines your ability to use certain items
      "permaBuffs": {} // will hold five buffs that the player chooses. they can all be upgraded
    }
  },
  getSkillLevel: function(skillname){
    return this.attr._PlayerSkills_attr[skillname];
  },
  upgrade: function(skill, buff){
    if (buff){
      return this.attr._PlayerSkills_attr["permaBuffs"][skill].upgrade();
    }else if (this.attr._PlayerSkills_attr.hasOwnProperty(skill) && this.getSkillPoints()){
      this.attr._PlayerSkills_attr[skill]++;
      this.spendSkillPoints(1);
      return true;
    }
    return false;
  },
  effect: function(){
    this.setMaxHp(Game.BASE_PLAYER_ATTRIBUTES.maxHp + (Game.BASE_PLAYER_ATTRIBUTES.maxHpGrowth * (this.attr._PlayerSkills_attr["vitality"] - 1)));
    this.setCurHp(this.getMaxHp());
    this.setMaxSp(Game.BASE_PLAYER_ATTRIBUTES.maxSp + (Game.BASE_PLAYER_ATTRIBUTES.maxSpGrowth * (this.attr._PlayerSkills_attr["endurance"] - 1)));
    this.setCurSp(this.getMaxSp());
    for (var buff in this.attr._PlayerSkills_attr["permaBuffs"]) {
      if (this.attr._PlayerSkills_attr["permaBuffs"].hasOwnProperty(buff)) {
        buff.boost(this);
      }
    }
  },
  getNewBuff: function(buff){
    if (this.attr._PlayerSkills_attr["permaBuffs"].length < Math.min(Math.floor(this.attr._PlayerExperience_attr.getCurLevel() / 5), 5)){

    }
  }
};
``
Game.EntityMixin.EnemySkills = {
  META: {
    mixinName: "EnemySkills",
    mixinGroup: "Skills",
    stateNamespace: "_EnemySkills_attr",
    stateModel: {
      "strength": 0, //will determine melee damage and carry weight
      "agility": 0, //will determine ability to dodge and successfully hit
      "intelligence": 0, //determines your ability to use certain items
    },
    init: function(template){
      this.attr._EnemySkills_attr["strength"] = template.strength || 1;
      this.attr._EnemySkills_attr["agility"] = template.agility || 1;
      this.attr._EnemySkills_attr["intelligence"] = template.intelligence || 1;
    }
  },
  getSkillLevel: function(skillname){
    return this.attr._EnemySkills_attr[skillname];
  }
};

Game.EntityMixin.Sight = {
  META: {
    mixinName: 'Sight',
    mixinGroup: 'Sense',
    stateNamespace: '_Sight_attr',
    stateModel: {
      sightRadius: 3
    },
    init: function(template){
      this.attr._Sight_attr.sightRadius = template.sightRadius || 3;
    },
    listeners: {
      'senseForEntity': function(evtData) {
        return {entitySensed:this.canSeeEntity(evtData.senseForEntity)};
      }
    }
  },
  getSightRadius: function(){
    return this.attr._Sight_attr.sightRadius;
  },
  setSightRadius: function(n){
    this.attr._Sight_attr.sightRadius = n;
  },

  canSeeEntity: function(entity) {
      // If not on the same map or on different maps, then exit early
    if (!entity || this.getMapId() !== entity.getMapId()) {
          return false;
    }
    return this.canSeeCoord(entity.getX(),entity.getY());
  },

  canSeeCoord: function(x_or_pos,y) {
    var otherX = x_or_pos,otherY=y;
    if (typeof x_or_pos == 'object') {
      otherX = x_or_pos.x;
      otherY = x_or_pos.y;
    }

    // If we're not within the sight radius, then we won't be in a real field of view either.
    if (Math.max(Math.abs(otherX - this.getX()),Math.abs(otherY - this.getY())) > this.attr._Sight_attr.sightRadius) {
      return false;
    }

    var inFov = this.getVisibleCells();
    return inFov[otherX+','+otherY] || false;
  },
  getVisibleCells: function() {
      var visibleCells = {'byDistance':{}};
      for (var i=0;i<=this.getSightRadius();i++) {
          visibleCells.byDistance[i] = {};
      }
      this.getMap().getFov().compute(
          this.getX(), this.getY(),
          this.getSightRadius(),
          function(x, y, radius, visibility) {
              visibleCells[x+','+y] = true;
              visibleCells.byDistance[radius][x+','+y] = true;
          }
      );
      return visibleCells;
  },
  canSeeCoord_delta: function(dx,dy) {
      return this.canSeeCoord(this.getX()+dx,this.getY()+dy);
  }
};


Game.EntityMixin.MapMemory = {
  META: {
    mixinName: 'MapMemory',
    mixinGroup: 'MapMemory',
    stateNamespace: '_MapMemory_attr',
    stateModel:  {
      mapsHash: {}
    },
    init: function (template) {
      this.attr._MapMemory_attr.mapsHash = template.mapsHash || {};
    }
  },
  rememberCoords: function (coordSet,mapId) {
    var mapKey=mapId || this.getMapId();
    if (! this.attr._MapMemory_attr.mapsHash[mapKey]) {
      this.attr._MapMemory_attr.mapsHash[mapKey] = {};
    }
    for (var coord in coordSet) {
      if (coordSet.hasOwnProperty(coord) && (coord != 'byDistance')) {
        this.attr._MapMemory_attr.mapsHash[mapKey][coord] = true;
      }
    }
  },
  getRememberedCoordsForMap: function (mapId) {
    var mapKey=mapId || this.getMapId();
    return this.attr._MapMemory_attr.mapsHash[mapKey] || {};
  }
};

Game.EntityMixin.WanderChaserActor = {
  META: {
    mixinName: 'WanderChaserActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderChaserActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },
    init: function (template) {
      Game.Scheduler.add(this,true, Game.util.randomInt(2,this.getBaseActionDuration()));
      this.attr._WanderChaserActor_attr.baseActionDuration = template.wanderChaserActionDuration || 1000;
      this.attr._WanderChaserActor_attr.currentActionDuration = this.attr._WanderChaserActor_attr.baseActionDuration;
    }
  },
  getBaseActionDuration: function () {
    return this.attr._WanderChaserActor_attr.baseActionDuration;
  },
  setBaseActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.baseActionDuration = n;
  },
  getCurrentActionDuration: function () {
    return this.attr._WanderChaserActor_attr.currentActionDuration;
  },
  setCurrentActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.currentActionDuration = n;
  },
  getMoveDeltas: function () {
    var avatar = Game.getAvatar();
    var senseResp = this.raiseSymbolActiveEvent('senseForEntity',{senseForEntity:avatar});
    if (Game.util.compactBooleanArray_or(senseResp.entitySensed)) {

      // build a path instance for the avatar
      var source = this;
      var map = this.getMap();
      var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
          // If an entity is present at the tile, can't move there.
          var entity = map.getEntity(x, y);
          if (entity && entity !== avatar && entity !== source) {
              return false;
          }
          return map.getTile(x, y).isWalkable();
      }, {topology: 8});

      // compute the path from here to there
      var count = 0;
      var moveDeltas = {x:0,y:0};
      path.compute(this.getX(), this.getY(), function(x, y) {
          if (count == 1) {
              moveDeltas.x = x - source.getX();
              moveDeltas.y = y - source.getY();
          }
          count++;
      });

      return moveDeltas;
    }
    return Game.util.positionsAdjacentTo({x:0,y:0}).random();
  },
  act: function () {
    Game.TimeEngine.lock();
    var moveDeltas = this.getMoveDeltas();
    this.raiseSymbolActiveEvent('adjacentMove',{dx:moveDeltas.x,dy:moveDeltas.y});
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration()+Game.util.randomInt(-10,10));
    this.raiseSymbolActiveEvent('actionDone');
    Game.TimeEngine.unlock();
  }
};

Game.EntityMixin.MeleeDefender = {
  META: {
    mixinName: 'MeleeDefender',
    mixinGroup: 'Defender',
    stateNamespace: '_MeleeDefenderr_attr',
    stateModel:  {
      attackAvoid: 0,
      damageMitigation: 0
    },
    init: function (template) {
      this.attr._MeleeDefenderr_attr.attackAvoid = template.attackAvoid || 0;
      this.attr._MeleeDefenderr_attr.damageMitigation = template.damageMitigation || 0;
    },
    listeners: {
      'calcAttackAvoid': function(evtData) {
        return {attackAvoid:this.getAttackAvoid()};
      },
      'calcDamageMitigation': function(evtData) {
        return {damageMitigation:this.getDamageMitigation()};
      }
    }
  },
  getAttackAvoid: function () {
    return this.getSkillLevel["agility"] || 0;
  },
  getDamageMitigation: function () {
    return this.attr._MeleeDefenderr_attr.damageMitigation;
  }
};

Game.EntityMixin.Inventory = {
  META: {
    mixinName: 'Inventory',
    mixinGroup: 'Inventory',
    stateNamespace: '_Inventory_attr',
    stateModel: {
      _inventory: {} // {itemName: [ids]}
    },
    init: function(template){
      this.attr._Inventory_attr._inventory = template.inventory || {};
    }
  },
  getInventory: function(){
    return this.attr._Inventory_attr._inventory;
  },
  addItemToInventory: function(item){
    if (this.attr._Inventory_attr._inventory[item.getName()] === undefined){
      this.attr._Inventory_attr._inventory[item.getName()] = [];
    }
    this.attr._Inventory_attr._inventory[item.getName()].push(item.getId());
  },
  removeItem: function(itemName){
    if (this.attr._Inventory_attr._inventory[itemName] !== undefined){
      if (this.attr._Inventory_attr._inventory[itemName].length > 0){
        var itemId = this.attr._Inventory_attr._inventory[itemName].pop();
        if (this.attr._Inventory_attr._inventory[itemName].length == 0){
          delete this.attr._Inventory_attr._inventory[itemName];
        }
        return Game.DATASTORE.ITEM[itemId];
      }
    }
    return null;
  },
  useItem: function(itemName){
    var item = this.removeItem(itemName);
    if (item !== null){
      if (item.hasMixin('Usable')){
        item.use(this);
        return true;
      }else{
        this.addItem(item);
        Game.Message.sendMessage("You can't use that item.");
        return false;
      }
    }
  },
  discardItem: function(itemName){
    var item = this.removeItem(itemName);
    if (item !== null){
      this.getMap().addItem(item, this.getPos());
      return true;
    }else{
      this.addItemToInventory(item);
      Game.Message.sendMessage("You can't do that here.");
      return false;
    }
  }
};

Game.EntityMixin.Equipped = {
  META: {
    mixinName: 'Equipped',
    mixinGroup: 'Inventory',
    stateNamespace: "_Equipped_attr",
    stateModel: {
      'helmet': null,
      'chest plate': null,
      'gauntlets': null,
      'grieves': null,
      'cape': null,
      'weapon': null,
      'ammo': null
    }
  },
  hasEquipmentType: function(slot){
    return this.attr._Equipped_attr[slot] !== null;
  },
  equip: function(itemName){
    var item = this.removeItem(itemName);
    if (! item.hasMixin("Equippable")){
      Game.Message.sendMessage("You can't equip that.");
      Game.renderMessage();
      this.addItemToInventory(item);
      return false;
    }
    if (this.hasEquipmentType(item.getSlot())){
      this.addItemToInventory(this.getEquipment(item.getSlot()));
    }
    this.setEquipment(item.getSlot(), item);
    Game.Message.sendMessage(item.getName() + " equipped.");
    return true;
  },
  getEquipment: function(slot){
    return this.attr._Equipped_attr[slot];
  },
  setEquipment: function(slot, item){
    this.attr._Equipped_attr[slot] = item;
  }
};
