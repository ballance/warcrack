# Building art prompts

Companion to [ART_PROMPTS.md](ART_PROMPTS.md), which covers the nine characters
and is complete. Same workflow: run a prompt, paste the result back into the
session, I redraw the canvas code to match.

## How buildings differ from characters

Three things change, and they change what makes a useful reference.

**One view, not two.** Characters needed a map sprite *and* a portrait bust,
because a 20px sprite scaled up looks like nothing. Buildings are drawn once and
that same drawing is scaled down into the command panel. So I need **one
top-down reference** per building. A three-quarter view is welcome as a *second*
image if the form is hard to read from above, but the overhead one is what gets
implemented.

**They are big.** A unit is ~20px tall. Buildings are three to six times that:

| Footprint | Pixels | Buildings |
| --- | --- | --- |
| 2×2 tiles | 64 × 64 | Farm, Guard Tower |
| 3×3 tiles | 96 × 96 | Barracks, Workshop, Altar, Blacksmith |
| 4×4 tiles | 128 × 128 | Town Hall, Keep |

At 96px, detail that was wasted on a Footman survives easily — shingles, beams,
window frames, tool racks. Reference them generously.

**The roof is the design.** From directly overhead you mostly see roof, so roof
shape, pitch, material and colour carry nearly the whole read. Two buildings with
identical footprints are told apart by their roofs and by what spills out around
them — a woodpile, an anvil, a training dummy, a hanging banner.

## What must stay readable

Every building has to carry its state at a glance. When judging a reference, ask
whether these would still work:

- **Under construction** — I draw a scaffold and a progress bar over the top, so
  the roof should not be the only thing identifying it
- **Producing / researching / reviving** — progress bars overlay the lower edge
- **Damaged** — a health bar sits above it
- **Team colour** — needs a clear home: banner, roof ridge, awning, pennant
- **Footprint** — the building sits inside a square. It may overhang slightly,
  but a 3×3 whose art sprawls over 4 tiles will look wrong against the
  placement grid, which the player sees as a green/red ghost

## Shared style block

Paste in front of every prompt:

> Top-down orthographic view looking straight down at a single fantasy building,
> centred, complete, nothing cropped. Flat shading with hard light from the upper
> left, limited palette, heavy dark outline, clear silhouette. Plain neutral grey
> background, no ground, no shadow, no surrounding terrain, no characters, no
> text, no watermark, no UI.

Negative prompt:

> isometric, perspective, eye-level, photorealistic, soft focus, bloom, busy
> background, landscape, scenery, people, text, watermark, cropped

Two notes carried over from the character set, both of which cost us output
quality when missed:

- **Say "top-down orthographic, looking straight down"** and say it first. Models
  default to three-quarter isometric for buildings even harder than they default
  to eye-level for characters.
- **Don't name an existing game.** It collapses the result toward that style and
  you stop getting anything specific to Emberfall.

## The two factions

| | Primary | Dark | Light |
| --- | --- | --- | --- |
| **The Ember Accord** (player) | `#5aa9ff` | `#1b3f70` | `#bcdcff` |
| **The Thornkin** (AI) | `#e05a4a` | `#5e1f16` | `#ffc3b4` |

One prompt per building is enough — I derive the Thornkin variant. Accord
buildings are squared timber, ember-brick and clean banners; Thornkin are the
same plan rebuilt in lashed branches, thorn and bone.

Shared masonry palette already in the code: `#9a8a72` lit, `#74664f` mid,
`#4b4134` dark, with `#7a6238` scaffold timber.

---

# Already done

**Keep** — curtain wall with crenellations, drum towers under conical roofs, a
gatehouse with a portcullis, central donjon, banners. Tier two, and the only
building that should read as a fortress.

**Town Hall** — a civic hall, deliberately *not* a small castle. Gabled roof with
a bell cupola on the ridge, stone chimneys, a wide stepped entrance, and a
working yard stacked with lumber, gold sacks and a handcart, because this is
where Laborers deposit what they gather.

