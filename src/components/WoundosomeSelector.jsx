import React from 'react';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import {
  getWoundosomeAdvice,
  WOUNDOSOME_REFERENCE,
  WOUND_ZONES,
} from '../data/woundosome';

const ZONE_SHAPES = {
  'dorsal-toes': (
    <path d="M76 64 C82 48 92 38 104 34 C116 30 134 32 150 39 C167 46 179 56 184 68 C177 82 167 94 157 105 L83 104 C78 91 75 77 76 64 Z" />
  ),
  'hallux-first-ray': (
    <path d="M40 67 C30 79 31 97 39 112 C50 132 57 153 61 176 L91 169 C88 144 86 121 84 101 C82 82 76 67 66 62 C56 57 47 60 40 67 Z" />
  ),
  dorsum: <path d="M83 105 C105 99 135 99 157 105 C151 131 153 155 160 181 L151 220 C130 231 99 231 73 218 L61 176 C68 149 75 126 83 105 Z" />,
  'lateral-ankle': <path d="M151 219 C160 204 164 188 160 180 C173 194 174 219 165 240 C158 255 146 266 133 272 L123 245 Z" />,
  'plantar-toes': <path d="M255 64 C261 48 271 38 283 34 C295 30 313 32 329 39 C346 46 358 56 363 68 C356 83 346 94 336 105 L262 104 C257 91 254 77 255 64 Z" />,
  'medial-plantar': <path d="M219 68 C208 82 211 101 221 119 C231 138 238 160 239 187 C240 204 246 220 258 232 L290 215 C279 190 278 163 284 137 L263 104 C260 84 254 68 245 63 C235 57 225 60 219 68 Z" />,
  'lateral-plantar': <path d="M263 104 C286 99 315 99 336 105 C329 134 331 158 339 183 C344 200 342 219 334 234 L290 215 C279 190 278 163 284 137 Z" />,
  'medial-heel': <path d="M258 232 C266 222 278 216 290 215 L307 220 L306 274 C286 278 269 266 258 249 Z" />,
  'lateral-heel': <path d="M307 220 L334 234 C337 250 328 268 306 274 Z" />,
};

const zoneClassName = (selected) => `wound-zone${selected ? ' is-selected' : ''}`;

