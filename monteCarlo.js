// const {parentPort} = require('worker_threads');
const {checkDraw, checkWinnerFromCell, neighbors, printBoard} = require('./boardUtils');

// Define the MonteCarlo class
class MonteCarlo {

    static transpositionTable = new Map();

    /**
     * Set the maximum number of seconds the algorithm can run
     *
     * @param maxSeconds The maximum number of seconds the algorithm can run per move
     */
    constructor(maxSeconds) {
        this.maxSeconds = maxSeconds;
    }

    /**
     * Calculate the next move based on a Monte Carlo algorithm from the given board.
     * The algorithm will run for a maximum of maxSeconds, and will return the column
     * of the best move.
     *
     * @param board The current board state as a 2D array using the following format:
     * [
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0'],
     *     ['0', '0', '0', '0', '0', '0']
     * ]
     * With '0' being an empty space, 'M' being a space occupied by the Machine and 'H'
     * being a space occupied by the Human.
     * @returns {number} The column of the best move (1-7)
     */
    calculateNextMove(board) {
        // Print board before move
        printBoard(board);

        const endTime = Date.now() + this.maxSeconds * 1000;
        let iterations = 0;

        let bestMove;
        let bestScore = -Infinity;
        const results = [];

        // Loop until the maximum number of seconds has passed
        while (Date.now() < endTime) {

            // Run the simulation game
            results.push(this.simulationGame(JSON.parse(JSON.stringify(board))))
            iterations++;
        }

        // Get the best move from score
        for (const result of results) {
            if (result.score > bestScore) {
                bestMove = result.move;
                bestScore = result.score;
            }
        }

        board[bestMove.x][bestMove.y] = 'M';

        // Print board after move
        printBoard(board);

        console.log(`Iterations: ${iterations} - Best move: ${bestMove.x} - Best score: ${bestScore}`)
        return clamp(1, bestMove.x, 7)
    }

    simulationGame(board, player = 'M', turn = 0) {
        let score;
        const moves = neighbors(board);
        const randomMove = moves[Math.floor(Math.random() * moves.length)];

        board[randomMove.x][randomMove.y] = player;

        if (checkDraw(board)) score = 0;

        const winner = checkWinnerFromCell(board, randomMove.x, randomMove.y);
        if (winner.player !== '0') score = (22 - turn) * (winner.player === 'M' ? 1 : -1)

        if (score === undefined) score = this.simulationGame(board, player === 'M' ? 'H' : 'M', turn + 1).score;

        const key = JSON.stringify(board);
        if (!MonteCarlo.transpositionTable.has(key)) MonteCarlo.transpositionTable.set(key, {
            score: score, move: randomMove
        })

        return MonteCarlo.transpositionTable.get(key);
    }
}

function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
}

// Export for use in other modules/files
module.exports = MonteCarlo;