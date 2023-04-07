function checkDraw(board) {
    for (let i = 0; i < 7; i++) {
        if (board[i][5] === '0') return false;
    }
    return true;
}

function checkWinner(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const winner = checkWinnerFromCell(board, i, j);
            if (winner.player !== '0' && winner.cells.length > 0) return true
        }
    }
    return false;
}

function checkWinnerFromCell(board, row, col) {
    let winner = {
        player: '0',
        cells: [],
    };
    let directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let count = 0;
    let currPlayer = board[row][col];

    for (let i = 0; i < directions.length; i++) {
        count = 1;
        let r = row + directions[i][0];
        let c = col + directions[i][1];
        let cells = [[row, col]];

        while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === currPlayer) {
            count++;
            cells.push([r, c]);
            r += directions[i][0];
            c += directions[i][1];
        }

        r = row - directions[i][0];
        c = col - directions[i][1];
        while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === currPlayer) {
            count++;
            cells.push([r, c]);
            r -= directions[i][0];
            c -= directions[i][1];
        }
        if (count >= 4) {
            winner.player = currPlayer;
            winner.cells = cells;
            return winner;
        }
    }
    return winner;
}

function countStreakFromCell(board, row, col, streak) {
    let directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let count = 0;
    let currPlayer = board[row][col];

    for (let i = 0; i < directions.length; i++) {
        count = 1;
        let r = row + directions[i][0];
        let c = col + directions[i][1];

        while (count < 5 && r >= 0 && r < board.length && c >= 0 && c < board[0].length && (board[r][c] === currPlayer || board[r][c] === '')) {
            if (board[r][c] !== '0') count++;
            r += directions[i][0];
            c += directions[i][1];
        }

        r = row - directions[i][0];
        c = col - directions[i][1];
        while (count < 5 && r >= 0 && r < board.length && c >= 0 && c < board[0].length && (board[r][c] === currPlayer || board[r][c] === '')) {
            if (board[r][c] !== '0') count++;
            r -= directions[i][0];
            c -= directions[i][1];
        }
        if (count >= streak) return true;
    }
    return false;
}

function neighbors(board) {
    const neighbors = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === '0') {
                neighbors.push({x: i, y: j});
                break;
            }
        }
    }
    return neighbors;
}

function printBoard(board) {
    console.table(board[0].map((col, i) => board.map(row => row[i])).reverse());
}

module.exports = {checkDraw, checkWinner, checkWinnerFromCell, countStreakFromCell, neighbors, printBoard};