Game.Message = {
  attr: {
    freshMessages:[],
    staleMessages:[],
    archivedMessages:[],
    archiveMessageCount:0
  },
  renderOn: function(display){
    display.clear();
    var dispRowMax = display._options.height - 1;
    var dispColMax = display._options.width - 2;
    var dispRow = 0;
    var freshMsgIdx = 0;
    var staleMsgIdx = 0;
    //fresh in white
    for (freshMsgIdx = 0; freshMsgIdx < this.attr.freshMessages.length && dispRow < dispRowMax; freshMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#fff}%b{#000}'+this.attr.freshMessages[freshMsgIdx]+'%c{}%b{}',79);
    }
    //stale in grey
    for (staleMsgIdx = 0; staleMsgIdx < this.attr.staleMessages.length && dispRow < dispRowMax; staleMsgIdx++) {
      dispRow += display.drawText(1,dispRow,'%c{#aaa}%b{#000}'+this.attr.staleMessages[staleMsgIdx]+'%c{}%b{}',79);
    }
    //archive stalest message
    if (this.attr.staleMessages.length > 0){
      this.attr.archivedMessages.unshift(this.attr.staleMessages.pop());
    }
    //archive stale messages that were not shown
    while (this.attr.staleMessages.length > staleMsgIdx){
      this.attr.archivedMessages.unshift(this.attr.staleMessages.pop());
    }
    //remove oldest archived message past the archiveMessageCount
    while (this.attr.archivedMessages.length > this.attr.archiveMessageCount){
      this.attr.archivedMessages.pop();
    }
    //move now previous fresh messages to stale
    while (this.attr.freshMessages.length > 0){
      this.attr.staleMessages.unshift(this.attr.freshMessages.pop());
    }
  },
  sendMessage: function(msg){
    this.attr.freshMessages.push(msg);
  },
  clearMessages: function(){
    this.attr.freshMessages = [];
    this.attr.staleMessages = [];
  }
};
