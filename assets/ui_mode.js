Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gamePersistence = {
    enter: function(){
      console.log("Game.UIMode.gamePersistence enter");
    },
    exit: function() {
      console.log("Game.UIMode.gamePersistence exit");
    },
    handleInput: function(eventType, evt){
      console.log(eventType);
      console.dir(evt);
      if (eventType == 'keypress'){
        if (evt.keyCode == ROT.VK_S){
          console.log("save");
          this.saveGame();
        }else if (evt.keyCode == ROT.VK_L){
          console.log("load");
          this.restoreGame();
        }else if (evt.keyCode == ROT.VK_N){
          console.log("new game");
          this.newGame();
        }
      }
    },
    saveGame: function(json_state_data){
      if (this.localStorageAvailable()){
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game._game));
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    restoreGame: function() {
      if (this.localStorageAvailable()){
        var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
        var state_data = JSON.parse(json_state_data);
        Game.setRandomSeed(state_data._randomSeed);
        Game.UIMode.gamePlay.setupPlay(state_data);
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    newGame: function () {
      Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
      Game.UIMode.gamePlay.setupPlay();
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
      console.log("Game.UIMode.gamePersistence rendrOnMain");
      display.clear();
      display.drawText(0, 0, "Press S to save your game, L to load a game, or N to start a new one.");
    },
    BASE_toJSON: function(state_hash_name){
      var state = this.attr;
      if (state_hash_name){
        state = this[state_hash_name];
      }
      var json = {};
      for (var at in state) {
        if (state.hasOwnProperty(at)) {
          if (state[at] instanceof Object && 'toJSON' in state[at]){
            json[at] = state[at].toJSON();
          }else{
            json[at] = state[at];
          }
        }
      }
      return json;
    },
    BASE_fromJSON: function (json, state_hash_name){
      var using_state_hash = state_hash_name  || 'attr';
      for (var at in this[using_state_hash]) {
        if (this[using_state_hash].hasOwnProperty(at)) {
          if ((this[using_state_hash][at] instanceof Object) &&
                 ('fromJSON' in this[using_state_hash][at])) {
            this[using_state_hash][at].fromJSON(json[at]);
          }else{
            this[using_state_hash][at] = json[at];
          }
        }
      }
    }
};
Game.UIMode.gameStart = {
    enter: function(){
      console.log("Game.UIMode.gameStart enter");
      Game.Message.sendMessage("Welcome to possibly the best rouge-like game. Ever.");
      Game.renderAll();
    },
    exit: function() {
      console.log("Game.UIMode.gameStart exit");
      Game.renderAll();
    },
    handleInput: function(eventTpe, evt){
      console.log("Game.UIMode.gameStart handleIndput");
      Game.UIMode.gamePlay.setupPlay();
      Game.switchUIMode(Game.UIMode.gamePlay);
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gameStart rendrOnMain");
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(0, 0, "Press any key to begin.", fg, bg);
    }
};
Game.UIMode.gamePlay = {
    attr: {
      _map: null,
      _mapWidth: 300,
      _mapHeight: 200,
      _cameraX: 100,
      _cameraY: 100,
      _avatar: null
    },
    JSON_KEY: 'uiMode_gamePlay',

    enter: function(){
      console.log("Game.UIMode.gamePlay enter");
      Game.Message.clearMessages();
      Game.renderAll();
    },
    exit: function() {
      console.log("Game.UIMode.gamePlay exit");
      Game.renderAll();
    },
    handleInput: function(eventType, evt){
      console.log("Game.UIMode.gamePlay handleIndput");
      console.log(eventType);
      console.dir(evt);
      var pressedKey = String.fromCharCode(evt.charCode);
      Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
      var dx = 0;
      var dy = 0;
      if (eventType == 'keypress'){
        if (evt.keyCode == 13){
          Game.switchUIMode(Game.UIMode.gameWin);
        }else if (evt.keyCode == 61){
          Game.switchUIMode(Game.UIMode.gamePersistence);
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
        }else if (evt.keyCode == ROT.VK_1){
          dx = 1;
          dy = -1;
        }
        if (dx !== 0 || dy !== 0){
          this.moveAvatar(dx, dy);
        }
        // if (dx !== 0 || dy !== 0) {
        //   if (this.attr._map.getTile(this.attr._avatar.getX() + dx, this.attr._avatar.getY() + dy).isWalkable()){
        //     this.moveAvatar(dx, dy);
        //   }else{
        //
        //   }
        // }

        Game.renderAll();
      }else if (eventType == 'keydown' && evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      }
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gamePlay rendrOnMain");
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      this.attr._map.renderOn(display, this.attr._cameraX, this.attr._cameraY);
      display.drawText(0, 0, "Press [ENTER] to win.", fg, bg);
      display.drawText(0, 1, "Press [ESC] to lose.", fg, bg);
      display.drawText(0, 2, "Press [=] to enter the save/load menu.", fg, bg);
      this.renderAvatar(display);
    },
    renderAvatar: function(display) {
      Game.Symbol.AVATAR.draw(display,this.attr._avatar.getX()-this.attr._cameraX+display._options.width/2,
                                    this.attr._avatar.getY()-this.attr._cameraY+display._options.height/2);
    },
    renderAvatarInfo: function (display) {
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(1,2,"avatar x: "+this.attr._avatar.getX(),fg,bg);
      display.drawText(1,3,"avatar y: "+this.attr._avatar.getY(),fg,bg);
      display.drawText(1,4,"Turns taken: " + this.attr._avatar.getTurns());
    },
    moveAvatar: function (dx,dy) {
      if (!(this.attr._avatar.tryWalk(this.attr._map, dx, dy))){
        Game.Message.sendMessage("You can't move there.");
      }
      // this.attr._avatar.setX(Math.min(Math.max(0,this.attr._avatar.getX() + dx),this.attr._mapWidth));
      // this.attr._avatar.setY(Math.min(Math.max(0,this.attr._avatar.getY() + dy),this.attr._mapHeight));
      this.setCameraToAvatar();
    },
    moveCamera: function (dx,dy) {
      this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
    },
    setCamera: function (sx,sy) {
      this.attr._cameraX = Math.min(Math.max(0,sx),this.attr._mapWidth);
      this.attr._cameraY = Math.min(Math.max(0,sy),this.attr._mapHeight);
    },
    setCameraToAvatar: function () {
      this.setCamera(this.attr._avatar.getX(),this.attr._avatar.getY());
    },
    setupPlay: function(restorationData){
      var mapTiles = Game.util.init2DArray(this.attr._mapWidth,this.attr._mapHeight,Game.Tile.nullTile);
      var generator = new ROT.Map.Cellular(this.attr._mapWidth,this.attr._mapHeight);
      generator.randomize(0.5);

      var totalIterations = 3;
      for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
      }

      generator.create(function(x,y,v) {
        if (v === 1) {
          mapTiles[x][y] = Game.Tile.floorTile;
        } else {
          mapTiles[x][y] = Game.Tile.wallTile;
        }
      });

      this.attr._map = new Game.Map(mapTiles);
      this.attr._avatar = Game.EntityGenerator.create('avatar');

      if (restorationData !== undefined && restorationData.hasOwnProperty(Game.UIMode.gamePlay.JSON_KEY)) {
       this.fromJSON(restorationData[Game.UIMode.gamePlay.JSON_KEY]);
     }else{
       this.attr._avatar.setPos(this.attr._map.getRandomWalkableLocation());
     }

      this.setCameraToAvatar();
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
      console.log("Game.UIMode.gameWin enter");
    },
    exit: function() {
      console.log("Game.UIMode.gameWin exit");
    },
    handleInput: function(){
      console.log("Game.UIMode.gameWin handleIndput");
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gameWin rendrOnMain");
      display.clear();
      display.drawText(0, 0, "You win!");
    }
};
Game.UIMode.gameLose = {
    enter: function(){
      console.log("Game.UIMode.gameStart enter");
    },
    exit: function() {
      console.log("Game.UIMode.gameStart exit");
    },
    handleInput: function(){
      console.log("Game.UIMode.gameStart handleIndput");
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gameStart rendrOnMain");
      display.clear();
      display.drawText(0, 0, "You lose!");
    }
};
