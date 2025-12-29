import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Recipe from "../models/Recipe.js";
import User from "../models/User.js";

// Needed to recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to JSON data files
const recipesPath = path.join(__dirname, "..", "data", "recipes.json");
const usersPath = path.join(__dirname, "..", "data", "users.json");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    // ---------- RECIPES ----------
    const recipesData = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));

    await Recipe.deleteMany();
    const insertedRecipes = await Recipe.insertMany(recipesData);

    console.log(`Recipes inserted: ${insertedRecipes.length}`);

    // ---------- USERS ----------
    const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

    await User.deleteMany();
    const insertedUsers = await User.insertMany(usersData);

    console.log(`Users inserted: ${insertedUsers.length}`);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
