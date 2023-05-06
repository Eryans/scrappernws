const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  recipes: [
    {
      id: {
        type: String,
      },
    },
  ],
  recipesdb: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
