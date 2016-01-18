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

        Game.Message.sendMessage("Message");
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
    Game.switchUIMode(Game.UIMode.gameStart);
    this.renderAll();

    var bindEventToUiMode = function(event) {
        window.addEventListener(event, function(e) {
            if (Game._curUIMode !== null) {
                Game._curUIMode.handleInput(event, e);
            }
        });
    };
    bindEventToUiMode('keypress');
    bindEventToUiMode('keydown');
  },
  initializeTimeEngine: function(){
    Game.Scheduler = new ROT.Scheduler.Action();
    Game.TimeEngine = new ROT.Engine(Game.Scheduler);
  }
  getDisplay: function(displayName){
    return Game.DISPLAYS[displayName].o;
  },
  renderAll: function(){
    this.renderMain();
    this.renderAvatar();
    this.renderMessage();
  },
  renderMain: function() {
    if (this._curUIMode.hasOwnProperty('renderOnMain')){
      this._curUIMode.renderOnMain(this.DISPLAYS.main.o);
    }else{
      for (var i = 0; i < 5; i++) {
        this.DISPLAYS.main.o.drawText(2, 3+i, "Literally Anything LLC");
      }
    }
  },
  renderAvatar: function() {
    this.DISPLAYS.avatar.o.clear();
    if (this._curUIMode === null) {
      return;
    }
    if (this._curUIMode.hasOwnProperty('renderAvatarInfo')) {
      this._curUIMode.renderAvatarInfo(this.DISPLAYS.avatar.o);
    }
  },
  renderMessage: function() {
    //this.DISPLAYS.avatar.o.drawText(2, 3, "Message");
    Game.Message.renderOn(this.DISPLAYS.message.o);
  },
  switchUIMode: function(newMode){
    if (this._curUIMode !== null) {
      this._curUIMode.exit();
    }
    this._curUIMode = newMode;
    if (this._curUIMode !== null) {
      this._curUIMode.enter();
      this._curUIMode.renderOnMain(this.DISPLAYS.main.o);
    }
  },
   eventHandler: function(eventType, evt){
    //  console.log(eventType);
    //  console.dir(evt);
     if (this._curUIMode !== null){
       this._curUIMode.handleInput(eventType, evt);
     }
   },
   getRandomseed: function(){
     return this._randomSeed;
   },
   setRandomSeed: function(s) {
     this._randomSeed = s;
     this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
     ROT.RNG.setSeed(this._randomSeed);
   }
  //  toJSON: function() {
  //    var json = {"_randomSeed":this._randomSeed};
  //    json[Game.UIMode.gamePlay.JSON_KEY] = Game.UIMode.gamePlay.toJSON();
  //    return json;
  //  }
};
