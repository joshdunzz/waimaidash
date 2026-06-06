const MapRenderer = {
  canvas: null,
  ctx: null,
  timerDisplay: null,

  init(canvasEl, timerEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.timerDisplay = timerEl;
  },

  render(route, timeRemaining, totalTime) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const pad = CONFIG.map.padding;
    const B = CONFIG.movement.blockSize;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = CONFIG.map.backgroundColor;
    ctx.fillRect(0, 0, W, H);

    const path = route._worldPath;
    if (!path || !path.length) return;

    // Compute world bounding box with padding (same as worldRenderer)
    const xs = path.map(p => p.x), zs = path.map(p => p.z);
    const rawMinX = Math.min(...xs), rawMaxX = Math.max(...xs);
    const rawMinZ = Math.min(...zs), rawMaxZ = Math.max(...zs);
    const gridPad = 2;
    const gMinX = (Math.floor(rawMinX / B) - gridPad) * B;
    const gMaxX = (Math.ceil(rawMaxX / B) + gridPad) * B;
    const gMinZ = (Math.floor(rawMinZ / B) - gridPad) * B;
    const gMaxZ = (Math.ceil(rawMaxZ / B) + gridPad) * B;

    const worldW = gMaxX - gMinX;
    const worldD = gMaxZ - gMinZ;

    const drawW = W - pad * 2;
    const drawH = H - pad * 2;
    const scale = Math.min(drawW / worldW, drawH / worldD) * 0.92;

    const offX = pad + (drawW - worldW * scale) / 2;
    const offZ = pad + (drawH - worldD * scale) / 2;

    // World -> screen
    const ts = (wx, wz) => ({
      sx: offX + (wx - gMinX) * scale,
      sy: offZ + (wz - gMinZ) * scale,
    });

    const cellPx = B * scale;

    // --- Draw city grid ---

    // Road background — mid-grey so dark building blocks stand out clearly
    ctx.fillStyle = '#475569';
    ctx.fillRect(offX, offZ, worldW * scale, worldD * scale);

    // Building blocks in every cell — dark fill, road gutters visible between
    const blockCols = Math.round(worldW / B);
    const blockRows = Math.round(worldD / B);
    const buildingInset = cellPx * 0.15;

    for (let gx = 0; gx < blockCols; gx++) {
      for (let gz = 0; gz < blockRows; gz++) {
        const wx = gMinX + gx * B;
        const wz = gMinZ + gz * B;
        const { sx, sy } = ts(wx, wz);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(
          sx + buildingInset,
          sy + buildingInset,
          cellPx - buildingInset * 2,
          cellPx - buildingInset * 2
        );
      }
    }

    // --- Draw route path (highlight) ---
    ctx.strokeStyle = CONFIG.map.routeColor || '#00e5ff';
    ctx.lineWidth = Math.max(4, cellPx * 0.28);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash([]);
    ctx.beginPath();
    path.forEach((p, i) => {
      const { sx, sy } = ts(p.x, p.z);
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();

    // Route direction arrows along straight segments
    for (let i = 1; i < path.length - 1; i++) {
      const p = path[i];
      if (p.type === 'road') {
        const { sx, sy } = ts(p.x, p.z);
        this._drawArrow(ctx, sx, sy, p.direction, cellPx * 0.22);
      }
    }

    // --- Intersection nodes ---
    for (const node of path) {
      if (node.type === 'intersection') {
        const { sx, sy } = ts(node.x, node.z);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(4, cellPx * 0.18), 0, Math.PI * 2);
        ctx.fill();
        const arrow = node.turn === 'left' ? '↰' : '↱';
        ctx.fillStyle = '#000';
        ctx.font = `bold ${Math.max(9, cellPx * 0.28)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(arrow, sx, sy);
      }
    }

    // --- Landmark dots at intersection nodes ---
    for (const node of path) {
      if (node.landmarkId && node.type === 'intersection') {
        const { sx, sy } = ts(node.x, node.z);
        const color = CONFIG.map.landmarkColors[node.landmarkId] || '#fff';
        this._box(ctx, sx, sy - cellPx * 0.3, color, Math.max(5, cellPx * 0.14));
      }
    }

    // --- Destination landmark ---
    const destNode = path[path.length - 1];
    const destLandmarkId = route.destination.landmarkId;
    const destSide = route.destination.side;
    const destColor = CONFIG.map.landmarkColors[destLandmarkId] || CONFIG.map.destColor || '#ef4444';

    const vec = this._dirVec(destNode.direction);
    const perpX = destSide === 'right' ? -vec.z : vec.z;
    const perpZ = destSide === 'right' ? vec.x : -vec.x;
    const dlx = destNode.x + perpX * B;
    const dlz = destNode.z + perpZ * B;
    const { sx: dlsx, sy: dlsy } = ts(dlx + B * 0.5, dlz + B * 0.5);

    // Highlight the destination block
    const { sx: dbx, sy: dbz } = ts(dlx, dlz);
    ctx.fillStyle = destColor;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(dbx + buildingInset * 0.5, dbz + buildingInset * 0.5, cellPx - buildingInset, cellPx - buildingInset);
    ctx.globalAlpha = 1;

    // Destination building marker
    const dR = Math.max(8, cellPx * 0.28);
    ctx.fillStyle = destColor;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dlsx, dlsy, dR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(8, dR * 0.9)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚑', dlsx, dlsy);

    ctx.fillStyle = destColor;
    ctx.font = `bold ${Math.max(8, cellPx * 0.2)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('DEST', dlsx, dlsy + dR + 2);

    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(7, cellPx * 0.16)}px monospace`;
    ctx.fillText(destSide.toUpperCase(), dlsx, dlsy + dR + Math.max(10, cellPx * 0.22));
    ctx.textBaseline = 'alphabetic';

    // --- Route end node (arrival point) ---
    const { sx: ex, sy: ey } = ts(destNode.x, destNode.z);
    ctx.fillStyle = CONFIG.map.destColor || '#ef4444';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(5, cellPx * 0.16), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // --- Start node ---
    const { sx: sx0, sy: sy0 } = ts(path[0].x, path[0].z);
    ctx.fillStyle = CONFIG.map.startColor || '#22c55e';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx0, sy0, Math.max(6, cellPx * 0.2), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = `bold ${Math.max(8, cellPx * 0.18)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', sx0, sy0);
    ctx.textBaseline = 'alphabetic';

    // --- Timer ---
    if (this.timerDisplay) {
      const pct = timeRemaining / totalTime;
      this.timerDisplay.textContent = Math.ceil(timeRemaining) + 's';
      this.timerDisplay.style.color = pct > 0.5 ? '#00e5ff' : pct > 0.25 ? '#ffcc00' : '#ff4444';
    }
  },

  _dirVec(dir) {
    return { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } }[dir] || { x: 0, z: -1 };
  },

  _drawArrow(ctx, sx, sy, dir, size) {
    const angles = { north: -Math.PI / 2, south: Math.PI / 2, east: 0, west: Math.PI };
    const a = angles[dir] || 0;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, -size * 0.5);
    ctx.lineTo(-size * 0.6, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  _box(ctx, x, y, color, r) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(x - r, y - r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();
  },

  clear() {
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.timerDisplay) this.timerDisplay.textContent = '';
  },
};
