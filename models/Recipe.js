import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    difficulty: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
    ingredients: { type: [String], required: true },
    preparation: { type: String, required: true }
});

export default mongoose.model("Recipe", recipeSchema);

