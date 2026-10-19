# Teaser stage screenshots

These four 2560 × 1600 WebP images show actual EndoPlanner interface panels,
captured in Chromium from the v1.6.187 production application with the licensed
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
4. Illustrated clinical and disease summary cards, including both PAT readings
   and all three lesions.

For recapture, use 1280 CSS-pixel browser width (1600 for the disease anatomy
slide), the current production bundle and a 3× device scale. Wait for the Adobe
heading font before capturing the actual panels. Keep the filenames, 2560 ×
1600 output dimensions and aspect ratio. Image URLs include the plugin version
so browsers fetch the refreshed assets after a plugin update.
