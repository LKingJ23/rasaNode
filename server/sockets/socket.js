const { io } = require('../server');
const { pool } = require('../database/database');

pool.connect();
/*
pool.query('select * from rasa_logs;')
    .then(response => {
        console.log(response.rows);
        pool.end();
    })
    .catch(err => {
        pool.end()
    })
*/

io.on('connection', (client) => {

    client.on('preguntaRespuesta', (data) => {

        //data[2] = data[2].replace(/['<b>']/g, '');
        //data[2] = data[2].replace(/['</b>']/g, '');

        let date = new Date();
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        let hour = date.getHours();
        let minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        let time = hour + ':' + minutes;

        console.log(data[0]);
        console.log(data[1]);
        console.log(data[2], data[3], data[4], data[5], data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15], data[16], data[17], data[18], data[19]);
        console.log(today + ' ' + time);
        let dateNow = today + ' ' + time;
        console.log(data[20]);

        //pool.query("INSERT INTO rasa_logs(user_input, intent, entities, date_log, user_log) VALUES('" + data[0] + "', '" + data[1] + "', '" + data[2] + "', '" + dateNow + "', '" + data[3] + "');");
        pool.query("INSERT INTO rasa_logs(user_input, intent, intent_percent, entity1, entity1_value, entity1_percent, entity2, entity2_value, entity2_percent, entity3, entity3_value, entity3_percent, entity4, entity4_value, entity4_percent, entity5, entity5_value, entity5_percent, entity6, entity6_value, entity6_percent, date_log, user_log)" +
            "VALUES('" + data[0] + "', '" + data[1] + "', '" + data[2] + "', '" + data[3] + "', '" + data[4] + "', '" + data[5] + "', '" + data[6] + "', '" + data[7] + "', '" + data[8] + "', '" + data[9] + "', '" + data[10] + "', '" + data[11] + "', '" + data[12] + "', '" + data[13] + "', '" + data[14] + "', '" + data[15] + "', '" + data[16] + "', '" + data[17] + "', '" + data[18] + "', '" + data[19] + "', '" + data[20] + "', '" + dateNow + "', '" + data[3] + "');");
    });

});