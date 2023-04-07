// const { Worker } = require('worker_threads');

const app = require('express')();
const {checkDraw, checkWinner} = require('./boardUtils');

const maxSeconds = 2;

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
        column: monteCarlo.calculateNextMove(board)
    });
    //
    // // Create a new worker thread to calculate the next move
    // const worker = new Worker('./monteCarlo.js', { workerData: board });
    //
    // // Listen for the worker to finish calculating the move
    // worker.on('message', move => {
    //     res.status(200).send({
    //         column: move
    //     });
    // });
    //
    // // Listen for errors from the worker
    // worker.on('error', err => {
    //     console.error(err);
    //     res.status(500).json({ error: 'Internal server error' });
    // });
    //
    // // Terminate the worker when it is done
    // worker.on('exit', code => {
    //     if (code !== 0) {
    //         console.error(`Worker stopped with exit code ${code}`);
    //     }
    // });
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