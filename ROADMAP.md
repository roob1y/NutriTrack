# NutriTrack Roadmap

## Vision

Vegan-first nutrition tracking built for one person's specific needs.
1800 kcal/day target. No presets, no generic meal libraries — free entry
of real meals with full macro breakdown. Tightly integrated with the
rest of the health ecosystem.

---

## Status

| Version | Description              | Status         |
|---------|--------------------------|----------------|
| v1.0    | Foundation               | ✓ Complete     |
| v1.1    | Recipes + Meal Plan      | Planned        |
| v1.2    | Grocery list generator   | Planned        |
| v1.3    | Export + history         | Planned        |
| v1.4    | Food database (OFDC)     | Planned        |

---

## v1.0 — Foundation ✓

- Daily meal log with free-entry meals
- Calorie ring + macro progress bars (protein, carbs, fat, fibre)
- Date navigation — log any past day
- Weekly progress view — bar chart + avg stats
- Daily targets editor (calories, protein, carbs, fat, fibre)
- Data persisted via Zustand + localStorage
- NutriTrack design system (orange accent `#ff8c42`)
- Capacitor ready for Android

---

## v1.1 — Recipes + Meal Plan

- Recipe storage — name, ingredients, method, auto-calculated macros
- Log a recipe directly as a meal (applies full macro breakdown)
- Weekly meal plan builder — drag meals/recipes to days/slots
- Slot types: Breakfast, Lunch, Dinner, Snack

---

## v1.2 — Grocery List

- Auto-generate grocery list from weekly meal plan
- Aggregates ingredients across all planned meals
- Check off items as you shop
- Manual add/remove items
- Clear checked items

---

## v1.3 — Export + History

- Export meal log as CSV or branded PDF
- History view — browse any past week
- Streak tracking — days logged consecutively
- Weekly summary email-style report

---

## v1.4 — Food Database

- Open Food Facts integration — search by barcode or name
- USDA FoodData Central as fallback
- Auto-fill macros from database on meal entry
- Cache recent lookups locally

---

## Future

- Integration with FitTrack — training day type adjusts calorie target
- Integration with BodyTrack — flag muscle loss risk if deficit too aggressive
- On-device AI meal suggestions
