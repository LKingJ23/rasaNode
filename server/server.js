const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');
const { pool } = require('./database/database');
const favicon = require('serve-favicon');
const cors = require('cors');

const app = express();
let server = http.createServer(app);

const publicPath = path.resolve(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    next();
    app.options('*', (req, res) => {
        // allowed XHR methods  
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
        res.send();
    });
});

app.use(cors());

app.use(express.static(publicPath));

app.use(favicon(path.join(publicPath, 'img', 'airbus.ico')));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require('./sockets/socket');

app.post('/auth', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    let pass = false;

    if (username && password) {
        pool.query("SELECT * FROM rasa_users WHERE name = '" + username + "' and password = '" + password + "';")
            .then((response) => {
                if (response.rowCount < 1) {
                    pass = false;
                } else {
                    pass = true;
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.expires = 3600;
                }
            })
            .catch(err => {
                console.log(err.stack);
            });
        setTimeout(() => {
            if (pass) {
                res.send({ 'user': username });
                res.end();
            } else {
                res.send({ 'error': 'usuario o contraseña incorrecta' });
                res.end();
            }
        }, 1000);
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get('/home', function(req, res) {
    if (req.session.loggedin === undefined) {
        res.sendFile(publicPath + '/index.html');
    } else {
        res.sendFile(publicPath + '/home.html');
    }
});

app.get('/incis', function(req, res) {
    res.send({ 'hnc': 'hnc' });
    res.send({ 'obs': 'obs' });
    res.send({ 'demat': 'demat' });
});

server.listen(port, (err) => {

    if (err) throw new Error(err);

    console.log(`Servidor corriendo en puerto ${ port }`);

});