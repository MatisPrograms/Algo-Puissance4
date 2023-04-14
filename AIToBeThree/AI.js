/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
const Position = require('./Position');
const MoveSorter = require('./MoveSorter');
const TranspositionTable = require('./TranspositionTable');
const StandardGrid = require('./StandardGrid');
const {
  bestSecondPlayerMoves
} = require('./StartingMoves');

class AI {

  #columnOrder = ['3', '2', '4', '1', '5', '0', '6'];

  #transTable;
  constructor() {
    this.AIPlays = 2;
    this.enemyNumber = 1;
    this.position = new Position();
    this.standardGrid = new StandardGrid();
    this.playedMoves = '';
    this.isResolved = false;
    this.#transTable = new TranspositionTable(10000);
  }

  //The hydrate method is used to initialize the game state given a string of moves played so far.
  hydrate = (totalMoves, full = false) => {
    const moves = full
      ? totalMoves
      : totalMoves.substr(0, totalMoves.length - 1);
    const lastMove = totalMoves[totalMoves.length - 1];
    this.playedMoves = '';
    this.isResolved = false;
    this.position = new Position();
    this.position.playSeries(moves, 1);
    this.standardGrid = new StandardGrid();
    for (let i = 0; i < moves.length; i++) {
      const x = +moves[i] - 1;
      const y = this.standardGrid.findFirstEmpty(x);
      this.standardGrid.add({
        x,
        y,
        playerNumber: i % 2 === 0 ? 1 : 2,
      });
      this.playedMoves += x;

      this.AIPlays = i % 2 === 0 ? 2 : 1;
    }
    if (full) return undefined;
    this.enemyNumber = this.AIPlays === 1 ? 2 : 1;
    const nextCol = +lastMove - 1;
    const nextRow = this.standardGrid.findFirstEmpty(nextCol);
    return [nextCol, nextRow];
  };

  //The addEnemyMove method is used to add the opponent's move to the game state
  addEnemyMove = (moveArray) => {
    const move = { x: moveArray[0], y: moveArray[1] };
    const isValid = this.standardGrid.isValid(move);
    if (!isValid) throw new Error(`Enemy move is invalid ${move}`);
    this.standardGrid.add({ ...move, playerNumber: this.enemyNumber });
    this.position.playCol(move.x);
    this.playedMoves += move.x;
  };

  //The addAIMove method is used to add the AI's move to the game state
  addAIMove = (col) => {
    const row = this.standardGrid.findFirstEmpty(col);
    this.standardGrid.add({ x: col, y: row, playerNumber: this.AIPlays });
    this.position.playCol(col);
    this.playedMoves += col;
    return row;
  };

  // The computeMove method is used to compute the AI's next move.
  // If the number of moves played so far is less than 7, the earlyGame method is called.
  // If it's between 7 and 25 and the game has not been resolved, the midGame method is called.
  // If it's between 26 and 28 and the game has not been resolved, the endMidGame method is called.
  // Otherwise, the endGame method is called.
  computeMove = () => {

    if (this.position.nbMoves < 7) {
      return this.earlyGame();
    }
    if (this.position.nbMoves < 26 && !this.isResolved) {
      return this.midGame();
    }
    if (this.position.nbMoves < 29 && !this.isResolved) {
      return this.endMidGame();
    }
    return this.endGame();
  };


  // The nextMove method is called after each move made by the opponent
  // to update the game state and compute the AI's next move.
  nextMove = (lastMove) => {
    if (this.AIPlays === 2 || this.position.nbMoves > 0) {
      this.addEnemyMove(lastMove);
    }
    return this.computeMove();
  };

  earlyGame = () => {
    if (this.playedMoves === '') {
      const row = this.addAIMove(3);
      return [3, row];
    }

    const bestMoves =  bestSecondPlayerMoves;

    const bestMove = bestMoves.find((move) => {
      const previousMoves = move[0];
      return previousMoves === this.playedMoves;
    });

    if (bestMove) {
      const bestColMove = parseInt(bestMove[1], 10);
      const row = this.addAIMove(bestColMove);
      return [bestColMove, row];
    }

    const stringifiedBitmap = JSON.stringify(this.position.bitmap());

    const bestMoveSymetric = bestMoves.find((move) => {
      const previousMoves = move[0];
      const pos = new Position();
      pos.playSeries(previousMoves);
      const symetricMove = JSON.stringify(pos.getSymmetric());
      return symetricMove === stringifiedBitmap;

    });

    if (bestMoveSymetric) {
      const bestColMoveSymetric = parseInt(bestMoveSymetric[1], 10);
      const invertedMove = this.position.WIDTH - 1 - parseInt(bestColMoveSymetric, 10);
      const row = this.addAIMove(invertedMove);

      return [invertedMove, row];
    }

    const row = this.addAIMove(3);
    return [3, row];
  };

  midGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity, 3, Infinity),
      10,
    );
    const row = this.addAIMove(col);
    return [col, row];
  };

  endMidGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity, 7),
      10,
    );
    const row = this.addAIMove(col);
    return [col, row];
  };

  endGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity),
      10,
    );
    const row = this.addAIMove(col);
    return [col, row];
  };

  // The bestColumn method is the heart of the minimax algorithm.
  // It takes a position argument, which represents the current game state,
  // as well as alpha, beta, depth, and maxDepth arguments, which are used in the alpha-beta pruning.
  // It returns the index of the column that leads to the best move according to the minimax algorithm.
  bestColumn = (
    pos,
    alpha = -1,
    beta = -1,
    depth = Infinity,
    clamp = Infinity,
  ) => {
    const next = pos.possibleNonLosingMoves();
    const moves = new MoveSorter(pos.WIDTH);
    for (let i = 0; i < pos.WIDTH; i++) {
      const move = next & pos.columnMask(this.#columnOrder[i]);
      if (pos.isWinningMove(this.#columnOrder[i])) return this.#columnOrder[i];
      if (move) {
        moves.add(move, pos.moveScore(move), this.#columnOrder[i]);
      }
    }
    moves.clamp(clamp);
    const bestMoves = new MoveSorter(pos.WIDTH);
    let nextMove = moves.getNext();
    while (nextMove) {
      const pos2 = pos.clone();
      pos2.play(nextMove.move);
      const score = -this.minmax(pos2, -beta, -alpha, depth, clamp);
      bestMoves.add(nextMove.move, score, nextMove.col);
      nextMove = moves.getNext();
    }
    const bestMove = bestMoves.getNext().col;
    if (bestMove) return bestMove;

    const possible = pos.possible();
    const possibleMoves = new MoveSorter(pos.WIDTH);
    for (let i = 0; i < pos.WIDTH; i++) {
      const move = possible & pos.columnMask(this.#columnOrder[i]);
      if (move) {
        possibleMoves.add(move, pos.moveScore(move), this.#columnOrder[i]);
      }
    }
    return possibleMoves.getNext().col;
  };

  minmax = (pos, alphaInit, betaInit, depth = Infinity, clamp = Infinity) => {
    let alpha = alphaInit;
    let beta = betaInit;
    if (alpha >= beta) return alpha;
    if (depth === 0) return Number(pos.score());
    const next = pos.possibleNonLosingMoves();
    if (next === 0n) return -(pos.WIDTH * pos.HEIGHT - pos.nbMoves) / 2;
    if (pos.nbMoves >= pos.WIDTH * pos.HEIGHT - 2) return 0;
    const min = -(pos.WIDTH * pos.HEIGHT - 2 - pos.nbMoves) / 2;
    if (alpha < min) {
      alpha = min;
      if (alpha >= beta) return alpha;
    }
    const MIN_SCORE = -(pos.WIDTH * pos.HEIGHT) / 2 + 3;
    let max = (pos.WIDTH * pos.HEIGHT - 1 - pos.nbMoves) / 2;
    const val = this.#transTable.get(pos.key());
    if (val) max = val + MIN_SCORE - 1;
    if (beta > max) {
      beta = max;
      if (alpha >= beta) return beta;
    }
    const moves = new MoveSorter(pos.WIDTH);
    for (let i = 0; i < pos.WIDTH; i++) {
      const move = next & pos.columnMask(this.#columnOrder[i]);
      if (move) {
        moves.add(move, pos.moveScore(move), this.#columnOrder[i]);
      }
    }
    moves.clamp(clamp);
    let nextMove = moves.getNext();
    while (nextMove) {
      const pos2 = pos.clone();
      pos2.play(nextMove.move);
      const score = -this.minmax(pos2, -beta, -alpha, depth - 1);
      if (score >= beta) return score;
      if (score > alpha) {
        alpha = score;
      }
      nextMove = moves.getNext();
    }
    this.#transTable.put(pos.key(), alpha - MIN_SCORE + 1);
    return alpha;
  };
}

let ai;
const nextMove = (lastMove) => new Promise((resolve) => {
  resolve(ai.nextMove(lastMove));
});

const hydrate = (state) => ai.hydrate(state);

module.exports = AI;
function printBoard(board) {
  console.table(board[0].map((col, i) => board.map(row => row[i])).reverse());
}
/*
module.exports = {
  nextMove,
  hydrate,
  AI,
};*/
