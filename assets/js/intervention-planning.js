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
    raic: 'Right internal iliac artery',
    raec: 'Right external iliac artery',
    raoc: 'Right common iliac artery',
    laic: 'Left internal iliac artery',
    laec: 'Left external iliac artery',
    laoc: 'Left common iliac artery',
    rcia: 'Right common iliac artery',
    lcia: 'Left common iliac artery',
    rciae: 'Right common iliac artery',
    lciae: 'Left common iliac artery',
    rsfa: 'Right superficial femoral artery',
    lsfa: 'Left superficial femoral artery',
    rcfa: 'Right common femoral artery',
    lcfa: 'Left common femoral artery',
    rpop: 'Right popliteal artery',
    lpop: 'Left popliteal artery',
    rpta: 'Right posterior tibial artery',
    lpta: 'Left posterior tibial artery',
    rata: 'Right anterior tibial artery',
    lata: 'Left anterior tibial artery',
    rper: 'Right peroneal artery',
    lper: 'Left peroneal artery',
    rtp: 'Right tibioperoneal trunk',
    ltp: 'Left tibioperoneal trunk',
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

    if (summaryText) {
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
        if (key.endsWith('_data')) {
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
        const deviceId = resolveDeviceId(deviceTrigger);
        openModal(deviceId);
        return;
      }

      const newCaseTrigger = event.target.closest('.endo-newcase-trigger');
      if (newCaseTrigger) {
        resetCase();
        return;
      }

      const summarizeTrigger = event.target.closest('.endo-summarize-trigger');
      if (summarizeTrigger) {
        buildSummary();
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
