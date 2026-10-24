# Teaser stage screenshots

These four 2560 × 1600 WebP images show actual EndoPlanner interface panels,
captured in Chromium from the production application (stages 1–3: v1.6.187;
stage 4 and the PDF: v1.6.189) with the licensed
Kobenhavn CS heading font loaded. The browser renders at 3× device scale;
panels are then downsampled and arranged on an 8:5 canvas for the teaser.
These are fresh renders, not enlargements of the previous 1280 × 800 images.
The running application's layout is responsive.

All four slides use the same fictional left-limb example:

- Fontaine IV; WIfI W2 I2 fI1; hallux/first-ray wound.
- Lesion 1: superficial femoral artery occlusion, 12 cm, heavy calcification.
- Lesion 2: anterior tibial artery occlusion, 6 cm, moderate calcification.
- Lesion 3: peroneal/fibular artery stenosis, 3 cm, moderate calcification.
- PAT: dorsalis pedis 260 ms; lateral plantar 200 ms. The app calculates the
  displayed categories from these illustrative entries.
- Target route: common femoral → SFA → popliteal → anterior tibial → dorsalis
  pedis → first dorsal metatarsal artery.
- Separate crossing and balloon treatment selections are linked to each lesion.
  The example uses Gladius MG PV wires for the occlusions, a Command 18 LT wire
  for the peroneal stenosis and Advance 18LP balloons. These demonstrate the
  planning interface, not a treatment recommendation.

No patient data is included. The teaser labels the images “Example case.”

1. WIfI grades, expanded PAT assessment and wound location controls.
2. Disease map, all three lesions, target path and selected woundosome views.
3. Plan at a glance with three lesion rows, shared route support and the active
   lesion's crossing/treatment editor.
4. Actual intervention-materials summary excerpts in four numbered navy section
   cards: access, Lesion 1 crossing, Lesion 1 preparation/therapy and closure,
   alongside the Export PDF button. Alongside these, actual pages of
   the exported report show the illustrated clinical summary and categorized
   preparation checklist. The image explicitly labels the lesion excerpt; the
   complete PDF includes all three lesions.

`example-case-summary.pdf` is the real export from this same fictional case,
with anonymous code DEMO-001 and example date 19 October 2026. It includes the
clinical assessment, anatomy, all three lesion plans and the complete materials
checklist. The landing teaser links to it with “View example PDF”; the document
is fetched only when opened. No live case or browser state is used for this link.

For recapture, use 1280 CSS-pixel browser width (1600 for the disease anatomy
slide), the current production bundle and a 3× device scale. Wait for the Adobe
heading font before capturing the actual panels. Keep the filenames, 2560 ×
1600 output dimensions and aspect ratio. Image URLs include the plugin version
so browsers fetch the refreshed assets after a plugin update.

For the fourth composition, capture the real intervention summary at 3× scale;
capture each of the four phase cards. For crossing and therapy, show the first
lesion group; show all access and closure rows. Stack these actual excerpts,
clearly label the excerpt and retain the actual export button. Render the
exported PDF pages at 160 dpi or above before arranging them beside the summary.
The exported intervention plan uses matching numbered navy phase headings.
Keep labels in Kobenhavn CS and use the same 2560 × 1600 output canvas. The first three screenshots do
not need recapture when only this export showcase changes.
