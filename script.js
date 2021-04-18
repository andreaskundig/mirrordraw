
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event

const PANEL_INDEXES = {a: [0,0], b: [1,0], c: [0,1], d: [1,1]};
const P1 = [ {up: true,  panels:['a', 'b', 'c', 'd']},
             {up: true,  panels:['b', 'a', 'd', 'c']},
             {up: false, panels:['b', 'a', 'd', 'c']}];
const P2 = [ {up: true,  panels:['a', 'b', 'c', 'd']},
             {up: false, panels:['b', 'a', 'd', 'c']}];
const P3 = [ {up: true,  panels:['a', 'b', 'c', 'd']},
             {up: true,  panels:['b', 'a', 'd', 'c']}];
const P4 = [ {up: true,  panels:['a', 'b', 'c', 'd']},
             {up: false, panels:['b', 'a', 'd', 'c']},
             {up: false, panels:['a', 'b', 'c', 'd']}];
const P5 = P3;
const P6 = P2;
const PAGES = [P1, P2, P3, P4, P5, P6];
const LINE_WIDTHS = [3, 7, 20, 55, 150, 400];

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
                    cursor: crosshair;
                    position: absolute;" ></canvas> `;
}

const maxCanvWidth = (screenWidth, margin, canvasCount)=>
      (screenWidth - margin.left) / canvasCount  - margin.left;


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
    });
    clearAll(canvases);
    //TODO put receiver and canvases in state?
    return {receiver, canvases, state};
}

function addDownloadButton(parent, canvases) {
    parent.insertAdjacentHTML(
        'beforeend',
        `<a class="download" href="#" target="_blank">download</a>`);
    const download = parent.querySelector('.download');
    download.addEventListener('click', function() {
        const context = canvases[0].context;
        this.href = context.canvas.toDataURL('image/png');
    }, false);
    return download;
}

function addClearButton(parent, canvases) {
    parent.insertAdjacentHTML(
        'beforeend',
        ' <a class="clear" href="#" >clear</a>');
    const clear = parent.querySelector('.clear');
    clear.addEventListener('click', () => clearAll(canvases), false);
    return clear;
}

