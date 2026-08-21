const fs = require('fs');
// const { start } = require('repl');
// const { json } = require('stream/consumers');
const raw = fs.readFileSync('data/raw/hygdata_v41.csv', 'utf8');
const lines = raw.split('\n').filter(Boolean);
const header = parseCsvLine(lines[0]);

const idx = {
    ra: header.indexOf('ra'),
    dec: header.indexOf('dec'),
    mag: header.indexOf('mag'),
    proper: header.indexOf('proper'),
    con: header.indexOf('con'),
    bayer: header.indexOf('bayer')
};
console.log('header:', header);
console.log('idx:', idx);

const stars = [];

for(let i = 1; i < lines.length; i++){
    const row = parseCsvLine(lines[i]);
    const mag = parseFloat(row[idx.mag]);
    if (isNaN(mag) || mag > 6.5) continue;

    stars.push({
        ra: parseFloat(row[idx.ra]),
        dec: parseFloat(row[idx.dec]),
        mag: mag,
        name: row[idx.proper] || row[idx.bayer] || '',
        con: row[idx.con] || ''
    });
}

fs.writeFileSync('data/stars.json', JSON.stringify(stars));
console.log(`wrote ${stars.length} stars to data/stars.json`);

function parseCsvLine(line){
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++){
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