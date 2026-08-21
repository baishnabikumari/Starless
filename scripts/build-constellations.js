const fs = require('fs');
const rawCsv = fs.readFileSync('data/raw/hygdata_v41.csv', 'utf8');
const lines = rawCsv.split('\n').filter(Boolean);
const header = parseCsvLine(lines[0]);
const idx = {
    hip: header.indexOf('hip'),
    ra: header.indexOf('ra'),
    dec: header.indexOf('dec')
};

const hipMap = {};
for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const hip = row[idx.hip];
    if (!hip) continue;
    hipMap[hip] = {
        ra: parseFloat(row[idx.ra]),
        dec: parseFloat(row[idx.dec])
    };
}

const skyculture = JSON.parse(fs.readFileSync('data/raw/modern_index.json', 'utf8'));
const constellation = [];

for (const con of skyculture.constellations) {
    const segments = [];
    for (const path of con.lines) {
        const points = [];
        for (const hip of path) {
            const star = hipMap[hip];
            if (!star) continue;
            points.push([star.ra, star.dec]);
        }
        if (points.length >= 2) segments.push(points);
    }
    if (segments.length === 0) continue;

    constellation.push({
        name: (con.common_name && (con.common_name.native || con.common_name.english)) || con.id,
        lines: segments
    });
}
fs.writeFileSync('data/constellations.json', JSON.stringify(constellation));
console.log(`wrote ${constellation.length} constellations to data/constellations.json`);

function parseCsvLine(line){
    const out = [];
    let cur = [];
    let inQuotes = false;
    for(let i = 0;i < line.length; i++){
        const c = line[i];
        if (c === '"'){
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes){
            out.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    out.push(cur);
    return out;
}