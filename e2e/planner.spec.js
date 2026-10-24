const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');

const STATE_KEY = 'endoplannerState';
const PROFILE_KEY = 'endoplanner.preferenceProfile';
const lesionId = 'Left_superficial_femoral_artery';
const targetPath = [
  'Left_common_femoral_artery',
  'Left_superficial_femoral_artery',
  'Left_popliteal_artery_artery',
  'Left_anterior_tibial_artery',
  'Left_dorsal_pedal_artery',
];

const baseCase = () => ({
  stage: 'iv',
  clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: ['dorsum'] },
  patencySegments: {
    [lesionId]: { type: 'occlusion', length: '>20', calcium: 'heavy' },
  },
  targetArterialPath: targetPath,
  targetArterialPathKey: 'anterior',
  targetArterialPathSide: 'Left',
  appliedPreferenceProfile: null,
});

const completeCase = () => ({
  ...baseCase(),
  accessRows: [
    {
      id: 'access-1',
      approach: 'Antegrade',
      side: 'Left',
      vessel: 'CFA',
      needles: [{ size: '21 Gauge', length: '7cm' }],
      sheaths: [{ frSize: '6 Fr', length: '25 cm' }],
      catheters: [{ specific: 'Navicross 0.018', size: '2.6 Fr', length: '135 cm' }],
    },
  ],
  navRows: [
    {
      id: 'nav-1',
      lesionId,
      wire: {
        platform: '0.018',
        length: '300 cm',
        role: 'CTO crossing',
        ctoProfile: 'Torque-controlled',
        technique: 'Limited sub-intimal dissection and re-entry',
        product: 'ASAHI Gladius MG 18 PV ES',
      },
    },
  ],
  therapyRows: [
    {
      id: 'therapy-1',
      lesionId,
      balloon: {
        platform: '0.018',
        diameter: '5',
        length: '120',
        shaft: '135 cm',
        deliveryMode: 'Over-the-wire',
        minimumSheathFr: '5 Fr',
      },
    },
  ],
  closureRows: [{ id: 'closure-1', method: 'Manual pressure' }],
});

const profile = {
  schemaVersion: 1,
  profileId: 'e2e-local-setup',
  revision: 2,
  name: 'Local setup',
  applicationVersion: '1.6.169',
  createdAt: '2026-08-02T09:00:00.000Z',
  updatedAt: '2026-08-02T10:00:00.000Z',
  preferences: {
    sheath: [{ id: 'pref-sheath', value: { frSize: '6 Fr', length: '25 cm' } }],
    wire: [
      {
        id: 'pref-wire',
        value: {
          platform: '0.018',
          length: '300 cm',
          role: 'CTO crossing',
          ctoProfile: 'Torque-controlled',
          technique: 'Limited sub-intimal dissection and re-entry',
          product: 'ASAHI Gladius MG 18 PV ES',
        },
      },
    ],
    balloon: [
      {
        id: 'pref-balloon',
        value: {
          platform: '0.018',
          diameter: '5',
          length: '120',
          shaft: '135 cm',
          deliveryMode: 'Over-the-wire',
          minimumSheathFr: '5 Fr',
        },
      },
    ],
    closureDevice: [{ id: 'pref-closure', value: '6F AngioSeal' }],
  },
};

async function seed(page, data, step, savedProfile = null) {
  await page.route('https://endoplanner.thesisapps.com/**', (route) => route.abort());
  await page.addInitScript(
    ({ stateKey, profileKey, caseData, currentStep, profileData }) => {
      if (!localStorage.getItem(stateKey)) localStorage.setItem(
        stateKey,
        JSON.stringify({
          schemaVersion: 3,
          savedAt: '2026-08-02T10:00:00.000Z',
          step: currentStep,
          data: caseData,
        })
      );
      if (profileData) localStorage.setItem(profileKey, JSON.stringify(profileData));
    },
    {
      stateKey: STATE_KEY,
      profileKey: PROFILE_KEY,
      caseData: data,
      currentStep: step,
      profileData: savedProfile,
    }
  );
}

test('offers local preferences as starred choices without adding unused devices', async ({ page }) => {
  await seed(page, baseCase(), 2, profile);
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Intervention plan', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key))?.data;
    return { nav: data?.navRows, therapy: data?.therapyRows, sheath: data?.accessRows?.[0]?.sheaths?.[0], closure: data?.closureRows?.[0]?.method || '' };
  }, STATE_KEY)).toEqual({ nav: [], therapy: [], sheath: {}, closure: '' });
  const composer = page.getByTestId('plan-scope-group-Lesion-1');
  await composer.getByRole('button', { name: 'Add crossing device', exact: true }).click();
  await composer.getByRole('button', { name: 'Wire', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('combobox', { name: 'Product' })).toContainText('★ ASAHI Gladius MG 18 PV ES');
  await dialog.getByRole('button', { name: /Choose starred device: ASAHI Gladius MG 18 PV ES/ }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(composer.getByRole('button', { name: 'ASAHI Gladius MG 18 PV ES', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sheath', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /Choose starred device: 6 Fr · 25 cm/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('radio', { name: 'Closure device', exact: true }).click();
  await expect(page.getByRole('radio', { name: '★ 6F AngioSeal', exact: true })).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: /Select locally available devices/ }).click();
  await expect(page.getByText('Profile v1 · revision 2')).toBeVisible();
  await page.getByRole('button', { name: 'Save setup', exact: true }).click();
  await expect.poll(() => page.evaluate((key) => {
    const data = JSON.parse(localStorage.getItem(key))?.data;
    return { nav: data?.navRows?.length, therapy: data?.therapyRows?.length, closure: data?.closureRows?.[0]?.device || '', revision: data?.appliedPreferenceProfile?.revision };
  }, STATE_KEY)).toEqual({ nav: 1, therapy: 0, closure: '', revision: 3 });
});

test('opens WIfI and GLASS guideline dialogs from the case summary', async ({ page }) => {
  await seed(page, completeCase(), 3);
  await page.goto('./');

  await page.getByRole('button', { name: /CLTI guideline prognosis and recommendations/i }).click();
  await expect(page.getByRole('dialog').locator('.modal-header')).toHaveText(/WIfI clinical stage/);
  await expect(page.getByRole('dialog').getByText('Guideline recommendations')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /recommendations for this GLASS stage/i }).click();
  await expect(page.getByRole('dialog').locator('.modal-header')).toHaveText(/GLASS stage/);
  await expect(page.getByRole('dialog').getByText('Expected 1-year limb-based patency')).toBeVisible();
});

