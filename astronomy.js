function getJulianDate(date){
    return date.getTime() / 86400000 + 2440587.5;
}

function getGMST(jd){
    const daysSinceJ2000 = jd - 2451545.0;
    let gmst = 18.697374558 + 24.06570982441908 * daysSinceJ2000;
    gmst = gmst % 24;
    if(gmst < 0) gmst += 24;
    return gmst;
}

function getLST(jd, longitude){
    const gmst = getGMST(jd);
    let lst = gmst + longitude / 15;
    lst = lst % 24;
    if(lst < 0) lst += 24;
    return lst;
}

function raDecToAltAz(ra, dec, lst, lat){
    const H = (lst - ra) * 15;
    const decRad = dec * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    const hRad = H * Math.PI / 180;
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(hRad);
    const alt = Math.asin(sinAlt);

    const cosAz = (Math.sin(decRad) - Math.sin(alt) * Math.sin(latRad)) / (Math.cos(alt) * Math.cos(latRad));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if(Math.sin(hRad) > 0) az = 2 * Math.PI - az;

    return { alt: alt * 180 / Math.PI, az: az * 180 / Math.PI };
}

function altAzToScreen(alt, az, canvasWidth, canvasHeight){
    if (alt < 0) return null;

    const radius = Math.min(canvasWidth, canvasHeight) / 2;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const zenithDistance = (90 - alt) * (Math.PI / 180);
    const r = radius * Math.tan(zenithDistance / 2);
    const azRad = az * (Math.PI / 180);

    const x = centerX + r * Math.sin(azRad);
    const y = centerY - r * Math.cos(azRad);

    return { x, y };
}