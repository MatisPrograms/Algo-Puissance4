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

module.exports = MoveSorter;
