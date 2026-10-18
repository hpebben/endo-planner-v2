# Device catalogues and case reports

The European Endovascular Today Device Guide was reviewed on **18 October
2026**. The update covers all three sheath tables, all three wire tables and
relevant peripheral balloon, catheter, stent and adjunctive-device categories.
The catalogue is bundled with the plugin; opening a selector makes no request
to the guide website.

## Product selection

The sheath picker starts with the product, followed by category, French size,
working length, guidewire compatibility, shape and coating. It covers the 145
standard, reinforced and special-access listings as 118 deduplicated product
families. Only specifications relevant to the chosen product are shown.

Explicit sizes become chips. A source range remains a range with a numeric
entry field: a 5.5–8 Fr listing is not expanded into presumed catalogue sizes.
Dimensions from separate rows remain linked; selecting a category or size
narrows the remaining choices. Explicit diameter-dependent guidewire options
are linked as well. Out-of-range sheath configurations block continuation.
The selected product's original dimension facts and links appear in the
collapsed **Product specifications & source** section.

The guide is an aggregated product listing, rather than a complete SKU matrix.
Conditional specifications are retained in that disclosure. Specifications
missing from the source can be entered from the current product IFU. Product
selection records a proposed configuration; it does not establish stock levels
or automatically add it to the case.

Other additions include Quick-Cross, Rubicon, Seeker, TrailBlazer and Turnpike
support catheters; drug-coated and specialty PTA balloons; peripheral bare,
drug-eluting and covered stents; and additional atherectomy, crossing, IVL,
peripheral IVUS, embolic-protection, arterial thrombectomy, catheter-directed
infusion and retrieval devices. Coronary-only IVUS and unrelated neurovascular,
venous-only and nonvascular device categories were excluded from these additions.
The original PTA-balloon catalogue and familiar catheter labels remain supported.

Abbott Command wires use the manufacturer's ordering tables: Command 14 ST
and MT have 210/300 cm lengths and straight/angled tips; Command and Command ES
have 190/250/300 cm lengths; Command 18 ST and LT have 210/300 cm lengths.
Tip shape is a filter and is retained in the plan, summary and materials list.
Additional HydroSteer, Connect, Connect Flex, Approach Hydro ST and Roadrunner
variants are available. Existing named-wire lengths were checked against the
guide's explicit length lists.

The local-setup control is now **Select locally available devices**. Its choices
are shown under **Prefered devices**, as requested. Existing browser-local
preference profiles remain usable.

## Anonymous code and report appearance

The optional **Patient ID code (anonymous)** field appears at the start of
Clinical indication. It accepts up to 48 characters, is saved with the local
case and appears at the right of the Case summary heading. Existing drafts
default to an empty code. It is not included in the report filename.

Every PDF page, including continuation and materials pages, carries the code
in its upper blue header. The original icon-and-wordmark PNG replaces the
drawn EndoPlanner name, on a white panel that preserves its original colours.
Primary controls, blue boxes and report accents use **#102c68**, matching
Endoplanner At a Glance. Semantic wound colours and red/amber findings retain
their meanings.

The WIfI prognosis paragraph is shown in its guideline popup, alongside the
stage-specific recommendations and existing guideline citation. The summary
button is labelled **See CTLI guideline prognosis and recommendations**, as
requested. This presentation change does not change the clinical calculation
or recommendation rules.

## Updating the bundled facts

Run from the repository root:

```bash
python scripts/update-device-guide.py --cache-dir /tmp/endoplanner-device-guide --refresh
```

The script retains source URLs and reviewed row counts in
`src/data/deviceGuideProducts.json`. Omit `--refresh` to reproduce an import
from an existing cache, and use `--review-date YYYY-MM-DD` for that snapshot.
Review imported ranges, conditional specifications and category relevance;
run unit/browser checks and rebuild the production assets before release.

Sources:

- [European Device Guide](https://evtoday.com/device-guide/european)
- [Standard sheaths](https://evtoday.com/device-guide/european/standard-sheaths-1)
- [Reinforced sheaths](https://evtoday.com/device-guide/european/reinforced-sheaths-1)
- [Special-access sheaths](https://evtoday.com/device-guide/european/special-access-sheaths-1)
- [Abbott Command 14 family](https://www.cardiovascular.abbott/int/en/hcp/products/peripheral-intervention/guide-wires/workhorse/hi-torque-command.html)
- [Abbott Command 18 ST/LT](https://www.cardiovascular.abbott/content/cv/cardiovascular/us/en/hcp/products/peripheral-intervention/guide-wires/workhorse/hi-torque-command-018.html)

Each imported category's exact URL and row count are also recorded in the JSON.
