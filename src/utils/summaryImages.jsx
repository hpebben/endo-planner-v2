import React from 'react';
import { createRoot } from 'react-dom/client';
import DiseaseAnatomySummary from '../components/DiseaseAnatomySummary';
import SelectedWoundosomeSummary from '../components/SelectedWoundosomeSummary';
import { getActiveWoundLocations } from './clinicalStage';

const svgStyleProperties = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'filter',
  'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
  'stop-color', 'stop-opacity', 'clip-path', 'color',
];
const localFragment = (value) => value.replace(/url\(["']?[^)#]*#([^)'"\s]+)["']?\)/g, 'url(#$1)');

// Resolve the same SVG styles used on screen, including wound colors and
// lesion clipping. No patient images or network resources are needed.
const rasterizeSvg = async (svg) => {
  const clone = svg.cloneNode(true);
  const originals = [svg, ...svg.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  originals.forEach((node, index) => {
    const computed = window.getComputedStyle(node);
    copies[index].removeAttribute('class');
    copies[index].removeAttribute('style');
    svgStyleProperties.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (value) copies[index].style.setProperty(property, localFragment(value));
    });
  });
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width || svg.clientWidth;
  const height = viewBox.height || svg.clientHeight;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(1.5, 1400 / height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { data: canvas.toDataURL('image/png'), ratio: width / height };
  } finally {
    URL.revokeObjectURL(url);
  }
};

export default async function renderSummaryImages(data) {
  const host = document.createElement('div');
  host.className = 'endo-wizard pdf-visual-export';
  host.setAttribute('aria-hidden', 'true');
  host.inert = true;
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:900px;opacity:0;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await new Promise((resolve) => {
      root.render(<div ref={(node) => { if (node) requestAnimationFrame(resolve); }}>
        <DiseaseAnatomySummary data={data} />
        <SelectedWoundosomeSummary selectedIds={getActiveWoundLocations(data)} targetPath={data.targetArterialPath || []} imagesOnly />
      </div>);
    });
    const disease = host.querySelector('.summary-disease-visual svg');
    const woundSvgs = [...host.querySelectorAll('.selected-woundosome-views svg')];
    return {
      disease: disease ? [{ ...(await rasterizeSvg(disease)), label: 'Disease anatomy' }] : [],
      wounds: await Promise.all(woundSvgs.map(async (svg, index) => ({ ...(await rasterizeSvg(svg)), label: index ? 'Lateral oblique' : 'AP (dorsoplantar)' }))),
    };
  } finally {
    root.unmount();
    host.remove();
  }
}