for (const width of [1280, 390]) {
  test(`keeps devices in the correct intervention summary sections and lesion groups at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const data = completeCase(), ata = 'Left_anterior_tibial_artery';
    data.patencySegments[ata] = { type: 'occlusion', length: '3-10', calcium: 'moderate' };
    data.navRows[0].wire.product = 'SFA crossing wire';
    data.therapyRows[0].balloon.product = 'SFA treatment balloon';
    data.navRows.push({ id: 'nav-ata', lesionId: ata, wire: { product: 'ATA crossing wire', platform: '0.018', length: '300 cm' } });
    data.navRows.push({ id: 'nav-support', scope: { type: 'targetPath', ids: ['primary'] }, wire: { product: 'Shared route support wire', role: 'Support / exchange', platform: '0.018', length: '300 cm' } });
    data.therapyRows.push({ id: 'therapy-ata', lesionId: ata, balloon: { product: 'ATA treatment balloon', platform: '0.018', diameter: '3', length: '80', shaft: '135 cm' } });
    await seed(page, data, 3);
    await page.goto('./');
    const plan = page.locator('.intervention-plan');
    for (const title of ['Access', 'Navigation & crossing', 'Vessel preparation & therapy', 'Closure']) {
      await expect(plan.getByRole('region', { name: title, exact: true })).toBeVisible();
    }
    await expect(plan.getByRole('region', { name: 'Access', exact: true })).toContainText('21 Gauge');
    await expect(plan.getByRole('region', { name: 'Closure', exact: true })).toContainText('Manual pressure');
    const crossing = plan.getByRole('region', { name: 'Navigation & crossing', exact: true });
    const therapy = plan.getByRole('region', { name: 'Vessel preparation & therapy', exact: true });
    for (const [code, product] of [['Lesion 1', 'SFA'], ['Lesion 2', 'ATA']]) {
      await expect(crossing.locator('.lesion-plan-group').filter({ hasText: code })).toContainText(`${product} crossing wire`);
      await expect(therapy.locator('.lesion-plan-group').filter({ hasText: code })).toContainText(`${product} treatment balloon`);
    }
    await expect(crossing.locator('.lesion-plan-group').filter({ hasText: 'Shared route support wire' })).toContainText(/target arterial path/i);
    await expect(therapy).not.toContainText('Shared route support wire');
    await expect(therapy).not.toContainText('crossing wire');
    await expect(crossing).not.toContainText('treatment balloon');
    await expect(plan.getByRole('button', { name: 'Edit intervention plan', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('exports a PDF report from case data', async ({ page }) => {
  await seed(page, completeCase(), 3);
  await page.goto('./');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^EndoPlanner-Left-CLTI-\d{4}-\d{2}-\d{2}\.pdf$/);
  const stream = await download.createReadStream();
  expect(stream).not.toBeNull();
});

test('edits and validates the target arterial path directly on the vessel map', async ({ page }) => {
  await seed(page, baseCase(), 1);
  await page.goto('./');

  await page.getByRole('button', { name: 'Edit on map' }).click();
  await expect(page.getByTestId('target-path-editor')).toBeVisible();
  const plantarEndpoint = page.getByRole('button', {
    name: 'Set target route to Left plantar arch',
  });
  await plantarEndpoint.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Selected target route')).toContainText('posterior tibial artery');
  await expect(page.getByRole('button', { name: 'Use route' })).toBeEnabled();
  await page.getByRole('button', { name: 'Use route' }).click();

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return {
          schemaVersion: stored?.schemaVersion,
          key: stored?.data?.targetArterialPathKey,
          endpoint: stored?.data?.targetArterialPath?.at(-1),
        };
      }, STATE_KEY)
    )
    .toEqual({
      schemaVersion: 6,
      key: 'posterior',
      endpoint: 'Left_plantar_arch',
    });
});

test('plans lesions without a PATH tab and keeps shared support available in route context', async ({ page }) => {
  await seed(page, baseCase(), 2);
  await page.goto('./');

  const workspace = page.getByTestId('visual-intervention-planner');
  await expect(workspace.getByTestId('visual-scope-PATH')).toHaveCount(0);
  await expect(workspace.getByTestId('visual-scope-Lesion-1')).toContainText('Left superficial femoral artery');

  const support = workspace.locator('.visual-plan-schematic').getByTestId('shared-route-support');
  await expect(workspace.locator('.visual-plan-foot-context').getByTestId('shared-route-support')).toHaveCount(0);
  await support.getByText('Shared route support', { exact: true }).click();
  await support.getByRole('button', { name: /Add support device/ }).click();

  const sfaPlanningTarget = page.getByRole('button', {
    name: 'Plan devices for Left superficial femoral artery',
  });
  await sfaPlanningTarget.focus();
  await page.keyboard.press('Enter');
  const lesionComposer = workspace.getByTestId('plan-scope-group-Lesion-1');
  await lesionComposer.getByRole('button', { name: 'Add crossing device' }).click();
  await lesionComposer.getByRole('button', { name: 'Add treatment device' }).click();
  await expect(page.getByTestId('target-lesion-select')).toHaveCount(0);

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return {
          navScopes: (stored?.data?.navRows || []).map((row) => row.scope?.type).sort(),
          therapyScopes: (stored?.data?.therapyRows || []).map((row) => row.scope?.type).sort(),
        };
      }, STATE_KEY)
    )
    .toEqual({
      navScopes: ['lesion', 'targetPath'],
      therapyScopes: ['lesion'],
    });
});

test('shows chosen devices as schematics below the anatomy and selected woundosomes', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');

  const workspace = page.getByTestId('visual-intervention-planner');
  const lesionSummary = workspace.getByTestId('visual-scope-Lesion-1');
  await expect(lesionSummary).toContainText('ASAHI Gladius MG 18 PV ES');
  await expect(lesionSummary).toContainText('5 × 120 mm');
  await expect(lesionSummary.locator('.device-glyph--wire')).toHaveCount(1);
  await expect(lesionSummary.locator('.device-glyph--balloon')).toHaveCount(1);
  const wounds = workspace.getByTestId('selected-woundosomes');
  await expect(wounds.locator('[data-wound-id="dorsum"]')).toHaveCount(2);
  await expect(wounds.locator('[data-wound-id]')).toHaveCount(2);
  await expect(wounds.getByRole('checkbox')).toHaveCount(0);
  await expect(workspace.getByRole('region', { name: 'Target arterial path information' })).toContainText('dorsalis pedis artery');
  const positions = await workspace.evaluate((element) => {
    const context = element.querySelector('.visual-plan-context').getBoundingClientRect();
    const editing = element.querySelector('.visual-plan-editing').getBoundingClientRect();
    const keys = [...element.querySelectorAll('.visual-plan-legend-line')].map((line) => {
      const bounds = line.getBoundingClientRect();
      return { width: bounds.width, y: bounds.y, color: getComputedStyle(line).backgroundColor };
    });
    return { contextBottom: context.bottom, editingTop: editing.top, keys };
  });
  expect(positions.editingTop).toBeGreaterThan(positions.contextBottom);
  expect(positions.keys[0].width).toBe(positions.keys[1].width);
  expect(positions.keys[1].y).toBeGreaterThan(positions.keys[0].y);
  expect(positions.keys[1].color).toBe('rgb(217, 31, 75)');
});

test('starts device selection with preferred products and faceted specification filters', async ({ page }) => {
  const productFirstProfile = {
    ...profile,
    applicationVersion: '1.6.172',
    preferences: {
      ...profile.preferences,
      wire: [
        {
          id: 'pref-wire-product-first',
          value: {
            platform: '0.018',
            length: '300 cm',
            role: 'CTO crossing',
            ctoProfile: 'Torque-controlled / directional',
            technique: 'Intraluminal tracking',
            product: 'Asahi Intecc — Halberd',
          },
        },
      ],
      balloon: [
        {
          id: 'pref-balloon-product-first',
          value: {
            product: 'Medtronic — IN.PACT Admiral DCB',
            category: 'Drug-coated',
            platform: '0.035',
            functionalRole: 'Definitive angioplasty',
            diameter: '6',
            length: '120',
            shaft: '130 cm',
            deliveryMode: 'Over-the-wire',
            minimumSheathFr: '6 Fr',
          },
        },
      ],
    },
  };

  const data = completeCase();
  data.navRows[0].wire = productFirstProfile.preferences.wire[0].value;
  data.therapyRows[0].balloon = productFirstProfile.preferences.balloon[0].value;
  await seed(page, data, 2, productFirstProfile);
  await page.goto('./');

  // The selected devices were explicitly saved in the case; local preferences
  // only mark the corresponding selector options with stars.
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return stored?.data?.appliedPreferenceProfile;
      }, STATE_KEY)
    )
    .toMatchObject({ profileId: 'e2e-local-setup', revision: 2 });

  const lesionComposer = page
    .getByTestId('visual-intervention-planner')
    .getByTestId('plan-scope-group-Lesion-1');
  await lesionComposer
    .getByRole('button', { name: 'Asahi Intecc — Halberd', exact: true })
    .click();
  let dialog = page.getByRole('dialog');
  const wireProduct = dialog.getByRole('combobox', { name: 'Product' });
  await expect(wireProduct.locator('option:checked')).toContainText('★ Asahi Intecc — Halberd');
  await expect(dialog.locator('.product-specification-legend')).toContainText('Product | platform | available length');
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '235 cm' })).toBeVisible();
  await expect(dialog.getByTestId('filter-platform').getByRole('button', { name: '0.035' })).toHaveCount(0);
  await dialog.getByTestId('filter-length').getByRole('button', { name: '235 cm' }).click();
  await dialog.getByRole('button', { name: 'Done' }).click();

  await lesionComposer
    .getByRole('button', { name: 'Medtronic — IN.PACT Admiral DCB', exact: true })
    .click();
  dialog = page.getByRole('dialog');
  const balloonProduct = dialog.getByRole('combobox', { name: 'Product' });
  await expect(balloonProduct.locator('option:checked')).toContainText('★ Medtronic — IN.PACT Admiral DCB');
  await expect(dialog.getByTestId('filter-platform').getByRole('button', { name: '0.018' })).toHaveCount(0);
  await expect(dialog.getByTestId('filter-shaft').getByRole('button', { name: '80 cm' })).toBeVisible();
  await dialog.getByTestId('filter-shaft').getByRole('button', { name: '80 cm' }).click();
  await dialog.getByRole('button', { name: 'Done' }).click();

  await page.getByRole('button', { name: /Select locally available devices/ }).click();
  await page.getByRole('button', { name: 'Save setup', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return {
          wireLength: stored?.data?.navRows?.[0]?.wire?.length,
          balloonShaft: stored?.data?.therapyRows?.[0]?.balloon?.shaft,
        };
      }, STATE_KEY)
    )
    .toEqual({ wireLength: '235 cm', balloonShaft: '80 cm' });
});

test('limits French size and working length to the selected catheter', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');

  await page.getByRole('button', { name: 'Navicross 0.018', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  const product = dialog.getByRole('combobox', { name: 'Product' });
  await expect(product.locator('option:checked')).toContainText('Navicross 0.018');
  await expect(dialog.getByTestId('filter-catheter-size').getByRole('button', { name: '2.6 Fr' })).toBeVisible();
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '135 cm' })).toBeVisible();

  await dialog.getByRole('button', { name: 'Clear filters' }).click();
  await product.selectOption('PIER');
  await expect(dialog.getByTestId('filter-catheter-size').getByRole('button', { name: '5 Fr' })).toBeVisible();
  await expect(dialog.getByTestId('filter-catheter-size').getByRole('button', { name: '4 Fr' })).toHaveCount(0);
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '65 cm' })).toBeVisible();
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '100 cm' })).toHaveCount(0);
});

test('maps Fontaine IV wound locations to a wound-informed TAP consideration', async ({ page }) => {
  await seed(page, { ...baseCase(), clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: [] } }, 0);
  await page.goto('./');

  const selector = page.getByTestId('woundosome-selector');
  await expect(selector).toBeVisible();
  await expect(selector.getByTestId('woundosome-ap')).toBeVisible();
  await expect(selector.getByTestId('woundosome-lateral')).toBeVisible();
  await expect(selector.locator('svg image')).toHaveCount(0);
  await expect(selector.getByRole('button', { name: 'Woundosome anatomy information', exact: true })).toBeVisible();
  const arterialIds = [];
  for (const view of ['ap', 'lateral']) {
    const model = selector.getByTestId(`foot-anatomy-${view}`);
    await expect(model).toBeVisible();
    for (const id of ['dorsalis-pedis', 'deep-plantar', 'plantar-arch', 'medial-plantar', 'lateral-plantar', 'medial-calcaneal', 'lateral-calcaneal']) {
      await expect(model.locator(`[data-artery-id="${id}"]`)).toHaveAttribute('data-patency', 'patent');
    }
    arterialIds.push(await model.locator('[data-artery-id]').evaluateAll((paths) => paths.map((path) => path.dataset.arteryId).sort()));
  }
  expect(arterialIds[0]).toEqual(arterialIds[1]);
  await expect(selector.getByTestId('wound-landmark-ap-hallux')).toContainText('Hallux · medial');
  await expect(selector.getByTestId('wound-landmark-ap-fifth-ray')).toContainText('5th ray · lateral');
  await selector.getByTestId('wound-zone-ap-hallux-first-ray').locator('.wound-zone-marker').click();
  await expect(selector.getByTestId('wound-zone-lateral-hallux-first-ray')).toHaveAttribute('aria-checked', 'true');
  await expect(selector.getByRole('button', { name: 'Hallux / first ray', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(selector.getByText('Anterior tibial → dorsalis pedis target arterial path')).toBeVisible();
  await expect(selector.getByText('Posterior tibial → plantar arch target arterial path')).toBeVisible();
  await expect(selector).not.toContainText(/\bTAP\b/);
  await selector.getByRole('button', { name: 'Woundosome anatomy information', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /Manzi et al/ })).toHaveAttribute('href', 'https://pubs.rsna.org/doi/10.1148/rg.316115511');
  await page.keyboard.press('Escape');

  await expect.poll(() => page.evaluate((key) => (
    JSON.parse(localStorage.getItem(key))?.data?.clinical?.woundLocations
  ), STATE_KEY)).toEqual(['hallux-first-ray']);

  await selector.getByTestId('wound-zone-lateral-medial-heel').focus();
  await page.keyboard.press('Space');
  await expect(selector.getByRole('button', { name: 'Medial heel', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByTestId('wound-zone-ap-hallux-first-ray')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('wound-zone-lateral-medial-heel')).toHaveAttribute('aria-checked', 'true');
  await page.getByTestId('woundosome-selector').getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByTestId('woundosome-selector').locator('[aria-checked="true"]')).toHaveCount(0);
});

test('keeps option 7 on the fifth-ray side and all wound controls synchronized', async ({ page }) => {
  await seed(page, { ...baseCase(), clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: [] } }, 0);
  await page.goto('./');
  const selector = page.getByTestId('woundosome-selector');
  const position = async (id) => selector.getByTestId(`wound-zone-ap-${id}`).locator('.wound-zone-marker').evaluate((marker) => (
    [Number(marker.getAttribute('cx')), Number(marker.getAttribute('cy'))]
  ));
  const hallux = await position('hallux-first-ray');
  const lateralSole = await position('lateral-plantar');
  const landmark = async (id) => selector.getByTestId(`wound-landmark-ap-${id}`).locator('circle').evaluate((circle) => (
    [Number(circle.getAttribute('cx')), Number(circle.getAttribute('cy'))]
  ));
  const halluxTip = await landmark('hallux'), fifthTip = await landmark('fifth-ray');
  expect(Math.hypot(hallux[0] - halluxTip[0], hallux[1] - halluxTip[1])).toBeLessThan(65);
  expect(lateralSole[0]).toBeGreaterThan(fifthTip[0]);
  expect(lateralSole[0] - halluxTip[0]).toBeGreaterThan(200);
  await selector.getByTestId('wound-zone-ap-lateral-plantar').locator('.wound-zone-marker').click();
  await expect(selector.getByRole('button', { name: 'Lateral plantar foot / fifth-ray side', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(selector.getByRole('button', { name: 'Hallux / first ray', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await selector.getByRole('button', { name: 'Clear', exact: true }).click();

  const key = selector.locator('.woundosome-zone-list button');
  await expect(key).toHaveCount(9);
  for (let i = 0; i < 9; i += 1) await key.nth(i).click();
  await expect(key.locator('[aria-hidden="true"].wound-zone-check')).toHaveCount(9);
  await expect(selector.locator('[role="checkbox"][aria-checked="true"]')).toHaveCount(18);
  await page.reload();
  await expect(selector.locator('.woundosome-zone-list button[aria-pressed="true"]')).toHaveCount(9);
  // Dorsum is visible in both projections and toggles both controls together.
  await selector.getByTestId('wound-zone-lateral-dorsum').focus();
  await page.keyboard.press('Enter');
  await expect(selector.getByTestId('wound-zone-ap-dorsum')).toHaveAttribute('aria-checked', 'false');
  await expect(selector.getByRole('button', { name: 'Dorsum of foot', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('shows artery labels in both reference views without losing wound selections', async ({ page }) => {
  await seed(page, { ...baseCase(), clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: ['lateral-plantar'] } }, 0);
  await page.goto('./');
  const selector = page.getByTestId('woundosome-selector');
  const toggle = selector.getByTestId('foot-artery-label-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(selector.locator('.foot-artery-labels')).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  for (const view of ['ap', 'lateral']) {
    await expect(selector.getByTestId(`foot-artery-labels-${view}`)).toContainText('Deep plantar');
    await expect(selector.getByTestId(`wound-zone-${view}-lateral-plantar`)).toHaveAttribute('aria-checked', 'true');
  }
  await selector.getByTestId('wound-zone-lateral-hallux-first-ray').focus();
  await page.keyboard.press('Space');
  await expect(selector.getByTestId('wound-zone-ap-hallux-first-ray')).toHaveAttribute('aria-checked', 'true');
  await toggle.click();
  await expect(selector.locator('.foot-artery-labels')).toHaveCount(0);
  await expect(selector.getByTestId('wound-zone-lateral-hallux-first-ray')).toHaveAttribute('aria-checked', 'true');
});

test('shows WIfI and woundosome only in Fontaine IV while PAT is optional in every stage', async ({ page }) => {
  await seed(page, { ...baseCase(), stage: '', clinical: {} }, 0);
  await page.goto('./');
  const fontaine = page.getByRole('radiogroup', { name: 'Fontaine stage', exact: true });
  const pat = page.getByTestId('pat-assessment');
  for (const label of ['I Asymptomatic', 'IIa ≥200 m', 'IIb <200 m', 'III Rest pain']) {
    await fontaine.getByRole('radio', { name: label, exact: true }).click();
    await expect(page.getByTestId('wifi-assessment')).toHaveCount(0);
    await expect(page.getByTestId('woundosome-selector')).toHaveCount(0);
    await expect(pat).toBeVisible();
    await expect(pat.getByRole('button', { name: /Pedal acceleration time/ })).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Disease anatomy', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  }
  await fontaine.getByRole('radio', { name: 'IV Ulcer/gangrene', exact: true }).click();
  await expect(page.getByTestId('wifi-assessment')).toBeVisible();
  await expect(page.getByTestId('woundosome-selector')).toBeVisible();
  await expect(pat).toBeVisible();
  const gaps = await page.locator('.clinical-center').evaluate((element) => {
    const boxes = [...element.children].map((child) => child.getBoundingClientRect());
    return boxes.slice(1).map((box, index) => box.top - boxes[index].bottom);
  });
  expect(gaps.every((gap) => gap >= 24)).toBe(true);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Assess all three WIfI components.');
  await expect(page.getByRole('alert')).toContainText('Select at least one wound or gangrene location.');
});

test('preserves stage-specific assessments and PAT without leaking hidden results into summary or PDF', async ({ page }, testInfo) => {
  const data = completeCase();
  data.clinical.patMeasurements = [{ id: 'pat-1', artery: 'dorsalis-pedis', milliseconds: '120' }];
  await seed(page, data, 0);
  await page.goto('./');
  await page.getByRole('radiogroup', { name: 'Fontaine stage', exact: true }).getByRole('radio', { name: 'III Rest pain', exact: true }).click();
  await expect(page.getByTestId('wifi-assessment')).toHaveCount(0);
  await expect(page.getByTestId('woundosome-selector')).toHaveCount(0);
  await expect(page.getByTestId('pat-assessment').getByLabel('PAT (ms)', { exact: true })).toHaveValue('120');
  await page.reload();
  await expect(page.getByTestId('wifi-assessment')).toHaveCount(0);
  await expect(page.getByTestId('pat-assessment').getByLabel('PAT (ms)', { exact: true })).toHaveValue('120');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Woundosome route to consider', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const indication = page.locator('.case-summary__indication');
  await expect(indication).not.toContainText('WIfI');
  await expect(page.getByTestId('woundosome-summary')).toHaveCount(0);
  await expect(page.getByTestId('pat-summary')).toContainText('Dorsalis pedis artery — 120 ms — Category 1');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const download = await downloaded;
  const pdfPath = testInfo.outputPath('fontaine-iii-with-pat.pdf');
  await download.saveAs(pdfPath);
  expect(await download.failure()).toBeNull();
  const pdf = readFileSync(pdfPath, 'latin1');
  expect(pdf).not.toContain('WIfI:');
  expect(pdf).not.toContain('Wound location:');
  expect(pdf).not.toContain('Wound-informed target arterial path to consider:');
  expect(pdf).toContain('PAT: Dorsalis pedis artery');
  expect(pdf).toContain('120 ms');
  await indication.getByRole('button', { name: 'Edit clinical assessment', exact: true }).click();
  await page.getByRole('radiogroup', { name: 'Fontaine stage', exact: true }).getByRole('radio', { name: 'IV Ulcer/gangrene', exact: true }).click();
  await expect(page.getByRole('radiogroup', { name: 'Wound grade', exact: true }).getByRole('radio', { name: '2', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('wound-zone-ap-dorsum')).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('pat-assessment').getByLabel('PAT (ms)', { exact: true })).toHaveValue('120');
});

test('keeps PAT optional, classifies each measured artery and restores it after reload', async ({ page }) => {
  await seed(page, baseCase(), 0);
  await page.goto('./');
  const pat = page.getByTestId('pat-assessment');
  await expect(pat.getByRole('button', { name: /Pedal acceleration time/ })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Disease anatomy', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await pat.getByRole('button', { name: /Pedal acceleration time/ }).click();
  await pat.getByRole('button', { name: '+ Add PAT measurement', exact: true }).click();
  const first = pat.getByTestId('pat-measurement').first();
  await first.getByLabel('Artery measured', { exact: true }).selectOption('dorsalis-pedis');
  for (const [milliseconds, result] of [
    ['120', 'Category 1'], ['121', 'Category 2'], ['180', 'Category 2'],
    ['181', 'Category 3'], ['224', 'Category 3'], ['225', 'Boundary value'], ['226', 'Category 4'],
  ]) {
    await first.getByLabel('PAT (ms)', { exact: true }).fill(milliseconds);
    await expect(first.locator('.pat-category')).toContainText(result);
  }
  await pat.getByRole('button', { name: '+ Add another artery', exact: true }).click();
  const second = pat.getByTestId('pat-measurement').nth(1);
  await second.getByLabel('Artery measured', { exact: true }).selectOption('lateral-plantar');
  await second.getByLabel('PAT (ms)', { exact: true }).fill('160');
  await expect(second.locator('.pat-category')).toContainText('Category 2');
  await page.reload();
  await expect(pat.getByTestId('pat-measurement')).toHaveCount(2);
  await expect(pat.getByLabel('PAT (ms)', { exact: true }).first()).toHaveValue('226');
  await expect(pat.getByLabel('Artery measured', { exact: true }).nth(1)).toHaveValue('lateral-plantar');
  await pat.getByRole('button', { name: 'Remove PAT measurement 1', exact: true }).click();
  await expect(pat.getByTestId('pat-measurement')).toHaveCount(1);
  await expect(pat.getByLabel('PAT (ms)', { exact: true })).toHaveValue('160');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Disease anatomy', exact: true })).toBeVisible();
});

test('checks partially entered PAT without changing WIfI grading', async ({ page }) => {
  await seed(page, baseCase(), 0);
  await page.goto('./');
  const pat = page.getByTestId('pat-assessment');
  await pat.getByRole('button', { name: /Pedal acceleration time/ }).click();
  await pat.getByRole('button', { name: '+ Add PAT measurement', exact: true }).click();
  await pat.getByLabel('PAT (ms)', { exact: true }).fill('200');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose the artery measured for PAT.');
  await pat.getByLabel('Artery measured', { exact: true }).selectOption('medial-plantar');
  await pat.getByLabel('PAT (ms)', { exact: true }).fill('-5');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('positive whole number');
  await pat.getByRole('button', { name: 'Remove PAT measurement 1', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect.poll(() => page.evaluate((key) => (
    JSON.parse(localStorage.getItem(key))?.data?.clinical
  ), STATE_KEY)).toMatchObject({ wound: 2, ischemia: 2, infection: 1, patMeasurements: [] });
});

test('includes artery, PAT and category in the case summary and PDF', async ({ page }, testInfo) => {
  const data = completeCase();
  data.clinical.patMeasurements = [
    { id: 'pat-1', artery: 'dorsalis-pedis', milliseconds: '120' },
    { id: 'pat-2', artery: 'lateral-plantar', milliseconds: '200' },
  ];
  await seed(page, data, 3);
  await page.goto('./');
  const summary = page.getByTestId('pat-summary');
  await expect(summary).toContainText('Dorsalis pedis artery — 120 ms — Category 1');
  await expect(summary).toContainText('Lateral plantar artery — 200 ms — Category 3');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs(testInfo.outputPath('pat-summary.pdf'));
  expect(await download.failure()).toBeNull();
});

test('keeps colored wound selections and PAT inputs usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, baseCase(), 0);
  await page.goto('./');
  const selector = page.getByTestId('woundosome-selector');
  await expect(selector.getByTestId('woundosome-ap')).toBeVisible();
  await selector.getByRole('button', { name: 'Lateral heel', exact: true }).click();
  await expect(selector.getByTestId('wound-zone-lateral-lateral-heel')).toHaveAttribute('aria-checked', 'true');
  const pat = page.getByTestId('pat-assessment');
  await pat.getByRole('button', { name: /Pedal acceleration time/ }).click();
  await pat.getByRole('button', { name: '+ Add PAT measurement', exact: true }).click();
  await pat.getByLabel('Artery measured', { exact: true }).selectOption('arcuate');
  await pat.getByLabel('PAT (ms)', { exact: true }).fill('180');
  await expect(pat.getByTestId('pat-measurement').locator('.pat-category')).toContainText('Category 2');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('keeps TAP selection below the active disease-anatomy selectors', async ({ page }) => {
  await seed(page, baseCase(), 1);
  await page.goto('./');

  await page.locator('.segment-edit-trigger').first().click();
  await expect(page.locator('.param-box')).toBeVisible();

  const ordering = await page.evaluate(() => {
    const selectors = document.querySelector('.param-box');
    const tap = document.querySelector('[data-testid="target-path-selector"]');
    return Boolean(selectors && tap && (selectors.compareDocumentPosition(tap) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(ordering).toBe(true);
});

test('recommends a 6F rather than 8F AngioSeal for a 6F sheath', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');

  const advice = page.getByTestId('closure-advice');
  await expect(advice).toContainText('6F AngioSeal');
  await expect(advice).not.toContainText('8F AngioSeal');
});

for (const [level, mutate, expectedTitle] of [
  ['recommendation', () => {}, 'Document calcium modification and bailout strategy'],
  ['warning', (data) => { delete data.therapyRows[0].balloon.minimumSheathFr; }, 'Balloon introducer profile is unverified'],
  ['error', (data) => { data.therapyRows[0].balloon.platform = '0.014'; }, 'Balloon platform has no matching scoped wire'],
]) {
  test(`opens the plan review with ${level} severity and restores keyboard focus`, async ({ page }) => {
    const data = completeCase();
    mutate(data);
    await seed(page, data, 2);
    await page.goto('./');
    await expect(page.getByTestId('live-plan-considerations')).toHaveCount(0);
    const button = page.getByTestId('plan-review-button');
    await expect(button).toHaveClass(new RegExp(`plan-review-button--${level}`));
    await button.click();
    const dialog = page.getByRole('dialog', { name: 'Plan summary & recommendations', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Selected devices for this plan', { exact: true })).toBeVisible();
    await expect(dialog.getByTestId('recommendations-considerations')).toContainText(expectedTitle);
    await expect(dialog).toContainText('ASAHI Gladius MG 18 PV ES');
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  });
}

for (const [stage, woundLocations] of [['iii', ['dorsum']], ['iv', []]]) {
  test(`hides wound previews for Fontaine ${stage} with ${woundLocations.length} selected wounds`, async ({ page }) => {
    const data = completeCase();
    data.stage = stage;
    data.clinical.woundLocations = woundLocations;
    await seed(page, data, 2);
    await page.goto('./');
    await expect(page.getByTestId('selected-woundosomes')).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Target arterial path information' })).toBeVisible();
    await expect(page.getByTestId('visual-scope-Lesion-1')).toBeVisible();
  });
}

test('keeps unlinked legacy devices as starred selector choices across reloads', async ({ page }) => {
  const data = completeCase();
  const secondLesion = 'Left_anterior_tibial_artery';
  data.patencySegments[secondLesion] = { type: 'stenosis', length: '<3', calcium: 'none' };
  data.navRows.push({ id: 'unused-wire', wire: { product: 'Legacy unused wire', platform: '0.018', length: '300 cm', role: 'CTO crossing' } });
  data.therapyRows.push({ id: 'unused-balloon', balloon: { product: 'Legacy unused balloon', diameter: '3', length: '40', platform: '0.018', shaft: '150 cm', minimumSheathFr: '4 Fr', deliveryMode: 'Over-the-wire' } });
  await seed(page, data, 2);
  await page.goto('./');
  await expect(page.getByTestId('plan-scope-group-UNASSIGNED')).toHaveCount(0);
  await expect(page.getByTestId('visual-scope-Lesion-1')).toContainText('ASAHI Gladius MG 18 PV ES');
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key))?.data;
    return { nav: stored?.navRows?.length, therapy: stored?.therapyRows?.length, choices: stored?.planDeviceSuggestions?.navigation?.length };
  }, STATE_KEY)).toEqual({ nav: 1, therapy: 1, choices: 1 });
  await page.reload();
  await page.getByTestId('visual-scope-Lesion-2').click();
  const composer = page.getByTestId('plan-scope-group-Lesion-2');
  await composer.getByRole('button', { name: 'Add crossing device', exact: true }).click();
  await composer.getByRole('button', { name: 'Wire', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('combobox', { name: 'Product' })).toContainText('★ Legacy unused wire');
  await dialog.getByRole('button', { name: /Choose starred device: Legacy unused wire/ }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await composer.getByRole('button', { name: 'Add treatment device', exact: true }).click();
  await composer.getByRole('button', { name: 'Balloon', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Choose starred device: Legacy unused balloon/ }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key))?.data;
    return { wire: stored?.navRows?.[1]?.wire?.product, balloon: stored?.therapyRows?.[1]?.balloon?.product, scope: stored?.therapyRows?.[1]?.scope?.ids };
  }, STATE_KEY)).toEqual({ wire: 'Legacy unused wire', balloon: 'Legacy unused balloon', scope: [secondLesion] });
  await page.reload();
  await expect(page.getByTestId('visual-scope-Lesion-2')).toContainText('Legacy unused wire');
  await expect(page.getByTestId('visual-scope-Lesion-2')).toContainText('Legacy unused balloon');
});

test('keeps anatomy, wound previews and the review popup usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const data = completeCase();
  data.clinical.woundLocations = ['hallux-first-ray', 'lateral-plantar', 'medial-heel'];
  await seed(page, data, 2);
  await page.goto('./');
  await expect(page.getByTestId('selected-woundosomes').locator('[data-wound-id]')).toHaveCount(6);
  await expect(page.getByTestId('visual-scope-Lesion-1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await page.getByTestId('plan-review-button').click();
  const dialog = page.getByRole('dialog', { name: 'Plan summary & recommendations', exact: true });
  const bounds = await dialog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await dialog.getByRole('button', { name: 'Close plan review', exact: true }).click();
  await expect(page.getByTestId('plan-review-button')).toBeFocused();
});

test('does not assign an unlinked legacy choice just because only one lesion exists', async ({ page }) => {
  const data = baseCase();
  data.navRows = [{ id: 'unused-support', wire: { product: 'Unused local support wire', role: 'Support / exchange', platform: '0.035', length: '260 cm' } }];
  await seed(page, data, 2);
  await page.goto('./');
  await expect(page.getByTestId('visual-scope-Lesion-1')).toContainText('No devices yet');
  await expect.poll(() => page.evaluate((key) => {
    const stored = JSON.parse(localStorage.getItem(key))?.data;
    return { selected: stored?.navRows?.length, available: stored?.planDeviceSuggestions?.navigation?.[0]?.wire?.product };
  }, STATE_KEY)).toEqual({ selected: 0, available: 'Unused local support wire' });
  await page.getByTestId('plan-scope-group-Lesion-1').getByRole('button', { name: 'Add crossing device', exact: true }).click();
  await page.getByTestId('plan-scope-group-Lesion-1').getByRole('button', { name: 'Wire', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: /Choose starred device: Unused local support wire/ })).toBeVisible();
});


test('extends the saved target route into metatarsal and digital arteries and exports the selected branch', async ({ page }, testInfo) => {
  const data = completeCase();
  data.clinical.woundLocations = ['hallux-first-ray'];
  await seed(page, data, 1);
  await page.goto('./');
  const outflow = page.getByRole('combobox', { name: 'Pedal outflow target', exact: true });
  await expect(outflow).toHaveValue('dorsal-metatarsal-1');
  await outflow.selectOption('dorsal-digital-1-medial');
  const route = page.getByLabel('Selected target route', { exact: true });
  await expect(route).toContainText(/first dorsal metatarsal artery/i);
  await expect(route).toContainText(/dorsal digital artery, toe 1, medial/i);
  for (const view of ['ap', 'lateral']) {
    const foot = page.getByTestId('selected-woundosomes').getByTestId(`foot-anatomy-${view}`);
    await expect(foot.locator('[data-route-artery-id="dorsal-metatarsal-1"]')).toHaveCount(1);
    await expect(foot.locator('[data-route-artery-id="dorsal-digital-1-medial"]')).toHaveCount(1);
  }
  await page.reload();
  await expect(outflow).toHaveValue('dorsal-digital-1-medial');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Target arterial path information' })).toContainText(/dorsal digital artery, toe 1, medial/i);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const download = await downloaded;
  const file = testInfo.outputPath('pedal-digital-route.pdf');
  await download.saveAs(file);
  const pdfText = [...readFileSync(file, 'latin1').matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj/g)].map((match) => match[1]).join(' ');
  expect(pdfText).toContain('digital artery, toe 1, medial');
});

test('routes plantar and heel wounds through the correct named branches', async ({ page }) => {
  const data = completeCase();
  data.clinical.woundLocations = ['lateral-plantar', 'lateral-heel', 'plantar-toes'];
  await seed(page, data, 1);
  await page.goto('./');
  const inflow = page.getByRole('radiogroup', { name: 'Distal target artery', exact: true });
  await inflow.getByRole('radio', { name: /Posterior tibial/ }).click();
  const outflow = page.getByRole('combobox', { name: 'Pedal outflow target', exact: true });
  await expect(outflow).toHaveValue('lateral-plantar');
  await outflow.selectOption('plantar-metatarsal-3');
  const route = page.getByLabel('Selected target route', { exact: true });
  await expect(route).toContainText(/posterior tibial artery.*lateral plantar artery.*deep plantar arch.*3 plantar metatarsal artery/i);
  await inflow.getByRole('radio', { name: /Peroneal/ }).click();
  await expect(outflow).toHaveValue('lateral-calcaneal');
  await expect(route).toContainText(/peroneal lateral calcaneal branch/i);
  for (const view of ['ap', 'lateral']) {
    const foot = page.getByTestId('selected-woundosomes').getByTestId(`foot-anatomy-${view}`);
    await expect(foot.locator('[data-route-artery-id="lateral-calcaneal"]')).toHaveCount(1);
    await expect(foot.locator('[data-route-artery-id="dorsalis-pedis"]')).toHaveCount(0);
  }
});

test('shows a 5 cm lesion as a short red fill inside a red-outlined SFA and preserves it in planning and PDF', async ({ page }, testInfo) => {
  await seed(page, completeCase(), 1);
  await page.goto('./');
  await page.locator('.segment-edit-trigger').first().click();
  const editor = page.locator('.param-box');
  await editor.getByText('Lesion extent on map (optional)', { exact: true }).click();
  await editor.getByRole('spinbutton', { name: 'Measured lesion length (cm)', exact: true }).fill('5');
  await editor.getByRole('button', { name: 'Save lesion', exact: true }).click();
  const artery = page.getByRole('button', { name: 'Left superficial femoral artery', exact: true });
  expect(Number(await artery.getAttribute('data-lesion-fraction'))).toBeCloseTo(5 / 35);
  await expect(artery.locator('.vessel-segment')).toHaveCSS('fill', 'rgb(34, 42, 50)');
  await expect(artery.locator('.vessel-segment')).toHaveCSS('stroke', 'rgb(217, 31, 75)');
  await expect(artery.locator('.vessel-lesion-fill')).toHaveCount(1);
  await expect(artery.locator('.vessel-lesion-fill')).toHaveAttribute('clip-path', /url/);
  await expect(page.locator('.segment-edit-trigger').first()).toContainText('5 cm');
  await page.reload();
  expect(Number(await artery.getAttribute('data-lesion-fraction'))).toBeCloseTo(5 / 35);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const planned = page.getByRole('button', { name: 'Plan devices for Left superficial femoral artery', exact: true });
  expect(Number(await planned.getAttribute('data-lesion-fraction'))).toBeCloseTo(5 / 35);
  await expect(page.getByTestId('plan-scope-group-Lesion-1').locator('.visual-plan-composer-header')).toContainText('5 cm');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const download = await downloaded;
  const file = testInfo.outputPath('measured-lesion.pdf');
  await download.saveAs(file);
  expect(readFileSync(file, 'latin1')).toContain('5 cm');
});

test('lets the user override the drawing reference without changing the measured lesion length', async ({ page }) => {
  const data = completeCase();
  data.patencySegments[lesionId].measuredLengthCm = '5';
  data.patencySegments[lesionId].length = '3-10';
  await seed(page, data, 1);
  await page.goto('./');
  await page.locator('.segment-edit-trigger').first().click();
  const editor = page.locator('.param-box');
  await editor.getByText('Lesion extent on map (optional)', { exact: true }).click();
  await editor.getByRole('spinbutton', { name: 'Arterial segment reference length (cm)', exact: true }).fill('40');
  await editor.getByRole('button', { name: 'Save lesion', exact: true }).click();
  expect(Number(await page.getByRole('button', { name: 'Left superficial femoral artery', exact: true }).getAttribute('data-lesion-fraction'))).toBeCloseTo(0.125);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key))?.data?.patencySegments?.Left_superficial_femoral_artery, STATE_KEY)).toMatchObject({ measuredLengthCm: '5', referenceLengthCm: '40', length: '3-10' });
});

test('uses a right-foot reference and retains right-sided digital route identifiers', async ({ page }) => {
  const data = completeCase();
  data.targetArterialPath = targetPath.map((id) => id.replace('Left_', 'Right_').replace('anterior_tibial_', 'anterior_tibital_'));
  data.targetArterialPathSide = 'Right';
  data.patencySegments = { Right_superficial_femoral_artery: data.patencySegments[lesionId] };
  data.clinical.woundLocations = ['hallux-first-ray'];
  await seed(page, data, 1);
  await page.goto('./');
  await page.getByRole('combobox', { name: 'Pedal outflow target', exact: true }).selectOption('dorsal-digital-1-medial');
  const preview = page.getByTestId('selected-woundosomes');
  await expect(preview.getByRole('img', { name: /AP.*right foot/ })).toHaveCount(1);
  await expect(preview.locator('svg > g[transform*="scale(-1 1)"]')).toHaveCount(2);
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key))?.data?.targetArterialPath?.at(-1), STATE_KEY)).toBe('Right_pedal_dorsal_digital_1_medial');
});

test('keeps pedal route controls and measured lesion fields usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page, completeCase(), 1);
  await page.goto('./');
  await page.getByRole('combobox', { name: 'Pedal outflow target', exact: true }).selectOption('arcuate');
  await page.locator('.segment-edit-trigger').first().click();
  const editor = page.locator('.param-box');
  await editor.getByText('Lesion extent on map (optional)', { exact: true }).click();
  await editor.getByRole('spinbutton', { name: 'Measured lesion length (cm)', exact: true }).fill('5.5');
  await editor.getByRole('button', { name: 'Save lesion', exact: true }).click();
  await expect(editor).toHaveCount(0);
  const metrics = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    offenders: [...document.querySelectorAll('body *')].filter((element) => element.getBoundingClientRect().right > innerWidth + 1 && element.getClientRects().length).slice(0, 12).map((element) => ({ tag: element.tagName, className: element.getAttribute('class'), right: element.getBoundingClientRect().right })),
  }));
  expect(metrics.width, JSON.stringify(metrics.offenders)).toBeLessThanOrEqual(metrics.viewport);
});

for (const width of [1280, 390]) {
  test(`anchors stage changes to the numbered title at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await seed(page, completeCase(), 0);
    await page.goto('./');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    const label = page.locator('.wizard-step-label');
    await expect(label).toHaveText('2 / 4 — Disease anatomy');
    await expect(label).toBeFocused();
    await expect.poll(() => label.evaluate((node) => node.getBoundingClientRect().top)).toBeLessThan(25);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(label).toHaveText('1 / 4 — Clinical indication');
    await expect(label).toBeFocused();
    await expect.poll(() => label.evaluate((node) => node.getBoundingClientRect().top)).toBeLessThan(25);
  });
}

