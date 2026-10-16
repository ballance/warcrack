# Art prompts — The Fen Covenant and The Gloam Choir

Companion to [ART_PROMPTS.md](ART_PROMPTS.md) (the nine characters, complete)
and [ART_PROMPTS_BUILDINGS.md](ART_PROMPTS_BUILDINGS.md) (the eight buildings,
complete). Same workflow: run a prompt, paste the result back into the session,
I redraw the canvas code to match.

## Why this set is different, and shorter than it looks

The two new races do **not** have their own units or buildings. All four claims
field the same soldiers and raise the same plans — what differs is what they
build them *from*, and what they call them. That is already implemented: two
tables in the source, `MATS` for buildings and `UMAT` for units, and every
drawing routine pulls from them.

So for most of this list I am **not** asking for a redesign. I am asking for a
material study: the same shape, in turf and antler, or in obsidian and cold
light. A reference that redesigns the building is less useful than one that
shows me what a turf roof looks like from directly above.

There are four genuine exceptions, where the race really does need its own
design, and they are the ones worth your time first:

1. **The Mirecaller** — the Fen hero. No art exists; currently a recoloured Warden.
2. **The Hollow Cantor** — the Gloam hero. Same.
3. **The Fenhurler** — the Fen siege engine. A different machine, not a repaint.
4. **The Knell Engine** — the Gloam siege engine. Likewise.

Everything after those is optional polish, in the order given at the bottom.

## What transfers

Unchanged from the other two docs, and worth repeating because it decides what
makes a good reference:

I don't trace images — everything is procedural canvas paths. What transfers is
**silhouette, proportion, palette, and where the team colour sits**. What does
not transfer is rendering: gradients, texture, painterly brushwork, and anything
below about four pixels of detail. A crisp flat silhouette on grey beats a
gorgeous painting.

Characters need two views; buildings need one.

| View | Size on screen | Why |
| --- | --- | --- |
| **Map sprite** | ~18–26 px tall | What you look at 99% of the time |
| **Bust** | 76 × 76 px | Command panel portrait, head and shoulders, front-on |
| **Building** | 64 or 96 px square | Top-down orthographic, looking straight down |

## Shared style block

Paste in front of every prompt:

> 2D game art, original dark-fantasy frontier setting. Flat shading with hard
> light from the upper left, limited palette, heavy readable silhouette, thick
> dark rim separating the subject from the ground. Plain neutral grey
> background, nothing cropped, no text, no logo, no watermark, no border, no UI.

Negative prompt:

> photorealistic, soft focus, bloom, lens flare, busy background, text,
> watermark, multiple characters, cropped limbs, extreme foreshortening

Two notes that have cost us output quality every time they were missed:

- **Say the camera angle explicitly, and say it first.** Models default to
  eye-level hero shots for characters and three-quarter isometric for buildings.
  Both are useless for a top-down game.
- **Don't name an existing game or franchise.** It collapses the result toward
  that style and you stop getting anything specific to Emberfall.

## The two claims

| | Primary | Dark | Light | Builds from |
| --- | --- | --- | --- | --- |
| **The Fen Covenant** | `#8ad24a` | `#2d4a12` | `#d8f0a4` | living turf over drystone, antler trim |
| **The Gloam Choir** | `#c77ae0` | `#45185a` | `#eec9f7` | obsidian and cold light, no timber at all |

For contrast, the two that already exist: the Accord build in squared timber,
shingle and ember-brick; the Thornkin in dark red heartwood under thorn, bone
and horn.

**The Fen Covenant.** Low, sunken, and older than the road. Turf roofs grown
over drystone walls, antler used where other claims use iron, reed bundles,
peat, standing water. Everything is a little sunk into the ground. Palette in
code: drystone `#8f9185` / `#73766b`, turf `#355a30` / `#4a7a3e`, antler
`#ded6bc`, reed `#6f7f42`.

**The Gloam Choir.** Nobody saw them arrive; by morning the glass was lit. Black
obsidian slabs and plates, no timber anywhere, cold blue-white light leaking
from every seam and joint. Sharp, straight, silent. Palette in code: obsidian
`#3a3150` / `#2a2439` / `#1b1726`, cold light `#bfe4ff`.

**One rule that matters more than any other here:** the Fen are a green faction
on a green map. Their turf has to be *darker and bluer* than grass or the
building disappears into the field it stands in. If a reference comes back with
bright spring-green turf I will have to darken it anyway.

---

# A. The two heroes — do these first

## A1. The Mirecaller — Fen Covenant hero

Replaces nothing: there is no art for this character at all. Must not read as
the Accord's Warden (an armoured knight with a blue plume) or the Thornkin's
Briarmother. Ten levels, four abilities, carries relics — the most looked-at
single figure on the player's side when it is their race.

**Map sprite**

