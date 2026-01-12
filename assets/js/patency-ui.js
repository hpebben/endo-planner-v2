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

  const buildSummary = (fields) => {
    if (!fields.patency.value) {
      return 'Summary: No patency selected.';
    }
    const segments = [`Patency: ${fields.patency.value}`];
    if (fields.patency.value === 'stenosis') {
      if (fields.stenosisLength.value) {
        segments.push(`Length ${fields.stenosisLength.value} cm`);
      }
      if (fields.percentage.value) {
        segments.push(`${fields.percentage.value}% stenosis`);
      }
    }
    if (fields.patency.value === 'occlusion' && fields.occlusionLength.value) {
      segments.push(`Length ${fields.occlusionLength.value} cm`);
    }
    if (fields.calcification.value) {
      segments.push(`Calcification: ${fields.calcification.value}`);
    }
    return `Summary: ${segments.join(' | ')}.`;
  };

  const setActiveButton = (group, value) => {
    const buttons = Array.from(group.querySelectorAll('button'));
    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.value === value);
    });
  };

  const createButtonGroup = (labelText, options) => {
    const row = createElement('div', 'endo-patency-row');
    const label = createElement('div', 'endo-patency-label', labelText);
    const group = createElement('div', 'endo-patency-buttons');

    options.forEach(({ label: buttonLabel, value }) => {
      const button = createElement('button', 'endo-patency-button', buttonLabel);
      button.type = 'button';
      button.dataset.value = value;
      group.appendChild(button);
    });

    row.appendChild(label);
    row.appendChild(group);

    return { row, group };
  };

  const createSliderRow = ({ labelText, unit, min, max, step }) => {
    const row = createElement('div', 'endo-patency-row');
    const label = createElement('div', 'endo-patency-label', labelText);
    const sliderWrap = createElement('div', 'endo-patency-slider');
    const input = document.createElement('input');
    const output = document.createElement('output');

    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = min;
    input.className = 'endo-patency-slider-input';
    output.className = 'endo-patency-slider-output';
    output.textContent = `${input.value}${unit}`;

    input.addEventListener('input', () => {
      output.textContent = `${input.value}${unit}`;
    });

    sliderWrap.appendChild(input);
    sliderWrap.appendChild(output);

    row.appendChild(label);
    row.appendChild(sliderWrap);

    return { row, input, output };
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
      labelText: 'Percent (%)',
      unit: '%',
      min: 0,
      max: 100,
      step: 1,
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

    const summary = createElement('div', 'endo-patency-summary', 'Summary: No patency selected.');
    const clearButton = createElement('button', 'endo-patency-clear', 'Clear');
    clearButton.type = 'button';

    container.appendChild(patencyButtons.row);
    container.appendChild(stenosisLength.row);
    container.appendChild(stenosisPercent.row);
    container.appendChild(occlusionLength.row);
    container.appendChild(calcificationButtons.row);
    container.appendChild(clearButton);
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

    const syncFromFields = () => {
      setActiveButton(patencyButtons.group, fields.patency.value);
      setActiveButton(calcificationButtons.group, fields.calcification.value);
      const stenosisLengthValue = fields.stenosisLength.value || 0;
      const stenosisPercentValue = fields.percentage.value || 0;
      const occlusionLengthValue = fields.occlusionLength.value || 0;
      stenosisLength.input.value = stenosisLengthValue;
      stenosisLength.output.textContent = `${stenosisLengthValue} cm`;
      stenosisPercent.input.value = stenosisPercentValue;
      stenosisPercent.output.textContent = `${stenosisPercentValue}%`;
      occlusionLength.input.value = occlusionLengthValue;
      occlusionLength.output.textContent = `${occlusionLengthValue} cm`;
      updateVisibility();
      summary.textContent = buildSummary(fields);
    };

    const handleFieldChange = () => {
      updateVisibility();
      summary.textContent = buildSummary(fields);
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

    const wireSlider = (slider, targetField, unit) => {
      slider.input.addEventListener('input', () => {
        slider.output.textContent = `${slider.input.value}${unit}`;
        setFieldValue(targetField, slider.input.value, true, false);
      });
      slider.input.addEventListener('change', () => {
        setFieldValue(targetField, slider.input.value, false, true);
      });
    };

    wireSlider(stenosisLength, fields.stenosisLength, ' cm');
    wireSlider(stenosisPercent, fields.percentage, '%');
    wireSlider(occlusionLength, fields.occlusionLength, ' cm');

    clearButton.addEventListener('click', () => {
      setFieldValue(fields.patency, '');
      setFieldValue(fields.stenosisLength, '');
      setFieldValue(fields.percentage, '');
      setFieldValue(fields.occlusionLength, '');
      setFieldValue(fields.calcification, '');
      syncFromFields();
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
