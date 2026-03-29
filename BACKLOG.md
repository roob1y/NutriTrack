# NutriTrack Backlog

## v1.0 — Foundation ✓ Complete

- [x] Daily meal log with free-entry meals
- [x] Calorie ring and macro progress bars
- [x] Date navigator — log any past day
- [x] Weekly progress view — bar chart and avg stats
- [x] Daily targets editor via settings bottom sheet
- [x] 3-tab nav (Log, Planner, Progress) with Settings in header
- [x] Week plan — Mon–Sun, 4 slots per day (Breakfast/Lunch/Dinner/Snack)
- [x] Week navigator — browse past and future weeks
- [x] Recipe library — add/edit/delete with structured ingredients
- [x] Macro auto-sum from ingredients on recipe form
- [x] Recipe detail view with method and full macro breakdown
- [x] Log recipe as meal from recipe detail
- [x] Recipe picker sheet when assigning to plan slots
- [x] Zustand persistence via localStorage
- [x] Capacitor config for Android

---

## v1.1 — Plan-driven Log ✓ Complete

- [x] Today's planned meals shown as suggestions at top of Log tab
- [x] Tap to instantly log with macros pre-filled
- [x] Disappears from suggestions once logged
- [x] Always visible — empty state if nothing planned today
- [x] Add meal sheet — Free entry / From recipe toggle
- [x] From recipe mode — pick recipe, change meal type only, no macro editing
- [x] Recipe cards show kcal label under calorie number
- [x] recipeId stored on log entries from recipes
- [x] Edit recipe — confirms whether to update today's log if recipe was logged today
- [x] Fix recipe picker empty state copy in Planner

---

## v1.2 — Bug Fixes

- [x] Progress view weekly calorie bar chart not displaying correctly

---

## v1.3 — Grocery List

- [x] GroceryView — accessible from Planner tab
- [x] Auto-generate list from current week plan (aggregate all recipe ingredients)
- [x] Manual add items
- [x] Tick off items as you shop
- [x] Clear all checked items
- [x] Organise by category (produce, tins, grains etc)

---

## v1.4 — Planner Improvements

- [x] Day calorie total on each plan day — shows under/over vs target
- [x] Duplicate a recipe
- [x] Copy this week's plan to next week — warns if next week already has meals
- [x] Log today's plan in one tap via week actions menu
- [x] Jump to current week via week actions menu
- [ ] Copy a single day's meals to another day — pick source day, pick target day
- [ ] Search and filter recipes by macro targets (e.g. high protein)
- [ ] Scale a recipe by servings — adjusts all ingredient amounts and macros proportionally
- [ ] Meal prep planning with 3/4 day presets

---

## v1.5 — Progress Improvements

- [ ] Longest logging streak
- [ ] Weekly average trend across multiple weeks (not just current week)
- [ ] Best macro day — day you hit closest to all targets simultaneously
- [ ] Copy yesterday's log to today

---

## v1.6 — Food Database

- [ ] Open Food Facts API search on add meal and add ingredient forms
- [ ] USDA FoodData Central as fallback
- [ ] Barcode scanner via Capacitor camera
- [ ] Cache recent lookups locally

---

## Future

- [ ] Export weekly log as branded PDF (jspdf)
- [ ] Export meal log as CSV
- [ ] Meal templates — save a frequently eaten meal without it being a full recipe
- [ ] Quick-add from recent meals — last 10 meals accessible in one tap
- [ ] FitTrack integration — training day type adjusts daily calorie target
- [ ] BodyTrack integration — flag muscle loss risk if deficit too aggressive
- [ ] On-device AI meal suggestions
