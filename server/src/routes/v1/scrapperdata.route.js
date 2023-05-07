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
        const newIngredient = new Ingredient({
          id: ingredient.id,
          name: ingredient.name,
          recipes: ingredient.recipes,
        });
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
    for (const recipe of recipesjson) {
      // Check if python id isn't already in db
      const alreadyExist = await Recipe.findOne({ id: recipe.id });
      if (!alreadyExist) {
        const newRecipe = new Recipe({
          id: recipe.id,
          name: recipe.name,
          recipes: recipe.recipes,
          ingredients: recipe.ingredients,
          otherIngredient: recipe.otherIngredient,
          directions: recipe.directions,
        });
        console.log('saving new recipe :', recipe.name);
        await newRecipe.save();
      }
    }
    res.status(201).send('Recettes insérés avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'insertion des recettes");
  }
});

router.get('/recipes/:populate', async (req, res) => {
  try {
    const allRecipes = await Recipe.find().populate(req.params.populate === 'true' ? 'ingredientsdb' : '');
    return res.status(200).send(allRecipes);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des recettes');
  }
});

router.get('/ingredients/:populate', async (req, res) => {
  try {
    console.log(req.params.populate);
    const allIngredients = await Ingredient.find().populate(req.params.populate === 'true' ? 'recipesdb' : '');

    return res.status(200).send(allIngredients);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des ingrédients');
  }
});

router.get('/recipes/:id/:populate', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(req.params.populate === 'true' ? 'ingredientsdb' : '');
    return res.status(200).send(recipe);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des recettes');
  }
});

router.get('/ingredients/:id/:populate', async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id).populate(req.params.populate === 'true' ? 'recipesdb' : '');

    console.log(ingredient);
    return res.status(200).send(ingredient);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des ingrédients');
  }
});

router.post('/recipes-search-name/:populate', async (req, res) => {
  try {
    const allRecipes = await Recipe.find({ name: { $regex: req.body.name, $options: 'i' } }).populate(
      req.params.populate === 'true' ? 'ingredientsdb' : ''
    );
    return res.status(200).json(allRecipes);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des recettes');
  }
});

router.post('/ingredients-search-name/:populate', async (req, res) => {
  try {
    const allIngredients = await Ingredient.find({ name: { $regex: req.body.name, $options: 'i' } }).populate(
      req.params.populate === 'true' ? 'recipesdb' : ''
    );
    return res.status(200).json(allIngredients);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erreur lors de la récupération des ingrédients');
  }
});
router.post('/merge-data', async (req, res) => {
  try {
    const allingredients = await Ingredient.find();
    for (const ingredient of allingredients) {
      const recipes = await Recipe.find({ ingredients: { $elemMatch: { id: ingredient.id } } });

      if (recipes && recipes.length > 0) {
        ingredient.recipesdb = recipes;
        await ingredient.save();
        for (const recipe of recipes) {
          recipe.ingredientsdb = ingredient;
          await recipe.save();
        }
      }
    }
    return res.status(200).send('Data merged');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Something wrong happend : ', error);
  }
});
module.exports = router;
