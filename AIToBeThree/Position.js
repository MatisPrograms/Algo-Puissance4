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
    const rotated = matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());
    return rotated;
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

module.exports = Position;
