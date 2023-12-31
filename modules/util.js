import { COLORS } from "./pieces";

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const drawShape = (ctx, shape, {x: offsetX, y: offsetY}, inmovilized) => {
    if(!shape) return;
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value > 0) {
                const [color, inmovilizedColor] = COLORS[value - 1];
                ctx.fillStyle = inmovilized ? inmovilizedColor: color;
                ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
            }
        });
    });
}

const drawMiniShape = (ctx, canvas, shape) => {
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if(!shape) return
  const x = (5 - shape[0].length) / 2;
  const y = (6 - shape.length) / 2;
  drawShape(ctx, shape, {x, y});
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
export {random, drawShape, rotateShape, drawMiniShape}