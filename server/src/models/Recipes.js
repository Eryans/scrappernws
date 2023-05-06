const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  id: String,
  name: String,
  image: String,
  otherIngredient: [String],
  directions: [String],
  ingredients: [
    {
      id: {
        type: String,
      },
    },
  ],
  ingredientsdb: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }],
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = { Recipe };
