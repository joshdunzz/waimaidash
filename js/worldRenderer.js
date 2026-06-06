const WorldRenderer = {
  scene:null, camera:null, renderer:null, riderMesh:null, entities:[],
  init(container) {
    const W=container.clientWidth, H=container.clientHeight;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(CONFIG.world.skyColor);
    this.scene.fog=new THREE.Fog(CONFIG.world.fogColor,CONFIG.world.fogNear,CONFIG.world.fogFar);
    this.camera=new THREE.PerspectiveCamera(60,W/H,0.1,200);
    this.renderer=new THREE.WebGLRenderer({antialias:true});
    this.renderer.setSize(W,H); this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.AmbientLight(0xffffff,0.4));
    const dl=new THREE.DirectionalLight(0xffffff,0.8); dl.position.set(20,40,20); this.scene.add(dl);
    window.addEventListener('resize',()=>this._onResize(container));
  },
  buildWorld(route) {
    this.entities.forEach(e=>this.scene.remove(e.mesh)); this.entities=[];
    if(this.riderMesh) this.scene.remove(this.riderMesh);
    const path=route._worldPath, B=CONFIG.movement.blockSize, placed=new Set();
    for(const node of path) {
      const key=`${node.x},${node.z}`;
      if(!placed.has(key)){placed.add(key);this._roadTile(node.x,node.z,node.type==='intersection');}
      if(node.direction) this._sideBuildings(node,B);
      if(node.type==='intersection'){this._branches(node,B);if(node.landmarkId)this._landmark(node.x,node.z,node.landmarkId,node.direction,'left');}
    }
    const dest=path[path.length-1];
    if(dest) this._landmark(dest.x,dest.z,route.destination.landmarkId,dest.direction,route.destination.side);
    this.riderMesh=this._rider(); this.scene.add(this.riderMesh);
  },
  _roadTile(x,z,isX){
    const B=CONFIG.movement.blockSize;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(B,B),new THREE.MeshLambertMaterial({color:isX?CONFIG.world.intersectionColor:CONFIG.world.roadColor}));
    m.rotation.x=-Math.PI/2; m.position.set(x,0,z); this.scene.add(m); this.entities.push({mesh:m,type:'road'});
  },
  _sideBuildings(node,B){
    const side=B/2+3, vec=Utils.directionVector(node.direction), px=-vec.z, pz=vec.x;
    for(const s of[-1,1]) if(Math.random()<0.7) this._building(node.x+px*s*side,node.z+pz*s*side);
  },
  _branches(node,B){
    const vec=Utils.directionVector(node.direction), px=-vec.z, pz=vec.x;
    for(const s of[-1,1]){
      const bx=node.x+px*s*B, bz=node.z+pz*s*B;
      this._roadTile(bx,bz,false);
      for(const t of[-1,1]) this._building(bx+pz*t*(B/2+2),bz-px*t*(B/2+2));
    }
  },
  _building(x,z,color){
    const W=5+Math.random()*6, D=5+Math.random()*6;
    const H=CONFIG.world.buildingHeightMin+Math.random()*(CONFIG.world.buildingHeightMax-CONFIG.world.buildingHeightMin);
    const col=color!=null?color:Utils.pick(CONFIG.world.buildingColors);
    const m=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),new THREE.MeshLambertMaterial({color:col}));
    m.position.set(x,H/2,z); this.scene.add(m); this.entities.push({mesh:m,type:'building'});
  },
  _landmark(x,z,landmarkId,facing,side){
    const color=CONFIG.world.landmarkColors[landmarkId]||0xffffff;
    const B=CONFIG.movement.blockSize, vec=Utils.directionVector(facing||'north');
    const px=side==='right'?-vec.z:vec.z, pz=side==='right'?vec.x:-vec.x;
    const lx=x+px*(B/2+2), lz=z+pz*(B/2+2), H=12;
    const m=new THREE.Mesh(new THREE.BoxGeometry(5,H,5),new THREE.MeshLambertMaterial({color}));
    m.position.set(lx,H/2,lz); this.scene.add(m); this.entities.push({mesh:m,type:'landmark',data:{landmarkId}});
    const sp=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,8),new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:0.5}));
    sp.position.set(lx,H+1.5,lz); this.scene.add(sp); this.entities.push({mesh:sp,type:'landmark-marker',data:{landmarkId}});
  },
  _rider(){
    const g=new THREE.Group();
    const add=(geo,col,py,pz)=>{const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col}));m.position.set(0,py,pz||0);g.add(m);};
    add(new THREE.BoxGeometry(1.2,1.6,0.8),0xf97316,1.8);
    add(new THREE.BoxGeometry(0.8,0.8,0.8),0xfbbf24,2.9);
    add(new THREE.BoxGeometry(1.4,1.2,1.4),0xef4444,2.2,-0.9);
    add(new THREE.BoxGeometry(0.6,0.4,2.2),0x6b7280,0.6);
    return g;
  },
  updateRider(wx,wz,dir){if(!this.riderMesh)return;this.riderMesh.position.set(wx,0,wz);this.riderMesh.rotation.y=Utils.directionToAngle(dir);},
  updateCamera(wx,wz,dir){
    const a=Utils.directionToAngle(dir);
    this.camera.position.set(wx-Math.sin(a)*14,10,wz-Math.cos(a)*14);
    this.camera.lookAt(wx+Math.sin(a)*6,1,wz+Math.cos(a)*6);
  },
  render(){if(this.renderer)this.renderer.render(this.scene,this.camera);},
  _onResize(c){const W=c.clientWidth,H=c.clientHeight;this.camera.aspect=W/H;this.camera.updateProjectionMatrix();this.renderer.setSize(W,H);},
};
