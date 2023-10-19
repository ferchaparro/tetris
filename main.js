import './style.css'
import { BLOCK_SIZE, GAME_HEIGHT, GAME_WIDTH } from './modules/constants'
import { random, drawShape, rotateShape } from './modules/util';
import { SHAPES } from './modules/pieces';

const scoreLabel = document.getElementById('score');
const hiscoreLabel = document.getElementById('hiscore');
const levelLabel = document.getElementById('level');
const canvas = document.getElementById('game');
const nextShapeCanvas = document.getElementById('next');
const ctx = canvas.getContext('2d');
const nextShapeCtx = nextShapeCanvas.getContext('2d');
let timeToMove = 950;
let score = 0;
let level = 1;
let hiscore = localStorage.getItem('hiscore') || score;

canvas.width = GAME_WIDTH * BLOCK_SIZE;
canvas.height = GAME_HEIGHT * BLOCK_SIZE;
nextShapeCanvas.width = 4 * BLOCK_SIZE;
nextShapeCanvas.height = 4 * BLOCK_SIZE;

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
nextShapeCtx.fillStyle = 'black';
nextShapeCtx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextShapeCtx.scale(BLOCK_SIZE, BLOCK_SIZE);

let rowIndex = 0;
let colIndex = GAME_WIDTH / 2 - 2;

const game = Array.from({length: GAME_HEIGHT}, () => Array(GAME_WIDTH).fill(0));
// console.log(game);
// game[0][0] = 1
// game[0][1] = 2
// game[0][2] = 3
// game[0][3] = 4
// game[0][4] = 5
// game[0][5] = 6
// game[0][6] = 7

let lastTime = 0;
let nextShape;
let currentShape;

const generateNextShape = () => {
  const r = random(1, 7)-1;
  nextShape = SHAPES[r];
}
const getNextShape = () => {
  currentShape = nextShape;
  generateNextShape();
}
const refresh = (x) => {
  const currentTime = Math.floor(x) % timeToMove;
  if(currentTime < lastTime) {
    lastTime = 0;
    rowIndex++;
    if(!currentShape){
      getNextShape();
      rowIndex = 0 - currentShape.length + 2;
    } else {
      checkBottomCollision(currentShape)
    }
    draw()
  }
  lastTime = currentTime;
  requestAnimationFrame(refresh);
};

const draw = () => {
  drawBoard();
  drawNextShape();
  drawShape(ctx, currentShape, {x: colIndex, y: rowIndex});
  scoreLabel.innerHTML = `SCORE: ${score}`;
  hiscoreLabel.innerHTML = `Hi-SCORE: ${hiscore}`;
  levelLabel.innerHTML = `LEVEL ${level}`;
  checkGameOver();
}

const drawBoard = () => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawShape(ctx, game, {x: 0, y: 0}, true);
}

const drawNextShape = () => {
  nextShapeCtx.fillStyle = 'black';
  nextShapeCtx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
  const x = 2 - nextShape[0].length / 2;
  const y = 2.5 - nextShape.length / 2;
  drawShape(nextShapeCtx, nextShape, {x, y});
}

const checkLeftCollision = (shape) => {
  if(!shape)return
  for(let y = 0; y < shape.length; y++) {
    for(let x = 0; x < shape[y].length; x++) {
      if(shape[y][x] > 0) {
        if(!game[rowIndex + y] || game[rowIndex + y][colIndex + x - 1] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

const checkRightCollision = (shape) => {
  if(!shape)return
  for(let y = 0; y < shape.length; y++) {
    for(let x = 0; x < shape[y].length; x++) {
      if(shape[y][x] > 0) {
        if(!game[rowIndex + y] || game[rowIndex + y][colIndex + x + 1] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

const checkBottomCollision = (shape) => {
  if(!shape)return
  for(let y = 0; y < shape.length; y++) {
    for(let x = 0; x < shape[y].length; x++) {
      if(shape[y][x] > 0) {
        if(!game[rowIndex + y + 1] || game[rowIndex + y + 1][colIndex + x] !== 0) {
          inmovilizeShape(shape);
          return true;
        }
      }
    }
  }
  return false;
}

const inmovilizeShape = (shape) => {
  if(!shape)return
  shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if(value > 0) {
        if(game[rowIndex + y] && game[rowIndex + y][colIndex + x] !== undefined) {
          game[rowIndex + y][colIndex + x] = value;
        }
      }
    });
  });
  currentShape = null;
  getNextShape();
  rowIndex = 0 - currentShape.length + 2;
  colIndex = GAME_WIDTH / 2 - 2;
  draw();
  checkRows();
}

const checkRows = () => {
  for(let y = 0; y < game.length; y++) {
    const row = game[y];
    let isFull = true;
    for(let x = 0; x < row.length; x++) {
      if(row[x] === 0) {
        isFull = false;
        break;
      }
    }
    if(isFull) {
      game.splice(y, 1);
      game.unshift(Array(GAME_WIDTH).fill(0));
      score++;
      if(score > hiscore) {
        hiscore = score;
        localStorage.setItem('hiscore', hiscore);
      }
      if(score % 10 === 0) {
        level++;
        if(timeToMove > 50){
          timeToMove -= 100;
        }
      }
      draw()
    }
  }
}

const checkGameOver = () => {
  const firstRow = game[0];
  for(let x = 0; x < firstRow.length; x++) {
    if(firstRow[x] !== 0) {
      endOfGame();
      break;
    }
  }
}

const endOfGame = () => {
  alert('Game Over');
  score = 0;
  timeToMove = 1000;
  game.forEach(row => row.fill(0));
  draw();
}




// const totales = [0, 0, 0, 0, 0, 0, 0]
// for(let i = 0; i < 10000000; i++) {
//   const r = random(1, 7);
  
//   totales[r-1]++;
//     if(r<1 || r>7){ console.log('error: ', r);}
// }
// console.log('done');
// console.log('totales: ', totales);



// const generateShape = (x, y, x2, y2) => {
//   const r = random(1, 7)-1;
//   const shape = SHAPES[r];
//   drawShape(ctx, shape, {x, y});
//   const rotatedShape = rotateShape(shape);
//   drawShape(ctx, rotatedShape, {x: x2, y: y2});
// }

// generateShape(0, 0, 5, 0)
// generateShape(3, 9, 2, 2)

window.addEventListener('keydown', ({code}) => {
  if(code === 'ArrowLeft') {
    if(!checkLeftCollision(currentShape)){
      colIndex--
    }
  }else if(code === 'ArrowRight') {
    if(!checkRightCollision(currentShape)) {
      colIndex++
    }
  }else if(code === 'ArrowDown') {
    if(!checkBottomCollision(currentShape)) {
      rowIndex++
    }
  }else if(code === 'Space') {
    currentShape = rotateShape(currentShape);
    const diff = GAME_WIDTH - (colIndex + currentShape[0].length);
    if(diff < 0) {
      colIndex += diff;
    } else if(colIndex < 0){
      colIndex = 0
    }
  }
  draw();
});

generateNextShape();
refresh(0)


