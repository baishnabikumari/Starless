function getJulianDate(date){
    return date.getTime() / 86400000 + 2440587.5;
}