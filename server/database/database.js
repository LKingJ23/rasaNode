const { Pool, Client } = require('pg');

const connectionData = {
    user: 'miguel',
    host: 'localhost',
    database: 'rasax',
    port: 5432,
    password: 'root'
}

const pool = new Pool(connectionData);

module.exports = {
    pool
}