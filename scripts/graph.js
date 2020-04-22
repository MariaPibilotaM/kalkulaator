//Täidame automaatselt vajalikud lahtrid
window.onload = function () {
    document.querySelector('.päev').value = (new Date()).toISOString().substr(0, 10);
    document.querySelector('.alg').value = (new Date()).toISOString().substr(0, 10);
    var k = new Date(document.getElementById("alg").value);
    document.querySelector('.l6pp').value = (new Date(k.setDate(k.getDate() + 7)).toISOString().substr(0, 10));
};
//GRAAFIKU JOONISTAMINE
function graaf() {
    //loeme väärtused sisse
    var a = document.getElementById("alg").value;
    var l = document.getElementById("l6pp").value;
    var la = Number(document.getElementById("asukoht").value);
    var lo = Number(document.getElementById("asukoht2").value);
    var d = [];
    var kp = [];
    //lisame kuupäevade vahemikus oleva kp ja ka pikkused listi
    for (i = new Date(a); i <= new Date(l); i.setDate(i.getDate() + 1)) {
        var date = new Date(i);
        var times = SunCalc.getTimes((date), la, lo);

        var pikkus = times.sunset - times.sunrise;
        var pikkusStr = Math.floor((pikkus / 1000 / 60 / 60) % 24) + (Math.floor((pikkus / 1000 / 60) % 60) * 0.01);
        d.push(pikkusStr);
        kp.push(date.getMonth() + "-" + date.getDate());
    }
    //joonistame joondiagrammi
    new Chart(document.getElementById("line"), {
        type: 'line',
        data: {
            labels: kp,
            datasets: [{
                data: d,
                label: "Asukoht: " + la + "," + lo + "",
                borderColor: "#3e95cd",
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Päeva pikkuse muutumine perioodil: ' + a + " kuni " + l + ""
            }
        }
    });
}