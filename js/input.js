const Input = {
  _pendingSwipe: null, _touchStartX: 0, _touchStartY: 0, _touchStartTime: 0,
  init() {
    window.addEventListener('keydown', e => {
      if(e.key==='ArrowLeft') this._pendingSwipe='left';
      if(e.key==='ArrowRight') this._pendingSwipe='right';
    });
    window.addEventListener('touchstart', e => {
      const t=e.touches[0]; this._touchStartX=t.clientX; this._touchStartY=t.clientY; this._touchStartTime=Date.now();
    }, {passive:true});
    window.addEventListener('touchend', e => {
      const t=e.changedTouches[0];
      const dx=t.clientX-this._touchStartX, dy=t.clientY-this._touchStartY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<30||Date.now()-this._touchStartTime>500) return;
      if(Math.abs(dx)>Math.abs(dy)) this._pendingSwipe=dx>0?'right':'left';
    }, {passive:true});
  },
  consumeSwipe() { const s=this._pendingSwipe; this._pendingSwipe=null; return s; },
};
