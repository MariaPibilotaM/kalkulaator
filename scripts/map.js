//KAART
var marker;
var map = L.map('mapid').setView([document.getElementById("asukoht").value, document.getElementById("asukoht2").value], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

marker = new L.marker([document.getElementById("asukoht").value, document.getElementById("asukoht2").value]).addTo(map).bindPopup('Vajuta kaardile, et valida meelepärane asukoht!').openPopup();

//Kui vajutame nuppu "Arvuta" siis muutub ka kaardi markeri asukoht
function muudaKaarti() {
    if (marker) {//Eemaldame kõik praegused markerid
        map.removeLayer(marker);
    }
    var lat = document.getElementById("asukoht").value;
    var lng = document.getElementById("asukoht2").value;
    marker = new L.Marker([lat, lng]).addTo(map).bindPopup("Asukoht : " + lat + "," + lng + "").openPopup();
    map.setView([lat, lng]);
    arvuta();//Kutsume välja päeva pikkuse ja päikesetõusu/loojandu arvutamise
}

//Kui klikime kaardil, siis lisame uue asukoha ja markeri
map.on('click', function (e) {
    if (marker) {
        map.removeLayer(marker);
    }
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    marker = new L.Marker(e.latlng).addTo(map).bindPopup("Asukoht : " + lat + "," + lng + "").openPopup();
    map.setView(e.latlng);
    document.getElementById("asukoht2").value = lng;
    document.getElementById("asukoht").value = lat;
    document.getElementById("arvuta").click(); //Arvutame ka uued pikkused ja kellaajad
});

//PÄEVA PIKKUSE ARVUTAMINE
function arvuta() {
    var la = Number(document.getElementById("asukoht").value); //loeme sisse asukoha ja kuupäeva
    var lo = Number(document.getElementById("asukoht2").value);
    var date = new Date(document.getElementById("päev").value);

    var times = SunCalc.getTimes((date), la, lo); //Kalkuleerime ajad

    var t6usAeg = (times.sunrise.getUTCHours() < 10 ? '0' + times.sunrise.getUTCHours() : times.sunrise.getUTCHours()) + ':' + (times.sunrise.getMinutes() < 10 ? '0' + times.sunrise.getMinutes() : times.sunrise.getMinutes());
    var loojangAeg = (times.sunset.getUTCHours() < 10 ? '0' + times.sunset.getUTCHours() : times.sunset.getUTCHours()) + ':' + (times.sunset.getMinutes() < 10 ? '0' + times.sunset.getMinutes() : times.sunset.getMinutes());
    var pikkus = times.sunset - times.sunrise;
    var pikkusStr = Math.floor((pikkus / 1000 / 60 / 60) % 24) + ' tundi ja ' + Math.floor((pikkus / 1000 / 60) % 60) + ' minutit';
    var data = "Päike tõuseb: " + t6usAeg + "<br><br>" + "Päike loojub: " + loojangAeg + "<br><br>" + "Päeva pikkus kokku: " + pikkusStr;

    return document.getElementById("tunnid").innerHTML = data;
}

//JÄRGNEV FUNKTSIOON ON SAADUD AADRESSILT: https://github.com/mourner/suncalc
(function () {
    'use strict';

// lühendid, et oleks mugavam
    var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos,
        tan = Math.tan,
        asin = Math.asin,
        atan = Math.atan2,
        acos = Math.acos,
        rad = PI / 180;


// päeva ja aja teisendamised
    var dayMs = 1000 * 60 * 60 * 24,
        J1970 = 2440588,
        J2000 = 2451545;

    function toJulian(date) {
        return date.valueOf() / dayMs - 0.5 + J1970;
    }

    function fromJulian(j) {
        return new Date((j + 0.5 - J1970) * dayMs);
    }

    function toDays(date) {
        return toJulian(date) - J2000;
    }


// positsiooni arvutused

    var e = rad * 23.4397;

    function rightAscension(l, b) {
        return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
    }

    function declination(l, b) {
        return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
    }

    function azimuth(H, phi, dec) {
        return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
    }

    function altitude(H, phi, dec) {
        return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
    }

    function siderealTime(d, lw) {
        return rad * (280.16 + 360.9856235 * d) - lw;
    }

    function astroRefraction(h) {
        if (h < 0) {
            h = 0;
        }
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }

// Päikese kalkuleerimised

    function solarMeanAnomaly(d) {
        return rad * (357.5291 + 0.98560028 * d);
    }

    function eclipticLongitude(M) {

        var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)),
            P = rad * 102.9372;

        return M + C + P + PI;
    }

    function sunCoords(d) {

        var M = solarMeanAnomaly(d),
            L = eclipticLongitude(M);

        return {
            dec: declination(L, 0),
            ra: rightAscension(L, 0)
        };
    }


    var SunCalc = {};


// päikese asukoht antud kuupäeval ja antud laius/pikkuskraadidel

    SunCalc.getPosition = function (date, lat, lng) {

        var lw = rad * -lng,
            phi = rad * lat,
            d = toDays(date),

            c = sunCoords(d),
            H = siderealTime(d, lw) - c.ra;

        return {
            azimuth: azimuth(H, phi, c.dec),
            altitude: altitude(H, phi, c.dec)
        };
    };


    var times = SunCalc.times = [
        [-0.833, 'sunrise', 'sunset'],
        [-0.3, 'sunriseEnd', 'sunsetStart']
    ];


    SunCalc.addTime = function (angle, riseName, setName) {
        times.push([angle, riseName, setName]);
    };


// Päikese kalkuleerimine

    var J0 = 0.0009;

    function julianCycle(d, lw) {
        return Math.round(d - J0 - lw / (2 * PI));
    }

    function approxTransit(Ht, lw, n) {
        return J0 + (Ht + lw) / (2 * PI) + n;
    }

    function solarTransitJ(ds, M, L) {
        return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
    }

    function hourAngle(h, phi, d) {
        return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
    }

    function observerAngle(height) {
        return -2.076 * Math.sqrt(height) / 60;
    }

// Päikese loojang
    function getSetJ(h, lw, phi, dec, n, M, L) {

        var w = hourAngle(h, phi, dec),
            a = approxTransit(w, lw, n);
        return solarTransitJ(a, M, L);
    }

//päikese aegade kalkuleerimine
    SunCalc.getTimes = function (date, lat, lng, height) {

        height = height || 0;

        var lw = rad * -lng,
            phi = rad * lat,

            dh = observerAngle(height),

            d = toDays(date),
            n = julianCycle(d, lw),
            ds = approxTransit(0, lw, n),

            M = solarMeanAnomaly(ds),
            L = eclipticLongitude(M),
            dec = declination(L, 0),

            Jnoon = solarTransitJ(ds, M, L),

            i, len, time, h0, Jset, Jrise;


        var result = {
            solarNoon: fromJulian(Jnoon),
            nadir: fromJulian(Jnoon - 0.5)
        };

        for (i = 0, len = times.length; i < len; i += 1) {
            time = times[i];
            h0 = (time[0] + dh) * rad;

            Jset = getSetJ(h0, lw, phi, dec, n, M, L);
            Jrise = Jnoon - (Jset - Jnoon);

            result[time[1]] = fromJulian(Jrise);
            result[time[2]] = fromJulian(Jset);
        }

        return result;
    };

//eksportimine
    if (typeof exports === 'object' && typeof module !== 'undefined') module.exports = SunCalc;
    else if (typeof define === 'function' && define.amd) define(SunCalc);
    else window.SunCalc = SunCalc;

}());
