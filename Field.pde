class Field{
  float top;
  float left;
  float size = 30;
  
  Field(float top, float left, float size){
    this.top = top;
    this.left = left ;
    this.size = size;
  }
  
  boolean containsPVector(PVector p){
     return p!=null && p.x >= left  && p.x <= left + size && p.y >= top  && p.y <= top + size ;
  }
  
  void select(PVector p){}
  
  void drawField(){}
}

class ColorField extends Field{
  color col;
  
  ColorField(float top, float left, float size, color col){
    super(top, left, size);
    this.col = col ;
  }
  
  void select(PVector p){
    if(containsPVector(p)){
      currentColor = col;
    }
  }
   boolean isSelected(){
    return this.col == currentColor;
  }
 
  void drawField(){
    stroke(isSelected()? 0 : 255);

    fill(col);
    rect(left, top, size, size);
  }
}

class BrushField extends Field{
  float sWeight;
  
  BrushField(float top, float left, float size, float sWeight){
    super(top, left, size);
    this.sWeight = sWeight ;
  }
  
  void select(PVector p){
    if(containsPVector(p)){
      currentStrokeWeight = sWeight;
    }
  }
  
  boolean isSelected(){
    return this.sWeight == currentStrokeWeight;
  }
  
  void drawField(){
    stroke(isSelected()? 0 : 255);
    strokeWeight(3);
    noFill();
    rect(left, top, size, size);

    stroke(0);
    strokeWeight(sWeight);
    float x = left+size/2;
    float y = top+size/2;
    line(x , y, x, y);
    strokeWeight(0);
  }
}
