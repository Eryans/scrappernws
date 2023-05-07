const express = require('express');
const router = express.Router();
const Ingredient = require('../../models/Ingredient');
const ingredients = require('../../scrapper-data/ingredients.json');
const recipesjson = require('../../scrapper-data/recipes.json');
const { Recipe } = require('../../models/Recipes');
const { spawn } = require('child_process');
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: Food Scrapper
 *   description: Route d'utilisation des data récupéré avec le scrapper
 */
/**
 * @swagger
 * /food/scrapper:
 *   get:
 *     summary: Execute Le scrapper python
 *     responses:
 *       200:
 *         description: Scrappe terminé
 */

router.get('/scrapper', (req, res) => {
  const scrapperPath = path.join(__dirname, '../../scrapper-data/scrapper.py');
  const scrapperProcess = spawn('python', [scrapperPath]);

  scrapperProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  scrapperProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  scrapperProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    return res.status(200).send('Scrapper process finished');
  });
});

/**
 * @swagger
 * /food/ingredients:
 *   post:
 *     summary: Ajouter des ingrédients à la base de données.
 *     description: Cette route ajoute des ingrédients à la base de données à partir d'un fichier JSON.
 *     responses:
 *       201:
 *         description: Ingrédients insérés avec succès.
 *       500:
 *         description: Erreur lors de l'insertion des ingrédients.
 */

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

/**
 * @swagger
 * /food/recipes:
 *   post:
 *     summary: Ajouter des recettes à la base de données.
 *     description: Cette route ajoute des recettes à la base de données à partir d'un fichier JSON.
 *     responses:
 *       201:
 *         description: Recettes insérés avec succès.
 *       500:
 *         description: Erreur lors de l'insertion des recettes.
 */

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

/**
 * @swagger
 *
 * /food/recipes/{populate}:
 *   get:
 *     summary: Récupère toutes les recettes en fonction du paramètre "populate"
 *     description: Renvoie toutes les recettes en base de données, avec les ingrédients inclus ou non selon la valeur du paramètre "populate"
 *     parameters:
 *       - in: path
 *         name: populate
 *         required: true
 *         schema:
 *           type: string
 *         description: Détermine si les ingrédients doivent être inclus dans la réponse (true) ou non (false)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       '500':
 *         description: Erreur serveur
 *
 * /food/ingredients/{populate}:
 *   get:
 *     summary: Récupère tous les ingrédients en fonction du paramètre "populate"
 *     description: Renvoie tous les ingrédients en base de données, avec les recettes incluses ou non selon la valeur du paramètre "populate"
 *     parameters:
 *       - in: path
 *         name: populate
 *         required: true
 *         schema:
 *           type: string
 *         description: Détermine si les recettes doivent être incluses dans la réponse (true) ou non (false)
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       '500':
 *         description: Erreur serveur
 */

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

/**
 * @swagger
 * /food/recipes/{id}/{populate}:
 *   get:
 *     summary: Récupère une recette par ID avec les informations liées.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la recette à récupérer.
 *         schema:
 *           type: string
 *       - in: path
 *         name: populate
 *         required: true
 *         description: Indique si les informations liées doivent être peuplées ou non (true/false).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recette récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       500:
 *         description: Erreur lors de la récupération de la recette.
 *
 * /food/ingredients/{id}/{populate}:
 *   get:
 *     summary: Récupère un ingrédient par ID avec les informations liées.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'ingrédient à récupérer.
 *         schema:
 *           type: string
 *       - in: path
 *         name: populate
 *         required: true
 *         description: Indique si les informations liées doivent être peuplées ou non (true/false).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingrédient récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Erreur lors de la récupération de l'ingrédient.
 */

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

/**
 * @swagger
 * /food/recipes-search-name/{populate}:
 *   post:
 *     summary: Rechercher des recettes par nom
 *     description: Retourne toutes les recettes contenant un nom donné
 *     parameters:
 *       - in: path
 *         name: populate
 *         required: true
 *         description: Indique si les ingrédients de la recette doivent être retournés avec la recette
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: Recherche de recettes par nom
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       500:
 *         description: Internal Server Error
 *
 * /food/ingredients-search-name/{populate}:
 *   post:
 *     summary: Rechercher des ingrédients par nom
 *     description: Retourne tous les ingrédients contenant un nom donné
 *     parameters:
 *       - in: path
 *         name: populate
 *         required: true
 *         description: Indique si les recettes associées à l'ingrédient doivent être retournées avec l'ingrédient
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         description: Recherche d'ingrédients par nom
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Internal Server Error
 */

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
/**
 * @swagger
 * /food/recipes-search-ingredient-name/{populate}:
 *   post:
 *     summary: Recherche de recettes par nom d'ingrédient
 *     description: Renvoie les recettes contenant l'ingrédient dont le nom correspond à la recherche.
 *     tags:
 *       - Recettes
 *     parameters:
 *       - in: path
 *         name: populate
 *         schema:
 *           type: string
 *         required: true
 *         description: Indique si les ingrédients doivent être populés dans la réponse.
 *       - in: body
 *         name: ingredient
 *         description: Nom de l'ingrédient à rechercher
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: La liste des recettes contenant l'ingrédient recherché
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       500:
 *         description: Une erreur s'est produite lors de la récupération des recettes
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *     security:
 *       - bearerAuth: []
 */
router.post('/recipes-search-ingredient-name/:populate', async (req, res) => {
  try {
    const matchingIngredientIds = await Ingredient.find({ name: { $regex: req.body.name, $options: 'i' } }, '_id');
    console.log(matchingIngredientIds);
    const allRecipes = await Recipe.find({ ingredientsdb: { $elemMatch: { $in: matchingIngredientIds } } }).populate(
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

/**
 * @swagger
 * /food/merge-data:
 *   post:
 *     summary: Fusionner les données entre les collections d'ingrédients et de recettes
 *     description: Ce point de terminaison fusionne les données entre les collections d'ingrédients et de recettes en mettant à jour la propriété `recipesdb` de chaque document d'ingrédient avec les recettes correspondantes, et en mettant à jour la propriété `ingredientsdb` de chaque document de recette avec l'ingrédient correspondant.
 *     responses:
 *       200:
 *         description: Data merged successfully
 *       500:
 *         description: Error while merging data
 */

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
