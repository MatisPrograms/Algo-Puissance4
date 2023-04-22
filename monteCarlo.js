const {checkDraw, checkWinnerFromCell, neighbors, printBoard} = require('./boardUtils');

// Define the MonteCarlo class
class MonteCarlo {

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

        const startTime = Date.now();
        const endTime = startTime + this.maxSeconds * 1000;
        let iterations = 0;

        let bestMove;
        let bestScore = -Infinity;

        const moves = neighbors(board);
        const results = [];
        const data = [];

        // Loop until the maximum number of seconds has passed
        while (Date.now() < endTime) {
            iterations++;

            // Create a copy of the board and make a random move
            const tmpBoard = JSON.parse(JSON.stringify(board));
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            tmpBoard[randomMove.x][randomMove.y] = 'M';

            // Run the simulation game
            results.push({
                move: randomMove,
                score: this.simulationGame(tmpBoard, 'H')
            })
        }

        // Get the best move from score
        for (const move of moves) {
            const moveResults = results.filter(r => r.move.x === move.x && r.move.y === move.y);

            const occurrences = moveResults.length;
            const wins = moveResults.filter(r => r.score > 0).length;
            const score = wins / occurrences;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            data.push({
                Occurrences: `${(occurrences / iterations * 100).toFixed(2)}%`,
                Wins: wins,
                Losses: occurrences - wins,
                'Win Rate': `${(wins / occurrences * 100).toFixed(2)}%`
            });
        }

        board[bestMove.x][bestMove.y] = 'M';

        // Print board after move
        printBoard(board);
        console.table(data);

        bestMove.x++;
        bestMove.y++;

        console.log(`Iterations: ${iterations} in ${((Date.now() - startTime) / 1e3).toFixed(2)}s | Best move: ${bestMove.x} - Best score: ${(bestScore * 100).toFixed(2)}%`)
        return clamp(1, bestMove.x, 7)
    }

    simulationGame(board, player) {
        const moves = neighbors(board);
        const randomMove = moves[Math.floor(Math.random() * moves.length)];

        board[randomMove.x][randomMove.y] = player;

        if (checkDraw(board)) return 0;
        const winner = checkWinnerFromCell(board, randomMove.x, randomMove.y);
        if (winner.player !== '0') return winner.player === 'M' ? 1 : -1;

        return this.simulationGame(board, player === 'M' ? 'H' : 'M');
    }
}

function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
}

// Export for use in other modules/files
module.exports = MonteCarlo;