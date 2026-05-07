const fs = require('fs');
const mapping = fs.readFileSync('src/lib/icon-mapping.tsx', 'utf8');
const sprite = fs.readFileSync('public/icons/sprite.svg', 'utf8');

function extractMap(name) {
	const start = mapping.indexOf(`const ${name}`);
	if (start === -1) return [];
	const sub = mapping.slice(start);
	const objStart = sub.indexOf('{');
	const objEnd = sub.indexOf('};');
	if (objStart === -1 || objEnd === -1) return [];
	const body = sub.slice(objStart + 1, objEnd);
	const vals = [];
	const regex = /:\s*'([a-zA-Z0-9_]+)'/g;
	let m;
	while ((m = regex.exec(body)) !== null) vals.push(m[1]);
	return vals;
}

const itemVals = extractMap('ITEM_ICON_MAP');
const navVals = extractMap('NAV_ICON_MAP');
const uniq = [...new Set([...itemVals, ...navVals])];

const ids = [];
const spriteRegex = /id=\"icon-([a-zA-Z0-9_]+)\"/g;
let mm;
while ((mm = spriteRegex.exec(sprite)) !== null) ids.push(mm[1]);

const idSet = new Set(ids);
const missing = uniq.filter(x => !idSet.has(x));
console.log('MISSING_ICONS::', missing.join(','));
console.log('MAPPING_COUNT::', uniq.length, 'SPRITE_COUNT::', ids.length);
