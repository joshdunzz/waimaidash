const STATES = { BOOT:'BOOT', INTRO_ORDER:'INTRO_ORDER', MAP_STUDY:'MAP_STUDY', PHONE_DIES:'PHONE_DIES', DRIVING:'DRIVING', LEVEL_SUCCESS:'LEVEL_SUCCESS', LEVEL_FAIL:'LEVEL_FAIL', GAME_COMPLETE:'GAME_COMPLETE' };
const GameState = {
  current: STATES.BOOT, currentLevel: 1, route: null, retrying: false, failReason: '',
  reset() { this.failReason = ''; },
  setState(s) { this.current = s; },
  getLevelConfig() { return CONFIG.levels[this.currentLevel-1]; },
};
