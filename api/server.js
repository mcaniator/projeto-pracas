const express = require('express');
const mongoose = require('mongoose');
const requireDir = require('require-dir');

const app = express();

mongoose.connect(
    'mongodb://locahost:27017/nodeapi',
    { 
         useNewUrlParser: true,
         useUnifiedTopology: true 
    }
);

requireDir('./src/models');

const User = mongoose.model("User");


app.get('/', (req, res) => {
    User.create({
        name: "Viniman",
        email: "vinicius.oliveira@ice.ufjf.br",
        password: "123456"
    });

    return res.send('Hello Vinimaan!');
});

app.listen(3001);