const GameplayController = {
  _nodes:[],_nodeIndex:0,_lerp:0,_facing:'north',_speed:0,
  _iState:'none',_wTimer:0,_reqTurn:null,
  _dState:'pending',_dTimer:0,_dSide:null,
  init(route){
    this._nodes=route._worldPath; this._nodeIndex=0; this._lerp=0;
    this._facing=route.start.direction; this._speed=CONFIG.movement.speed;
    this._iState='none'; this._wTimer=0; this._reqTurn=null;
    this._dState='pending'; this._dTimer=0; this._dSide=route.destination.side;
  },
  update(dt){
    if(GameState.current!==STATES.DRIVING) return;
    const nodes=this._nodes, B=CONFIG.movement.blockSize;
    this._lerp+=(this._speed*dt)/B;
    while(this._lerp>=1&&this._nodeIndex<nodes.length-1){this._lerp-=1;this._nodeIndex++;this._arrive(nodes[this._nodeIndex]);}
    if(this._nodeIndex>=nodes.length-1){
      this._lerp=Utils.clamp(this._lerp,0,1);
      if(this._dState==='pending'&&this._lerp>=0.99) this._fail('Missed destination');
    }
    if(this._iState==='window_open'){
      this._wTimer-=dt;
      const sw=Input.consumeSwipe();
      if(sw){this._resolveIntersection(sw);return;}
      if(this._wTimer<=0) this._closeWindow();
    }
    if(this._dState==='window_open'){
      this._dTimer-=dt;
      const sw=Input.consumeSwipe();
      if(sw){this._resolveDest(sw);return;}
      if(this._dTimer<=0) this._fail('Missed destination');
    }
    const cur=nodes[this._nodeIndex], nxt=nodes[Math.min(this._nodeIndex+1,nodes.length-1)];
    const wx=cur.x+(nxt.x-cur.x)*this._lerp, wz=cur.z+(nxt.z-cur.z)*this._lerp;
    WorldRenderer.updateRider(wx,wz,this._facing);
    WorldRenderer.updateCamera(wx,wz,this._facing);
  },
  _arrive(node){
    this._facing=node.direction||this._facing;
    if(node.type==='intersection'){this._iState='window_open';this._wTimer=CONFIG.movement.turnWindowDuration;this._reqTurn=node.turn;UIController.showIntersectionHint();}
    if(node.isDestination){this._dState='window_open';this._dTimer=CONFIG.movement.turnWindowDuration*1.5;UIController.showDestinationHint(node.destLandmarkId);}
  },
  _resolveIntersection(sw){this._iState='handled';UIController.hideIntersectionHint();if(sw===this._reqTurn){this._facing=Utils.turnDirection(this._facing,sw);}else{this._fail('Wrong turn!');}},
  _closeWindow(){this._iState='handled';UIController.hideIntersectionHint();if(this._reqTurn!==null)UIController.showMissedIntersection(()=>this._fail('Missed intersection!'));},
  _resolveDest(sw){this._dState='done';UIController.hideDestinationHint();if(sw===this._dSide)SceneController.triggerLevelSuccess();else this._fail('Wrong side — missed destination!');},
  _fail(reason){GameState.failReason=reason;GameState.setState(STATES.LEVEL_FAIL);SceneController.showFail(reason);},
};
