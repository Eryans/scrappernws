const express = require('express');
const router = express.Router();
const Ingredient = require('../../models/Ingredient');
const ingredients = require('../../scrapper-data/ingredients.json');
const recipesjson = require('../../scrapper-data/recipes.json');
const { Recipe } = require('../../models/Recipes');

router.post('/ingredients', async (req, res) => {
  try {
    // Insérer les ingrédients à partir du fichier JSON
    for (const ingredient of ingredients) {
      // Check if python id isn't already in db
      const alreadyExist = await Ingredient.findOne({ id: ingredient.id });
      if (!alreadyExist) {
        const newIngredient = new Ingredient({ id: ingredient.id, name: ingredient.name, recipes: ingredient.recipes });
        console.log('saving new ingredient :', ingredient.name);
        await newIngredient.save();
      }
    }
    res.status(201).send('Ingrédients insérés avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'insertion des ingrédients");
  }
});

router.post('/recipes', async (req, res) => {
  try {
    await Recipe.insertMany(recipesjson);
    res.status(201).send('Recettes insérés avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'insertion des recettes");
  }
});

module.exports = router;
