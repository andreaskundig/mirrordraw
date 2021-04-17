
// http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
// https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event

function canvasHtml(width, height, left, top){
   return `
        <canvas
             width="${width}px"
             height="${height}px"
             style="margin:${top}px ${left}px;
                    border: 1px solid;
                    position: absolute;" ></canvas> `;
}

function createSheet(parent, canvasCount, d){
    parent.insertAdjacentHTML('afterbegin',
      `<div class="sheet" style="position: relative">
        ${[...Array(2)].map((_,i) =>
           canvasHtml(d.size.w, d.size.h,
                      d.margin.left + i *( d.margin.left +  d.size.w),
                      d.margin.top)).join('')}
        <div class="receiver"
             style="position: absolute;
                    width: ${d.size.w + d.margin.left}px;
                    height: ${d.size.h + d.margin.top + 20}px;
                    z-index:1;"></div>
       </div>`);
    const receiver = parent.querySelector('.receiver');
    const canvases = [...parent.querySelectorAll('canvas')];
    const ctxs = canvases.map(c => c.getContext('2d'));
    return {receiver, canvases, ctxs};
}

const byId = (id) => document.getElementById(id);
const canvasParentId = 'canvas-parent';

function addDrawingListeners(sheet, dims){
    const eventReceiver = sheet.receiver;
    const contexts = sheet.ctxs;
    const context = sheet.ctxs[0];
    const state = { isDrawing: false, x: 0, y: 0 };
    const correctCoordinates = (e) => {
        const x1 = e.offsetX - dims.margin.left;
        const y1 = e.offsetY - dims.margin.top;
        return [x1, y1];
    }
    eventReceiver.addEventListener('mousedown', e => {
        console.log(e.target.offsetLeft, e.offsetX,
                    e.target.getBoundingClientRect())
        const [x1, y1] = correctCoordinates(e);
        state.x = x1;
        state.y = y1;
        state.isDrawing = true;
    });
    eventReceiver.addEventListener('mousemove', e => {
        const [x1, y1] = correctCoordinates(e);
        if (state.isDrawing === true) {
            contexts.forEach(context =>
              drawLine(context, state.x, state.y, x1, y1)
            );
            state.x = x1;
            state.y = y1;
        }
    });
    const endDrawing = (e) => {
        const [x1, y1] = correctCoordinates(e);
        if (state.isDrawing === true) {
            contexts.forEach(context =>
              drawLine(context, state.x, state.y, x1, y1)
            );
            state.x = x1;
            state.y = y1;
            state.isDrawing = false;
        }
    }
    eventReceiver.addEventListener('mouseup', endDrawing);
    // eventReceiver.addEventListener('mouseout', endDrawing);
}

function init(){
    const cs = byId('cs');
    console.log('cs', cs?.shadowRoot.firstElementChild.firstElementChild);
   const canvasCount = 1;
    const dims = {size:{w: 200, h:200}, margin: {left:10,top:0}};
    const canvasParent = byId('canvas-parent');
   const sheet = createSheet(canvasParent, canvasCount, dims);
    addDrawingListeners(sheet, dims)

//TODO copy and rotate canvas
// https://stackoverflow.com/questions/3318565/any-way-to-clone-html5-canvas-element-with-its-content
// https://www.encodedna.com/html5/canvas/rotate-and-save-an-image-using-javascript-and-html5-canvas.htm
}
window.addEventListener('load', init);

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
