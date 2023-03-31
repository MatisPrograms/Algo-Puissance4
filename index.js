const express = require('express');

const app = express();

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

grille = []
const lines = 6;
const colums = 7;


const convertEntry = (string) => {
    let i = 0;
    let tmp = [];
    for (i in colums){
        tmp = string.splice(0,6)
        tmp = tmp.split(",")
        grille[i] = tmp;
    }
    return grille;
}

convertEntry("m00000h00000mm0000hmh000h00000h00000000000");