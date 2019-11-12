const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool, Client } = require('pg');

const connectionData = {
    user: 'miguel',
    host: 'localhost',
    database: 'rasax',
    port: 5432,
    password: 'root'
}

const pool = new Client(connectionData);
pool.connect();

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    let pepe = "";
    let pass = false;

    if (username && password) {
        pool.query("SELECT * FROM rasa_users WHERE name = '" + username + "' and password = '" + password + "';")
            .then((response) => {
                if (response.rowCount < 1) {
                    console.log("Mala contraseña");
                    pass = false;
                } else {
                    pass = true;
                    console.log(response.rows);
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
    console.log(req.session.loggedin);
    if (req.session.loggedin === undefined) {
        res.sendFile(path.join(__dirname + '/login.html'));
    } else {
        res.sendFile(path.join(__dirname + '/home.html'));
    }
});

app.listen(3000);