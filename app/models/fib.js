// app/models/fibonacci.js

const mongoose = require('mongoose');
const findOneOrCreate = require('mongoose-find-one-or-create');

const FibSchema = new mongoose.Schema({
  arrayCreated: String,
  array: Array,
});

FibSchema.plugin(findOneOrCreate);

module.exports = mongoose.model('Fib', FibSchema);



