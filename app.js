const bodyParser = require('body-parser');
const express = require('express');

const app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, User-Agent");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

const router = express.Router();

require('./controllers/rbc.controller.js')(router);

app.use('/api', router);

app.listen(9191, function() {
  console.log('Server online on port: 9191');
});