> Full-body character, seen from a steep overhead three-quarter angle looking
> down, standing on flat ground. A tall stooped figure in layered reed and hide
> robes, caked to the knee in peat, wearing a crown of forked antler. Carries a
> long fen-pole in one hand and a cord of river stones and bone hooks in the
> other. Hood down, weathered face. Muted bog palette — wet green, drystone
> grey, pale antler — with one clear band of bright moss green at the waist.

**Bust**

> Head-and-shoulders portrait, front-on, eye level, centred, plain dark
> background. A gaunt weathered face under a forked antler crown, hair matted,
> collar of overlapping reed and hide. Pale antler and bog-green palette, one
> band of bright moss green on the collar.

**What I most need:** the antler crown silhouette. That is the whole character
at 20px — the Warden has a plume, the Briarmother has briar, this one has
forks. I want to know how wide, how many points, and whether it reads from
directly above.

## A2. The Hollow Cantor — Gloam Choir hero

A choir-leader for a claim made of glass and cold light. Should feel still and
upright where the Mirecaller is stooped, and lit from inside.

**Map sprite**

> Full-body character, seen from a steep overhead three-quarter angle looking
> down, standing on flat ground. A tall, straight, unnaturally still figure in a
> long mantle of overlapping black obsidian scales. Smooth pale mask with no
> mouth and no eyes. One hand holds a slender shard of dark glass like a staff,
> the other a small hand-bell. Cold blue-white light leaks from the seams of the
> mantle and from under the hood. Near-black palette with pale violet accents.

**Bust**

> Head-and-shoulders portrait, front-on, eye level, centred, plain dark
> background. A smooth featureless pale mask inside a deep hood, collar of
> overlapping black glass plates, thin seams of cold blue-white light running
> between them. Near-black and pale violet palette.

**What I most need:** where the light sits. The glow is the only thing that will
read at 20px, so I need to know whether it runs down the seams, pools at the
hood, or outlines the whole figure — and how much of it there should be before
it stops looking like a lamp.

---

# B. The two siege engines — do these second

Both are machines, which means they survive being seen from any angle and are
worth a proper reference. The Accord's Siege Cart is a wheeled torsion catapult
with rope skeins and a stone in a ring cup; the Thornkin's Bramble Hurler is the
same frame in thorn. These two should be neither.

## B1. The Fenhurler — Fen Covenant

> Top-down three-quarter view of a fantasy siege machine built for wet ground:
> a low sled on wide flat skids instead of wheels so it does not sink, drystone
> counterweight in a rope net, a throwing arm of lashed bog-oak, antler
> brackets, a sling cup of woven reed holding a peat-bound stone. Mud-caked,
> heavy, slow.

**What I most need:** the skids. Wheels are what every siege engine has; wide
flat runners would say *fen* instantly, and would separate it from the Accord's
cart at map scale where the throwing arm looks the same on both.

## B2. The Knell Engine — Gloam Choir

> Top-down three-quarter view of a fantasy siege machine built around a great
> cracked bell: a black glass frame carrying a huge dark bell on a yoke, struck
> rather than drawn, shards of obsidian stacked in a cradle beside it, cold
> blue-white light in the cracks of the bell. No rope, no timber, no wheels —
> it stands on four glass legs. Silent, heavy, wrong.

**What I most need:** whether the bell reads as a bell from directly above. From
overhead a bell is a circle, which is also what a wheel and a drum are. If it
does not read, the yoke and the crack are what will have to carry it.

---

# C. Units — material studies, one prompt per race

These four share a silhouette with the Accord units that already exist. I am
only after cloth, trim and what is fixed to the helmet. **One reference showing
all four of a race together is more useful than four separate ones**, because
what matters is that they look like one army.

## C1. Fen Covenant soldiery

> Four fantasy foot soldiers of one faction standing in a row, full body, seen
> from a steep overhead three-quarter angle: a peat-digger with a turf-cutting
> spade, a spearman with a round drystone-grey shield, an archer with a reed
> bow, and a standard bearer. All in bog-green quilted cloth under grey hide,
> antler fittings instead of iron, forked antler prongs on every helmet, bare
> muddy legs. One bright moss-green band on each figure.

## C2. Gloam Choir soldiery

> Four fantasy foot soldiers of one faction standing in a row, full body, seen
> from a steep overhead three-quarter angle: a gleaner with a glass sickle, a
> warden with a slab shield of black glass, an archer with a shard-bow, and a
> bell-bearer. All in deep violet cloth under black obsidian plate, a single
> upright glass shard on every helmet, thin seams of cold blue-white light. One
> bright violet band on each figure.

**What I most need from both:** the helmet. At twenty pixels the crest is the
only thing that tells four armies apart once the team colour is lost in a melee.
Accord have a finial, Thornkin have horns; these have antler prongs and a glass
shard, and I want to know if that is enough.

---

# D. Buildings — material studies

Already implemented in `MATS`, so these are refinements rather than designs. All
are **top-down orthographic, looking straight down**, on plain grey, nothing
cropped. Footprints: Farm and Tower 2×2 (64 px), Barracks / Workshop / Altar /
Blacksmith 3×3 (96 px), Town Hall and Keep 4×4 (128 px).

