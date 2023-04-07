const app = require('express')();

const maxSeconds = 2;

const monteCarlo = new (require('./monteCarlo'))(maxSeconds);

const lines = 6;
const colums = 7;

const board = [
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0']
];

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/move', (req, res) => {
    parseUrlBoard(board, req.query.b);
    printBoard(board);

    res.send({
        column: monteCarlo.calculateNextMove(board)
    });
});


function parseUrlBoard(board, string) {
    // Check if board is valid
    if (!board) return;

    // Check if string length is valid
    if (string.length !== 42) return;

    string = string.toUpperCase();

    // Check if string only contains M, H or 0
    if (!string.match(/^[MH0]+$/)) return;

    // convert string to board
    let indexC = -1;
    for (const c of string) {
        indexC++;
        if (c === '0') continue;
        board[Math.floor(indexC / lines)][indexC % lines] = c;
    }
}

function printBoard(board) {
    console.table(board[0].map((col, i) => board.map(row => row[i])).reverse());
}

fetch('http://localhost:3000/move?b=m00000h00000mm0000hmh000h00000h00000000000').then(res => res.json()).then(console.log);
