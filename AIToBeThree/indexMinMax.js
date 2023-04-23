const app = require('express')();
const {checkDraw, checkWinner, printBoard} = require('../boardUtils');

const minmax = new (require('./AI'));

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

app.listen(3001, () => {
    console.log('Server started on port 3001');
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/move', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (!parseUrlBoard(board, req.query.b)) res.status(400).json({error: 'Invalid board'});

    console.log("AIToBeThree what you give :")
    printBoard(board)
    console.log("AIToBeThree what I do :")

    res.status(200).send({
        column: minmax.computeMove(board),
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

    return !(checkDraw(board) || checkWinner(board));

}