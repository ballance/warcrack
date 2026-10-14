# Character art prompts

Reference prompts for the nine characters in Emberfall. Run them through
whatever image model you like, then paste the results back into the session and
I'll redraw the canvas code to match.

## What I actually need back

I don't trace images — every character is procedural canvas paths. So what
transfers is **silhouette, proportion, palette, and where the team colour sits**.
What doesn't transfer is rendering: gradients, texture, painterly brushwork, and
anything below about four pixels of detail.

That means the most useful reference is a **flat, clean, high-contrast** image,
not a beautiful one. A crisp silhouette on grey beats a gorgeous painting.

Two views per character:

| View | Size on screen | Why |
| --- | --- | --- |
| **Map sprite** | ~18–26 px tall | What you look at 99% of the time. Silhouette is everything |
| **Bust** | 76 × 76 px | Command panel portrait. Head and shoulders, front-on |

## Shared style block

Paste this in front of every prompt so the nine stay a coherent set:

> 2D game art, original dark-fantasy frontier setting. Flat shading with hard
> light from the upper left, limited palette, heavy readable silhouette, thick
> dark rim separating the figure from the ground. Plain neutral grey background,
> full figure, no cropping, no text, no logo, no watermark, no border, no UI.

Negative prompt:

> photorealistic, soft focus, bloom, lens flare, busy background, text, watermark,
> multiple characters, cropped limbs, extreme foreshortening

Two things worth keeping in the prompts:

- **Don't name an existing game or franchise.** Beyond keeping us clear of
  someone else's designs, naming one collapses the output toward that art style
  and you stop getting anything specific to this game.
- **Say the camera angle explicitly.** Models default to eye-level hero shots,
  which are useless for a top-down sprite.

## The two factions

Team colour is a swappable element, never the whole costume — I recolour one
specific part per unit, so the reference needs that part to be obvious.

| | Primary | Dark | Light |
| --- | --- | --- | --- |
| **The Ember Accord** (player) | `#5aa9ff` | `#1b3f70` | `#bcdcff` |
| **The Thornkin** (AI) | `#e05a4a` | `#5e1f16` | `#ffc3b4` |

The Thornkin are the same silhouettes with thorn, bone and horn where the Accord
has plumes, gilding and clean steel. One prompt per character is enough — I
derive the Thornkin variant.

---

# 1. Laborer — "Grubber" (Thornkin)  ✅ done

Gathers gold and lumber, raises buildings, fights badly. The most-seen unit in
the game.

**Reference received and implemented.** What transferred: the two-handed
diagonal pickaxe carry, the two-garment costume (olive shirt under a dark
leather apron), shoulder straps with brass buckles, a wide planted stance with
visible boots, a beard, and an armband with a cream stripe through it. What I
changed from the reference: while hauling gold or lumber the pick is stowed and
both hands go on the load, because a worker holding a pickaxe *and* a log reads
as neither at 20px.

**Map sprite**
> Steep three-quarter top-down view, looking down at roughly 60 degrees. A stocky
> frontier labourer standing, seen from above and slightly in front. Coarse wool
> tunic, heavy leather apron, rolled sleeves, flat cloth cap, canvas satchel on
> one hip. Holding a pickaxe across the body. Broad shoulders, short legs, heavy
> boots. Earth tones.

**Bust**
> Head-and-shoulders portrait, front-on, filling the frame. Weathered middle-aged
> labourer, flat cloth cap, stubble, squint lines. Leather apron straps over a
> wool tunic. A pickaxe haft crossing behind one shoulder.

Current palette: tunic `#9c8150`, apron `#6b5433`, cap `#7a5c38`, skin `#e0b78c`,
haft `#6b4e2e`, iron `#b9c0cb`. Team colour: armband.

**Open question:** does the carried resource read? Gold shows as two nuggets in
the hands, lumber as a banded log bundle — at 18 px that may be mush.

---

# 2. Footman — "Thorn Brute"  ✅ done

Frontline infantry. Heavy armour, sword and shield, can brace into Shield Wall.

