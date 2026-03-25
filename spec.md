# FitTrack Pro — UI & Feature Upgrade

## Current State
A web-based fitness tracking app with:
- 5 pages: Dashboard, Workout, Plans, Progress, Profile
- Dark purple/blue color scheme
- Exercise list with 10 exercises across muscle groups
- Workout session logging with sets/reps/weight
- Calendar view, streak tracking, weight history chart
- Internet Identity authentication
- Pre-built plans: beginner, intermediate, advanced

## Requested Changes (Diff)

### Add
- Black + red color scheme (replace purple/blue primary with red)
- Daily challenge card on Dashboard: rotating full workout challenge with multiple exercises (seeded by day-of-year, client-side)
- Motivational quotes section on Dashboard (rotating daily quote)
- Calories burned estimate on workout log completion (based on exercise count × set count × estimated MET)
- Exercise detail view with step-by-step instructions (Step 1: Starting Position, Step 2: Movement, Step 3: Breathing), sets/reps recommendations, and rest timer placeholder
- Beginner/intermediate/advanced difficulty filter on workout and exercise screens
- Animation/video placeholder on exercise detail screen
- Weekly calories burned estimate on Progress page

### Modify
- index.css: Change primary color from purple (264 hue) to red (25 hue), update all glow/gradient utilities to match red theme
- Dashboard: Add daily challenge card and motivational quote below welcome section
- Workout page: Add exercise detail sheet/modal when tapping an exercise, showing full steps and rest timer
- Plans page: Improve difficulty badges and plan cards visual design
- Progress page: Add estimated weekly calories burned card

### Remove
- Nothing removed

## Implementation Plan
1. Update index.css primary color from purple to red (oklch hue 25)
2. Add motivational quotes array (client-side, 30+ quotes) to Dashboard
3. Add daily challenge logic (pick exercises by day-of-year seeding) to Dashboard
4. Update Workout page with exercise detail Sheet showing instructions, sets, rest timer
5. Add calorie estimation utility (exercises × sets × MET factor)
6. Add difficulty filter to Workout and Plans pages
7. Add calories card to Progress page
8. Polish all pages for black + red aesthetic
