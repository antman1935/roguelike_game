window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();

        // Add the containers to our HTML page
        document.getElementById('wsrl-main-display').appendChild(   Game.getDisplay('main').getContainer());
        document.getElementById('wsrl-avatar-display').appendChild(   Game.getDisplay('avatar').getContainer());
        document.getElementById('wsrl-message-display').appendChild(   Game.getDisplay('message').getContainer());


    }
};

var Game = {
  _PERSISTENCE_NAMESPACE: 'tbrlgame',

  DISPLAYS: {
    avatar: {
      w:20,
      h:24,
      o: null
    },
    main: {
      w: 80,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h:6,
      o:null
    }
  },

  _game: null,
  _randomSeed: 0,
  _curUIMode: null,
  _uiModeNameStack: [],
  TRANSIENT_RNG: null,

  DATASTORE: {},

  Scheduler: null,
  TimeEngine: null,

  init: function() {
    this._game = this;

    this.TRANSIENT_RNG = ROT.RNG.clone();
    Game.setRandomSeed(5 + Math.floor(this.TRANSIENT_RNG.getUniform() * 100000));

    //this.DISPLAYS.main.o = new ROT.Display({width:Game.DISPLAYS.main.w, height:Game.DISPLAYS.main.h});
    for (var displayName in this.DISPLAYS) {
      if (this.DISPLAYS.hasOwnProperty(displayName)) {
        this.DISPLAYS[displayName].o = new ROT.Display({width:this.DISPLAYS[displayName].w, height:this.DISPLAYS[displayName].h});
      }
    }

    Game.KeyBinding.setKeyBinding();
    Game.switchUIMode('gameStart');
    this.renderAll();
    var bindEventToUiMode = function(event) {
        window.addEventListener(event, function(e) {
            if (Game.getCurUIMode() !== null) {
                Game.getCurUIMode().handleInput(event, e);
            }
        });
    };
    bindEventToUiMode('keypress');
    bindEventToUiMode('keydown');
  },
  initializeTimeEngine: function(){
    Game.Scheduler = new ROT.Scheduler.Action();
    Game.TimeEngine = new ROT.Engine(Game.Scheduler);
  },
  getDisplay: function(displayName){
    return Game.DISPLAYS[displayName].o;
  },
  renderAll: function(){
    this.renderMain();
    this.renderAvatar();
    this.renderMessage();
  },
  renderMain: function() {
    if (this.getCurUIMode().hasOwnProperty('renderOnMain')){
      this.getCurUIMode().renderOnMain(this.DISPLAYS.main.o);
    }else{
      for (var i = 0; i < 5; i++) {
        this.DISPLAYS.main.o.drawText(2, 3+i, "Literally Anything LLC");
      }
    }
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if (this.getCurUIMode() === null) {
      return;
    }
    if (this.getCurUIMode().hasOwnProperty('renderAvatarInfo')) {
      this.getCurUIMode().renderAvatarInfo(this.DISPLAYS.avatar.o);
    }
  },
  renderMessage: function() {
    //this.DISPLAYS.avatar.o.drawText(2, 3, "Message");
    Game.Message.renderOn(this.DISPLAYS.message.o);
  },
  getCurUIMode: function(){
    var uiModeName = this._uiModeNameStack[0];
    if (uiModeName){
      return Game.UIMode[uiModeName];
    }
    return null;
  },
  hideDisplayMessage: function(){
    this.DISPLAYS.message.o.clear();
  },
  specialMessage: function(msg){
    this.DISPLAYS.message.o.clear();
    this.DISPLAYS.message.o.drawText(1,1,'%c{#fff}%b{#000}'+msg, 79);
  },
  switchUIMode: function(newUIModeName){
    if (newUIModeName.startsWith('LAYER_')){
      console.log('cannot switchUIMode to layer ' +newUIModeName);
      return;
    }
    var curMode = this.getCurUIMode();
    if (curMode !== null){
      curMode.exit()
    }
    this._uiModeNameStack[0] = newUIModeName;
    var newMode = Game.UIMode[newUIModeName];
    if (newMode){
      newMode.enter();
    }
  },
  addUIMode: function(newUIModeLayerName){
    if (! (newUIModeLayerName.startsWith('LAYER_'))){
      console.log('addUIMode not possible for non-layer ' +newUIModeLayerName);
      return;
    }
    this._uiModeNameStack.unshift(newUIModeLayerName);
    var newMode = Game.UIMode[newUIModeLayerName];
    if (newMode){
      newMode.enter();
    }
  },
  removeUIMode: function(){
    var curMode = this.getCurUIMode();
    if (curMode !== null){
      curMode.exit();
    }
    this._uiModeNameStack.shift();
  },
   eventHandler: function(eventType, evt){
     if (this.getCurUIMode() !== null){
       this.getCurUIMode().handleInput(eventType, evt);
     }
   },
   getRandomseed: function(){
     return this._randomSeed;
   },
   setRandomSeed: function(s) {
     this._randomSeed = s;
     this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
     ROT.RNG.setSeed(this._randomSeed);
   },
   getAvatar: function () {
    return Game.UIMode.gamePlay.getAvatar();
   },
};
