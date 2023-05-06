import json
import re
import requests
from bs4 import BeautifulSoup

# URL de la page à scraper
url = 'https://www.allrecipes.com/ingredients-a-z-6740416/'

# Envoyer une requête HTTP GET pour récupérer le contenu de la page
response = requests.get(url)

# Utiliser BeautifulSoup pour parser le contenu HTML de la page
soup = BeautifulSoup(response.content, 'html.parser')

# Sélectionner tous les éléments <a> contenant 'ingredients' dans l'attribut href et ayant l'attribut class 'link-list__link'
a_tags = soup.find_all('a', {'href': lambda href: href and 'ingredients' in href, 'class': 'link-list__link'})

# Créer un tableau pour stocker les données d'ingrédients
ingredients = []

# Ajouter un objet avec la propriété 'name' pour chaque élément <a>
for tag in a_tags:
    ingredient = {'id': hash(tag.text.strip()), 'name': tag.text.strip(), 'recipes': []}

    # Suivre le lien vers la page de résultats de recherche pour l'ingrédient
    search_url = tag['href']
    search_response = requests.get(search_url)
    search_soup = BeautifulSoup(search_response.content, 'html.parser')

    # Sélectionner toutes les balises <a> contenant le texte "mntl-card-list-items" dans leur attribut "id"
    recipe_links = search_soup.find_all('a', {'id': re.compile('.*mntl-card-list-items.*')})


    # Ajouter les données de chaque recette au tableau de recettes de l'ingrédient
    for recipe_link in recipe_links:
        recipe_id = recipe_link.get('id')
        if recipe_id:
            recipe_id = recipe_id.split('_')[-1]
        image_tag = recipe_link.find('img', {'class': 'card__img'}).get('data-src', '')
        # image_url = image_tag['src'] if image_tag and 'src' in image_tag.attrs else ''
        recipe = {'id': hash(recipe_link['href']), 'name': recipe_link.find('span', {'class': 'card__title'}).text.strip(), 'image': image_tag}

        ingredient['recipes'].append(recipe)

    ingredients.append(ingredient)

# Enregistrer les données dans un fichier JSON
with open('ingredients.json', 'w') as f:
    json.dump(ingredients, f)

# Créer un tableau d'objets contenant les recettes et l'ingrédient qui leur est associé
recipes = []
for ingredient in ingredients:
    for recipe in ingredient['recipes']:
        recipes.append({'ingredient_id': ingredient['id'], 'ingredient_name': ingredient['name'], 'recipe_id': recipe['id'], 'recipe_name': recipe['name'], 'recipe_image': recipe['image']})

# Enregistrer les données dans un deuxième fichier JSON
with open('recipes.json', 'w') as f:
    json.dump(recipes, f)
