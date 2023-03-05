import { strict as assert } from 'assert';
import { rectangleIntersection } from './lib.js';


function testRectangleIntersections(){
  const rect = {x: 50, y: 100, w: 100, h: 100};
  assert.deepEqual(rectangleIntersection(rect, 0,     0, 1  ), [100, 100]);
  assert.deepEqual(rectangleIntersection(rect, 0,     0, 0.5), [200, 100]);
  assert.deepEqual(rectangleIntersection(rect, 5,     0, 1  ), [105, 100]);
  assert.deepEqual(rectangleIntersection(rect, 0,    50, 1  ), [ 50, 100]);
  assert.deepEqual(rectangleIntersection(rect, 0,    55, 1  ), [ 50, 105]);
  assert.deepEqual(rectangleIntersection(rect, 0,   300,-1 ),  [100, 200]);
  assert.deepEqual(rectangleIntersection(rect, 200, 300, 1 ),  [100, 200]);
}


function main(){
  testRectangleIntersections();
}

main();
