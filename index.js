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


// RECIPES HELPERS
const getRecipes = () => {
  const dataPath = path.join(__dirname, "data", "recipes.json");
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
};

const saveRecipes = (recipes) => {
  const dataPath = path.join(__dirname, "data", "recipes.json");
  fs.writeFileSync(dataPath, JSON.stringify(recipes, null, 2));
};

const generateRecipeId = (recipes) => {
  if (recipes.length === 0) return "r001";

  const lastRecipe = recipes[recipes.length - 1];
  const lastIdNumber = parseInt(lastRecipe.id.replace("r", ""));
  const newIdNumber = lastIdNumber + 1;

  return "r" + newIdNumber.toString().padStart(3, "0");
};


// USERS HELPERS
const getUsers = () => {
  const dataPath = path.join(__dirname, "data", "users.json");
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
};

const saveUsers = (users) => {
  const dataPath = path.join(__dirname, "data", "users.json");
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

const generateUserId = (users) => {
  if (users.length === 0) return "u001";

  const lastUser = users[users.length - 1];
  const lastIdNumber = parseInt(lastUser.id.replace("u", ""));
  const newIdNumber = lastIdNumber + 1;

  return "u" + newIdNumber.toString().padStart(3, "0");
};



// RECIPES ROUTES

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


// POST /recipes
app.post("/recipes", (req, res) => {
  try {
    const { name, difficulty, time, type, ingredients, preparation } = req.body;

    if (!name || !difficulty || !time || !type || !ingredients || !preparation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipes = getRecipes();

    const newRecipe = {
      id: generateRecipeId(recipes),
      name,
      difficulty,
      time,
      type,
      ingredients,
      preparation
    };

    recipes.push(newRecipe);
    saveRecipes(recipes);

    res.status(201).json({
      message: "Recipe created successfully",
      createdRecipeId: newRecipe.id
    });
  } catch (error) {
    res.status(500).json({ error: "Could not create recipe" });
  }
});


// DELETE /recipes/:id
app.delete("/recipes/:id", (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipes = getRecipes();

    const recipeIndex = recipes.findIndex(
      (recipe) => recipe.id === recipeId
    );

    if (recipeIndex === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const deletedRecipe = recipes.splice(recipeIndex, 1);
    saveRecipes(recipes);

    res.json({
      message: "Recipe deleted successfully",
      deletedRecipeId: deletedRecipe[0].id
    });
  } catch (error) {
    res.status(500).json({ error: "Could not delete recipe" });
  }
});


// USERS ROUTES

// POST /users
app.post("/users", (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const users = getUsers();

    const userExists = users.find(
      (user) => user.email === email || user.username === username
    );

    if (userExists) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const newUser = {
      id: generateUserId(users),
      username,
      email,
      password
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      message: "User created successfully",
      userId: newUser.id
    });
  } catch (error) {
    res.status(500).json({ error: "Could not create user" });
  }
});


// POST /login
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const users = getUsers();

    // EASTER EGG: if an existing user uses the secret password,
    // return a special message without performing a real login

    const secretUser = users.find((user) => user.email === email);

    if (secretUser && password === "chefmaster") {
        return res.json({
            message: ` Welcome back, ${secretUser.username}! You found the secret.`
        });
    }


    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      userId: user.id,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
