const START_DRAWING_STATE = { isDrawing: false, x: 0, y: 0 };

const createDrawingState = () =>
  Object.assign({}, START_DRAWING_STATE);

export function addDrawListeners(eventReceiver, drawFromTo){
  const drawingStates = {};
  const startLine = (x, y, pointerId) => {
    const drawing = createDrawingState();
    drawingStates[pointerId] = drawing;
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
    // eventReceiver.setPointerCapture(pointerId);
    drawing.x = x;
    drawing.y = y;
    drawing.isDrawing = true;
  };

  const continueLine = (x, y, pointerId) => {
    const drawing = drawingStates[pointerId];
    if (drawing?.isDrawing === true) {
      drawFromTo(drawing.x, drawing.y, x, y);
      drawing.x = x;
      drawing.y = y;
    }
  };
  const endDrawing = (x, y, pointerId) => {
    const drawing = drawingStates[pointerId];
    if (drawing?.isDrawing === true) {
      delete drawingStates[pointerId];
      drawFromTo(drawing.x, drawing.y, x, y);
    }
  }

  // TODO maybe copy event handling from paper.js
  // https://github.com/paperjs/paper.js/blob/53b98de8b5a28c30e763890a21b4c824ab8cb280/src/view/View.js#L1070
  const mouseWrap = (f) => (e) => f(e.offsetX, e.offsetY, e.pointerId);
  eventReceiver.addEventListener('mousedown', mouseWrap(startLine));
  eventReceiver.addEventListener('mousemove', mouseWrap(continueLine));
  eventReceiver.addEventListener('mouseup', mouseWrap(endDrawing));

  // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
  const touchWrap = (f) => (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const touches = e.changedTouches;
    if (touches.length > 1) { console.log('tches', touches.length) }
    f(touches[0].pageX - rect.left,
      touches[0].pageY - rect.top,
      touches[0].identifier);
  };
  eventReceiver.addEventListener('touchstart', touchWrap(startLine));
  eventReceiver.addEventListener('touchmove', touchWrap(continueLine));
  eventReceiver.addEventListener('touchup', touchWrap(endDrawing));
}

export function drawLine(context, [x0, y0], [x1, y1], dpr, lineStyle) {
    context.save();
    context.scale(dpr || 1, dpr || 1);
    context.beginPath();
    context.strokeStyle = lineStyle?.strokeStyle || 'black';
    context.lineWidth = lineStyle?.lineWidth || 10;
    context.lineCap = 'round';
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
    context.restore();
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
  const sourceX = s[0] * w;
  const sourceY = s[1] * h;
  const destinationX = d[0] * w;
  const destinationY = d[1] * h;
  copyRotatedRectangle(srcCanvas, sourceX, sourceY,
                       destCanvas, destinationX, destinationY,
                       w, h, angle, dpr);
}

function copyRotatedRectangle(srcCanvas, sourceX, sourceY,
                              destCanvas, destinationX, destinationY,
                              w, h, angle, dpr) {
    const centerDx = destinationX + w/2;
    const centerDy = destinationY + h/2;
    const cornerDx = - w / 2;
    const cornerDy = - h / 2;
    const ctx = destCanvas.context;
    ctx.save();
    ctx.translate(centerDx * dpr, centerDy * dpr);
    ctx.rotate(angle);
    ctx.drawImage(srcCanvas.canvas,
        sourceX * dpr, sourceY * dpr,
        w * dpr, h * dpr,
        cornerDx * dpr, cornerDy * dpr,
        w * dpr, h * dpr);
    ctx.restore();
    // Reset transformation matrix to the identity matrix
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function clearContext(ctx) {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function rectangleContains(canvConf, x, y){
    return canvConf &&
        x >= canvConf.x && x <= canvConf.x + canvConf.w
        && y >= canvConf.y && y <= canvConf.y + canvConf.h;
}

export function rectangleIntersection(rectConf, x0, y0, slope){
    // const slope =  (y1 - y0) / (x1 - x0);
    if(!rectConf || rectangleContains(rectConf, x0, y0)){
      return [x0, y0];
    }

    // dx before canvas ( > 0 if outside)
    const bDxFromX = Math.max(0, rectConf.x - x0);
    const bDyFromX = bDxFromX * slope ;
    let dx = bDxFromX;
    let dy = bDyFromX;

    // dy before canvas ( > 0 if outside)
    const bDyFromY = Math.max(0, rectConf.y - y0);
    const bDxFromY = bDyFromY / slope ;
    if (Math.abs(dx) < Math.abs(bDxFromY)) {
        dx = bDxFromY;
        dy = bDyFromY;
    }

    // dx after canvas ( < 0 if outside)
    const aDxFromX = Math.min(0, rectConf.x + rectConf.h - x0 );
    const aDyFromX = aDxFromX * slope;
    if (Math.abs(dx) < Math.abs(aDxFromX)) {
        dx = aDxFromX;
        dy = aDyFromX;
    }

    // dy before canvas ( < 0 if outside)
    const aDyFromY = Math.min(0, rectConf.y +  rectConf.h - y0 );
    const aDxFromY = aDyFromY / slope;
    if (Math.abs(dx) < Math.abs(aDxFromY)) {
        dx = aDxFromY;
        dy = aDyFromY;
    }

    return [x0 + dx, y0 + dy];
}
