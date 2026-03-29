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

## v1.1 — Plan-driven Log

- [ ] Today's planned meals shown as suggestions at top of Log tab
  - Pulled from the week plan for today's date
  - Tap to instantly log with macros pre-filled
  - Disappears from suggestions once logged
  - Always visible — empty state if nothing planned today
- [ ] Log a recipe directly from the Log tab (not just from recipe detail)
- [ ] Quick-add from recent meals — last 10 meals accessible in one tap

---

## v1.2 — Grocery List

- [ ] GroceryView — accessible from Planner tab
- [ ] Auto-generate list from current week plan (aggregate all recipe ingredients)
- [ ] Manual add items
- [ ] Tick off items as you shop
- [ ] Clear all checked items
- [ ] Organise by category (produce, tins, grains etc)

---

## v1.3 — Planner Improvements

- [ ] Day calorie total on each plan day — shows under/over vs target
- [ ] Copy this week's plan to next week
- [ ] "Log today's plan" — one tap logs all planned meals for today
- [ ] Duplicate a recipe
- [ ] Scale a recipe by servings — adjusts all ingredient amounts and macros proportionally
- [ ] Search and filter recipes by macro targets (e.g. high protein)

---

## v1.4 — Progress Improvements

- [ ] Longest logging streak
- [ ] Weekly average trend across multiple weeks (not just current week)
- [ ] Best macro day — day you hit closest to all targets simultaneously
- [ ] Copy yesterday's log to today

---

## v1.5 — Food Database

- [ ] Open Food Facts API search on add meal and add ingredient forms
- [ ] USDA FoodData Central as fallback
- [ ] Barcode scanner via Capacitor camera
- [ ] Cache recent lookups locally

---

## Future

- [ ] Export weekly log as branded PDF (jspdf)
- [ ] Export meal log as CSV
- [ ] Meal templates — save a frequently eaten meal without it being a full recipe
- [ ] FitTrack integration — training day type adjusts daily calorie target
- [ ] BodyTrack integration — flag muscle loss risk if deficit too aggressive
- [ ] On-device AI meal suggestions
