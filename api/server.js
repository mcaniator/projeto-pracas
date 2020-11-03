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

require('./src/models/User')


app.get('/', (req, res) => {
    res.send('Hello Vinimaan!');
})

app.listen(3001);