**References received and implemented.** The big correction was colour balance:
I had steel armour with a team-coloured stripe, the reference is a team-coloured
surcoat with steel limbs — which is what makes the two armies separable in a
melee. Also taken: the plain steel shield with a rivet ring and a team-coloured
boss (I had the whole shield team-coloured), the large swept-back plume, the
pale chevron down the chest, pauldrons with a pale band and a brass dome rivet,
a brass crossguard and pommel, and a riveted brow band with cheek guards.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. Armoured infantryman
> standing square, seen from above and slightly in front. Riveted plate over
> mail, surcoat hanging to mid-thigh, rounded pauldrons, open-faced helm with a
> nasal bar and a plume. Large round shield held on the left arm, arming sword
> raised in the right. Blocky, grounded, heavy.

**Bust**
> Head-and-shoulders portrait, front-on. Infantryman in an open-faced helm with a
> nasal bar and a tall plume. Plate pauldrons, surcoat over mail. Disciplined,
> stoic, scarred.

Current palette: plate `#8e97a6` / `#aab3c0` / `#565e6b`, blade `#e4e9f0`,
crossguard `#8a7a52`. Team colour: surcoat, pauldrons, shield boss, plume.

**Open question:** the shield sits on whichever side is away from the target, and
grows when Shield Wall is on. Does that read as bracing, or just as a bigger disc?

---

# 3. Archer — "Needler"  ✅ done

Ranged, pierce damage, light armour. Hood, quiver, bow that draws and looses.

**References received and implemented.** The open question is answered: the hood
is a *tall sharp peak*, and the face is a **dark void with only the nose, mouth
and chin lit**, ringed by a bright team-coloured lining. That lining ring is the
whole read at 18px. Also corrected: the team colour moved from a chest sash to a
**waist sash with a long hanging tail**, the bow is now taller than the body with
a dark leather grip wrap, the quiver's fletchings are large team-coloured
diamonds, and the boots are knee-high with turned cuffs.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. Lean hooded archer seen
> from above and slightly in front. Pointed hood with the face shadowed, boiled
> leather jerkin, bracers, quiver of arrows across the back with fletchings over
> the shoulder. Longbow held out, arrow nocked and drawn.

**Bust**
> Head-and-shoulders portrait, front-on. Hooded archer, pointed hood casting the
> upper face into shadow, sharp chin and mouth visible. Leather jerkin, a bow
> limb and arrow fletchings crossing behind the shoulder.

Current palette: leather `#5e6b45` / `#78875a` / `#3f4a2f`, quiver `#5a4632`,
bow `#8a6534`. Team colour: hood lining, sash, fletchings.

**Open question — the one I'd bet is broken.** The hood is a five-point curve
that probably swallows the whole head at 18 px. I need to see whether the hood
should read as a *shape above the head* or as a *dark mass with a lit face
notch*.

---

# 4. Siege Cart — "Bramble Hurler"  ✅ done

Slow artillery, devastating against buildings. The only unit that rotates to its
facing, since a vehicle survives being seen from any angle.

**References received and implemented.** The top-down view was the single most
directly usable reference so far — it is exactly the map camera, so almost all of
it transferred: wheels outboard on stub axles with hub nuts, steel side rails,
the torsion assembly with two rope skeins flanking the arm, the rear winch drum
wound with rope, a rope-wrapped ring cup holding a faceted stone, and a
swallowtail banner on a banded pole at the rear quarter.

**Answer to the open question:** resting pose is arm-forward and loaded, stone in
the cup. On release the arm *extends* rather than rotates — from directly
overhead a vertical-plane swing foreshortens, so extension is what reads as a
throw — and the stone vanishes from the cup for the duration.

**Map sprite**
> Directly overhead view, straight down, of a small two-axle wooden war cart.
> Planked deck, iron banding along both sides, four spoked wheels, a torsion-arm
> throwing engine mounted centrally with a leather sling cup at its tip, a winch
> drum at the rear, a short mast flying a small pennant. Rugged, field-built, no
> crew.

**Bust**
> Three-quarter view of a small wooden torsion catapult on a two-axle cart,
> filling the frame. Planked deck, iron banding, spoked wheels, throwing arm
> raised with a stone in the sling cup, pennant on a short mast.

Current palette: wood `#7a5c38` / `#4e3a22`, iron `#55504a`, wheels `#2b2118`.
Team colour: pennant.

**Open question:** the throwing arm recoils through the attack. Should the
resting pose be arm-up-loaded or arm-down-cocked?

---

# 5. The Warden — "The Briarmother" (Thornkin)  ✅ done

