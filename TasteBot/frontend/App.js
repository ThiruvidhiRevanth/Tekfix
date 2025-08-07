import React, { useState } from "react";
import axios from "axios";
import './index.css'; // Ensure Tailwind is imported

function App() {
const [ingredients, setIngredients] = useState("");
const [chat, setChat] = useState([]);
const [loading, setLoading] = useState(false);

const handleSend = async () => {
if (!ingredients.trim()) return;

// Add user message to chat
setChat((prev) => [...prev, { type: 'user', text: ingredients }]);
setLoading(true);

try {
const res = await axios.post("http://localhost:8000/generate-recipes", {
ingredients,
});

const rawRecipes = res.data.recipes.split('---').filter(Boolean);
const parsedRecipes = rawRecipes.map((block) => {
const titleMatch = block.match(/\*\*Title:\*\*\s*(.+)/);
const ingredientsMatch = block.match(/\*\*Ingredients:\*\*\s*([\s\S]*?)\*\*Preparation:/);
const prepMatch = block.match(/\*\*Preparation:\*\*\s*([\s\S]*)/);
return {
title: titleMatch?.[1]?.trim() || "Untitled Recipe",
ingredients: ingredientsMatch?.[1]
?.split('\n')
?.map((line) => line.replace(/^[-*]\s*/, '').trim())
            ?.filter(Boolean) || [],
          preparation: prepMatch?.[1]?.trim() || "",
        };
      });

      setChat((prev) => [...prev, { type: 'bot', recipes: parsedRecipes }]);
      setIngredients("");
    } catch (err) {
      alert("Failed to generate recipes.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-64 flex flex-col pb-5 relative">
      <h1 className="text-3xl font-bold text-center py-4">🍳 TasteBot</h1>

      <div className="flex-1 overflow-y-auto space-y-4  max-w-[100%] w-full px-4 py-2 pb-20  bg-white rounded shadow">
               {chat.length === 0 && (
          <div className="text-center text-gray-600 italic text-xl pt-64 font-bold ">
            “Cooking is at once child’s play and adult joy. And cooking done with care is an act of love.”<br />
                  <span className="block mt-2 font-semibold">Let's cook something delicious!</span>
          </div>
        )}
        {chat.map((msg, index) => (
          <div key={index} className="p-2">
            {msg.type === 'user' ? (
              <div className="text-right">
                <p className="inline-block bg-blue-500 text-white px-4 py-2  rounded-lg max-w-md">
                  
                  {msg.text}
                </p>
              </div>
            ) : (
              msg.recipes.map((rec, idx) => (
                <div key={idx} className="bg-gray-100 p-4 rounded-lg my-2 text-left shadow-sm">
                  <h2 className="text-xl font-semibold text-green-700">{rec.title}</h2>
                  <h3 className="font-medium mt-2">🧂 Ingredients:</h3>
                  <ul className="list-disc list-inside ml-4">
                    {rec.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                  <h3 className="font-medium mt-2">👨‍🍳 Preparation:</h3>
                  <p className="whitespace-pre-wrap">{rec.preparation}</p>
                </div>
              ))
            )}
          </div>
        ))}
      </div>


<div className="fixed bottom-0 left-0 right-0 bg-transparent pb-10 ">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none"
            type="text"
            placeholder="Enter ingredients (e.g., tomato, onion)..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1  rounded hover:bg-blue-600"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
