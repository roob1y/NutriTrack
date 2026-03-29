import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // ── Targets ──────────────────────────────────
      targets: {
        calories: 1800,
        protein: 140,
        carbs: 200,
        fat: 55,
        fibre: 35,
      },

      groceryPlanHash: null,

      // ── Actions: Meal Log ────────────────────────
      logMeal: (date, meal) =>
        set((state) => {
          const day = state.mealLog[date] || [];
          return {
            mealLog: {
              ...state.mealLog,
              [date]: [...day, { ...meal, id: Date.now().toString() }],
            },
          };
        }),

      deleteMeal: (date, mealId) =>
        set((state) => ({
          mealLog: {
            ...state.mealLog,
            [date]: (state.mealLog[date] || []).filter((m) => m.id !== mealId),
          },
        })),

      updateMealMacrosFromRecipe: (date, recipeId, macros) =>
        set((state) => ({
          mealLog: {
            ...state.mealLog,
            [date]: (state.mealLog[date] || []).map((m) =>
              m.recipeId === recipeId ? { ...m, ...macros } : m,
            ),
          },
        })),

      // ── Recipes ──────────────────────────────────
      // [ { id, name, servings, calories, protein, carbs, fat, fibre, ingredients: [ { name, amount, unit, calories, protein, carbs, fat, fibre } ], method } ]
      recipes: [],

      // ── Weekly meal plan ─────────────────────────
      // { 'YYYY-WW': { Mon: { Breakfast: recipeId|null, Lunch: recipeId|null, Dinner: recipeId|null, Snack: recipeId|null } } }
      weekPlan: {},

      // ── Grocery list ─────────────────────────────
      groceryList: [],

      // ── Settings ─────────────────────────────────
      weightUnit: 'kg',

      // ── Actions: Targets ─────────────────────────
      setTargets: (targets) => set({ targets }),

      // ── Actions: Meal Log ────────────────────────
      logMeal: (date, meal) =>
        set((state) => {
          const day = state.mealLog[date] || [];
          return {
            mealLog: {
              ...state.mealLog,
              [date]: [...day, { ...meal, id: Date.now().toString() }],
            },
          };
        }),

      deleteMeal: (date, mealId) =>
        set((state) => ({
          mealLog: {
            ...state.mealLog,
            [date]: (state.mealLog[date] || []).filter((m) => m.id !== mealId),
          },
        })),

      // ── Actions: Recipes ─────────────────────────
      addRecipe: (recipe) =>
        set((state) => ({
          recipes: [...state.recipes, { ...recipe, id: Date.now().toString() }],
        })),

      updateRecipe: (id, updates) =>
        set((state) => ({
          recipes: state.recipes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteRecipe: (id) =>
        set((state) => ({
          recipes: state.recipes.filter((r) => r.id !== id),
        })),

      // ── Actions: Week Plan ───────────────────────
      setPlanSlot: (weekKey, day, slot, recipeId, servings) =>
        set((state) => ({
          groceryPlanHash: null,
          weekPlan: {
            ...state.weekPlan,
            [weekKey]: {
              ...state.weekPlan[weekKey],
              [day]: {
                ...(state.weekPlan[weekKey]?.[day] || {}),
                [slot]: { recipeId, servings },
              },
            },
          },
        })),

      clearPlanSlot: (weekKey, day, slot) =>
        set((state) => {
          const week = { ...(state.weekPlan[weekKey] || {}) };
          const d = { ...(week[day] || {}) };
          delete d[slot];
          week[day] = d;
          return { groceryPlanHash: null, weekPlan: { ...state.weekPlan, [weekKey]: week } };
        }),

      setGroceryPlanHash: (hash) => set({ groceryPlanHash: hash }),

      copyWeekPlan: (fromKey, toKey) =>
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            [toKey]: { ...(state.weekPlan[fromKey] || {}) },
          },
        })),

      // ── Actions: Grocery ─────────────────────────
      setGroceryList: (list) => set({ groceryList: list }),

      toggleGroceryItem: (id) =>
        set((state) => ({
          groceryList: state.groceryList.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i,
          ),
        })),

      deleteGroceryItem: (id) =>
        set((state) => ({
          groceryList: state.groceryList.filter((i) => i.id !== id),
        })),

      clearCheckedGrocery: () =>
        set((state) => ({
          groceryList: state.groceryList.filter((i) => !i.checked),
        })),

      // ── Actions: Settings ────────────────────────
      setWeightUnit: (unit) => set({ weightUnit: unit }),

      // ── Reset ────────────────────────────────────
      resetAll: () =>
        set({
          mealLog: {},
          recipes: [],
          weekPlan: {},
          groceryList: [],
          targets: { calories: 1800, protein: 140, carbs: 200, fat: 55, fibre: 35 },
          weightUnit: 'kg',
        }),
    }),
    { name: 'nutritrack_v1' },
  ),
);

export default useStore;
