const app = require('express')();

const maxSeconds = 2;

const monteCarlo = require('./monteCarlo')(maxSeconds);

const lines = 6;
const colums = 7;
const board = [
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0'],
    ['0', '0', '0', '0', '0', '0', '0']
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
        column: 4
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


    // m00000h00000mm0000hmh000h00000h00000000000 to
    // 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0
    // 0 0 0 0 0 0 0
    // 0 0 0 H 0 0 0
    // 0 0 M M 0 0 0
    // M H M H H H 0

    // convert string to board
    let indexC = -1;
    for (const c of string) {
        indexC++;
        if (c === '0') continue;
        console.log(Math.floor(indexC / colums), indexC % colums);
        board[Math.floor(indexC / colums)][indexC % colums] = c;
    }
}

function printBoard(board) {
    // 0 0 is bottom left and 5 6 is top right
    for (let i = lines - 1; i >= 0; i--) {
        console.log(board[i].join(' '));
    }
}