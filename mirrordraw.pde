boolean pMousePressed = false;
color currentColor = color(0);
float currentStrokeWeight = 3;

Panel [] panels ;
Field [] fields;

void setup() {
  // 640;//540;//min(displayWidth, 640);
  // 905;//764;//int(totalWidth*sqrt(2)); //min(displayHeight, int(totalWidth*sqrt(2)));
  PVector offset = new PVector( 60, 10 );
  int siz = 300;
  size(siz + offset.x, siz*2+offset.y);
  int totalWidth = width;
  int totalHeight = height;
  
  int myWidth = totalWidth - 10;
  int myHeight = totalHeight -10;

  PVector corner = new PVector(myWidth - offset.x,
                               myHeight / 2 - offset.y );
  PVector center = new PVector (int(corner.x *.5),
                                corner.y / 2);

  int gutter = 10;
  PVector translation1 = new PVector(corner.x-center.x, gutter+corner.y+center.y);
  PVector translation2 = new PVector(corner.x-center.x, gutter+center.y);
  PVector translation3 = new PVector(-center.x, gutter+corner.y);
  panels = new Panel [] {
     new Panel(new PVector(0,0), center, translation1, false, offset),
     new Panel(new PVector(0,corner.y), center, translation2, true, offset),
     new Panel(new PVector(center.x, 0), new PVector(corner.x, center.y), translation3, false, offset),
     new Panel(center, corner, translation3, false, offset)
  };
  
  int fieldSize = 50; 
  int fSizeWithStroke = fieldSize + 3;
  fields = new Field []{ 
    new ColorField(10, 0, fieldSize, color(255, 0, 0)),
    new ColorField(10 +   fSizeWithStroke, 0, fieldSize, color(0, 255, 0)),
    new ColorField(10 + 2*fSizeWithStroke, 0, fieldSize, color(0, 0, 255)),
    new ColorField(10 + 3*fSizeWithStroke, 0, fieldSize, color(255, 255, 255)),
    new ColorField(10 + 4*fSizeWithStroke, 0, fieldSize, color(0, 0, 0)),
    new BrushField(10 + 5*fSizeWithStroke + 5, 0, fieldSize, 3),
    new BrushField(10 + 6*fSizeWithStroke + 5, 0, fieldSize, 10),
    new BrushField(10 + 7*fSizeWithStroke + 5, 0, fieldSize, 20),
    new BrushField(10 + 8*fSizeWithStroke + 5, 0, fieldSize, 40),
  } ;
  
  clear();

}

void draw() {

  if (pMousePressed && mousePressed) {
    PVector a = new PVector(pmouseX, pmouseY);
    PVector b = new PVector(mouseX, mouseY);
    
    stroke(currentColor);
    strokeWeight(0);
    fill(currentColor);
    for(Panel panel: panels){
      panel.drawLines(a, b, currentStrokeWeight/2 ); 
    } 

  }
  stroke(0);
  strokeWeight(3);
  for(Panel panel: panels){
    panel.drawPanel();
    panel.drawTransformedPanel();
  }
  if (keyPressed) {
    if (key == 'c' ) {
      clear();
    }
  }
  
  for(Field field: fields){
    field.drawField();
  }
  pMousePressed = mousePressed;
}

void mouseClicked() {
  PVector b = new PVector(mouseX, mouseY);
  for(Field field: fields){
    field.select(b);
  }
}

void clear(){
  background(255);
}





 



