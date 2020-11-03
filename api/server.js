const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello Vinimaan!');
})

app.listen(3001);