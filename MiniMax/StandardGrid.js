const {printBoard} = require("../boardUtils");

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

  add({ x, y }) {
    this.#matrix[x][y] = "M";
    printBoard(this.#matrix);
  }

  findFirstEmpty(x) {
    for (let y = 0; y < this.#height; y += 1) {
      if (typeof this.#matrix[x][y] === 'undefined' || this.#matrix[x][y] === '0') {
        return y;
      }
    }
    return -1;
  }

  fillBoard(board){
    let count = 0;
    this.#matrix = board;
    for (let i =0; i < this.#width; i++){
      for (let j = 0; j < this.#height; j ++){
        if (this.#matrix[i][j] !== '0')
          count +=1;
      }
    }
    return count;
  }
}

module.exports = StandardGrid;
