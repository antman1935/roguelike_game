Game.Symbol = function (template) {
  // console.log('creating new Symbol');
  template = template || {};
  if (! ('attr' in this)) { this.attr = {}; }
  this.attr._char = template.chr || ' ';
  this.attr._fg = template.fg || Game.UIMode.DEFAULT_COLOR_FG;
  this.attr._bg = template.bg || Game.UIMode.DEFAULT_COLOR_BG;
};

Game.Symbol.prototype.getChar = function () {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function () {
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function () {
  return this.attr._bg;
};

Game.Symbol.prototype.draw = function (display,x,y,isMasked) {
  if (isMasked){
    display.draw(x,y,this.attr._char,'#444','#000');
  }else{
    display.draw(x,y,this.attr._char,this.attr._fg,this.attr._bg);
  }
};

Game.Symbol.AVATAR = new Game.Symbol({chr: '@', fg:'#dda'});
Game.Symbol.NULL_SYMBOL = new Game.Symbol();
Game.Symbol.ITEM_PILE = new Game.Symbol({chr:'&',fg:'#dcc'});
