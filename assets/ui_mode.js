Game.UIMode = {};
Game.UIMode.DEFAULT_COLOR_FG = '#fff';
Game.UIMode.DEFAULT_COLOR_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{'+Game.UIMode.DEFAULT_COLOR_FG+'}%b{'+Game.UIMode.DEFAULT_COLOR_BG+'}';

Game.UIMode.gamePersistence = {
    _storedKeyBinding: '',
    enter: function(){
      Game.Message.ageMessages();
      this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
      Game.KeyBinding.setKeyBinding('persist');
      Game.renderAll();
    },
    exit: function() {
      Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
      Game.renderAll();
    },
    handleInput: function(eventType, evt){
      var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
      if (!actionBinding){ return false; }
      if (actionBinding.actionKey == 'PERSISTENCE_SAVE'){
        this.saveGame();
      }else if (actionBinding.actionKey == 'PERSISTENCE_LOAD'){
        console.log("trying to load...");
        this.restoreGame();
      }else if (actionBinding.actionKey == 'PERSISTENCE_NEW'){
        this.newGame();
      }else if (actionBinding.actionKey == "CANCEL"){
        if (Object.keys(Game.DATASTORE.MAP).length < 1){
          this.newGame();
        }else{
          Game.switchUIMode('gamePlay');
        }
      }else if (actionBinding.actionKey == 'HELP'){
        Game.addUIMode('LAYER_textReading');
      }
      return false;
    },
    saveGame: function(){
      if (this.localStorageAvailable()){
        Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
        Game.DATASTORE.MESSAGE = Game.Message.attr;
        Game.DATASTORE.KEY_BINDING_SET = this._storedKeyBinding;
        Game.DATASTORE.SCHEDULE = {};
        Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = 1;
        for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
          Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getId()] = Game.Scheduler._queue._eventTimes[i] + 1
        }
        Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1;
        window.localStorage.removeItem(Game._PERSISTENCE_NAMESPACE);
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
        Game.Message.sendMessage('Game saved.');
        Game.switchUIMode("gamePlay");
      }
    },
    restoreGame: function() {
      if (this.localStorageAvailable()){
        Game.Scheduler.clear();

        var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
        var state_data = JSON.parse(json_state_data);

        this._resetGameDataStructures();

        Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
        Game.Message.attr = state_data.MESSAGE;
        this._storedKeyBinding = state_data.KEY_BINDING_SET;

        Game.Scheduler._queue._time = state_data.SCHEDULE_TIME;

        //game level
        Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

        //map restoration
        for (var mapId in state_data.MAP) {
          if (state_data.MAP.hasOwnProperty(mapId)) {
            var mapAttr = JSON.parse(state_data.MAP[mapId]);
            Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName, mapId);
            Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
          }
        }
        ROT.RNG.getUniform();
        //entity restoration
        for (var entityId in state_data.ENTITY) {
          if (state_data.ENTITY.hasOwnProperty(entityId)) {
            var entAttr = JSON.parse(state_data.ENTITY[entityId]);
            var newE = Game.EntityGenerator.create(entAttr._generator_template_key, entAttr._id);

            Game.DATASTORE.ENTITY[entityId] = newE;
            Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]); // restores entity attr
          }
        }

        // items
        for (var itemId in state_data.ITEM) {
          if (state_data.ITEM.hasOwnProperty(itemId)) {
            var itemAttr = JSON.parse(state_data.ITEM[itemId]);
            var newI = Game.ItemGenerator.create(itemAttr._generator_template_key,itemAttr._id);
            Game.DATASTORE.ITEM[itemId] = newI;
            Game.DATASTORE.ITEM[itemId].fromJSON(state_data.ITEM[itemId]);
        }
      }

      //schedule
      Game.initializeTimeEngine();
      for (var schedItemId in state_data.SCHEDULE) {
        if (state_data.SCHEDULE.hasOwnProperty(schedItemId)) {
          if (Game.DATASTORE.ENTITY.hasOwnProperty(schedItemId)) {
            Game.Scheduler.add(Game.DATASTORE.ENTITY[schedItemId], true, state_data.SCHEDULE[schedItemId]);
          }
        }
      }

        Game.Message.sendMessage("Game loaded.");
        Game.switchUIMode("gamePlay");
        Game.KeyBinding.informPlayer();
      }
    },
    newGame: function () {
      this._resetGameDataStructures();
      Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
      Game.UIMode.gamePlay.setupNewGame();
      Game.Message.sendMessage("New game started.");
      Game.switchUIMode("gamePlay");
    },
    _resetGameDataStructures: function(){
      Game.DATASTORE = {};
      Game.DATASTORE.MAP = {};
      Game.DATASTORE.ENTITY = {};
      Game.DATASTORE.ITEM = {};
      Game.initializeTimeEngine();
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
      display.clear();
      display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR+"Press S to save your game, L to load a game, or N to start a new one.");
    },
    BASE_toJSON: function(state_hash_name){
      var state = this.attr;
      if (state_hash_name){
        state = this[state_hash_name];
      }
      var json = JSON.stringify(state);
      return json;
    },
    BASE_fromJSON: function (json, state_hash_name){
      var using_state_hash = state_hash_name  || 'attr';
      this[using_state_hash] = JSON.parse(json);
    }
};
Game.UIMode.gameStart = {
    enter: function(){
      Game.Message.sendMessage("Welcome to possibly the best rouge-like game. Ever.");
      Game.KeyBinding.setKeyBinding();
      Game.renderAll();
    },
    exit: function() {
      Game.KeyBinding.informPlayer();
      Game.renderAll();
    },
    handleInput: function(eventType, evt){
      Game.initializeTimeEngine();
      Game.UIMode.gamePlay.setupNewGame();
      Game.switchUIMode("gamePlay");
    },
    renderOnMain: function(display){
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to begin.");
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
      if (this.attr._avatarId){ this.setCameraToAvatar(); }
      Game.TimeEngine.unlock();
      Game.renderAll();
    },
    exit: function() {
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
      var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
      if (!actionBinding || actionBinding.actionKey == 'CANCEL') { return false; }
      var tookTurn = false;
      var dx = 0;
      var dy = 0;

      if (actionBinding.actionKey == "PERSISTENCE"){
        Game.switchUIMode("gamePersistence");
      }else if (actionBinding.actionKey == "SKILLMENU"){
        Game.switchUIMode("gameSkillMenu");
      }else if (actionBinding.actionKey == "MOVE_DL"){
        dx = -1;
        dy = 1;
      }else if (actionBinding.actionKey == "MOVE_D"){
        dy = 1;
      }else if (actionBinding.actionKey == "MOVE_DR"){
        dx = 1;
        dy = 1;
      }else if (actionBinding.actionKey == "MOVE_L"){
        dx = -1;
      }else if (actionBinding.actionKey == "MOVE_R"){
        dx = 1;
      }else if (actionBinding.actionKey == "MOVE_UL"){
        dx = -1;
        dy = -1;
      }else if (actionBinding.actionKey == "MOVE_U"){
        dy = -1;
      }else if (actionBinding.actionKey == "MOVE_UR"){
        dx = 1;
        dy = -1;
      }else if (actionBinding.actionKey == "MOVE_WAIT"){
        tookTurn = this.avatarWait();
      }else if (actionBinding.actionKey == "CHANGE_BINDINGS"){
        Game.KeyBinding.swapToNextKeyBinding();
      }else if (actionBinding.actionKey == 'HELP'){
        Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
        Game.addUIMode('LAYER_textReading');
      }

      if (dx !== 0 || dy !== 0){
        var useX = this.getAvatar().getX() + dx;
        var useY = this.getAvatar().getY() + dy;
        var t = this.getMap().getTile(useX, useY);
        if (t == Game.Tile.nullTile){

        }
        if (t.isWalkable()){
          tookTurn = this.moveAvatar(dx, dy);
        }else if(t.isDiggable()){
          tookTurn = this.breakWall(useX, useY);
        }else{
          this.getAvatar().raiseSymbolActiveEvent('walkForbidden', {target: t});
        }
      }

      if (tookTurn){
        this.getAvatar().raiseSymbolActiveEvent('actionDone');
        Game.Message.ageMessages();
        return true;
      }
    },
    breakWall: function(useX, useY){
      var num = Object.keys(this.getMap().attr._removedWalls).length;
      this.getAvatar().raiseSymbolActiveEvent('removeWall', {wallPos:{x:useX, y:useY}});
      if (num < Object.keys(this.getMap().attr._removedWalls).length){
        return true;
      }
      Game.Message.ageMessages();
      return false;
    },
    avatarWait: function(){
      this.getAvatar().raiseSymbolActiveEvent('wait');
      return true;
    },
    renderOnMain: function(display){
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,
        {showEntities:false,showTiles:true,maskRendered:true,visibleCells:this.getAvatar().getRememberedCoordsForMap()});
      var seenCells = this.getAvatar().getVisibleCells();
      this.getMap().renderOn(display,this.attr._cameraX,this.attr._cameraY,
        {showEntities:true,showTiles:true,visibleCells:seenCells, secondCall: true});
      this.getAvatar().rememberCoords(seenCells);
    },
    renderAvatarInfo: function (display) {
      var fg = Game.UIMode.DEFAULT_COLOR_FG;
      var bg = Game.UIMode.DEFAULT_COLOR_BG;
      display.drawText(1,2, Game.UIMode.DEFAULT_COLOR_STR + "avatar x: "+this.getAvatar().getX());
      display.drawText(1,3, Game.UIMode.DEFAULT_COLOR_STR + "avatar y: "+this.getAvatar().getY());
      display.drawText(1,4, Game.UIMode.DEFAULT_COLOR_STR + "Health: " + this.getAvatar().getCurHp() + "/" + this.getAvatar().getMaxHp());
      display.drawText(1,5, Game.UIMode.DEFAULT_COLOR_STR + "Stamina: " + this.getAvatar().getCurSp() + "/" + this.getAvatar().getMaxSp());
      display.drawText(1,6, Game.UIMode.DEFAULT_COLOR_STR + "Turns taken: " + this.getAvatar().getTurns());

      display.drawText(1,9, Game.UIMode.DEFAULT_COLOR_STR + "Exp: " + this.getAvatar().getCurExp() + "/" + this.getAvatar().getNextLevelExp());
      display.drawText(1,10, Game.UIMode.DEFAULT_COLOR_STR + "Level: " + this.getAvatar().getCurLevel());
      display.drawText(1,11, Game.UIMode.DEFAULT_COLOR_STR + "You have " +this.getAvatar().getSkillPoints()+ " skill points.")
      if (this.getAvatar().getSkillPoints()){
        display.drawText(1,12, Game.UIMode.DEFAULT_COLOR_STR + "Press [l] to spend your skill points.")
      }
    },
    moveAvatar: function (pdx,pdy) {
      var moveResp = this.getAvatar().raiseSymbolActiveEvent('adjacentMove',{dx:pdx,dy:pdy});
      if (moveResp.madeAdjacentMove && moveResp.madeAdjacentMove[0]){
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
    },
    setCameraToAvatar: function () {
      this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
    },
    setupNewGame: function(){
      this.setMap(new Game.Map('caves1'));
      this.setAvatar(Game.EntityGenerator.create('avatar'));
      this.getMap().addEntity(this.getAvatar(), this.getMap().getRandomWalkableLocation());
      this.setCameraToAvatar();

      var itemPos = '';
      for (var i = 0; i < 40; i++) {
        this.getMap().addEntity(Game.EntityGenerator.create('moss'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('newt'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('angry squirrel'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('attack slug'), this.getMap().getRandomWalkableLocation());
        this.getMap().addEntity(Game.EntityGenerator.create('goblin'), this.getMap().getRandomWalkableLocation());

        itemPos = this.getMap().getRandomWalkableLocation();
        this.getMap().addItem(Game.ItemGenerator.create('rock'),itemPos);
      }
      this.getMap().addItem(Game.ItemGenerator.create('rock'),itemPos);
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

    },
    exit: function() {

    },
    handleInput: function(){

    },
    renderOnMain: function(display){
      display.clear();
      display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR+"You win!");
    }
};
Game.UIMode.gameLose = {
    enter: function(){

    },
    exit: function() {

    },
    handleInput: function(){

    },
    renderOnMain: function(display){
      display.clear();
      display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR+"You lose!");
    }
};
Game.UIMode.LAYER_textReading = {
    _storedKeyBinding: '',
    _text: 'default',
    _renderY: 0,
    _renderScrollLimit: 0,
    enter: function(){
      this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
      Game.KeyBinding.setKeyBinding('LAYER_textReading');
      Game.renderAll();
      Game.specialMessage("[ESC] to exit, [ and ] for scrolling");
    },
    exit: function() {
      Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
      Game.renderAll();
      setTimeout(function() {Game.renderAll();}, 1);
    },
    handleInput: function(eventType, evt){
      var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
      if (!actionBinding){
        return false;
      }
      if (actionBinding.actionKey == 'CANCEL'){
        Game.removeUIMode();
      }else if (actionBinding.actionKey == 'DATA_NAV_UP'){
        console.log("up");
        this._renderY++;
        if (this._renderY > 0) { this._renderY = 0; }
        Game.renderMain();
       return true;
      }else if (actionBinding.actionKey == 'DATA_NAV_DOWN') {
        console.log("down");
        this._renderY--;
        if (this._renderY < this._renderScrollLimit) { this._renderY = this._renderScrollLimit; }
        Game.renderMain();
        return true;
      }
      return false;
    },
    renderOnMain: function(display){
      var dims = Game.util.getDisplayDim(display);
      var linesTaken = display.drawText(1, this._renderY, Game.UIMode.DEFAULT_COLOR_STR+this._text, dims.w - 1)
      this._renderScrollLimit = dims.h - linesTaken;
      if (this._renderScrollLimit > 0) {this._renderScrollLimit = 0;}
    },
    getText: function(){
      return this._text;
    },
    setText: function(t){
      this._text = t;
    }
};

Game.UIMode.gameSkillMenu = {
    attr: {
      _avatarId: ''
    },
    _storedKeyBinding: '',
    enter: function(){
      this.attr._avatarId = Game.UIMode.gamePlay.attr._avatarId;
      this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
      Game.KeyBinding.setKeyBinding('skillmenu');
      Game.renderAll();
    },
    exit: function() {
      Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
      Game.renderAll()
    },
    handleInput: function(eventType, evt){
      var actionBinding = Game.KeyBinding.getInputBinding(eventType, evt);
      if (!actionBinding) { return false; }
      // Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
      var success = false
      if (actionBinding.actionKey == "SKILLMENU_VITALITY"){
        success = this.getAvatar().upgrade("vitality");
      }else if (actionBinding.actionKey == "SKILLMENU_ENDURANCE"){
        success = this.getAvatar().upgrade("endurance");
      }else if (actionBinding.actionKey == "SKILLMENU_STRENGTH"){
        success = this.getAvatar().upgrade("strength");
      }else if (actionBinding.actionKey == "SKILLMENU_AGILITY"){
        success = this.getAvatar().upgrade("agility");
      }else if (actionBinding.actionKey == "SKILLMENU_ACCURACY"){
        success = this.getAvatar().upgrade("accuracy");
      }else if (actionBinding.actionKey == "SKILLMENU_MAGICKA"){
        success = this.getAvatar().upgrade("magicka");
      }else if (actionBinding.actionKey == "SKILLMENU_LUCK"){
        success = this.getAvatar().upgrade("luck");
      }else if (actionBinding.actionKey == "SKILLMENU_INTELLIGENCE"){
        success = this.getAvatar().upgrade("intelligence");
      }else if (actionBinding.actionKey == "CANCEL"){
        Game.switchUIMode("gamePlay");
      }else{
        return;
      }
      Game.Message.ageMessages();
      if (success){
        this.getAvatar().effect();
        Game.Message.sendMessage("Purchase confirmed!");
      }else{
        Game.Message.sendMessage("You do not have enough skill points to upgrade that.");
      }
      Game.renderAll();

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
