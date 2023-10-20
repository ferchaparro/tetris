import './style.css'
import { BLOCK_SIZE, GAME_HEIGHT, GAME_WIDTH } from './modules/constants'
import { random, drawShape, rotateShape, drawMiniShape } from './modules/util';
import { SHAPES } from './modules/pieces';

const scoreLabel = document.getElementById('score');
const hiscoreLabel = document.getElementById('hiscore');
const levelLabel = document.getElementById('level');
const canvas = document.getElementById('game');
const nextShapeCanvas = document.getElementById('next');
const storeCanvas = document.getElementById('store');
const ctx = canvas.getContext('2d');
const nextShapeCtx = nextShapeCanvas.getContext('2d');
const storeCtx = storeCanvas.getContext('2d');
let timeToMove = 950;
let score = 0;
let level = 1;
let hiscore = localStorage.getItem('hiscore') || score;

canvas.width = GAME_WIDTH * BLOCK_SIZE;
canvas.height = GAME_HEIGHT * BLOCK_SIZE;
nextShapeCanvas.width = 5 * (BLOCK_SIZE-6);
nextShapeCanvas.height = 5 * (BLOCK_SIZE-6);
storeCanvas.width = 5 * (BLOCK_SIZE-6);
storeCanvas.height = 5 * (BLOCK_SIZE-6);

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
nextShapeCtx.fillStyle = 'black';
nextShapeCtx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
storeCtx.fillStyle = 'black';
storeCtx.fillRect(0, 0, storeCtx.width, storeCtx.height);

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
nextShapeCtx.scale(BLOCK_SIZE-6, BLOCK_SIZE-6);
storeCtx.scale(BLOCK_SIZE-6, BLOCK_SIZE-6);

let rowIndex = 0;
let colIndex = GAME_WIDTH / 2 - 2;

const game = Array.from({length: GAME_HEIGHT}, () => Array(GAME_WIDTH).fill(0));

let lastTime = 0;
let nextShape;
let currentShape;
let storedShape;

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
  drawMiniShape(nextShapeCtx, nextShapeCanvas, nextShape);
  drawMiniShape(storeCtx, storeCanvas, storedShape);
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
  }else if (code === 'ArrowUp') {
    const tempCurrent = currentShape;
    if(storedShape) {
      currentShape = storedShape;
    } else {
      getNextShape();
    }
    storedShape = tempCurrent;
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