test('shows blocking step advice in a red Critical panel', async ({ page }) => {
  const data = baseCase(); data.clinical.wound = null;
  await seed(page, data, 0);
  await page.goto('./');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const alert = page.locator('.wizard-validation');
  await expect(alert).toHaveAttribute('role', 'alert');
  await expect(alert).toContainText('Critical | complete this step before continuing:');
  await expect(alert).toContainText('Assess all three WIfI components.');
  await expect(alert).toHaveCSS('background-color', 'rgb(255, 242, 243)');
  await expect(page.locator('.wizard-step-label')).toContainText('1 / 4');
});

test('keeps wound targets and a compact set of main pedal outflow choices', async ({ page }) => {
  await seed(page, completeCase(), 1);
  await page.goto('./');
  const select = page.getByRole('combobox', { name: 'Pedal outflow target', exact: true });
  const groups = await select.locator('optgroup').evaluateAll((nodes) => nodes.map((node) => ({ name: node.label, count: node.children.length })));
  expect(groups.map((group) => group.name)).toEqual(['Woundosome targets to assess', 'Main pedal outflow']);
  expect(groups.find((group) => group.name === 'Main pedal outflow').count).toBeLessThanOrEqual(7);
  await expect(select.locator('option[value="dorsal-digital-4-medial"]')).toHaveCount(0);
  await select.selectOption('plantar-arch');
  await expect(page.getByLabel('Selected target route', { exact: true })).toContainText('deep plantar arch');
});

