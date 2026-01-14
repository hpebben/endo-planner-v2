(function () {
  if (window.__ENDO_INTERVENTION_BOOTED__) {
    return;
  }
  window.__ENDO_INTERVENTION_BOOTED__ = true;

  const buildSignature = window.EndoPlannerV2Build || window.EndoPlannerInterventionBuild || {};
  const buildVersion = buildSignature.version || 'unknown';
  const buildSha = buildSignature.git || 'unknown';
  if (!window.__ENDO_INTERVENTION_SIGNATURE_LOGGED__) {
    window.__ENDO_INTERVENTION_SIGNATURE_LOGGED__ = true;
    if (typeof console !== 'undefined') {
      console.info(
        `[EndoPlanner v2] intervention-planning loaded | v${buildVersion} | git ${buildSha}`
      );
    }
  }

  const config = window.EndoPlannerIntervention || {};
  const debug = Boolean(config.debug);
  const log = (...args) => {
    if (debug && typeof console !== 'undefined') {
      console.log('[EndoPlanner]', ...args);
    }
  };

  const state = {
    modal: null,
    modalBody: null,
    modalTitle: null,
    modalClose: null,
    modalOverlay: null,
    boundClick: false,
    lastResetAt: 0,
    toastTimer: null,
    clickHandler: null,
    changeHandler: null,
  };

  const deviceConfigs = {
    needle: { label: 'Needle', builder: 'buildNeedleFields' },
    sheath: { label: 'Sheath', builder: 'buildSheathFields' },
    catheter: { label: 'Catheter', builder: 'buildCatheterFields' },
    wire: { label: 'Wire', builder: 'buildWireFields' },
    pta: { label: 'PTA Balloon', builder: 'buildPtaFields' },
    stent: { label: 'Stent', builder: 'buildStentFields' },
    special: { label: 'Special Device', builder: 'buildSpecialFields' },
  };

  const segmentNameMap = {
    raic: 'Right Internal Iliac Artery',
    raec: 'Right External Iliac Artery',
    raoc: 'Right Common Iliac Artery',
    laic: 'Left Internal Iliac Artery',
    laec: 'Left External Iliac Artery',
    laoc: 'Left Common Iliac Artery',
    rcia: 'Right Common Iliac Artery',
    lcia: 'Left Common Iliac Artery',
    rciae: 'Right Common Iliac Artery',
    lciae: 'Left Common Iliac Artery',
    rsfa: 'Right Superficial Femoral Artery',
    lsfa: 'Left Superficial Femoral Artery',
    rcfa: 'Right Common Femoral Artery',
    lcfa: 'Left Common Femoral Artery',
    rpop: 'Right Popliteal Artery',
    lpop: 'Left Popliteal Artery',
    rpta: 'Right Posterior Tibial Artery',
    lpta: 'Left Posterior Tibial Artery',
    rata: 'Right Anterior Tibial Artery',
    lata: 'Left Anterior Tibial Artery',
    rper: 'Right Peroneal Artery',
    lper: 'Left Peroneal Artery',
    rtp: 'Right Tibioperoneal Trunk',
    ltp: 'Left Tibioperoneal Trunk',
  };

  const levelMap = {
    aorto: 'aorto-iliac',
    iliac: 'aorto-iliac',
    fem: 'fem-pop',
    pop: 'fem-pop',
    tib: 'below',
    knee: 'below',
    foot: 'below',
    pedal: 'below',
  };

  const getPanelHost = () => {
    let host = document.getElementById('endo-intervention-panels');
    if (!host) {
      host = document.createElement('div');
      host.id = 'endo-intervention-panels';
      host.className = 'endo-intervention-panels';
      document.body.appendChild(host);
    }
    return host;
  };

  const getPanelContainer = (panelId) => {
    const host = getPanelHost();
    let panel = document.getElementById(panelId);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'endo-device-panel';
      host.appendChild(panel);
    }
    return panel;
  };

  const createFieldGroup = (labelText, input) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'endo-field-group';

    if (labelText) {
      const label = document.createElement('label');
      label.className = 'endo-field-label';
      label.textContent = labelText;
      wrapper.appendChild(label);
    }

    wrapper.appendChild(input);
    return wrapper;
  };

  const createSelect = (options, placeholder, className) => {
    const select = document.createElement('select');
    if (className) {
      select.className = className;
    }
    select.dataset.placeholder = placeholder;
    const defaultOption = document.createElement('option');
    defaultOption.textContent = placeholder;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
    options.forEach((optionValue) => {
      const option = document.createElement('option');
      option.textContent = optionValue;
      option.value = optionValue;
      select.appendChild(option);
    });
    return select;
  };

  const populateSelect = (select, options) => {
    if (!select) {
      return;
    }
    const placeholder = select.dataset.placeholder || 'Choose an option';
    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.textContent = placeholder;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
    options.forEach((optionValue) => {
      const option = document.createElement('option');
      option.textContent = optionValue;
      option.value = optionValue;
      select.appendChild(option);
    });
  };

  const createRadioGroup = (name, options, onChange, className) => {
    const container = document.createElement('div');
    container.className = className || 'endo-radio-group';
    options.forEach((optionValue) => {
      const label = document.createElement('label');
      label.className = 'endo-radio-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = optionValue;
      input.addEventListener('change', () => {
        if (onChange) {
          onChange(optionValue);
        }
      });

      const text = document.createElement('span');
      text.textContent = optionValue;

      label.appendChild(input);
      label.appendChild(text);
      container.appendChild(label);
    });
    return container;
  };

  const getSelectedRadioValue = (row, name) =>
    row.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const getStentDiameterOptions = (platform, stentType, stentMaterial) => {
    if (platform === '0.018' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['4.5', '5', '5.5', '6', '6.5', '7', '7.5'];
    }
    if (platform === '0.035' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['5', '6', '7', '8', '9', '10'];
    }
    if (platform === '0.014' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['4', '4.5', '5', '5.5', '6', '6.5', '7'];
    }
    if (platform === '0.035' && stentMaterial === 'bare metal' && stentType === 'balloon expandable') {
      return ['4', '5', '6', '7', '8', '9', '10'];
    }
    if (platform === '0.035' && stentMaterial === 'covered' && stentType === 'balloon expandable') {
      return ['5', '6', '7', '8', '9', '10', '12', '14', '16', '18', '20', '22', '24'];
    }
    return [];
  };

  const getStentLengthOptions = (platform, stentType, stentMaterial) => {
    if (platform === '0.035' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['20', '30', '40', '60', '80', '100'];
    }
    if (platform === '0.018' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['20', '30', '40', '60', '80', '100', '120', '150', '180', '200'];
    }
    if (platform === '0.035' && stentMaterial === 'bare metal' && stentType === 'balloon expandable') {
      return ['12', '16', '19', '29', '39', '59'];
    }
    if (platform === '0.014' && stentMaterial === 'bare metal' && stentType === 'self expandable') {
      return ['12', '15', '18'];
    }
    if (platform === '0.035' && stentMaterial === 'covered' && stentType === 'balloon expandable') {
      return ['15', '19', '29', '39', '59', '79'];
    }
    return [];
  };

  const getPtaDiameterOptions = (platform) => {
    if (platform === '0.014') {
      return ['1.5', '2', '2.5', '3.5', '4'];
    }
    if (platform === '0.018') {
      return ['2', '2.5', '3', '4', '5', '5.5', '6', '7'];
    }
    if (platform === '0.035') {
      return ['3', '4', '5', '6', '7', '8', '9', '10', '12', '14'];
    }
    return [];
  };

  const getPtaLengthOptions = () => [
    '10',
    '12',
    '15',
    '18',
    '20',
    '30',
    '40',
    '50',
    '60',
    '70',
    '80',
    '90',
    '100',
    '110',
    '120',
  ];

  const createDeviceRow = (deviceKey, index) => {
    const row = document.createElement('div');
    row.className = 'endo-device-row';
    row.dataset.device = deviceKey;
    row.dataset.rowId = `${deviceKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const header = document.createElement('div');
    header.className = 'endo-device-row-header';

    const label = document.createElement('span');
    label.className = 'endo-device-label';
    label.textContent = `${deviceConfigs[deviceKey]?.label || 'Device'} ${index + 1}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'endo-device-remove';
    remove.textContent = '−';
    remove.addEventListener('click', () => {
      row.remove();
      updateRowLabels(deviceKey);
    });

    header.appendChild(label);
    header.appendChild(remove);
    row.appendChild(header);

    const config = deviceConfigs[deviceKey];
    if (config && typeof window[config.builder] === 'function') {
      const fields = window[config.builder](row);
      if (fields) {
        row.appendChild(fields);
      }
    }

    return row;
  };

  const updateRowLabels = (deviceKey) => {
    const panel = getPanelContainer(`endo-panel-${deviceKey}`);
    const rows = panel.querySelectorAll('.endo-device-row');
    rows.forEach((row, idx) => {
      const label = row.querySelector('.endo-device-label');
      if (label) {
        label.textContent = `${deviceConfigs[deviceKey]?.label || 'Device'} ${idx + 1}`;
      }
    });
  };

  const addDeviceRow = (deviceKey, panelId) => {
    const panel = getPanelContainer(panelId || `endo-panel-${deviceKey}`);
    const rows = panel.querySelectorAll('.endo-device-row');
    const row = createDeviceRow(deviceKey, rows.length);
    panel.appendChild(row);
  };

  const ensureDevicePanel = (deviceKey) => {
    const panelId = `endo-panel-${deviceKey}`;
    const panel = getPanelContainer(panelId);
    if (!panel.dataset.initialized) {
      panel.dataset.initialized = 'true';
      const header = document.createElement('div');
      header.className = 'endo-device-panel-header';
      header.textContent = deviceConfigs[deviceKey]?.label || 'Device';

      const controls = document.createElement('div');
      controls.className = 'endo-device-panel-controls';

      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'endo-device-add';
      addButton.textContent = '+ Add another';
      addButton.addEventListener('click', () => addDeviceRow(deviceKey, panelId));

      controls.appendChild(addButton);
      panel.appendChild(header);
      panel.appendChild(controls);
    }

    if (!panel.querySelector('.endo-device-row')) {
      addDeviceRow(deviceKey, panelId);
    }

    return panel;
  };

  window.buildNeedleFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';

    const sizeSelect = createSelect(['19 Gauge', '21 Gauge'], 'Choose needle size', 'endo-select');
    const lengthSelect = createSelect(['4cm', '7cm', '9cm'], 'Choose needle length', 'endo-select');

    container.appendChild(createFieldGroup('Needle size', sizeSelect));
    container.appendChild(createFieldGroup('Needle length', lengthSelect));

    return container;
  };

  window.buildSheathFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';

    const sizeSelect = createSelect(['4 Fr', '5 Fr', '6 Fr', '7 Fr', '8 Fr', '9 Fr'], 'Choose French size', 'endo-select');
    const lengthSelect = createSelect(['10 cm', '12 cm', '25 cm'], 'Choose length of sheath', 'endo-select');

    container.appendChild(createFieldGroup('French size', sizeSelect));
    container.appendChild(createFieldGroup('Sheath length', lengthSelect));

    return container;
  };

  window.buildCatheterFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';

    const sizeSelect = createSelect(
      ['2.3 Fr', '2.6 Fr', '4 Fr', '5 Fr', '6 Fr', '7 Fr'],
      'Choose French size',
      'endo-select'
    );
    const lengthSelect = createSelect(
      ['40 cm', '65 cm', '80 cm', '90 cm', '105 cm', '110 cm', '125 cm', '135 cm', '150 cm'],
      'Choose length of catheter',
      'endo-select'
    );
    const catheterSelect = createSelect(
      [
        'BER2',
        'BHW',
        'Cobra 1',
        'Cobra 2',
        'Cobra 3',
        'Cobra Glidecath',
        'CXI 0.018',
        'CXI 0.014',
        'Navicross 0.018',
        'Navicross 0.035',
        'MultiPurpose',
        'PIER',
        'Pigtail Flush',
        'Straight Flush',
        'Universal Flush',
        'Rim',
        'Simmons 1',
        'Simmons 2',
        'Simmons 3',
        'Vertebral',
      ],
      'Choose specific catheter',
      'endo-select'
    );

    container.appendChild(createFieldGroup('French size', sizeSelect));
    container.appendChild(createFieldGroup('Catheter length', lengthSelect));
    container.appendChild(createFieldGroup('Specific catheter', catheterSelect));

    return container;
  };

  window.buildPtaFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';
    const rowId = row.dataset.rowId;
    const platformName = `pta-platform-${rowId}`;

    const platformGroup = createRadioGroup(platformName, ['0.014', '0.018', '0.035'], () => {
      const platform = getSelectedRadioValue(row, platformName);
      populateSelect(diameterSelect, getPtaDiameterOptions(platform).map((val) => `${val} mm`));
    });

    const diameterSelect = createSelect([], 'Choose a balloon diameter', 'endo-select');
    const lengthSelect = createSelect(getPtaLengthOptions().map((val) => `${val} mm`), 'Choose a balloon length', 'endo-select');

    container.appendChild(createFieldGroup('Platform', platformGroup));
    container.appendChild(createFieldGroup('Balloon diameter', diameterSelect));
    container.appendChild(createFieldGroup('Balloon length', lengthSelect));

    return container;
  };

  window.buildStentFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';
    const rowId = row.dataset.rowId;
    const platformName = `stent-platform-${rowId}`;
    const typeName = `stent-type-${rowId}`;
    const materialName = `stent-material-${rowId}`;

    const diameterSelect = createSelect([], 'Choose stent diameter', 'endo-select');
    const lengthSelect = createSelect([], 'Choose stent length', 'endo-select');

    const updateOptions = () => {
      const platform = getSelectedRadioValue(row, platformName);
      const stentType = getSelectedRadioValue(row, typeName);
      const stentMaterial = getSelectedRadioValue(row, materialName);
      populateSelect(diameterSelect, getStentDiameterOptions(platform, stentType, stentMaterial));
      populateSelect(lengthSelect, getStentLengthOptions(platform, stentType, stentMaterial));
    };

    const platformGroup = createRadioGroup(platformName, ['0.014', '0.018', '0.035'], updateOptions);
    const typeGroup = createRadioGroup(typeName, ['self expandable', 'balloon expandable'], updateOptions);
    const materialGroup = createRadioGroup(materialName, ['bare metal', 'covered'], updateOptions);

    container.appendChild(createFieldGroup('Platform', platformGroup));
    container.appendChild(createFieldGroup('Stent type', typeGroup));
    container.appendChild(createFieldGroup('Stent material', materialGroup));
    container.appendChild(createFieldGroup('Stent diameter', diameterSelect));
    container.appendChild(createFieldGroup('Stent length', lengthSelect));

    return container;
  };

  window.buildWireFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';
    const rowId = row.dataset.rowId;
    const platformName = `wire-platform-${rowId}`;
    const typeName = `wire-type-${rowId}`;
    const techniqueName = `wire-technique-${rowId}`;

    const platformGroup = createRadioGroup(platformName, ['0.014', '0.018', '0.035']);
    const lengthSelect = createSelect(['180 cm', '260 cm', '300 cm'], 'Choose length of wire', 'endo-select');

    const bodyTypeSelect = createSelect(
      ['Light bodied', 'Intermediate bodied', 'Heavy bodied'],
      'Choose body type',
      'endo-select'
    );
    const supportWireSelect = createSelect(
      ['Rosen wire', 'Lunderquist wire', 'Amplatz wire', 'Bentson wire', 'Meier wire', 'Newton wire'],
      'Choose support wire',
      'endo-select'
    );

    const bodyTypeGroup = createFieldGroup('Body type', bodyTypeSelect);
    const supportWireGroup = createFieldGroup('Support wire', supportWireSelect);
    bodyTypeGroup.style.display = 'none';
    supportWireGroup.style.display = 'none';

    const wireTypeGroup = createRadioGroup(
      typeName,
      ['Glidewire', 'CTO wire', 'Support wire'],
      (selected) => {
        bodyTypeGroup.style.display = selected === 'CTO wire' ? '' : 'none';
        supportWireGroup.style.display = selected === 'Support wire' ? '' : 'none';
      }
    );

    const techniqueGroup = createRadioGroup(
      techniqueName,
      ['Intimal Tracking', 'Limited sub-intimal dissection and re-entry']
    );

    container.appendChild(createFieldGroup('Platform', platformGroup));
    container.appendChild(createFieldGroup('Length', lengthSelect));
    container.appendChild(createFieldGroup('Type of wire', wireTypeGroup));
    container.appendChild(bodyTypeGroup);
    container.appendChild(supportWireGroup);
    container.appendChild(createFieldGroup('Technique', techniqueGroup));

    return container;
  };

  window.buildSpecialFields = (row) => {
    const container = document.createElement('div');
    container.className = 'endo-device-fields';
    const rowId = row.dataset.rowId;
    const platformName = `special-platform-${rowId}`;
    const platformGroup = createRadioGroup(platformName, ['0.014', '0.018', '0.035']);
    const specialSelect = createSelect(
      [
        'Re-entry device',
        'IVUS catheter',
        'Vascular plug',
        'Embolization coils',
        'Closure device',
        'Shockwave',
        'Scoring balloon',
        'Atherectomy device',
        'Thrombectomy device',
        'Miscellaneous',
      ],
      'Choose a special device',
      'endo-select'
    );

    const extraInput = document.createElement('input');
    extraInput.type = 'text';
    extraInput.className = 'endo-text-input';
    extraInput.placeholder = 'Enter extra details...';

    container.appendChild(createFieldGroup('Platform', platformGroup));
    container.appendChild(createFieldGroup('Special device', specialSelect));
    container.appendChild(createFieldGroup('Extra details', extraInput));

    return container;
  };

  window.addAnotherNeedle = () => addDeviceRow('needle');
  window.addAnotherSheath = () => addDeviceRow('sheath');
  window.addAnotherCatheter = () => addDeviceRow('catheter');
  window.addAnotherWire = () => addDeviceRow('wire');
  window.addAnotherPta = () => addDeviceRow('pta');
  window.addAnotherStent = () => addDeviceRow('stent');
  window.addAnotherSpecial = (panelId) => addDeviceRow('special', panelId || 'endo-panel-special');

  const ensureModal = () => {
    if (state.modal) {
      return state.modal;
    }

    const overlay = document.createElement('div');
    overlay.className = 'endo-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const modal = document.createElement('div');
    modal.className = 'endo-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const header = document.createElement('div');
    header.className = 'endo-modal-header';

    const title = document.createElement('div');
    title.className = 'endo-modal-title';

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'endo-modal-close';
    close.textContent = '×';
    close.addEventListener('click', () => closeModal());

    header.appendChild(title);
    header.appendChild(close);

    const body = document.createElement('div');
    body.className = 'endo-modal-body';

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    state.modal = modal;
    state.modalBody = body;
    state.modalTitle = title;
    state.modalClose = close;
    state.modalOverlay = overlay;

    return modal;
  };

  const resolveDeviceId = (trigger) => {
    if (!trigger) {
      return '';
    }

    const dataDevice =
      trigger.dataset.device ||
      trigger.dataset.deviceId ||
      trigger.dataset.deviceKey ||
      trigger.dataset.panel ||
      trigger.getAttribute('data-device');
    if (dataDevice) {
      return dataDevice;
    }

    const directId = trigger.id || '';
    if (directId) {
      return directId;
    }

    const parentWithId = trigger.closest('[id]');
    if (parentWithId && parentWithId.id) {
      return parentWithId.id;
    }

    const childWithId = trigger.querySelector('[id]');
    if (childWithId && childWithId.id) {
      return childWithId.id;
    }

    return '';
  };

  const normalizeDeviceKey = (deviceId) => {
    if (!deviceId) {
      return 'special';
    }

    const normalized = deviceId.toLowerCase();
    const keys = Object.keys(deviceConfigs);
    const match = keys.find((key) => normalized.includes(key));
    return match || normalized || 'special';
  };

  const openModal = (deviceId) => {
    const modal = ensureModal();
    const deviceKey = normalizeDeviceKey(deviceId);
    const config = deviceConfigs[deviceKey] || { label: 'Device', builder: null };
    const panel = ensureDevicePanel(deviceKey);

    state.modalTitle.textContent = config.label;
    if (state.modalBody) {
      const host = getPanelHost();
      Array.from(state.modalBody.children).forEach((child) => {
        host.appendChild(child);
      });
    }
    state.modalBody.innerHTML = '';
    state.modalBody.appendChild(panel);

    if (config.builder && typeof window[config.builder] === 'function') {
      log('Opening modal for', deviceKey);
    }

    state.modalOverlay.classList.add('is-active');
    state.modalOverlay.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    if (!state.modalOverlay) {
      return;
    }
    state.modalOverlay.classList.remove('is-active');
    state.modalOverlay.setAttribute('aria-hidden', 'true');
  };

  const getPatencySegments = () => Array.from(document.querySelectorAll('.arterial_segment'));

  const buildRange = ({ input, min, max, step, labelText, unit }) => {
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.style.display = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'endo-slider';

    if (labelText) {
      const label = document.createElement('div');
      label.className = 'endo-slider-label';
      label.textContent = labelText;
      wrapper.appendChild(label);
    }

    const output = document.createElement('output');
    output.className = 'endo-slider-output';
    const outputUnit = unit || '';
    output.textContent = `${input.value || min}${outputUnit}`;

    input.addEventListener('input', () => {
      output.textContent = `${input.value}${outputUnit}`;
    });

    wrapper.appendChild(input);
    wrapper.appendChild(output);

    input.parentNode?.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    return wrapper;
  };

  const loadSegmentData = (key) => {
    try {
      const raw = localStorage.getItem(`${key}_data`);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const saveSegmentData = (key, data) => {
    try {
      localStorage.setItem(`${key}_data`, JSON.stringify(data));
    } catch (error) {
      log('Unable to save data', error);
    }
  };

  const normalizeOptionToken = (value) => String(value || '').trim().toLowerCase();

  const resolveSelectOptionValue = (select, candidates) => {
    if (!select || !candidates || !candidates.length) {
      return null;
    }
    const options = Array.from(select.options || []);
    for (let i = 0; i < candidates.length; i += 1) {
      const candidate = normalizeOptionToken(candidates[i]);
      const match = options.find(
        (option) =>
          normalizeOptionToken(option.value) === candidate ||
          normalizeOptionToken(option.textContent) === candidate
      );
      if (match) {
        return match.value;
      }
    }
    return null;
  };

  const syncButtonGroupSelection = (group, select) => {
    if (!group || !select) {
      return;
    }
    const currentValue = select.value;
    Array.from(group.querySelectorAll('.endo-patency-button')).forEach((button) => {
      const isSelected = button.dataset.value === currentValue;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  };

  const createSelectButtonGroup = (select, groupLabel, optionDefs) => {
    if (!select || select.dataset.endoButtonGroup) {
      return;
    }
    const options = optionDefs
      .map((definition) => ({
        label: definition.label,
        value: resolveSelectOptionValue(select, definition.candidates),
      }))
      .filter((option) => option.value);

    if (!options.length) {
      return;
    }

    select.dataset.endoButtonGroup = 'true';
    select.classList.add('endo-select-hidden');

    const group = document.createElement('div');
    group.className = 'endo-patency-button-group';
    group.setAttribute('role', 'radiogroup');
    if (groupLabel) {
      group.setAttribute('aria-label', groupLabel);
    }

    options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'endo-patency-button';
      button.textContent = option.label;
      button.dataset.value = option.value;
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (select.value === option.value) {
          return;
        }
        select.value = option.value;
        select.dispatchEvent(new Event('input', { bubbles: true }));
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
      group.appendChild(button);
    });

    select.insertAdjacentElement('afterend', group);
    syncButtonGroupSelection(group, select);
    select.addEventListener('change', () => syncButtonGroupSelection(group, select));
    select.addEventListener('input', () => syncButtonGroupSelection(group, select));
  };

  const updatePatencyUI = (segment) => {
    const patencySelect = segment.querySelector('.patency');
    const stenosisLength = segment.querySelector('.stenosis_length');
    const stenosisPercent = segment.querySelector('.percentage');
    const occlusionLength = segment.querySelector('.occlusion_length');

    if (!patencySelect) {
      return;
    }

    const type = patencySelect.value;
    const showStenosis = type === 'stenosis';
    const showOcclusion = type === 'occlusion';

    if (stenosisLength) {
      stenosisLength.closest('.endo-slider')?.remove();
      if (showStenosis) {
        buildRange({
          input: stenosisLength,
          min: 0,
          max: 50,
          step: 1,
          labelText: 'Length of lesion',
          unit: ' cm',
        });
      } else {
        stenosisLength.style.display = 'none';
      }
    }

    if (stenosisPercent) {
      stenosisPercent.closest('.endo-slider')?.remove();
      if (showStenosis) {
        buildRange({
          input: stenosisPercent,
          min: 0,
          max: 100,
          step: 5,
          labelText: 'Degree of stenosis',
          unit: '%',
        });
      } else {
        stenosisPercent.style.display = 'none';
      }
    }

    if (occlusionLength) {
      occlusionLength.closest('.endo-slider')?.remove();
      if (showOcclusion) {
        buildRange({
          input: occlusionLength,
          min: 0,
          max: 50,
          step: 1,
          labelText: 'Length of lesion',
          unit: ' cm',
        });
      } else {
        occlusionLength.style.display = 'none';
      }
    }
  };

  const initPatencySegments = () => {
    const segments = getPatencySegments();
    segments.forEach((segment) => {
      if (segment.dataset.endoPatencyUi === 'true') {
        return;
      }
      if (segment.dataset.endoPatencyInitialized) {
        return;
      }

      segment.dataset.endoPatencyInitialized = 'true';
      const key = segment.dataset.key || segment.id || segment.dataset.name || '';
      const patency = segment.querySelector('.patency');
      const stenosisLength = segment.querySelector('.stenosis_length');
      const stenosisPercent = segment.querySelector('.percentage');
      const occlusionLength = segment.querySelector('.occlusion_length');
      const calcification = segment.querySelector('.calcification');
      const tooltip = segment.closest(
        '.raven-hotspot-tooltip, .raven-hotspot__tooltip, .raven-hotspot__content, .raven-hotspot-content, .raven-hotspot__popup, .raven-hotspot-popup'
      );

      segment.classList.add('endo-patency-tooltip');
      if (tooltip) {
        tooltip.classList.add('endo-patency-tooltip');
      }

      const saved = key ? loadSegmentData(key) : null;
      if (saved) {
        if (patency && saved.patency) patency.value = saved.patency;
        if (stenosisLength && saved.stenosisLength !== undefined) stenosisLength.value = saved.stenosisLength;
        if (stenosisPercent && saved.stenosisPercent !== undefined) stenosisPercent.value = saved.stenosisPercent;
        if (occlusionLength && saved.occlusionLength !== undefined) occlusionLength.value = saved.occlusionLength;
        if (calcification && saved.calcification) calcification.value = saved.calcification;
      }

      createSelectButtonGroup(patency, 'Patency', [
        { label: 'Open', candidates: ['open'] },
        { label: 'Stenosis', candidates: ['stenosis'] },
        { label: 'Occlusion', candidates: ['occlusion'] },
      ]);

      createSelectButtonGroup(calcification, 'Calcification', [
        { label: 'None', candidates: ['none'] },
        { label: 'Moderate', candidates: ['moderate'] },
        { label: 'Heavy', candidates: ['heavy'] },
      ]);

      updatePatencyUI(segment);

      const handleChange = () => {
        if (!key) {
          return;
        }
        const payload = {
          patency: patency?.value || '',
          stenosisLength: stenosisLength?.value || '',
          stenosisPercent: stenosisPercent?.value || '',
          occlusionLength: occlusionLength?.value || '',
          calcification: calcification?.value || '',
        };
        saveSegmentData(key, payload);
      };

      [patency, stenosisLength, stenosisPercent, occlusionLength, calcification].forEach((el) => {
        if (!el) {
          return;
        }
        el.addEventListener('change', () => {
          updatePatencyUI(segment);
          handleChange();
        });
        el.addEventListener('input', handleChange);
      });
    });
  };

  const humanizeKey = (key) => {
    if (!key) {
      return 'UNKNOWN SEGMENT';
    }
    return key.toUpperCase();
  };

  const normalizeSegmentKey = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const findMappedSegmentName = (value) => {
    const normalized = normalizeSegmentKey(value);
    if (!normalized) {
      return '';
    }
    if (segmentNameMap[normalized]) {
      return segmentNameMap[normalized];
    }
    const match = Object.keys(segmentNameMap).find((abbr) => normalized.includes(abbr));
    return match ? segmentNameMap[match] : '';
  };

  const resolveSegmentName = (segment) => {
    const datasetName = segment.dataset.name || segment.dataset.segmentName || segment.dataset.fullName;
    const mappedDatasetName = findMappedSegmentName(datasetName);
    if (mappedDatasetName) {
      return mappedDatasetName;
    }
    if (datasetName && datasetName.length > 3) {
      return datasetName;
    }

    const labelElement = segment.querySelector('[data-segment-name], .segment-name, .segment-title, .segment-label, .arterial-segment-title, .arterial-segment-name');
    if (labelElement) {
      const labelText = labelElement.dataset.segmentName || labelElement.textContent?.trim();
      const mappedLabel = findMappedSegmentName(labelText);
      if (mappedLabel) {
        return mappedLabel;
      }
      if (labelText && labelText.length > 3) {
        return labelText;
      }
    }

    const key = segment.dataset.key || segment.id || '';
    const mappedKey = findMappedSegmentName(key);
    if (mappedKey) {
      return mappedKey;
    }
    return humanizeKey(key);
  };

  const resolvePoplitealSuffix = (key) => {
    const normalized = normalizeSegmentKey(key);
    if (!normalized) {
      return '';
    }
    if (normalized.includes('p1')) {
      return 'P1';
    }
    if (normalized.includes('p2')) {
      return 'P2';
    }
    if (normalized.includes('p3')) {
      return 'P3';
    }
    return '';
  };

  const formatSegmentName = (segment) => {
    const baseName = resolveSegmentName(segment);
    const key = segment.dataset.key || segment.id || '';
    const suffix = resolvePoplitealSuffix(key);
    if (!suffix) {
      return baseName;
    }
    if (/popliteal/i.test(baseName) && !new RegExp(`\\(${suffix}\\)`, 'i').test(baseName)) {
      return `${baseName} (${suffix})`;
    }
    return baseName;
  };

  const formatOptionLabel = (value) => {
    if (!value) {
      return '';
    }
    const normalized = String(value).trim();
    if (!normalized) {
      return '';
    }
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const formatPatencyDetail = (segment, saved) => {
    if (!saved || !saved.patency) {
      return '';
    }
    const details = [];
    const patencyValue = formatOptionLabel(saved.patency);
    if (patencyValue) {
      details.push(patencyValue);
    }
    if (saved.patency === 'stenosis' || saved.patency === 'Stenosis') {
      if (saved.stenosisLength) {
        details.push(`Length ${saved.stenosisLength} cm`);
      }
      const percentValue = saved.percentage || saved.stenosisPercent;
      if (percentValue) {
        details.push(`Degree ${percentValue}%`);
      }
    }
    if (saved.patency === 'occlusion' || saved.patency === 'Occlusion') {
      if (saved.occlusionLength) {
        details.push(`Length ${saved.occlusionLength} cm`);
      }
    }
    if (saved.calcification) {
      details.push(`Calcification ${formatOptionLabel(saved.calcification)}`);
    }
    if (!details.length) {
      return '';
    }
    return `${formatSegmentName(segment)}: ${details.join(', ')}`;
  };

  const resolveSegmentLevel = (segment) => {
    const level = segment.dataset.level;
    if (level) {
      return level;
    }
    const key = (segment.dataset.key || segment.id || '').toLowerCase();
    const matched = Object.keys(levelMap).find((token) => key.includes(token));
    return matched ? levelMap[matched] : 'aorto-iliac';
  };

  const buildSummary = () => {
    const summaryText = document.getElementById('summaryText');
    const summary1 = document.getElementById('summary1');
    const summary2 = document.getElementById('summary2');
    const summary3 = document.getElementById('summary3');

    if (!summaryText && !summary1 && !summary2 && !summary3) {
      return;
    }

    const segments = getPatencySegments();
    const groups = {
      'aorto-iliac': [],
      'fem-pop': [],
      below: [],
    };

    segments.forEach((segment) => {
      const segmentKey = segment.dataset.key;
      const saved = segmentKey ? loadSegmentData(segmentKey) : null;
      if (!saved || !saved.patency) {
        return;
      }
      const detail = formatPatencyDetail(segment, saved);
      if (!detail) {
        return;
      }
      const level = resolveSegmentLevel(segment);
      if (level === 'fem-pop') {
        groups['fem-pop'].push(detail);
      } else if (level === 'below') {
        groups.below.push(detail);
      } else {
        groups['aorto-iliac'].push(detail);
      }
    });

    const buildSentence = (items) => {
      if (!items.length) {
        return 'No segments selected.';
      }
      return items.join('; ') + '.';
    };

    const hasDetailSummaries = summary1 || summary2 || summary3;
    if (summaryText && (summaryText.dataset.summaryType === 'patency' || !hasDetailSummaries)) {
      summaryText.textContent =
        `Aorto-iliac: ${buildSentence(groups['aorto-iliac'])} ` +
        `Fem-pop: ${buildSentence(groups['fem-pop'])} ` +
        `Below the knee: ${buildSentence(groups.below)}`;
      summaryText.style.fontSize = '16px';
      summaryText.style.lineHeight = '1.4';
    }
    if (summary1) {
      summary1.textContent = buildSentence(groups['aorto-iliac']);
      summary1.style.fontSize = '16px';
    }
    if (summary2) {
      summary2.textContent = buildSentence(groups['fem-pop']);
      summary2.style.fontSize = '16px';
    }
    if (summary3) {
      summary3.textContent = buildSentence(groups.below);
      summary3.style.fontSize = '16px';
    }
  };

  const summarizeCase = (source) => {
    buildSummary();
    updateClinicalSummary(source);
  };

  const getClinicalContainer = (source) => {
    if (source && source.closest) {
      const container = source.closest('.endo-clinical-indication');
      if (container) {
        return container;
      }
    }
    return document.querySelector('.endo-clinical-indication');
  };

  const normalizeToken = (value) =>
    String(value || '')
      .toLowerCase()
      .replace(/fontaine|rutherford|stage|class/g, '')
      .replace(/[^a-z0-9]/g, '');

  const getSelectDisplayValue = (input) => {
    if (!input) {
      return '';
    }
    if (input.tagName === 'SELECT') {
      const option = input.options[input.selectedIndex];
      return option ? option.textContent.trim() : input.value;
    }
    if (input.type === 'radio' || input.type === 'checkbox') {
      return input.checked ? input.value : '';
    }
    return input.value || '';
  };

  const findInputByName = (container, names) => {
    if (!container) {
      return null;
    }
    return (
      names
        .map((name) => container.querySelector(`input[name="${name}"]:checked`))
        .find(Boolean) || null
    );
  };

  const findFirstElement = (container, selectors) => {
    if (!container) {
      return null;
    }
    for (let i = 0; i < selectors.length; i += 1) {
      const match = container.querySelector(selectors[i]);
      if (match) {
        return match;
      }
    }
    return null;
  };

  const getActiveButtonValue = (container, selectors) => {
    const button = findFirstElement(container, selectors);
    if (!button) {
      return '';
    }
    return button.dataset.value || button.dataset.laterality || button.textContent.trim();
  };

  const getClinicalLaterality = (container) => {
    if (!container) {
      return '';
    }
    const radio = findInputByName(container, ['laterality']);
    if (radio) {
      return getSelectDisplayValue(radio);
    }
    const select = findFirstElement(container, ['select[name="laterality"]', '#laterality', '.endo-laterality-select']);
    if (select) {
      return getSelectDisplayValue(select);
    }
    return getActiveButtonValue(container, [
      '[data-laterality].active',
      '[data-laterality].selected',
      '.laterality-buttons .active',
      '.laterality-buttons .selected',
      '.laterality-row .active',
      '.laterality-row .selected',
    ]);
  };

  const getClinicalFontaine = (container) => {
    if (!container) {
      return '';
    }
    const radio = findInputByName(container, ['fontaine', 'fontaine_stage', 'fontaineStage']);
    if (radio) {
      return getSelectDisplayValue(radio);
    }
    const select = findFirstElement(container, [
      'select[name="fontaine"]',
      'select[name="fontaine_stage"]',
      'select[name="fontaineStage"]',
      '#fontaine',
      '.fontaine-select',
      '.endo-fontaine-select',
    ]);
    return getSelectDisplayValue(select);
  };

  const getClinicalRutherford = (container) => {
    if (!container) {
      return '';
    }
    const radio = findInputByName(container, ['rutherford', 'rutherford_stage', 'rutherfordStage']);
    if (radio) {
      return getSelectDisplayValue(radio);
    }
    const select = findFirstElement(container, [
      'select[name="rutherford"]',
      'select[name="rutherford_stage"]',
      'select[name="rutherfordStage"]',
      '#rutherford',
      '.rutherford-select',
      '.endo-rutherford-select',
    ]);
    return getSelectDisplayValue(select);
  };

  const getWifiSummary = (container) => {
    if (!container) {
      return '';
    }
    const wound = findInputByName(container, ['wound', 'wifi_wound']) || findFirstElement(container, ['#wifi-wound', '.wifi-wound']);
    const ischemia =
      findInputByName(container, ['ischemia', 'wifi_ischemia']) ||
      findFirstElement(container, ['#wifi-ischemia', '.wifi-ischemia']);
    const infection =
      findInputByName(container, ['infection', 'wifi_infection']) ||
      findFirstElement(container, ['#wifi-infection', '.wifi-infection']);

    const woundValue = getSelectDisplayValue(wound);
    const ischemiaValue = getSelectDisplayValue(ischemia);
    const infectionValue = getSelectDisplayValue(infection);

    if (!woundValue && !ischemiaValue && !infectionValue) {
      return '';
    }

    return `W${woundValue || '—'}I${ischemiaValue || '—'}fI${infectionValue || '—'}`;
  };

  const updateClinicalSummary = (source) => {
    const container = getClinicalContainer(source);
    if (!container) {
      return;
    }

    const summaryText = document.getElementById('summaryText');
    if (!summaryText) {
      return;
    }

    const laterality = getClinicalLaterality(container) || '—';
    const fontaine = getClinicalFontaine(container) || '—';
    const rutherford = getClinicalRutherford(container) || '—';
    const wifi = getWifiSummary(container) || '—';

    summaryText.textContent =
      `Laterality: ${laterality} | Fontaine: ${fontaine} | Rutherford: ${rutherford} | WIfI: ${wifi}`;
    summaryText.style.fontSize = '16px';
    summaryText.style.lineHeight = '1.4';
  };

  const fontaineToRutherford = {
    i: ['0', 'rutherford0', 'stage0', 'rutherford0asymptomatic'],
    iia: ['1', 'rutherford1', 'stage1', 'mildclaudication'],
    iib: ['2', '3', 'rutherford2', 'rutherford3', 'stage2', 'stage3', 'moderateclaudication', 'severeclaudication'],
    iii: ['4', 'rutherford4', 'stage4', 'restpain'],
    iv: ['5', '6', 'rutherford5', 'rutherford6', 'stage5', 'stage6', 'tissueloss'],
  };

  const isFontaineElement = (element) => {
    if (!element) {
      return false;
    }
    const tokens = `${element.id || ''} ${element.name || ''} ${element.className || ''}`;
    return /fontaine/i.test(tokens);
  };

  const findRutherfordInput = (container) =>
    findFirstElement(container, [
      'select[name="rutherford"]',
      'select[name="rutherford_stage"]',
      'select[name="rutherfordStage"]',
      '#rutherford',
      '.rutherford-select',
      '.endo-rutherford-select',
      'input[name="rutherford"]',
      'input[name="rutherford_stage"]',
      'input[name="rutherfordStage"]',
    ]);

  const setInputFromCandidates = (container, input, candidates) => {
    if (!input || !candidates || !candidates.length) {
      return false;
    }

    if (input.tagName === 'SELECT') {
      const options = Array.from(input.options);
      const match = options.find((option) => candidates.includes(normalizeToken(option.value) || normalizeToken(option.textContent)));
      if (match) {
        input.value = match.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }

    if (input.type === 'radio' && input.name) {
      const radios = container.querySelectorAll(`input[name="${input.name}"]`);
      const match = Array.from(radios).find((radio) =>
        candidates.includes(normalizeToken(radio.value || radio.dataset.value))
      );
      if (match) {
        match.checked = true;
        match.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    }

    input.value = candidates[0];
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const clearDevicePanels = () => {
    const host = document.getElementById('endo-intervention-panels');
    if (host) {
      host.innerHTML = '';
    }
  };

  const clearSummaries = () => {
    const ids = ['summaryText', 'summary1', 'summary2', 'summary3'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = '';
      }
    });
  };

  const showToast = (message) => {
    const existingToasts = Array.from(document.querySelectorAll('.endo-toast'));
    let toast = existingToasts[0];
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'endo-toast';
      document.body.appendChild(toast);
    }
    if (existingToasts.length > 1) {
      existingToasts.slice(1).forEach((extra) => extra.remove());
    }
    toast.textContent = message;
    toast.classList.add('is-active');
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
    }
    state.toastTimer = setTimeout(() => toast.classList.remove('is-active'), 2500);
  };

  const resetCase = () => {
    const now = Date.now();
    if (now - state.lastResetAt < 1000 || (window.__ENDO_LAST_RESET_AT__ && now - window.__ENDO_LAST_RESET_AT__ < 1000)) {
      return;
    }
    state.lastResetAt = now;
    window.__ENDO_LAST_RESET_AT__ = now;
    const clearedByElementor = typeof window.endoElementorClearCaseUI === 'function';
    if (clearedByElementor) {
      window.endoElementorClearCaseUI();
    } else {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.endsWith('_data')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        log('Unable to clear localStorage', error);
      }
      clearDevicePanels();
      clearSummaries();
    }
    if (typeof window.endoPatencyReset === 'function') {
      window.endoPatencyReset();
    }
    try {
      Object.keys(localStorage).forEach((key) => {
        if (/^endoplanner/i.test(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      log('Unable to clear localStorage', error);
    }
    showToast('New case started. Data has been reset.');
  };

  const bindClicks = () => {
    if (state.boundClick && state.clickHandler) {
      document.removeEventListener('click', state.clickHandler);
    }
    if (state.boundClick && state.changeHandler) {
      document.removeEventListener('change', state.changeHandler);
    }

    state.clickHandler = (event) => {
      const deviceTrigger = event.target.closest('.endo-device-trigger');
      if (deviceTrigger) {
        event.preventDefault();
        const targetSelector = deviceTrigger.getAttribute('data-target') || deviceTrigger.getAttribute('href');
        if (targetSelector && targetSelector.startsWith('#')) {
          const target = document.querySelector(targetSelector);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        const deviceId = resolveDeviceId(deviceTrigger);
        openModal(deviceId);
        return;
      }

      const newCaseTrigger =
        event.target.closest('.endo-newcase-trigger') || event.target.closest('#startnewcase');
      if (newCaseTrigger) {
        event.preventDefault();
        resetCase();
        const caseTarget = document.getElementById('case');
        if (caseTarget) {
          caseTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      const summarizeTrigger =
        event.target.closest('.endo-summarize-trigger') || event.target.closest('#jsonlog');
      if (summarizeTrigger) {
        event.preventDefault();
        summarizeCase(summarizeTrigger);
        const summaryTarget = document.getElementById('casesummary');
        if (summaryTarget) {
          summaryTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    state.changeHandler = (event) => {
      const target = event.target;
      if (!isFontaineElement(target)) {
        return;
      }

      const container = getClinicalContainer(target);
      if (!container) {
        return;
      }

      const fontaineValue = normalizeToken(getClinicalFontaine(container));
      if (!fontaineValue) {
        return;
      }

      const candidates = fontaineToRutherford[fontaineValue];
      if (!candidates) {
        return;
      }

      const rutherfordInput = findRutherfordInput(container);
      if (rutherfordInput) {
        setInputFromCandidates(container, rutherfordInput, candidates);
      }
    };

    document.addEventListener('click', state.clickHandler);
    document.addEventListener('change', state.changeHandler);
    state.boundClick = true;
    window.EndoPlannerV2 = window.EndoPlannerV2 || {};
    window.EndoPlannerV2.__caseScrollHandlersBound = true;
    if (!window.__ENDO_CASE_SCROLL_LOGGED__ && typeof console !== 'undefined' && console.info) {
      window.__ENDO_CASE_SCROLL_LOGGED__ = true;
      console.info('[EndoPlanner v2] New case/summarize scroll handlers bound');
    }
  };

  const init = () => {
    bindClicks();
    initPatencySegments();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (window.elementorFrontend && window.elementorFrontend.hooks) {
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', () => {
      init();
    });
  }
})();
