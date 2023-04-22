const app = require('express')();
const {checkDraw, checkWinner, checkFloatingPieces} = require('./boardUtils');

const maxSeconds = 1;
const monteCarlo = new (require('./monteCarlo'))(maxSeconds);

const lines = 6;
const columns = 7;

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
    res.setHeader('Content-Type', 'application/json');
    if (!parseUrlBoard(board, req.query.b)) res.status(400).json({error: 'Invalid board'});

    res.status(200).send({
        column: monteCarlo.calculateNextMove(JSON.parse(JSON.stringify(board)))
    });
});


function parseUrlBoard(board, string) {
    // Check if board is valid
    if (!board) return false;

    // Check if string length is valid
    if (string.length !== 42) return false;

    string = string.toUpperCase();

    // Check if string only contains M, H or 0
    if (!string.match(/^[MH0]+$/)) return false;

    // convert string to board
    let indexC = -1;
    for (const c of string) {
        indexC++;
        if (c === '0') continue;
        board[Math.floor(indexC / lines)][indexC % lines] = c;
    }

    // Check if board doesn't have floating pieces
    if (checkFloatingPieces(board)) return false;

    return !(checkDraw(board) || checkWinner(board));
}