The hero. Levels 1–10, four abilities, carries relics. Must be instantly findable
in a crowd of footmen.

**References received and implemented.** Taken: a *gold* crown-helm with five
points and cheek plates (I had steel with three wire strokes), a cape that sweeps
far wider than the body with a lit inner lining, a gold gorget chevron with a
round brooch at the throat, steel pauldrons with heavy gold trim and a boss, a
pale centre stripe down a pointed tabard hem, grey hair and beard, and an
elaborate gold cross-guard with a gem and a long leather grip.

**Answer to the open question:** he should *not* be taller. Gold plus the cape
sweep make him findable in a crowd, which leaves the collision radius at 11 and
nothing about the simulation moves. The Thornkin swap gold for pale bone-green,
keeping the same silhouette.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. A tall armoured champion
> seen from above and slightly in front, noticeably larger than a rank soldier.
> Ornate plate with gilded trim, a long cloak falling behind, a crowned helm with
> three rising points. Two-handed greatsword held across the body. Commanding,
> deliberate, heavier than the troops around them.

**Bust**
> Head-and-shoulders portrait, front-on. Veteran champion in a crowned helm with
> three rising points, gilded plate pauldrons, cloak clasp at the throat.
> Greatsword blade rising behind one shoulder. Weathered, authoritative.

Current palette: plate `#b9c2d0` / `#d8dfea` / `#6e7786`, gilding `#f2d27a`.
Team colour: cloak, surcoat.

**Open question:** scale. The hero is radius 11 against a footman's 10 — barely
larger. Should the hero be visibly *taller*, or stay the same height and lean on
the cloak and crown to stand out?

---

# 6. Hollow Wolf  ✅ done

Tier-one creep, packs of three. Sleeps at night. Rotates to its facing.

**References received and implemented.**

**Answer to the open question:** it *does* read as a wolf from directly overhead,
and the reference shows exactly why — four things carry it. Ears flanking the
skull, a dark dorsal stripe down the spine, a sawtooth fur outline instead of
smooth ellipses, and a long bushy tail that sweeps with the gait. The head does
not need turning. The body also got leaner and longer, and the paws are now
visible at the end of each leg.

**Map sprite**
> Directly overhead view, straight down, of a lean grey wolf mid-stride. Long
> body, narrow shoulders, raised hackles along the spine, bushy tail trailing,
> pointed ears, muzzle extended forward, yellow eyes. Mangy, underfed, wild.

**Bust**
> Head-on portrait of a lean grey wolf, filling the frame. Ears pricked, yellow
> eyes, muzzle lowered, fangs just showing. Matted fur, hollow-cheeked.

Current palette: fur `#6b645a` / `#48423a`, eyes `#ffd36b`. No team colour —
creeps are neutral.

**Open question:** overhead, a wolf is mostly back and tail. Is that readable as
a wolf, or does it need the head turned to one side to show the profile?

---

# 7. Cutpurse  ✅ done

Tier-two creep, road thief squatting in ruins. Hooded, knife, coin sash.

**References received and implemented.** Taken: a tall *ragged* hood point, a
face that is a pure black void with two angular **red slit** eyes (I had small
round dots), a mantle with a deep zigzag hem, a baldric hung with three gold
coins plus a ring at the collar, a **curved crescent** knife instead of a
straight blade, and cloth wraps on the limbs.

**Partial answer to the open question:** the Cutpurse has now diverged on hood
shape, weapon and trim. The Slinger still shares the body rig and differs by
cloth tone and its sling — worth its own reference if you want them further
apart.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. A hooded brigand seen
> from above and slightly in front. Ragged hooded cloak with a torn hem, mismatched
> scavenged leathers, a sash hung with coins and trinkets, curved knife in one
> hand. Furtive, crouched, lean.

**Bust**
> Head-and-shoulders portrait, front-on. Deep ragged hood with the face entirely
> in shadow except two glinting eyes. Scavenged leather collar, a coin-hung sash.
> Menacing, anonymous.

Current palette: cloak `#3f3a33` / `#544e45` / `#262320`, eye glint `#e0503c`,
coins `#c9a44a`. No team colour.

**Open question:** the Cutpurse and Slinger share a silhouette and differ only by
weapon and cloak tone. Should they diverge more — different headgear, different
build?

---

# 8. Ruin Slinger  ✅ done

Tier-two ranged creep. Whirls a sling.

