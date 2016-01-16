Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gamePersistence = {
    enter: function(){
      // console.log("Game.UIMode.gamePersistence enter");
    },
    exit: function() {
      // console.log("Game.UIMode.gamePersistence exit");
    },
    handleInput: function(eventType, evt){
      // console.log(eventType);
      // console.dir(evt);
      if (eventType == 'keypress'){
        if (evt.keyCode == ROT.VK_S){
          // console.log("save");
          this.saveGame();
        }else if (evt.keyCode == ROT.VK_L){
          // console.log("load");
          this.restoreGame();
        }else if (evt.keyCode == ROT.VK_N){
          // console.log("new game");
          this.newGame();
        }
      }
    },
    saveGame: function(){
      if (this.localStorageAvailable()){
        Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
        Game.DATASTORE.MESSAGE = Game.Message.attr;
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    restoreGame: function() {
      if (this.localStorageAvailable()){
        var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
        var state_data = JSON.parse(json_state_data);

        // console.log('state_data:');
        // console.dir(state_data);

        //game level
        Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

        //map restoration
        for (var mapId in state_data.MAP) {
          if (state_data.MAP.hasOwnProperty(mapId)) {
            var mapAttr = JSON.parse(state_data.MAP[mapId]);
            // console.log("restoring map " +mapId+ " with attributes");
            // console.dir(mapAttr);
            Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
            Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
          }
        }

        //entity restoration
        for (var entityId in state_data.ENTITY) {
          if (state_data.ENTITY.hasOwnProperty(entityId)) {
            var entAttr = JSON.parse(state_data.ENTITY[entityId]);
            Game.DATASTORE.ENTITY[entityId] = Game.EntityGenerator.create(entAttr._generator_template_key);
            Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]); // restores entity attr
          }
        }

        Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
        Game.Message.attr = state_data.MESSAGE;
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    newGame: function () {
      Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
      Game.UIMode.gamePlay.setupNewGame();
      Game.switchUIMode(Game.UIMode.gamePlay);
    },
    localStorageAvailable: function () { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  	   try {
  	     var x = '__storage_test__';
  	     window.localStorage.setItem(x, x);
  		   window.localStorage.removeItem(x);
         return true;
  	   } catch(e) {
         Game.Message.sendMessage('Sorry, no local data storage is available for this browser');
  		   return false;
  	   }
    },
    renderOnMain: function(display){
      // console.log("Game.UIMode.gamePersistence rendrOnMain");
      display.clear();
      display.drawText(0, 0, "Press S to save your game, L to load a game, or N to start a new one.");
    },
    BASE_toJSON: function(state_hash_name){
      var state = this.attr;
      if (state_hash_name){
        state = this[state_hash_name];
      }
      var json = JSON.stringify(state);
      // for (var at in state) {
      //   if (state.hasOwnProperty(at)) {
      //     if (state[at] instanceof Object && 'toJSON' in state[at]){
      //       json[at] = state[at].toJSON();
      //     }else{
      //       json[at] = state[at];
      //     }
      //   }
      // }
      return json;
    },
    BASE_fromJSON: function (json, state_hash_name){
      var using_state_hash = state_hash_name  || 'attr';
      // for (var at in this[using_state_hash]) {
      //   if (this[using_state_hash].hasOwnProperty(at)) {
      //     if ((this[using_state_hash][at] instanceof Object) &&
      //            ('fromJSON' in this[using_state_hash][at])) {
      //       this[using_state_hash][at].fromJSON(json[at]);
      //     }else{
      //       this[using_state_hash][at] = json[at];
      //     }
      //   }
      // }
      this[using_state_hash] = JSON.parse(json);
    }
};
Game.UIMode.gameStart = {
    enter: function(){
      // console.log("Game.UIMode.gameStart enter");
      Game.Message.sendMessage("Welcome to possibly the best rouge-like game. Ever.");
      Game.renderAll();
    },
    exit: function() {
      // console.log("Game.UIMode.gameStart exit");
      Game.renderAll();
    },
    handleInput: function(eventTpe, evt){
      // console.log("Game.UIMode.gameStart handleIndput");
      Game.UIMode.gamePlay.setupNewGame();
      Game.switchUIMode(Game.UIMode.gamePlay);
    },
    renderOnMain: function(display){
      // console.log("Game.UIMode.gameStart rendrOnMain");
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(0, 0, "Press any key to begin.", fg, bg);
    }
};
Game.UIMode.gamePlay = {
    attr: {
      _mapId: '',
      _cameraX: 100,
      _cameraY: 100,
      _avatarId: ''
    },
    JSON_KEY: 'uiMode_gamePlay',

    enter: function(){
      // console.log("Game.UIMode.gamePlay enter");
      Game.Message.clearMessages();
      if (this.attr._avatarId){ this.setCameraToAvatar(); }
      Game.renderAll();
      Game.TimeEngine.unlock();
    },
    exit: function() {
      // console.log("Game.UIMode.gamePlay exit");
      Game.renderAll();
      Game.TimeEngine.lock();
    },
    getMap: function() {
      return Game.DATASTORE.MAP[this.attr._mapId];;
    },
    setMap: function(m){
      this.attr._mapId = m.getId();
    },
    getAvatar: function() {
      return Game.DATASTORE.ENTITY[this.attr._avatarId];;
    },
    setAvatar: function(m){
      this.attr._avatarId = m.getId();
    },
    handleInput: function(eventType, evt){
      // console.log("Game.UIMode.gamePlay handleIndput");
      // console.log(eventType);
      // console.dir(evt);
      var tookTurn = false;
      var dx = 0;
      var dy = 0;
      if (eventType == 'keypress'){
        // Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
        if (evt.keyCode == 13){
          Game.switchUIMode(Game.UIMode.gameWin);
        }else if (evt.keyCode == 61){
          Game.switchUIMode(Game.UIMode.gamePersistence);
        }else if (evt.keyCode == ROT.VK_L){
          Game.switchUIMode(Game.UIMode.gameSkillMenu);
        }else if (evt.keyCode == ROT.VK_1){
          dx = -1;
          dy = 1;
        }else if (evt.keyCode == ROT.VK_2){
          dy = 1;
        }else if (evt.keyCode == ROT.VK_3){
          dx = 1;
          dy = 1;
        }else if (evt.keyCode == ROT.VK_4){
          dx = -1;
        }else if (evt.keyCode == ROT.VK_6){
          dx = 1;
        }else if (evt.keyCode == ROT.VK_7){
          dx = -1;
          dy = -1;
        }else if (evt.keyCode == ROT.VK_8){
          dy = -1;
        }else if (evt.keyCode == ROT.VK_9){
          dx = 1;
          dy = -1;
        }else if (evt.keyCode == ROT.VK_W){
          tookTurn = this.avatarWait();
        }

        if (dx !== 0 || dy !== 0){
          var useX = this.getAvatar().getX() + dx, useY = this.getAvatar().getY() + dy;
          var t = this.getMap().getTile(useX, useY);
          if (t == Game.Tile.floorTile){
            tookTurn = this.moveAvatar(dx, dy);
          }else if(t == Game.Tile.wallTile){
            tookTurn = this.breakWall(useX, useY);
          }else{
            this.raiseEntityEvent('walkForbidden', {targert: t});
          }
        }
      }else if (eventType == 'keydown' && evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      }
      if (tookTurn){
        this.getAvatar().raiseEntityEvent('actionDone');
        Game.Message.ageMessages();
        return true;
      }
    },
    breakWall: function(useX, useY){
      var num = Object.keys(this.getMap().attr._removedWalls).length;
      this.getAvatar().raiseEntityEvent('removeWall', {wallPos:{x:useX, y:useY}});
      if (num < Object.keys(this.getMap().attr._removedWalls).length){
        return true;
      }
      Game.Message.ageMessages();
      return false;
    },
    avatarWait: function(){
      this.getAvatar().raiseEntityEvent('wait');
      return true;
    },
    renderOnMain: function(display){
      // console.log("Game.UIMode.gamePlay rendrOnMain");
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      this.getMap().renderOn(display, this.attr._cameraX, this.attr._cameraY);
      display.drawText(0, 0, "Press [ENTER] to win.", fg, bg);
      display.drawText(0, 1, "Press [ESC] to lose.", fg, bg);
      display.drawText(0, 2, "Press [=] to enter the save/load menu.", fg, bg);
    },
    renderAvatarInfo: function (display) {
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(1,2,"avatar x: "+this.getAvatar().getX(),fg,bg);
      display.drawText(1,3,"avatar y: "+this.getAvatar().getY(),fg,bg);
      display.drawText(1,4,"Health: " + this.getAvatar().getCurHp() + "/" + this.getAvatar().getMaxHp());
      display.drawText(1,5,"Stamina: " + this.getAvatar().getCurSp() + "/" + this.getAvatar().getMaxSp());
      display.drawText(1,6,"Turns taken: " + this.getAvatar().getTurns());

      display.drawText(1,9,"Exp: " + this.getAvatar().getCurExp() + "/" + this.getAvatar().getNextLevelExp());
      display.drawText(1,10,"Level: " + this.getAvatar().getCurLevel());
      display.drawText(1,11,"You have " +this.getAvatar().getSkillPoints()+ " skill points.")
      if (this.getAvatar().getSkillPoints()){
        display.drawText(1,12,"Press [L] to spend your skill points.")
      }
    },
    moveAvatar: function (dx,dy) {
      if (this.getAvatar().tryWalk(this.getMap(), dx, dy)){
        this.setCameraToAvatar();
        return true;
      }
      return false;
    },
    moveCamera: function (dx,dy) {
      this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
    },
    setCamera: function (sx,sy) {
      this.attr._cameraX = Math.min(Math.max(0,sx),this.getMap().getWidth());
      this.attr._cameraY = Math.min(Math.max(0,sy),this.getMap().getHeight());
      // Game.renderAll();
    },
    setCameraToAvatar: function () {
      this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
    },
    setupNewGame: function(){
      this.setMap(new Game.Map('caves1'));
      this.setAvatar(Game.EntityGenerator.create('avatar'));
      this.getMap().addEntity(this.getAvatar(), this.getMap().getRandomWalkableLocation());
      this.setCameraToAvatar();

      //make some enemies
      for (var i = 0; i < 80; i++) {
        this.getMap().addEntity(Game.EntityGenerator.create('moss'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('newt'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('goblin'), this.getMap().getRandomWalkableLocation());
      }
    },
    toJSON: function() {
      return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
    },
    fromJSON: function (json) {
      Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
    }
};
Game.UIMode.gameWin = {
    enter: function(){
      // console.log("Game.UIMode.gameWin enter");
    },
    exit: function() {
      // console.log("Game.UIMode.gameWin exit");
    },
    handleInput: function(){
      // console.log("Game.UIMode.gameWin handleIndput");
    },
    renderOnMain: function(display){
      // console.log("Game.UIMode.gameWin rendrOnMain");
      display.clear();
      display.drawText(0, 0, "You win!");
    }
};
Game.UIMode.gameLose = {
    enter: function(){
      // console.log("Game.UIMode.gameStart enter");
    },
    exit: function() {
      // console.log("Game.UIMode.gameStart exit");
    },
    handleInput: function(){
      // console.log("Game.UIMode.gameStart handleIndput");
    },
    renderOnMain: function(display){
      // console.log("Game.UIMode.gameStart rendrOnMain");
      display.clear();
      display.drawText(0, 0, "You lose!");
    }
};

Game.UIMode.gameSkillMenu = {
    attr: {
      _avatarId: ''
    },
    enter: function(){
      this.attr._avatarId = Game.UIMode.gamePlay.attr._avatarId;
      Game.renderAll();
    },
    exit: function() {
      // console.log("Game.UIMode.gameStart exit");
    },
    handleInput: function(eventType, evt){
      if (eventType == 'keypress'){
        // Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
        var success = false
        if (evt.keyCode == ROT.VK_0){
          success = this.getAvatar().upgrade("vitality");
        }else if (evt.keyCode == ROT.VK_1){
          success = this.getAvatar().upgrade("endurance");
        }else if (evt.keyCode == ROT.VK_2){
          success = this.getAvatar().upgrade("strength");
        }else if (evt.keyCode == ROT.VK_3){
          success = this.getAvatar().upgrade("agility");
        }else if (evt.keyCode == ROT.VK_4){
          success = this.getAvatar().upgrade("accuracy");
        }else if (evt.keyCode == ROT.VK_5){
          success = this.getAvatar().upgrade("magicka");
        }else if (evt.keyCode == ROT.VK_6){
          success = this.getAvatar().upgrade("luck");
        }else if (evt.keyCode == ROT.VK_7){
          success = this.getAvatar().upgrade("intelligence");
        }else if (evt.keyCode == ROT.VK_8){

        }
        Game.Message.ageMessages();
        if (success){
          this.getAvatar().effect();
          Game.Message.sendMessage("Purchase confirmed!");
        }else{
          Game.Message.sendMessage("You do not have enough skill points to upgrade that.");
        }
        Game.renderAll();
      }else if (eventType == 'keydown' && evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    renderOnMain: function(display){
      display.clear();
      display.drawText(0, 0, "0 - Vitality - Current Level: " + this.getAvatar().getSkillLevel("vitality"));
      display.drawText(0, 1, "1 - Endurance - Current Level: " + this.getAvatar().getSkillLevel("endurance"));
      display.drawText(0, 2, "2 - Strength - Current Level: " + this.getAvatar().getSkillLevel("strength"));
      display.drawText(0, 3, "3 - Agility - Current Level: " + this.getAvatar().getSkillLevel("agility"));
      display.drawText(0, 4, "4 - Accuracy - Current Level: " + this.getAvatar().getSkillLevel("accuracy"));
      display.drawText(0, 5, "5 - Magicka - Current Level: " + this.getAvatar().getSkillLevel("magicka"));
      display.drawText(0, 6, "6 - Luck - Current Level: " + this.getAvatar().getSkillLevel("luck"));
      display.drawText(0, 7, "7 - Intelligence - Current Level: " + this.getAvatar().getSkillLevel("intelligence"));
    },
    renderAvatarInfo: function (display) {
      display.drawText(0,0,"You have " +this.getAvatar().getSkillPoints()+ " skill points. Press [ESC] to leave this menu.")
    },
    getAvatar: function() {
      return Game.DATASTORE.ENTITY[this.attr._avatarId];;
    }
};
