"""Refresh planning facts from the European EVT Device Guide.

Only explicitly enumerated sizes become chips. Published ranges remain bounds
for manual entry; conditional specifications remain visible with each product.
Rows stay grouped so dimensions from different source rows are not crossed.
"""
import argparse
from copy import deepcopy
from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import urlopen

BASE = 'https://evtoday.com/device-guide/european/'
ROOT = Path(__file__).resolve().parents[1]


class GuideTable(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows, self.row, self.cell = [], None, None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self.row = []
        if tag in ('td', 'th') and self.row is not None:
            self.cell = []
        if tag == 'br' and self.cell is not None:
            self.cell.append('; ')

    def handle_data(self, text):
        if self.cell is not None:
            self.cell.append(text)

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        if tag == 'tr' and self.row is not None:
            if self.row:
                self.rows.append(self.row)
            self.row = None


def number(value):
    return f'{float(value):g}'


def dimension(raw, unit='', scale=1):
    """Do not turn a continuous or unspecified range into invented SKUs."""
    values, ranges = [], []
    for part in re.split(r'[,;]', raw):
        token = re.sub(r'\([^)]*\)', '', part).strip()
        token = re.sub(r'\s*(?:cm|mm|Fr|F)\s*$', '', token).strip()
        match = re.fullmatch(r'(\d+(?:\.\d+)?)\s*[–−-]\s*(\d+(?:\.\d+)?)', token)
        if match:
            low, high = (float(value) * scale for value in match.groups())
            if low <= high:
                ranges.append({'min': low, 'max': high, 'unit': unit})
        elif re.fullmatch(r'\d+(?:\.\d+)?', token):
            values.append(number(float(token) * scale) + (f' {unit}' if unit in ('Fr', 'cm') else ''))
    return sorted(set(values), key=lambda value: float(value.split()[0])), ranges


def platforms(raw):
    return sorted(set(re.findall(r'0\.\d{3}(?!\d)', raw)))


def collect(slug, cache, refresh):
    path = cache / f'{slug}.json'
    if path.exists() and not refresh:
        data = json.loads(path.read_text())
    else:
        parser = GuideTable()
        parser.feed(urlopen(BASE + slug, timeout=30).read().decode())
        data = {'url': BASE + slug, 'rows': parser.rows}
        cache.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2))
    headers, *rows = data['rows']
    if 'Company Name' not in headers or 'Product Name' not in headers:
        raise ValueError(f'Unexpected guide table: {slug}')
    return [dict(zip(headers, row)) for row in rows], len(rows)


def add_numeric(item, field, raw, unit='', scale=1):
    values, ranges = dimension(raw, unit, scale)
    if values:
        item[field] = values
    if ranges:
        item.setdefault('ranges', {})[field] = ranges


def build(row, category, slug, fields):
    item = {
        'manufacturer': row['Company Name'], 'name': row['Product Name'],
        'label': f"{row['Company Name']} — {row['Product Name']}",
        'categories': [category], 'source': BASE + slug, 'published': {},
    }
    for field, column, unit, scale in fields:
        raw = row.get(column, '')
        if raw and raw not in ('–', '—', '-'):
            item['published'][column] = raw
        if field == 'platforms':
            item[field] = platforms(raw)
        elif field == 'materials':
            if raw and raw != '–':
                item[field] = [raw]
        else:
            add_numeric(item, field, raw, unit, scale)
    return item


def include_peripheral(row):
    indication = row.get('CE Mark Indications', '') + ' ' + row.get('CE Mark Indication', '')
    return bool(re.search(r'peripheral|iliac|femor|popliteal|infrapopliteal|lower.{0,12}(?:limb|extremit)|BTK|SFA|PPA|above.the.knee', indication, re.I))


