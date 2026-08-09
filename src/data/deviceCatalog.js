import {
  PTA_BALLOON_GUIDE_PRODUCTS,
  PTA_BALLOON_GUIDE_URL,
} from './ptaBalloonCatalog';

export { PTA_BALLOON_GUIDE_URL };

export const EUROPEAN_DEVICE_GUIDE_URL = 'https://evtoday.com/device-guide/european';
const MERIT_ANGIOGRAPHY_CATALOG_URL = 'https://www.merit.com/wp-content/uploads/2014/09/PI-Angiography.pdf';
const COOK_CXI_URL = 'https://www.cookmedical.com/products/di_cxi_webds/';
const TERUMO_NAVICROSS_URL = 'https://www.terumois.com/products/product-type/catheters/navicross.html';
const TERUMO_GLIDECATH_URL = 'https://www.terumois.com/products/product-type/catheters/glidecath.html';
const CORDIS_CATHETER_CATALOG_URL = 'https://cordis.com/na/skus/p26';

const list = (...values) => values.flat().filter(Boolean).map(String);
const fr = (...values) => list(values).map((value) => `${value} Fr`);
const cm = (...values) => list(values).map((value) => `${value} cm`);

const product = (manufacturer, name, specifications = {}) => ({
  manufacturer,
  name,
  label: `${manufacturer} — ${name}`,
  source: EUROPEAN_DEVICE_GUIDE_URL,
  categories: [],
  platforms: [],
  functionalRoles: [],
  types: [],
  materials: [],
  sizes: [],
  diameters: [],
  lengths: [],
  shafts: [],
  deliveryModes: [],
  minimumSheaths: [],
  ...specifications,
});

