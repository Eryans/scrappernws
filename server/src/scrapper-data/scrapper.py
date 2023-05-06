import json
import re
import requests
from bs4 import BeautifulSoup
import sys

# Set default encoding to utf-8
sys.stdout.reconfigure(encoding='utf-8')
# URL de la page à scraper
url = 'https://www.allrecipes.com/ingredients-a-z-6740416/'

# Envoyer une requête HTTP GET pour récupérer le contenu de la page
response = requests.get(url)

# Utiliser BeautifulSoup pour parser le contenu HTML de la page
print("scrapping :", url)
soup = BeautifulSoup(response.content, 'html.parser')

# Sélectionner tous les éléments <a> contenant 'ingredients' dans l'attribut href et ayant l'attribut class 'link-list__link'
a_tags = soup.find_all(
    'a', {'href': lambda href: href and 'ingredients' in href, 'class': 'link-list__link'})

# Créer un tableau pour stocker les données d'ingrédients
ingredients = []
# Créer un tableau d'objets contenant les recettes et l'ingrédient qui leur est associé
recipes = []
# Ajouter un objet avec la propriété 'name' pour chaque élément <a>
for tag in a_tags:
    ingredienthashedid = hash(tag.text.strip())
    ingredient = {'id': ingredienthashedid,
                  'name': tag.text.strip(), 'recipes': []}
    print("scrapping :", tag['href'])
    # Suivre le lien vers la page de résultats de recherche pour l'ingrédient
    search_url = tag['href']
    search_response = requests.get(search_url)
    search_soup = BeautifulSoup(search_response.content, 'html.parser')

    # Sélectionner toutes les balises <a> contenant le texte "mntl-card-list-items" dans leur attribut "id"
    recipe_links = search_soup.find_all(
        'a', {'id': re.compile('.*mntl-card-list-items.*')})

    # Ajouter les données de chaque recette au tableau de recettes de l'ingrédient
    for recipe_link in recipe_links:
        recipe_id = recipe_link.get('id')
        if recipe_id:
            recipe_id = recipe_id.split('_')[-1]
        image_tag = recipe_link.find(
            'img', {'class': 'card__img'}).get('data-src', '')
        recipehashforid = hash(recipe_link['href'])
        print("scrapping :", recipe_link['href'])

        recipe_search_url = recipe_link['href']
        recipe_search_response = requests.get(recipe_search_url)
        recipe_search_soup = BeautifulSoup(
            recipe_search_response.content, 'html.parser')
        # Sélectionner la première balise ul ayant la classe "mntl-structured-ingredients-list"
        ingredients_list = recipe_search_soup.find(
            'ul', {'class': 'mntl-structured-ingredients__list'})
        directions_list = recipe_search_soup.find(
            'ol', {'id': 'mntl-sc-block_2-0'})
        other_ingredients = []
        directions = []
        # Si la liste d'ingrédients est trouvée, extraire le contenu de chaque élément li
        if ingredients_list:
            # Sélectionner toutes les balises li dans la liste d'ingrédients
            list_items = ingredients_list.find_all('li')
            # Parcourir chaque élément li et extraire son contenu
            for item in list_items:
                # Sélectionner la balise p dans l'élément li et extraire son contenu
                p_tag = item.find('p')
                if p_tag:
                    # Sélectionner tous les éléments span dans la balise p et extraire leur contenu
                    spans = p_tag.find_all('span')
                    ingredients_text = ' '.join(
                        [span.text.strip() for span in spans])
                    # Ajouter le texte des ingrédients à la liste other_ingredients
                    other_ingredients.append(ingredients_text)
                    print(ingredients_text)

        # Si la liste des directions est trouvée, extraire le contenu de chaque élément li
        if directions_list:
            # Sélectionner toutes les balises li dans la liste des directions
            list_items = directions_list.find_all('li')
            # Parcourir chaque élément li et extraire son contenu
            for item in list_items:
                # Extraire le texte de l'élément li et ajouter à la liste des directions
                directions_text = item.text.strip()
                directions.append(directions_text)
                print(directions_text)

        recipe = {'id': recipehashforid, 'name': recipe_link.find('span', {'class': 'card__title'}).text.strip(
        ), 'image': image_tag, 'otherIngredient': other_ingredients, 'directions': directions}
        reduced_recipe = {'id': recipehashforid}
        # Vérifier si la recette existe déjà dans la liste 'recipes'
        existing_recipe = next(
            (x for x in recipes if x['id'] == recipe['id']), None)
        if existing_recipe:
            # Si la recette existe déjà, ajouter simplement l'id de l'ingrédient courant
            existing_recipe['ingredients'].append({'id': ingredient['id']})
        else:
            # Si la recette n'existe pas encore, ajouter la recette complète à la liste 'recipes'
            recipe['ingredients'] = [{'id': ingredient['id']}]
            recipes.append(recipe)

        ingredient['recipes'].append(reduced_recipe)

    # Si l'ingrédient est déjà existant dans la liste, ajouter seulement les nouvelles recettes
    existing_ingredient = next(
        (x for x in ingredients if x['id'] == ingredient['id']), None)
    if existing_ingredient:
        existing_ingredient['recipes'].extend(ingredient['recipes'])
    else:
        ingredients.append(ingredient)

# Enregistrer les données dans un fichier JSON
with open('ingredients.json', 'w') as f:
    json.dump(ingredients, f)

# Enregistrer les données dans un deuxième fichier JSON
with open('recipes.json', 'w') as f:
    json.dump(recipes, f)
