const fs = require('fs');
const { parse } = require('svgson');

async function main() {
  const svg = fs.readFileSync('src/assets/vessel-map.svg', 'utf8');
  const root = await parse(svg);

  const result = {
    root: {
      xmlns: root.attributes.xmlns,
      viewBox: root.attributes.viewBox,
    },
    segments: [],
  };

  // gather segments from children
  const segments = [];
  let pedalSegment = null;

  for (const child of root.children) {
    if (child.name === 'g' && child.attributes.id) {
      const groupId = child.attributes.id;
      const base = groupId.endsWith('_arteries')
        ? groupId.slice(0, -'_arteries'.length)
        : groupId.endsWith('_artery')
        ? groupId.slice(0, -'_artery'.length)
        : groupId;

      const id = `${base}_Afbeelding`;
      const name = base.replace(/_/g, ' ');

      const paths = [];
      const collect = (node) => {
        if (node.name === 'path') {
          paths.push({ name: 'path', attrs: node.attributes });
        } else if (node.children) {
          node.children.forEach(collect);
        }
      };
      child.children.forEach(collect);

      segments.push({ id, name, paths });
    } else if (child.name === 'path') {
      // Path outside any <g> - treat as pedal segment
      pedalSegment = {
        id: 'pedal_Afbeelding',
        name: 'pedal',
        paths: [{ name: 'path', attrs: child.attributes }],
      };
    }
  }

  if (pedalSegment) segments.unshift(pedalSegment);

  result.segments = segments;

  fs.writeFileSync('src/assets/vessel-map.json', JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
