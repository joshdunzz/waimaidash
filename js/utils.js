const Utils = {
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  shuffle(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; },
  pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; },
  directionToAngle(dir) { return {north:0,east:Math.PI/2,south:Math.PI,west:-Math.PI/2}[dir]||0; },
  turnDirection(facing, turn) {
    const order=['north','east','south','west'];
    const idx=order.indexOf(facing);
    if(turn==='left') return order[(idx+3)%4];
    if(turn==='right') return order[(idx+1)%4];
    return facing;
  },
  directionVector(dir) { return {north:{x:0,z:-1},south:{x:0,z:1},east:{x:1,z:0},west:{x:-1,z:0}}[dir]||{x:0,z:-1}; },
};
