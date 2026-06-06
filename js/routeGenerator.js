const RouteGenerator = {
  generate(levelConfig) {
    const {turns, segments:totalSegments} = levelConfig;
    const landmarks = Utils.shuffle([...CONFIG.landmarks]);
    let landmarkIdx = 0;
    const startDirection = Utils.pick(['north','east','south','west']);
    const segments = [];
    const straightCount = turns + 1;
    const straightBlocks = this._distributeStraights(totalSegments, straightCount);
    const turnDirs = Array.from({length:turns}, () => Math.random()<0.5?'left':'right');
    let facing = startDirection;
    for (let i=0; i<straightCount; i++) {
      const blocks = straightBlocks[i];
      if (blocks > 0) {
        const useLandmark = i>0 && i<straightCount-1 && Math.random()<0.5;
        const seg = {type:'straight', blocks};
        if (useLandmark) { seg.landmarkId = landmarks[landmarkIdx%landmarks.length]; landmarkIdx++; }
        segments.push(seg);
      }
      if (i < turns) {
        const dir = turnDirs[i];
        segments.push({type:'turn', direction:dir, landmarkId:landmarks[landmarkIdx%landmarks.length]});
        landmarkIdx++;
        facing = Utils.turnDirection(facing, dir);
      }
    }
    const destLandmark = landmarks[landmarkIdx%landmarks.length];
    const destSide = Math.random()<0.5?'left':'right';
    return {
      start: {x:0, z:0, direction:startDirection},
      segments,
      destination: {landmarkId:destLandmark, side:destSide},
      _worldPath: this._computeWorldPath(startDirection, segments, destLandmark),
    };
  },
  _distributeStraights(total, count) {
    const base = Array(count).fill(1);
    let rem = total - count;
    while (rem > 0) { base[Math.floor(Math.random()*count)]++; rem--; }
    if (base[base.length-1] < 2) base[base.length-1] = 2;
    return base;
  },
  _computeWorldPath(startDir, segments, destLandmark) {
    const B = CONFIG.movement.blockSize;
    const path = [];
    let x=0, z=0, dir=startDir, vec=Utils.directionVector(dir);
    path.push({x, z, type:'start', direction:dir});
    for (const seg of segments) {
      if (seg.type==='straight') {
        for (let b=0; b<seg.blocks; b++) {
          x+=vec.x*B; z+=vec.z*B;
          path.push({x, z, type:'road', direction:dir, landmarkId:seg.landmarkId||null});
        }
      } else {
        x+=vec.x*B; z+=vec.z*B;
        path.push({x, z, type:'intersection', direction:dir, turn:seg.direction, landmarkId:seg.landmarkId});
        dir=Utils.turnDirection(dir,seg.direction); vec=Utils.directionVector(dir);
      }
    }
    if (path.length < 2) {
      const lv=Utils.directionVector(path[0].direction);
      path.push({x:path[0].x+lv.x*B, z:path[0].z+lv.z*B, type:'road', direction:path[0].direction});
    }
    path[path.length-1].isDestination = true;
    path[path.length-1].destLandmarkId = destLandmark;
    return path;
  },
};
