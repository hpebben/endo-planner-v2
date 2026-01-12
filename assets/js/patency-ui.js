(function () {
  if (window.__ENDO_PATENCY_UI_BOOTED__) {
    return;
  }
  window.__ENDO_PATENCY_UI_BOOTED__ = true;

  const buildInfo = window.EndoPlannerV2Build || {};
  const pluginVersion = buildInfo.version || 'unknown';
  const gitHash = buildInfo.git || 'unknown';

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

  const dispatchFieldEvent = (field, type) => {
    field.dispatchEvent(new Event(type, { bubbles: true }));
  };

  const setFieldValue = (field, value, triggerInput = true, triggerChange = true) => {
    field.value = value;
    if (triggerInput) {
      dispatchFieldEvent(field, 'input');
    }
    if (triggerChange) {
      dispatchFieldEvent(field, 'change');
    }
  };

  const createHiddenSelect = (className, placeholder, options) => {
    const select = document.createElement('select');
    select.className = `${className} endo-patency-hidden`;
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = placeholder;
    placeholderOption.selected = true;
    select.appendChild(placeholderOption);
    options.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    return select;
  };

  const createHiddenInput = (className) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.className = className;
    return input;
  };

  const STORAGE_KEY = 'endoplanner_patency_savedSegments';
  const savedSegments = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  })();

  const persistSavedSegments = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSegments));
    } catch (error) {
      // Ignore storage failures.
    }
  };

  const buildSummary = (data) => {
    if (!data.patency) {
      return 'Summary: No patency selected.';
    }
    const segments = [`Patency: ${data.patency}`];
    if (data.patency === 'stenosis') {
      if (data.stenosisLength) {
        segments.push(`Length ${data.stenosisLength} cm`);
      }
      if (data.percentage) {
        segments.push(`${data.percentage}% stenosis`);
      }
    }
    if (data.patency === 'occlusion' && data.occlusionLength) {
      segments.push(`Length ${data.occlusionLength} cm`);
    }
    if (data.calcification) {
      segments.push(`Calcification: ${data.calcification}`);
    }
    return `Summary: ${segments.join(' | ')}.`;
  };

  const setActiveButton = (group, value) => {
    const buttons = Array.from(group.querySelectorAll('button'));
    buttons.forEach((button) => {
      const isSelected = button.dataset.value === value;
      button.classList.toggle('is-active', isSelected);
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  };

  const createSection = (labelText) => {
    const section = createElement('section', 'endo-section endo-section--patency endo-patency-row');
    const title = createElement('div', 'endo-section-title endo-patency-label endo-title', labelText);
    const body = createElement('div', 'endo-section-body');
    section.appendChild(title);
    section.appendChild(body);
    return { section, title, body };
  };

  const createButtonGroup = (labelText, options) => {
    const section = createSection(labelText);
    const group = createElement('div', 'endo-patency-buttons endo-btn-group');

    options.forEach(({ label: buttonLabel, value }) => {
      const button = createElement('button', 'endo-patency-button endo-btn', buttonLabel);
      button.type = 'button';
      button.dataset.value = value;
      button.setAttribute('aria-pressed', 'false');
      group.appendChild(button);
    });

    section.body.appendChild(group);

    return { row: section.section, group };
  };

  const createSliderRow = ({ labelText, unit, min, max, step }) => {
    const section = createSection(labelText);
    const control = createElement('div', 'endo-field-control endo-slider-control');
    const input = document.createElement('input');
    const output = document.createElement('output');

    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = min;
    input.className = 'endo-patency-slider-input endo-slider';
    output.className = 'endo-patency-slider-output endo-value-badge endo-slider-value';
    output.textContent = `${input.value}${unit}`;

    input.addEventListener('input', () => {
      output.textContent = `${input.value}${unit}`;
    });

    control.appendChild(input);
    control.appendChild(output);
    section.body.appendChild(control);

    return { row: section.section, input, output };
  };

  const normalizePercentageValue = (value) => {
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    const numeric = Number.parseInt(value, 10);
    if (Number.isNaN(numeric)) {
      return '';
    }
    return Math.min(100, Math.max(0, Math.round(numeric / 5) * 5));
  };

  const getCurrentData = (fields) => ({
    patency: fields.patency.value || '',
    stenosisLength: fields.stenosisLength.value || '',
    percentage: fields.percentage.value || '',
    occlusionLength: fields.occlusionLength.value || '',
    calcification: fields.calcification.value || '',
  });

  const areSegmentStatesEqual = (left, right) => {
    if (!left || !right) {
      return false;
    }
    return (
      left.patency === right.patency &&
      left.stenosisLength === right.stenosisLength &&
      left.percentage === right.percentage &&
      left.occlusionLength === right.occlusionLength &&
      left.calcification === right.calcification
    );
  };

  const ensureFields = (segment) => {
    const shouldInject = segment.innerHTML.trim() === '';
    const fragment = document.createDocumentFragment();

    let patency = segment.querySelector('select.patency');
    if (!patency) {
      patency = createHiddenSelect('patency', '', [
        { value: 'Open', label: 'Open' },
        { value: 'stenosis', label: 'stenosis' },
        { value: 'occlusion', label: 'occlusion' },
      ]);
      fragment.appendChild(patency);
    } else {
      patency.classList.add('endo-patency-hidden');
    }

    let stenosisLength = segment.querySelector('input.stenosis_length');
    if (!stenosisLength) {
      stenosisLength = createHiddenInput('stenosis_length');
      fragment.appendChild(stenosisLength);
    }

    let percentage = segment.querySelector('input.percentage');
    if (!percentage) {
      percentage = createHiddenInput('percentage');
      fragment.appendChild(percentage);
    }

    let occlusionLength = segment.querySelector('input.occlusion_length');
    if (!occlusionLength) {
      occlusionLength = createHiddenInput('occlusion_length');
      fragment.appendChild(occlusionLength);
    }

    let calcification = segment.querySelector('select.calcification');
    if (!calcification) {
      calcification = createHiddenSelect('calcification', '', [
        { value: 'none', label: 'none' },
        { value: 'moderate', label: 'moderate' },
        { value: 'heavy', label: 'heavy' },
      ]);
      fragment.appendChild(calcification);
    } else {
      calcification.classList.add('endo-patency-hidden');
    }

    if (shouldInject && fragment.childNodes.length > 0) {
      segment.appendChild(fragment);
    } else if (fragment.childNodes.length > 0) {
      segment.appendChild(fragment);
    }

    return { patency, stenosisLength, percentage, occlusionLength, calcification };
  };

  const attachSegmentUI = (segment) => {
    if (segment.dataset.endoPatencyUi === 'true') {
      return;
    }
    if (!segment.dataset.key) {
      return;
    }

    segment.dataset.endoPatencyUi = 'true';
    segment.classList.add('endo-patency-segment');

    const tooltip = segment.closest('.raven-hotspot__tooltip');
    if (tooltip) {
      tooltip.classList.add('endo-tooltip--patency');
      if (!window.__ENDO_PATENCY_THEME_LOGGED__ && typeof console !== 'undefined' && console.info) {
        console.info('[EndoPlanner v2] Patency tooltip theme enabled');
        window.__ENDO_PATENCY_THEME_LOGGED__ = true;
      }
    }

    const fields = ensureFields(segment);

    const container = createElement('div', 'endo-patency-ui');
    const patencyButtons = createButtonGroup('Patency', [
      { label: 'Open', value: 'Open' },
      { label: 'Stenosis', value: 'stenosis' },
      { label: 'Occlusion', value: 'occlusion' },
    ]);

    const stenosisLength = createSliderRow({
      labelText: 'Length (cm)',
      unit: ' cm',
      min: 0,
      max: 50,
      step: 1,
    });
    const stenosisPercent = createSliderRow({
      labelText: 'Degree of stenosis',
      unit: '%',
      min: 0,
      max: 100,
      step: 5,
    });
    const occlusionLength = createSliderRow({
      labelText: 'Length (cm)',
      unit: ' cm',
      min: 0,
      max: 50,
      step: 1,
    });

    const calcificationButtons = createButtonGroup('Calcification', [
      { label: 'None', value: 'none' },
      { label: 'Moderate', value: 'moderate' },
      { label: 'Heavy', value: 'heavy' },
    ]);

    const summary = createElement('div', 'endo-patency-summary endo-summary', 'Summary: No patency selected.');
    const statusNote = createElement('div', 'endo-patency-status', '');
    const saveButton = createElement('button', 'endo-patency-save endo-save', 'Save');
    saveButton.type = 'button';
    const clearButton = createElement('button', 'endo-patency-clear endo-clear', 'Clear');
    clearButton.type = 'button';
    let saveTimer = null;
    let statusTimer = null;
    let closeTimer = null;

    container.appendChild(patencyButtons.row);
    container.appendChild(stenosisLength.row);
    container.appendChild(stenosisPercent.row);
    container.appendChild(occlusionLength.row);
    container.appendChild(calcificationButtons.row);
    container.appendChild(saveButton);
    container.appendChild(clearButton);
    container.appendChild(statusNote);
    container.appendChild(summary);

    segment.appendChild(container);

    const updateVisibility = () => {
      const patencyValue = fields.patency.value;
      const showStenosis = patencyValue === 'stenosis';
      const showOcclusion = patencyValue === 'occlusion';
      stenosisLength.row.classList.toggle('is-hidden', !showStenosis);
      stenosisPercent.row.classList.toggle('is-hidden', !showStenosis);
      occlusionLength.row.classList.toggle('is-hidden', !showOcclusion);
      calcificationButtons.row.classList.toggle('is-hidden', !(showStenosis || showOcclusion));
    };

    const updateSavedStateNote = () => {
      if (statusNote.classList.contains('is-saved')) {
        return;
      }
      const segmentKey = segment.dataset.key;
      const saved = segmentKey ? savedSegments[segmentKey] : null;
      if (!saved) {
        statusNote.textContent = '';
        statusNote.classList.remove('is-saved', 'is-warning');
        return;
      }
      const current = getCurrentData(fields);
      if (areSegmentStatesEqual(saved, current)) {
        statusNote.textContent = '';
        statusNote.classList.remove('is-saved', 'is-warning');
        return;
      }
      statusNote.textContent = 'Unsaved changes';
      statusNote.classList.add('is-warning');
      statusNote.classList.remove('is-saved');
    };

    const updateSummary = () => {
      const segmentKey = segment.dataset.key;
      const saved = segmentKey ? savedSegments[segmentKey] : null;
      if (saved) {
        summary.textContent = buildSummary(saved);
      } else {
        summary.textContent = buildSummary(getCurrentData(fields));
      }
    };

    const syncFromFields = () => {
      setActiveButton(patencyButtons.group, fields.patency.value);
      setActiveButton(calcificationButtons.group, fields.calcification.value);
      const stenosisLengthValue = fields.stenosisLength.value || 0;
      const normalizedPercent = normalizePercentageValue(fields.percentage.value || 0);
      if (normalizedPercent !== '' && `${fields.percentage.value}` !== `${normalizedPercent}`) {
        setFieldValue(fields.percentage, `${normalizedPercent}`, false, true);
      }
      const stenosisPercentValue = normalizedPercent || 0;
      const occlusionLengthValue = fields.occlusionLength.value || 0;
      stenosisLength.input.value = stenosisLengthValue;
      stenosisLength.output.textContent = `${stenosisLengthValue} cm`;
      stenosisPercent.input.value = stenosisPercentValue;
      stenosisPercent.output.textContent = `${stenosisPercentValue}%`;
      occlusionLength.input.value = occlusionLengthValue;
      occlusionLength.output.textContent = `${occlusionLengthValue} cm`;
      updateVisibility();
      updateSummary();
      updateSavedStateNote();
    };

    const handleFieldChange = () => {
      updateVisibility();
      updateSummary();
      updateSavedStateNote();
    };

    [fields.patency, fields.stenosisLength, fields.percentage, fields.occlusionLength, fields.calcification].forEach(
      (field) => {
        field.addEventListener('input', handleFieldChange);
        field.addEventListener('change', handleFieldChange);
      }
    );

    patencyButtons.group.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }
      const value = button.dataset.value || '';
      setFieldValue(fields.patency, value);
      if (value === 'stenosis') {
        setFieldValue(fields.occlusionLength, '');
      } else if (value === 'occlusion') {
        setFieldValue(fields.stenosisLength, '');
        setFieldValue(fields.percentage, '');
      } else {
        setFieldValue(fields.stenosisLength, '');
        setFieldValue(fields.percentage, '');
        setFieldValue(fields.occlusionLength, '');
        setFieldValue(fields.calcification, '');
      }
      syncFromFields();
    });

    calcificationButtons.group.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) {
        return;
      }
      const value = button.dataset.value || '';
      setFieldValue(fields.calcification, value);
      syncFromFields();
    });

    const wireSlider = (slider, targetField, unit, normalizeValue) => {
      slider.input.addEventListener('input', () => {
        const rawValue = normalizeValue ? normalizeValue(slider.input.value) : slider.input.value;
        slider.output.textContent = `${rawValue}${unit}`;
        setFieldValue(targetField, `${rawValue}`, true, false);
      });
      slider.input.addEventListener('change', () => {
        const rawValue = normalizeValue ? normalizeValue(slider.input.value) : slider.input.value;
        setFieldValue(targetField, `${rawValue}`, false, true);
      });
    };

    wireSlider(stenosisLength, fields.stenosisLength, ' cm');
    wireSlider(stenosisPercent, fields.percentage, '%', normalizePercentageValue);
    wireSlider(occlusionLength, fields.occlusionLength, ' cm');

    clearButton.addEventListener('click', () => {
      setFieldValue(fields.patency, '');
      setFieldValue(fields.stenosisLength, '');
      setFieldValue(fields.percentage, '');
      setFieldValue(fields.occlusionLength, '');
      setFieldValue(fields.calcification, '');
      const segmentKey = segment.dataset.key;
      if (segmentKey && savedSegments[segmentKey]) {
        delete savedSegments[segmentKey];
        persistSavedSegments();
      }
      syncFromFields();
    });

    saveButton.addEventListener('click', () => {
      const segmentKey = segment.dataset.key;
      if (!segmentKey) {
        return;
      }
      const currentData = getCurrentData(fields);
      currentData.percentage = `${normalizePercentageValue(currentData.percentage)}`.trim();
      savedSegments[segmentKey] = currentData;
      persistSavedSegments();
      if (statusTimer) {
        window.clearTimeout(statusTimer);
      }
      statusNote.textContent = 'Saved';
      statusNote.classList.add('is-saved');
      statusNote.classList.remove('is-warning');
      if (saveTimer) {
        window.clearTimeout(saveTimer);
      }
      const originalText = saveButton.textContent;
      saveButton.textContent = 'Saved';
      saveButton.classList.add('is-saved');
      saveTimer = window.setTimeout(() => {
        saveButton.textContent = originalText;
        saveButton.classList.remove('is-saved');
      }, 1500);
      statusTimer = window.setTimeout(() => {
        statusNote.textContent = '';
        statusNote.classList.remove('is-saved');
      }, 1200);
      updateSummary();
      updateSavedStateNote();
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
      closeTimer = window.setTimeout(() => {
        const hotspot = segment.closest('.raven-hotspot');
        if (hotspot && typeof hotspot.click === 'function') {
          hotspot.click();
        }
      }, 800);
    });

    syncFromFields();

    if (typeof console !== 'undefined' && console.info) {
      console.info(
        `[EndoPlanner v2] Patency UI init segment=${segment.dataset.key} | v${pluginVersion} | git ${gitHash}.`
      );
    }
  };

  const initSegments = (root) => {
    const segments = Array.from((root || document).querySelectorAll('.arterial_segment[data-key]'));
    segments.forEach((segment) => attachSegmentUI(segment));
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (node.matches && node.matches('.arterial_segment[data-key]')) {
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
