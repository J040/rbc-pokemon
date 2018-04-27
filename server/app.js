const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, User-Agent");
  res.header("Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE");
  next();
});

require('./controllers/rbc.controller.js')(router);

app.use('/api', router);
app.listen(9191, console.log('Server online on port: 9191'));