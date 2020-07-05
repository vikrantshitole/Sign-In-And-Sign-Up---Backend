const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const logger = require('morgan');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());

const dbConfig = require('./Config/secret');
// Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET',
    'POST',
    'DELETE',
    'PUT',
    'OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});
// Body Parser to get data in json format
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

mongoose.Promise = global.Promise;
// Connecting the database to database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const auth = require('./Routes/authRoutes');

app.use('/api/chatapp', auth);
// listening the server at port 3000
app.listen(3000, () => {
  console.log('Server started at 3000');
});
