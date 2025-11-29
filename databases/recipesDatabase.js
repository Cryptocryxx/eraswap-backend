//Imports
const database = require("./databaseMain");
const log = require("../logging/logger")
const { ObjectId } = require("mongodb");

/**
 * Diese Methode dient dazu, die Anmeldedaten eines Benutzers zu überprüfen.
 * 
 * @param req: Request-Objekt -> hier müssen der Benutzername und das Passwort übergeben werden
 * @return: Boolean (Bei Erfolg) -> `true` wenn die Anmeldedaten korrekt sind
 * @throws: Error (Bei Fehler) -> "Benutzer nicht gefunden!" oder "Ungültige Anmeldedaten." oder allgemeiner Fehler
 */
async function getRecipes(req) {
    const recipesCollection = (await database.initializeCollections()).recipes;
    const recipes = await recipesCollection.find().toArray();
    if (recipes.length == 0){
        log.info("No recipes found!")
    }
    log.info("Recipes found!")
    if (!recipes) {
        log.error("recipes not found!")
        return("Benutzer nicht gefunden!");
    }else {
        log.info("recipes: "+ recipes)
    }
   return recipes;
}

async function updateRecipe(req) {
    const recipesCollection = (await database.initializeCollections()).recipes
    const { name, ingredients, description, author, date} = req.body
    const {recipeID} = req.params
    const objectID = new ObjectId(recipeID)

    const filter = {_id: objectID}
    const update = {$set: {name, ingredients, description, author, date}}

    const operation = await recipesCollection.updateOne(filter, update)
    console.log(operation)
    if (operation.modifiedCount === 0) {
        return false;
    }
    return true;
    

}

async function deleteRecipe(req) {
    const recipeIDString = req.params.recipeID
    const recipeID = new ObjectId(recipeIDString)
    const recipesCollection = (await database.initializeCollections()).recipes
    const operation = await recipesCollection.deleteOne({_id: recipeID})
    
    if (operation.deletedCount === 0){
        return false;
    }
    return true;
}

async function addRecipe(req) {
    try {
        const recipe = req.body;
        // Optional: Überprüfen, ob alle erforderlichen Felder vorhanden sind
        if (!recipe.name || !recipe.ingredients || !recipe.description || !recipe.author || !recipe.date) {
            throw new Error("Alle Felder sind erforderlich");
        }

        // Konvertiere das Datum in ein ISO-Format, falls erforderlich
        const isoDate = new Date(recipe.date);
        if (isNaN(isoDate.getTime())) {
            throw new Error("Ungültiges Datumsformat");
        }
        recipe.date = isoDate;

        console.log(recipe);
        const recipesCollection = (await database.initializeCollections()).recipes

        const operation = await recipesCollection.insertOne(recipe);

        // Überprüfen, ob die Einfügeoperation erfolgreich war
        if (operation.insertedCount === 0) {
            throw new Error("Das Rezept konnte nicht hinzugefügt werden");
        }

        // Erfolgreiche Rückmeldung
        return { success: true, recipeId: operation.insertedId }; // Gib die ID des eingefügten Rezepts zurück
    } catch (err) {
        console.error(err); // Protokolliere den Fehler
        throw err; // Werfe den Fehler weiter, um ihn an den Aufrufer zurückzugeben
    }
}

module.exports = {
    getRecipes,
    deleteRecipe,
    addRecipe,
    updateRecipe
};
