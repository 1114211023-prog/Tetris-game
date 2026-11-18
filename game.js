const canvas = document.getElementById('tetrisBoard');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextPiece');
const nextCtx = nextCanvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

// 和風配色
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

// 方塊形狀矩陣
const SHAPES = [
    [],
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
    [[2,0,0], [2,2,2], [0,0,0]], // J
    [[0,0,3], [3,3,3], [0,0,0]], // L
    [[4,4], [4,4]], // O
    [[0,5,5], [5,5,0], [0,0,0]], // S
    [[0,6,0], [6,6,6], [0,0,0]], // T
    [[7,7,0], [0,7,7], [0,0,0]]  // Z
];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let score = 0;
let level = 1;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

let player = { pos: { x: 0, y: 0 }, matrix: null, color: 0 };
let nextPlayer = { matrix: null, color: 0 };

// 繪製單個方塊
function drawBlock(x, y, colorIndex, context = ctx) {
    context.fillStyle = COLORS[colorIndex];
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 繪製矩陣 (用於玩家方塊與 Next 預覽)
function drawMatrix(matrix, offset, context = ctx) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(x + offset.x, y + offset.y, value, context);
            }
        });
    });
}

// 繪製整個畫面
function draw() {
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMatrix(board, { x: 0, y: 0 }); // 畫已固定的方塊
    if (player.matrix) {
        drawMatrix(player.matrix, player.pos); // 畫正在掉落的方塊
    }
}

// 繪製下一個方塊
function drawNextPiece() {
    nextCtx.fillStyle = '#1a1a1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPlayer.matrix) {
        // 將預覽方塊置中
        const offset = {
            x: (nextCanvas.width / BLOCK_SIZE - nextPlayer.matrix[0].length) / 2,
            y: (nextCanvas.height / BLOCK_SIZE - nextPlayer.matrix.length) / 2
        };
        drawMatrix(nextPlayer.matrix, offset, nextCtx);
    }
}

// 碰撞判定
function collide(board, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 將掉落到底的方塊與背景合併
function merge(board, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 產生隨機方塊
function randomPiece() {
    const typeId = Math.floor(Math.random() * 7) + 1;
    return { matrix: SHAPES[typeId], color: typeId };
}

function playerReset() {
    if (!nextPlayer.matrix) {
        nextPlayer = randomPiece();
    }
    player.matrix = nextPlayer.matrix;
    player.color = nextPlayer.color;
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    nextPlayer = randomPiece();
    drawNextPiece();

    // 遊戲結束判定
    if (collide(board, player)) {
        board.forEach(row => row.fill(0));
        score = 0;
        level = 1;
        dropInterval = 1000;
        updateUI();
    }
}

// 旋轉矩陣
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    const matrix = player.matrix;
    
    // 轉置矩陣
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    // 反轉每一列
    matrix.forEach(row => row.reverse());

    // 簡單的靠牆判定 (Wall Kick)
    while (collide(board, player)) {
        player