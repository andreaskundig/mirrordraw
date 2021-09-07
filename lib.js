const START_DRAWING_STATE = { isDrawing: false, x: 0, y: 0 };

export const createDrawingState = (state, pointerId) => {
    const drawing = Object.assign({}, START_DRAWING_STATE);
    state.drawing[pointerId] = drawing;
    return drawing;
}


export const PANEL_INDEXES = {a: [0,0], b: [1,0], c: [0,1], d: [1,1]};

export function copyPanel(srcCanvas, srcPanel,
                          destCanvas, destPanel,
                          width, height,
                          devicePixelRatio, upsideDown){
    const s = PANEL_INDEXES[srcPanel];
    const d = PANEL_INDEXES[destPanel];
    const angle = upsideDown ? Math.PI : 0;
    copyRotatedPanel(srcCanvas, s, destCanvas, d,
                     width, height, devicePixelRatio,
                     angle);
}

function copyRotatedPanel(srcCanvas, srcIndexes,
                          destCanvas, destIndexes,
                          w, h, dpr, angle) {
    const s = srcIndexes;
    const d = destIndexes;
    const ctx = destCanvas.context;
    const dx = d[0] * w;
    const dy = d[1] * h;
    const centerDx = dx + w/2;
    const centerDy = dy + h/2;
    const flippedDx = - w / 2;
    const flippedDy = - h / 2;
    ctx.save();
    ctx.translate(centerDx * dpr, centerDy * dpr);
    ctx.rotate(angle);
    ctx.drawImage(srcCanvas.canvas,
        s[0] * w * dpr, s[1] * h * dpr,
        w * dpr, h * dpr,
        flippedDx * dpr, flippedDy * dpr,
        w * dpr, h * dpr);
    ctx.restore();
    // Reset transformation matrix to the identity matrix
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
}
