const CONFIG = {
  levels: [
    { id: 1, turns: 0, studyTime: 5,  segments: 4 },
    { id: 2, turns: 2, studyTime: 7,  segments: 6 },
    { id: 3, turns: 4, studyTime: 9,  segments: 8 },
    { id: 4, turns: 8, studyTime: 12, segments: 12 },
    { id: 5, turns: 16, studyTime: 15, segments: 18 },
  ],
  movement: { speed: 6, blockSize: 20, intersectionDepth: 4, turnWindowDuration: 1.2 },
  map: {
    padding: 30, routeColor: '#00e5ff', startColor: '#00ff88', destColor: '#ff4444',
    landmarkColors: { 'red-shop':'#ff3333','blue-tower':'#3366ff','green-store':'#33cc66','yellow-market':'#ffcc00','purple-cafe':'#9933ff','orange-stand':'#ff8800' },
    backgroundColor: '#1a1a2e', roadColor: '#2a2a4a',
  },
  world: {
    roadWidth: 6, buildingHeightMin: 4, buildingHeightMax: 14,
    buildingColors: ['#2d4059','#374151','#1e3a5f','#2c3e50','#1a2634','#263547','#1f3044'],
    landmarkColors: { 'red-shop':0xff3333,'blue-tower':0x3366ff,'green-store':0x33cc66,'yellow-market':0xffcc00,'purple-cafe':0x9933ff,'orange-stand':0xff8800 },
    roadColor: 0x1a1a1a, intersectionColor: 0x111111, skyColor: 0x0a0a1a, fogColor: 0x0a0a1a, fogNear: 40, fogFar: 120,
  },
  landmarks: ['red-shop','blue-tower','green-store','yellow-market','purple-cafe','orange-stand'],
  ui: { phoneDiesDuration: 2000, missedIntersectionDuration: 1500 },
};
