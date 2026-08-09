const { test, expect } = require('@playwright/test');

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
      localStorage.setItem(
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
    applicationVersion: '1.6.171',
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

test('maps Fontaine IV wound locations to a wound-informed TAP consideration', async ({ page }) => {
  await seed(page, { ...baseCase(), clinical: { wound: 2, ischemia: 2, infection: 1, woundLocations: [] } }, 0);
  await page.goto('./');

  const selector = page.getByTestId('woundosome-selector');
  await expect(selector).toBeVisible();
  await selector.getByRole('checkbox', { name: 'Hallux / first ray' }).click();
  await expect(selector.getByText('Anterior tibial → dorsalis pedis TAP')).toBeVisible();
  await expect(selector.getByText('Posterior tibial → plantar arch TAP')).toBeVisible();

  await expect.poll(() => page.evaluate((key) => (
    JSON.parse(localStorage.getItem(key))?.data?.clinical?.woundLocations
  ), STATE_KEY)).toEqual(['hallux-first-ray']);
});

test('keeps TAP selection below the affected-segment summary', async ({ page }) => {
  await seed(page, baseCase(), 1);
  await page.goto('./');

  const ordering = await page.evaluate(() => {
    const segments = document.querySelector('.selected-segments');
    const tap = document.querySelector('[data-testid="target-path-selector"]');
    return Boolean(segments && tap && (segments.compareDocumentPosition(tap) & Node.DOCUMENT_POSITION_FOLLOWING));
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
