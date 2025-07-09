export default async function exportCaseSummaryToPDF() {
  const summary = document.querySelector('.case-summary');
  if (!summary) {
    alert('Case Summary not found');
    return;
  }

  await document.fonts.ready;

  const clone = summary.cloneNode(true);

  clone.querySelectorAll('script').forEach(s => s.remove());

  const PROPS = [
    'font-family','font-size','font-weight','font-style','color',
    'background','background-color','background-image','background-size','background-position','background-repeat',
    'text-align','display',
    'grid-template-columns','grid-template-rows','grid-column','grid-row','grid-gap','grid-auto-flow',
    'flex','flex-direction','flex-basis','flex-grow','flex-shrink','justify-content','align-items',
    'margin','margin-top','margin-right','margin-bottom','margin-left',
    'padding','padding-top','padding-right','padding-bottom','padding-left',
    'border','border-top','border-right','border-bottom','border-left','border-color','border-width','border-style',
    'box-shadow','width','height'
  ];

  const inline = el => {
    const style = getComputedStyle(el);
    PROPS.forEach(prop => {
      const val = style.getPropertyValue(prop);
      if (val) el.style.setProperty(prop, val);
    });
  };

  inline(clone);
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    inline(node);
    node = walker.nextNode();
  }

  const linkHrefs = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href);
  const cssText = await Promise.all(
    linkHrefs.map(href => fetch(href).then(r => r.text()).catch(() => ''))
  );
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText.join('\n');
  clone.prepend(styleTag);

  document.body.appendChild(clone);

  const { default: html2pdf } = await import('html2pdf.js');
  await html2pdf()
    .set({
      filename : `CaseSummary-${Date.now()}.pdf`,
      margin   : 0,
      pagebreak: { avoid: '.summary-card, .intervention-section', mode: 'avoid-all' },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF       : { unit: 'pt', format: 'a4', orientation: 'portrait' }
    })
    .from(clone)
    .save();

  clone.remove();
}