Both were originally drawn by one shared function with a tier flag, which made
the Town Hall a smaller fortress and wasted the upgrade. They are separate
functions now: a settlement that *fortifies itself* is a much better moment than
a small castle becoming a big one. If a building ever needs to show tier
progression, this is the pattern — change the building's nature, not its size.

---

# 1. Farm — "Bramble Warren"  ✅ done

2×2, 64 × 64 px. Grants +6 food.

**Reference received and implemented.** Taken: a steep thatched longhouse with
the **team colour on the ridge beam** again (third building running — it is now
the house rule); golden straw combed down the slope with bound courses across
it and a ragged eave fringe; a stone chimney at one end; and alongside it a
fenced plot of tilled soil in rows with cabbages, a domed haystack on its pole,
and a water trough.

**Answer to the open question — how to stop a cluster of farms reading as one
blob:** colour, not shape. Gold thatch and a green crop plot are two colours
nothing else on the map uses, and three farms side by side now separate
cleanly. Pitch direction and chimney placement barely registered at 64px by
comparison.

**Two things the render caught that the code did not.** Combed straw at full
strength reads as plank siding, which is the one thing a thatched roof must not
look like — it had to drop to about a sixth of the contrast. And radial straw on
the haystack turned it into a cartwheel; the straw now only shows at the skirt.

Current palette: thatch `#b08e49` shadow slope / `#ddc07c` lit slope, straw
`#c9a44e`, soil `#6b4f33`, leaf `#4f9838`. Team colour: ridge beam.

# 2. Barracks — "Howling Pen"  ✅ done

3×3, 96 × 96 px. Trains Footmen and Archers.

**References received and implemented** (two top-down, one isometric). Taken: the
footprint split into a timber-framed hall and an open training yard; a shingled
gable roof in staggered courses with the two slopes meeting at a central ridge;
the **team colour riding the ridge beam** with timber cleats across it; a stone
chimney; doorway steps at the eave; a straw pell on a crossbar post; a weapon
rack holding two blades with team-coloured pommels and two bows; and a timber
frame with corner blocks around the whole footprint.

**Answer to the open question:** the training yard was the right instinct — it is
now a third of the footprint and carries the identity, so the Barracks reads as
*where soldiers come from* rather than a box with swords painted on it.

**Lesson for the remaining five:** the ridge beam is the best home for team
colour on any pitched roof. From straight above it is a long unbroken line
through the middle of the building, which beats a band around the eaves.

> Top-down orthographic view of a fantasy military barracks: a long hall with a
> shingled gable roof, a stone chimney, an open training yard at one end with a
> weapon rack and a straw practice dummy, a banner pole at the corner. Solid,
> disciplined, built to last.

Current palette: roof `#3a3026`, weapon steel `#cfd4de`. Team colour: roof band
and banner.

**What I most need:** the training yard. Right now the Barracks is a box with
crossed swords painted on it, and a yard full of racks and dummies would do far
more to say *this is where soldiers come from*.

---

# 3. Workshop — "Thornworks"  ✅ done

3×3, 96 × 96 px. Requires a Keep. Builds Siege Carts.

**Reference received and implemented.** Taken: a half-roof over one corner on
braced posts with the team colour on the ridge; a half-built throwing arm lying
on trestles with a rope skein wound round it, steel bands and a copper sling cup
at the tip; a rope-wound winch drum with a brass gear and crank; a coil of rope;
a stack of cut lumber shown plank-ends-on; and stone footings at the base.

**Answer to the open question — tying it to the Siege Cart:** the palette is
lifted off `drawUnit`'s siege case line for line. Same `#b8894a` timber, same
`#d9c08a` rope over `#b89a62`, same `#5c5c5c` steel. The winch drum is the same
part drawn the same way on both. That did more to make them look like one
faction's engineering than any amount of matched silhouette would have.

