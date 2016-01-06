Game.UIMode = {};
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
    saveGame: function(){
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
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    },
    newGame: function () {
      Game.setRandomSeed(5 + Math.floor(ROT.RNG.getUniform() * 100000));
      Game.switchUIMode(Game.UIMode.gamePlay);
    },
    localStorageAvailable: function () { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
  	   try {
  	     var x = '__storage_test__';
  	     window.localStorage.setItem(x, x);
  		   window.localStorage.removeItem(x);
         return true;
  	   } catch(e) {
         Game.Message.send('Sorry, no local data storage is available for this browser');
  		   return false;
  	   }
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gamePersistence rendrOnMain");
      display.clear();
      display.drawText(0, 0, "Press S to save your game, L to load a game, or N to start a new one.");
    }
};
Game.UIMode.gameStart = {
    enter: function(){
      console.log("Game.UIMode.gameStart enter");
    },
    exit: function() {
      console.log("Game.UIMode.gameStart exit");
    },
    handleInput: function(eventTpe, evt){
      console.log("Game.UIMode.gameStart handleIndput");
      Game.switchUIMode(Game.UIMode.gamePlay);
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gameStart rendrOnMain");
      display.drawText(0, 0, "Press any key to begin.");
    }
};
Game.UIMode.gamePlay = {
    enter: function(){
      console.log("Game.UIMode.gamePlay enter");
    },
    exit: function() {
      console.log("Game.UIMode.gamePlay exit");
    },
    handleInput: function(eventType, evt){
      console.log("Game.UIMode.gamePlay handleIndput");
      console.log(eventType);
      console.dir(evt);
      if (eventType == 'keypress'){
        if (evt.keyCode == 13){
          Game.switchUIMode(Game.UIMode.gameWin);
        }else if (evt.keyCode == 61){
          Game.switchUIMode(Game.UIMode.gamePersistence);
        }
      }else if (eventType == 'keydown' && evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      }
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gamePlay rendrOnMain");
      display.clear();
      display.drawText(0, 0, "Press [ENTER] to win.");
      display.drawText(0, 1, "Press [ESC] to lose.");
      display.drawText(0, 2, "Press [=] to enter the save/load menu.");
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
