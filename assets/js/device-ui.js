(function () {
  const plannerDebug = typeof window !== 'undefined' && window.PLANNER_DEBUG === true;
  if (plannerDebug && typeof console !== 'undefined' && console.log) {
    console.log('[PlannerBoot] entrypoint loaded', {
      file: 'assets/js/device-ui.js',
      buildStamp: window.EndoPlannerV2Build?.git || window.EndoPlannerV2Build?.version || 'unknown',
    });
  }
  window.EndoPlannerV2 = window.EndoPlannerV2 || {};
  const namespace = window.EndoPlannerV2;

  if (namespace.__deviceUIInit) {
    return;
  }
  namespace.__deviceUIInit = true;

  const buildInfo = window.EndoPlannerV2Build || {};
  const pluginVersion = buildInfo.version || 'unknown';
  const gitHash = buildInfo.git || 'unknown';

  if (!namespace.__deviceUILogged && typeof console !== 'undefined' && console.log) {
    namespace.__deviceUILogged = true;
    console.log('[EndoPlanner v2] device-ui loaded', { version: pluginVersion, git: gitHash });
  }

  const warned = {};
  const warnOnce = (name, message) => {
    if (warned[name]) {
      return;
    }
    warned[name] = true;
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(message);
    }
  };

  const DEVICE_CONFIGS = {
    needle: { panelId: 'plananeedle', label: 'Needle', placeholder: 'Select needle' },
    sheath: { panelId: 'planasheath', label: 'Sheath', placeholder: 'Select sheath' },
    catheter: { panelId: 'planacatheter', label: 'Catheter', placeholder: 'Select catheter' },
    wire: { panelId: 'planawire', label: 'Wire', placeholder: 'Select wire' },
    pta: { panelId: 'planapta', label: 'PTA', placeholder: 'Select PTA balloon' },
    stent: { panelId: 'planastent', label: 'Stent', placeholder: 'Select stent' },
    special: { panelId: 'planaspecial1', label: 'Special device', placeholder: 'Select special device' },
  };

  const styleButton = (button, variant) => {
    button.type = 'button';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.padding = '6px 12px';
    button.style.margin = '4px 6px 4px 0';
    button.style.borderRadius = '4px';
    button.style.border = '1px solid #222';
    button.style.background = variant === 'danger' ? '#b71c1c' : '#222';
    button.style.color = '#fff';
    button.style.cursor = 'pointer';
    button.style.fontSize = '13px';
    button.style.lineHeight = '1.2';
  };

  const createAddButton = (label, onClick) => {
    const button = document.createElement('button');
    button.textContent = label;
    styleButton(button, 'primary');
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    return button;
  };

  const createDeleteButton = (onClick) => {
    const button = document.createElement('button');
    button.textContent = 'Remove';
    styleButton(button, 'danger');
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    return button;
  };

  const normalizeOptions = (options) => {
    if (!Array.isArray(options)) {
      return [];
    }
    return options
      .map((option) => {
        if (option && typeof option === 'object') {
          return {
            value: option.value ?? option.label ?? '',
            label: option.label ?? option.value ?? '',
          };
        }
        return { value: option, label: option };
      })
      .filter((option) => option.value || option.label);
  };

  const parseOptions = (raw) => {
    if (!raw) {
      return [];
    }
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return [];
      }
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (error) {
          return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
        }
      }
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  const resolveOptions = (deviceKey, panel) => {
    const globalOptions =
      window.EndoPlannerV2DeviceOptions ||
      window.EndoPlannerDeviceOptions ||
      window.EndoPlannerDeviceUIOptions ||
      {};
    if (Array.isArray(globalOptions[deviceKey])) {
      return normalizeOptions(globalOptions[deviceKey]);
    }

    const dataset = panel ? panel.dataset : {};
    const optionsRaw =
      dataset?.optionsJson ||
      dataset?.options ||
      dataset?.[`${deviceKey}OptionsJson`] ||
      dataset?.[`${deviceKey}Options`];
    return normalizeOptions(parseOptions(optionsRaw));
  };

  const mkSelect = (options, placeholder, className) => {
    const select = document.createElement('select');
    if (className) {
      select.className = className;
    }
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.appendChild(placeholderOption);

    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    });

    return select;
  };

  const createDeviceRow = (deviceKey, panel, options, placeholder) => {
    const row = document.createElement('div');
    row.className = 'endo-device-row';
    row.dataset.deviceKey = deviceKey;

    const select = mkSelect(options, placeholder, 'endo-device-select');
    row.appendChild(select);

    const deleteButton = createDeleteButton(() => row.remove());
    row.appendChild(deleteButton);

    return row;
  };

  const ensureAddButton = (deviceKey, panel) => {
    if (!panel) {
      return;
    }
    const existing = panel.querySelector(`button[data-endo-add="${deviceKey}"]`);
    if (existing) {
      return;
    }
    const label = DEVICE_CONFIGS[deviceKey]?.label || 'Device';
    const addButton = createAddButton(`Add another ${label}`, () => {
      addDeviceRow(deviceKey, panel.id);
    });
    addButton.dataset.endoAdd = deviceKey;
    panel.appendChild(addButton);
  };

  const addDeviceRow = (deviceKey, panelId) => {
    const config = DEVICE_CONFIGS[deviceKey] || {};
    const resolvedPanelId = panelId || config.panelId;
    if (!resolvedPanelId) {
      return false;
    }
    const panel = document.getElementById(resolvedPanelId);
    if (!panel) {
      return false;
    }

    ensureAddButton(deviceKey, panel);

    const options = resolveOptions(deviceKey, panel);
    const placeholder = config.placeholder || 'Select device';
    const row = createDeviceRow(deviceKey, panel, options, placeholder);
    const addButton = panel.querySelector(`button[data-endo-add="${deviceKey}"]`);
    if (addButton) {
      panel.insertBefore(row, addButton);
    } else {
      panel.appendChild(row);
    }
    return true;
  };

  const clearElement = (element) => {
    if (!element) {
      return;
    }
    if ('value' in element) {
      element.value = '';
    }
    element.textContent = '';
  };

  namespace.clearCaseUI = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.endsWith('_data')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Ignore storage failures.
    }

    ['summaryText', 'summary1', 'summary2', 'summary3'].forEach((id) => {
      const element = document.getElementById(id);
      clearElement(element);
    });

    [
      'plananeedle',
      'planasheath',
      'planacatheter',
      'planawire',
      'planapta',
      'planastent',
      'planaspecial1',
      'planaspecial2',
    ].forEach((panelId) => {
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.innerHTML = '';
      }
    });
  };

  namespace.addAnotherNeedle = () => addDeviceRow('needle');
  namespace.addAnotherSheath = () => addDeviceRow('sheath');
  namespace.addAnotherCatheter = () => addDeviceRow('catheter');
  namespace.addAnotherWire = () => addDeviceRow('wire');
  namespace.addAnotherPta = () => addDeviceRow('pta');
  namespace.addAnotherStent = () => addDeviceRow('stent');
  namespace.addAnotherSpecial = (panelId) => addDeviceRow('special', panelId);

  const setPanelState = (panel, open) => {
    if (!panel) {
      return;
    }
    panel.dataset.endoPanelOpen = open ? 'true' : 'false';
    panel.classList.toggle('endo-panel-open', open);
    panel.classList.toggle('endo-panel-collapsed', !open);
  };

  const ensurePanelCloseButton = (panel) => {
    if (!panel || panel.dataset.endoPanelCloseAdded === 'true') {
      return;
    }
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'endo-panel-close';
    closeButton.setAttribute('aria-label', 'Close panel');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => setPanelState(panel, false));
    panel.dataset.endoPanelCloseAdded = 'true';
    panel.insertBefore(closeButton, panel.firstChild);
  };

  const panelHasEntries = (panel) => {
    if (!panel) {
      return false;
    }
    return Boolean(panel.querySelector('.endo-device-row, .endo-device-select, select'));
  };

  const deviceTriggerMap = [
    { triggerId: 'needleimg', panelId: 'plananeedle', builder: () => namespace.addAnotherNeedle() },
    { triggerId: 'sheathimg', panelId: 'planasheath', builder: () => namespace.addAnotherSheath() },
    { triggerId: 'catheterimg', panelId: 'planacatheter', builder: () => namespace.addAnotherCatheter() },
    { triggerId: 'wireimg', panelId: 'planawire', builder: () => namespace.addAnotherWire() },
    { triggerId: 'ptaimg', panelId: 'planapta', builder: () => namespace.addAnotherPta() },
    { triggerId: 'stentimg', panelId: 'planastent', builder: () => namespace.addAnotherStent() },
    { triggerId: 'special1img', panelId: 'planaspecial1', builder: () => namespace.addAnotherSpecial('planaspecial1') },
    { triggerId: 'special2img', panelId: 'planaspecial2', builder: () => namespace.addAnotherSpecial('planaspecial2') },
  ];

  const bindDeviceTriggers = () => {
    deviceTriggerMap.forEach(({ triggerId, panelId, builder }) => {
      const trigger = document.getElementById(triggerId);
      if (!trigger || trigger.dataset.endoDeviceTriggerBound) {
        return;
      }
      trigger.dataset.endoDeviceTriggerBound = 'true';
      trigger.addEventListener('click', () => {
        window.setTimeout(() => {
          const panel = document.getElementById(panelId);
          if (!panel) {
            return;
          }
          ensurePanelCloseButton(panel);
          const isOpen = panel.dataset.endoPanelOpen === 'true';
          const nextOpen = !isOpen;
          setPanelState(panel, nextOpen);
          if (nextOpen) {
            if (!panelHasEntries(panel) && typeof builder === 'function') {
              builder();
            }
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 0);
      });
    });

    if (!namespace.__deviceTriggersLogged && typeof console !== 'undefined' && console.info) {
      namespace.__deviceTriggersLogged = true;
      if (console.debug) {
        console.debug('[EndoPlanner v2] Intervention device triggers bound once');
      }
      console.info('[EndoPlanner v2] Intervention device triggers bound');
    }
  };

  const bindNewCaseTriggers = () => {
    if (namespace.__caseScrollHandlersBound) {
      return;
    }
    const triggers = Array.from(document.querySelectorAll('.endo-newcase-trigger'));
    triggers.forEach((trigger) => {
      if (trigger.dataset.endoNewcaseBound) {
        return;
      }
      trigger.dataset.endoNewcaseBound = 'true';
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        namespace.clearCaseUI();
        window.dispatchEvent(new CustomEvent('endo:newcase'));
      });
    });
  };

  const safeInit = () => {
    if (plannerDebug && typeof console !== 'undefined' && console.log) {
      console.log('[PlannerBoot] before mount', {
        file: 'assets/js/device-ui.js',
        buildStamp: `${pluginVersion}-${gitHash}`,
      });
    }
    try {
      bindNewCaseTriggers();
      bindDeviceTriggers();
      if (plannerDebug && typeof console !== 'undefined' && console.log) {
        console.log('[PlannerBoot] after mount', {
          file: 'assets/js/device-ui.js',
          buildStamp: `${pluginVersion}-${gitHash}`,
        });
      }
    } catch (error) {
      if (typeof console !== 'undefined' && console.error) {
        console.error('[PlannerBoot] device-ui init failed', error);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

  const installDeprecatedShim = (name, fn) => {
    const existing = window[name];
    window[name] = (...args) => {
      warnOnce(
        name,
        `[EndoPlanner v2] Deprecated: window.${name}. Use EndoPlannerV2.${fn} instead.`
      );
      const result = namespace[fn](...args);
      if (result === false && typeof existing === 'function') {
        return existing(...args);
      }
      return result;
    };
    window[name].__endoDeprecatedShim = true;
  };

  installDeprecatedShim('endoElementorClearCaseUI', 'clearCaseUI');
  installDeprecatedShim('addAnotherNeedle', 'addAnotherNeedle');
  installDeprecatedShim('addAnotherSheath', 'addAnotherSheath');
  installDeprecatedShim('addAnotherCatheter', 'addAnotherCatheter');
  installDeprecatedShim('addAnotherWire', 'addAnotherWire');
  installDeprecatedShim('addAnotherPta', 'addAnotherPta');
  installDeprecatedShim('addAnotherStent', 'addAnotherStent');
  installDeprecatedShim('addAnotherSpecial', 'addAnotherSpecial');
})();