**The diagonal is what makes it this building and nothing else.** Every other
building on the map is squares aligned to the grid, so one long beam cutting
corner to corner is unmistakable even at a glance. It also solved the
3×3-sameness problem differently from the Blacksmith: that one turned its split
ninety degrees, this one ignores the axes entirely.

**What the render caught:** the beam originally ran the full diagonal and lay
straight on top of the rope coil. Pulling both ends in and shrinking the coil
into the freed corner fixed it — but the real lesson is that the arm claims the
whole middle of the footprint, so the yard props only have the triangle below it
to live in. That triangle holds three things comfortably and no more.

Two deliberate departures, both for separation from the Barracks, which is the
other timber building with a shingled roof: **iron cleats** on the ridge instead
of timber ones, and **stone footings** instead of tan timber corner blocks.

Current palette: timber `#b8894a` / `#9a7038` / `#6b4e28` / `#4e3a22`, shingle
`#44372c` / `#5c4b3a`, rope `#d9c08a` / `#b89a62`, steel `#5c5c5c`, brass
`#c9a44e` / `#e3c070`, copper cup `#8a4a2c` / `#b06a42`, stone `#9a9186`.
Team colour: ridge beam.

# 4. Altar of Embers — "Briar Shrine"  ✅ done

3×3, 96 × 96 px. Summons and revives the hero.

**Reference received and implemented.** Taken: three stepped circular tiers; a
stair cut into the near side between rune-carved balustrades; five tapered
standing stones around the rim carrying lozenge and bar glyphs; team-coloured
banners swagged between them; and a masonry fire bowl on a plinth with iron
straps and a diamond boss, burning at the centre.

**The most useful thing in the reference was that it is round.** Every other
building on the map is a square under a pitched roof, so a circle is doing more
for "this one matters" than any amount of detail could. It also needed the one
shared-code change in this batch: the drop shadow under every building is a
rectangle, which pokes out at the corners of a round one, so the Altar gets an
ellipse.

**Answer to the open question — architecture around the flame rather than a glow
on a disc:** the bowl is only a sixth of the footprint and it still dominates,
because it is the one bright thing in a lot of grey stone. Sizing the fire to
the *bowl* instead of to the building is what made the architecture read.

**Three things the render caught.** Radial block joints on the drum turned the
fire bowl into a cog — a plain ring with a lit rim arc reads far better. Three
long flame tongues made a three-pointed star; an unsteady wobbling rim reads as
fire where licks do not. And the standing stones, drawn long and radial, read as
spokes pointing at the centre — seen from above a monolith is a block, so they
are now shorter along the radius and wider across it.

Banners ended up ringing four of the five gaps rather than the reference's one
swag plus pennants. The pennants read as darts floating off the rim at this
size, and the Altar is the building you hunt for when your hero dies, so more
team colour on it is worth the departure.

Current palette: stone `#bcb09b` platform / `#aa9f88` mid tier / `#9a8f79`
lower / `#564e42` risers, bowl `#6e665a` with `#33302b` iron, flame
`rgba(226,70,22)` → `rgba(255,245,196)` core. Team colour: the banner swags.

# 5. Guard Tower — "Spike Nest"

2×2, 64 × 64 px. Static ranged defence, 7 tile range.

> Top-down orthographic view of a fantasy stone watchtower seen from directly
> above: a square crenellated parapet with merlons around the edge, a dark open
> interior with a ladder visible, arrow slits, a small pennant on a corner pole.
> Compact, defensive, solid masonry.

Current palette: stone `#7a7060` / `#8d8373`, shadow `#3a342c`. Team colour:
pennant and roof band.

**What I most need:** from directly overhead a tower is mostly a ring of merlons
around a hole, which is a good distinctive shape — I want to see how much of the
interior to show, and whether a partial roof reads better than an open top.

---

