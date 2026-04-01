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
- [x] Recipe search bar in recipes list
- [x] Macro range filters — min/max per macro, filter count badge, clear all
- [x] Recipe detail — portions adjuster scales macros and ingredient amounts live
- [x] Planner slot — portions adjuster in recipe picker, defaults to base portions
- [x] Edit portions on assigned plan slot via ✎ icon
- [x] Grocery list hash tracking — detects plan changes since last generation
- [x] Generate button — 4 states: ready, already generated, plan changed, no plan
- [x] Regenerate preserves manually added items
- [x] Checked grocery items stay in list until manually deleted
- [x] Grocery categories moved to src/data/groceryCategories.js
- [x] Copy a single day's meals to another day — pick source day, pick target day
- [x] Meal prep planning with 3/4 day presets

---

## v1.5 — Progress Improvements

- [x] Longest logging streak
- [x] Weekly average trend across multiple weeks (not just current week)
- [x] Best macro day — day you hit closest to all targets simultaneously
- [x] Copy yesterday's log to today

---

## v1.6 — Food Database

- [x] Open Food Facts API search on add meal and add ingredient forms
- [x] USDA FoodData Central as fallback
- [x] Barcode scanner via Capacitor camera
- [x] Cache recent lookups locally

## v1.7 - Android Build

- [x] Build and deploy to S23 for testing
- [x] Safe area insets — inject CSS variables from MainActivity.java (--sat, --sab) matching FitTrack approach
- [x] Haptic feedback — on meal log, recipe save, grocery item tick
- [x] Keep screen awake — prevent screen sleeping on Log and Planner views
- [x] Android back button — handle via @capacitor/app, navigate within app not exit
- [ ] Fix any Android-specific layout issues

## v1.7.1 — Food Database Stability

- [ ] OFF proxy (Render free tier) is unreliable — randomly drops requests when warm
- [ ] Test Capacitor.isNativePlatform() branch — direct OFF API call on Android, proxy in browser
- [ ] If direct Android call works, remove proxy dependency entirely
- [ ] If not, investigate upgrading Render or self-hosting proxy

## V1.8.1 Quick Fixes & Polish

XS
- [ ] Remove visible scrollbar on the right when scrolling (hide via CSS)
- [ ] Remove the calendar element from the header
- [ ] Decrease the size of the settings icon
- [ ] Progress view — remove Current Streak and Longest Streak
- [ ] Progress view — reorder sections: Today's Macros → This Week → Calorie Trend → Best Macro Day
- [ ] Remove the timestamp from logged food entries — the time does not need to be displayed
- [ ] Recipe macro values in the log — display to 1 decimal place for accuracy
- [ ] Log view — display grams if the entry is a single food item, or number of portions if the entry is a recipe

S
- [ ] Log meal modal — move Meal Name, Search Recipes and Search Foods inputs above the meal type buttons
- [ ] Log meal modal — Log Meal and Cancel buttons should always be visible and sit next to each other
- [S] Rename "Log a Meal" to "Quick Log" to communicate that planning the week and adding to the log from the planner is the primary intended workflow
- [ ] Planner — Week Plan, Recipes and Grocery tabs should remain visible no matter how far the user scrolls (sticky)
- [ ] Planner — Weeks action button should always be visible no matter where the user scrolls (sticky)

---

## V1.8.2 Bug Fixes

S
- [ ] When navigating to a previous day the user cannot get back to the current day — fix forward navigation
- [ ] Log meal cancel button is partially hidden by Android navigation controls at the bottom — apply correct safe area insets

M
- [ ] Grocery list — Generate grocery list not working in current app version — investigate and fix

---

## v1.8.3 UX Improvements

S
- [ ] Slider sheets — should be draggable down to dismiss
- [ ] Grocery list — add haptic feedback when marking off food items
- [ ] Meal type auto-detection — when logging a food, automatically assign Breakfast, Lunch or Dinner based on the time of day. Snack, Pre-workout and Post-workout remain manual tags the user selects themselves.