def source_groups(item):
    """Keep explicit diameter-dependent wire/sheath qualifications linked."""
    groups = [{key: deepcopy(value) for key, value in item.items() if key not in ['manufacturer', 'name', 'label', 'source', 'published']}]
    for column, raw in item['published'].items():
        field = 'platforms' if 'Guidewire' in column else 'minimumSheaths' if 'Sheath' in column or 'Introducer Size' in column else None
        if not field or not re.search(r'\([^)]*mm[^)]*\)', raw):
            continue
        segments = re.findall(r'([^,()]+)\(([^()]*)\)', raw)
        conditional = []
        for prefix, qualifier in segments:
            if 'mm' not in qualifier:
                continue
            diameters, bounds = dimension(qualifier, 'mm')
            choices = platforms(prefix) if field == 'platforms' else dimension(prefix, 'Fr')[0]
            if not choices or not (diameters or bounds):
                continue
            for group in groups:
                available = [value for value in group.get('diameters', []) if value in diameters or any(bound['min'] <= float(value) <= bound['max'] for bound in bounds)]
                if group.get('diameters') and not available:
                    continue
                next_group = deepcopy(group)
                next_group[field] = choices
                next_group['diameters'] = available or diameters
                if bounds and not group.get('diameters'):
                    next_group.setdefault('ranges', {})['diameters'] = bounds
                else:
                    next_group.get('ranges', {}).pop('diameters', None)
                conditional.append(next_group)
        # Do not discard an unqualified alternative in a mixed listing.
        residue = re.sub(r'([^,()]+)\(([^()]*)\)', '', raw).strip(' ,;')
        if conditional and not residue:
            groups = conditional
    return groups


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-dir', type=Path, required=True)
    parser.add_argument('--refresh', action='store_true')
    parser.add_argument('--review-date', default=str(date.today()))
    args = parser.parse_args()
    output = {'reviewedAt': args.review_date, 'market': 'European Device Guide', 'sources': [], 'sheaths': [], 'balloons': [], 'catheters': [], 'stents': [], 'special': [], 'wires': []}

    def rows(slug):
        records, count = collect(slug, args.cache_dir, args.refresh)
        output['sources'].append({'url': BASE + slug, 'rows': count})
        return records

    sheath_fields = [('sizes', 'Size (F)', 'Fr', 1), ('lengths', 'Length (cm)', 'cm', 1), ('platforms', 'Guidewire Compatibility (inch)', '', 1)]
    for slug, category in [('standard-sheaths-1', 'Standard'), ('reinforced-sheaths-1', 'Reinforced'), ('special-access-sheaths-1', 'Special access')]:
        for row in rows(slug):
            item = build(row, category, slug, sheath_fields)
            shape = row.get('Curved or Straight', '')
            item['shapes'] = list(dict.fromkeys(s.strip().capitalize() for s in re.split(r'[,/]', shape) if s.strip() and s.strip() != '–'))
            coating = row.get('Hydrophilic Coating', '')
            if coating:
                item['coatings'] = ['Hydrophilic'] if coating == 'Yes' else ['Nonhydrophilic'] if coating == 'No' else []
            for column in ['Curved or Straight', 'Hydrophilic Coating', 'Radiopaque Tip', 'Type of Special Access']:
                if row.get(column) and row[column] != '–':
                    item['published'][column] = row[column]
            output['sheaths'].append(item)

    def wire_key(name):
        name = re.sub(r'\([^)]*\)', '', name).lower().replace('hi-torque', 'ht').replace('018', '18')
        return re.sub(r'[^a-z0-9]', '', re.sub(r'^asahi\s+', '', name))

    wire_names = set(re.findall(r"(?:workhorse|jacketed|support|cto)\('[^']+', '([^']+)'", (ROOT / 'src/data/wireCatalog.js').read_text()))
    wire_names.update(['HydroSteer', 'Approach Hydro ST', 'Hi-Torque Connect', 'Hi-Torque Connect Flex', 'Hi-Torque Command 18 ST', 'Hi-Torque Command 18 LT'])
    known_wire_keys = {wire_key(name) for name in wire_names}
    for slug in ['coiled-stainless-steel-guidewires-1', 'hydrophilic-guidewires-1', 'mandrilspecialty-guidewires-1']:
        for row in rows(slug):
            if wire_key(row['Product Name']) not in known_wire_keys or re.search(r'nonvascular', row.get('Type', ''), re.I):
                continue
            lengths, _ = dimension(row.get('Length (cm)', ''))
            if not lengths:
                continue
            for platform in platforms(row.get('Diameter (inch)', '')):
                if platform not in ['0.014', '0.018', '0.035', '0.038']:
                    continue
                tip_shapes = [value.strip() for value in row.get('Tip Type', '').split(',') if value.strip() and value.strip() != '–']
                output['wires'].append({'key': wire_key(row['Product Name']), 'manufacturer': row['Company Name'], 'name': row['Product Name'], 'platform': platform, 'lengths': [float(value) for value in lengths], 'tipShapes': tip_shapes, 'source': BASE + slug})

    for slug, category in [('drug-coated-balloons-1', 'Drug-coated'), ('specialty-balloons-1', 'Specialty PTA')]:
        for row in rows(slug):
            name = row['Product Name'].lower()
            if slug.startswith('drug'):
                relevant = not re.search(r'fistula|avf|neuro|magictouch (?:ed|scb)|aperto|elutax sv rx', name)
            else:
                relevant = bool(re.search(r'enforcer|angiosculpt|aperta|chocolate|dkutting|peripheral cutting|serranator|tri-wedge|ultrascore', name))
                if re.search(r'cutting|scoring|sculpt|serran|chocolate|wedge|score', name):
                    category = 'Scoring / cutting'
            if not relevant:
                continue
            item = build(row, category, slug, [
                ('platforms', 'Guidewire Compatibility (inch)', '', 1), ('shafts', 'Shaft Length (cm)', 'cm', 1),
                ('minimumSheaths', 'Sheath Compatibility (F)', 'Fr', 1), ('diameters', 'Balloon Diameters (mm)', 'mm', 1),
                ('lengths', 'Balloon Lengths (cm)', 'mm', 10),
            ])
            item['functionalRoles'] = ['Vessel preparation', 'Definitive angioplasty', 'Post-dilatation']
            if re.search(r'OTW|over.the.wire', row['Product Name'], re.I):
                item['deliveryModes'] = ['Over-the-wire']
            output['balloons'].append(item)

    for slug in ['specialty-catheters-1', 'microcatheters-1']:
        for row in rows(slug):
            if not re.search(r'Quick-Cross|Rubicon|Seeker|TrailBlazer|Turnpike', row['Product Name'], re.I):
                continue
            fields = [('sizes', 'Catheter Size (F)', 'Fr', 1), ('lengths', 'Working Length (cm)', 'cm', 1)] if slug.startswith('specialty') else [
                ('sizes', 'Proximal Size (F)', 'Fr', 1), ('lengths', 'Catheter Working Length (cm)', 'cm', 1), ('platforms', 'Recommended Guidewire Size (inch)', '', 1)]
            item = build(row, 'Support / crossing', slug, fields)
            sheath_match = re.search(r'(\d+(?:\.\d+)?)\s*F\s*\(sheath\)', row.get('Minimum Guiding Catheter ID (inch)', ''))
            if sheath_match:
                item['minimumSheaths'] = [sheath_match[1] + ' Fr']
            wire_match = re.search(r'0\.0(?:14|18|35)', row['Product Name'])
            if wire_match:
                item['platforms'] = [wire_match[0]]
            output['catheters'].append(item)

    for slug, category, type_ in [
        ('balloon-expandable-covered-stents-1', 'Balloon-expandable covered', 'Balloon-expandable covered'),
        ('balloon-expandable-stents-1', 'Balloon-expandable bare', 'Balloon-expandable'),
        ('self-expanding-stents-1', 'Self-expanding bare', 'Self-expanding'),
        ('self-expanding-stent-grafts-1', 'Self-expanding covered', 'Self-expanding covered'),
        ('drug-eluting-stents-2', 'Drug-eluting', 'Drug-eluting'),
    ]:
        for row in rows(slug):
            if not include_peripheral(row):
                continue
            wire_col = 'Maximum Guidewire Size (inch)' if 'Maximum Guidewire Size (inch)' in row else 'Guidewire Compatibility (inch)'
            material_col = 'Material Used' if 'Material Used' in row else 'Materials Used'
            item = build(row, category, slug, [
                ('platforms', wire_col, '', 1), ('minimumSheaths', 'Introducer Size (F)', 'Fr', 1),
                ('diameters', 'Stent Diameter (mm)', 'mm', 1), ('lengths', 'Stent Length (mm)', 'mm', 1),
                ('shafts', 'Delivery System Length (cm)', 'cm', 1), ('materials', material_col, '', 1),
            ])
            item['types'] = [type_]
            output['stents'].append(item)

    special_tables = [
        ('atherectomy-devices-1', 'Atherectomy'), ('cto-crossing-devices-1', 'CTO / re-entry'),
        ('intravascular-lithotripsy-1', 'Intravascular lithotripsy'), ('intravascular-ultrasound-1', 'IVUS'),
        ('mechanical-thrombectomythrombolysis-1', 'Thrombectomy'), ('embolic-protection-devices-1', 'Embolic protection'),
        ('therapeutic-infusion-systems-1', 'Catheter-directed infusion'), ('snares-2', 'Snare / retrieval'),
    ]
    for slug, category in special_tables:
        for row in rows(slug):
            name = row['Product Name']
            if category in ['Thrombectomy', 'Embolic protection'] and not include_peripheral(row):
                continue
            if category == 'Thrombectomy' and re.search(r'Separator', name):
                continue
            if category == 'IVUS' and not re.search(r'peripheral', name, re.I):
                continue
            if category == 'CTO / re-entry' and re.search(r'Quick-Cross|Guidewire|Enteer.*Guidewire', name, re.I):
                continue
            if category == 'Catheter-directed infusion' and re.search(r'RenalGuard|Occluding Wire', name, re.I):
                continue
            if category == 'Snare / retrieval' and re.search(r'filter|Tulip|ALN', name, re.I):
                continue
            fields = [('sizes', 'Catheter Size (F)', 'Fr', 1), ('shafts', 'Working Length (cm)', 'cm', 1)]
            if category in ['Thrombectomy', 'Catheter-directed infusion', 'Intravascular lithotripsy', 'Atherectomy']:
                fields.append(('minimumSheaths', 'Sheath Compatibility (F)', 'Fr', 1))
            if category == 'CTO / re-entry':
                fields.append(('platforms', 'Wire Size (inch)', '', 1))
            else:
                fields.append(('platforms', 'Guidewire Compatibility (inch)', '', 1))
            if category == 'Intravascular lithotripsy':
                fields.extend([('diameters', 'Diameter (mm)', 'mm', 1), ('lengths', 'Length (mm)', 'mm', 1)])
            if category == 'IVUS':
                fields.extend([('shafts', 'Catheter Usable Length (cm)', 'cm', 1), ('platforms', 'Maximum Guidewire (inch)', '', 1), ('minimumSheaths', 'Minimum Sheath Diameter (F)', 'Fr', 1)])
            if category == 'Snare / retrieval':
                # Loop diameter and snare-wire length are not balloon dimensions.
                fields.extend([('sizes', 'Working Diameters (mm)', 'mm', 1), ('shafts', 'Snare Length (cm)', 'cm', 1)])
            item = build(row, category, slug, fields)
            if category == 'Snare / retrieval' and item.get('sizes'):
                item['sizes'] = [value + ' mm loop' for value in item['sizes']]
            output['special'].append(item)

    # The original labels keep existing cases and preference profiles editable.
    aliases = {
        'In.Pact Admiral': 'Medtronic — IN.PACT Admiral DCB',
        'In.Pact 018': 'Medtronic — IN.PACT 018 DCB',
        'Lutonix 018 Drug Coated Balloon PTA Catheter': 'BD Interventional — Lutonix 018 DCB',
        'Lutonix 035 Drug Coated Balloon PTA Catheter': 'BD Interventional — Lutonix 035 DCB',
        'Luminor 14': 'iVascular — Luminor 14 DCB', 'Luminor 18': 'iVascular — Luminor 18 DCB',
        'Ranger Over-the-Wire Paclitaxel-Coated PTA Balloon Catheter': 'Boston Scientific — Ranger DCB',
        'Stellarex Drug-Coated Angioplasty Balloon': 'Philips — Stellarex DCB',
        'Chocolate PTA': 'Medtronic — Chocolate PTA',
        'AngioSculpt PTA Scoring Balloon Catheter': 'Philips — AngioSculpt PTA',
        'Eluvia Drug-Eluting Vascular Stent System': 'Boston Scientific — Eluvia Drug-Eluting Stent',
        'BeBack crossing catheter': 'Bentley InnoMed — BeBack Crossing Catheter',
        'Enteer Re-entry System, Catheter': 'Medtronic — Enteer Re-Entry System',
        'Shockwave E8 Peripheral IVL Catheters': 'Shockwave Medical — Shockwave E8 Peripheral IVL Catheter',
        'Shockwave Javelin Peripheral IVL Catheter': 'Shockwave Medical — Shockwave Javelin Peripheral IVL Catheter',
        'Shockwave L6 Peripheral IVL Catheters': 'Shockwave Medical — Shockwave L6 Peripheral IVL Catheter',
        'Shockwave M5+ Peripheral IVL Catheters': 'Shockwave Medical — Shockwave M5+ Peripheral IVL Catheter',
        'Shockwave S4 Peripheral IVL Catheters': 'Shockwave Medical — Shockwave S4 Peripheral IVL Catheter',
    }
    for kind in ['sheaths', 'balloons', 'catheters', 'stents', 'special']:
        merged = {}
        for item in output[kind]:
            item['label'] = aliases.get(item['name'], item['label'])
            label = item['label']
            variants = source_groups(item)
            if label not in merged:
                merged[label] = {**deepcopy(item), 'variants': [], 'sources': [], 'published': []}
            target = merged[label]
            for variant in variants:
                if variant not in target['variants']:
                    target['variants'].append(variant)
            if item['source'] not in target['sources']:
                target['sources'].append(item['source'])
            if item['published'] not in target['published']:
                target['published'].append(item['published'])
            for key, value in {key: value for key, value in item.items() if key not in ['manufacturer', 'name', 'label', 'source', 'published']}.items():
                if key == 'ranges':
                    for field, bounds in value.items():
                        target.setdefault('ranges', {}).setdefault(field, [])
                        for bound in bounds:
                            if bound not in target['ranges'][field]:
                                target['ranges'][field].append(bound)
                elif isinstance(value, list):
                    target[key] = list(dict.fromkeys(target.get(key, []) + value))
        output[kind] = sorted(merged.values(), key=lambda item: item['label'].lower())
        print(kind, len(output[kind]))
    (ROOT / 'src/data/deviceGuideProducts.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
