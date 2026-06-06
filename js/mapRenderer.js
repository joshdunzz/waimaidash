const MapRenderer = {
  canvas:null, ctx:null, timerDisplay:null,
  init(canvasEl, timerEl) { this.canvas=canvasEl; this.ctx=canvasEl.getContext('2d'); this.timerDisplay=timerEl; },
  render(route, timeRemaining, totalTime) {
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height, pad=CONFIG.map.padding;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=CONFIG.map.backgroundColor; ctx.fillRect(0,0,W,H);
    const path=route._worldPath;
    if(!path||!path.length) return;
    const xs=path.map(p=>p.x), zs=path.map(p=>p.z);
    const minX=Math.min(...xs), maxX=Math.max(...xs), minZ=Math.min(...zs), maxZ=Math.max(...zs);
    const rangeX=maxX-minX||1, rangeZ=maxZ-minZ||1;
    const drawW=W-pad*2, drawH=H-pad*2;
    const scale=Math.min(drawW/rangeX,drawH/rangeZ)*0.85;
    const offX=pad+(drawW-rangeX*scale)/2, offZ=pad+(drawH-rangeZ*scale)/2;
    const ts=(wx,wz)=>({sx:offX+(wx-minX)*scale, sy:offZ+(wz-minZ)*scale});
    ctx.strokeStyle=CONFIG.map.roadColor; ctx.lineWidth=Math.max(6,scale*0.4); ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); path.forEach((p,i)=>{const{sx,sy}=ts(p.x,p.z);i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);}); ctx.stroke();
    ctx.strokeStyle=CONFIG.map.routeColor; ctx.lineWidth=Math.max(3,scale*0.18); ctx.setLineDash([4,4]);
    ctx.beginPath(); path.forEach((p,i)=>{const{sx,sy}=ts(p.x,p.z);i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);}); ctx.stroke();
    ctx.setLineDash([]);
    for(const node of path) {
      if(node.landmarkId){const{sx,sy}=ts(node.x,node.z);this._box(ctx,sx,sy,CONFIG.map.landmarkColors[node.landmarkId]||'#fff',7);}
    }
    const last=path[path.length-1]; const{sx:dx,sy:dy}=ts(last.x,last.z);
    ctx.fillStyle=CONFIG.map.destColor; ctx.beginPath(); ctx.arc(dx,dy,10,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    this._box(ctx,dx,dy-16,CONFIG.map.landmarkColors[route.destination.landmarkId]||CONFIG.map.destColor,6);
    ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.fillText('DEST',dx,dy+18);
    const{sx:sx0,sy:sy0}=ts(path[0].x,path[0].z);
    ctx.fillStyle=CONFIG.map.startColor; ctx.beginPath(); ctx.arc(sx0,sy0,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#000'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('S',sx0,sy0); ctx.textBaseline='alphabetic';
    if(this.timerDisplay){const pct=timeRemaining/totalTime;this.timerDisplay.textContent=Math.ceil(timeRemaining)+'s';this.timerDisplay.style.color=pct>0.5?'#00e5ff':pct>0.25?'#ffcc00':'#ff4444';}
  },
  _box(ctx,x,y,color,r){ctx.fillStyle=color;ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(x-r,y-r,r*2,r*2);ctx.fill();ctx.stroke();},
  clear(){if(this.ctx)this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);if(this.timerDisplay)this.timerDisplay.textContent='';},
};
