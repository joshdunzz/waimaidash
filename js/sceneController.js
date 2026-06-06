const SceneController = {
  _interval:null, _timeLeft:0,
  init(){
    document.getElementById('btn-start').addEventListener('click',()=>this.startGame());
    document.getElementById('btn-retry').addEventListener('click',()=>this.retryLevel());
    document.getElementById('btn-next').addEventListener('click',()=>this.nextLevel());
    document.getElementById('btn-finish').addEventListener('click',()=>this.nextLevel());
    document.getElementById('btn-restart').addEventListener('click',()=>this.restartGame());
    document.getElementById('btn-begin-study').addEventListener('click',()=>this.beginStudy());
  },
  startGame(){GameState.currentLevel=1;GameState.retrying=false;this._beginLevel();},
  retryLevel(){GameState.retrying=true;this._beginLevel();},
  nextLevel(){
    GameState.currentLevel++;GameState.retrying=false;GameState.route=null;
    if(GameState.currentLevel>CONFIG.levels.length){GameState.setState(STATES.GAME_COMPLETE);UIController.showScreen('gameComplete');}
    else this._beginLevel();
  },
  restartGame(){GameState.currentLevel=1;GameState.retrying=false;GameState.route=null;this._beginLevel();},
  _beginLevel(){
    UIController.updateLevelLabel(GameState.currentLevel);
    UIController.setOrderText(GameState.currentLevel);
    if(!GameState.retrying||!GameState.route) GameState.route=RouteGenerator.generate(GameState.getLevelConfig());
    UIController.setDestPreview(GameState.route.destination.landmarkId);
    GameState.setState(STATES.INTRO_ORDER);
    UIController.showScreen('introOrder');
  },
  beginStudy(){
    const lc=GameState.getLevelConfig();
    this._timeLeft=lc.studyTime;
    GameState.setState(STATES.MAP_STUDY);
    UIController.showScreen('mapStudy');
    const canvas=document.getElementById('map-canvas'), container=document.getElementById('map-container');
    canvas.width=container.clientWidth; canvas.height=container.clientHeight;
    MapRenderer.render(GameState.route,this._timeLeft,lc.studyTime);
    this._interval=setInterval(()=>{
      this._timeLeft-=0.1;
      if(this._timeLeft<=0){this._timeLeft=0;clearInterval(this._interval);this._phoneDeath();return;}
      MapRenderer.render(GameState.route,this._timeLeft,lc.studyTime);
    },100);
  },
  _phoneDeath(){
    MapRenderer.clear();
    GameState.setState(STATES.PHONE_DIES);
    UIController.showScreen('phoneDies');
    setTimeout(()=>this._startDriving(),CONFIG.ui.phoneDiesDuration);
  },
  _startDriving(){
    GameState.setState(STATES.DRIVING); GameState.reset();
    WorldRenderer.buildWorld(GameState.route);
    GameplayController.init(GameState.route);
    UIController.showScreen('driving');
    UIController.hideIntersectionHint(); UIController.hideDestinationHint();
    document.getElementById('three-container').classList.remove('hidden');
  },
  triggerLevelSuccess(){
    GameState.setState(STATES.LEVEL_SUCCESS); UIController.showScreen('levelSuccess');
    const isLast=GameState.currentLevel>=CONFIG.levels.length;
    document.getElementById('btn-next').classList.toggle('hidden',isLast);
    document.getElementById('btn-finish').classList.toggle('hidden',!isLast);
  },
  showFail(reason){GameState.setState(STATES.LEVEL_FAIL);UIController.setFailReason(reason);UIController.showScreen('levelFail');},
};
