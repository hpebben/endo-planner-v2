export const references = [
  {
    number: 1,
    citation:
      'Conte MS, Bradbury AW, Kolh P, et al. Global vascular guidelines on the management of chronic limb-threatening ischemia. Eur J Vasc Endovasc Surg. 2019;58(1S):S1–S109.',
    pdf: 'https://esvs.org/wp-content/uploads/2021/08/CLTI-Guidelines-ESVS-SVS-WFVS.pdf',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/31182334//',
  },
  {
    number: 2,
    citation:
      'Mills JL Sr, Conte MS, Armstrong DG, et al. The Society for Vascular Surgery Lower Extremity Threatened Limb Classification System: Risk stratification based on wound, ischemia, and foot infection (WIfI). J Vasc Surg. 2014;59(1):220–34.e1–2.',
    pdf: 'https://www.jvascsurg.org/article/S0741-5214(13)01458-X/fulltext',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/24126108/',
  },
  {
    number: 3,
    citation:
      'Norgren L, Hiatt WR, Dormandy JA, et al. Inter-Society Consensus for the Management of Peripheral Arterial Disease (TASC II). J Vasc Surg. 2007;45(Suppl S):S5–S67.',
    pdf: 'https://www.jvascsurg.org/article/S0741-5214(06)02278-8/fulltext',
    pubmed: 'https://pubmed.ncbi.nlm.nih.gov/17223489/',
  },
];

export const getReference = (number) =>
  references.find((r) => r.number === number);
