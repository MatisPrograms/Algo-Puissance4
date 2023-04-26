const app = require('express')();
const {checkDraw, checkWinner, checkFloatingPieces, printBoard} = require('./boardUtils');
const port = 3002;

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

app.listen(port, () => {
    console.log('Server started on port', port);
    console.log("Use http://localhost:" + port + "/move?b=" + "0".repeat(42) + " to start from an empty board");
});

app.get('/', (req, res) => {
    res.send({
        Status: 'Server is running'
    });
});

app.get('/move', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    urlBoard = parseUrlBoard(board, req.query.b)
    if (!urlBoard.valid) {
        if (urlBoard.error === "Game Over")
            return res.status(422).json({detail: 'Invalid board : ' + urlBoard.error});
        else {
            return res.status(400).json({detail: 'Invalid board : ' + urlBoard.error});
        }
    }

    return res.status(200).send({
        column: monteCarlo.calculateNextMove(JSON.parse(JSON.stringify(board)))
    });
});


function parseUrlBoard(board, string) {
    // Check if board is valid
    if (!board) return {valid: false, error: "no board given"};

    // Check if string length is valid
    if (string.length !== 42) return {valid: false, error: "The board doesn't have the right size"};

    string = string.toUpperCase();

    // Check if string only contains M, H or 0
    if (!string.match(/^[MH0]+$/)) return {valid: false, error: "The board contain values other than M / H / 0"};

    // convert string to board
    let indexC = -1;
    for (const c of string) {
        indexC++;
        if (c === '0') continue;
        board[Math.floor(indexC / lines)][indexC % lines] = c;
    }

    // Check if board doesn't have floating pieces
    if (checkFloatingPieces(board)) return {valid: false, error: "Some pieces are floating, Please don't cheat"};

    return {valid: !(checkDraw(board) || checkWinner(board)), error: "Game Over"};
}