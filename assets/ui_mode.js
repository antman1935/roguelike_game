Game.UIMode = {};
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
      console.log("Game.UIMode.gameStart enter");
    },
    exit: function() {
      console.log("Game.UIMode.gameStart exit");
    },
    handleInput: function(eventType, evt){
      console.log("Game.UIMode.gameStart handleIndput");
      console.log(eventType);
      console.dir(evt);
      if (eventType == 'keypress'){
        if (evt.keyCode == 13){
          Game.switchUIMode(Game.UIMode.gameWin);
        }
      }else if (eventType == 'keydown' && evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      }
    },
    renderOnMain: function(display){
      console.log("Game.UIMode.gameStart rendrOnMain");
      display.clear();
      display.drawText(0, 0, "Press [ENTER] to win, [ESC] to lose.");
    }
};
Game.UIMode.gameWin = {
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
