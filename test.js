import { strict as assert } from 'assert';
import { rectangleIntersection } from './lib.js';


function testRectangleIntersections(){
  const rect = {x: 50, y: 100, w: 200, h: 100};
  assert.deepEqual([100, 100], rectangleIntersection(rect, 0, 0, 1))
  assert.deepEqual([200, 100], rectangleIntersection(rect, 0, 0, 0.5))
  assert.deepEqual([105, 100], rectangleIntersection(rect, 5, 0, 1))
  assert.deepEqual([ 50, 100], rectangleIntersection(rect, 0, 50, 1))
  assert.deepEqual([ 50, 105], rectangleIntersection(rect, 0, 55, 1))
}


function main(){
  testRectangleIntersections();
}

main();
