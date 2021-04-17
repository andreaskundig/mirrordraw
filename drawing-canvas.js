// https://www.thinktecture.com/en/web-components/native-web-components-without-framework/
// https://alligator.io/web-components/attributes-properties/
// https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component/
// https://webcomponents.dev/edit/tgikBxxcjvhia7ZjRvxG/src/index.js?pm=1
export class DrawingCanvas extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    get width() {
        return +this.getAttribute('width');
    }

    get height() {
        return +this.getAttribute('height');
    }

    sel(selectors){
        return this.shadowRoot.querySelector(selectors);
    }

    buildTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
           #parent {
               position: relative;
           }
           canvas {
              border: 2px solid yellow;
              position: absolute;
               left:30px
           }
           #receiver {
              border: 1px dashed blue;
              position: absolute;
              width: ${this.width}px;
              height: ${this.height}px;
              z-index: 1;
           }
        </style>
        <div id="parent">
          <canvas width="${this.width}px" height="${this.height}px">
          </canvas>
          <div id="receiver"></div>
        </div>
        `;
        return template;
    }

    addDrawingListeners(receiver, canvas){
        const state = {isDrawing: false, x:0, y: 0};
        const context = canvas.getContext('2d');
        const correctCoordinates = (e) => {
            const x1 = e.offsetX - 30;
            const y1 = e.offsetY;
            return [x1, y1];
        }
        receiver.addEventListener('click', e => console.log('rec'));
        canvas.addEventListener('click', e => console.log('canv'));
        receiver.addEventListener('mousedown', e => {
            // console.log(e.target.offsetLeft, e.target.offsetTop)
            const [x1, y1] = correctCoordinates(e);
            state.x = x1;
            state.y = y1;
            state.isDrawing = true;
        });
        receiver.addEventListener('mousemove', e => {
            const [x1, y1] = correctCoordinates(e);
            if (state.isDrawing === true) {
                drawLine(context, state.x, state.y, x1, y1);
                state.x = x1;
                state.y = y1;
            }
        });
        const endDrawing = (e) => {
            const [x1, y1] = correctCoordinates(e);
            if (state.isDrawing === true) {
                drawLine(context, state.x, state.y, x1, y1);
                state.x = x1;
                state.y = y1;
                state.isDrawing = false;
            }
        }
        receiver.addEventListener('mouseup', endDrawing);
        receiver.addEventListener('mouseout', endDrawing);
    }

    connectedCallback(){
        const template = this.buildTemplate();
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const receiver = this.sel('#receiver');
        const canvas = this.sel('canvas');
        this.addDrawingListeners(receiver, canvas);
        console.log('Sheet added to DOM', receiver);
    }
}
window.customElements.define('drawing-canvas', DrawingCanvas);

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