**References received and implemented**, and they settle the Cutpurse/Slinger
question from section 7: they are now separate `case` blocks, not one block with
a palette switch. The divergence:

| | Cutpurse | Ruin Slinger |
| --- | --- | --- |
| Cloth | brown | drab olive-grey |
| Eyes | red slits | amber almonds |
| Hood | tall sharp ragged point | broad soft-peaked cowl, heavy drape |
| Trim | three gold coins + collar ring | plain leather baldric, square buckle |
| Weapon | curved crescent knife | twin-corded sling with a leather cradle |
| Extra | — | hip pouch with stones showing over the lip |

**Answer to the open question:** the whirling sling now reads, because it is no
longer a bare dot on a circle — it is two cords running from a wrapped fist to a
leather cradle with a visible stone in it, and the whole assembly lengthens as it
builds to a throw.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. A hooded scavenger seen
> from above and slightly in front, whirling a leather sling overhead in a wide
> arc. Ragged hood, patched cloth over leather, a pouch of stones at the belt.
> Wiry, coiled, mid-motion.

**Bust**
> Head-and-shoulders portrait, front-on. Hooded scavenger, face shadowed, two
> glinting eyes, a loaded leather sling held up beside the head. Patched hood,
> stone pouch strap across the chest.

Current palette: cloak `#55503f` / `#6d6752` / `#38342a`. No team colour.

**Open question:** the whirling sling is an animated circle around the hand. Does
that read as a sling, or just as a spinning dot?

---

# 9. Stone Golem  ✅ done

Boss creep guarding the centre of the map. Huge, slow, hits like a falling wall.
Rune eyes bank down to embers while asleep.

**References received and implemented.** Taken: a hunched knuckle-walker posture
with arms that dwarf the legs, a small head sunk between two shoulder boulders,
angular chevron eyes instead of round dots, lava cracks that branch in a Y with a
bright yellow core inside an orange glow, blocky stacked-cube fists, faceted
low-poly rock throughout, and moss patches on the upper surfaces.

**Answer to the open question:** it does not need to be bigger. The hunch is what
sells boss scale — arms reaching the ground past the feet read as mass far more
than radius does, so the collision radius stays 17.

**Map sprite**
> Steep three-quarter top-down view, roughly 60 degrees. A massive humanoid built
> from rough granite slabs, seen from above and slightly in front. Boulder
> shoulders far wider than the hips, stubby legs, enormous fists, deep fissures
> across the chest with orange light glowing out of them, no face except two
> burning rune eyes. Ancient boundary marker, woken and furious.

**Bust**
> Head-on portrait of a granite golem's head and shoulders, filling the frame.
> Faceted stone slabs, deep cracks leaking orange light, two burning rune eyes, a
> heavy jaw slab. Weathered, lichen-stained, ancient.

Current palette: rock `#7d7568` / `#9b9385` / `#565046`, rune core `#ffba5a`,
rune highlight `#fff0c4`, glow `rgba(255,154,60,.35)`.
No team colour.

**Open question:** the golem is radius 17 against a footman's 10. Does it feel
boss-sized on the map, or does it need to be bigger still?

---

# If you'd rather direct in words

The images are optional — answering these three per character gets me most of
the way, and you can skip any character you're happy with:

1. **Silhouette.** What should I recognise it by at the size of a thumbnail,
   with no colour at all?
2. **One wrong thing.** The single detail that reads worst right now.
3. **One missing thing.** The detail that would make it obviously *this* unit.

## All nine are done

Every character in this document has been referenced and redrawn. What the
references changed most often, in order:

1. **Silhouette before detail.** The two-handed pickaxe carry, the archer's hood
   peak, the golem's hunch, the wolf's sawtooth outline — each was worth more
   than any amount of surface decoration.
2. **Where the team colour sits.** The footman's surcoat, the archer's waist
   sash, the hero's cape. Getting this wrong cost faction readability in a melee.
3. **One signature detail per unit** that no other unit has: apron straps,
   plume sweep, hood lining ring, torsion skeins, gold crown, dorsal stripe,
   coin baldric, twin sling cords, lava cracks.

## Not covered here

Terrain, projectiles and ability effects.

Buildings have their own document: **[ART_PROMPTS_BUILDINGS.md](ART_PROMPTS_BUILDINGS.md)**.
