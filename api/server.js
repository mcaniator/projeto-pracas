const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.connect(
    'mongodb://locahost:27017/nodeapi',
    { 
         useNewUrlParser: true,
         useUnifiedTopology: true 
    }
);

app.get('/', (req, res) => {
    res.send('Hello Vinimaan!');
})

app.listen(3001);