M
- [ ] Log meal — convert from a slider/sheet into its own dedicated full screen window
- [ ] Log meal screen — add two additional action buttons alongside the standard log: "Add from planner" (auto-populates today's planned meals) and "Remove all meals" (clears the day's log with a confirmation prompt)
- [ ] Planner — each day in the week view takes too much space, collapse days by default with an expand toggle, or reduce card size significantly
- [ ] Planner — holding down on a recipe card reveals Edit, Duplicate and Delete options. Move duplicate and delete off the main recipe view entirely. Delete requires a confirmation prompt.
- [ ] Planner — "Add recipe to slot" — if there are many recipes, open a dedicated full screen recipe picker rather than an inline list, then return to the week day screen on selection
- [ ] Planner — copying a day of food should allow selecting multiple destination days at once
- [ ] Planner — when viewing a different week, holding a card should not show "Log today's plan"
- [ ] Planner — allow whole foods to be added to week plan days as well as recipes, not just recipes only
- [ ] Planner — week actions should include a "Copy different week to current week" option as well as the existing copy to next week
- [ ] Planner — instead of week actions only adding today's food to the log, add the ability to add the whole week's plan to the log at once. Each logged item shows a tick the user must check to confirm they actually consumed it.
- [ ] Recipe screen — remove the portion controller and Log as Meal button from the recipe detail view. Logging should only happen from the log screen. Portions are controlled at log time. Recipe screen simplifies to just the recipe content plus Edit on hold tap.

---

## v1.8.4 Nav Refactor 

L
- [ ] Move Log, Planner and Progress from current position to a persistent bottom navigation bar, consistent with the FitTrack nav refactor. Do on its own branch.

---

## v1.8.5 New Feature — TDEE / BMI / Weight Loss Calculator 

L
- [ ] Dedicated view (accessible from nav or settings) containing:
  - BMI calculator — height and weight inputs, result with category label
  - TDEE calculator — age, height, weight, activity level inputs
  - Weight loss planner — slider to set target weekly loss (e.g. 0.25kg to 1kg per week), outputs adjusted daily calorie target
  - Results feed back into NutriTrack daily calorie and macro targets automatically

---

## v1.8.6 Complex / New Features

L
- [ ] Haptics — extend haptic feedback beyond grocery list to other key interactions (logging a meal, completing a day, hitting macro targets)

- [ ] Recipe Import with Auto Nutritional Lookup
Allow the user to import recipes by pasting a recipe name or ingredient list. The app attempts to automatically match each ingredient against the USDA and Open Food Facts APIs to retrieve nutritional data. For any ingredient it cannot match confidently, the user is presented with a manual resolution screen where they can search for the correct item or enter values by hand. Once all ingredients are resolved the recipe is saved to the library with full macro data intact, exactly as if it had been built manually.

- [ ] Hello Fresh API integration — pull Hello Fresh meal data and nutritional information directly into NutriTrack. Particularly useful for users who cook Hello Fresh meals regularly and want accurate logging without manual entry.
- [ ] Recipe photos — allow the user to add a photo to a recipe either taken with the camera or chosen from the gallery. Useful for visual identification and for sharing recipes in future social features. Requires Capacitor camera plugin.

XL
- [ ] Barcode scanning — integrate Capacitor camera plugin with Open Food Facts barcode lookup for fast packaged food logging

---

## Future

- Signed APK for Play Store
- Play Store listing — screenshots, description, privacy policy
- Splash screen — branded splash screen replacing Capacitor default
- App icon — create NutriTrack branded icon (orange accent, matching FitTrack style)
- Export weekly log as branded PDF (jspdf)
- Export meal log as CSV
- Meal templates — save a frequently eaten meal without it being a full recipe
- Quick-add from recent meals — last 10 meals accessible in one tap
- FitTrack integration — training day type adjusts daily calorie target
- BodyTrack integration — flag muscle loss risk if deficit too aggressive
- On-device AI meal suggestions
- Push notifications — meal reminders, streak nudges
- Health Connect integration — passive data from Samsung Health
- Additional food database sources for richer search results:
  - Nutritionix API — comprehensive branded and whole food database
  - Edamam — strong on recipes and branded foods
  - Open Food Facts native Android SDK — more reliable than server-side requests
  - Barcode scanner via Capacitor camera — scan packaged foods directly
Social features for recipe sharing, meal inspiration and accountability between users