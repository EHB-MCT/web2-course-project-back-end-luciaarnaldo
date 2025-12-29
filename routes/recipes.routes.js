import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

/**
 * GET /recipes
 * Optional filters:
 * - ingredient
 * - time
 * - type
 */
router.get("/", async (req, res) => {
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
 
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const { id, name, difficulty, time, type, ingredients, preparation } =
      req.body;

    if (!id || !name || !difficulty || !time || !type || !ingredients || !preparation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipeExists = await Recipe.findOne({ id });
    if (recipeExists) {
      return res.status(400).json({ error: "Recipe ID already exists" });
    }

    const newRecipe = new Recipe({
      id,
      name,
      difficulty,
      time,
      type,
      ingredients,
      preparation
    });

    await newRecipe.save();

    res.status(201).json({
      message: "Recipe created successfully",
      recipeId: newRecipe.id
    });
  } catch (error) {
    res.status(500).json({ error: "Could not create recipe" });
  }
});


// DELETE /recipes/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({
      id: req.params.id
    });

    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({
      message: "Recipe deleted successfully",
      deletedRecipeId: deletedRecipe.id
    });
  } catch (error) {
    res.status(500).json({ error: "Could not delete recipe" });
  }
});

export default router;
