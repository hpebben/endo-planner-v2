export const references = [
  {
    number: 1,
    citation:
      'Mills JL Sr, et al. The Society for Vascular Surgery WIfI classification system. J Vasc Surg. 2014;59(1):220-34.e2.',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/24126108/',
    fulltext:
      'https://www.jvascsurg.org/article/S0741-5214(13)01515-2/fulltext#tbl4',
    images: [
      'https://www.jvascsurg.org/cms/10.1016/j.jvs.2013.08.003/asset/7426eab0-cc9b-4d17-bbe6-e498f115f9f5/main.assets/fx3_lrg.jpg',
    ],
    imageClass: 'wifi-img',
  },
  {
    number: 2,
    citation:
      'Conte MS, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. Eur J Vasc Endovasc Surg. 2019;58(1S):S1-S109.e33.',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31182334/',
    fulltext:
      'https://www.ejves.com/article/S1078-5884(19)30380-6/fulltext',
    html: `<table class="guideline-table"><thead><tr><th>Grade</th><th>Femoro-popliteal</th><th>Infrapopliteal</th></tr></thead><tbody><tr><td>0</td><td>No significant disease</td><td>Single tibial vessel to foot</td></tr><tr><td>1</td><td>Short stenosis or occlusion &lt;5 cm</td><td>Moderate disease in &lt;2 tibial vessels</td></tr><tr><td>2</td><td>Lesion 5–15 cm or occlusion &lt;5 cm</td><td>Severe disease in &lt;2 tibial vessels</td></tr><tr><td>3</td><td>Long occlusion &gt;15 cm or heavy calcification</td><td>Diffuse tibial occlusive disease</td></tr><tr><td>4</td><td>Chronic occlusion &gt;20 cm with poor target</td><td>No continuous tibial runoff</td></tr></tbody></table>`,
    images: [
      'https://www.ejves.com/cms/10.1016/j.ejvs.2019.05.006/asset/6384e629-35d6-4ce0-8f18-c49591e7aa7a/main.assets/gr7_lrg.jpg',
      'https://www.ejves.com/cms/10.1016/j.ejvs.2019.05.006/asset/d105245a-002c-4694-9eb9-a7ba89a7fd80/main.assets/gr8_lrg.jpg',
    ],
    captions: ['FP grade example', 'IP grade example'],
    imageClass: 'glass-img',
  },
  {
    number: 3,
    citation:
      'Norgren L, Hiatt WR, Dormandy JA, et al. Inter-Society Consensus for the Management of Peripheral Arterial Disease (TASC II). J Vasc Surg. 2007;45(Suppl S):S5–S67.',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/17223489/',
  },
  {
    number: 4,
    citation:
      'Jaff MR, White CJ, Hiatt WR, et al. An Update on Methods for Revascularization and Expansion of the TASC Lesion Classification to Include Below-the-Knee Arteries: A Supplement to the Inter-Society Consensus for the Management of Peripheral Arterial Disease (TASC II). J Endovasc Ther. 2015;22(5):663–77.',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/26268268/',
  },
  {
    number: 5,
    citation:
      'Adam DJ, Beard JD, Cleveland T, et al. Bypass versus angioplasty in severe ischaemia of the leg (BASIL): multicentre, randomised controlled trial. Lancet. 2005;366(9501):1925–34.',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/16325693/',
  },
];

export const getReference = (number) =>
  references.find((r) => r.number === number);