export default function WoundosomeSelector({ value = [], onChange }) {
  const selected = new Set(value);
  const advice = getWoundosomeAdvice(value);

  const toggle = (id) => {
    const next = selected.has(id)
      ? value.filter((zoneId) => zoneId !== id)
      : [...value, id];
    onChange(next);
  };

  const onKeyDown = (event, id) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle(id);
  };

  return (
    <section className="woundosome-selector" data-testid="woundosome-selector">
      <div className="woundosome-heading">
        <div>
          <h2 className="section-title">{__('Wound location (woundosome)', 'endoplanner')}</h2>
          <p className="section-subtitle">
            {__('Select every ulcer or gangrene location. The suggested TAP aims for direct wound-bed perfusion and does not replace angiographic assessment of pedal branches, arch and collaterals.', 'endoplanner')}
          </p>
        </div>
        {value.length > 0 && (
          <button type="button" className="woundosome-clear" onClick={() => onChange([])}>
            {__('Clear', 'endoplanner')}
          </button>
        )}
      </div>

      <div className="woundosome-layout">
        <svg
          className="woundosome-map"
          viewBox="0 0 405 300"
          role="group"
          aria-label={__('Anatomical dorsal and plantar wound location map', 'endoplanner')}
        >
          <defs>
            <linearGradient id="woundosome-foot-skin" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fffaf3" />
              <stop offset="1" stopColor="#eadfd2" />
            </linearGradient>
          </defs>

          <text x="105" y="295" textAnchor="middle">{__('Dorsal', 'endoplanner')}</text>
          <text x="284" y="295" textAnchor="middle">{__('Plantar', 'endoplanner')}</text>

          <g className="foot-anatomy" aria-hidden="true">
            <path className="foot-outline" d="M73 269 C52 258 42 236 44 212 C46 189 53 171 48 150 C45 135 36 121 32 106 C28 91 31 77 41 69 C48 63 57 61 66 64 C61 55 62 45 68 38 C75 30 85 30 92 37 C90 27 96 18 105 15 C116 12 126 20 127 31 C129 22 137 17 146 19 C157 21 163 31 160 42 C166 35 175 34 183 40 C192 47 193 59 187 68 C178 81 166 91 160 105 C150 129 153 154 161 180 C171 213 163 244 142 264 C123 281 94 283 73 269 Z" />
            <path className="foot-outline" d="M252 269 C231 258 221 236 223 212 C225 189 232 171 227 150 C224 135 215 121 211 106 C207 91 210 77 220 69 C227 63 236 61 245 64 C240 55 241 45 247 38 C254 30 264 30 271 37 C269 27 275 18 284 15 C295 12 305 20 306 31 C308 22 316 17 325 19 C336 21 342 31 339 42 C345 35 354 34 362 40 C371 47 372 59 366 68 C357 81 345 91 339 105 C329 129 332 154 340 180 C350 213 342 244 321 264 C302 281 273 283 252 269 Z" />

            <path className="toe-crease" d="M68 66 C73 72 77 80 78 89 M93 39 C99 47 102 55 102 65 M127 32 C132 42 133 51 131 61 M160 43 C164 51 165 60 162 68" />
            <path className="dorsal-landmark" d="M83 105 C100 126 104 154 103 194 M111 102 C121 128 123 156 121 198 M139 103 C140 128 144 151 151 178 M65 224 C89 236 123 239 151 222" />
            <path className="toe-crease" d="M247 66 C252 72 256 80 257 89 M272 39 C278 47 281 55 281 65 M306 32 C311 42 312 51 310 61 M339 43 C343 51 344 60 341 68" />
            <path className="plantar-landmark" d="M263 108 C284 119 316 119 337 107 M247 178 C258 164 268 152 284 138 M258 232 C278 244 312 246 334 234" />
            <ellipse className="heel-pad" cx="299" cy="247" rx="29" ry="25" />
            <path className="ankle-crease" d="M56 244 C78 253 110 256 139 244 M235 244 C257 253 289 256 318 244" />
          </g>
          {WOUND_ZONES.map((zone) => (
            <g
              key={zone.id}
              role="checkbox"
              aria-label={zone.label}
              aria-checked={selected.has(zone.id)}
              tabIndex="0"
              className={zoneClassName(selected.has(zone.id))}
              onClick={() => toggle(zone.id)}
              onKeyDown={(event) => onKeyDown(event, zone.id)}
            >
              {ZONE_SHAPES[zone.id]}
              <title>{zone.label}</title>
            </g>
          ))}
        </svg>

        <div className="woundosome-zone-list" aria-label={__('Wound locations', 'endoplanner')}>
          {WOUND_ZONES.map((zone) => (
            <button
              type="button"
              key={zone.id}
              className={selected.has(zone.id) ? 'is-selected' : ''}
              aria-pressed={selected.has(zone.id)}
              onClick={() => toggle(zone.id)}
            >
              <span className={`wound-zone-dot wound-zone-dot--${zone.view}`} aria-hidden="true" />
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      <div className="woundosome-advice" aria-live="polite">
        {advice.zones.length ? (
          <>
            <strong>{__('TAP revascularization to consider', 'endoplanner')}</strong>
            <p>{advice.primaryLabels.join(' + ')}</p>
            <ul>
              {advice.routes.map((route) => <li key={route}>{route}</li>)}
            </ul>
            {advice.alternativeLabels.length > 0 && (
              <p>
                <b>{__('Collateral/alternative route to assess', 'endoplanner')}:</b>{' '}
                {advice.alternativeLabels.join(' + ')}
              </p>
            )}
            <p className="woundosome-caution">
              {__('Confirm the true feeding artery with AP and lateral foot angiography. A patent pedal arch or robust collaterals may make indirect revascularization effective; multi-zone wounds may require more than one inflow route.', 'endoplanner')}
            </p>
          </>
        ) : (
          <p>{__('Select at least one wound location to generate a TAP consideration.', 'endoplanner')}</p>
        )}
        <a href={WOUNDOSOME_REFERENCE.url} target="_blank" rel="noreferrer">
          {WOUNDOSOME_REFERENCE.label}
        </a>
      </div>
    </section>
  );
}

WoundosomeSelector.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};
