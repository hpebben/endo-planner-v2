(function () {
  if (window.__ENDO_PATENCY_UI_BOOTED__) {
    return;
  }
  window.__ENDO_PATENCY_UI_BOOTED__ = true;

  const buildInfo = window.EndoPlannerV2Build || {};
  if (typeof console !== 'undefined' && console.info) {
    console.info('[EndoPlanner v2] Patency UI loaded', buildInfo);
  }

  const STORAGE_PREFIX = 'endo_patency_';

  const createElement = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (text) {
      el.textContent = text;
    }
    return el;
  };

  const createSelect = (options, placeholder) => {
    const select = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.textContent = placeholder;
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    options.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue.value;
      option.textContent = optionValue.label;
      select.appendChild(option);
    });

    return select;
  };

  const createSlider = ({ min, max, step, unit }) => {
    const wrapper = createElement('div', 'endo-patency-slider');
    const input = document.createElement('input');
    const output = document.createElement('output');

    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = min;

    output.textContent = `${input.value}${unit}`;

    input.addEventListener('input', () => {
      output.textContent = `${input.value}${unit}`;
    });

    wrapper.appendChild(input);
    wrapper.appendChild(output);

    return { wrapper, input, output };
  };

  const getStorageKey = (segment) => {
    const key = segment.dataset.key || segment.id || '';
    return key ? `${STORAGE_PREFIX}${key}` : '';
  };

  const loadSegment = (segment) => {
    const key = getStorageKey(segment);
    if (!key) {
      return null;
    }
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const saveSegment = (segment, data) => {
    const key = getStorageKey(segment);
    if (!key) {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[EndoPlanner v2] Unable to persist patency data', error);
      }
    }
  };

  const buildSummary = (data) => {
    if (!data || !data.patency) {
      return 'Summary: No patency selected.';
    }
    const parts = [`Patency: ${data.patencyLabel || data.patency}`];
    if (data.patency === 'stenosis') {
      if (data.stenosisLength) {
        parts.push(`Length ${data.stenosisLength} cm`);
      }
      if (data.stenosisPercent) {
        parts.push(`${data.stenosisPercent}% stenosis`);
      }
    }
    if (data.patency === 'occlusion' && data.occlusionLength) {
      parts.push(`Length ${data.occlusionLength} cm`);
    }
    if (data.calcificationLabel) {
      parts.push(`Calcification: ${data.calcificationLabel}`);
    }
    return `Summary: ${parts.join(' | ')}.`;
  };

  const hydrateValues = (segment, ui, saved) => {
    if (!saved) {
      return;
    }
    if (saved.patency) {
      ui.patencySelect.value = saved.patency;
    }
    if (saved.stenosisLength) {
      ui.stenosisLength.input.value = saved.stenosisLength;
      ui.stenosisLength.output.textContent = `${saved.stenosisLength} cm`;
    }
    if (saved.stenosisPercent) {
      ui.stenosisPercent.input.value = saved.stenosisPercent;
      ui.stenosisPercent.output.textContent = `${saved.stenosisPercent}%`;
    }
    if (saved.occlusionLength) {
      ui.occlusionLength.input.value = saved.occlusionLength;
      ui.occlusionLength.output.textContent = `${saved.occlusionLength} cm`;
    }
    if (saved.calcification) {
      ui.calcificationSelect.value = saved.calcification;
    }
  };

  const updateVisibility = (ui) => {
    const patency = ui.patencySelect.value;
    const showStenosis = patency === 'stenosis';
    const showOcclusion = patency === 'occlusion';

    ui.stenosisLengthRow.classList.toggle('is-hidden', !showStenosis);
    ui.stenosisPercentRow.classList.toggle('is-hidden', !showStenosis);
    ui.occlusionLengthRow.classList.toggle('is-hidden', !showOcclusion);
  };

  const collectData = (ui) => {
    const patencyValue = ui.patencySelect.value;
    const patencyLabel = ui.patencySelect.selectedOptions[0]?.textContent || '';
    const calcificationValue = ui.calcificationSelect.value;
    const calcificationLabel = ui.calcificationSelect.selectedOptions[0]?.textContent || '';

    return {
      patency: patencyValue,
      patencyLabel,
      stenosisLength: ui.stenosisLength.input.value,
      stenosisPercent: ui.stenosisPercent.input.value,
      occlusionLength: ui.occlusionLength.input.value,
      calcification: calcificationValue,
      calcificationLabel,
    };
  };

  const attachSegmentUI = (segment) => {
    if (segment.dataset.endoPatencyUi === 'true') {
      return;
    }

    segment.dataset.endoPatencyUi = 'true';
    segment.classList.add('endo-patency-segment');

    const container = createElement('div', 'endo-patency-ui');
    const header = createElement('div', 'endo-patency-header');
    const title = createElement('strong', 'endo-patency-title', 'Patency');

    header.appendChild(title);

    const patencyRow = createElement('div', 'endo-patency-row');
    const patencyLabel = createElement('label', 'endo-patency-label', 'Patency');
    const patencySelect = createSelect(
      [
        { value: 'open', label: 'Open' },
        { value: 'stenosis', label: 'Stenosis' },
        { value: 'occlusion', label: 'Occlusion' },
      ],
      'Select patency'
    );

    patencyRow.appendChild(patencyLabel);
    patencyRow.appendChild(patencySelect);

    const stenosisLengthRow = createElement('div', 'endo-patency-row');
    const stenosisLengthLabel = createElement('label', 'endo-patency-label', 'Stenosis length');
    const stenosisLength = createSlider({ min: 0, max: 50, step: 1, unit: ' cm' });
    stenosisLengthRow.appendChild(stenosisLengthLabel);
    stenosisLengthRow.appendChild(stenosisLength.wrapper);

    const stenosisPercentRow = createElement('div', 'endo-patency-row');
    const stenosisPercentLabel = createElement('label', 'endo-patency-label', 'Stenosis percent');
    const stenosisPercent = createSlider({ min: 0, max: 100, step: 5, unit: '%' });
    stenosisPercentRow.appendChild(stenosisPercentLabel);
    stenosisPercentRow.appendChild(stenosisPercent.wrapper);

    const occlusionLengthRow = createElement('div', 'endo-patency-row');
    const occlusionLengthLabel = createElement('label', 'endo-patency-label', 'Occlusion length');
    const occlusionLength = createSlider({ min: 0, max: 50, step: 1, unit: ' cm' });
    occlusionLengthRow.appendChild(occlusionLengthLabel);
    occlusionLengthRow.appendChild(occlusionLength.wrapper);

    const calcificationRow = createElement('div', 'endo-patency-row');
    const calcificationLabel = createElement('label', 'endo-patency-label', 'Calcification');
    const calcificationSelect = createSelect(
      [
        { value: 'none', label: 'None' },
        { value: 'mild', label: 'Mild' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'severe', label: 'Severe' },
      ],
      'Select calcification'
    );
    calcificationRow.appendChild(calcificationLabel);
    calcificationRow.appendChild(calcificationSelect);

    const helper = createElement('div', 'endo-patency-helper', 'Use Clear to reset all inputs for this segment.');
    const summary = createElement('div', 'endo-patency-summary', 'Summary: No patency selected.');

    const clearButton = createElement('button', 'endo-patency-clear', 'Clear');
    clearButton.type = 'button';

    const ui = {
      patencySelect,
      stenosisLength,
      stenosisPercent,
      occlusionLength,
      calcificationSelect,
      stenosisLengthRow,
      stenosisPercentRow,
      occlusionLengthRow,
      summary,
    };

    const updateState = () => {
      updateVisibility(ui);
      const data = collectData(ui);
      ui.summary.textContent = buildSummary(data);
      saveSegment(segment, data);
    };

    const handleInteraction = (eventName) => {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[EndoPlanner v2] Patency UI change', {
          eventName,
          segment: segment.dataset.key || segment.id || 'unknown',
        });
      }
      updateState();
    };

    [patencySelect, calcificationSelect, stenosisLength.input, stenosisPercent.input, occlusionLength.input].forEach(
      (input) => {
        input.addEventListener('change', () => handleInteraction('change'));
        input.addEventListener('input', () => handleInteraction('input'));
      }
    );

    clearButton.addEventListener('click', () => {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[EndoPlanner v2] Patency UI clear', {
          segment: segment.dataset.key || segment.id || 'unknown',
        });
      }
      patencySelect.selectedIndex = 0;
      calcificationSelect.selectedIndex = 0;
      stenosisLength.input.value = 0;
      stenosisPercent.input.value = 0;
      occlusionLength.input.value = 0;
      stenosisLength.output.textContent = '0 cm';
      stenosisPercent.output.textContent = '0%';
      occlusionLength.output.textContent = '0 cm';
      updateState();
    });

    container.appendChild(header);
    container.appendChild(patencyRow);
    container.appendChild(stenosisLengthRow);
    container.appendChild(stenosisPercentRow);
    container.appendChild(occlusionLengthRow);
    container.appendChild(calcificationRow);
    container.appendChild(clearButton);
    container.appendChild(helper);
    container.appendChild(summary);

    segment.appendChild(container);

    const saved = loadSegment(segment);
    hydrateValues(segment, ui, saved);
    updateState();
  };

  const initSegments = (root) => {
    const segments = Array.from((root || document).querySelectorAll('.arterial_segment'));
    segments.forEach((segment) => attachSegmentUI(segment));
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.classList.contains('arterial_segment')) {
          attachSegmentUI(node);
          return;
        }
        if (node.querySelectorAll) {
          initSegments(node);
        }
      });
    });
  });

  const start = () => {
    initSegments(document);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
