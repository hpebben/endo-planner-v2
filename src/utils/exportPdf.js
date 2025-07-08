import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import computePrognosis from './prognosis';
import computeGlass from './glass';
import { references } from './references';
import { vesselSegments } from '../components/steps/Step2_Patency';

// ---------------------------------------------------------------------------
// Template markup used for PDF generation
// ---------------------------------------------------------------------------
export const pdfTemplate = `
<template id="pdf-template">
  <style>
    /* ---------- Global ---------- */
    body           { font-family: 'Inter', sans-serif; color:#000; margin:0; }
    h1             { font-size:22px; margin:0 0 16px 0; }
    h2             { font-size:16px; margin:0 0 8px 0; }
    .spacer-30     { margin-top:30px; }

    /* ---------- Card wrapper ---------- */
    .card          { width:100%; border:1px solid #e0e0e0; border-radius:12px;
                     box-shadow:0 2px 6px rgba(0,0,0,.08); padding:24px;
                     margin:0 0 32px 0; }
    .card:last-of-type { margin-bottom:0; }

    /* ---------- WIfI & GLASS explainer ---------- */
    .explainer     { font-size:11px; line-height:1.35; color:#555; }

    /* ---------- Bullets for vessels ---------- */
    .vessel-bullet { display:inline-block; width:6px; height:6px;
                     background:#0a66ff; border-radius:50%;
                     margin-right:6px; }

    /* ---------- Intervention-plan grid ---------- */
    .ip-section        { margin:0 0 24px 0; }
    .ip-section-title  { color:#0a66ff; font-weight:700; font-size:14px;
                         margin:0 0 8px 0; }
    .ip-table          { width:100%; border-collapse:collapse; }
    .ip-table td:first-child { width:110px; font-weight:700; }
    .ip-table td       { padding:2px 0; }

    /* Hide the hyperlinks themselves, keep superscripts intact */
    a.supref           { text-decoration:none; color:#0a66ff; }
  </style>

  <!-- ───────────── Clinical indication ───────────── -->
  <section class="card">
    <h1>Clinical indication</h1>
    <div>Fontaine stage: {{fontaine}}</div>
    <div>WIfI: <strong>{{wifiString}}</strong></div>

    <div class="spacer-30 explainer">{{wifiExplainer}}<sup><a
      class="supref" href="{{wifiRefUrl}}">1</a></sup></div>
  </section>

  <!-- ───────────── Disease anatomy ───────────── -->
  <section class="card">
    <h1>Disease Anatomy</h1>

    {{#each vessels}}
      <div><span class="vessel-bullet"></span>
           <strong>{{name}}</strong> {{desc}}</div>
    {{/each}}

    <div class="spacer-30">GLASS stage {{glassStage}}</div>
    <div class="explainer">
      GLASS stage {{glassStage}} predicts a technical failure rate of
      {{glassTF}} % and a one-year limb-based patency of
      {{glassLBP}} %.<sup><a class="supref" href="{{glassRefUrl}}">2</a></sup>
    </div>
  </section>

  <!-- ───────────── Intervention plan ───────────── -->
  <section class="card">
    <h1>Intervention plan</h1>

    <!-- ACCESS -->
    <article class="ip-section">
      <div class="ip-section-title">ACCESS</div>
      <table class="ip-table">
        <tr><td>APPROACH</td><td>{{access.approach}}</td></tr>
        <tr><td>NEEDLE(S)</td><td>{{access.needles}}</td></tr>
        <tr><td>SHEATH(S)</td><td>{{access.sheaths}}</td></tr>
      </table>
    </article>

    <!-- NAVIGATION & CROSSING -->
    <article class="ip-section">
      <div class="ip-section-title">NAVIGATION &amp; CROSSING</div>
      <table class="ip-table">
        <tr><td>WIRE</td><td>{{nav.wire}}</td></tr>
      </table>
    </article>

    <!-- VESSEL PREPARATION & THERAPY -->
    <article class="ip-section">
      <div class="ip-section-title">VESSEL PREPARATION &amp; THERAPY</div>
      <table class="ip-table">
        <tr><td>BALLOON</td><td>{{therapy.balloon}}</td></tr>
        <tr><td>STENT</td><td>{{therapy.stent}}</td></tr>
      </table>
    </article>

    <!-- CLOSURE -->
    <article class="ip-section">
      <div class="ip-section-title">CLOSURE</div>
      <table class="ip-table">
        <tr><td>CLOSURE</td><td>{{closure.type}}</td></tr>
      </table>
    </article>
  </section>
</template>`;

