const fs = require('fs');

// Lecture du fichier
const data = fs.readFileSync('./recipes.json');

// Parsing du JSON en objet JavaScript
const obj = JSON.parse(data);

// Affichage de chaque élément du tableau
obj.forEach((element) => {
  console.log(element);
});
