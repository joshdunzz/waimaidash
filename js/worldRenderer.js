const WorldRenderer = {
  scene: null,
  camera: null,
  renderer: null,
  riderMesh: null,
  entities: [],   // { mesh, type, data } — swap these for art upgrade

  init(container) {
    const W = container.clientWidth;
    const H = container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(CONFIG.world.skyColor);
    this.scene.fog = new THREE.Fog(CONFIG.world.fogColor, CONFIG.world.fogNear, CONFIG.world.fogFar);

    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(20, 40, 20);
    this.scene.add(dir);

    window.addEventListener('resize', () => this._onResize(container));
  },

  buildWorld(route) {
    this.entities.forEach(e => this.scene.remove(e.mesh));
    this.entities = [];
    if (this.riderMesh) this.scene.remove(this.riderMesh);

    const path = route._worldPath;
    const B = CONFIG.movement.blockSize;

    // Compute route bounding box
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const n of path) {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minZ = Math.min(minZ, n.z); maxZ = Math.max(maxZ, n.z);
    }
    // Snap to grid and add padding
    const pad = 2;
    const gMinX = Math.floor(minX / B) - pad;
    const gMaxX = Math.ceil(maxX / B) + pad;
    const gMinZ = Math.floor(minZ / B) - pad;
    const gMaxZ = Math.ceil(maxZ / B) + pad;

    // Ground plane (road color) covering the whole city — all surfaces are traversable roads
    const totalW = (gMaxX - gMinX + 1) * B;
    const totalD = (gMaxZ - gMinZ + 1) * B;
    const centerX = ((gMinX + gMaxX) / 2) * B;
    const centerZ = ((gMinZ + gMaxZ) / 2) * B;
    const groundGeo = new THREE.PlaneGeometry(totalW + B, totalD + B);
    const groundMat = new THREE.MeshLambertMaterial({ color: CONFIG.world.roadColor });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(centerX, -0.01, centerZ);
    this.scene.add(ground);
    this.entities.push({ mesh: ground, type: 'ground' });

    // Destination landmark node
    const destNode = path[path.length - 1];

    // Place buildings in every city block cell center: (gx+0.5)*B, (gz+0.5)*B
    for (let gx = gMinX; gx < gMaxX; gx++) {
      for (let gz = gMinZ; gz < gMaxZ; gz++) {
        const bx = (gx + 0.5) * B;
        const bz = (gz + 0.5) * B;
        this._placeBuilding(bx, bz, null);
      }
    }

    // Place landmark buildings adjacent to intersection nodes
    for (const n of path) {
      if (n.landmarkId && n.type === 'intersection') {
        this._placeLandmark(n.x, n.z, n.landmarkId, n.direction, 'left');
      }
    }

    // Destination landmark on correct side
    if (destNode) {
      this._placeLandmark(destNode.x, destNode.z, route.destination.landmarkId, destNode.direction, route.destination.side);
    }

    // Rider
    this.riderMesh = this._createRider();
    this.scene.add(this.riderMesh);
  },

  _placeBuilding(x, z, color) {
    const W = 5 + Math.random() * 6;
    const D = 5 + Math.random() * 6;
    const H = CONFIG.world.buildingHeightMin + Math.random() * (CONFIG.world.buildingHeightMax - CONFIG.world.buildingHeightMin);
    const col = color !== null ? color : Utils.pick(CONFIG.world.buildingColors);
    const geo = new THREE.BoxGeometry(W, H, D);
    const mat = new THREE.MeshLambertMaterial({ color: col });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, H / 2, z);
    this.scene.add(mesh);
    this.entities.push({ mesh, type: 'building' });
  },

  _placeLandmark(x, z, landmarkId, facing, side) {
    const color = CONFIG.world.landmarkColors[landmarkId] || 0xffffff;
    const B = CONFIG.movement.blockSize;
    const vec = Utils.directionVector(facing || 'north');
    const perpX = side === 'right' ? -vec.z : vec.z;
    const perpZ = side === 'right' ? vec.x : -vec.x;

    // Place in center of adjacent city block
    const lx = x + perpX * B;
    const lz = z + perpZ * B;

    // Distinctive tall landmark — overrides the generic building placed there
    const H = 18;
    const geo = new THREE.BoxGeometry(7, H, 7);
    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(lx, H / 2, lz);
    this.scene.add(mesh);
    this.entities.push({ mesh, type: 'landmark', data: { landmarkId } });

    // Top marker sphere
    const sgeo = new THREE.SphereGeometry(1.2, 8, 8);
    const smat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
    const sphere = new THREE.Mesh(sgeo, smat);
    sphere.position.set(lx, H + 2, lz);
    this.scene.add(sphere);
    this.entities.push({ mesh: sphere, type: 'landmark-marker', data: { landmarkId } });
  },

  _createRider() {
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.6, 0.8),
      new THREE.MeshLambertMaterial({ color: 0xf97316 })
    );
    body.position.y = 1.8;
    group.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.MeshLambertMaterial({ color: 0xfbbf24 })
    );
    head.position.y = 2.9;
    group.add(head);

    // Delivery box
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.2, 1.4),
      new THREE.MeshLambertMaterial({ color: 0xef4444 })
    );
    box.position.set(0, 2.2, -0.9);
    group.add(box);

    // Bike (simple flat box)
    const bike = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 2.2),
      new THREE.MeshLambertMaterial({ color: 0x6b7280 })
    );
    bike.position.y = 0.6;
    group.add(bike);

    return group;
  },

  updateRider(worldX, worldZ, facingDir) {
    if (!this.riderMesh) return;
    this.riderMesh.position.set(worldX, 0, worldZ);
    const angle = Utils.directionToAngle(facingDir);
    this.riderMesh.rotation.y = angle;
  },

  updateCamera(worldX, worldZ, facingDir) {
    const angle = Utils.directionToAngle(facingDir);
    const behind = 14;
    const height = 10;
    const cx = worldX - Math.sin(angle) * behind;
    const cz = worldZ - Math.cos(angle) * behind;
    this.camera.position.set(cx, height, cz);
    this.camera.lookAt(worldX + Math.sin(angle) * 6, 1, worldZ + Math.cos(angle) * 6);
  },

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  },

  dispose() {
    this.entities.forEach(e => {
      e.mesh.geometry.dispose();
      e.mesh.material.dispose();
      this.scene.remove(e.mesh);
    });
    this.entities = [];
    if (this.riderMesh) {
      this.scene.remove(this.riderMesh);
      this.riderMesh = null;
    }
  },

  _onResize(container) {
    const W = container.clientWidth;
    const H = container.clientHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  },
};
