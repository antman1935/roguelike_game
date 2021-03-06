Game.KeyBinding = {
  _availableBindings: ['numpad','waxd'],
  _curBindingKey: '',
  _currentBindingLookup: {},

  _bindingHelpText: '',
  setKeyBinding:function (bindingSetKey) {
    this._curBindingKey = bindingSetKey || 'numpad';
    this.calcBindingLookups();
  },
  getKeyBinding:function () {
    return this._curBindingKey;
  },
  swapToNextKeyBinding: function () {
    var nextBindingIndex = this._availableBindings.indexOf(this._curBindingKey);
    if (nextBindingIndex < 0) { return; } // can only swap to next if the current is in the 'available' list - prevents swapping away from special sets like 'persist'
    nextBindingIndex++;
    if (nextBindingIndex >= this._availableBindings.length) {
      nextBindingIndex = 0;
    }
    this.setKeyBinding(this._availableBindings[nextBindingIndex]);
    Game.Message.ageMessages();
    this.informPlayer();
  },
  informPlayer: function () {
    Game.Message.sendMessage('using '+this._curBindingKey+' key bindings');
    Game.renderMessage();
  },

  calcBindingLookups:function () {
    // console.log('calcBindingLookups for '+this._curBindingKey);
    this._currentBindingLookup = {
      keydown:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      },
      keypress:{
        nometa:{},
        ctrlshift:{},
        shift:{},
        ctrl:{}
      }
    };
    var bindingHelpInfo = []
    for (var actionLookupKey in this.Action) {
      if (this.Action.hasOwnProperty(actionLookupKey)) {
        var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
        if (bindingInfo) {
          var metaKey = 'nometa';
          if (bindingInfo.inputMetaCtrl && bindingInfo.inputMetaShift) {
            metaKey = 'ctrlshift';
          } else if (bindingInfo.inputMetaShift) {
            metaKey = 'shift';
          } else if (bindingInfo.inputMetaCtrl) {
            metaKey = 'ctrl';
          }

          this._currentBindingLookup[bindingInfo.inputType][metaKey][bindingInfo.inputMatch] = {
            actionKey: actionLookupKey,
            boundLabel: bindingInfo.label,
            binding: bindingInfo,
            action: Game.KeyBinding.Action[actionLookupKey]
          };

          bindingHelpInfo.push(actionLookupKey);
        }
      }
    }
    bindingHelpInfo.sort(function(a, b){
      if (Game.KeyBinding.Action[a].ordering != Game.KeyBinding.Action[b].ordering) {
        return a-b;
      }
      // string cmp on 'short' attribute
      return (Game.KeyBinding.Action[a].short<Game.KeyBinding.Action[b].short)?-1:((Game.KeyBinding.Action[a].short>Game.KeyBinding.Action[b].short)?1:0);
    });
    this._bindingHelpText = '';
    var hasBaseMovements = false;
    var previousOrdering = 1;
    for (var i = 0; i < bindingHelpInfo.length; i++) {
      var curAction = Game.KeyBinding.Action[bindingHelpInfo[i]];

      if (curAction.action_group != 'base_movement') {
        if (Math.floor(previousOrdering) != Math.floor(curAction.ordering)) {
          this._bindingHelpText += "\n";
        }
        this._bindingHelpText += curAction[curAction.hasOwnProperty(this._curBindingKey)?this._curBindingKey:'all'].label+'  '+curAction.long+"\n";
        previousOrdering = curAction.ordering;
      } else {
        hasBaseMovements = true;
      }
    }
    if (hasBaseMovements) {
      var movementHelpTemplate = "-------\n|mUL mU mUR|\n| \\|/ |\n|mL-mW-mR|\n| /|\\ |\n|mDL mD mDR|\n-------";
      movementHelpTemplate = movementHelpTemplate.replace('mUL',Game.KeyBinding.Action.MOVE_UL[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mU',Game.KeyBinding.Action.MOVE_U[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mUR',Game.KeyBinding.Action.MOVE_UR[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mL',Game.KeyBinding.Action.MOVE_L[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mW',Game.KeyBinding.Action.MOVE_WAIT[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mR',Game.KeyBinding.Action.MOVE_R[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mDL',Game.KeyBinding.Action.MOVE_DL[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mD',Game.KeyBinding.Action.MOVE_D[this._curBindingKey].label);
      movementHelpTemplate = movementHelpTemplate.replace('mDR',Game.KeyBinding.Action.MOVE_DR[this._curBindingKey].label);
      this._bindingHelpText = "movement\n"+movementHelpTemplate + "\n"+ this._bindingHelpText;
    }
  },

  getInputBinding: function (inputType,inputData) {
    var metaKey = 'nometa';
    if (inputData.ctrlKey && inputData.shiftKey) {
      metaKey = 'ctrlshift';
    } else if (inputData.shiftKey) {
      metaKey = 'shift';
    } else if (inputData.ctrlKey) {
      metaKey = 'ctrl';
    }
    var bindingKey = inputData.keyCode;
    if (inputType === 'keypress') {
        bindingKey = String.fromCharCode(inputData.charCode);
    }
    return this._currentBindingLookup[inputType][metaKey][bindingKey] || false;
  },

  getLabelForAction: function (actionLookupKey) {
    var bindingInfo = this.Action[actionLookupKey][this._curBindingKey] || this.Action[actionLookupKey].all;
    if (bindingInfo) {
      return bindingInfo.label;
    }
    return '';
  },
  getBindingHelpText: function(){
    return this._bindingHelpText;
  },

  Action: {
    HELP : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'help' ,long:'show which keys do which commands',
      all: {label:'?'     ,inputMatch:'?'      ,inputType:'keypress' ,inputMetaShift:true ,inputMetaCtrl:false}
    },
    DATA_NAV_UP : {action_group:'data_nav' ,guid:Game.util.uniqueId() ,ordering:5.1 ,short:'up' ,long :'scroll content up',
      LAYER_textReading: {label:'['     ,inputMatch:'['      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    DATA_NAV_DOWN : {action_group:'data_nav' ,guid:Game.util.uniqueId() ,ordering:5.2 ,short:'down' ,long :'scroll content down',
      LAYER_textReading: {label:']'     ,inputMatch:']'      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    CHANGE_BINDINGS : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'controls' ,long:'change which keys do which commands',
     all: {label:'\\'  ,inputMatch:ROT.VK_BACK_SLASH ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PERSISTENCE      : {action_group:'meta'    ,guid:Game.util.uniqueId() ,ordering:2 ,short:'games'    ,long :'save or load or start a new game',
      all: {label:'='     ,inputMatch:'='      ,inputType:'keypress' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    PERSISTENCE_SAVE : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.1 ,short:'save'     ,long :'save the current game',
      persist: {label:'S' ,inputMatch:ROT.VK_S ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    PERSISTENCE_LOAD : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.2 ,short:'load'  ,long :'load from the saved game',
      persist: {label:'L' ,inputMatch:ROT.VK_L ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },
    PERSISTENCE_NEW  : {action_group:'persist' ,guid:Game.util.uniqueId() ,ordering:2.3 ,short:'new game' ,long :'start a new game',
      persist: {label:'N' ,inputMatch:ROT.VK_N ,inputType:'keydown'  ,inputMetaShift:true  ,inputMetaCtrl:false}
    },

    MOVE_UL   : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move diagonally up and to the left',
      numpad: {label:'7' ,inputMatch:ROT.VK_NUMPAD7 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'q' ,inputMatch:ROT.VK_Q       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_U    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight up',
      numpad: {label:'8' ,inputMatch:ROT.VK_NUMPAD8 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'w' ,inputMatch:ROT.VK_W       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_UR   : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move diagonally up and to the right',
      numpad: {label:'9' ,inputMatch:ROT.VK_NUMPAD9 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'e' ,inputMatch:ROT.VK_E       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_L    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight left',
      numpad: {label:'4' ,inputMatch:ROT.VK_NUMPAD4 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'a' ,inputMatch:ROT.VK_A       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_WAIT : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move nowhere - wait one turn',
      numpad: {label:'5' ,inputMatch:ROT.VK_NUMPAD5 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'s' ,inputMatch:ROT.VK_S       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_R    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight right',
      numpad: {label:'6' ,inputMatch:ROT.VK_NUMPAD6 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'d' ,inputMatch:ROT.VK_D       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_DL   : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move diagonally down and to the left',
      numpad: {label:'1' ,inputMatch:ROT.VK_NUMPAD1 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'z' ,inputMatch:ROT.VK_Z       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_D    : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move straight down',
      numpad: {label:'2' ,inputMatch:ROT.VK_NUMPAD2 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'x' ,inputMatch:ROT.VK_X       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },
    MOVE_DR   : {action_group:'base_movement' ,guid:Game.util.uniqueId() ,ordering:3 ,short:'move' ,long :'move diagonally down and to the right',
      numpad: {label:'3' ,inputMatch:ROT.VK_NUMPAD3 ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false} ,
      waxd  : {label:'c' ,inputMatch:ROT.VK_C       ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    },

    SKILLMENU : {action_group:'meta', guid:Game.util.uniqueId(), ordering:4, short:"skill menu", long:'Load the skill menu to purchase upgrades.',
      all: {label:'l', inputMatch:ROT.VK_L, inputType:'keydown', inputMetaShift:false, inputMetaCtrl: false}
    },
    SKILLMENU_VITALITY : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'vitality'     ,long :'Upgrade your vitality to increase your maximum health.',
      skillmenu: {label:'0' ,inputMatch:ROT.VK_NUMPAD0 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_ENDURANCE : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'endurance'     ,long :'Upgrade your endurance to increase your maximum stamina.',
      skillmenu: {label:'1' ,inputMatch:ROT.VK_NUMPAD1 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_STRENGTH : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'strength'     ,long :'Upgrade your strength to...',
      skillmenu: {label:'2' ,inputMatch:ROT.VK_NUMPAD2 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_AGILITY : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'agility'     ,long :'Upgrade your agility to...',
      skillmenu: {label:'3' ,inputMatch:ROT.VK_NUMPAD3 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_ACCURACY : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'accuracy'     ,long :'Upgrade your accuracy to...',
      skillmenu: {label:'4' ,inputMatch:ROT.VK_NUMPAD4 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_MAGICKA : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'magicka'     ,long :'Upgrade your magicka to...',
      skillmenu: {label:'5' ,inputMatch:ROT.VK_NUMPAD5 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_LUCK : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'luck'     ,long :'Upgrade your luck to...',
      skillmenu: {label:'6' ,inputMatch:ROT.VK_NUMPAD6 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },
    SKILLMENU_INTELLIGENCE : {action_group:'skillmenu' ,guid:Game.util.uniqueId() ,ordering:4.1 ,short:'in'     ,long :'Upgrade your intelligence to...',
      skillmenu: {label:'7' ,inputMatch:ROT.VK_NUMPAD7 ,inputType:'keydown'  ,inputMetaShift:false  ,inputMetaCtrl:false}
    },

    CANCEL          : {action_group:'meta' ,guid :Game.util.uniqueId() ,ordering:1 ,short:'cancel'   ,long:'cancel/close the current action/screen',
      all: {label:'Esc' ,inputMatch:ROT.VK_ESCAPE     ,inputType:'keydown' ,inputMetaShift:false ,inputMetaCtrl:false}
    }
  }
};
