const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const ingredients = require('../../scrapper-data/ingredients.json');

router.post('/ingredients', async (req, res) => {
  try {
    // Insérer les ingrédients à partir du fichier JSON
    await Ingredient.insertMany(ingredients);
    res.status(201).send('Ingrédients insérés avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors de l\'insertion des ingrédients');
  }
});

module.exports = router;
