class Panel{
   PVector trans;
   PVector aToB = new PVector();
   PVector delta = new PVector();
   PVector linePoint = new PVector();
   float left, right, top, bottom;
   boolean rotate180 = false;

   Panel(PVector cornerA, PVector cornerB, PVector translation, boolean rotate180, PVector offset){
     left = min(cornerA.x, cornerB.x) + offset.x;
     right = max(cornerA.x, cornerB.x) + offset.x;
     top = min(cornerA.y, cornerB.y) + offset.y;
     bottom = max(cornerA.y, cornerB.y) + offset.y;
     this.trans = translation;
     this.rotate180 = rotate180;
     //println("l"+left+" r"+right+" t"+top+" b"+bottom+" tx"+translation[0]+" ty"+translation[1]);
   }

   void drawPanel(){
     line(left, top, right, top); 
     line(right, top, right, bottom); 
     line(right, bottom, left, bottom); 
     line(left, bottom, left, top);
   }
   
   void drawTransformedPanel(){
    pushMatrix();  
    translate(trans.x, trans.y);
    drawPanel();
    popMatrix();
   }

   boolean containsPVector(PVector p, boolean transformed, float margin){
     float dX = transformed ? trans.x : 0;
     float dY = transformed ? trans.y : 0; 
     return p!=null && 
            p.x >= left + dX + margin && p.x <= right + dX - margin && 
            p.y >= top + dY + margin && p.y <= bottom + dY - margin ;
   } 

   void drawLines(PVector a, PVector b, float margin){
     drawLine(a, b, margin, false);
     drawLine(a, b, margin, true);
   }
   
   void drawLine(PVector a, PVector b, float margin, boolean transformed){
     boolean aInside = containsPVector(a, transformed, margin);
     boolean bInside = containsPVector(b, transformed, margin);
     boolean aInsideMargin = containsPVector(a, transformed, 0);
     boolean bInsideMargin = containsPVector(b, transformed, 0);
     
     if(aInside || bInside){
       PVector start = a;
       PVector end = b;
       if (aInside != bInside){
         PVector inP = aInside? a : b;
         PVector outP = aInside ? b : a;
         start = inP;
         end = findIntersection(inP, outP, transformed, margin);
       }
       homemadeLine(start, end, margin);
       //line(start.x, start.y, end.x, end.y);
       drawTransformedLine(start, end, transformed, margin);
     }else if(aInsideMargin || bInsideMargin){
       a = aInsideMargin ? moveToMarginSide(a, margin, transformed) : a;
       b = bInsideMargin ? moveToMarginSide(b, margin, transformed) : b;
       drawLine(a, b, margin, transformed);
     }
   }
   
   void homemadeLine(PVector a, PVector b, float margin){
     boolean reallyHomemade = true;
    if(!reallyHomemade){
      strokeWeight(margin*2);
      line(a.x, a.y, b.x, b.y);
      return;
    }
   
    aToB.set(b);
    aToB.sub(a);
    delta.set(aToB);
    delta.normalize();
    delta.mult(margin);
    rotate2D(delta, HALF_PI);
    linePoint.set(a);
    linePoint.add(delta);

    delta.mult(2);
    float strokeW = margin *2;

    
     beginShape();
     vertex(linePoint.x, linePoint.y);
     linePoint.sub(delta);
     vertex(linePoint.x, linePoint.y);
     linePoint.add(aToB);
     vertex(linePoint.x, linePoint.y);
     linePoint.add(delta);
     vertex(linePoint.x, linePoint.y);
     endShape(CLOSE);
     

     float heading = delta.heading2D();
      arc(a.x, a.y, strokeW, strokeW, heading,  PI + heading);
      arc(b.x, b.y, strokeW, strokeW,  PI + heading, 2 * PI + heading);
    }
    
    void rotate2D(PVector v, float theta) {
      float xTemp = v.x;
      v.x = v.x*cos(theta) - v.y*sin(theta);
      v.y = xTemp*sin(theta) + v.y*cos(theta);
    }




   void drawTransformedLine(PVector start, PVector end, boolean transformed, float margin){
     pushMatrix(); 
     if(rotate180) {
       float axisX = (trans.x + right + left) /2;
       float axisY = (trans.y + bottom + top) /2;
       translate(axisX, axisY);
       rotate(PI);
       translate(-axisX, -axisY);
     }else{
       float sign = transformed ? -1 : 1;
       translate(sign * trans.x, sign * trans.y);
     }
     homemadeLine(start, end, margin);
     //line(start.x, start.y, end.x, end.y);
     popMatrix();     
   }
   
   
   PVector moveToMarginSide(PVector p, float margin, boolean transformed){
     float dX = transformed ? trans.x : 0;
     float dY = transformed ? trans.y : 0; 
     float x = min(max(p.x, left + margin + dX), right - margin + dX);
     float y = min(max(p.y, top + margin + dY), bottom - margin + dY);
     return new PVector(x,y);  
   }

   PVector findIntersection(PVector inP, PVector outP, boolean transformed, float margin){
       float dX = transformed ? trans.x : 0;
       float dY = transformed ? trans.y : 0;
       PVector []points = {
        intersectionHorizontal(inP, outP, top + dY + margin),
        intersectionHorizontal(inP, outP, bottom + dY - margin),
        intersectionVertical(inP, outP, left + dX + margin),
        intersectionVertical(inP, outP, right + dX - margin)
       };
       for(PVector p: points){
         if(containsPVector(p, transformed, margin)){
           return p;
         }
       }
       return null;

   }
   
 }
 
 PVector intersectionHorizontal(PVector inP, PVector outP, float yH){
  if(min(inP.y, outP.y) <= yH && yH <= max(inP.y, outP.y) ){
    float newX = inP.x;
    if(outP.y!=inP.y){
      newX += (outP.x - inP.x) * (yH - inP.y) / (outP.y - inP.y);
    }
    return  new PVector(newX , yH);
  }
  return null;
}

PVector  intersectionVertical(PVector a, PVector b, float xV){
  if(min(a.x, b.x) <= xV && xV <= max(a.x, b.x) ){
    float newY =  a.y ;
    if(b.x != a.x){
      newY +=  (b.y-a.y) * (xV - a.x) / (b.x-a.x);
    }
    return new PVector(xV, newY );
  }
  return null;
}
