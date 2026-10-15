# Pedal routes and schematic lesion extent

## Pedal route topology

`data/pedalRoutes.js` derives artery-to-artery connections from shared node IDs
in the existing patent `footArterialModel.js`. The anatomical basis remains
Manzi et al., *Vascular Imaging of the Foot*, RadioGraphics 2011,
https://pubs.rsna.org/doi/10.1148/rg.316115511; see the detailed source and
variant notes in `woundosome/README.md`.

The route continues beyond tibial inflow into named tarsal, arcuate, plantar,
metatarsal, digital or calcaneal branches. Posterior tibial reaches the deep
plantar arch **through lateral plantar**. The first dorsal metatarsal arises
from dorsalis pedis; the other dorsal metatarsals join the arcuate system.
Posterior tibial supplies medial calcaneal branches and peroneal supplies
lateral calcaneal branches. The peroneal is not an invented fourth pedal trunk.

Route options preserve the selected tibial/peroneal inflow; crossing into a
different crural trunk is not inferred. Pedal connections in the reference
graph do not establish their patency or dominance in an individual patient.
Woundosome groups suggest targets to assess, not proven wound supply. The
clinician can choose a different named branch after reviewing angiography.

Only the traversed part of each named artery is highlighted: its junction with
the previous route artery through its junction with the next. This prevents a
route leaving dorsalis pedis at a tarsal/arcuate branch from being highlighted
all the way to its distal end. Both projections use identical node ranges.
Right-sided previews mirror the reference geometry and preserve readable
marker numbers. Registered side-specific IDs also appear in summaries and PDF.

Schema 6 restores schema 2–5 cases. It extends old tibial/DP endpoints into
pedal outflow and replaces the old posterior-tibial-to-arch shortcut. Explicit
named pedal endpoints, notes, lesions and scoped device rows are retained.

## Longitudinal lesion illustration

The affected segment retains a thin red outline. A separately clipped red fill
represents `min(lesion length / reference segment length, 1)` along the major
axis of its illustration, centred by default. This is a longitudinal drawing
fraction, **not percentage diameter stenosis**, a patient-specific location or
a reconstruction of multifocal disease. Grouped metatarsal arteries have no
invented reference length and remain outlined without an estimated fill.

An entered measured lesion length takes precedence and determines the clinical
length category. Without a measurement, closed ranges use their midpoint:
`<3` → 1.5 cm, `3–10` → 6.5 cm, `10–15` → 12.5 cm, `15–20` → 17.5 cm.
`>20` uses 20 cm as a lower-bound illustration and is labelled accordingly.
Values exceeding the reference fill the complete illustrated segment.
Measured lengths, not the drawing fraction, are included in summary/PDF.

Reference lengths are configurable drawing defaults, **not a universal table
of normal arterial lengths**. The optional reference input can replace a
default when the relevant segment has been measured. The UI distinguishes
published study means, a published model and explicitly illustrative values:

| Segment | Reference | Basis |
| --- | ---: | --- |
| SFA | 35 cm | Published computational-model assumption, not a measured population mean: https://doi.org/10.1177/1708538115586939; accessible author thesis: https://dspace.library.uu.nl/bitstream/1874/344046/1/Kruse.pdf |
| Common iliac | 6.1 cm | Rounded from side-specific study means: https://journals.viamedica.pl/folia_morphologica/article/download/FM.a2020.0109/51817 |
| External iliac | 10 cm | Rounded study means: https://pubmed.ncbi.nlm.nih.gov/30595337/ |
| Internal iliac | 3.7 cm | Study mean: https://doi.org/10.1155/2014/597103 |
| Tibioperoneal trunk | 3.2 cm | Study mean: https://doi.org/10.26650/IUITFD.1266936 |
| Popliteal | 18.4 cm | Study mean: https://www.worldwidejournals.com/international-journal-of-scientific-research-(IJSR)/recent_issues_pdf/2023/March/a-cadaveric-study-of-length-of-popliteal-artery_March_2023_8164473206_2319940.pdf |
| Dorsalis pedis | 6.7 cm | Rounded from 66.83 mm: https://www.jlmc.edu.np/index.php/JLMC/article/view/559 |
| CFA / profunda | 4 / 25 cm | Illustrative defaults; no claim of published mean |
| Tibial / peroneal | 30 cm | Illustrative default; no claim of published mean |
| Medial / lateral plantar / plantar arch | 8 / 10 / 6 cm | Illustrative defaults; no claim of published mean |

Thus, a measured 5 cm SFA lesion occupies approximately 14% of its 35 cm
drawing reference, rather than turning the whole SFA solid red. Neither the
reference values nor graphic fractions change the GLASS grading rules.