## D1. Fenmoot — Fen Town Hall (4×4, highest value)

> Top-down orthographic view looking straight down at a low fantasy moot-hall
> sunk into wet ground: a long turf roof grown thick with grass and moss over
> drystone walls, a ridge of pale antler running the length of it, a stone
> chimney, a wide stepped entrance of flat slabs, and a working yard of boarded
> walkways over standing water with stacked peat bricks and cut reed.

## D2. Gloamvault — Gloam Town Hall (4×4, highest value)

> Top-down orthographic view looking straight down at a fantasy hall of black
> glass: overlapping obsidian slabs laid like scales, a seam of cold blue-white
> light running the length of the ridge, no timber anywhere, a sunken entrance
> court of polished black stone, and a yard of stacked glass shards and pale
> cold lanterns.

## D3. Antler Cairn — Fen Altar (3×3)

The Accord's Altar is a round tiered dais with a fire bowl. The Fen version
should be the same roundness in a different material.

> Top-down orthographic view looking straight down at a low fantasy shrine: a
> round raised mound of turf ringed by drystone kerbs, a ring of forked antlers
> set upright around the rim, a shallow pool of black water at the centre
> instead of a fire, bog cotton and reed around the edge. Solemn, waterlogged,
> ancient.

## D4. Choirstone — Gloam Altar (3×3)

> Top-down orthographic view looking straight down at a fantasy shrine of black
> glass: a round dais of polished obsidian, a ring of tall thin glass shards set
> upright around the rim like standing stones, and a single shaft of cold
> blue-white light rising from a dark well at the centre instead of a flame.
> Still, silent, lit from below.

## D5. Mirewatch — Fen Guard Tower (2×2)

> Top-down orthographic view looking straight down at a squat fantasy
> watchtower of drystone sunk in wet ground, open at the top, a turf-covered
> parapet with gaps, a plank deck inside around a dark hatch, forked antlers
> fixed at the four corners, reed bundles stacked against one side.

## D6. Shard Spire — Gloam Guard Tower (2×2)

> Top-down orthographic view looking straight down at a fantasy watchtower of
> black glass, open at the top: a parapet of upright obsidian shards of uneven
> height, a dark interior with a glowing cold-white core, thin seams of light
> running down the outside, four tall shards at the corners.

## D7. Reed Croft and Pale Croft — the two Farms (2×2)

Eight of these are on screen at once, so they must stay quiet.

> **Fen:** Top-down orthographic view of a small fantasy farmstead in wet
> ground: a low turf-roofed longhouse on drystone footings, a fenced plot of
> dark peat in flooded rows with reed and bog crops, a stack of cut peat bricks,
> a water trough. Humble, waterlogged, weathered.

> **Gloam:** Top-down orthographic view of a small fantasy farmstead of black
> glass: a low obsidian-roofed longhouse, a fenced plot of grey ash in tidy
> rows growing pale colourless crops, a stack of glass shards, a dark trough.
> Humble, cold, bloodless.

## D8. The remaining four, if you have the appetite

Barracks (Sedge Lodge / Chant Hall), Workshop (Peatworks / Glassworks),
Blacksmith (Peatforge / Glassforge) and Keep (Great Fenmoot / Great Gloamvault)
are all handled by the material tables and read correctly already. I would only
want references for these if one of them looks wrong to you in play — in which
case tell me which and what about it, and I will write the prompt then rather
than guessing now.

---

# If you'd rather direct in words

Same three questions as the other two docs, per subject:

1. **Silhouette.** What should I recognise it by from across the map, with no
   colour at all?
2. **One wrong thing.** The worst-reading detail right now.
3. **One missing thing.** The detail that would say which claim built it.

# Suggested order

1. **The Mirecaller** and **The Hollow Cantor** — two brand-new named
   characters with no art of their own. Biggest gap by a distance.
2. **The Fenhurler** and **The Knell Engine** — genuinely different machines,
   and currently just recoloured Siege Carts.
3. **The two soldiery line-ups** (C1, C2) — one image each covers four units.
4. **Fenmoot** and **Gloamvault** — the biggest buildings on the map.
5. **Antler Cairn** and **Choirstone** — the two with the most character.
6. Everything else, only if it looks wrong in play.

# How these get reviewed

As with the buildings, there is no browser in the loop, so art is checked by
rendering it and looking:

    node tools/art_record.js <type|bust:type> <owner 0-3> [anim] out.json
    python3 tools/art_replay.py out.json out.png

Owner picks the race: 0 Accord, 1 Thornkin, 2 Fen, 3 Gloam. Render at true size
as well as zoomed — the Fen chimney and the Blacksmith's anvil both looked
finished at 4× and fell apart at 1×. For the Fen especially, render the building
against the map's own grass, because *not vanishing into the field* is half that
race's problem.
