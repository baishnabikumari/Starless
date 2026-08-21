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