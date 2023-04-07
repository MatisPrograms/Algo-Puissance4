/* eslint-disable max-classes-per-file */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
class Position {
  #WIDTH = 7;

  #HEIGHT = 6;

  #currentPosition;

  #mask;

  #moves;

  #playedMoves;

  constructor(width, height) {
    if (width) this.#WIDTH = width;
    if (height) this.#HEIGHT = height;
    this.#currentPosition = BigInt(0);
    this.#mask = BigInt(0);
    this.#moves = 0;
    this.#playedMoves = '';
  }

  get WIDTH() {
    return this.#WIDTH;
  }

  get HEIGHT() {
    return this.#HEIGHT;
  }

  get playedMoves() {
    return this.#playedMoves;
  }

  get nbMoves() {
    return this.#moves;
  }

  playSeries = (series, startIndex = 0) => {
    const moves = series.replace(/\s/g, '').split('');
    moves.forEach((move) => {
      const col = parseInt(move, 10) - parseInt(startIndex, 10);
      if (this.canPlay(col)) {
        this.playCol(col);
      } else {
        throw new Error(`Invalid move ${move}`);
      }
    });
  };

  bitmap = (toPrint) => {
    let toPrintData = toPrint === 'mask' ? this.#mask : this.key();
    toPrintData = toPrint === 'position' ? this.#currentPosition : toPrintData;

    const paddedKey = toPrintData
      .toString(2)
      .padStart(this.#WIDTH * (this.#HEIGHT + 1), '0');
    const position = paddedKey.match(/.{1,7}/g) ?? [];
    const matrix = position.map((row) => row.split(''));
    return matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
  };

  hydrate = (position, mask, moves) => {
    this.#currentPosition = position;
    this.#mask = mask;
    this.#moves = moves;
    return this;
  };

  clone = () => new Position(this.#WIDTH, this.#HEIGHT).hydrate(
    BigInt(this.#currentPosition.toString()),
    BigInt(this.#mask.toString()),
    this.#moves,
  );

  getData = () => ({
    position: this.#currentPosition,
    mask: this.#mask,
    moves: this.#moves,
  });

  canPlay = (col) => {
    if (col < 0 || col >= this.#WIDTH) return false;
    return (this.#mask & this.topMaskCol(col)) === BigInt(0);
  };

  isWinningMove(col) {
    return (
      (this.winningPosition() & this.possible() & this.columnMask(col)) !== 0n
    );
  }

  canWinNext = () => (this.winningPosition() & this.possible()) !== 0n;

  topMaskCol = (col) => (
    (BigInt(1) << BigInt(this.#HEIGHT - 1))
      << BigInt(col * (this.#HEIGHT + 1))
  );

  play = (move) => {
    this.#currentPosition ^= this.#mask;
    this.#mask |= move;
    this.#moves++;
  };

  playCol = (col) => {
    this.play((this.#mask + this.bottomMaskCol(col)) & this.columnMask(col));
    this.#playedMoves += col;
  };

  bottomMaskCol = (col) => BigInt(1) << BigInt(col * (this.#HEIGHT + 1));

  fullBottomMask = () => {
    let bottomMask = BigInt(0);
    for (let i = 0; i < this.#WIDTH; i++) {
      bottomMask |= this.bottomMaskCol(i);
    }
    return bottomMask;
  };

  columnMask = (col) => (
    ((1n << BigInt(this.#HEIGHT)) - 1n) << BigInt(col * (this.#HEIGHT + 1))
  );

  key = () => this.#currentPosition + this.#mask + this.fullBottomMask();

  popcount = (n) => {
    let c = 0n;
    let m = n;

    while (m) {
      c++;
      m &= m - 1n;
    }
    return c;
  };

  moveScore = (move) => {
    const score = this.popcount(
      this.computeWinningPosition(this.#currentPosition | move, this.#mask),
    );
    return score;
  };

  score = () => this.moveScore(this.#mask);

  toString = () => this.key();

  bottom = (width, height) => {
    if (width === 0) return 0;
    return (
      BigInt(this.bottom(width - 1, height))
      | (1n << BigInt((width - 1) * (height + 1)))
    );
  };

  bottomMask = () => this.bottom(this.#WIDTH, this.#HEIGHT);

  boardMask = () => this.bottomMask() * ((1n << BigInt(this.#HEIGHT)) - 1n);

  opponentWinningPosition = () => this.computeWinningPosition(
    this.#currentPosition ^ this.#mask,
    this.#mask,
  );

  winningPosition = () => this.computeWinningPosition(this.#currentPosition, this.#mask);

  possible = () => (this.#mask + this.bottomMask()) & this.boardMask();

  computeWinningPosition = (pos, mask) => {
    let r = (pos << 1n) & (pos << 2n) & (pos << 3n);

    let p = (pos << BigInt(this.#HEIGHT + 1))
      & (pos << BigInt(2 * (this.#HEIGHT + 1)));
    r |= p & (pos << BigInt(3 * (this.#HEIGHT + 1)));
    r |= p & (pos >> BigInt(this.#HEIGHT + 1));

    p = (pos >> BigInt(this.#HEIGHT + 1))
      & (pos >> (2n * BigInt(this.#HEIGHT + 1)));
    r |= p & (pos << BigInt(this.#HEIGHT + 1));
    r |= p & (pos >> BigInt(3 * (this.#HEIGHT + 1)));

    p = (pos << BigInt(this.#HEIGHT)) & (pos << BigInt(2 * this.#HEIGHT));
    r |= p & (pos << BigInt(3 * this.#HEIGHT));
    r |= p & (pos >> BigInt(this.#HEIGHT));
    p = (pos >> BigInt(this.#HEIGHT)) & (pos >> (2n * BigInt(this.#HEIGHT)));
    r |= p & (pos << BigInt(this.#HEIGHT));
    r |= p & (pos >> BigInt(3 * this.#HEIGHT));

    p = (pos << BigInt(this.#HEIGHT + 2))
      & (pos << BigInt(2 * (this.#HEIGHT + 2)));
    r |= p & (pos << BigInt(3 * (this.#HEIGHT + 2)));
    r |= p & (pos >> BigInt(this.#HEIGHT + 2));
    p = (pos >> BigInt(this.#HEIGHT + 2))
      & (pos >> (2n * BigInt(this.#HEIGHT + 2)));
    r |= p & (pos << BigInt(this.#HEIGHT + 2));
    r |= p & (pos >> BigInt(3 * (this.#HEIGHT + 2)));

    return r & (this.boardMask() ^ mask);
  };

  possibleNonLosingMoves = () => {
    let possibleMask = this.possible();
    const opponentWinPosition = this.opponentWinningPosition();
    const forcedMoves = possibleMask & opponentWinPosition;
    if (forcedMoves) {
      if (forcedMoves & (forcedMoves - 1n)) {
        return 0n;
      }
      possibleMask = forcedMoves;
    }
    return possibleMask & ~(opponentWinPosition >> 1n);
  };

  getSymmetric = () => {
    const bitmap = this.bitmap();
    const symmetric = [];
    for (let y = 0; y < bitmap.length; y++) {
      for (let x = 0; x < bitmap[0].length; x++) {
        const symX = bitmap[0].length - 1 - x;
        symmetric[y] = symmetric[y] || [];
        symmetric[y][symX] = bitmap[y][x];
      }
    }
    return symmetric;
  };
}

class MoveSorter {
  constructor(width) {
    this.max = Infinity;
    this.size = 0;
    this.entries = new Array(width);
    for (let i = 0; i < width; i++) {
      this.entries[i] = { move: 0n, score: 0n };
    }
  }

  add(move, score, col) {
    let pos = this.size++;
    const entry = { move, score, col };
    while (pos && this.entries[pos - 1].score > score) {
      pos--;
    }
    this.entries.splice(pos, 0, entry);
  }

  clamp(max) {
    this.max = max;
  }

  getNext() {
    if (this.size && this.max > 0) {
      this.size--;
      this.max--;
      return this.entries[this.size];
    }
    return 0n;
  }

  reset() {
    this.size = 0;
  }
}

class TranspositionTable {
  #cache;

  constructor(size) {
    this.#cache = new Array(size);
    for (let i = 0; i < size; i++) {
      this.#cache[i] = { key: 0, val: 0 };
    }
  }

  reset() {
    for (let i = 0; i < this.#cache.length; i++) {
      this.#cache[i].key = 0;
      this.#cache[i].val = 0;
    }
  }

  index(key) {
    return key % BigInt(this.#cache.length);
  }

  put(key, val) {
    const i = this.index(key);
    this.#cache[i].key = key;
    this.#cache[i].val = val;
  }

  get(key) {
    const i = this.index(key);
    if (this.#cache[i].key === key) {
      return this.#cache[i].val;
    }
    return 0;
  }
}

class StandardGrid {
  #height;

  #width;

  #matrix;

  constructor() {
    this.#height = 6;
    this.#width = 7;
    this.#matrix = Array.from(Array(this.#width), () => Array(this.#height).fill(0));
  }

  hydrate(game) {
    this.#matrix = game.matrix;
  }

  add({ x, y, playerNumber }) {
    this.#matrix[x][y] = playerNumber;
  }

  findFirstEmpty(x) {
    for (let y = 0; y < this.#height; y += 1) {
      if (typeof this.#matrix[x][y] === 'undefined' || this.#matrix[x][y] === 0) {
        return y;
      }
    }
    return -1;
  }

  isAvailable({ x, y }) {
    if (this.#matrix[x][y] === 0) return true;
    return false;
  }

  isValid({ x, y }) {
    if (!this.isAvailable({ x, y })) return false;
    return y === this.findFirstEmpty(x);
  }
}

class AI {
  #columnOrder = ['3', '2', '4', '1', '5', '0', '6'];

  #transTable;

  constructor(AIPlays) {
    if (AIPlays !== 1 && AIPlays !== 2) {
      throw new Error('AI play must be either 1 or 2');
    }
    this.AIPlays = AIPlays;
    this.enemyNumber = AIPlays === 1 ? 2 : 1;
    this.playerTurn = 1;
    this.position = new Position();
    this.standardGrid = new StandardGrid();
    this.playedMoves = '';
    this.isResolved = false;
    this.#transTable = new TranspositionTable(10000);
  }

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

  addEnemyMove = (moveArray) => {
    const move = { x: moveArray[0], y: moveArray[1] };
    const isValid = this.standardGrid.isValid(move);
    if (!isValid) throw new Error(`Enemy move is invalid ${move}`);
    this.standardGrid.add({ ...move, playerNumber: this.enemyNumber });
    this.position.playCol(move.x);
    this.playedMoves += move.x;
  };

  addAIMove = (col) => {
    const row = this.standardGrid.findFirstEmpty(col);
    this.standardGrid.add({ x: col, y: row, playerNumber: this.AIPlays });
    this.position.playCol(col);
    this.playedMoves += col;
    return row;
  };

  computeMove = () => {
    if (this.playedMoves === '') {
      // return this.earlyGame();
      const row = this.addAIMove(3);
      return [3, row];
    }
    if (this.position.nbMoves < 26 && !this.isResolved) {
      return this.midGame();
    }
    if (this.position.nbMoves < 29 && !this.isResolved) {
      return this.endMidGame();
    }
    return this.endGame();
  };

  nextMove = (lastMove) => {
    if (this.AIPlays === 2 || this.position.nbMoves > 0) {
      this.addEnemyMove(lastMove);
    }
    return this.computeMove();
  };

  // earlyGame = () => {
  //   if (this.playedMoves === '') {
  //     const row = this.addAIMove(3);
  //     return [3, row];
  //   }

  //   const startingPlayerMoves = [['31', '1'], ['32', '5']];
  //   const secondPlayerMoves = [['1', '2'], ['030', '3'], ['036', '2'],
  // ['121', '1'], ['122', '2'], ['125', '2'], ['126', '2'], ['333', '3']];
  //   const bestMoves = this.AIPlays === 1 ? startingPlayerMoves : secondPlayerMoves;

  //   const bestMove = bestMoves.find((move) => {
  //     const previousMoves = move[0];
  //     if (previousMoves === this.playedMoves) return true;
  //     return false;
  //   });

  //   if (bestMove) {
  //     const bestColMove = parseInt(bestMove[1], 10);
  //     const row = this.addAIMove(bestColMove);
  //     return [bestColMove, row];
  //   }

  //   const stringifiedBitmap = JSON.stringify(this.position.bitmap());

  //   const bestMoveSymetric = bestMoves.find((move) => {
  //     const previousMoves = move[0];
  //     const pos = new Position();
  //     pos.playSeries(previousMoves);
  //     const symetricMove = JSON.stringify(pos.getSymmetric());
  //     if (symetricMove === stringifiedBitmap) return true;
  //     return false;
  //   });

  //   if (bestMoveSymetric) {
  //     const bestColMoveSymetric = parseInt(bestMoveSymetric[1], 10);
  //     const invertedMove = this.position.WIDTH - 1 - parseInt(bestColMoveSymetric, 10);
  //     const row = this.addAIMove(invertedMove);
  //     return [invertedMove, row];
  //   }

  //   if (this.AIPlays === 1) {
  //     const row = this.addAIMove(3);
  //     return [3, row];
  //   }
  //   return this.midGame();
  // };

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
const setup = (AIplays) => {
  ai = new AI(AIplays);
  return true;
};

const nextMove = (lastMove) => new Promise((resolve) => {
  resolve(ai.nextMove(lastMove));
});

const hydrate = (state) => ai.hydrate(state);

module.exports = {
  setup,
  nextMove,
  hydrate,
  AI,
};