# 6. Blacksmith — "Bonefitter"  ✅ done

3×3, 96 × 96 px. Researches melee attack, ranged attack and armour.

**Reference received and implemented.** Taken: the footprint split into a
timber-framed hall and an open working bay; a shingled gable with the team
colour on the ridge beam and timber cleats across it; a tall stone chimney
standing *in the dividing wall* with its mouth glowing; a stone forge hearth
with a burning coal bed; an anvil on its stump; a quench barrel; a grindstone on
a trestle; a rack of finished blades; and a charcoal crib.

**Answer to the open question — how big the chimney and bay should be for the
glow to read from across the map:** the bay is a little over half the footprint
and the chimney is a quarter of the width. Two separate glowing elements, the
chimney mouth above and the coal bed below, read far better than one large one,
because at 96px a single glow is just an orange smear while two reads as a
structure with fire inside it.

**The split runs across the footprint, not down it.** That was not in the
reference — it came out of rendering the thing. Split vertically, the Blacksmith
was a near-twin of the Barracks at map scale. The other 3×3 buildings all split
the other way, so this one turning ninety degrees is free silhouette separation.

**Three things the render caught that reading the code did not:** the dividing
beam was drawn last and ran straight through the chimney; the heat wash was
applied over the whole footprint and turned the roof to mud (it is clipped to
the bay now); and the anvil sat on a stump the same size as itself, which read
as a cooking pot. All three looked perfectly reasonable as source.

Current palette: shingle `#43362a` / `#6b5844`, stone `#b0a898` / `#8c8478` /
`#6e675c`, flagstone `#9a9184`, forge `rgba(255,172,52,…)` over `#2a1206`.
Team colour: ridge beam, blade pommels.

# Bonus: the Gold Seam

2×2, 64 × 64 px, neutral — not a building, but a structure-shaped thing the
player stares at all game and it's plainer than it deserves.

> Top-down orthographic view of a fantasy gold mine entrance cut into a rocky
> outcrop: a dark timber-framed adit mouth, scattered boulders, visible veins of
> gold ore in the exposed rock, a minecart rail stub, spoil heaps. Rugged,
> worked, no vegetation.

Current palette: rock `#6d6256` / `#3a342c`, cave mouth `#14100c`, gold
`#f2c23a`. No team colour — mines are neutral.

**What I most need:** it shows a depletion state (gold nuggets disappear as it
empties) and holds up to five workers. A design where the ore is visibly *on* the
rock would make depletion legible.

---

# If you'd rather direct in words

Same three questions as the character doc, per building:

1. **Silhouette.** What should I recognise it by from across the map, with no
   colour at all?
2. **One wrong thing.** The worst-reading detail right now.
3. **One missing thing.** The detail that would say what this building *does*.

# Suggested order

One left: the **Guard Tower**. It is the last 2×2 and the only building whose
whole job is to be recognised instantly at a distance — you need to know a tower
is there before you walk an army into its range. The open question in its
section still stands: from straight above a tower is mostly a ring of merlons
around a hole, and what I want to know is how much of the interior to show and
whether a partial roof reads better than an open top.

After that the only thing left on this page is the **Gold Seam**, which is not a
building but gets stared at all game.

# How these get reviewed now

There is no browser in the loop, so until the Blacksmith the only way to judge
this art was to read the drawing code and picture it. That missed three
plain-sight faults in a row. There are now two small tools that fix it:

    node tools/art_record.js <type> <owner> [anim] out.json
    python3 tools/art_replay.py out.json out.png

The first records every canvas call the game makes drawing one building; the
second replays them into a PNG with Pillow at 8x and downsamples. Render at true
size as well as zoomed — a building is judged at 64 or 96 pixels, and things
that look finished at 4x (the farm chimney, the smith's anvil) fall apart or
take over at 1x. For the Farm it is also worth pasting three side by side,
because *not blurring into its neighbours* is most of that building's job.
