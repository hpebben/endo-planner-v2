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

test('applies a versioned local setup to access, crossing, therapy and closure', async ({ page }) => {
  await seed(page, baseCase(), 2, profile);
  await page.goto('./');

  await expect(page.getByRole('heading', { name: 'Intervention plan' })).toBeVisible();
  await expect(page.getByRole('button', { name: '6 Fr' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ASAHI Gladius MG 18 PV ES' }).first()).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Closure device' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('radio', { name: '6F AngioSeal' })).toBeVisible();

  await page.getByRole('button', { name: /Set local preferences/ }).click();
  await expect(page.getByText('Profile v1 · revision 2')).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return stored?.data?.appliedPreferenceProfile;
      }, STATE_KEY)
    )
    .toMatchObject({ profileId: 'e2e-local-setup', revision: 2 });
});

test('opens WIfI and GLASS guideline dialogs from the case summary', async ({ page }) => {
  await seed(page, completeCase(), 3);
  await page.goto('./');

  await page.getByRole('button', { name: /recommendations for this WIfI stage/i }).click();
  await expect(page.getByRole('dialog').locator('.modal-header')).toHaveText(/WIfI clinical stage/);
  await expect(page.getByRole('dialog').getByText('Guideline recommendations')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: /recommendations for this GLASS stage/i }).click();
  await expect(page.getByRole('dialog').locator('.modal-header')).toHaveText(/GLASS stage/);
  await expect(page.getByRole('dialog').getByText('Expected 1-year limb-based patency')).toBeVisible();
});

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
      schemaVersion: 5,
      key: 'posterior',
      endpoint: 'Left_plantar_arch',
    });
});

test('plans one visual scope at a time and inherits PATH and lesion scopes', async ({ page }) => {
  await seed(page, baseCase(), 2);
  await page.goto('./');

  const workspace = page.getByTestId('visual-intervention-planner');
  await expect(workspace.getByTestId('visual-scope-PATH')).toBeVisible();
  await expect(workspace.getByTestId('visual-scope-L1')).toContainText('Left superficial femoral artery');

  await workspace.getByTestId('visual-scope-PATH').click();
  const pathComposer = workspace.getByTestId('plan-scope-group-PATH');
  await pathComposer.getByRole('button', { name: /Add support device/ }).click();

  const sfaPlanningTarget = page.getByRole('button', {
    name: 'Plan devices for Left superficial femoral artery',
  });
  await sfaPlanningTarget.focus();
  await page.keyboard.press('Enter');
  const lesionComposer = workspace.getByTestId('plan-scope-group-L1');
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

test('shows chosen devices as schematics beside the arterial tree', async ({ page }) => {
  await seed(page, completeCase(), 2);
  await page.goto('./');

  const workspace = page.getByTestId('visual-intervention-planner');
  const lesionSummary = workspace.getByTestId('visual-scope-L1');
  await expect(lesionSummary).toContainText('ASAHI Gladius MG 18 PV ES');
  await expect(lesionSummary).toContainText('5 × 120 mm');
  await expect(lesionSummary.locator('.device-glyph--wire')).toHaveCount(1);
  await expect(lesionSummary.locator('.device-glyph--balloon')).toHaveCount(1);
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

  await seed(page, baseCase(), 2, productFirstProfile);
  await page.goto('./');

  // The saved profile is applied in a mount effect. Wait for that transaction
  // to finish so opening a picker cannot be interrupted by the resulting row
  // rerender.
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
    .getByTestId('plan-scope-group-L1');
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
  await expect(selector.getByText('Idealized patent anatomy', { exact: true })).toBeVisible();
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
  await expect(selector.getByText('Anterior tibial → dorsalis pedis TAP')).toBeVisible();
  await expect(selector.getByText('Posterior tibial → plantar arch TAP')).toBeVisible();
  await expect(selector.getByRole('link', { name: /Manzi et al/ })).toHaveAttribute('href', 'https://pubs.rsna.org/doi/10.1148/rg.316115511');

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
  expect(pdf).not.toContain('Wound-informed TAP to consider:');
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
