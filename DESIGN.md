# DESIGN: Fix It!

# Theme: Machines

# Concept

A casual arcade game where broken contraptions roll down a conveyor belt. Players spot faults, tap to inspect, and complete quick minigames to repair them before they slide off the edge. Starts simple - pump a bike tire, screw in a light bulb - then ramps up with multi-fault machines and faster belt speeds. 10 lives, one lost per unfixed fault.

# Core Loop

1. Item spawns on the right edge of the conveyor belt
2. Belt carries it left at the starting speed
3. Faults are visually indicated (sparks, wobble, glow, icon, etc)
4. Player taps a fault to open its minigame
5. Player completes the minigame to fix that fault
6. If all faults on an item are fixed, the item is "repaired" - score awarded, visually changes to be "perfect" and item naturally leaves
7. If the item reaches the left edge with unfixed faults, each unfixed fault costs one life
8. Next item is already on its way - later in the run, multiple items are on the screen at once

## Items

### Tier 1 - Single-fault (early game)

Simple, instantly readable. One item = one fault = one minigame.

- Flat tire bicycle        - pump (inflate) minigame
- Unplugged toaster         - drag-to-slot (connect) minigame
- Loose bolt on a pipe     - spin (tighten) minigame
- Dead lightbulb in a lamp - swipe (replace) minigame
- Switched-off generator   - tap (multi) minigame

### Tier 2 - Composite, single-fault (mid game)

Items that look more complex but still have one fault. Teaches players to scan entire object.

- Workbench with a broken lamp on it - swipe (replace) minigame
- Control panel with one gauge red   - tap (timing) minigame

### Tier 3 - Composite, multi-fault (late game)

Multiple faults on one item. Player must fix all before it exits.

- Robot arm
    - loose bolt      - spin (tighten) minigame
    - frayed wire     - wire (replace) minigame
    - misaligned gear - spin (align) minigame
- Vending machine
    - unplugged       - drag-to-slot (connect) minigame
    - bad wiring      - wire (reconnect) minigame
    - cracked display - swipe (replace) minigame

## Minigames

Each minigame should be completable in 2-4 seconds and require no tutorial.

| Category | Name | Input | Description |
| -------- | ---- | ----- | ----------- |
| Spin     | Tighten | Clockwise circular drag     | Rotate finger/mouse in a circle until tightened |
| Spin     | Align   | Alignment via circular drag | Rotate finger/mouse in a circle until aligned   |
| Pump     | Inflate | Drag up and down repeatedly | Inflate item via a pumping action |
| Drag-to-slot | Connect | Drag part to highlighted socket | Drag the looser part to the correct socket |
| Swipe | Replace | Swipe the old part away, swipe new part in | Flick out broken part, swipe replacement in |
| Tap | Multi | Tap multiple buttons | Tap multiple buttons on the screen |
| Tap | Timing | Tap at the right time | Tap when the display is correctly shown |
| Wire | Replace | Tap, then drag and connect point A to B | Tap to cut out old piece, then wire in new connection |
| Wire | Reconnect | Drag one or many wires to connect | Connect one to many wires based upon colour/shape |

Start the game with 3-4 minigame types available, then gradually add new types as tiers progress.

## Difficulty Curve

| Time      | Belt Speed | Items on Screen | Max Faults/Item | Minigame Types Available |
| --------- | ---------- | --------------- | --------------- | ------------------------ |
| 0:00-0:45 | Slow       | 1               | 1               | 3-4                      |
| 0:45-1:30 | Medium     | 1-2             | 1               | 5-6                      |
| 1:30-3:00 | Fast       | 2-3             | 2               | All                      |
| 3:00+     | Very fast  | 3+              | 2-3             | All, shorter minigame windows for some |

Additional pressure: minigame completion windows may shrink in the late game. (Pipe exploding, lightbulb dropping, etc)

## Scoring

| Description | Points |
| ----------- | ------ |
| Points per fault failed | -80  |
| Points per fault missed | -100 |
| Points per fault fixed  | 100  |
| Fault is fixed while the item is still in the right half of the screen | +50 |
| Fixing consecutive faults without a miss multiplies score | 3+ 2x, 5+ 3x, 7+ 4x, 10+ 5x |
| Combo resets on any fault missed | x1 |
| Fixing all faults on a multi-fault item | +50 |

Final score is sent to YouTube Playables.

## Lives

- Start with 10 lives
- Lose 1 life per unfixed fault
- A 3-fault item sliding off = -3 lives
- No life recovery
- At 0 lives -> game over screen (score, stats, restart, menu)
- Lives displayed as electric icons at top of screen

# UI/Layout

The layout must adapt to all aspect ratios (Playables requirement)

- Conveyor belt runs horizontally across the the bottom of the screen
- HUD at top: Lives across center
- Minigame overlay pops up over the item when tapped - semi-transparent backdrop, minigame centered, visual indicator of time left in minigame
- Portrait mode: belt is shorter, items might be slightly smaller
- Landscape mode: belt is longer, items might be slightly larger
- No UI elements in screen corners
- All interactions must work on both touch and mouse
- Game state must persist through viewport resize

# Scenes

- Boot - load YouTube Playables SDK data, set up pause/resume handlers
- Preloader - load all assets, call `firstFrameReady()`, show loading bar
- MainMenu - title screen, play button, high score display, call `gameReady()`
- Game - actual gameplay: conveyor belt, item spawning, minigames, HUD
- GameOver - final score, high score statistics, play again button, `sendScore()`, `saveData()`

# Art Style

- Clean, simple, cartoonish, slightly industrial
- Bold outlines on items
- Faults CLEARLY indicated: red glow, sparking particles, wobbling animation, indicator icons.
- Conveyor belt has a repeating simple texture that scrolls to show movement
- Simple factory backdrop, not distracting

# Audio

- Relaxed, upbeat, mechanical/industrial, loopable, extremely light to not get annoying if playing for long periods
- SFX per minigame type: dynamic interactive action sounds
- Fault indicator sound when item arrives with faults, and when a fault is on screen
- Life-lost sound
- Combo sound effect, escalating with multiplier
- Game over sound
