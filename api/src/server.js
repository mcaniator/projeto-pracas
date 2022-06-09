const express = require('express');
const routes = require('./routes');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Middleware de erros, todas execoes param aqui
app.use((err, req, res, next) => {
    console.error(err);
    
    let code = err.parent?.code || -1;

    switch (code) {
        case '23502': // Falta campo obrigatorio no insert
        case '42703': // Coluna que nao existe
            res.status(400);
            res.send({ error: err.message })
            break;

        default: {
            res.status(500);
            res.send({ error: 'Internal error' });
        }
    }
})

app.listen(3333);