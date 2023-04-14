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

module.exports = StandardGrid;