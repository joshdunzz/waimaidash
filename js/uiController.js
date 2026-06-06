const UIController = {
  _e:{},
  init(){
    this._e={
      boot:document.getElementById('screen-boot'),
      introOrder:document.getElementById('screen-intro-order'),
      mapStudy:document.getElementById('screen-map-study'),
      phoneDies:document.getElementById('screen-phone-dies'),
      driving:document.getElementById('screen-driving'),
      levelSuccess:document.getElementById('screen-level-success'),
      levelFail:document.getElementById('screen-level-fail'),
      gameComplete:document.getElementById('screen-game-complete'),
      levelLabel:document.getElementById('level-label'),
      levelLabelHud:document.getElementById('level-label-hud'),
      orderText:document.getElementById('order-text'),
      destPreview:document.getElementById('dest-preview'),
      failReason:document.getElementById('fail-reason'),
      intersectionHint:document.getElementById('intersection-hint'),
      destinationHint:document.getElementById('destination-hint'),
      missedMsg:document.getElementById('missed-msg'),
    };
  },
  showScreen(name){
    ['boot','introOrder','mapStudy','phoneDies','driving','levelSuccess','levelFail','gameComplete']
      .forEach(k=>{if(this._e[k])this._e[k].classList.add('hidden');});
    if(this._e[name]) this._e[name].classList.remove('hidden');
  },
  updateLevelLabel(level){const t=`Level ${level}`;if(this._e.levelLabel)this._e.levelLabel.textContent=t;if(this._e.levelLabelHud)this._e.levelLabelHud.textContent=t;},
  setOrderText(level){const m={1:'Straight to the destination. Easy delivery.',2:'Two turns. Stay sharp.',3:'Four turns. Trust your memory.',4:'Eight turns. You got this.',5:'Sixteen turns. Legendary route.'};if(this._e.orderText)this._e.orderText.textContent=m[level]||'New delivery order!';},
  setDestPreview(id){const n={'red-shop':'RED SHOP','blue-tower':'BLUE TOWER','green-store':'GREEN STORE','yellow-market':'YELLOW MARKET','purple-cafe':'PURPLE CAFE','orange-stand':'ORANGE STAND'};if(this._e.destPreview){this._e.destPreview.textContent=n[id]||id.toUpperCase();this._e.destPreview.style.color=CONFIG.map.landmarkColors[id]||'#fff';}},
  showIntersectionHint(){if(this._e.intersectionHint)this._e.intersectionHint.classList.remove('hidden');},
  hideIntersectionHint(){if(this._e.intersectionHint)this._e.intersectionHint.classList.add('hidden');},
  showDestinationHint(id){if(this._e.destinationHint){this._e.destinationHint.style.color=CONFIG.map.landmarkColors[id]||'#fff';this._e.destinationHint.classList.remove('hidden');}},
  hideDestinationHint(){if(this._e.destinationHint)this._e.destinationHint.classList.add('hidden');},
  showMissedIntersection(cb){if(this._e.missedMsg){this._e.missedMsg.classList.remove('hidden');setTimeout(()=>{this._e.missedMsg.classList.add('hidden');if(cb)cb();},CONFIG.ui.missedIntersectionDuration);}else if(cb)cb();},
  setFailReason(r){if(this._e.failReason)this._e.failReason.textContent=r;},
};
