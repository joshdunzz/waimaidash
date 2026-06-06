const Utils = {
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  directionToAngle(dir) {
    const map = { north: Math.PI, east: Math.PI / 2, south: 0, west: -Math.PI / 2 };
    return map[dir] || 0;
  },

  turnDirection(facing, turn) {
    const order = ['north', 'east', 'south', 'west'];
    const idx = order.indexOf(facing);
    if (turn === 'left')  return order[(idx + 3) % 4];
    if (turn === 'right') return order[(idx + 1) % 4];
    return facing;
  },

  directionVector(dir) {
    const map = {
      north: { x: 0,  z: -1 },
      south: { x: 0,  z:  1 },
      east:  { x: 1,  z:  0 },
      west:  { x: -1, z:  0 },
    };
    return map[dir] || { x: 0, z: -1 };
  },

  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  },
};
