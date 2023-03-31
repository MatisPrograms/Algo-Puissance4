module.exports = (maxSeconds) => {
    let startTime;

    function nextMove(board) {
        startTime = Date.now();
        return monteCarlo(board);
    }

    // Calculate the best move in maxSeconds seconds
    function monteCarlo(board) {
        
    }
};