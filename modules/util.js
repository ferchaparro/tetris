import { COLORS } from "./pieces";

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const drawShape = (ctx, shape, {x: offsetX, y: offsetY}) => {
    if(!shape) return;
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value > 0) {
                const [_, inmovilizedColor] = COLORS[value - 1];
                ctx.fillStyle = inmovilizedColor;
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
            }
        });
    });
}

const rotateShape = (shape) => {
  if(!shape) return;
  let rotated = [];
  shape[0].forEach((_, y) => {
    let row = [];
    shape.forEach((_, x) => {
      row = [...row, shape[shape.length - 1 - x][y]];
    });
    rotated = [...rotated, row];
  });
  return rotated;
}
export {random, drawShape, rotateShape}