const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');

// Serve os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../front-api')));

app.use(cors({
    origin: '*',
    credentials: true
}));

// Rotas da API
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const corredoresRouter = require('./routes/corredores');
app.use('/api/corredores', corredoresRouter);

const estatisticasRouter = require('./routes/estatisticas');
app.use('/api/estatisticas', estatisticasRouter);

module.exports = app;
