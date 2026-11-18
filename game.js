const canvas = document.getElementById('tetrisBoard');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const COLORS = [
    null,
    '#f4aeb9', // I - 櫻色
    '#8a9a5b', // J - 抹茶
    '#255a7e', // L - 藍染
    '#d4af37', // O - 金箔
    '#a13d2d', // S - 鳥居紅
    '#7b6c53', // T - 枯木
    '#5c4033'  // Z - 栗色
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function drawBlock(x, y, colorIndex) {
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
    ctx.fillStyle = '#0f0f0f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] !== 0) {
                drawBlock(c, r, board[r][c]);
            }
        }
    }
}

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; 

function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        // 之後會在這裡加上方塊掉落的邏輯
        dropCounter = 0;
    }

    drawBoard();
    requestAnimationFrame(gameLoop);
}

gameLoop();