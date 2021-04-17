
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event

const panelIndexes = {a: [0,0], b: [1,0], c: [0,1], d: [1,1]};
const p1 = [ {up: true,  panels:['a', 'b', 'c', 'd']},
             {up: true,  panels:['b', 'a', 'd', 'c']},
             {up: false, panels:['b', 'a', 'd', 'c']},
           ]

function flip(page){
    return {up: !page.up, panels: page.panels.slice().reverse()};
}

function canvasContains(canvConf, x, y){
    return x >= canvConf.x && x <= canvConf.x + canvConf.w
        && y >= canvConf.y && y <= canvConf.y + canvConf.h;
}

function canvasHtml(config) {
    const { w, h, x, y } = config;
    return `
        <canvas
             width="${w}px"
             height="${h}px"
             style="margin:${y}px ${x}px;
                    border: 1px solid;
                    position: absolute;" ></canvas> `;
}

function createSheet(parent, canvasCount, d, state){
    const canvasConfigs = [...Array(canvasCount)].map((_, i) => ({
        w: d.size.w,
        h: d.size.h,
        x: d.margin.left + i * (d.margin.left + d.size.w),
        y: d.margin.top
    }));
    const totalWidth = canvasConfigs.length *(d.size.w + d.margin.left);
    parent.insertAdjacentHTML('afterbegin',
      `<div class="sheet" style="position: relative">
        ${canvasConfigs.map(canvasHtml).join('')}
        <div class="receiver"
             style="position: absolute;
                    width: ${totalWidth}px;
                    height: ${d.size.h + d.margin.top + 20}px;
                    z-index:1;"></div>
       </div>`);
    const receiver = parent.querySelector('.receiver');
    const canvasEls = parent.querySelectorAll('canvas');
    const canvases = canvasConfigs.map((canvConf, i) => {
        const canvas = canvasEls[i];
        const context = canvas.getContext('2d');
        return Object.assign(canvConf,{i, canvas, context})
    })
    return {receiver, canvases, state};
}

const byId = (id) => document.getElementById(id);
const canvasParentId = 'canvas-parent';

function correctCoordinates([x, y], dims) {
    const newX = x - dims.margin.left;
    const newY = y - dims.margin.top;
    return [newX, newY];
}

function addDrawingListeners(sheet, dims){
    const {receiver, canvases, state} = sheet;
    state.drawing = { isDrawing: false, x: 0, y: 0 };
    receiver.addEventListener('mousedown', e => {
        state.drawing.x = e.offsetX;
        state.drawing.y = e.offsetY;
        state.drawing.isDrawing = true;
    });
    receiver.addEventListener('mousemove', e => {
        const x = e.offsetX;
        const y = e.offsetY;
        if (state.drawing.isDrawing === true) {
            drawLines(canvases, x, y, state, dims);
            state.drawing.x = x;
            state.drawing.y = y;
        }
    });
    const endDrawing = (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
        if (state.drawing.isDrawing === true) {
            drawLines(canvases, x, y, state, dims);
            state.drawing.x = x;
            state.drawing.y = y;
            state.drawing.isDrawing = false;
        }
    }
    receiver.addEventListener('mouseup', endDrawing);
    // eventReceiver.addEventListener('mouseout', endDrawing);
}

function drawLines(canvases, x, y, state, dims) {
    const currentCanvas = canvases.find(c => canvasContains(c, x, y));
    const {page, lineStyle} = state;
    const [srcCanvas, ...destCanvases] = canvases;
    const [srcOrder, ...destOrders] = page;
    const oldXY = [state.drawing.x, state.drawing.y];
    const from = correctCoordinates(oldXY, dims);
    const to = correctCoordinates([x, y], dims);
    drawLine(srcCanvas.context, from, to, lineStyle);
    const w = srcCanvas.w/2;
    const h = srcCanvas.h/2;
    destCanvases.forEach((destCanvas,i) => {
        const destOrder = destOrders[i];
        const flip = srcOrder.up != destOrder.up;
        copyCanvas(srcCanvas, srcOrder, destCanvas, destOrder,
                   w, h, flip);
    });
}

function copyCanvas(srcCanvas, srcOrder, destCanvas, destOrder,
                    w, h, flip ){
    srcOrder.panels.forEach((sourceName, i) => {
        const destinationName = destOrder.panels[i];
        const s = panelIndexes[sourceName];
        const d = panelIndexes[destinationName];
        if(flip){
            copyFlippedPanel(srcCanvas, s, destCanvas, d, w, h);
        }else{
            copyPanel(srcCanvas, s, destCanvas, d, w, h);
        }
    })
}

function copyPanel(srcCanvas, srcIndexes, destCanvas, destIndexes, w, h){
    const s = srcIndexes;
    const d = destIndexes;
    destCanvas.context.drawImage(srcCanvas.canvas,
        s[0] * w, s[1] * h, w, h,
        d[0] * w, d[1] * h, w, h);
}
function copyFlippedPanel(srcCanvas, srcIndexes,
                          destCanvas, destIndexes, w, h){
    const s = srcIndexes;
    const d = destIndexes;
    const ctx = destCanvas.context;
    const dx = d[0] * w;
    const dy = d[1] * h;
    const centerDx = dx + w/2;
    const centerDy = dy + h/2;
    const flippedDx = - w / 2;
    const flippedDy = - h / 2;
    ctx.translate(centerDx, centerDy);
    ctx.rotate(Math.PI);
    ctx.drawImage(srcCanvas.canvas,
        s[0] * w, s[1] * h, w, h,
        flippedDx, flippedDy, w, h);
    // Reset transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawLine(context, [x1, y1], [x2, y2], lineStyle) {
    context.beginPath();
    context.strokeStyle = lineStyle?.strokeStyle || 'black';
    context.lineWidth = lineStyle?.lineWidth || 10;
    context.lineCap = 'round';
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

function init() {
    const cs = byId('cs');
    console.log('cs', cs?.shadowRoot.firstElementChild.firstElementChild);
    const dims = { size: { w: 200, h: 400 }, margin: { left: 20, top: 0 } };
    const canvasParent = byId('canvas-parent');
    const canvasCount = 3;
    const globalState = { page: p1, lineStyle: {strokeStyle: 'blue',
                                                lineWidth: 5} };
    const sheet = createSheet(canvasParent, canvasCount,
                              dims, globalState);
    addDrawingListeners(sheet, dims)
}
window.addEventListener('load', init);

