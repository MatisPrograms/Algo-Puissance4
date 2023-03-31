const app = require('express')();

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Connect 4 Calculator is running on port', port);
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/move', (req, res) => {
    const board = req.query.b;
    res.send('Board: ' + board);
});