// Keep the familiar, deliberately compact catheter list that predates the broad
// catalogue import. Each entry now exposes only the French sizes and working
// lengths actually available for that named catheter/shape.
export const CATHETER_CATALOG = [
  product('Merit Medical / Terumo', 'BER2', { label: 'BER2', source: TERUMO_GLIDECATH_URL, categories: ['Selective diagnostic'], platforms: list('0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Cordis', 'BHW', { label: 'BHW', source: CORDIS_CATHETER_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035'), sizes: fr('5'), lengths: cm('100'), minimumSheaths: fr('5') }),
  product('Merit Medical', 'Cobra 1', { label: 'Cobra 1', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical', 'Cobra 2', { label: 'Cobra 2', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Cordis', 'Cobra 3', { label: 'Cobra 3', source: CORDIS_CATHETER_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035'), sizes: fr('5'), lengths: cm('65'), minimumSheaths: fr('5') }),
  product('Terumo', 'Cobra Glidecath', { label: 'Cobra Glidecath', source: TERUMO_GLIDECATH_URL, categories: ['Selective hydrophilic'], platforms: list('0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Cook Medical', 'CXI 0.018', { label: 'CXI 0.018', source: COOK_CXI_URL, categories: ['Support / crossing'], platforms: list('0.018'), sizes: fr('2.6'), lengths: cm('65', '90', '135', '150'), minimumSheaths: fr('3') }),
  product('Cook Medical', 'CXI 0.014', { label: 'CXI 0.014', source: COOK_CXI_URL, categories: ['Support / crossing'], platforms: list('0.014'), sizes: fr('2.3'), lengths: cm('65', '90', '135', '150'), minimumSheaths: fr('3') }),
  product('Terumo', 'Navicross 0.018', { label: 'Navicross 0.018', source: TERUMO_NAVICROSS_URL, categories: ['Support / crossing'], platforms: list('0.018'), sizes: fr('2.6'), lengths: cm('65', '90', '135', '150'), minimumSheaths: fr('2.6') }),
  product('Terumo', 'Navicross 0.035', { label: 'Navicross 0.035', source: TERUMO_NAVICROSS_URL, categories: ['Support / crossing'], platforms: list('0.035'), sizes: fr('4'), lengths: cm('65', '90', '135', '150'), minimumSheaths: fr('4') }),
  product('Merit Medical', 'MultiPurpose', { label: 'MultiPurpose', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.038'), sizes: fr('4', '5'), lengths: cm('65', '100', '125'), minimumSheaths: fr('4', '5') }),
  product('Cordis', 'PIER', { label: 'PIER', source: CORDIS_CATHETER_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035'), sizes: fr('5'), lengths: cm('65'), minimumSheaths: fr('5') }),
  product('Merit Medical / Cordis', 'Pigtail Flush', { label: 'Pigtail Flush', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Flush'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('30', '65', '80', '90', '100', '110'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical / Cordis', 'Straight Flush', { label: 'Straight Flush', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Flush'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '90', '100'), minimumSheaths: fr('4', '5') }),
  product('Cordis', 'Universal Flush', { label: 'Universal Flush', source: CORDIS_CATHETER_CATALOG_URL, categories: ['Flush'], platforms: list('0.035'), sizes: fr('5'), lengths: cm('65'), minimumSheaths: fr('5') }),
  product('Merit Medical / Cordis', 'Rim', { label: 'Rim', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035'), sizes: fr('4', '5'), lengths: cm('30', '65'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical / Terumo', 'Simmons 1', { label: 'Simmons 1', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical / Terumo', 'Simmons 2', { label: 'Simmons 2', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '100'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical / Terumo', 'Simmons 3', { label: 'Simmons 3', source: TERUMO_GLIDECATH_URL, categories: ['Selective diagnostic'], platforms: list('0.038'), sizes: fr('4', '5'), lengths: cm('100'), minimumSheaths: fr('4', '5') }),
  product('Merit Medical / Cordis', 'Vertebral', { label: 'Vertebral', source: MERIT_ANGIOGRAPHY_CATALOG_URL, categories: ['Selective diagnostic'], platforms: list('0.035', '0.038'), sizes: fr('4', '5'), lengths: cm('65', '80', '100', '125'), minimumSheaths: fr('4', '5') }),
];

const vesselPrep = ['Vessel preparation', 'Definitive angioplasty', 'Post-dilatation'];

export const BALLOON_CATALOG = [
  product('BD Interventional', 'Lutonix 018 DCB', { categories: ['Drug-coated'], platforms: list('0.018'), functionalRoles: vesselPrep, diameters: list('4', '5', '6', '7'), lengths: list('40', '60', '80', '100', '120', '150', '220'), shafts: cm('100', '130'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4', '5') }),
  product('BD Interventional', 'Lutonix 035 DCB', { categories: ['Drug-coated'], platforms: list('0.035'), functionalRoles: vesselPrep, diameters: list('4', '5', '6', '7', '8', '10', '12'), lengths: list('40', '60', '80', '100', '120', '150'), shafts: cm('75', '100', '130'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('5', '7', '8', '10') }),
  product('Medtronic', 'IN.PACT 018 DCB', { categories: ['Drug-coated'], platforms: list('0.018'), functionalRoles: vesselPrep, diameters: list('4', '5', '6', '7'), lengths: list('40', '60', '80', '100', '120', '150'), shafts: cm('80', '130'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('5', '6') }),
  product('Medtronic', 'IN.PACT Admiral DCB', { categories: ['Drug-coated'], platforms: list('0.035'), functionalRoles: vesselPrep, diameters: list('4', '5', '6', '7', '8', '10', '12'), lengths: list('40', '60', '80', '120', '150', '200', '250'), shafts: cm('40', '80', '130'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('5', '6', '7') }),
  product('iVascular', 'Luminor 14 DCB', { categories: ['Drug-coated'], platforms: list('0.014'), functionalRoles: vesselPrep, diameters: list('2', '2.5', '3', '3.5', '4'), lengths: list('20', '40', '60', '80', '100', '120', '150', '200'), shafts: cm('90', '150'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4') }),
  product('iVascular', 'Luminor 18 DCB', { categories: ['Drug-coated'], platforms: list('0.018'), functionalRoles: vesselPrep, diameters: list('2', '2.5', '3', '4', '5', '6', '7'), lengths: list('40', '60', '80', '100', '120', '150', '200'), shafts: cm('90', '130', '150'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4', '5') }),
  product('Boston Scientific', 'Ranger DCB', { categories: ['Drug-coated'], platforms: list('0.018'), functionalRoles: vesselPrep, diameters: list('2', '2.5', '3', '4', '5', '6', '7', '8'), lengths: list('40', '60', '80', '100', '120', '150', '200'), shafts: cm('90', '135', '150'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4', '5', '6') }),
  product('Biotronik', 'Passeo-18 Lux DCB', { categories: ['Drug-coated'], platforms: list('0.018'), functionalRoles: vesselPrep, diameters: list('2', '2.5', '3', '4', '5', '6', '7'), lengths: list('40', '60', '80', '100', '120', '150'), shafts: cm('90', '130'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4', '5') }),
  product('MedAlliance', 'Selution SLR DCB', { categories: ['Drug-coated'], platforms: list('0.014', '0.018'), functionalRoles: vesselPrep, diameters: list('2', '2.5', '3', '3.5', '4', '5', '6', '7'), lengths: list('40', '60', '80', '100', '120', '150'), shafts: cm('90', '130', '150'), deliveryModes: ['Over-the-wire'], minimumSheaths: fr('4', '5', '6') }),
  ...PTA_BALLOON_GUIDE_PRODUCTS.map((item) => product(item.manufacturer, item.name, {
    ...(item.catalogLabel ? { label: item.catalogLabel } : {}),
    source: PTA_BALLOON_GUIDE_URL,
    categories: [item.category],
    platforms: item.platforms,
    functionalRoles: vesselPrep,
    diameters: item.diameters,
    lengths: item.lengths,
    shafts: item.shafts,
    deliveryModes: item.deliveryModes,
    minimumSheaths: item.minimumSheaths,
    nominalPressure: item.nominalPressure,
    ratedBurstPressure: item.ratedBurstPressure,
  })),
];

export const PTA_BALLOON_CATALOG = BALLOON_CATALOG.slice(9);

const primaryStentRoles = ['Primary scaffolding', 'Bailout / dissection', 'Relining'];

export const STENT_CATALOG = [
  product('Abbott', 'Absolute Pro Peripheral Stent', { categories: ['Self-expanding bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('20', '30', '40', '60', '80', '100'), shafts: cm('80', '135'), minimumSheaths: fr('6') }),
  product('Boston Scientific', 'Innova Self-Expanding Stent', { categories: ['Self-expanding bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8'), lengths: list('20', '40', '60', '80', '100', '120', '150', '180', '200'), shafts: cm('75', '130'), minimumSheaths: fr('6') }),
  product('Medtronic', 'EverFlex Entrust', { categories: ['Self-expanding bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8'), lengths: list('20', '40', '60', '80', '100', '120', '150'), shafts: cm('80', '120', '150'), minimumSheaths: fr('5') }),
  product('BD Interventional', 'LifeStent 5F', { categories: ['Self-expanding bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('5', '6', '7'), lengths: list('20', '30', '40', '60', '80', '100', '120', '150', '170'), shafts: cm('80', '135'), minimumSheaths: fr('5') }),
  product('Teleflex', 'Pulsar-18 T3', { categories: ['Self-expanding bare'], platforms: list('0.018'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('4', '5', '6', '7'), lengths: list('20', '30', '40', '60', '80', '100', '120', '150', '170', '200'), shafts: cm('90', '135'), minimumSheaths: fr('4') }),
  product('Abbott', 'Supera Peripheral Stent', { categories: ['Self-expanding bare'], platforms: list('0.018'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('4.5', '5', '5.5', '6', '6.5', '7', '7.5'), lengths: list('20', '30', '40', '60', '80', '100', '120', '150', '180', '200'), shafts: cm('80', '120'), minimumSheaths: fr('6') }),
  product('Cook Medical', 'Zilver Flex', { categories: ['Self-expanding bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('20', '30', '40', '60', '80', '100', '120', '140', '170', '200'), shafts: cm('80', '125'), minimumSheaths: fr('6') }),
  product('Bentley InnoMed', 'BeSmooth', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('18', '23', '27', '38', '57'), shafts: cm('75', '120'), minimumSheaths: fr('6') }),
  product('Biotronik', 'Dynamic', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('15', '25', '38', '56'), shafts: cm('80', '130'), minimumSheaths: fr('6', '7') }),
  product('Biotronik', 'Dynetic-35', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('18', '28', '38', '58', '78'), shafts: cm('90', '130', '170'), minimumSheaths: fr('6') }),
  product('Boston Scientific', 'Express LD', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('6', '7', '8', '9', '10'), lengths: list('17', '25', '27', '37', '57'), shafts: cm('75', '135'), minimumSheaths: fr('6', '7') }),
  product('Cook Medical', 'Formula 418', { categories: ['Balloon-expandable bare'], platforms: list('0.018'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('3', '4', '5', '6', '7', '8'), lengths: list('12', '16', '20', '30'), shafts: cm('80', '135'), minimumSheaths: fr('5', '6') }),
  product('Cook Medical', 'Formula 535', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('4', '5', '6', '7', '8', '9', '10'), lengths: list('12', '20', '30', '40', '60'), shafts: cm('80', '135'), minimumSheaths: fr('5', '6', '7') }),
  product('Abbott', 'Omnilink Elite', { categories: ['Balloon-expandable bare'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('4', '5', '6', '7', '8', '9', '10'), lengths: list('12', '16', '19', '29', '39', '59'), shafts: cm('80', '135'), minimumSheaths: fr('6') }),
  product('Biotronik', 'Pro-Kinetic Energy Explorer', { categories: ['Balloon-expandable bare'], platforms: list('0.014'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['bare metal'], diameters: list('2', '2.5', '3', '3.5', '4', '4.5', '5'), lengths: list('9', '15', '20', '30', '40'), shafts: cm('140'), minimumSheaths: fr('4') }),
  product('Boston Scientific', 'Eluvia Drug-Eluting Stent', { categories: ['Drug-eluting'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['drug-eluting'], diameters: list('6', '7'), lengths: list('40', '60', '80', '100', '120', '150'), shafts: cm('75', '130'), minimumSheaths: fr('6') }),
  product('Cook Medical', 'Zilver PTX', { categories: ['Drug-eluting'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['self expandable'], materials: ['drug-eluting'], diameters: list('5', '6', '7', '8'), lengths: list('40', '60', '80', '100', '120', '140'), shafts: cm('80', '125'), minimumSheaths: fr('6') }),
  product('iVascular', 'Angiolite BTK', { categories: ['Drug-eluting'], platforms: list('0.014'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['drug-eluting'], diameters: list('2', '2.5', '3', '3.5', '4', '4.5'), lengths: list('9', '14', '19', '24', '29', '39'), shafts: cm('142'), minimumSheaths: fr('5') }),
  product('Getinge', 'Advanta V12', { categories: ['Balloon-expandable covered'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['covered'], diameters: list('5', '6', '7', '8', '9', '10', '12'), lengths: list('16', '22', '29', '32', '38', '41', '59', '61'), shafts: cm('80', '120'), minimumSheaths: fr('6', '7', '9') }),
  product('Bentley InnoMed', 'BeGraft Peripheral', { categories: ['Balloon-expandable covered'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['covered'], diameters: list('5', '6', '7', '8', '9', '10'), lengths: list('18', '23', '28', '38', '58'), shafts: cm('75', '120'), minimumSheaths: fr('6', '7') }),
  product('Gore', 'Viabahn VBX', { categories: ['Balloon-expandable covered'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['covered'], diameters: list('5', '6', '7', '8', '9', '10', '11'), lengths: list('15', '19', '29', '39', '59', '79'), shafts: cm('135'), minimumSheaths: fr('7', '8') }),
  product('BD Interventional', 'LifeStream Covered Stent', { categories: ['Balloon-expandable covered'], platforms: list('0.035'), functionalRoles: primaryStentRoles, types: ['balloon expandable'], materials: ['covered'], diameters: list('5', '6', '7', '8', '9', '10', '12'), lengths: list('16', '26', '37', '38', '58'), shafts: cm('80', '135'), minimumSheaths: fr('6', '7', '8') }),
];

export const SPECIAL_DEVICE_CATALOG = [
  product('Shockwave Medical', 'Shockwave E8 Peripheral IVL Catheter', { categories: ['Intravascular lithotripsy'], platforms: list('0.014'), diameters: list('2.5', '3', '3.5', '4', '5', '6'), lengths: list('80'), shafts: cm('150'), minimumSheaths: fr('5', '6') }),
  product('Shockwave Medical', 'Shockwave Javelin Peripheral IVL Catheter', { categories: ['Intravascular lithotripsy', 'CTO / re-entry'], platforms: list('0.014'), sizes: fr('1.5'), shafts: cm('150'), minimumSheaths: fr('5') }),
  product('Shockwave Medical', 'Shockwave L6 Peripheral IVL Catheter', { categories: ['Intravascular lithotripsy'], platforms: list('0.018'), diameters: list('8', '9', '10', '12'), lengths: list('30'), shafts: cm('110'), minimumSheaths: fr('7', '8') }),
  product('Shockwave Medical', 'Shockwave M5+ Peripheral IVL Catheter', { categories: ['Intravascular lithotripsy'], platforms: list('0.014'), diameters: list('3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '8'), lengths: list('60'), shafts: cm('135'), minimumSheaths: fr('6', '7') }),
  product('Shockwave Medical', 'Shockwave S4 Peripheral IVL Catheter', { categories: ['Intravascular lithotripsy'], platforms: list('0.014'), diameters: list('2.5', '3', '3.5', '4'), lengths: list('40'), shafts: cm('135'), minimumSheaths: fr('5') }),
  product('Auryon', 'Auryon Atherectomy System', { categories: ['Atherectomy'], platforms: list('0.014'), sizes: fr('0.9', '1.5', '1.7', '2', '2.35'), shafts: cm('110', '125', '135', '150', '225'), minimumSheaths: fr('4', '5', '6', '7') }),
  product('Medtronic', 'HawkOne Directional Atherectomy', { categories: ['Atherectomy'], platforms: list('0.014'), sizes: fr('6', '7'), shafts: cm('114', '135', '151'), minimumSheaths: fr('6', '7') }),
  product('Boston Scientific', 'Jetstream Atherectomy System', { categories: ['Atherectomy'], platforms: list('0.014'), sizes: fr('7'), shafts: cm('120', '135', '145'), minimumSheaths: fr('7') }),
  product('Philips', 'Turbo-Elite Laser Atherectomy Catheter', { categories: ['Atherectomy'], platforms: list('0.014', '0.018', '0.035'), sizes: fr('4', '5', '6', '7', '8'), shafts: cm('110', '125', '135', '150'), minimumSheaths: fr('4', '5', '6', '7', '8') }),
  product('BD Interventional', 'RotarexS 6F', { categories: ['Atherectomy', 'Thrombectomy'], platforms: list('0.018'), sizes: fr('6'), shafts: cm('110', '135'), minimumSheaths: fr('6') }),
  product('BD Interventional', 'RotarexS 8F', { categories: ['Atherectomy', 'Thrombectomy'], platforms: list('0.018'), sizes: fr('8'), shafts: cm('85', '110'), minimumSheaths: fr('8') }),
  product('Cardiovascular Systems', 'Stealth 360 Orbital Atherectomy', { categories: ['Atherectomy'], platforms: list('0.014'), sizes: fr('4', '6'), shafts: cm('145'), minimumSheaths: fr('4', '6') }),
  product('Cordis', 'Outback Elite Re-Entry Catheter', { categories: ['CTO / re-entry'], platforms: list('0.014'), sizes: fr('6'), shafts: cm('80', '120'), minimumSheaths: fr('6') }),
  product('Medtronic', 'Enteer Re-Entry System', { categories: ['CTO / re-entry'], platforms: list('0.014', '0.018'), sizes: fr('5'), shafts: cm('135', '150', '300'), minimumSheaths: fr('6') }),
  product('Bentley InnoMed', 'BeBack Crossing Catheter', { categories: ['CTO / re-entry'], platforms: list('0.014', '0.018'), sizes: fr('2.9', '4'), shafts: cm('80', '120'), minimumSheaths: fr('4', '6') }),
  product('Philips', 'Pioneer Plus IVUS-Guided Re-Entry Catheter', { categories: ['CTO / re-entry', 'IVUS'], platforms: list('0.014'), sizes: fr('6'), shafts: cm('120'), minimumSheaths: fr('6') }),
  product('Avinger', 'Ocelot OCT Crossing Catheter', { categories: ['CTO / re-entry', 'Intravascular imaging'], platforms: list('0.014'), sizes: fr('6'), shafts: cm('110'), minimumSheaths: fr('6') }),
  product('Avinger', 'Ocelot Pixl OCT Crossing Catheter', { categories: ['CTO / re-entry', 'Intravascular imaging'], platforms: list('0.014'), sizes: fr('5'), shafts: cm('135'), minimumSheaths: fr('5') }),
  product('Medtronic', 'Viance Crossing Catheter', { categories: ['CTO / re-entry'], platforms: list('0.014'), sizes: fr('5'), shafts: cm('150'), minimumSheaths: fr('5') }),
];

export const CATALOG_FIELD_MAP = {
  category: 'categories',
  platform: 'platforms',
  functionalRole: 'functionalRoles',
  type: 'types',
  material: 'materials',
  size: 'sizes',
  diameter: 'diameters',
  length: 'lengths',
  shaft: 'shafts',
  deliveryMode: 'deliveryModes',
  minimumSheathFr: 'minimumSheaths',
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const uniqueSorted = (values) => [...new Set(values.filter(Boolean).map(String))].sort(collator.compare);

export const getCatalogProduct = (catalog, label) => catalog.find((item) => item.label === label) || null;

export const catalogItemMatches = (item, filters = {}, ignoredField = '') => Object.entries(CATALOG_FIELD_MAP).every(
  ([field, itemField]) => (
    field === ignoredField || !filters[field] || (item[itemField] || []).includes(String(filters[field]))
  ),
);

const compactRange = (values = [], unit = '') => {
  if (!values.length) return '';
  if (values.length === 1) return `${values[0]}${unit}`;
  return `${values[0]}–${values[values.length - 1]}${unit}`;
};

export const formatCatalogSpecs = (item) => [
  item.platforms.length ? item.platforms.join('/') : '',
  item.sizes.length ? compactRange(item.sizes.map((value) => value.replace(' Fr', '')), 'F') : '',
  item.diameters.length ? `Ø ${compactRange(item.diameters, ' mm')}` : '',
  item.lengths.length
    ? `L ${item.lengths.some((value) => value.endsWith(' cm'))
      ? compactRange(item.lengths.map((value) => value.replace(' cm', '')), ' cm')
      : compactRange(item.lengths, ' mm')}`
    : '',
  item.shafts.length ? `shaft ${compactRange(item.shafts.map((value) => value.replace(' cm', '')), ' cm')}` : '',
  item.minimumSheaths.length ? `sheath ${item.minimumSheaths.join('/')}` : '',
].filter(Boolean).join(' | ');

export const getCatalogProductOptions = (catalog, filters = {}, preferredProducts = []) => {
  const preferenceOrder = new Map(preferredProducts.filter(Boolean).map((label, index) => [label, index]));
  return catalog
    .filter((item) => catalogItemMatches(item, filters))
    .sort((left, right) => {
      const leftRank = preferenceOrder.has(left.label) ? preferenceOrder.get(left.label) : Infinity;
      const rightRank = preferenceOrder.has(right.label) ? preferenceOrder.get(right.label) : Infinity;
      return leftRank - rightRank || left.label.localeCompare(right.label);
    })
    .map((item) => ({
      value: item.label,
      label: item.label,
      specs: formatCatalogSpecs(item),
      preferred: preferenceOrder.has(item.label),
    }));
};

export const getCatalogFilterOptions = (catalog, form = {}, field) => {
  const itemField = CATALOG_FIELD_MAP[field];
  if (!itemField) return [];
  const selectedProduct = getCatalogProduct(catalog, form.product || form.specific);
  const candidates = selectedProduct
    ? [selectedProduct]
    : catalog.filter((item) => catalogItemMatches(item, form, field));
  return uniqueSorted(candidates.flatMap((item) => item[itemField] || []));
};

export const reconcileCatalogProduct = (catalog, form = {}, selectedLabel, options = {}) => {
  const next = { ...form, product: selectedLabel };
  if (options.mirrorSpecific) next.specific = selectedLabel;
  const selectedProduct = getCatalogProduct(catalog, selectedLabel);
  if (!selectedProduct) return next;

  Object.entries(CATALOG_FIELD_MAP).forEach(([field, itemField]) => {
    const available = uniqueSorted(selectedProduct[itemField] || []);
    if (next[field] && !available.includes(String(next[field]))) next[field] = '';
    if (!next[field] && available.length === 1) next[field] = available[0];
  });
  return next;
};

export const clearCatalogFilters = (form = {}, fields = Object.keys(CATALOG_FIELD_MAP)) => fields.reduce(
  (next, field) => ({ ...next, [field]: '' }),
  { ...form },
);
