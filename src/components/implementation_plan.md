# Implementation Plan: Exact Editorial Moodboard Collage (from Video Reference)

Recreate the exact 2D animated editorial moodboard collage shown in the user's screen recording video (`reference.mp4`), featuring the identical set of graphic cards, olive/cream/dark color palette, typography, visual motifs, and continuous choreographed movement.

## 1. Faithful 1:1 Video Match
Exact cards identified from `reference.mp4`:
1. "THU / 0316 AVE" (x2): Meadow/flower field background, white "THU" top and green "0316 AVE" bottom.
2. "2026 / NOV" (x2): Olive-green frame with centered photo and white "2026" / "NOV" text.
3. "NATURAL / FRESH": Pitch dark card with bold stacked white text.
4. "12K contributor _worldwide_": Meadow photo with massive "12K".
5. "Maple Street is a lovely avenue with lush trees": Off-white card with paragraph text.
6. "ULTIMATE / TASTE": Cream card with green scallop arch pattern.
7. "Scallop / Arch Pattern": Olive card with repeating cream interlocking arches.
8. "MADRID BARCELONA SEVILLA": Dark card with city list.
9. "0034 - 0095": Narrow light-cream numeric column card.
10. "north ave": Light sage card with foliage photo inset and lowercase title.
11. "Checkered Face Portrait": Dark card with person and geometric checkerboard mask.
12. "Blurred Portrait" & "Botanical Stem": Accent cards.

## 2. 8-Second Choreographed Movement Loop
- Phase 1: "THU / 0316 AVE" centered; "MADRID" and "Maple Street" framing.
- Phase 2: Olive "2026 NOV" glides to the center; "NATURAL FRESH" slides in from the left.
- Phase 3: "NATURAL FRESH" commands the center foreground; "12K" surfaces on the left.
- Phase 4: "12K contributor _worldwide_" dominates the center-left; "ULTIMATE TASTE" frames the left.
- Continuous loop.

## 3. Files to Update
- `src/data/collageCardsData.js`: Exact cards and 4 continuous choreography keyframe states.
- `src/components/AnimatedCardCollage.jsx`: Render exact card graphics and drive animation loop.
- `src/components/AnimatedCardCollage.css`: Exact colors, fonts, shadows, and arch SVG patterns.