function addUploadButton(parent, canvases, state) {
    parent.insertAdjacentHTML('beforeend', `
        <a class="upload" href="#" >upload</a>
        <input type="file" class="imageLoader" style="display:none"/>
    `);
    const srcCanvas = canvases[0];
    const imageLoader = parent.querySelector('.imageLoader')
    imageLoader.addEventListener('change', (changeEvent) => {
        var reader = new FileReader();
        reader.addEventListener('load', (event) => {
            var img = new Image();
            img.addEventListener('load', () => {
                clearAll(canvases);
                const ctx = srcCanvas.context;
                ctx.drawImage(img, 0, 0,
                              ctx.canvas.height, ctx.canvas.width);
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
    return upload;
}

function addPageSelect(parent, canvases, state) {
    parent.insertAdjacentHTML('beforeend', `
        <select class="pages">
           ${PAGES.map((_p, i)=>
              `<option value="${i}">page ${i+1}</option>`).join('')}
        </select>
    `);
    const srcCanvas = canvases[0];
    const pageSelect = parent.querySelector('.pages')
    pageSelect.addEventListener('change', function(e) {
        state.page = PAGES[+e.target.value]
        clearAll(canvases.slice(1));
        copySrcCanvas(srcCanvas, canvases, state.page);
    }, false);

    return pageSelect;
}

function addColorButton(parent, state) {
    const icons = {black: '&#11035;', white: '&#11036;'};
    parent.insertAdjacentHTML(
        'beforeend',
        `<span class="color-button" style="cursor: pointer" ></span>`);
    const colorButton = parent.querySelector('.color-button');

    colorButton.update = (state) => {
        const newColor = state.lineStyle.strokeStyle || 'black';
        const newIcon = icons[newColor];
        colorButton.innerHTML = newIcon;
    };

    colorButton.addEventListener('click', function() {
        const isBlack = state.lineStyle.strokeStyle == 'black';
        const newColor = isBlack ? 'white' : 'black';
        state.lineStyle.strokeStyle = newColor;
        colorButton.update(state);
    }, false);

    return colorButton;
}

function addLineWidthSlider(parent, state) {
    const fromUi = (i) => LINE_WIDTHS[i];
    const toUi = (v) => LINE_WIDTHS.findIndex(w => w == v);
    // const toUi = (v) => v;
    // const fromUi = (v) => v;
    parent.insertAdjacentHTML(
        'beforeend',
        `<div>
           <input class="width-slider" type="range"
                  style="width: 70px"
                  min="0" max="${LINE_WIDTHS.length-1}" step="1">
           <input class="width-display" disabled
                  style="width: 25px; text-align: right;">
         </div>`);
    const slider = parent.querySelector('.width-slider');
    const display = parent.querySelector('.width-display');
    slider.update = (state) => {
        slider.value = toUi(state.lineStyle.lineWidth);
        display.value = state.lineStyle.lineWidth;
    };
    slider.addEventListener('input', function() {
        state.lineStyle.lineWidth = fromUi(slider.value);
        display.value = state.lineStyle.lineWidth;
    }, false);
    return slider;
}

function addButtons(canvases, state) {
    const btns = [];
    const topMenu = byId('top-menu');
    btns.push(addColorButton(topMenu, state));
    btns.push(addLineWidthSlider(topMenu, state));
    btns.push(addClearButton(topMenu, canvases));
    btns.push(addPageSelect(topMenu, canvases, state));
    // const bottomMenu = byId('bottom-menu');
    btns.push(addDownloadButton(topMenu, canvases));
    btns.push(addUploadButton(topMenu, canvases, state));

    btns.forEach(b => b.update && b.update(state));

}

const byId = (id) => document.getElementById(id);
const canvasParentId = 'canvas-parent';

function addDrawingListeners(sheet){
    const {receiver, canvases, state} = sheet;
    state.drawing = { isDrawing: false, x: 0, y: 0 };
    const startLine = e => {

    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
        receiver.setPointerCapture(e.pointerId);
        state.drawing.x = e.offsetX;
        state.drawing.y = e.offsetY;
        state.drawing.isDrawing = true;
    };
    const continueLine =  e => {
        const x = e.offsetX;
        const y = e.offsetY;
        if (state.drawing.isDrawing === true) {
            drawLines(canvases, x, y, state);
            state.drawing.x = x;
            state.drawing.y = y;
        }
    };
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
    // receiver.addEventListener('mousedown', startLine);
    // receiver.addEventListener('mousemove', continueLine);
    // receiver.addEventListener('mouseup', endDrawing);a
    receiver.addEventListener('pointerdown', startLine);
    receiver.addEventListener('pointermove', continueLine);
    receiver.addEventListener('pointerup', endDrawing);
    // receiver.addEventListener('pointercancel', endDrawing);
    // receiver.addEventListener('pointerout', endDrawing);
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
        if(!destOrder){ return; }
        const flip = srcOrder.up != destOrder.up;
        const w = srcCanvas.w / 2;
        const h = srcCanvas.h / 2;
        copyCanvas(srcCanvas, srcOrder, destCanvas, destOrder,
                   w, h, flip);
    });
}

function clearAll(canvases) {
    canvases.forEach(c => {
        const ctx = c.context;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
        const s = PANEL_INDEXES[sourceName];
        const d = PANEL_INDEXES[destinationName];
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

    const canvasCount = 3;
    const margin = { left: 20, top: 20 }
    const maxW = maxCanvWidth(document.body.clientWidth, margin, canvasCount);
    console.log(document.body.clientWidth, maxW);
    const defaultWidth = Math.min(350, maxW);
    const dims = { size: { w: defaultWidth, h: defaultWidth }, margin};
    const canvasParent = byId('canvas-parent');
    const state = {
        page: P1,
        lineStyle: {
            strokeStyle: 'black',
            lineWidth: LINE_WIDTHS[1]
        }
    };
    const sheet = createSheet(canvasParent, canvasCount,
                              dims, state);
    addDrawingListeners(sheet, dims);
    addButtons(sheet.canvases, state);
}
window.addEventListener('load', init);

