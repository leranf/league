const express = require('express');
const app = express();

// dotenv sets up the process.env variables. Put env variables in a .env file in your root
require('dotenv').config({ path: `${__dirname}/./.env` });
const PORT = process.env.PORT;
const db = require('./config/db.js');

require('./config/middleware.js')(app, express);

require('./config/routes.js')(app, express);

app.set('port', PORT);
const server = app.listen(PORT);
console.log(`Listening on port ${PORT}`);

module.exports = app;
