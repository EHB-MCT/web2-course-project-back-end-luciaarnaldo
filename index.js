import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

// Needed to use __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Helper function to read recipes
const getRecipes = () => {
  const dataPath = path.join(__dirname, "data", "recipes.json");
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
};

// ROUTE
app.get("/", (req, res) => {
  res.send("Recipe API is running");
});

// GET /recipes/:id  
app.get("/recipes/:id", (req, res) => {
  try {
    const recipes = getRecipes();
    const recipeId = req.params.id;

    const recipe = recipes.find(r => r.id === recipeId);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve recipe." });
  }
});

// GET /recipes (with filters)
app.get("/recipes", (req, res) => {
  try {
    let recipes = getRecipes();

    const { ingredient, time, type } = req.query;

    if (ingredient) {
      recipes = recipes.filter(recipe =>
        recipe.ingredients.includes(ingredient)
      );
    }

    if (time) {
      recipes = recipes.filter(recipe => recipe.time === time);
    }

    if (type) {
      recipes = recipes.filter(recipe => recipe.type === type);
    }

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve recipes." });
  }
});




// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
