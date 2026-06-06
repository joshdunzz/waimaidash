let _lastTime=0;
function gameLoop(ts){
  const dt=Math.min((ts-_lastTime)/1000,0.1); _lastTime=ts;
  if(GameState.current===STATES.DRIVING){GameplayController.update(dt);WorldRenderer.render();}
  requestAnimationFrame(gameLoop);
}
function init(){
  Input.init(); UIController.init();
  WorldRenderer.init(document.getElementById('three-container'));
  MapRenderer.init(document.getElementById('map-canvas'),document.getElementById('map-timer'));
  SceneController.init();
  GameState.setState(STATES.BOOT); UIController.showScreen('boot');
  requestAnimationFrame(ts=>{_lastTime=ts;requestAnimationFrame(gameLoop);});
}
window.addEventListener('load',init);
