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
    this.position = new Position();
    this.standardGrid = new StandardGrid();
    this.playedMoves = '';
    this.isResolved = false;
    this.#transTable = new TranspositionTable(10000);
  }

  // La méthode hydrate est utilisée pour initialiser l'état du jeu
  // en fonction de la chaîne de caractères passée en paramètre.
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
    const nextCol = +lastMove - 1;
    const nextRow = this.standardGrid.findFirstEmpty(nextCol);
    return [nextCol, nextRow];
  };


  // La méthode addAIMove est utilisée pour ajouter le coup de l'IA à l'état du jeu.
  addAIMove = (col) => {
    const row = this.standardGrid.findFirstEmpty(col);
    this.standardGrid.add({ x: col, y: row});
    this.position.playCol(col);
    this.playedMoves += col;
  };

  // La méthode computeMove est utilisée pour calculer le prochain coup de l'IA.
  computeMove = (board) => {
    this.standardGrid.fillBoard(board);
    // Si le nombre de coups joués est inférieur à 7, la méthode earlyGame est appelée.
    if (this.position.nbMoves < 7) {
      return this.earlyGame();
    }
    // S'il est compris entre 7 et 25 et que le jeu n'a pas été résolu, la méthode midGame est appelée.
    if (this.position.nbMoves < 26 && !this.isResolved) {
      return this.midGame();
    }
    // S'il est compris entre 26 et 28 et que le jeu n'a pas été résolu, la méthode endGame est appelée.
    if (this.position.nbMoves < 29 && !this.isResolved) {
      return this.endMidGame();
    }
    // Sinon, la méthode endGame est appelée.
    return this.endGame();
  };

  earlyGame = () => {
    if (this.playedMoves === '') {
      this.addAIMove(3);
      return 3;
    }
    const bestMoves =  bestSecondPlayerMoves;

    const bestMove = bestMoves.find((move) => {
      const previousMoves = move[0];
      return previousMoves === this.playedMoves;
    });

    if (bestMove) {
      const bestColMove = parseInt(bestMove[1], 10);
      this.addAIMove(bestColMove);
      return bestColMove;
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
      const bestColMoveSymmetric = parseInt(bestMoveSymetric[1], 10);
      const invertedMove = this.position.WIDTH - 1 - parseInt(bestColMoveSymmetric, 10);
      this.addAIMove(invertedMove);
      return invertedMove;
    }

    this.addAIMove(3);

    return 3;
  };

  midGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity, 3, Infinity),
      10,
    );
    this.addAIMove(col);
    return col;
  };

  endMidGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity, 7),
      10,
    );
    this.addAIMove(col);
    return col;
  };

  endGame = () => {
    const col = parseInt(
      this.bestColumn(this.position, -Infinity, Infinity),
      10,
    );
    this.addAIMove(col);
    return col;
  };

  // Fonction qui retourne la colonne avec le meilleur coup possible
  // pos: l'état actuel du jeu
  // alpha et beta: les valeurs de l'algorithme alpha-beta
  // depth: la profondeur de l'arbre de recherche
  // clamp: le nombre maximum de mouvements évalués
  bestColumn = (
    pos,
    alpha = -1,
    beta = -1,
    depth = Infinity,
    clamp = Infinity,
  ) => {
    // Récupération des prochains mouvements possibles
    const next = pos.possibleNonLosingMoves();
    // Tri des mouvements en fonction de leur score
    const moves = new MoveSorter(pos.WIDTH);
    for (let i = 0; i < pos.WIDTH; i++) {
      const move = next & pos.columnMask(this.#columnOrder[i]);
      // Si la colonne donne une victoire, on retourne la colonne
      if (pos.isWinningMove(this.#columnOrder[i])) return this.#columnOrder[i];
      if (move) {
        moves.add(move, pos.moveScore(move), this.#columnOrder[i]);
      }
    }
    // Limitation du nombre de mouvements évalués
    moves.clamp(clamp);
    const bestMoves = new MoveSorter(pos.WIDTH);
    let nextMove = moves.getNext();
    while (nextMove) {
      const pos2 = pos.clone();
      pos2.play(nextMove.move);
      // Calcul du score du mouvement actuel
      const score = -this.minmax(pos2, -beta, -alpha, depth, clamp);
      // Ajout du mouvement dans la liste des meilleurs mouvements possibles
      bestMoves.add(nextMove.move, score, nextMove.col);
      nextMove = moves.getNext();
    }
    const bestMove = bestMoves.getNext().col;
    if (bestMove) return bestMove;

    // Si aucun des mouvements ne donne une victoire, on sélectionne un mouvement possible aléatoire
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

  // Fonction minmax pour implémenter l'algorithme alpha-beta pruning
  // pos est l'état actuel du jeu (instance de la classe Position)
  // alphaInit et betaInit sont les paramètres alpha et beta pour la recherche
  // depth (profondeur) est la profondeur maximale de recherche
  // clamp est le nombre maximum de mouvements considérés pour chaque colonne
  minmax = (pos, alphaInit, betaInit, depth = Infinity, clamp = Infinity) => {
    let alpha = alphaInit;
    let beta = betaInit;
    if (alpha >= beta) return alpha;
    if (depth === 0) return Number(pos.score());
    // On récupère les mouvements possibles non perdants de la position actuelle
    const next = pos.possibleNonLosingMoves();
    // Si aucun mouvement n'est possible, on retourne le score de la position
    if (next === 0n) return -(pos.WIDTH * pos.HEIGHT - pos.nbMoves) / 2;
    // Si le nombre de mouvements effectués est égal au nombre maximal de mouvements
    if (pos.nbMoves >= pos.WIDTH * pos.HEIGHT - 2) return 0;
    // On calcule le score minimal possible
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
    // On crée un objet MoveSorter pour trier les mouvements possibles
    const moves = new MoveSorter(pos.WIDTH);
    for (let i = 0; i < pos.WIDTH; i++) {
      const move = next & pos.columnMask(this.#columnOrder[i]);
      if (move) {
        moves.add(move, pos.moveScore(move), this.#columnOrder[i]);
      }
    }
    // On limite le nombre de mouvements considérés pour chaque colonne
    moves.clamp(clamp);
    let nextMove = moves.getNext();
    while (nextMove) {
      const pos2 = pos.clone();
      pos2.play(nextMove.move);
      // On appelle la fonction minmax récursivement sur la nouvelle position
      // en inversant les valeurs de alpha et beta
      const score = -this.minmax(pos2, -beta, -alpha, depth - 1);
      if (score >= beta) return score;
      if (score > alpha) {
        alpha = score;
      }
      nextMove = moves.getNext();
    }

  // On stocke le résultat dans la table de transposition
  // en soustrayant MIN_SCORE + 1 pour compresser la valeur alpha
    this.#transTable.put(pos.key(), alpha - MIN_SCORE + 1);
    return alpha;
  };
}

let ai;

const hydrate = (state) => ai.hydrate(state);

module.exports = AI;
