API de recettes de cuisine

Ce projet est une API pour gérer des recettes de cuisine et leurs ingrédients. Il est possible d'insérer des ingrédients et des recettes à partir de fichiers JSON, de récupérer la liste des ingrédients et des recettes, et de rechercher des ingrédients et des recettes par nom. Il est également possible de fusionner les données des ingrédients et des recettes.
Routes
POST /v1/food/ingredients

Insère les ingrédients à partir d'un fichier JSON situé dans le dossier scrapper-data. Si un ingrédient avec le même identifiant existe déjà dans la base de données, il ne sera pas ajouté à nouveau.
POST /v1/food/recipes

Insère les recettes à partir d'un fichier JSON situé dans le dossier scrapper-data. Si une recette avec le même identifiant existe déjà dans la base de données, elle ne sera pas ajoutée à nouveau.
GET /v1/food/recipes/:populate

Récupère la liste de toutes les recettes de la base de données. Si populate est défini à true, les ingrédients de chaque recette seront également récupérés.
GET /v1/food/ingredients/:populate

Récupère la liste de tous les ingrédients de la base de données. Si populate est défini à true, les recettes de chaque ingrédient seront également récupérées.
GET /v1/food/recipes/:id/:populate

Récupère la recette avec l'identifiant spécifié. Si populate est défini à true, les ingrédients de la recette seront également récupérés.
GET /v1/food/ingredients/:id/:populate

Récupère l'ingrédient avec l'identifiant spécifié. Si populate est défini à true, les recettes de l'ingrédient seront également récupérées.
POST /v1/food/recipes-search-name/:populate

Recherche les recettes dont le nom contient la chaîne de caractères spécifiée dans le corps de la requête. Si populate est défini à true, les ingrédients de chaque recette seront également récupérés.
POST /v1/food/ingredients-search-name/:populate

Recherche les ingrédients dont le nom contient la chaîne de caractères spécifiée dans le corps de la requête. Si populate est défini à true, les recettes de chaque ingrédient seront également récupérées.
POST /v1/food/merge-data

Fusionne les données des ingrédients et des recettes en associant chaque ingrédient aux recettes qui l'utilisent et vice versa.