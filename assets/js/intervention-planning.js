(function () {
  if (window.__ENDO_INTERVENTION_BOOTED__) {
    return;
  }
  window.__ENDO_INTERVENTION_BOOTED__ = true;

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
  };

  const deviceConfigs = {
    needle: { label: 'Needle', builder: 'addAnotherNeedle' },
    sheath: { label: 'Sheath', builder: 'addAnotherSheath' },
    catheter: { label: 'Catheter', builder: 'addAnotherCatheter' },
    wire: { label: 'Wire', builder: 'addAnotherWire' },
    pta: { label: 'PTA Balloon', builder: 'addAnotherPta' },
    stent: { label: 'Stent', builder: 'addAnotherStent' },
    special: { label: 'Special Device', builder: 'addAnotherSpecial' },
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

  const createDeviceRow = (deviceKey, index) => {
    const row = document.createElement('div');
    row.className = 'endo-device-row';
    row.dataset.device = deviceKey;

    const label = document.createElement('span');
    label.className = 'endo-device-label';
    label.textContent = `${deviceConfigs[deviceKey]?.label || 'Device'} ${index + 1}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'endo-device-input';
    input.placeholder = 'Enter device details';

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'endo-device-remove';
    remove.textContent = '−';
    remove.addEventListener('click', () => {
      row.remove();
      updateRowLabels(deviceKey);
    });

    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(remove);

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
          labelText: 'Length of stenosed segment',
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
          labelText: 'Length of occluded segment',
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

      const saved = key ? loadSegmentData(key) : null;
      if (saved) {
        if (patency && saved.patency) patency.value = saved.patency;
        if (stenosisLength && saved.stenosisLength !== undefined) stenosisLength.value = saved.stenosisLength;
        if (stenosisPercent && saved.stenosisPercent !== undefined) stenosisPercent.value = saved.stenosisPercent;
        if (occlusionLength && saved.occlusionLength !== undefined) occlusionLength.value = saved.occlusionLength;
        if (calcification && saved.calcification) calcification.value = saved.calcification;
      }

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
      return 'Unknown segment';
    }
    const cleaned = key.replace(/[_-]+/g, ' ').trim();
    return cleaned.replace(/\b\w/g, (match) => match.toUpperCase());
  };

  const resolveSegmentName = (segment) => {
    const datasetName = segment.dataset.name;
    if (datasetName) {
      return datasetName;
    }
    const key = (segment.dataset.key || segment.id || '').toLowerCase();
    if (segmentNameMap[key]) {
      return segmentNameMap[key];
    }
    const match = Object.keys(segmentNameMap).find((abbr) => key.includes(abbr));
    if (match) {
      return segmentNameMap[match];
    }
    return humanizeKey(segment.dataset.key || segment.id || '');
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
      const patency = segment.querySelector('.patency')?.value || '';
      if (!patency) {
        return;
      }
      const name = resolveSegmentName(segment);
      const level = resolveSegmentLevel(segment);
      const label = `${name} (${patency})`;
      if (level === 'fem-pop') {
        groups['fem-pop'].push(label);
      } else if (level === 'below') {
        groups.below.push(label);
      } else {
        groups['aorto-iliac'].push(label);
      }
    });

    const buildSentence = (items) => {
      if (!items.length) {
        return 'No segments selected.';
      }
      return items.join(', ') + '.';
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
    let toast = document.querySelector('.endo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'endo-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-active');
    setTimeout(() => toast.classList.remove('is-active'), 2500);
  };

  const resetCase = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.endsWith('_data') || /^endoplanner/i.test(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      log('Unable to clear localStorage', error);
    }
    clearDevicePanels();
    clearSummaries();
    showToast('New case started. Data has been reset.');
  };

  const bindClicks = () => {
    if (state.boundClick) {
      return;
    }
    state.boundClick = true;

    document.addEventListener('click', (event) => {
      const deviceTrigger = event.target.closest('.endo-device-trigger');
      if (deviceTrigger) {
        const targetSelector = deviceTrigger.getAttribute('data-target') || deviceTrigger.getAttribute('href');
        if (targetSelector && targetSelector.startsWith('#')) {
          const target = document.querySelector(targetSelector);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        const deviceId = resolveDeviceId(deviceTrigger);
        openModal(deviceId);
        return;
      }

      const newCaseTrigger =
        event.target.closest('.endo-newcase-trigger') || event.target.closest('#startnewcase');
      if (newCaseTrigger) {
        resetCase();
        return;
      }

      const summarizeTrigger =
        event.target.closest('.endo-summarize-trigger') || event.target.closest('#jsonlog');
      if (summarizeTrigger) {
        buildSummary();
        updateClinicalSummary(summarizeTrigger);
      }
    });

    document.addEventListener('change', (event) => {
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
    });
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
