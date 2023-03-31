const app = require('express')();

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

    // Split string into array of 6 arrays of 7 characters and store it in board
    for (let i = 0; i < lines; i++) {
        board[i] = string.substr(i * colums, colums).split('');
    }
}