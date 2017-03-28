// server.js

// required packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// define app using express
const app = express();

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// connect to mongoose DB and require model
mongoose.connect('mongodb://localhost/RR_Fib_DB');
const FibModel = require('./app/models/fib');


// Fibonacci calculator function ====================================
let cache = [];
let funcIteration = 0;

function calculator(index, callback) {
  // check cache at different iterations of the function.
  console.log('cache iteration #', cache, funcIteration++);
  if (index === 0) {
    cache[index] = 0; // missing from example, set cache at index to 0
    callback(0);
  } else if (index === 1) {
    cache[index] = 1; // missing from example, set cache at index to 1
    callback(1);
  } else {
    const cachedResult = cache[index];
    if (cachedResult) {
      callback(cachedResult);
    } else {
      // process.nextTick delays executing the function until the next event loop.
      process.nextTick(() => {
        calculator(index - 1, (firstResult) => {
          process.nextTick(() => {
            calculator(index - 2, (secondResult) => {
              const result = firstResult + secondResult;
              cache[index] = result;
              callback(result);
            });
            // update the cache in the db with new cache values.
            FibModel.update({ arrayCreated: 'Yes' }, { array: cache }, (err) => {
              if (err) {
                console.log('error updating cache in db', err);
              } else {
                console.log('success updating cache in db!', cache);
              }
            });
          });
        });
      });
    }
  }
}
// =================================================================


// ROUTES FOR API // ====================================================================
const router = express.Router();

// test route
router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// prefix all routes with api
app.use('/api', router);

// Routes
router.get('/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (isNaN(index)) {
    res.json({ error: 'Index was not a number' });
  } else {
    // Look for saved cache in db, or initiate cache.
    FibModel.findOneOrCreate(
    { arrayCreated: 'Yes' },
    { arrayCreated: 'Yes', array: [] },
    (err, dbResult) => {
      // check if a new cache was created or was retrieved from the database.
      console.log('retrieving cache from db or creating new cache', dbResult);
      if (!err) {
        cache = dbResult.array;
        funcIteration = 0;
        calculator(index, (result) => {
          res.json({ result });
        });
      } else {
        console.log('error in findOrCreate', err);
      }
    });
  }
});

// =================================================================

// start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Pizzas are served on port', port);
});