// ---------------------------------------------------------------------------
// Populate the above template with data values
// ---------------------------------------------------------------------------
export function populateTemplate(data = {}) {
  let html = pdfTemplate;
  const loopRe = /{{#each\s+vessels}}([\s\S]*?){{\/each}}/;
  const loopMatch = html.match(loopRe);
  if (loopMatch) {
    const block = loopMatch[1];
    const vesselHtml = (data.vessels || [])
      .map((v) =>
        block
          .replace(/{{name}}/g, v.name || '')
          .replace(/{{desc}}/g, v.desc || '')
      )
      .join('');
    html = html.replace(loopMatch[0], vesselHtml);
  }
  const map = {
    '{{fontaine}}': data.fontaine || '',
    '{{wifiString}}': data.wifiString || '',
    '{{wifiExplainer}}': data.wifiExplainer || '',
    '{{wifiRefUrl}}': data.wifiRefUrl || '#',
    '{{glassStage}}': data.glassStage || '',
    '{{glassTF}}': data.glassTF || '',
    '{{glassLBP}}': data.glassLBP || '',
    '{{glassRefUrl}}': data.glassRefUrl || '#',
    '{{access.approach}}': data.access?.approach || '',
    '{{access.needles}}': data.access?.needles || '',
    '{{access.sheaths}}': data.access?.sheaths || '',
    '{{nav.wire}}': data.nav?.wire || '',
    '{{therapy.balloon}}': data.therapy?.balloon || '',
    '{{therapy.stent}}': data.therapy?.stent || '',
    '{{closure.type}}': data.closure?.type || '',
  };
  Object.entries(map).forEach(([key, val]) => {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    html = html.replace(regex, val);
  });
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.querySelector('template').content.cloneNode(true);
}

// ---------------------------------------------------------------------------
// Export PDF using html2pdf
// ---------------------------------------------------------------------------
export async function exportCaseSummary() {
  const stored = localStorage.getItem('endoplannerState');
  if (!stored) return;
  let data = {};
  try {
    data = JSON.parse(stored).data || {};
  } catch (e) {
    return;
  }

  const formatStage = (val) => {
    if (!val) return '—';
    const map = { i: 'I', iia: 'IIa', iib: 'IIb', iii: 'III', iv: 'IV' };
    return map[val.toLowerCase()] || val;
  };
  const summarize = (obj) =>
    obj && typeof obj === 'object' ? Object.values(obj).filter(Boolean).join(' ') : '';
  const summarizeList = (arr) =>
    Array.isArray(arr) ? arr.map(summarize).filter(Boolean).join('; ') : '';
  const formatTherapy = (obj) => {
    if (!obj || typeof obj !== 'object') return '';
    if (obj.diameter && obj.length) return `${obj.diameter} \u00D7 ${obj.length} mm`;
    return summarize(obj);
  };

  const prog = computePrognosis(data);
  const glass = computeGlass(data.patencySegments);
  const wifiString = `W${prog.wound}I${prog.ischemia}fI${prog.infection} (WIfI Stage ${prog.wifiStage})`;
  const riskInfoMap = {
    0: { cat: 'Very Low', amp: [1, 3], mort: [5, 10] },
    1: { cat: 'Low', amp: [5, 10], mort: [10, 15] },
    2: { cat: 'Moderate', amp: [15, 25], mort: [15, 30] },
    3: { cat: 'Very High', amp: [30, 55], mort: [25, 40] },
  };
  const riskInfo = riskInfoMap[prog.wifiStage] || {};
  const wifiExplainer = `WIfI stage ${prog.wifiStage} predicts a ${riskInfo.cat?.toLowerCase()} risk of 1-year major amputation (${riskInfo.amp?.[0]}–${riskInfo.amp?.[1]}%) and mortality (${riskInfo.mort?.[0]}–${riskInfo.mort?.[1]}%).`;

  const lengthMap = { '<3': '<3cm', '3-10': '3–10cm', '10-15': '10–15cm', '15-20': '15–20cm', '>20': '>20cm' };
  const vesselName = (id) =>
    vesselSegments.find((s) => s.id === id)?.name ||
    id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const vessels = Object.entries(data.patencySegments || {}).map(([id, vals]) => {
    const name = vesselName(id);
    const lengthLabel = lengthMap[vals.length] || vals.length || '';
    const calcLabel = vals.calcium ? `calcium: ${vals.calcium}` : '';
    const desc = [vals.type, lengthLabel, calcLabel].filter(Boolean).join(', ');
    return { name, desc };
  });

  const accessRows = data.accessRows || [];
  const navRows = data.navRows || [];
  const therapyRows = data.therapyRows || [];
  const closureRows = data.closureRows || [];

  const access = {
    approach: accessRows[0]
      ? `${accessRows[0].approach || ''} ${accessRows[0].side || ''} ${accessRows[0].vessel || ''}`.trim()
      : '',
    needles: accessRows.flatMap((r) => r.needles || []).map(summarize).filter(Boolean).join('; '),
    sheaths: accessRows.flatMap((r) => r.sheaths || []).map(summarize).filter(Boolean).join('; '),
  };
  const nav = {
    wire: navRows.map((r) => summarize(r.wire)).filter(Boolean).join('; '),
  };
  const therapy = {
    balloon: therapyRows.map((r) => formatTherapy(r.balloon)).filter(Boolean).join('; '),
    stent: therapyRows.map((r) => formatTherapy(r.stent)).filter(Boolean).join('; '),
  };
  const closure = {
    type: closureRows
      .map((r) => `${r.method || ''}${r.device ? ' ' + r.device : ''}`.trim())
      .filter(Boolean)
      .join('; '),
  };

  const fragment = populateTemplate({
    fontaine: formatStage(data.stage),
    wifiString,
    wifiExplainer,
    wifiRefUrl: references.find((r) => r.number === 1)?.pubmed || '#',
    vessels,
    glassStage: glass.stage,
    glassTF: glass.failureRange.join('–'),
    glassLBP: glass.patencyRange.join('–'),
    glassRefUrl: references.find((r) => r.number === 2)?.pubmed || '#',
    access,
    nav,
    therapy,
    closure,
  });

  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '100%';
  frame.style.width = frame.style.height = '0';
  document.body.appendChild(frame);

  frame.contentDocument.body.appendChild(fragment);

  if (!frame.contentDocument.fonts.check('12px Inter')) {
    const link = frame.contentDocument.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.gstatic.com';
    frame.contentDocument.head.appendChild(link);
  }

  await frame.contentDocument.fonts.ready;
  await Promise.all(Array.from(frame.contentDocument.images).map((img) => img.decode()));

  const opt = {
    margin: [25, 15],
    filename: 'CaseSummary.pdf',
    html2canvas: { background: '#ffffff', useCORS: true, scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  await html2pdf().set(opt).from(frame.contentDocument.body.firstElementChild).save();
  document.body.removeChild(frame);
}

export default exportCaseSummary;
