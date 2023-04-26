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

module.exports = TranspositionTable;
