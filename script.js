
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
                    background-color: white;
                    position: absolute;" ></canvas> `;
}

function createSheet(parent, canvasCount, d, state){
    const canvasConfigs = [...Array(canvasCount)].map((_, i) => ({
        w: d.size.w,
        h: d.size.h,
        x: d.margin.left +
            i * (d.margin.left + d.size.w ),
        y: d.margin.top
    }));
    const totalWidth = d.margin.left +
          canvasConfigs.length *(d.size.w + d.margin.left);
    const totalHeight = d.size.h + d.margin.top * 2;
    parent.insertAdjacentHTML('afterbegin',
      `<div class="sheet"
            style="position: relative;
                   background-color: grey;
                   width: ${totalWidth}px;
                   height: ${totalHeight}px; ">
        ${canvasConfigs.map(canvasHtml).join('')}
        <div class="receiver"
             style="position: absolute;
                    width: ${totalWidth}px;
                    height: ${d.size.h + d.margin.top * 2}px;
                    z-index:1;"></div>
       </div>
`);
    const receiver = parent.querySelector('.receiver');
    const canvasEls = parent.querySelectorAll('canvas');
    const canvases = canvasConfigs.map((canvConf, i) => {
        const canvas = canvasEls[i];
        const context = canvas.getContext('2d');
        return Object.assign(canvConf,{i, canvas, context})
    })
    // addPersistenceButtons(parent, canvases[0].context);
    return {receiver, canvases, state};
}

function addButtons(parent, canvases, state) {
    parent.insertAdjacentHTML('beforeend',
        `<a class="download" href="#" target="_blank">download</a>
         <a class="upload" href="#" >upload</a>
         <input type="file" class="imageLoader"
                name="imageLoader" style="display:none"/>
        <a class="clear" href="#" >clear</a>
`);
    const srcCanvas = canvases[0];
    const context = srcCanvas.context;
    const download = parent.querySelector('.download');
    download.addEventListener('click', function() {
        this.href = context.canvas.toDataURL('image/png');
    }, false);
    const clearAll = () =>
        canvases.forEach(c => {
            const ctx = c.context;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        });
    const clear = parent.querySelector('.clear');
    clear.addEventListener('click', clearAll, false);
    const imageLoader = parent.querySelector('.imageLoader')
    imageLoader.addEventListener('change', (changeEvent) => {
        var reader = new FileReader();
        reader.addEventListener('load', (event) => {
            var img = new Image();
            img.addEventListener('load', () => {
                clearAll();
                srcCanvas.context.drawImage(img, 0, 0);
                copySrcCanvas(srcCanvas, canvases, state.page);
            });
            img.src = event.target.result;
        });
        reader.readAsDataURL(changeEvent.target.files[0]);
    }, false);
    const upload = parent.querySelector('.upload')
    upload.addEventListener('click', function() {
        imageLoader.click();
    }, false);
}

const byId = (id) => document.getElementById(id);
const canvasParentId = 'canvas-parent';

function addDrawingListeners(sheet){
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
            drawLines(canvases, x, y, state);
            state.drawing.x = x;
            state.drawing.y = y;
        }
    });
    const endDrawing = (e) => {
        const x = e.offsetX;
        const y = e.offsetY;
        if (state.drawing.isDrawing === true) {
            drawLines(canvases, x, y, state);
            state.drawing.x = x;
            state.drawing.y = y;
            state.drawing.isDrawing = false;
        }
    }
    receiver.addEventListener('mouseup', endDrawing);
}

function drawLines(canvases, x, y, state) {
    const srcCanvas = canvases.find(c => canvasContains(c, x, y));
    if(!srcCanvas){ return; }
    const {page, lineStyle} = state;
    const oldXY = [state.drawing.x, state.drawing.y];
    const from = canvasCoordinates(oldXY, srcCanvas);
    const to = canvasCoordinates([x, y], srcCanvas);
    drawLine(srcCanvas.context, from, to, lineStyle);
    copySrcCanvas(srcCanvas, canvases, page);
}

function copySrcCanvas(srcCanvas, canvases, page){
    const srcOrder = page[srcCanvas.i];
    const destCanvases = canvases.filter(c => c.i != srcCanvas.i);
    destCanvases.forEach(destCanvas => {
        const destOrder = page[destCanvas.i];
        const flip = srcOrder.up != destOrder.up;
        const w = srcCanvas.w / 2;
        const h = srcCanvas.h / 2;
        copyCanvas(srcCanvas, srcOrder, destCanvas, destOrder,
                   w, h, flip);
    });
}

function canvasCoordinates([x, y], canvasConfig) {
    const newX = x - canvasConfig.x;
    const newY = y - canvasConfig.y;
    return [newX, newY];
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
    const dims = { size: { w: 400, h: 400 },
                   margin: { left: 20, top: 10 } };
    const canvasParent = byId('canvas-parent');
    const canvasCount = 3;
    const globalState = { page: p1, lineStyle: {strokeStyle: 'black',
                                                lineWidth: 5} };
    const sheet = createSheet(canvasParent, canvasCount,
                              dims, globalState);
    addDrawingListeners(sheet, dims);
    addButtons(canvasParent, sheet.canvases, globalState);
}
window.addEventListener('load', init);