test('selects a named sheath with product-specific options and restores its configuration', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');
  await page.getByRole('button', { name: '6 Fr', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Clear filters', exact: true }).click();
  const product = dialog.getByRole('combobox', { name: /^Product/ });
  await product.selectOption('BD Interventional — Halo One Thin-Walled Guiding Sheath');
  await dialog.getByTestId('filter-sheath-size').getByRole('button', { name: '6 Fr', exact: true }).click();
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '90 cm', exact: true })).toBeVisible();
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '110 cm', exact: true })).toHaveCount(0);
  await dialog.getByTestId('filter-length').getByRole('button', { name: '90 cm', exact: true }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '6 Fr', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('combobox', { name: /^Product/ })).toHaveValue('BD Interventional — Halo One Thin-Walled Guiding Sheath');
  await expect(page.getByRole('dialog').getByTestId('filter-length').getByRole('button', { name: '90 cm', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('retains manually entered sheath range values and blocks an unlisted configuration', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');
  await page.getByRole('button', { name: '6 Fr', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await dialog.getByRole('combobox', { name: /^Product/ }).selectOption('Cook Medical — Flexor: Balkin');
  await expect(dialog.getByText('Published range: 5.5–8 Fr')).toBeVisible();
  await dialog.getByTestId('filter-sheath-size-manual').getByRole('spinbutton').fill('7');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '7 Fr', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByTestId('filter-sheath-size-manual').getByRole('spinbutton')).toHaveValue('7');
  await dialog.getByTestId('filter-sheath-size-manual').getByRole('spinbutton').fill('9');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('outside its published options');
});

test('selects Abbott Command variants with the manufacturer lengths and preferred-device labels', async ({ page }) => {
  await seed(page, completeCase(), 2, profile);
  await page.goto('./');
  const scope = page.getByTestId('plan-scope-group-Lesion-1');
  await scope.getByRole('button', { name: 'ASAHI Gladius MG 18 PV ES', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Prefered devices', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Clear filters', exact: true }).click();
  const product = dialog.getByRole('combobox', { name: /^Product/ });
  for (const name of ['Hi-Torque Command 14 ST', 'Hi-Torque Command 14 MT', 'Hi-Torque Command 18 ST', 'Hi-Torque Command 18 LT', 'Hi-Torque Command ES']) {
    await expect(product.locator(`option[value="Abbott — ${name}"]`)).toHaveCount(1);
  }
  await product.selectOption('Abbott — Hi-Torque Command 18 LT');
  await dialog.getByTestId('filter-length').getByRole('button', { name: '210 cm', exact: true }).click();
  await expect(dialog.getByTestId('filter-length').getByRole('button', { name: '180 cm', exact: true })).toHaveCount(0);
  await expect(dialog.getByTestId('filter-tip-shape').getByRole('button', { name: 'Straight', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await expect(scope.getByRole('button', { name: 'Abbott — Hi-Torque Command 18 LT', exact: true })).toBeVisible();
});

for (const width of [1280, 390]) {
  test(`saves an optional anonymous patient code and moves WIfI prognosis into its popup at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await seed(page, completeCase(), 0);
    await page.goto('./');
    await page.getByLabel('Patient ID code (anonymous)', { exact: true }).fill('ANON-A024');
    await page.reload();
    await expect(page.getByLabel('Patient ID code (anonymous)', { exact: true })).toHaveValue('ANON-A024');
    for (let stage = 0; stage < 3; stage += 1) await page.getByRole('button', { name: 'Next', exact: true }).click();
    const summary = page.locator('#case-summary');
    await expect(summary.getByRole('heading', { name: 'Case summary', exact: true })).toBeVisible();
    await expect(page.locator('.case-summary-patient-id')).toHaveText('Patient IDANON-A024');
    await expect(summary).not.toContainText('pooled estimated');
    await expect(summary.locator('.case-summary__indication')).not.toContainText('Patrone');
    await expect(summary.locator('.case-summary__indication')).not.toContainText(/\bTAP\b/);
    await page.getByRole('button', { name: 'See CLTI guideline prognosis and recommendations', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('pooled estimated 1-year risk of major amputation');
    const woundosomeReference = page.getByRole('dialog').getByRole('link', { name: 'Patrone et al. — The woundosome concept (2024)', exact: true });
    await expect(woundosomeReference).toHaveAttribute('href', 'https://orbi.uliege.be/bitstream/2268/322037/1/L.Patrone%20Journal%20of%20Endovascular%20Therapy%20%282024%29%201-2.pdf');
    await woundosomeReference.scrollIntoViewIfNeeded();
    await expect(woundosomeReference).toBeInViewport();
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 1280) {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
      const download = await downloadPromise, file = testInfo.outputPath('patient-code-summary.pdf');
      await download.saveAs(file);
      const pdf = readFileSync(file, 'latin1');
      expect(pdf.match(/ANON-A024/g).length).toBeGreaterThanOrEqual(2);
      expect(pdf).toContain('/Width 2000');
      expect(pdf).toContain('MATERIALS PREPARATION');
    }
  });
}

test('selects a crossing balloon and carries it through saved plan, summary and PDF', async ({ page }, testInfo) => {
  await seed(page, completeCase(), 2, profile);
  await page.goto('./');
  const composer = page.getByTestId('plan-scope-group-Lesion-1');
  await composer.getByRole('button', { name: 'Crossing balloon', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Choose starred device:.*5/ }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key))?.data.navRows[0]?.balloon?.diameter, STATE_KEY)).toBe('5');
  await page.reload();
  await expect(composer.getByRole('button', { name: /Crossing balloon:/ })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.intervention-plan')).toContainText('CROSSING BALLOON');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const file = testInfo.outputPath('crossing-balloon.pdf');
  await (await downloaded).saveAs(file);
  expect(readFileSync(file, 'latin1')).toContain('crossing balloon');
});

test('reveals the full device specification in a dark blue tooltip on hover and focus', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');
  const wire = page.getByTestId('plan-scope-group-Lesion-1').getByRole('button', { name: 'ASAHI Gladius MG 18 PV ES', exact: true });
  await wire.hover();
  const tooltip = page.getByRole('tooltip');
  await expect(tooltip).toContainText('ASAHI Gladius MG 18 PV ES');
  await expect(tooltip).toContainText('300 cm');
  await expect(tooltip).toHaveCSS('background-color', 'rgb(16, 44, 104)');
  await page.keyboard.press('Escape');
  await expect(tooltip).toHaveCount(0);
  await wire.focus();
  await expect(tooltip).toBeVisible();
  await expect(wire).toHaveAttribute('aria-describedby', await tooltip.getAttribute('id'));
  const box = await tooltip.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(1280);
});

test('includes selected diagrams alongside summary text and embeds them in the PDF', async ({ page }, testInfo) => {
  const data = completeCase(); data.patencySegments[lesionId].measuredLengthCm = '5';
  await seed(page, data, 3);
  await page.goto('./');
  const indication = page.locator('.case-summary__indication');
  const anatomy = page.locator('.case-summary__anatomy');
  await expect(indication.locator('.selected-woundosome-views svg')).toHaveCount(2);
  await expect(anatomy.getByTestId('summary-disease-visual')).toBeVisible();
  await expect(anatomy.locator('svg [role="button"]')).toHaveCount(0);
  for (const label of ['Edit clinical assessment', 'Edit anatomy', 'Edit intervention plan']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveText('EDIT');
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveCSS('background-color', 'rgb(16, 44, 104)');
  }
  const imageBox = await indication.locator('.selected-woundosome-views').boundingBox();
  const textBox = await indication.locator('.summary-media-text').boundingBox();
  expect(imageBox.x + imageBox.width).toBeLessThan(textBox.x);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const file = testInfo.outputPath('visual-case-summary.pdf');
  await (await downloaded).saveAs(file);
  const pdf = readFileSync(file, 'latin1');
  expect((pdf.match(/\/Subtype \/Image/g) || []).length).toBeGreaterThanOrEqual(3);
  expect(pdf).toContain('5 cm');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Edit anatomy', exact: true }).click();
  await expect(page.locator('.wizard-step-label')).toBeFocused();
  await expect(page.locator('.wizard-step-label')).toContainText('2 / 4');
});

test('paginates long PDF plans without dropping the final device or recommendations', async ({ page }, testInfo) => {
  const data = completeCase();
  data.navRows = Array.from({ length: 24 }, (_, index) => ({
    ...data.navRows[0], id: `long-nav-${index}`,
    wire: { ...data.navRows[0].wire, product: `RECORDED_WIRE_${index}_END` },
  }));
  await seed(page, data, 3);
  await page.goto('./');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const file = testInfo.outputPath('long-plan.pdf');
  await (await downloaded).saveAs(file);
  const pdf = readFileSync(file, 'latin1');
  expect(pdf).toContain('RECORDED_WIRE_23_END');
  expect(pdf).toContain('RECOMMENDATIONS & CONSIDERATIONS');
  expect((pdf.match(/\/Type \/Page\b/g) || []).length).toBeGreaterThan(1);
});

test('labels calcification explicitly and appends a grouped materials preparation checklist', async ({ page }, testInfo) => {
  const data = completeCase();
  data.navRows[0].balloon = { ...data.therapyRows[0].balloon };
  data.planDeviceSuggestions = { navigation: [{ wire: { product: 'UNUSED_PREFERRED_WIRE' } }] };
  await seed(page, data, 3);
  await page.goto('./');
  await expect(page.locator('.case-summary__anatomy')).toContainText('heavy calcification');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const file = testInfo.outputPath('preparation-checklist.pdf');
  await (await downloaded).saveAs(file);
  const pdf = readFileSync(file, 'latin1');
  expect(pdf).toContain('heavy calcification');
  for (const text of ['MATERIALS PREPARATION', 'ACCESS & INTRODUCERS', 'GUIDEWIRES', 'CATHETERS & SUPPORT', 'BALLOONS', 'CLOSURE & HAEMOSTASIS', 'QTY', '300 cm', '0.018-inch']) expect(pdf).toContain(text);
  expect(pdf).toContain('2 selected plan entries');
  expect(pdf).not.toContain('UNUSED_PREFERRED_WIRE');
  expect((pdf.match(/\/Type \/Page\b/g) || []).length).toBeGreaterThanOrEqual(3);
});

test('continues long materials lists without losing the final distinct configuration', async ({ page }, testInfo) => {
  const data = completeCase();
  data.navRows = Array.from({ length: 25 }, (_, index) => ({ ...data.navRows[0], id: `material-${index}`, wire: { ...data.navRows[0].wire, product: `PREP_WIRE_${index}_SELECTED` } }));
  await seed(page, data, 3);
  await page.goto('./');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const file = testInfo.outputPath('long-preparation-list.pdf');
  await (await downloaded).saveAs(file);
  const pdf = readFileSync(file, 'latin1');
  expect((pdf.match(/PREP_WIRE_24_SELECTED/g) || []).length).toBeGreaterThanOrEqual(2);
  expect(pdf).toContain('Materials preparation - continued');
  expect(pdf).toContain('CLOSURE & HAEMOSTASIS');
});

async function lesionDragPoint(locator) {
  return locator.evaluate((node) => {
    const shape = node.querySelector('.vessel-lesion-drag-hit');
    const bounds = shape.getBBox(), vertical = bounds.height >= bounds.width;
    const fraction = Number(node.dataset.lesionFraction), position = Number(node.dataset.lesionPosition);
    const center = (1 - fraction) * position + fraction / 2;
    let point = new DOMPoint(bounds.x + bounds.width * (vertical ? 0.5 : center), bounds.y + bounds.height * (vertical ? center : 0.5));
    for (let index = 0; index <= 100; index++) {
      const sample = new DOMPoint(bounds.x + bounds.width * (vertical ? index / 100 : center), bounds.y + bounds.height * (vertical ? center : index / 100));
      if (shape.isPointInFill(sample)) { point = sample; break; }
    }
    const matrix = shape.getScreenCTM(), screen = point.matrixTransform(matrix);
    return { x: screen.x, y: screen.y, travel: vertical ? bounds.height * matrix.d : bounds.width * matrix.a, vertical };
  });
}

test('keeps woundosome explanations behind accessible blue info buttons', async ({ page }) => {
  await seed(page, baseCase(), 0);
  await page.goto('./');
  const selector = page.getByTestId('woundosome-selector');
  await expect(selector.getByText('Idealized patent anatomy', { exact: true })).toHaveCount(0);
  await expect(selector.getByText(/Original angiographic-style reference model/)).toHaveCount(0);
  await expect(selector.getByText(/Confirm the true feeding artery/)).toHaveCount(0);
  await expect(selector.getByRole('link')).toHaveCount(0);
  await expect(selector.getByTestId('foot-artery-label-toggle')).toHaveCSS('background-color', 'rgb(16, 44, 104)');
  const anatomyInfo = selector.getByRole('button', { name: 'Woundosome anatomy information', exact: true });
  await anatomyInfo.click();
  await expect(page.getByRole('dialog')).toContainText('Original angiographic-style reference model');
  await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(1);
  await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
  await expect(anatomyInfo).toBeFocused();
  const guidanceInfo = selector.getByRole('button', { name: 'Woundosome guidance and references', exact: true });
  await guidanceInfo.click();
  await expect(page.getByRole('dialog')).toContainText('Confirm the true feeding artery');
  await expect(page.getByRole('dialog').getByRole('link')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(guidanceInfo).toBeFocused();
});

test('drags a lesion along its artery, preserves length, and carries placement into planning and PDF', async ({ page }) => {
  const data = completeCase();
  data.patencySegments[lesionId] = { type: 'stenosis', length: '3-10', calcium: 'moderate', measuredLengthCm: '5' };
  await seed(page, data, 1);
  await page.goto('./');
  const artery = page.locator(`.patency-container #${lesionId}`);
  await expect(artery).toHaveAttribute('data-lesion-position', '0.5');
  const beforeFraction = await artery.getAttribute('data-lesion-fraction');
  const point = await lesionDragPoint(artery);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x, point.y + point.travel * 0.2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => Number(await artery.getAttribute('data-lesion-position'))).toBeGreaterThan(0.65);
  await expect(artery).toHaveAttribute('data-lesion-fraction', beforeFraction);
  await expect(page.locator('.param-box')).toHaveCount(0);
  await artery.focus();
  await page.keyboard.press('End');
  await expect(artery).toHaveAttribute('data-lesion-position', '1');
  await expect.poll(() => page.evaluate((id) => JSON.parse(localStorage.getItem('endoplannerState')).data.patencySegments[id], lesionId)).toEqual({ ...data.patencySegments[lesionId], positionFraction: 1 });
  await page.reload();
  await expect(artery).toHaveAttribute('data-lesion-position', '1');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Lesion crossing, vessel preparation & treatment', { exact: true })).toBeVisible();
  await expect(page.getByTestId('plan-scope-group-Lesion-1').locator('.plan-scope-group-code')).toHaveText('Lesion 1');
  await expect(page.getByTestId('plan-scope-group-Lesion-1')).toContainText('schematic distal position');
  await expect(page.locator('.visual-plan-map .vessel-lesion-drag-hit')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.case-summary__anatomy')).toContainText('schematic distal position');
  await expect(page.locator('.summary-disease-visual [data-lesion-position="1"]')).toHaveCount(1);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const stream = await (await downloaded).createReadStream(), chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const pdf = Buffer.concat(chunks).toString('latin1');
  expect(pdf).toContain('schematic distal position');
  expect(pdf).toContain('Lesion 1');
});

test('records multiple popliteal segments and includes them in the plan, summary and PDF', async ({ page }) => {
  const data = completeCase(), id = 'Left_popliteal_artery_artery';
  data.patencySegments = { [id]: { type: 'stenosis', length: '3-10', calcium: 'none', measuredLengthCm: '5' } };
  data.navRows[0].lesionId = id;
  data.therapyRows[0].lesionId = id;
  await seed(page, data, 1);
  await page.goto('./');
  await page.locator(`.patency-container #${id}`).click();
  const parts = page.getByRole('group', { name: 'Popliteal segments', exact: true });
  await parts.getByRole('button', { name: 'P2', exact: true }).click();
  await parts.getByRole('button', { name: 'P3', exact: true }).click();
  await page.getByRole('button', { name: 'Save lesion', exact: true }).click();
  await expect(page.locator('.selected-segments')).toContainText('P2 + P3');
  await page.reload();
  await page.locator(`.patency-container #${id}`).click();
  await expect(parts.getByRole('button', { name: 'P1', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(parts.getByRole('button', { name: 'P2', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(parts.getByRole('button', { name: 'P3', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Save lesion', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByTestId('plan-scope-group-Lesion-1')).toContainText('P2 + P3');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.case-summary__anatomy')).toContainText('Lesion 1');
  await expect(page.locator('.case-summary__anatomy')).toContainText('P2 + P3');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export PDF', exact: true }).click();
  const stream = await (await downloaded).createReadStream(), chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString('latin1')).toContain('P2 + P3');
});

test('moves a lesion with a touch drag on a narrow screen', async ({ page, context }) => {
  const data = completeCase();
  data.patencySegments[lesionId] = { type: 'stenosis', length: '<3', calcium: 'none', measuredLengthCm: '2' };
  await page.setViewportSize({ width: 390, height: 900 });
  await seed(page, data, 1);
  await page.goto('./');
  const artery = page.locator(`.patency-container #${lesionId}`);
  const point = await lesionDragPoint(artery), client = await context.newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y, id: 1 }] });
  for (let index = 1; index <= 6; index++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y + point.travel * 0.15 * index / 6, id: 1 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => Number(await artery.getAttribute('data-lesion-position'))).toBeGreaterThan(0.6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator('.param-box')).toHaveCount(0);
});

test('keeps right-sided horizontal lesion dragging aligned with proximal and distal anatomy', async ({ page }) => {
  const data = completeCase(), id = 'Right_common_iliac_artery';
  data.patencySegments = { [id]: { type: 'stenosis', length: '<3', calcium: 'none', measuredLengthCm: '2' } };
  data.targetArterialPath = ['Right_common_femoral_artery', 'Right_superficial_femoral_artery', 'Right_popliteal_artery_artery', 'Right_anterior_tibital_artery', 'Right_dorsal_pedal_artery'];
  data.targetArterialPathSide = 'Right';
  await seed(page, data, 1);
  await page.goto('./');
  const artery = page.locator(`.patency-container #${id}`), point = await lesionDragPoint(artery);
  expect(point.vertical).toBe(false);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x - point.travel * 0.15, point.y, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => Number(await artery.getAttribute('data-lesion-position'))).toBeGreaterThan(0.7);
  await expect(page.locator('.selected-segments')).toContainText('schematic distal position');
  await artery.focus();
  await page.keyboard.press('Home');
  await expect(artery).toHaveAttribute('data-lesion-position', '0');
  await page.keyboard.press('ArrowLeft');
  await expect(artery).toHaveAttribute('data-lesion-position', '0.05');
});
