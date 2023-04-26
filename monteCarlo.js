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

        for (const move of moves) {
            const tmpBoard = JSON.parse(JSON.stringify(board));
            tmpBoard[move.x][move.y] = 'M';
            if (checkWinnerFromCell(tmpBoard, move.x, move.y).player === 'M') return clamp(1, move.x + 1, 7);
        }

        // Loop until the maximum number of seconds has passed
        while (Date.now() < endTime) {
            iterations++;

            // Create a copy of the board and make a random move
            const tmpBoard = JSON.parse(JSON.stringify(board));
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            tmpBoard[randomMove.x][randomMove.y] = 'M';

            const simulationResult = this.simulationGame(tmpBoard, 'H');

            // Run the simulation game
            results.push({
                move: randomMove,
                score: simulationResult.score,
                depth: simulationResult.depth
            })
        }

        // Get the best move from score
        for (const move of moves) {
            const moveResults = results.filter(r => r.move.x === move.x && r.move.y === move.y);

            const occurrences = moveResults.length;
            const wins = moveResults.filter(r => r.score > 0).length;
            const winRate = wins / occurrences;
            const avgDepth = moveResults.reduce((a, b) => a + b.depth, 0) / occurrences;
            const score = winRate / avgDepth;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            data.push({
                Occurrences: `${(occurrences / iterations * 100).toFixed(2)}%`,
                Wins: `${wins}`,
                Losses: `${occurrences - wins}`,
                'Win Rate': `${(winRate * 100).toFixed(2)}%`,
                'Avg Depth': avgDepth.toFixed(2),
                'Score': `${(score * 100).toFixed(2)}%`
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

    simulationGame(board, player, depth = 0) {
        const moves = neighbors(board);
        const randomMove = moves[Math.floor(Math.random() * moves.length)];

        board[randomMove.x][randomMove.y] = player;

        if (checkDraw(board)) return {
            score: 0,
            depth: depth
        }
        const winner = checkWinnerFromCell(board, randomMove.x, randomMove.y);
        if (winner.player !== '0') return {
            score: winner.player === 'M' ? 1 : -1,
            depth: depth
        };

        return this.simulationGame(board, player === 'M' ? 'H' : 'M', depth + 1);
    }
}

function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
}

// Export for use in other modules/files
module.exports = MonteCarlo;