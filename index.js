// Imports
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Recipe from "./models/Recipe.js";
import User from "./models/User.js";

// Path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App initialitation
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

/* -------------------- BASIC ROUTE -------------------- */

app.get("/", (req, res) => {
  res.send("Recipe API is running");
});

/* -------------------- RECIPES ROUTES -------------------- */

// GET /recipes (with filters)
app.get("/recipes", async (req, res) => {
  try {
    const { ingredient, time, type } = req.query;
    const filter = {};

    if (ingredient) {
      filter.ingredients = { $in: [ingredient] };
    }

    if (time) {
      filter.time = time;
    }

    if (type) {
      filter.type = type;
    }

    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve recipes" });
  }
});

// GET /recipes/:id
app.get("/recipes/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ id: req.params.id });

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Could not retrieve recipe" });
  }
});

// POST /recipes
app.post("/recipes", async (req, res) => {
  try {
    const { id, name, image, difficulty, time, type, ingredients, preparation } =
      req.body;

    if (
      !id ||
      !name ||
      !image ||
      !difficulty ||
      !time ||
      !type ||
      !ingredients ||
      !preparation
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipeExists = await Recipe.findOne({ id });
    if (recipeExists) {
      return res.status(400).json({ error: "Recipe ID already exists" });
    }

    const newRecipe = new Recipe({
      id,
      name,
      image,
      difficulty,
      time,
      type,
      ingredients,
      preparation,
    });

    await newRecipe.save();

    res.status(201).json({
      message: "Recipe created successfully",
      recipeId: newRecipe.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not create recipe" });
  }
});

// DELETE /recipes/:id
app.delete("/recipes/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({
      message: "Recipe deleted successfully",
      deletedRecipeId: deletedRecipe.id,
    });
  } catch (error) {
    res.status(500).json({ error: "Could not delete recipe" });
  }
});

/* -------------------- USERS ROUTES -------------------- */

// POST /users → Register
app.post("/users", async (req, res) => {
  try {
    const { id, username, email, password } = req.body;

    if (!id || !username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    }

    const newUser = new User({ id, username, email, password });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

// POST /users/login → Login + Easter Egg
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // EASTER EGG
    if (password === "chefmaster") {
      return res.json({
        message: `Welcome back, ${user.username}! You found the secret.`,
        userId: user.id,
        username: user.username,
        easterEgg: true,
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

/* -------------------- START SERVER -------------------- */

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
