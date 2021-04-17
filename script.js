
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

function canvasHtml(config) {
    const { w, h, left, top } = config;
    return `
        <canvas
             width="${w}px"
             height="${h}px"
             style="margin:${top}px ${left}px;
                    border: 1px solid;
                    position: absolute;" ></canvas> `;
}

function createSheet(parent, canvasCount, d){
    const canvasConfigs = [...Array(canvasCount)].map((_, i) => ({
        w: d.size.w,
        h: d.size.h,
        left: d.margin.left + i * (d.margin.left + d.size.w),
        top: d.margin.top
    }));
    parent.insertAdjacentHTML('afterbegin',
      `<div class="sheet" style="position: relative">
        ${canvasConfigs.map(canvasHtml).join('')}
        <div class="receiver"
             style="position: absolute;
                    width: ${d.size.w + d.margin.left}px;
                    height: ${d.size.h + d.margin.top + 20}px;
                    z-index:1;"></div>
       </div>`);
    const receiver = parent.querySelector('.receiver');
    const canvasEls = parent.querySelectorAll('canvas');
    const canvases = canvasConfigs.map((c, i) => {
        const canvas = canvasEls[i];
        const context = canvas.getContext('2d');
        return Object.assign(c,{canvas, context})
    })
    return {receiver, canvases};
}

const byId = (id) => document.getElementById(id);
const canvasParentId = 'canvas-parent';

function addDrawingListeners(sheet, dims){
    const {receiver, canvases} = sheet;
    const drawingState = { isDrawing: false, x: 0, y: 0 };
    const correctCoordinates = (e) => {
        const x = e.offsetX - dims.margin.left;
        const y = e.offsetY - dims.margin.top;
        return [x, y];
    }
    receiver.addEventListener('mousedown', e => {
        const [x, y] = correctCoordinates(e);
        drawingState.x = x;
        drawingState.y = y;
        drawingState.isDrawing = true;
    });
    receiver.addEventListener('mousemove', e => {
        const [x, y] = correctCoordinates(e);
        if (drawingState.isDrawing === true) {
            drawLines(canvases, drawingState, x, y);
            drawingState.x = x;
            drawingState.y = y;
        }
    });
    const endDrawing = (e) => {
        const [x, y] = correctCoordinates(e);
        if (drawingState.isDrawing === true) {
            drawLines(canvases, drawingState, x, y);
            drawingState.x = x;
            drawingState.y = y;
            drawingState.isDrawing = false;
        }
    }
    receiver.addEventListener('mouseup', endDrawing);
    // eventReceiver.addEventListener('mouseout', endDrawing);
}

function drawLines(canvases, state, x1, y1) {
    const page = p1;
    const [srcCanvas, ...destCanvases] = canvases;
    const [srcOrder, ...destOrders] = page;
    drawLine(srcCanvas.context, state.x, state.y, x1, y1);
    const w = srcCanvas.w/2;
    const h = srcCanvas.h/2;
    destCanvases.forEach((destCanvas,i) => {
        const destOrder = destOrders[i];
        const flip = srcOrder.up != destOrder.up;
        copyCanvas(srcCanvas, srcOrder, destCanvas, destOrder, w, h, flip);
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
    ctx.setTransform(1, 0, 0, 1, 0, 0)
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = 'black';
  context.lineWidth = 10;
  context.lineCap = 'round';
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

function init(){
    const cs = byId('cs');
    console.log('cs', cs?.shadowRoot.firstElementChild.firstElementChild);
    const dims = {size:{w: 200, h:200}, margin: {left:10,top:0}};
    const canvasParent = byId('canvas-parent');
   const canvasCount = 3;
   const sheet = createSheet(canvasParent, canvasCount, dims);
    addDrawingListeners(sheet, dims)
}
window.addEventListener('load', init);

