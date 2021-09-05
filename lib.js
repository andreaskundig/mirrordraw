const START_DRAWING_STATE = { isDrawing: false, x: 0, y: 0 };

export const createDrawingState = (state, pointerId) => {
    const drawing = Object.assign({}, START_DRAWING_STATE);
    state.drawing[pointerId] = drawing;
    return drawing;
}

export function copyFlippedPanel(srcCanvas, srcIndexes, destCanvas, destIndexes,
                          w, h, dpr){
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
    ctx.rotate(Math.PI);
    ctx.drawImage(srcCanvas.canvas,
        s[0] * w * dpr, s[1] * h * dpr,
        w * dpr, h * dpr,
        flippedDx * dpr, flippedDy * dpr,
        w * dpr, h * dpr);
    ctx.restore();
    // Reset transformation matrix to the identity matrix
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function copyPanel(srcCanvas, srcIndexes, destCanvas, destIndexes,
                   w, h, dpr){
    const s = srcIndexes;
    const d = destIndexes;
    destCanvas.context.drawImage(srcCanvas.canvas,
        s[0] * w * dpr, s[1] * h * dpr,
        w * dpr, h * dpr,
        d[0] * w * dpr, d[1] * h * dpr,
        w * dpr, h * dpr);
}
