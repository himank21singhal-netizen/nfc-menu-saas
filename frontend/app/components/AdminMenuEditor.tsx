'use client';

import React from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';

interface AdminMenuEditorProps {
  categories: any[];
  newCatName: string;
  setNewCatName: (name: string) => void;
  onAddCategory: (e: React.FormEvent) => void;
  onDeleteCategory: (id: string) => void;
  newItem: any;
  setNewItem: React.Dispatch<React.SetStateAction<any>>;
  onAddMenuItem: (e: React.FormEvent) => void;
  onMagicAiFill: () => void;
  generatingAiImage: boolean;
}

export default function AdminMenuEditor({
  categories,
  newCatName,
  setNewCatName,
  onAddCategory,
  onDeleteCategory,
  newItem,
  setNewItem,
  onAddMenuItem,
  onMagicAiFill,
  generatingAiImage,
}: AdminMenuEditorProps) {
  return (
    <div className="space-y-6">
      {/* Category Management */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider">Menu Categories</h2>
        <form onSubmit={onAddCategory} className="flex gap-3">
          <input
            type="text"
            placeholder="Category Name (e.g. Starters, Main Course)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span>{cat.name}</span>
              <button onClick={() => onDeleteCategory(cat.id)} className="text-slate-500 hover:text-rose-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Dish Item */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider">Add New Dish Item</h2>
        <form onSubmit={onAddMenuItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Dish Name"
              required
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price (₹)"
              required
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            required
            value={newItem.category_id}
            onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <textarea
            placeholder="Description / Ingredients..."
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 h-20"
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onMagicAiFill}
              disabled={generatingAiImage}
              className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {generatingAiImage ? 'Generating AI Image...' : 'Magic AI Image Fill'}
            </button>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.is_veg}
                onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              Vegetarian Dish
            </label>
          </div>

          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs">
            Publish Dish Item
          </button>
        </form>
      </div>
    </div>
  );
}